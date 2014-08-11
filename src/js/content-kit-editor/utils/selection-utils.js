import { SelectionDirection, RootTags } from '../constants';
import { nodeIsDescendantOfElement } from './element-utils';

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
  var node = getDirectionOfSelection(selection) === SelectionDirection.LEFT_TO_RIGHT ? selection.anchorNode : selection.focusNode;
  return node && (node.nodeType === 3 ? node.parentNode : node);
}

function getSelectionBlockElement(selection) {
  selection = selection || window.getSelection();
  var element = getSelectionElement();
  var tag = element && element.tagName;
  while (tag && RootTags.indexOf(tag) === -1) {
    if (element.contentEditable === 'true') { break; } // Stop traversing up dom when hitting an editor element
    element = element.parentNode;
    tag = element.tagName;
  }
  return element;
}

function getSelectionTagName() {
  var element = getSelectionElement();
  return element ? element.tagName : null;
}

function getSelectionBlockTagName() {
  var element = getSelectionBlockElement();
  return element ? element.tagName : null;
}

function tagsInSelection(selection) {
  var element = getSelectionElement(selection);
  var tags = [];
  if (!selection.isCollapsed) {
    while(element) {
      if (element.contentEditable === 'true') { break; } // Stop traversing up dom when hitting an editor element
      if (element.tagName) {
        tags.push(element.tagName);
      }
      element = element.parentNode;
    }
  }
  return tags;
}

function selectionIsInElement(selection, element) {
  var node = selection.anchorNode;
  return node && nodeIsDescendantOfElement(node, element);
}

function selectionIsEditable(selection) {
  var el = getSelectionBlockElement(selection);
  return el.contentEditable !== 'false';
}

/*
function saveSelection() {
  var sel = window.getSelection();
  var ranges = [], i;
  if (sel.rangeCount) {
    var rangeCount = sel.rangeCount;
    for (i = 0; i < rangeCount; i++) {
      ranges.push(sel.getRangeAt(i));
    }
  }
  return ranges;
}

function restoreSelection(savedSelection) {
  var sel = window.getSelection();
  var len = savedSelection.length, i;
  sel.removeAllRanges();
  for (i = 0; i < len; i++) {
    sel.addRange(savedSelection[i]);
  }
}
*/

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

export { getDirectionOfSelection, getSelectionElement, getSelectionBlockElement, getSelectionTagName,
         getSelectionBlockTagName, tagsInSelection, selectionIsInElement, selectionIsEditable,
         moveCursorToBeginningOfSelection, restoreRange, selectNode };
