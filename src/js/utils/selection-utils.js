import {
  containsNode,
  normalizeTagName
} from './dom-utils';

var SelectionDirection = {
  LEFT_TO_RIGHT : 1,
  RIGHT_TO_LEFT : 2,
  SAME_NODE     : 3
};

function clearSelection() {
  // FIXME-IE ensure this works on IE 9. It works on IE10.
  window.getSelection().removeAllRanges();
}

function comparePosition(selection) {
  let { anchorNode, focusNode, anchorOffset, focusOffset } = selection;
  let headNode, tailNode, headOffset, tailOffset;

  const position = anchorNode.compareDocumentPosition(focusNode);

  if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
    headNode = anchorNode; tailNode = focusNode;
    headOffset = anchorOffset; tailOffset = focusOffset;
  } else if (position & Node.DOCUMENT_POSITION_PRECEDING) {
    headNode = focusNode; tailNode = anchorNode;
    headOffset = focusOffset; tailOffset = anchorOffset;
  } else { // same node
    headNode = anchorNode;
    tailNode = focusNode;
    headOffset = Math.min(anchorOffset, focusOffset);
    tailOffset = Math.max(anchorOffset, focusOffset);
  }

  return {headNode, headOffset, tailNode, tailOffset};
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

function getSelectionTagName() {
  var element = getSelectionElement();
  return element ? normalizeTagName(element.tagName) : null;
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
  getSelectionTagName,
  tagsInSelection,
  restoreRange,
  selectNode,
  containsNode,
  clearSelection,
  comparePosition
};
