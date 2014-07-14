function getDirectionOfSelection(selection) {
  var position = selection.anchorNode.compareDocumentPosition(selection.focusNode);
  if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
    return SelectionDirection.LEFT_TO_RIGHT;
  } else if (position & Node.DOCUMENT_POSITION_PRECEDING) {
    return SelectionDirection.RIGHT_TO_LEFT;
  }
  return SelectionDirection.SAME_NODE;
}

function getCurrentSelectionNode(selection) {
  selection = selection || window.getSelection();
  var node = getDirectionOfSelection(selection) === SelectionDirection.LEFT_TO_RIGHT ? selection.anchorNode : selection.focusNode;
  return node && (node.nodeType === 3 ? node.parentNode : node);
}

function getCurrentSelectionRootNode() {
  var node = getCurrentSelectionNode();
  var tag = node.tagName;
  while (tag && RootTags.indexOf(tag) === -1) {
    if (node.contentEditable === 'true') { break; } // Stop traversing up dom when hitting an editor element
    node = node.parentNode;
    tag = node.tagName;
  }
  return node;
}

function getCurrentSelectionTag() {
  var node = getCurrentSelectionNode();
  return node ? node.tagName : null;
}

function getCurrentSelectionRootTag() {
  var node = getCurrentSelectionRootNode();
  return node ? node.tagName : null;
}

function tagsInSelection(selection) {
  var node = getCurrentSelectionNode(selection);
  var tags = [];
  if (!selection.isCollapsed) {
    while(node) {
      if (node.contentEditable === 'true') { break; } // Stop traversing up dom when hitting an editor element
      if (node.tagName) {
        tags.push(node.tagName);
      }
      node = node.parentNode;
    }
  }
  return tags;
}

function moveCursorToBeginningOfSelection(selection) {
  var range = document.createRange();
  var node  = selection.anchorNode;
  range.setStart(node, 0);
  range.setEnd(node, 0);
  selection.removeAllRanges();
  selection.addRange(range);
}

function restoreRange(range) {
  var selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

function selectNode(node) {
  var range = document.createRange();
  var selection = window.getSelection();
  range.setStart(node, 0);
  range.setEnd(node, node.length);
  selection.removeAllRanges();
  selection.addRange(range);
}
