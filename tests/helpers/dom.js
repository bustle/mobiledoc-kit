const TEXT_NODE = 3;
const ENTER_KEY_CODE = 13;

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

function createKeyEvent(eventType, keyCode=ENTER_KEY_CODE) {
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

function triggerKeyEvent(node, eventType, keyCode=ENTER_KEY_CODE) {
  let oEvent = createKeyEvent(eventType, keyCode);
  node.dispatchEvent(oEvent);
}

export default {
  moveCursorTo,
  selectText,
  triggerEvent,
  triggerKeyEvent
};
