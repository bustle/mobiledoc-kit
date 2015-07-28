const TEXT_NODE = 3;

import { clearSelection } from 'content-kit-editor/utils/selection-utils';
import { walkDOMUntil } from 'content-kit-editor/utils/dom-utils';
import KEY_CODES from 'content-kit-editor/utils/keycodes';

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

function moveCursorTo(element, offset=0) {
  selectRange(element, offset, element, offset);
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

// returns the node and the offset that the cursor is on
function getCursorPosition() {
  const selection = window.getSelection();
  return {
    node:   selection.anchorNode,
    offset: selection.anchorOffset
  };
}

export default {
  moveCursorTo,
  selectText,
  clearSelection,
  triggerEvent,
  triggerKeyEvent,
  makeDOM,
  KEY_CODES,
  getCursorPosition
};
