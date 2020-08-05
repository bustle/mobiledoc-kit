import assert from '../utils/assert'
import Card, { CardMode } from './card'

export interface CardNodeOptions {}

export type CardRenderHook = (...args: any[]) => Element

type DidRenderCallback = null | (() => void)
type TeardownCallback = null | (() => void)

type CardDataType = 'dom'

export interface CardData {
  name: string
  type?: CardDataType

  render: CardRenderHook
  edit?: CardRenderHook
}

type CardRenderMethodName = 'render' | 'edit'

export default class CardNode {
  editor: any
  card: CardData
  section: Card
  element: Element
  options: CardNodeOptions

  mode!: CardMode
  _rendered: Element | null = null
  _teardownCallback: TeardownCallback = null
  _didRenderCallback: DidRenderCallback = null

  constructor(editor: any, card: CardData, section: Card, element: Element, options: CardNodeOptions) {
    this.editor = editor
    this.card = card
    this.section = section
    this.element = element
    this.options = options
  }

  render(mode: CardMode) {
    if (this.mode === mode) {
      return
    }

    this.teardown()

    this.mode = mode

    let methodName: CardRenderMethodName = mode === 'display' ? 'render' : 'edit'
    let method = this.card[methodName]

    assert(`Card is missing "${methodName}" (tried to render mode: "${mode}")`, !!method)
    let rendered = method({
      env: this.env,
      options: this.options,
      payload: this.section.payload,
    })

    this._validateAndAppendRenderResult(rendered)
  }

  teardown() {
    if (this._teardownCallback) {
      this._teardownCallback()
      this._teardownCallback = null
    }
    if (this._rendered) {
      this.element.removeChild(this._rendered)
      this._rendered = null
    }
  }

  didRender() {
    if (this._didRenderCallback) {
      this._didRenderCallback()
    }
  }

  get env() {
    return {
      name: this.card.name,
      isInEditor: true,
      onTeardown: (callback: TeardownCallback) => (this._teardownCallback = callback),
      didRender: (callback: DidRenderCallback) => (this._didRenderCallback = callback),
      edit: () => this.edit(),
      save: (payload: {}, transition = true) => {
        this.section.payload = payload

        this.editor._postDidChange()
        if (transition) {
          this.display()
        }
      },
      cancel: () => this.display(),
      remove: () => this.remove(),
      postModel: this.section,
    }
  }

  display() {
    this.render(CardMode.DISPLAY)
  }

  edit() {
    this.render(CardMode.EDIT)
  }

  remove() {
    this.editor.run((postEditor: any) => postEditor.removeSection(this.section))
  }

  _validateAndAppendRenderResult(rendered: Element | null) {
    if (!rendered) {
      return
    }

    let {
      card: { name },
    } = this
    assert(`Card "${name}" must render dom (render value was: "${rendered}")`, !!rendered.nodeType)
    this.element.appendChild(rendered)
    this._rendered = rendered
    this.didRender()
  }
}
