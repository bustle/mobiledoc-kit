import { clearSelection } from 'mobiledoc-kit/utils/selection-utils';
import { forEach } from 'mobiledoc-kit/utils/array-utils';
import KEY_CODES from 'mobiledoc-kit/utils/keycodes';
import { DIRECTION, MODIFIERS }  from 'mobiledoc-kit/utils/key';
import { isTextNode } from 'mobiledoc-kit/utils/dom-utils';
import { merge } from 'mobiledoc-kit/utils/merge';

// walks DOWN the dom from node to childNodes, returning the element
// for which `conditionFn(element)` is true
function walkDOMUntil(topNode, conditionFn=() => {}) {
  if (!topNode) { throw new Error('Cannot call walkDOMUntil without a node'); }
  let stack = [topNode];
  let currentElement;

  while (stack.length) {
    currentElement = stack.pop();

    if (conditionFn(currentElement)) {
      return currentElement;
    }

    // jshint -W083
    forEach(currentElement.childNodes, el => stack.push(el));
    // jshint +W083
  }
}

function selectRange(startNode, startOffset, endNode, endOffset) {
  clearSelection();

  const range = document.createRange();
  range.setStart(startNode, startOffset);
  range.setEnd(endNode, endOffset);

  const selection = window.getSelection();
  selection.addRange(range);
}

function selectText(startText,
                    startContainingElement,
                    endText=startText,
                    endContainingElement=startContainingElement) {
  const findTextNode = (text) => {
    return (el) => isTextNode(el) && el.textContent.indexOf(text) !== -1;
  };
  const startTextNode = walkDOMUntil(
    startContainingElement, findTextNode(startText));
  const endTextNode   = walkDOMUntil(
    endContainingElement,   findTextNode(endText));

  if (!startTextNode) {
    throw new Error(`Could not find a starting textNode containing "${startText}"`);
  }
  if (!endTextNode) {
    throw new Error(`Could not find an ending textNode containing "${endText}"`);
  }

  const startOffset = startTextNode.textContent.indexOf(startText),
        endOffset   = endTextNode.textContent.indexOf(endText) + endText.length;
  selectRange(startTextNode, startOffset, endTextNode, endOffset);
}

function moveCursorTo(node, offset=0, endNode=node, endOffset=offset) {
  if (!node) { throw new Error('Cannot moveCursorTo node without node'); }
  selectRange(node, offset, endNode, endOffset);
}

function triggerEvent(node, eventType) {
  if (!node) { throw new Error(`Attempted to trigger event "${eventType}" on undefined node`); }

  let clickEvent = document.createEvent('MouseEvents');
  clickEvent.initEvent(eventType, true, true);
  return node.dispatchEvent(clickEvent);
}

function _buildDOM(tagName, attributes={}, children=[]) {
  const el = document.createElement(tagName);
  Object.keys(attributes).forEach(k => el.setAttribute(k, attributes[k]));
  children.forEach(child => el.appendChild(child));
  return el;
}

_buildDOM.text = (string) => {
  return document.createTextNode(string);
};

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
function build(tree) {
  return tree(_buildDOM);
}

function getSelectedText() {
  const selection = window.getSelection();
  if (selection.rangeCount === 0) {
    return null;
  } else if (selection.rangeCount > 1) {
    // FIXME?
    throw new Error('Unable to get selected text for multiple ranges');
  } else {
    return selection.toString();
  }
}

// returns the node and the offset that the cursor is on
function getCursorPosition() {
  const selection = window.getSelection();
  return {
    node:   selection.anchorNode,
    offset: selection.anchorOffset
  };
}

function createMockEvent(eventName, element, options={}) {
  let event = {
    type: eventName,
    preventDefault() {},
    target: element
  };
  merge(event, options);
  return event;
}

function triggerDelete(editor, direction=DIRECTION.BACKWARD) {
  if (!editor) { throw new Error('Must pass `editor` to `triggerDelete`'); }
  const keyCode = direction === DIRECTION.BACKWARD ? KEY_CODES.BACKSPACE :
                                                     KEY_CODES.DELETE;
  let event = createMockEvent('keydown', editor.element, {
    keyCode
  });
  editor.triggerEvent(editor.element, 'keydown', event);
}

function triggerForwardDelete(editor) {
  return triggerDelete(editor, DIRECTION.FORWARD);
}

function triggerEnter(editor) {
  if (!editor) { throw new Error('Must pass `editor` to `triggerEnter`'); }
  let event = createMockEvent('keydown', editor.element, { keyCode: KEY_CODES.ENTER});
  editor.triggerEvent(editor.element, 'keydown', event);
}

// IE11 and earlier cannot exec the `insertText` command. This version
// check takes the place of actually detecting support for the
// functionality, which would be very difficult.
const canExecCommandInsertText = (() => {
  let userAgent = navigator.userAgent;
  return userAgent.indexOf("MSIE ") === -1 && userAgent.indexOf("Trident/") === -1;
})();

// keyCodes and charCodes are similar but not the same.;
function keyCodeForChar(letter) {
  let keyCode;
  switch (letter) {
    case '.':
      keyCode = KEY_CODES['.'];
      break;
    case '\n':
      keyCode = KEY_CODES.ENTER;
      break;
    default:
      keyCode = letter.charCodeAt(0);
  }
  return keyCode;
}

function _insertTextIntoDOM(letter) {
  if (canExecCommandInsertText) {
    document.execCommand('insertText', false, letter);
  } else {
    // Without execCommand('insertText'), creating a text node and inserting
    // it manually is used instead. First find the current cursor location and
    // append a textNode to it.
    var selection = window.getSelection();
    var range = selection.getRangeAt(0);
    var textNode = document.createTextNode(letter);
    range.insertNode(textNode);
    selection.removeAllRanges();
    // Next move the cursor forward to the next position, as if the user was
    // typing normally.
    let nextCursorRange = document.createRange();
    nextCursorRange.setStart(textNode, textNode.length);
    selection.addRange(nextCursorRange);
  }
}

function insertText(editor, string) {
  if (!string && editor) { throw new Error('Must pass `editor` to `insertText`'); }

  string.split('').forEach(letter => {
    let stop = false;
    let keyCode = keyCodeForChar(letter);
    let keydown = createMockEvent('keydown', editor.element, {
      keyCode,
      preventDefault() { stop = true; }
    });
    let keyup = createMockEvent('keyup', editor.element, {
      keyCode,
      preventDefault() { stop = true; }
    });
    let input = createMockEvent('input', editor.element, {
      preventDefault() { stop = true; }
    });

    editor.triggerEvent(editor.element, 'keydown', keydown);
    if (stop) {
      return;
    }
    _insertTextIntoDOM(letter);
    editor.triggerEvent(editor.element, 'input', input);
    if (stop) {
      return;
    }
    editor.triggerEvent(editor.element, 'keyup', keyup);
  });
}

// triggers a key sequence like cmd-B on the editor, to test out
// registered keyCommands
function triggerKeyCommand(editor, string, modifier) {
  let keyEvent = createMockEvent('keydown', editor.element, {
    keyCode: string.toUpperCase().charCodeAt(0),
    metaKey: modifier === MODIFIERS.META,
    ctrlKey: modifier === MODIFIERS.CTRL
  });
  editor.triggerEvent(editor.element, 'keydown', keyEvent);
}

function triggerRightArrowKey(editor, modifier) {
  if (!editor) { throw new Error('Must pass editor to triggerRightArrowKey'); }
  let keydown = createMockEvent('keydown', editor.element, {
    keyCode: KEY_CODES.RIGHT,
    shiftKey: modifier === MODIFIERS.SHIFT
  });
  let keyup = createMockEvent('keyup', editor.element, {
    keyCode: KEY_CODES.RIGHT,
    shiftKey: modifier === MODIFIERS.SHIFT
  });
  editor.triggerEvent(editor.element, 'keydown', keydown);
  editor.triggerEvent(editor.element, 'keyup', keyup);
}

function triggerLeftArrowKey(editor, modifier) {
  if (!editor) { throw new Error('Must pass editor to triggerLeftArrowKey'); }
  let keydown = createMockEvent('keydown', editor.element, {
    keyCode: KEY_CODES.LEFT,
    shiftKey: modifier === MODIFIERS.SHIFT
  });
  let keyup = createMockEvent('keyup', editor.element, {
    keyCode: KEY_CODES.LEFT,
    shiftKey: modifier === MODIFIERS.SHIFT
  });
  editor.triggerEvent(editor.element, 'keydown', keydown);
  editor.triggerEvent(editor.element, 'keyup', keyup);
}

// Allows our fake copy and paste events to communicate with each other.
const lastCopyData = {};
function triggerCopyEvent(editor) {
  let event = createMockEvent('copy', editor.element, {
    clipboardData: {
      setData(type, value) { lastCopyData[type] = value; }
    }
  });
  editor.triggerEvent(editor.element, 'copy', event);
}

function triggerCutEvent(editor) {
  let event = createMockEvent('copy', editor.element, {
    clipboardData: {
      setData(type, value) { lastCopyData[type] = value; }
    }
  });
  editor.triggerEvent(editor.element, 'cut', event);
}

function triggerPasteEvent(editor) {
  let event = createMockEvent('copy', editor.element, {
    clipboardData: {
      getData(type) { return lastCopyData[type]; }
    }
  });
  editor.triggerEvent(editor.element, 'paste', event);
}

function getCopyData(type) {
  return lastCopyData[type];
}

function setCopyData(type, value) {
  lastCopyData[type] = value;
}

function clearCopyData() {
  Object.keys(lastCopyData).forEach(key => {
    delete lastCopyData[key];
  });
}

function fromHTML(html) {
  html = $.trim(html);
  let div = document.createElement('div');
  div.innerHTML = html;
  return div;
}

const DOMHelper = {
  moveCursorTo,
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
  triggerKeyCommand,
  triggerRightArrowKey,
  triggerLeftArrowKey,
  triggerCopyEvent,
  triggerCutEvent,
  triggerPasteEvent,
  getCopyData,
  setCopyData,
  clearCopyData,
  createMockEvent
};

export { triggerEvent };

export default DOMHelper;
