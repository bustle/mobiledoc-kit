import assert from '../utils/assert'
import { parsePostFromPaste, setClipboardData, parsePostFromDrop } from '../utils/parse-utils'
import { filter, forEach } from '../utils/array-utils'
import Key from '../utils/key'
import TextInputHandler, { TextInputHandlerListener } from '../editor/text-input-handler'
import SelectionManager from '../editor/selection-manager'
import Browser from '../utils/browser'
import Editor, { TextUnit, Format } from './editor'
import { Logger } from '../utils/log-manager'
import { PartialSelection } from '../utils/selection-utils'

const ELEMENT_EVENT_TYPES = <const>[
  'keydown',
  'keyup',
  'cut',
  'copy',
  'paste',
  'keypress',
  'drop',
  'compositionstart',
  'compositionend',
]

declare global {
  interface HTMLElementEventMap {
    compositionstart: CompositionEvent
    compositionend: CompositionEvent
  }
}

export type DOMEventType = typeof ELEMENT_EVENT_TYPES[number]
export type DOMEventForType<T extends DOMEventType> = HTMLElementEventMap[T]
export type DOMEvent = HTMLElementEventMap[DOMEventType]

interface ModifierKeys {
  shift: boolean
}

type EventManagerListener = [
  HTMLElement,
  DOMEventType,
  (event: CompositionEvent | KeyboardEvent | ClipboardEvent | DragEvent) => void
]

export default class EventManager {
  editor: Editor
  logger: Logger
  modifierKeys: ModifierKeys
  started: boolean

  _isComposingOnBlankLine: boolean
  _listeners: EventManagerListener[]
  _textInputHandler: TextInputHandler
  _selectionManager: SelectionManager

  constructor(editor: Editor) {
    this.editor = editor
    this.logger = editor.loggerFor('event-manager')
    this._textInputHandler = new TextInputHandler(editor)
    this._listeners = []
    this.modifierKeys = {
      shift: false,
    }

    this._selectionManager = new SelectionManager(this.editor, this.selectionDidChange.bind(this))
    this.started = true
    this._isComposingOnBlankLine = false
  }

  init() {
    let {
      editor: { element },
    } = this
    assert(`Cannot init EventManager without element`, !!element)

    ELEMENT_EVENT_TYPES.forEach(type => {
      this._addListener(element, type)
    })

    this._selectionManager.start()
  }

  start() {
    this.started = true
  }

  stop() {
    this.started = false
  }

  registerInputHandler(inputHandler: TextInputHandlerListener) {
    this._textInputHandler.register(inputHandler)
  }

  unregisterInputHandler(name: string) {
    this._textInputHandler.unregister(name)
  }

  unregisterAllTextInputHandlers() {
    this._textInputHandler.destroy()
    this._textInputHandler = new TextInputHandler(this.editor)
  }

  _addListener(context: HTMLElement, type: DOMEventType) {
    assert(`Missing listener for ${type}`, !!this[type])

    let listener: (event: DOMEventForType<typeof type>) => void = event => this._handleEvent(type, event)
    context.addEventListener(type, listener)
    this._listeners.push([context, type, listener])
  }

  _removeListeners() {
    this._listeners.forEach(([context, type, listener]) => {
      context.removeEventListener(type, listener)
    })
    this._listeners = []
  }

  // This is primarily useful for programmatically simulating events on the
  // editor from the tests.
  _trigger(context: HTMLElement, type: DOMEventType, event: DOMEventForType<typeof type>) {
    forEach(
      filter(this._listeners, ([_context, _type]) => {
        return _context === context && _type === type
      }),
      ([context, , listener]) => {
        listener.call(context, event)
      }
    )
  }

  destroy() {
    this._textInputHandler.destroy()
    this._selectionManager.destroy()
    this._removeListeners()
  }

  _handleEvent(type: DOMEventType, event: DOMEventForType<typeof type>) {
    let { target: element } = event
    if (!this.started) {
      // abort handling this event
      return true
    }

    if (!this.isElementAddressable(element! as HTMLElement)) {
      // abort handling this event
      return true
    }

    ;(this[type] as (evt: typeof event) => void)(event)
  }

  isElementAddressable(element: Node) {
    return this.editor.cursor.isAddressable(element)
  }

  selectionDidChange(selection: PartialSelection /*, prevSelection */) {
    let shouldNotify = true
    let { anchorNode } = selection
    if (!this.isElementAddressable(anchorNode!)) {
      if (!this.editor.range.isBlank) {
        // Selection changed from something addressable to something
        // not-addressable -- e.g., blur event, user clicked outside editor,
        // etc
        shouldNotify = true
      } else {
        // selection changes wholly outside the editor should not trigger
        // change notifications
        shouldNotify = false
      }
    }

    if (shouldNotify) {
      this.editor._readRangeFromDOM()
    }
  }

  keypress(event: KeyboardEvent) {
    let { editor, _textInputHandler } = this
    if (!editor.hasCursor()) {
      return
    }

    let key = Key.fromEvent(event)
    if (!key.isPrintable()) {
      return
    } else {
      event.preventDefault()
    }

    // Handle carriage returns
    if (!key.isEnter() && key.keyCode === 13) {
      _textInputHandler.handleNewLine()
      editor.handleNewline(event)
      return
    }

    _textInputHandler.handle(key.toString())
  }

  keydown(event: KeyboardEvent) {
    let { editor } = this
    if (!editor.hasCursor()) {
      return
    }
    if (!editor.isEditable) {
      return
    }

    let key = Key.fromEvent(event)
    this._updateModifiersFromKey(key, { isDown: true })

    if (editor.handleKeyCommand(event)) {
      return
    }

    if (editor.post.isBlank) {
      editor._insertEmptyMarkupSectionAtCursor()
    }

    let range = editor.range

    console.log(key.isShiftEnter())
    switch (true) {
      // Ignore keydown events when using an IME
      case key.isIME(): {
        break
      }
      // FIXME This should be restricted to only card/atom boundaries
      case key.isHorizontalArrowWithoutModifiersOtherThanShift(): {
        let newRange
        if (key.isShift()) {
          newRange = range.extend(key.direction * 1)
        } else {
          newRange = range.move(key.direction)
        }

        editor.selectRange(newRange)
        event.preventDefault()
        break
      }
      case key.isDelete(): {
        let { direction } = key
        let unit = TextUnit.CHAR
        if (key.altKey && Browser.isMac()) {
          unit = TextUnit.WORD
        } else if (key.ctrlKey && !Browser.isMac()) {
          unit = TextUnit.WORD
        }
        editor.performDelete({ direction, unit })
        event.preventDefault()
        break
      }
      case key.isEnter():
        this._textInputHandler.handleNewLine()
        editor.handleNewline(event)
        break
      case key.isShiftEnter():
        event.preventDefault()
        editor.insertAtom('-soft-break')
        break
      case key.isTab():
        // Handle tab here because it does not fire a `keypress` event
        event.preventDefault()
        this._textInputHandler.handle(key.toString())
        break
    }
  }

  keyup(event: KeyboardEvent) {
    let { editor } = this
    if (!editor.hasCursor()) {
      return
    }
    let key = Key.fromEvent(event)
    this._updateModifiersFromKey(key, { isDown: false })
  }

  // The mutation handler interferes with IMEs when composing
  // on a blank line. These two event handlers are for suppressing
  // mutation handling in this scenario.
  compositionstart(_event: KeyboardEvent) {
    let { editor } = this
    // Ignore compositionstart if not on a blank line
    if (editor.range.headMarker) {
      return
    }
    this._isComposingOnBlankLine = true

    if (editor.post.isBlank) {
      editor._insertEmptyMarkupSectionAtCursor()
    }

    // Stop listening for mutations on Chrome browsers and suppress
    // mutations by prepending a character for other browsers.
    // The reason why we treat these separately is because
    // of the way each browser processes IME inputs.
    if (Browser.isChrome()) {
      editor.setPlaceholder('')
      editor._mutationHandler.stopObserving()
    } else {
      this._textInputHandler.handle(' ')
    }
  }

  compositionend(event: CompositionEvent) {
    const { editor } = this

    // Ignore compositionend if not composing on blank line
    if (!this._isComposingOnBlankLine) {
      return
    }
    this._isComposingOnBlankLine = false

    // Start listening for mutations on Chrome browsers and
    // delete the prepended character introduced by compositionstart
    // for other browsers.
    if (Browser.isChrome()) {
      editor.insertText(event.data)
      editor.setPlaceholder(editor.placeholder)
      editor._mutationHandler.startObserving()
    } else {
      let startOfCompositionLine = editor.range.headSection!.toPosition(0)
      let endOfCompositionLine = editor.range.headSection!.toPosition(event.data.length)
      editor.run(postEditor => {
        postEditor.deleteAtPosition(startOfCompositionLine, 1, { unit: TextUnit.CHAR })
        postEditor.setRange(endOfCompositionLine)
      })
    }
  }

  cut(event: ClipboardEvent) {
    event.preventDefault()

    this.copy(event)
    this.editor.performDelete()
  }

  copy(event: ClipboardEvent) {
    event.preventDefault()

    let {
      editor,
      editor: { range, post },
    } = this
    post = post.trimTo(range)

    let data = {
      html: editor.serializePost(post, Format.HTML),
      text: editor.serializePost(post, Format.TEXT),
      mobiledoc: editor.serializePost(post, Format.MOBILEDOC),
    }

    editor.runCallbacks('willCopy', [data])

    setClipboardData(event, data, window)
  }

  paste(event: ClipboardEvent) {
    event.preventDefault()

    let { editor } = this
    let range = editor.range

    if (!range.isCollapsed) {
      editor.performDelete()
    }

    if (editor.post.isBlank) {
      editor._insertEmptyMarkupSectionAtCursor()
    }

    let position = editor.range.head
    let targetFormat = this.modifierKeys.shift ? 'text' : 'html'
    let pastedPost = parsePostFromPaste(event, editor, { targetFormat })

    editor.run(postEditor => {
      let nextPosition = postEditor.insertPost(position, pastedPost!)
      postEditor.setRange(nextPosition)
    })
  }

  drop(event: DragEvent) {
    event.preventDefault()

    let { clientX: x, clientY: y } = event
    let { editor } = this

    let position = editor.positionAtPoint(x, y)
    if (!position) {
      this.logger.log('Could not find drop position')
      return
    }

    let post = parsePostFromDrop(event, editor, { logger: this.logger })
    if (!post) {
      this.logger.log('Could not determine post from drop event')
      return
    }

    editor.run(postEditor => {
      let nextPosition = postEditor.insertPost(position!, post!)
      postEditor.setRange(nextPosition)
    })
  }

  _updateModifiersFromKey(key: Key, { isDown }: { isDown: boolean }) {
    if (key.isShiftKey()) {
      this.modifierKeys.shift = isDown
    }
  }
}
