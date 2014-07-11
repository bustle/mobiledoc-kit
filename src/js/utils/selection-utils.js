function getNodeTagName(node) {
  return node.tagName && node.tagName.toLowerCase() || null;
}

function getDirectionOfSelection(selection) {
  var position = selection.anchorNode.compareDocumentPosition(selection.focusNode);
  if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
    return SelectionDirection.LEFT_TO_RIGHT;
  } else if (position & Node.DOCUMENT_POSITION_PRECEDING) {
    return SelectionDirection.RIGHT_TO_LEFT;
  }
  return SelectionDirection.SAME_NODE;
}

function getCurrentSelectionNode() {
  var selection = window.getSelection();
  var node = getDirectionOfSelection(selection) === SelectionDirection.LEFT_TO_RIGHT ? selection.anchorNode : selection.focusNode;
  return node && (node.nodeType === 3 ? node.parentNode : node);
}

function getCurrentSelectionRootNode() {
  var node = getCurrentSelectionNode(),
      tag = getNodeTagName(node);
  while (tag && RootTags.indexOf(tag) === -1) {
    if (node.contentEditable === 'true') { break; } // Stop traversing up dom when hitting an editor element
    node = node.parentNode;
    tag = getNodeTagName(node);
  }
  return node;
}

function getCurrentSelectionTag() {
  return getNodeTagName(getCurrentSelectionNode());
}

function getCurrentSelectionRootTag() {
  return getNodeTagName(getCurrentSelectionRootNode());
}

function tagsInSelection(selection) {
  var node = selection.focusNode.parentNode,
      tags = [];
  if (!selection.isCollapsed) {
    while(node) {
      if (node.contentEditable === 'true') { break; } // Stop traversing up dom when hitting an editor element
      if (node.tagName) {
        tags.push(node.tagName.toLowerCase());
      }
      node = node.parentNode;
    }
  }
  return tags;
}

function moveCursorToBeginningOfSelection(selection) {
  var range = document.createRange(),
      node  = selection.anchorNode;
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
  var range = document.createRange(),
      selection = window.getSelection();
  range.setStart(node, 0);
  range.setEnd(node, node.length);
  selection.removeAllRanges();
  selection.addRange(range);
}
