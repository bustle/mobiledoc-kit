const TEXT_NODE = 3;

function moveCursorTo(element, offset) {
  let range = document.createRange();
  range.setStart(element, offset);
  range.setEnd(element, offset);

  let selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}


function walkDOMUntil(topNode, conditionFn=() => {}) {
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
    if (currentElement.nextSibling) {
      stack.push(currentElement.nextSibling);
    }
  }
}


function selectText(text, containingElement) {
  let textNode = walkDOMUntil(containingElement, (el) => {
    if (el.nodeType !== TEXT_NODE) { return; }

    return el.textContent.indexOf(text) !== -1;
  });
  if (!textNode) {
    throw new Error(`Could not find a textNode containing "${text}"`);
  }
  let range = document.createRange();
  let startOffset = textNode.textContent.indexOf(text),
      endOffset   = startOffset + text.length;
  range.setStart(textNode, startOffset);
  range.setEnd(textNode, endOffset);

  let selection = window.getSelection();
  if (selection.rangeCount > 0) { selection.removeAllRanges(); }
  selection.addRange(range);
}

function triggerEvent(node, eventType) {
  if (!node) { throw new Error(`Attempted to trigger event "${eventType}" on undefined node`); }

  let clickEvent = document.createEvent('MouseEvents');
  clickEvent.initEvent(eventType, true, true);
  node.dispatchEvent(clickEvent);
}

// see https://gist.github.com/ejoubaud/7d7c57cda1c10a4fae8c
function createKeyEvent(eventType, key) {
  var oEvent = document.createEvent('KeyboardEvent');

  // Chromium Hack
  Object.defineProperty(oEvent, 'keyCode', {
              get : function() {
                  return this.keyCodeVal;
              }
  });     
  Object.defineProperty(oEvent, 'which', {
              get : function() {
                  return this.keyCodeVal;
              }
  });     

  if (oEvent.initKeyboardEvent) {
      oEvent.initKeyboardEvent(eventType, true, true, document.defaultView, key, key, "", "", false, "");
  } else {
      oEvent.initKeyEvent(eventType, true, true, document.defaultView, false, false, false, false, key, 0);
  }

  oEvent.keyCodeVal = key;

  if (oEvent.keyCode !== key) {
    throw new Error("keyCode mismatch " + oEvent.keyCode + "(" + oEvent.which + ")");
  }

  return oEvent;
}

const ENTER_KEY_CODE = 13;
function triggerKeyEvent(node, eventType, keyCode=ENTER_KEY_CODE) {
  let event = createKeyEvent('keyup', keyCode);

  node.dispatchEvent(event);
}

export default {
  moveCursorTo,
  selectText,
  triggerEvent,
  triggerKeyEvent
};
