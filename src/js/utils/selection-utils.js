import {
  containsNode,
  normalizeTagName
} from './dom-utils';

// TODO: remove, pass in Editor's current block set
var RootTags = [
  'p', 'h2', 'h3', 'blockquote', 'ul', 'ol'
];

var SelectionDirection = {
  LEFT_TO_RIGHT : 1,
  RIGHT_TO_LEFT : 2,
  SAME_NODE     : 3
};

function clearSelection() {
  // FIXME-IE ensure this works on IE 9. It works on IE10.
  window.getSelection().removeAllRanges();
}

function getDirectionOfSelection(selection) {
  var node = selection.anchorNode;
  var position = node && node.compareDocumentPosition(selection.focusNode);
  if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
    return SelectionDirection.LEFT_TO_RIGHT;
  } else if (position & Node.DOCUMENT_POSITION_PRECEDING) {
    return SelectionDirection.RIGHT_TO_LEFT;
  }
  return SelectionDirection.SAME_NODE;
}

function getSelectionElement(selection) {
  selection = selection || window.getSelection();
  // FIXME it used to return `anchorNode` when selection direction is `LEFT_TO_RIGHT`,
  // but I think that was a bug. In Safari and Chrome the selection usually had the
  // same anchorNode and focusNode when selecting text, so it didn't matter.
  var node = getDirectionOfSelection(selection) === SelectionDirection.LEFT_TO_RIGHT ? selection.focusNode : selection.anchorNode;
  return node && (node.nodeType === 3 ? node.parentNode : node);
}

function isSelectionInElement(element) {
  const selection = window.getSelection();
  const { rangeCount, anchorNode, focusNode } = selection;

  const range = (rangeCount > 0) && selection.getRangeAt(0);
  const hasSelection = range && !range.collapsed;

  if (hasSelection) {
    return containsNode(element, anchorNode) &&
      containsNode(element, focusNode);
  } else {
    return false;
  }
}

function getSelectionBlockElement(selection) {
  selection = selection || window.getSelection();
  var element = getSelectionElement();
  let tag = element && normalizeTagName(element.tagName);
  while (tag && RootTags.indexOf(tag) === -1) {
    if (element.contentEditable === 'true') {
      return null; // Stop traversing up dom when hitting an editor element
    }
    element = element.parentNode;
    tag = element.tagName && normalizeTagName(element.tagName);
  }
  return element;
}

function getSelectionTagName() {
  var element = getSelectionElement();
  return element ? normalizeTagName(element.tagName) : null;
}

function getSelectionBlockTagName() {
  var element = getSelectionBlockElement();
  return element ? element.tagName && normalizeTagName(element.tagName) : null;
}

function tagsInSelection(selection) {
  var element = getSelectionElement(selection);
  var tags = [];
  while(element) {
    if (element.contentEditable === 'true') { break; } // Stop traversing up dom when hitting an editor element
    if (element.tagName) {
      tags.push(normalizeTagName(element.tagName));
    }
    element = element.parentNode;
  }
  return tags;
}

function restoreRange(range) {
  clearSelection();
  var selection = window.getSelection();
  selection.addRange(range);
}

function selectNode(node) {
  clearSelection();

  var range = document.createRange();
  range.setStart(node, 0);
  range.setEnd(node, node.length);

  var selection = window.getSelection();
  selection.addRange(range);
}

export {
  getDirectionOfSelection,
  getSelectionElement,
  getSelectionBlockElement,
  getSelectionTagName,
  getSelectionBlockTagName,
  tagsInSelection,
  restoreRange,
  selectNode,
  clearSelection,
  isSelectionInElement
};
