import assert from '../utils/assert'
import Atom from './atom'

export interface AtomOptions {}

export type TeardownCallback = () => void
export interface AtomRenderOptions {
  options: AtomOptions
  env: any
  value: unknown
  payload: {}
}

export type AtomData = {
  name: string
  render(options: AtomRenderOptions): Element
}

export default class AtomNode {
  editor: any
  atom: AtomData
  model: Atom
  element: Element
  atomOptions: AtomOptions

  _teardownCallback: TeardownCallback | null = null
  _rendered: Node | null = null

  constructor(editor: any, atom: AtomData, model: Atom, element: Element, atomOptions: AtomOptions) {
    this.editor = editor
    this.atom = atom
    this.model = model
    this.atomOptions = atomOptions
    this.element = element
  }

  render() {
    if (!this._rendered) {
      let {
        atomOptions: options,
        env,
        model: { value, payload },
      } = this
      // cache initial render
      this._rendered = this.atom.render({ options, env, value, payload })
    }

    this._validateAndAppendRenderResult(this._rendered!)
  }

  get env() {
    return {
      name: this.atom.name,
      onTeardown: (callback: TeardownCallback) => (this._teardownCallback = callback),
      save: (value: unknown, payload = {}) => {
        this.model.value = value
        this.model.payload = payload

        this.editor._postDidChange()
        this.teardown()
        this.render()
      },
    }
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

  _validateAndAppendRenderResult(rendered: Node) {
    if (!rendered) {
      return
    }

    let {
      atom: { name },
    } = this
    assert(`Atom "${name}" must return a DOM node (returned value was: "${rendered}")`, !!rendered.nodeType)
    this.element.appendChild(rendered)
  }
}
