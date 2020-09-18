import Tooltip, { DEFAULT_TOOLTIP_PLUGIN, TooltipPlugin } from '../views/tooltip'
import PostEditor from './post'
import ImageCard from '../cards/image'
import { Direction } from '../utils/key'
import mobiledocParsers from '../parsers/mobiledoc'
import HTMLParser from '../parsers/html'
import DOMParser from '../parsers/dom'
import Renderer from '../renderers/editor-dom'
import RenderTree from '../models/render-tree'
import mobiledocRenderers, { MobiledocVersion } from '../renderers/mobiledoc'
import { MOBILEDOC_VERSION } from '../renderers/mobiledoc'
import { mergeWithOptions } from '../utils/merge'
import { normalizeTagName, clearChildNodes, serializeHTML } from '../utils/dom-utils'
import { forEach, filter, contains, values, detect } from '../utils/array-utils'
import { setData } from '../utils/element-utils'
import Cursor from '../utils/cursor'
import Range from '../utils/cursor/range'
import Position from '../utils/cursor/position'
import Environment from '../utils/environment'
import PostNodeBuilder from '../models/post-node-builder'
import { DEFAULT_TEXT_INPUT_HANDLERS } from './text-input-handlers'
import {
  DEFAULT_KEY_COMMANDS,
  buildKeyCommand,
  findKeyCommands,
  validateKeyCommand,
  KeyCommand,
  CompiledKeyCommand,
} from './key-commands'
import Card, { CardMode, CardPayload } from '../models/card'
import assert from '../utils/assert'
import MutationHandler from '../editor/mutation-handler'
import EditHistory from '../editor/edit-history'
import EventManager from '../editor/event-manager'
import EditState from '../editor/edit-state'
import DOMRenderer from 'mobiledoc-dom-renderer'
import TextRenderer from 'mobiledoc-text-renderer'
import LifecycleCallbacks, { LifecycleCallback } from '../models/lifecycle-callbacks'
import LogManager from '../utils/log-manager'
import toRange from '../utils/to-range'
import MobiledocError from '../utils/mobiledoc-error'
import Post from '../models/post'
import { Mobiledoc } from '../renderers/mobiledoc'
import { SectionParserPlugin } from '../parsers/section'
import { CardData, CardRenderHook } from '../models/card-node'
import { AtomData } from '../models/atom-node'
import { Option, Maybe, Dict } from '../utils/types'
import Markup from '../models/markup'
import View from '../views/view'
import Atom, { AtomPayload } from '../models/atom'
import Section, { isNested } from '../models/_section'

// This export may later be deprecated, but re-export it from the renderer here
// for consumers that may depend on it.
export { EDITOR_ELEMENT_CLASS_NAME } from '../renderers/editor-dom'

export interface EditorOptions {
  parserPlugins: SectionParserPlugin[]
  placeholder: string
  spellcheck: boolean
  autofocus: boolean
  showLinkTooltips: boolean
  undoDepth: number
  undoBlockTimeout: number
  cards: CardData[]
  atoms: AtomData[]
  cardOptions: {}
  unknownCardHandler: CardRenderHook
  unknownAtomHandler: CardRenderHook
  mobiledoc: Option<Mobiledoc>
  html: Option<string>
  tooltipPlugin: TooltipPlugin

  /** @internal */
  nodeType?: number
}

const defaults: Partial<EditorOptions> = {
  placeholder: 'Write here...',
  spellcheck: true,
  autofocus: true,
  showLinkTooltips: true,
  undoDepth: 5,
  undoBlockTimeout: 5000, // ms for an undo event
  cards: [],
  atoms: [],
  cardOptions: {},
  unknownCardHandler: ({ env }) => {
    throw new MobiledocError(`Unknown card encountered: ${env.name}`)
  },
  unknownAtomHandler: ({ env }) => {
    throw new MobiledocError(`Unknown atom encountered: ${env.name}`)
  },
  mobiledoc: null,
  html: null,
  tooltipPlugin: DEFAULT_TOOLTIP_PLUGIN,
}

const CALLBACK_QUEUES = {
  DID_UPDATE: 'didUpdate',
  WILL_RENDER: 'willRender',
  DID_RENDER: 'didRender',
  WILL_DELETE: 'willDelete',
  DID_DELETE: 'didDelete',
  WILL_HANDLE_NEWLINE: 'willHandleNewline',
  CURSOR_DID_CHANGE: 'cursorDidChange',
  DID_REPARSE: 'didReparse',
  POST_DID_CHANGE: 'postDidChange',
  INPUT_MODE_DID_CHANGE: 'inputModeDidChange',
  WILL_COPY: 'willCopy',
}

export enum Format {
  MOBILEDOC = 'mobiledoc',
  HTML = 'html',
  TEXT = 'text',
}

export interface SerializeOptions {
  version?: MobiledocVersion
}

export interface InputHandler {
  /** Used by identifying handlers. */
  name: string
  /** Required if `match` is not provided. */
  text?: string
  /** Required if `text` is not provided. */
  match?: RegExp
  /**
   * This callback is invoked with the {@link Editor} instance and an array of
   * matches. If `text` was provided, the matches array will equal [`text`],
   * and if a `match` regex was provided the matches array will be the result
   * of `match.exec` on the matching text. The callback is called after the
   * matching text has been inserted.
   */
  run: (editor: Editor, matches: string[]) => void
}

export enum TextUnit {
  CHAR = 'char',
  WORD = 'word',
}

interface DeleteOperation {
  direction: Direction
  unit: TextUnit
}

/**
 * The Editor is a core component of mobiledoc-kit. After instantiating
 * an editor, use {@link Editor#render} to display the editor on the web page.
 *
 * An editor uses a {@link Post} internally to represent the displayed document.
 * The post can be serialized as mobiledoc using {@link Editor#serialize}. Mobiledoc
 * is the transportable "over-the-wire" format (JSON) that is suited for persisting
 * and sharing between editors and renderers (for display, e.g.), whereas the Post
 * model is better suited for programmatic editing.
 *
 * The editor will call registered callbacks for certain state changes. These are:
 *   * {@link Editor#cursorDidChange} -- The cursor position or selection changed.
 *   * {@link Editor#postDidChange} -- The contents of the post changed due to user input or
 *     programmatic editing. This hook can be used with {@link Editor#serialize}
 *     to auto-save a post as it is being edited.
 *   * {@link Editor#inputModeDidChange} -- The active section(s) or markup(s) at the current cursor
 *     position or selection have changed. This hook can be used with
 *     {@link Editor#activeMarkups} and {@link Editor#activeSections} to implement
 *     a custom toolbar.
 *   * {@link Editor#onTextInput} -- Register callbacks when the user enters text
 *     that matches a given string or regex.
 *   * {@link Editor#beforeToggleMarkup} -- Register callbacks that will be run before
 *     applying changes from {@link Editor#toggleMarkup}
 */
export default class Editor implements EditorOptions {
  post: Post
  cards!: CardData[]
  atoms!: AtomData[]
  element!: HTMLElement

  isEditable: boolean
  hasRendered: boolean
  isDestroyed: boolean

  undoDepth!: number
  parserPlugins!: SectionParserPlugin[]
  placeholder!: string
  spellcheck!: boolean
  autofocus!: boolean
  showLinkTooltips!: boolean
  undoBlockTimeout!: number
  cardOptions!: {}
  unknownCardHandler!: CardRenderHook
  unknownAtomHandler!: CardRenderHook
  mobiledoc!: Option<Mobiledoc>
  html!: Option<string>
  text!: Option<string>
  tooltipPlugin!: TooltipPlugin

  _views: View[]
  _keyCommands?: CompiledKeyCommand[]
  _parserPlugins: SectionParserPlugin[]
  _logManager: LogManager
  _parser: DOMParser
  _builder!: PostNodeBuilder
  _renderer: Renderer
  _renderTree: RenderTree
  _editHistory: EditHistory
  _eventManager: EventManager
  _mutationHandler: MutationHandler
  _editState: EditState
  _callbacks: LifecycleCallbacks
  _beforeHooks: { toggleMarkup: LifecycleCallback[] }
  _isComposingOnBlankLine: boolean

  /**
   * @param {Object} [options]
   * @param {Object} [options.mobiledoc] The mobiledoc to load into the editor.
   *        Supersedes `options.html`.
   * @param {String|DOM} [options.html] The html (as a string or DOM fragment)
   *        to parse and load into the editor.
   *        Will be ignored if `options.mobiledoc` is also passed.
   * @param {Array} [options.parserPlugins=[]]
   * @param {Array} [options.cards=[]] The cards that the editor may render.
   * @param {Array} [options.atoms=[]] The atoms that the editor may render.
   * @param {Function} [options.unknownCardHandler] Invoked by the editor's renderer
   *        whenever it encounters an unknown card.
   * @param {Function} [options.unknownAtomHandler] Invoked by the editor's renderer
   *        whenever it encounters an unknown atom.
   * @param {String} [options.placeholder] Default text to show before user starts typing.
   * @param {Boolean} [options.spellcheck=true] Whether to enable spellcheck
   * @param {Boolean} [options.autofocus=true] Whether to focus the editor when it is first rendered.
   * @param {Boolean} [options.showLinkTooltips=true] Whether to show the url tooltip for links
   * @param {number} [options.undoDepth=5] How many undo levels will be available.
   *        Set to 0 to disable undo/redo functionality.
   * @public
   */
  constructor(options: Partial<EditorOptions> = {}) {
    assert(
      'editor create accepts an options object. For legacy usage passing an element for the first argument, consider the `html` option for loading DOM or HTML posts. For other cases call `editor.render(domNode)` after editor creation',
      options && !options.nodeType
    )
    this._views = []
    this.isEditable = true
    this._parserPlugins = options.parserPlugins || []

    // FIXME: This should merge onto this.options
    mergeWithOptions(this, defaults, options)
    this.cards.push(ImageCard)

    DEFAULT_KEY_COMMANDS.forEach(kc => this.registerKeyCommand(kc))

    this._logManager = new LogManager()
    this._parser = new DOMParser(this.builder)
    let { cards, atoms, unknownCardHandler, unknownAtomHandler, cardOptions } = this
    this._renderer = new Renderer(this, cards, atoms, unknownCardHandler, unknownAtomHandler, cardOptions)

    this.post = this.loadPost()
    this._renderTree = new RenderTree(this.post)

    this._editHistory = new EditHistory(this, this.undoDepth, this.undoBlockTimeout)
    this._eventManager = new EventManager(this)
    this._mutationHandler = new MutationHandler(this)
    this._editState = new EditState(this)
    this._callbacks = new LifecycleCallbacks(values(CALLBACK_QUEUES))
    this._beforeHooks = { toggleMarkup: [] }

    this._isComposingOnBlankLine = false

    DEFAULT_TEXT_INPUT_HANDLERS.forEach(handler => this.onTextInput(handler))

    this.hasRendered = false
    this.isDestroyed = false
  }

  /**
   * Turns on verbose logging for the editor.
   * @param {Array} [logTypes=[]] If present, only the given log types will be logged.
   * @public
   */
  enableLogging(logTypes: string[] = []): void {
    if (logTypes.length === 0) {
      this._logManager.enableAll()
    } else {
      this._logManager.enableTypes(logTypes)
    }
  }

  /**
   * Disable all logging
   * @public
   */
  disableLogging() {
    this._logManager.disable()
  }

  /**
   * @private
   */
  loggerFor(type: string) {
    return this._logManager.for(type)
  }

  /**
   * The editor's instance of a post node builder.
   * @type {PostNodeBuilder}
   */
  get builder() {
    if (!this._builder) {
      this._builder = new PostNodeBuilder()
    }
    return this._builder
  }

  loadPost() {
    let { mobiledoc, html } = this
    if (mobiledoc) {
      return mobiledocParsers.parse(this.builder, mobiledoc)
    } else if (html) {
      if (typeof html === 'string') {
        let options = { plugins: this._parserPlugins }
        return new HTMLParser(this.builder, options).parse(html)
      } else {
        let dom = html
        return this._parser.parse(dom)
      }
    } else {
      return this.builder.createPost([this.builder.createMarkupSection()])
    }
  }

  rerender() {
    let postRenderNode = this.post.renderNode

    // if we haven't rendered this post's renderNode before, mark it dirty
    if (!postRenderNode.element) {
      assert('Must call `render` before `rerender` can be called', this.hasRendered)
      postRenderNode.element = this.element
      postRenderNode.markDirty()
    }

    this.runCallbacks(CALLBACK_QUEUES.WILL_RENDER)
    this._mutationHandler.suspendObservation(() => {
      this._renderer.render(this._renderTree)
    })
    this.runCallbacks(CALLBACK_QUEUES.DID_RENDER)
  }

  /**
   * @param {Element} element The DOM element to render into.
   *        Its contents will be replaced by the editor's rendered post.
   * @public
   */
  render(element: HTMLElement) {
    assert(
      'Cannot render an editor twice. Use `rerender` to update the ' + 'rendering of an existing editor instance.',
      !this.hasRendered
    )

    element.spellcheck = this.spellcheck

    clearChildNodes(element)

    this.element = element

    if (this.showLinkTooltips) {
      this._addTooltip()
    }

    // A call to `run` will trigger the didUpdatePostCallbacks hooks with a
    // postEditor.
    this.run(() => {})

    // Only set `hasRendered` to true after calling `run` to ensure that
    // no cursorDidChange or other callbacks get fired before the editor is
    // done rendering
    this.hasRendered = true
    this.rerender()

    this._mutationHandler.init()
    this._eventManager.init()

    if (this.isEditable === false) {
      this.disableEditing()
    } else {
      this.enableEditing()
    }

    if (this.autofocus) {
      this.selectRange(this.post.headPosition())
    }
  }

  _addTooltip() {
    this.addView(
      new Tooltip({
        rootElement: this.element,
        showForTag: 'a',
        editor: this,
      })
    )
  }

  get keyCommands() {
    if (!this._keyCommands) {
      this._keyCommands = []
    }
    return this._keyCommands
  }

  /**
   * @param {Object} keyCommand The key command to register. It must specify a
   * modifier key (meta, ctrl, etc), a string representing the ascii key, and
   * a `run` method that will be passed the editor instance when the key command
   * is invoked
   * @public
   */
  registerKeyCommand(rawKeyCommand: KeyCommand) {
    const keyCommand = buildKeyCommand(rawKeyCommand)
    assert('Key Command is not valid', validateKeyCommand(keyCommand))
    this.keyCommands.unshift(keyCommand)
  }

  /**
   * @param {String} name If the keyCommand event has a name attribute it can be removed.
   * @public
   */
  unregisterKeyCommands(name: string) {
    for (let i = this.keyCommands.length - 1; i > -1; i--) {
      let keyCommand = this.keyCommands[i]

      if (keyCommand.name === name) {
        this.keyCommands.splice(i, 1)
      }
    }
  }

  /**
   * Convenience for {@link PostEditor#deleteAtPosition}. Deletes and puts the
   * cursor in the new position.
   * @public
   */
  deleteAtPosition(position: Position, direction: number, { unit }: { unit: TextUnit }) {
    this.run(postEditor => {
      let nextPosition = postEditor.deleteAtPosition(position, direction, { unit })
      postEditor.setRange(nextPosition)
    })
  }

  /**
   * Convenience for {@link PostEditor#deleteRange}. Deletes and puts the
   * cursor in the new position.
   * @param {Range} range
   * @public
   */
  deleteRange(range: Range) {
    this.run(postEditor => {
      let nextPosition = postEditor.deleteRange(range)
      postEditor.setRange(nextPosition)
    })
  }

  /**
   * @private
   */
  performDelete({ direction, unit }: DeleteOperation = { direction: Direction.BACKWARD, unit: TextUnit.CHAR }) {
    const { range } = this

    this.runCallbacks(CALLBACK_QUEUES.WILL_DELETE, [range, direction, unit])
    if (range.isCollapsed) {
      this.deleteAtPosition(range.head, direction, { unit })
    } else {
      this.deleteRange(range)
    }
    this.runCallbacks(CALLBACK_QUEUES.DID_DELETE, [range, direction, unit])
  }

  handleNewline(event: KeyboardEvent) {
    if (!this.hasCursor()) {
      return
    }

    event.preventDefault()

    let { range } = this
    this.run(postEditor => {
      let cursorSection: Option<Section>
      if (!range.isCollapsed) {
        let nextPosition = postEditor.deleteRange(range)
        cursorSection = nextPosition.section
        if (cursorSection && cursorSection.isBlank) {
          postEditor.setRange(cursorSection.headPosition())
          return
        }
      }

      // Above logic might delete redundant range, so callback must run after it.
      let defaultPrevented = false
      const event = {
        preventDefault() {
          defaultPrevented = true
        },
      }
      this.runCallbacks(CALLBACK_QUEUES.WILL_HANDLE_NEWLINE, [event])
      if (defaultPrevented) {
        return
      }

      cursorSection = postEditor.splitSection(range.head)[1]
      postEditor.setRange(cursorSection!.headPosition())
    })
  }

  /**
   * Notify the editor that the post did change, and run associated
   * callbacks.
   * @private
   */
  _postDidChange() {
    this.runCallbacks(CALLBACK_QUEUES.POST_DID_CHANGE)
  }

  /**
   * Selects the given range or position. If given a collapsed range or a position, this positions the cursor
   * at the range's position. Otherwise a selection is created in the editor
   * surface encompassing the range.
   * @param {Range|Position} range
   */
  selectRange(range: Range | Position) {
    range = toRange(range)

    this.cursor.selectRange(range)
    this.range = range
  }

  get cursor() {
    return new Cursor(this)
  }

  /**
   * Return the current range for the editor (may be cached).
   * @return {Range}
   */
  get range(): Range {
    return this._editState.range
  }

  set range(newRange) {
    this._editState.updateRange(newRange)

    if (this._editState.rangeDidChange()) {
      this._rangeDidChange()
    }

    if (this._editState.inputModeDidChange()) {
      this._inputModeDidChange()
    }
  }

  _readRangeFromDOM() {
    this.range = this.cursor.offsets
  }

  setPlaceholder(placeholder: string) {
    setData(this.element, 'placeholder', placeholder)
  }

  _reparsePost() {
    let post = this._parser.parse(this.element)
    this.run(postEditor => {
      postEditor.removeAllSections()
      postEditor.migrateSectionsFromPost(post)
      postEditor.setRange(Range.blankRange())
    })

    this.runCallbacks(CALLBACK_QUEUES.DID_REPARSE)
    this._postDidChange()
  }

  _reparseSections(sections = []) {
    let currentRange: Maybe<Range>

    sections.forEach(section => {
      this._parser.reparseSection(section, this._renderTree)
    })
    this._removeDetachedSections()

    if (this._renderTree.isDirty) {
      currentRange = this.range
    }

    // force the current snapshot's range to remain the same rather than
    // rereading it from DOM after the new character is applied and the browser
    // updates the cursor position
    const editHistory = this._editHistory!
    const pendingSnapshot = editHistory._pendingSnapshot!

    const range = pendingSnapshot.range
    this.run(() => {
      pendingSnapshot.range = range
    })

    this.rerender()

    if (currentRange) {
      this.selectRange(currentRange)
    }

    this.runCallbacks(CALLBACK_QUEUES.DID_REPARSE)
    this._postDidChange()
  }

  // FIXME this should be able to be removed now -- if any sections are detached,
  // it's due to a bug in the code.
  _removeDetachedSections() {
    forEach(
      filter(this.post.sections, s => !s.renderNode.isAttached()),
      s => s.renderNode.scheduleForRemoval()
    )
  }

  /**
   * The sections from the cursor's selection start to the selection end
   * @type {Section[]}
   */
  get activeSections() {
    return this._editState.activeSections
  }

  get activeSection() {
    const { activeSections } = this
    return activeSections[activeSections.length - 1]
  }

  get activeSectionAttributes() {
    return this._editState.activeSectionAttributes
  }

  detectMarkupInRange(range: Range, markupTagName: string) {
    let markups = this.post.markupsInRange(range)
    return detect(markups, markup => {
      return markup.hasTag(markupTagName)
    })
  }

  /**
   * @type {Markup[]}
   * @public
   */
  get activeMarkups() {
    return this._editState.activeMarkups
  }

  /**
   * @param {Markup|String} markup A markup instance, or a string (e.g. "b")
   * @return {boolean}
   */
  hasActiveMarkup(markup: Markup | string): boolean {
    let matchesFn: (markup: Markup) => boolean

    if (typeof markup === 'string') {
      let tagName = normalizeTagName(markup)
      matchesFn = m => m.tagName === tagName
    } else {
      matchesFn = m => m === markup
    }

    return !!detect(this.activeMarkups, matchesFn)
  }

  /**
   * @param {String} version The mobiledoc version to serialize to.
   * @return {Mobiledoc} Serialized mobiledoc
   * @public
   */
  serialize(version: MobiledocVersion = MOBILEDOC_VERSION): Mobiledoc {
    return this.serializePost(this.post, Format.MOBILEDOC, { version })
  }

  /**
   * Serialize the editor's post to the requested format.
   * Note that only mobiledoc format is lossless. If cards or atoms are present
   * in the post, the html and text formats will omit them in output because
   * the editor does not have access to the html and text versions of the
   * cards/atoms.
   * @param {string} format The format to serialize ('mobiledoc', 'text', 'html')
   * @return {Object|String} The editor's post, serialized to {format}
   * @public
   */
  serializeTo(format: Format.MOBILEDOC): Mobiledoc
  serializeTo(format: Format.TEXT | Format.HTML): string
  serializeTo(format: Format): Mobiledoc | string {
    let post = this.post
    return this.serializePost(post, format)
  }

  /**
   * @param {Post}
   * @param {String} format Same as {serializeTo}
   * @param {Object} [options]
   * @param {String} [options.version=MOBILEDOC_VERSION] version to serialize to
   * @return {Object|String}
   * @private
   */
  serializePost(post: Post, format: Format.MOBILEDOC, options?: SerializeOptions): Mobiledoc
  serializePost(post: Post, format: Format.TEXT | Format.HTML, options?: SerializeOptions): string
  serializePost(post: Post, format: Format, options?: SerializeOptions): string | Mobiledoc
  serializePost(post: Post, format: Format, options: SerializeOptions = {}): string | Mobiledoc {
    assert(`Unrecognized serialization format ${format}`, contains(Object.values(Format), format))

    if (format === Format.MOBILEDOC) {
      let version: MobiledocVersion = options.version || MOBILEDOC_VERSION
      return mobiledocRenderers.render(post, version)
    } else {
      let mobiledoc = this.serializePost(post, Format.MOBILEDOC)
      let unknownCardHandler = () => {}
      let unknownAtomHandler = () => {}
      let rendererOptions = { unknownCardHandler, unknownAtomHandler }

      switch (format) {
        case Format.HTML: {
          if (Environment.hasDOM()) {
            const rendered = new DOMRenderer(rendererOptions).render(mobiledoc)
            return `<div>${serializeHTML(rendered.result)}</div>`
          } else {
            // Fallback to text serialization
            return this.serializePost(post, Format.TEXT, options)
          }
        }
        case Format.TEXT: {
          let rendered = new TextRenderer(rendererOptions).render(mobiledoc)
          return rendered.result
        }
      }
    }
  }

  addView(view: View) {
    this._views.push(view)
  }

  removeAllViews() {
    this._views.forEach(v => v.destroy())
    this._views = []
  }

  /**
   * Whether the editor has a cursor (or a selected range).
   * It is possible for the editor to be focused but not have a selection.
   * In this case, key events will fire but the editor will not be able to
   * determine a cursor position, so they will be ignored.
   * @return {boolean}
   * @public
   */
  hasCursor(): boolean {
    return this.cursor.hasCursor()
  }

  /**
   * Tears down the editor's attached event listeners and views.
   * @public
   */
  destroy() {
    this.isDestroyed = true
    if (this._hasSelection()) {
      this.cursor.clearSelection()
    }
    if (this._hasFocus()) {
      this.element.blur() // FIXME This doesn't blur the element on IE11
    }
    this._mutationHandler.destroy()
    this._eventManager.destroy()
    this.removeAllViews()
    this._renderer.destroy()
    this._editState.destroy()
  }

  /**
   * Keep the user from directly editing the post using the keyboard and mouse.
   * Modification via the programmatic API is still permitted.
   * @see Editor#enableEditing
   * @public
   */
  disableEditing() {
    this.isEditable = false
    if (this.hasRendered) {
      this._eventManager.stop()
      this.element.setAttribute('contentEditable', 'false')
      this.setPlaceholder('')
      this.selectRange(Range.blankRange())
    }
  }

  /**
   * Allow the user to directly interact with editing a post via keyboard and mouse input.
   * Editor instances are editable by default. Use this method to re-enable
   * editing after disabling it.
   * @see Editor#disableEditing
   * @public
   */
  enableEditing() {
    this.isEditable = true
    if (this.hasRendered) {
      this._eventManager.start()
      this.element.setAttribute('contentEditable', 'true')
      this.setPlaceholder(this.placeholder)
    }
  }

  /**
   * Change a cardSection into edit mode
   * If called before the card has been rendered, it will be marked so that
   * it is rendered in edit mode when it gets rendered.
   * @param {CardSection} cardSection
   * @public
   */
  editCard(cardSection: Card) {
    this._setCardMode(cardSection, CardMode.EDIT)
  }

  /**
   * Change a cardSection into display mode
   * If called before the card has been rendered, it will be marked so that
   * it is rendered in display mode when it gets rendered.
   * @param {CardSection} cardSection
   * @return undefined
   * @public
   */
  displayCard(cardSection: Card) {
    this._setCardMode(cardSection, CardMode.DISPLAY)
  }

  /**
   * Run a new post editing session. Yields a block with a new {@link PostEditor}
   * instance. This instance can be used to interact with the post abstract.
   * Rendering will be deferred until after the callback is completed.
   *
   * Usage:
   * ```
   *   let markerRange = this.range;
   *   editor.run((postEditor) => {
   *     postEditor.deleteRange(markerRange);
   *     // editing surface not updated yet
   *     postEditor.schedule(() => {
   *       console.log('logs during rerender flush');
   *     });
   *     // logging not yet flushed
   *   });
   *   // editing surface now updated.
   *   // logging now flushed
   * ```
   *
   * @param {Function} callback Called with an instance of
   *        {@link PostEditor} as its argument.
   * @return {Mixed} The return value of `callback`.
   * @public
   */
  run<T>(callback: (postEditor: PostEditor) => T): T {
    const postEditor = new PostEditor(this)
    postEditor.begin()
    this._editHistory.snapshot()
    const result = callback(postEditor)
    this.runCallbacks(CALLBACK_QUEUES.DID_UPDATE, [postEditor])
    postEditor.complete()
    this._readRangeFromDOM()

    if (postEditor._shouldCancelSnapshot) {
      this._editHistory._pendingSnapshot = null
    }
    this._editHistory.storeSnapshot(postEditor.editActionTaken)

    return result
  }

  /**
   * @param {Function} callback Called with `postEditor` as its argument.
   * @public
   */
  didUpdatePost(callback: LifecycleCallback) {
    this.addCallback(CALLBACK_QUEUES.DID_UPDATE, callback)
  }

  /**
   * @param {Function} callback Called when the post has changed, either via
   *        user input or programmatically. Use with {@link Editor#serialize} to
   *        retrieve the post in portable mobiledoc format.
   */
  postDidChange(callback: LifecycleCallback) {
    this.addCallback(CALLBACK_QUEUES.POST_DID_CHANGE, callback)
  }

  /**
   * Register a handler that will be invoked by the editor after the user enters
   * matching text.
   * @param {Object} inputHandler
   * @param {String} inputHandler.name Required. Used by identifying handlers.
   * @param {String} [inputHandler.text] Required if `match` is not provided
   * @param {RegExp} [inputHandler.match] Required if `text` is not provided
   * @param {Function} inputHandler.run This callback is invoked with the {@link Editor}
   *                   instance and an array of matches. If `text` was provided,
   *                   the matches array will equal [`text`], and if a `match`
   *                   regex was provided the matches array will be the result of
   *                   `match.exec` on the matching text. The callback is called
   *                   after the matching text has been inserted.
   * @public
   */
  onTextInput(inputHandler: InputHandler) {
    this._eventManager.registerInputHandler(inputHandler)
  }

  /**
   * Unregister all text input handlers
   *
   * @public
   */
  unregisterAllTextInputHandlers() {
    this._eventManager.unregisterAllTextInputHandlers()
  }

  /**
   * Unregister text input handler by name
   * @param {String} name The name of handler to be removed
   *
   * @public
   */
  unregisterTextInputHandler(name: string) {
    this._eventManager.unregisterInputHandler(name)
  }

  /**
   * @param {Function} callback Called when the editor's state (active markups or
   * active sections) has changed, either via user input or programmatically
   */
  inputModeDidChange(callback: LifecycleCallback) {
    this.addCallback(CALLBACK_QUEUES.INPUT_MODE_DID_CHANGE, callback)
  }

  /**
   * @param {Function} callback This callback will be called before the editor
   *        is rendered.
   * @public
   */
  willRender(callback: LifecycleCallback) {
    this.addCallback(CALLBACK_QUEUES.WILL_RENDER, callback)
  }

  /**
   * @param {Function} callback This callback will be called after the editor
   *        is rendered.
   * @public
   */
  didRender(callback: LifecycleCallback) {
    this.addCallback(CALLBACK_QUEUES.DID_RENDER, callback)
  }

  willCopy(callback: LifecycleCallback) {
    this.addCallback(CALLBACK_QUEUES.WILL_COPY, callback)
  }

  /**
   * @param {Function} callback This callback will be called before deleting.
   * @public
   */
  willDelete(callback: LifecycleCallback) {
    this.addCallback(CALLBACK_QUEUES.WILL_DELETE, callback)
  }

  /**
   * @param {Function} callback This callback will be called after deleting.
   * @public
   */
  didDelete(callback: LifecycleCallback) {
    this.addCallback(CALLBACK_QUEUES.DID_DELETE, callback)
  }

  /**
   * @param {Function} callback This callback will be called before handling new line.
   * @public
   */
  willHandleNewline(callback: LifecycleCallback) {
    this.addCallback(CALLBACK_QUEUES.WILL_HANDLE_NEWLINE, callback)
  }

  /**
   * @param {Function} callback This callback will be called every time the cursor
   *        position (or selection) changes.
   * @public
   */
  cursorDidChange(callback: LifecycleCallback) {
    this.addCallback(CALLBACK_QUEUES.CURSOR_DID_CHANGE, callback)
  }

  _rangeDidChange() {
    if (this.hasRendered) {
      this.runCallbacks(CALLBACK_QUEUES.CURSOR_DID_CHANGE)
    }
  }

  _inputModeDidChange() {
    this.runCallbacks(CALLBACK_QUEUES.INPUT_MODE_DID_CHANGE)
  }

  _insertEmptyMarkupSectionAtCursor() {
    this.run(postEditor => {
      const section = postEditor.builder.createMarkupSection('p')
      postEditor.insertSectionBefore(this.post.sections, section)
      postEditor.setRange(section.toRange())
    })
  }

  /**
   * @callback editorBeforeCallback
   * @param { Object } details
   * @param { Markup } details.markup
   * @param { Range } details.range
   * @param { boolean } details.willAdd Whether the markup will be applied
   */

  /**
   * Register a callback that will be run before {@link Editor#toggleMarkup} is applied.
   * If any callback returns literal `false`, the toggling of markup will be canceled.
   * Note this only applies to calling `editor#toggleMarkup`. Using `editor.run` and
   * modifying markup with the `postEditor` will skip any `beforeToggleMarkup` callbacks.
   * @param {editorBeforeCallback}
   */
  beforeToggleMarkup(callback: LifecycleCallback) {
    this._beforeHooks.toggleMarkup.push(callback)
  }

  /**
   * Toggles the given markup at the editor's current {@link Range}.
   * If the range is collapsed this changes the editor's state so that the
   * next characters typed will be affected. If there is text selected
   * (aka a non-collapsed range), the selections' markup will be toggled.
   * If the editor is not focused and has no active range, nothing happens.
   * Hooks added using #beforeToggleMarkup will be run before toggling,
   * and if any of them returns literal false, toggling the markup will be canceled
   * and no change will be applied.
   * @param {String} markup E.g. "b", "em", "a"
   * @param {Object} [attributes={}] E.g. {href: "http://bustle.com"}
   * @public
   * @see PostEditor#toggleMarkup
   */
  toggleMarkup(markupTag: string, attributes: Dict<string> = {}) {
    const markup = this.builder.createMarkup(markupTag, attributes)
    const { range } = this
    const willAdd = !this.detectMarkupInRange(range, markup.tagName)
    const shouldCancel = this._runBeforeHooks('toggleMarkup', { markup, range, willAdd })

    if (shouldCancel) {
      return
    }

    if (range.isCollapsed) {
      this._editState.toggleMarkupState(markup)
      this._inputModeDidChange()

      // when clicking a button to toggle markup, the button can end up being focused,
      // so ensure the editor is focused
      this._ensureFocus()
    } else {
      this.run(postEditor => postEditor.toggleMarkup(markup, range))
    }
  }

  // If the editor has a selection but is not focused, focus it
  _ensureFocus() {
    if (this._hasSelection() && !this._hasFocus()) {
      this.focus()
    }
  }

  focus() {
    this.element.focus()
  }

  /**
   * Whether there is a selection inside the editor's element.
   * It's possible to have a selection but not have focus.
   * @see #_hasFocus
   * @return {Boolean}
   */
  _hasSelection(): boolean {
    const { cursor } = this
    return this.hasRendered && (cursor._hasCollapsedSelection() || cursor._hasSelection())
  }

  /**
   * Whether the editor's element is focused
   * It's possible to be focused but have no selection
   * @see #_hasSelection
   * @return {Boolean}
   */
  _hasFocus(): boolean {
    return document.activeElement === this.element
  }

  /**
   * Toggles the tagName for the current active section(s). This will skip
   * non-markerable sections. E.g. if the editor's range includes a "P" MarkupSection
   * and a CardSection, only the MarkupSection will be toggled.
   * @param {String} tagName The new tagname to change to.
   * @public
   * @see PostEditor#toggleSection
   */
  toggleSection(tagName: string) {
    this.run(postEditor => postEditor.toggleSection(tagName, this.range))
  }

  /**
   * Sets an attribute for the current active section(s).
   *
   * @param {String} key The attribute. The only valid attribute is 'text-align'.
   * @param {String} value The value of the attribute.
   * @public
   * @see PostEditor#setAttribute
   */
  setAttribute(key: string, value: string) {
    this.run(postEditor => postEditor.setAttribute(key, value, this.range))
  }

  /**
   * Removes an attribute from the current active section(s).
   *
   * @param {String} key The attribute. The only valid attribute is 'text-align'.
   * @public
   * @see PostEditor#removeAttribute
   */
  removeAttribute(key: string) {
    this.run(postEditor => postEditor.removeAttribute(key, this.range))
  }

  /**
   * Finds and runs the first matching key command for the event
   *
   * If multiple commands are bound to a key combination, the
   * first matching one is run.
   *
   * If a command returns `false` then the next matching command
   * is run instead.
   *
   * @param {Event} event The keyboard event triggered by the user
   * @return {Boolean} true when a command was successfully run
   * @private
   */
  handleKeyCommand(event: KeyboardEvent): boolean {
    const keyCommands = findKeyCommands(this.keyCommands, event)
    for (let i = 0; i < keyCommands.length; i++) {
      let keyCommand = keyCommands[i]
      if (keyCommand.run(this) !== false) {
        event.preventDefault()
        return true
      }
    }
    return false
  }

  /**
   * Inserts the text at the current cursor position. If the editor has
   * no current cursor position, nothing will be inserted. If the editor's
   * range is not collapsed, it will be deleted before insertion.
   *
   * @param {String} text
   * @public
   */
  insertText(text: string) {
    if (!this.hasCursor()) {
      return
    }
    if (this.post.isBlank) {
      this._insertEmptyMarkupSectionAtCursor()
    }
    let {
      activeMarkups,
      range,
      range: { head: position },
    } = this

    this.run(postEditor => {
      if (!range.isCollapsed) {
        position = postEditor.deleteRange(range)
      }

      postEditor.insertTextWithMarkup(position, text, activeMarkups)
    })
  }

  /**
   * Inserts an atom at the current cursor position. If the editor has
   * no current cursor position, nothing will be inserted. If the editor's
   * range is not collapsed, it will be deleted before insertion.
   * @param {String} atomName
   * @param {String} [atomText='']
   * @param {Object} [atomPayload={}]
   * @return {Atom} The inserted atom.
   * @public
   */
  insertAtom(atomName: string, atomText: string = '', atomPayload: AtomPayload = {}): Maybe<Atom> {
    if (!this.hasCursor()) {
      return
    }

    if (this.post.isBlank) {
      this._insertEmptyMarkupSectionAtCursor()
    }

    let atom: Atom
    let { range } = this
    this.run(postEditor => {
      let position = range.head

      atom = postEditor.builder.createAtom(atomName, atomText, atomPayload)
      if (!range.isCollapsed) {
        position = postEditor.deleteRange(range)
      }

      postEditor.insertMarkers(position, [atom])
    })
    return atom!
  }

  /**
   * Inserts a card at the section after the current cursor position. If the editor has
   * no current cursor position, nothing will be inserted. If the editor's
   * range is not collapsed, it will be deleted before insertion. If the cursor is in
   * a blank section, it will be replaced with a card section.
   * The editor's cursor will be placed at the end of the inserted card.
   * @param {String} cardName
   * @param {Object} [cardPayload={}]
   * @param {Boolean} [inEditMode=false] Whether the card should be inserted in edit mode.
   * @return {Card} The inserted Card section.
   * @public
   */
  insertCard(cardName: string, cardPayload: CardPayload = {}, inEditMode: boolean = false): Maybe<Card> {
    if (!this.hasCursor()) {
      return
    }

    if (this.post.isBlank) {
      this._insertEmptyMarkupSectionAtCursor()
    }

    let card: Card
    let { range } = this
    this.run(postEditor => {
      let position = range.tail
      card = postEditor.builder.createCardSection(cardName, cardPayload)
      if (inEditMode) {
        this.editCard(card)
      }

      if (!range.isCollapsed) {
        position = postEditor.deleteRange(range)
      }

      let section = position.section!
      if (isNested(section)) {
        section = section.parent
      }

      if (section.isBlank) {
        postEditor.replaceSection(section, card)
      } else {
        let collection = this.post.sections
        postEditor.insertSectionBefore(collection, card, section.next)
      }

      // It is important to explicitly set the range to the end of the card.
      // Otherwise it is possible to create an inconsistent state in the
      // browser. For instance, if the user clicked a button that
      // called `editor.insertCard`, the editor surface may retain
      // the selection but lose focus, and the next keystroke by the user
      // will cause an unexpected DOM mutation (which can wipe out the
      // card).
      // See: https://github.com/bustle/mobiledoc-kit/issues/286
      postEditor.setRange(card.tailPosition())
    })
    return card!
  }

  /**
   * @param {integer} x x-position in viewport
   * @param {integer} y y-position in viewport
   * @return {Position|null}
   */
  positionAtPoint(x: number, y: number): Position | null {
    return Position.atPoint(x, y, this)
  }

  /**
   * @private
   */
  _setCardMode(cardSection: Card, mode: CardMode) {
    const renderNode = cardSection.renderNode
    if (renderNode && renderNode.isRendered) {
      const cardNode = renderNode.cardNode!
      cardNode[mode]()
    } else {
      cardSection.setInitialMode(mode)
    }
  }

  triggerEvent(context: unknown, eventName: string, event: Event) {
    this._eventManager._trigger(context, eventName, event)
  }

  addCallback(queueName: string, callback: LifecycleCallback) {
    this._callbacks.addCallback(queueName, callback)
  }

  addCallbackOnce(queueName: string, callback: LifecycleCallback) {
    this._callbacks.addCallbackOnce(queueName, callback)
  }

  runCallbacks(queueName: string, args?: unknown[]) {
    if (this.isDestroyed) {
      // TODO warn that callback attempted after editor was destroyed
      return
    }
    this._callbacks.runCallbacks(queueName, args)
  }

  /**
   * Runs each callback for the given hookName.
   * Only the hookName 'toggleMarkup' is currently supported
   * @return {Boolean} shouldCancel Whether the action in `hookName` should be canceled
   * @private
   */
  _runBeforeHooks(hookName: string, ...args: unknown[]): true | undefined {
    let hooks = this._beforeHooks[hookName] || []
    for (let i = 0; i < hooks.length; i++) {
      if (hooks[i](...args) === false) {
        return true
      }
    }
  }
}
