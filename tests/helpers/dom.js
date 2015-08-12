const TEXT_NODE = 3;

import { clearSelection } from 'content-kit-editor/utils/selection-utils';
import { walkDOMUntil } from 'content-kit-editor/utils/dom-utils';
import KEY_CODES from 'content-kit-editor/utils/keycodes';
import isPhantom from './is-phantom';

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
    return (el) => el.nodeType === TEXT_NODE && el.textContent.indexOf(text) !== -1;
  };
  const startTextNode = walkDOMUntil(startContainingElement, findTextNode(startText));
  const endTextNode   = walkDOMUntil(endContainingElement,   findTextNode(endText));

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
  selectRange(node, offset, endNode, endOffset);
}

function triggerEvent(node, eventType) {
  if (!node) { throw new Error(`Attempted to trigger event "${eventType}" on undefined node`); }

  let clickEvent = document.createEvent('MouseEvents');
  clickEvent.initEvent(eventType, true, true);
  return node.dispatchEvent(clickEvent);
}

function createKeyEvent(eventType, keyCode) {
  let oEvent = document.createEvent('KeyboardEvent');
  if (oEvent.initKeyboardEvent) {
    oEvent.initKeyboardEvent(eventType, true, true, window, 0, 0, 0, 0, 0, keyCode);
  } else if (oEvent.initKeyEvent) {
    oEvent.initKeyEvent(eventType, true, true, window, 0, 0, 0, 0, 0, keyCode);
  }

  // Hack for Chrome to force keyCode/which value
  try {
    Object.defineProperty(oEvent, 'keyCode', {get: function() { return keyCode; }});
    Object.defineProperty(oEvent, 'which', {get: function() { return keyCode; }});
  } catch(e) {
    // FIXME
    // PhantomJS/webkit will throw an error "ERROR: Attempting to change access mechanism for an unconfigurable property"
    // see https://bugs.webkit.org/show_bug.cgi?id=36423
  }

  if (oEvent.keyCode !== keyCode || oEvent.which !== keyCode) {
    throw new Error(`Failed to create key event with keyCode ${keyCode}. \`keyCode\`: ${oEvent.keyCode}, \`which\`: ${oEvent.which}`);
  }

  return oEvent;
}

function triggerKeyEvent(node, eventType, keyCode=KEY_CODES.ENTER) {
  let oEvent = createKeyEvent(eventType, keyCode);
  return node.dispatchEvent(oEvent);
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
 * makeDOM(t =>
 *   t('div', attributes={}, children=[
 *     t('b', {}, [
 *       t.text('I am a bold text node')
 *     ])
 *   ])
 * );
 */
function makeDOM(tree) {
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
    const {
      anchorNode, anchorOffset,
      focusNode, focusOffset
    } = selection;

    if (anchorNode !== focusNode) {
      // FIXME
      throw new Error('Unable to get selected text when multiple nodes are selected');
    } else {
      return anchorNode.textContent.slice(anchorOffset, focusOffset);
    }
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

function triggerDelete(editor) {
  if (isPhantom()) {
    // simulate deletion for phantomjs
    let event = { preventDefault() {} };
    editor.handleDeletion(event);
  } else {
    triggerKeyEvent(document, 'keydown', KEY_CODES.DELETE);
  }
}

function triggerEnter(editor) {
  if (isPhantom()) {
    // simulate event when testing with phantom
    let event = { preventDefault() {} };
    editor.handleNewline(event);
  } else {
    triggerKeyEvent(document, 'keydown', KEY_CODES.ENTER);
  }
}

const DOMHelper = {
  moveCursorTo,
  selectText,
  clearSelection,
  triggerEvent,
  triggerKeyEvent,
  makeDOM,
  KEY_CODES,
  getCursorPosition,
  getSelectedText,
  triggerDelete,
  triggerEnter
};

export { triggerEvent };

export default DOMHelper;
