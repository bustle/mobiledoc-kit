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

function getElementOffset(element) {
  var offset = { left: 0, top: 0 };
  var elementStyle = window.getComputedStyle(element);

  if (elementStyle.position === 'relative') {
    offset.left = parseInt(elementStyle['margin-left'], 10);
    offset.top  = parseInt(elementStyle['margin-top'], 10);
  }
  return offset;
}

function createDiv(className) {
  var div = document.createElement('div');
  if (className) {
    div.className = className;
  }
  return div;
}

function extend(object, updates) {
  updates = updates || {};
  for(var o in updates) {
    if (updates.hasOwnProperty(o)) {
      object[o] = updates[o];
    }
  }
  return object;
}

function applyConstructorProperties(instance, props) {
  for(var p in props) {
    if (props.hasOwnProperty(p)) {
      instance[p] = props[p];
    }
  }
}

function inherits(Subclass, Superclass) {
  Subclass._super = Superclass;
  Subclass.prototype = Object.create(Superclass.prototype, {
    constructor: {
      value: Subclass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
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
