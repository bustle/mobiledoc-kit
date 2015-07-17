const TEXT_NODE = 3;

import { clearSelection } from 'content-kit-editor/utils/selection-utils';
import KEY_CODES from 'content-kit-editor/utils/keycodes';

function walkDOMUntil(topNode, conditionFn=() => {}) {
  if (!topNode) { throw new Error('Cannot call walkDOMUntil without a node'); }
  let stack = [topNode];
  let currentElement;

  while (stack.length) {
    currentElement = stack.pop();

    if (conditionFn(currentElement)) {
      return currentElement;
    }

    for (let i=0; i < currentElement.childNodes.length; i++) {
      stack.push(currentElement.childNodes[i]);
    }
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
  node.dispatchEvent(clickEvent);
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
  node.dispatchEvent(oEvent);
}

function makeTextNode(text) {
  return document.createTextNode(text);
}

/**
 * to create a text node use tagName='text', {value:'the text'}
 */
function makeDOM(tagName, attributes={}, children=[]) {
  if (tagName === 'text') { return makeTextNode(attributes.value); }

  let el = document.createElement(tagName);
  Object.keys(attributes).forEach(k => el.setAttribute(k, attributes[k]));
  children.forEach(child => el.appendChild(makeDOM(...child)));

  return el;
}

export default {
  moveCursorTo,
  selectText,
  clearSelection,
  triggerEvent,
  triggerKeyEvent,
  makeDOM
};
