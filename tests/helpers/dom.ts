import { clearSelection } from 'mobiledoc-kit/utils/selection-utils'
import { forEach, contains } from 'mobiledoc-kit/utils/array-utils'
import KEY_CODES from 'mobiledoc-kit/utils/keycodes'
import { DIRECTION, MODIFIERS } from 'mobiledoc-kit/utils/key'
import { isTextNode } from 'mobiledoc-kit/utils/dom-utils'
import { merge } from 'mobiledoc-kit/utils/merge'
import { Editor } from 'mobiledoc-kit'
import { MIME_TEXT_PLAIN, MIME_TEXT_HTML } from 'mobiledoc-kit/utils/parse-utils'
import { dasherize } from 'mobiledoc-kit/utils/string-utils'
import { DOMEvent, DOMEventType } from 'mobiledoc-kit/editor/event-manager'
import { Dict } from 'mobiledoc-kit/utils/types'

function assertEditor(editor: any): asserts editor is Editor {
  if (!(editor instanceof Editor)) {
    throw new Error('Must pass editor as first argument')
  }
}

// walks DOWN the dom from node to childNodes, returning the element
// for which `conditionFn(element)` is true
function walkDOMUntil(topNode: Node, conditionFn: (node: Node) => boolean = () => false) {
  if (!topNode) {
    throw new Error('Cannot call walkDOMUntil without a node')
  }
  let stack = [topNode]
  let currentElement: Node

  while (stack.length) {
    currentElement = stack.pop()!

    if (conditionFn(currentElement)) {
      return currentElement
    }

    forEach(currentElement.childNodes, el => stack.push(el))
  }
}

function findTextNode(parentElement: Node, text: string) {
  return walkDOMUntil(parentElement, node => {
    return isTextNode(node) && node.textContent!.indexOf(text) !== -1
  })
}

function selectRange(startNode: Node, startOffset: number, endNode: Node, endOffset: number) {
  clearSelection()

  const range = document.createRange()
  range.setStart(startNode, startOffset)
  range.setEnd(endNode, endOffset)

  const selection = window.getSelection()!
  selection.addRange(range)
}

function selectText(
  editor: Editor,
  startText: string,
  startContainingElement = editor.element,
  endText = startText,
  endContainingElement = startContainingElement
) {
  assertEditor(editor)
  let startTextNode = findTextNode(startContainingElement, startText)
  let endTextNode = findTextNode(endContainingElement, endText)

  if (!startTextNode) {
    throw new Error(`Could not find a starting textNode containing "${startText}"`)
  }
  if (!endTextNode) {
    throw new Error(`Could not find an ending textNode containing "${endText}"`)
  }

  const startOffset = startTextNode.textContent!.indexOf(startText),
    endOffset = endTextNode.textContent!.indexOf(endText) + endText.length
  selectRange(startTextNode, startOffset, endTextNode, endOffset)
  editor._readRangeFromDOM()
}

function moveCursorWithoutNotifyingEditorTo(
  _editor: Editor,
  node: Node,
  offset = 0,
  endNode = node,
  endOffset = offset
) {
  selectRange(node, offset, endNode, endOffset)
}

function moveCursorTo(editor: Editor, node: Node, offset = 0, endNode = node, endOffset = offset) {
  assertEditor(editor)
  if (!node) {
    throw new Error('Cannot moveCursorTo node without node')
  }
  moveCursorWithoutNotifyingEditorTo(editor, node, offset, endNode, endOffset)
  editor._readRangeFromDOM()
}

function triggerEvent(node: Node, eventType: string) {
  if (!node) {
    throw new Error(`Attempted to trigger event "${eventType}" on undefined node`)
  }

  let clickEvent = document.createEvent('MouseEvents')
  clickEvent.initEvent(eventType, true, true)
  return node.dispatchEvent(clickEvent)
}

function _triggerEditorEvent(editor: Editor, event: DOMEvent) {
  editor.triggerEvent(editor.element, event.type as DOMEventType, event)
}

function _buildDOM(tagName: string, attributes: Dict<string> = {}, children = []) {
  const el = document.createElement(tagName)
  Object.keys(attributes).forEach(k => el.setAttribute(k, attributes[k]))
  children.forEach(child => el.appendChild(child))
  return el
}

_buildDOM.text = (string: string) => {
  return document.createTextNode(string)
}

/**
 * Usage:
 * build(t =>
 *   t('div', attributes={}, children=[
 *     t('b', {}, [
 *       t.text('I am a bold text node')
 *     ])
 *   ])
 * );
 */
function build(tree: (t: typeof _buildDOM) => HTMLElement) {
  return tree(_buildDOM)
}

function getSelectedText() {
  const selection = window.getSelection()!
  if (selection.rangeCount === 0) {
    return null
  } else if (selection.rangeCount > 1) {
    // FIXME?
    throw new Error('Unable to get selected text for multiple ranges')
  } else {
    return selection.toString()
  }
}

// returns the node and the offset that the cursor is on
function getCursorPosition() {
  const selection = window.getSelection()!
  return {
    node: selection.anchorNode,
    offset: selection.anchorOffset,
  }
}

function createMockEvent(eventName: string, element: HTMLElement, options = {}) {
  let event = {
    type: eventName,
    preventDefault() {},
    target: element,
  }
  merge(event, options)
  return (event as unknown) as DOMEvent
}

// options is merged into the mocked `KeyboardEvent` data.
// Useful for simulating modifier keys, eg:
// triggerDelete(editor, DIRECTION.BACKWARD, {altKey: true})
function triggerDelete(editor: Editor, direction = DIRECTION.BACKWARD, options = {}) {
  assertEditor(editor)
  const keyCode = direction === DIRECTION.BACKWARD ? KEY_CODES.BACKSPACE : KEY_CODES.DELETE
  let eventOptions = merge({ keyCode }, options)
  let event = createMockEvent('keydown', editor.element, eventOptions)
  _triggerEditorEvent(editor, event)
}

function triggerForwardDelete(editor: Editor, options: Dict<unknown>) {
  return triggerDelete(editor, DIRECTION.FORWARD, options)
}

function triggerEnter(editor: Editor) {
  assertEditor(editor)
  let event = createMockEvent('keydown', editor.element, { keyCode: KEY_CODES.ENTER })
  _triggerEditorEvent(editor, event)
}

// keyCodes and charCodes are similar but not the same.
function keyCodeForChar(letter: string) {
  let keyCode
  switch (letter) {
    case '.':
      keyCode = KEY_CODES['.']
      break
    case '\n':
      keyCode = KEY_CODES.ENTER
      break
    default:
      keyCode = letter.charCodeAt(0)
  }
  return keyCode
}

function insertText(editor: Editor, string: string) {
  if (!string && editor) {
    throw new Error('Must pass `editor` to `insertText`')
  }

  string.split('').forEach(letter => {
    let stop = false
    let keyCode = keyCodeForChar(letter)
    let charCode = letter.charCodeAt(0)
    let preventDefault = () => (stop = true)
    let keydown = createMockEvent('keydown', editor.element, {
      keyCode,
      charCode,
      preventDefault,
    })
    let keypress = createMockEvent('keypress', editor.element, {
      keyCode,
      charCode,
    })
    let keyup = createMockEvent('keyup', editor.element, {
      keyCode,
      charCode,
      preventDefault,
    })

    _triggerEditorEvent(editor, keydown)
    if (stop) {
      return
    }
    _triggerEditorEvent(editor, keypress)
    if (stop) {
      return
    }
    _triggerEditorEvent(editor, keyup)
  })
}

function triggerKeyEvent(editor: Editor, type: string, options: Dict<unknown>) {
  let event = createMockEvent(type, editor.element, options)
  _triggerEditorEvent(editor, event)
}

// triggers a key sequence like cmd-B on the editor, to test out
// registered keyCommands
function triggerKeyCommand(editor: Editor, string: keyof typeof KEY_CODES, modifiers: number | number[] = []) {
  if (typeof modifiers === 'number') {
    modifiers = [modifiers] // convert singular to array
  }
  let charCode = KEY_CODES[string] || string.toUpperCase().charCodeAt(0)
  let keyCode = charCode
  let keyEvent = createMockEvent('keydown', editor.element, {
    charCode,
    keyCode,
    shiftKey: contains(modifiers, MODIFIERS.SHIFT),
    metaKey: contains(modifiers, MODIFIERS.META),
    ctrlKey: contains(modifiers, MODIFIERS.CTRL),
  })
  _triggerEditorEvent(editor, keyEvent)
}

function triggerRightArrowKey(editor: Editor, modifier?: number) {
  if (!(editor instanceof Editor)) {
    throw new Error('Must pass editor to triggerRightArrowKey')
  }
  let keydown = createMockEvent('keydown', editor.element, {
    keyCode: KEY_CODES.RIGHT,
    shiftKey: modifier === MODIFIERS.SHIFT,
  })
  let keyup = createMockEvent('keyup', editor.element, {
    keyCode: KEY_CODES.RIGHT,
    shiftKey: modifier === MODIFIERS.SHIFT,
  })
  _triggerEditorEvent(editor, keydown)
  _triggerEditorEvent(editor, keyup)
}

function triggerLeftArrowKey(editor: Editor, modifier?: number) {
  assertEditor(editor)
  let keydown = createMockEvent('keydown', editor.element, {
    keyCode: KEY_CODES.LEFT,
    shiftKey: modifier === MODIFIERS.SHIFT,
  })
  let keyup = createMockEvent('keyup', editor.element, {
    keyCode: KEY_CODES.LEFT,
    shiftKey: modifier === MODIFIERS.SHIFT,
  })
  _triggerEditorEvent(editor, keydown)
  _triggerEditorEvent(editor, keyup)
}

// Allows our fake copy and paste events to communicate with each other.
const lastCopyData: Dict<unknown> = {}
function triggerCopyEvent(editor: Editor) {
  let eventData = {
    clipboardData: {
      setData(type: string, value: unknown) {
        lastCopyData[type] = value
      },
    },
  }

  let event = createMockEvent('copy', editor.element, eventData)
  _triggerEditorEvent(editor, event)
}

function triggerCutEvent(editor: Editor) {
  let event = createMockEvent('cut', editor.element, {
    clipboardData: {
      setData(type: string, value: unknown) {
        lastCopyData[type] = value
      },
    },
  })
  _triggerEditorEvent(editor, event)
}

function triggerPasteEvent(editor: Editor) {
  let eventData = {
    clipboardData: {
      getData(type: string) {
        return lastCopyData[type]
      },
    },
  }

  let event = createMockEvent('paste', editor.element, eventData)
  _triggerEditorEvent(editor, event)
}

function triggerDropEvent(
  editor: Editor,
  { html, text, clientX, clientY }: { html: string; text: string; clientX: number; clientY: number }
) {
  if (!clientX || !clientY) {
    throw new Error('Must pass clientX, clientY')
  }
  let event = createMockEvent('drop', editor.element, {
    clientX,
    clientY,
    dataTransfer: {
      getData(mimeType: string) {
        switch (mimeType) {
          case MIME_TEXT_HTML:
            return html
          case MIME_TEXT_PLAIN:
            return text
          default:
            throw new Error('invalid mime type ' + mimeType)
        }
      },
    },
  })

  _triggerEditorEvent(editor, event)
}

function getCopyData(type: string) {
  return lastCopyData[type]
}

function setCopyData(type: string, value: unknown) {
  lastCopyData[type] = value
}

function clearCopyData() {
  Object.keys(lastCopyData).forEach(key => {
    delete lastCopyData[key]
  })
}

function fromHTML(html: string) {
  html = $.trim(html)
  let div = document.createElement('div')
  div.innerHTML = html
  return div
}

/**
 * Tests fail in IE when using `element.blur`, so remove focus by refocusing
 * on another item instead of blurring the editor element
 */
function blur() {
  let input = $('<input>')
  input.appendTo('#qunit-fixture')
  input.focus()
}

function getData(element: HTMLElement, name: string) {
  if (element.dataset) {
    return element.dataset[name]
  } else {
    return element.getAttribute(dasherize(name))
  }
}

const DOMHelper = {
  moveCursorTo,
  moveCursorWithoutNotifyingEditorTo,
  selectRange,
  selectText,
  clearSelection,
  triggerEvent,
  build,
  fromHTML,
  KEY_CODES,
  getCursorPosition,
  getSelectedText,
  triggerDelete,
  triggerForwardDelete,
  triggerEnter,
  insertText,
  triggerKeyEvent,
  triggerKeyCommand,
  triggerRightArrowKey,
  triggerLeftArrowKey,
  triggerCopyEvent,
  triggerCutEvent,
  triggerPasteEvent,
  triggerDropEvent,
  getCopyData,
  setCopyData,
  clearCopyData,
  createMockEvent,
  findTextNode,
  blur,
  getData,
}

export { triggerEvent }

export default DOMHelper
