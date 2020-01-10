'use strict';

var _utilsKey = require('../utils/key');

var _utilsDomUtils = require('../utils/dom-utils');

function clearSelection() {
  window.getSelection().removeAllRanges();
}

function textNodeRects(node) {
  var range = document.createRange();
  range.setEnd(node, node.nodeValue.length);
  range.setStart(node, 0);
  return range.getClientRects();
}

function findOffsetInTextNode(node, coords) {
  var len = node.nodeValue.length;
  var range = document.createRange();
  for (var i = 0; i < len; i++) {
    range.setEnd(node, i + 1);
    range.setStart(node, i);
    var rect = range.getBoundingClientRect();
    if (rect.top === rect.bottom) {
      continue;
    }
    if (rect.left <= coords.left && rect.right >= coords.left && rect.top <= coords.top && rect.bottom >= coords.top) {
      return { node: node, offset: i + (coords.left >= (rect.left + rect.right) / 2 ? 1 : 0) };
    }
  }
  return { node: node, offset: 0 };
}

/*
 * @param {Object} coords with `top` and `left`
 * @see https://github.com/ProseMirror/prosemirror/blob/4c22e3fe97d87a355a0534e25d65aaf0c0d83e57/src/edit/dompos.js
 * @return {Object} {node, offset}
 */
/* eslint-disable complexity */
function findOffsetInNode(_x, _x2) {
  var _again = true;

  _function: while (_again) {
    var node = _x,
        coords = _x2;
    _again = false;

    var closest = undefined,
        dyClosest = 1e8,
        coordsClosest = undefined,
        offset = 0;
    for (var child = node.firstChild; child; child = child.nextSibling) {
      var rects = undefined;
      if ((0, _utilsDomUtils.isElementNode)(child)) {
        rects = child.getClientRects();
      } else if ((0, _utilsDomUtils.isTextNode)(child)) {
        rects = textNodeRects(child);
      } else {
        continue;
      }

      for (var i = 0; i < rects.length; i++) {
        var rect = rects[i];
        if (rect.left <= coords.left && rect.right >= coords.left) {
          var dy = rect.top > coords.top ? rect.top - coords.top : rect.bottom < coords.top ? coords.top - rect.bottom : 0;
          if (dy < dyClosest) {
            closest = child;
            dyClosest = dy;
            coordsClosest = dy ? { left: coords.left, top: rect.top } : coords;
            if ((0, _utilsDomUtils.isElementNode)(child) && !child.firstChild) {
              offset = i + (coords.left >= (rect.left + rect.right) / 2 ? 1 : 0);
            }
            continue;
          }
        }
        if (!closest && (coords.top >= rect.bottom || coords.top >= rect.top && coords.left >= rect.right)) {
          offset = i + 1;
        }
      }
    }
    if (!closest) {
      return { node: node, offset: offset };
    }
    if ((0, _utilsDomUtils.isTextNode)(closest)) {
      return findOffsetInTextNode(closest, coordsClosest);
    }
    if (closest.firstChild) {
      _x = closest;
      _x2 = coordsClosest;
      _again = true;
      closest = dyClosest = coordsClosest = offset = child = rects = i = rect = dy = undefined;
      continue _function;
    }
    return { node: node, offset: offset };
  }
}
/* eslint-enable complexity */

function constrainNodeTo(node, parentNode, existingOffset) {
  var compare = parentNode.compareDocumentPosition(node);
  if (compare & Node.DOCUMENT_POSITION_CONTAINED_BY) {
    // the node is inside parentNode, do nothing
    return { node: node, offset: existingOffset };
  } else if (compare & Node.DOCUMENT_POSITION_CONTAINS) {
    // the node contains parentNode. This shouldn't happen.
    return { node: node, offset: existingOffset };
  } else if (compare & Node.DOCUMENT_POSITION_PRECEDING) {
    // node is before parentNode. return start of deepest first child
    var child = parentNode.firstChild;
    while (child.firstChild) {
      child = child.firstChild;
    }
    return { node: child, offset: 0 };
  } else if (compare & Node.DOCUMENT_POSITION_FOLLOWING) {
    // node is after parentNode. return end of deepest last child
    var child = parentNode.lastChild;
    while (child.lastChild) {
      child = child.lastChild;
    }

    var offset = (0, _utilsDomUtils.isTextNode)(child) ? child.textContent.length : 1;
    return { node: child, offset: offset };
  } else {
    return { node: node, offset: existingOffset };
  }
}

/*
 * Returns a new selection that is constrained within parentNode.
 * If the anchorNode or focusNode are outside the parentNode, they are replaced with the beginning
 * or end of the parentNode's children
 */
function constrainSelectionTo(selection, parentNode) {
  var _constrainNodeTo = constrainNodeTo(selection.anchorNode, parentNode, selection.anchorOffset);

  var anchorNode = _constrainNodeTo.node;
  var anchorOffset = _constrainNodeTo.offset;

  var _constrainNodeTo2 = constrainNodeTo(selection.focusNode, parentNode, selection.focusOffset);

  var focusNode = _constrainNodeTo2.node;
  var focusOffset = _constrainNodeTo2.offset;

  return { anchorNode: anchorNode, anchorOffset: anchorOffset, focusNode: focusNode, focusOffset: focusOffset };
}

function comparePosition(_x3) {
  var _again2 = true;

  _function2: while (_again2) {
    var selection = _x3;
    _again2 = false;
    var anchorNode = selection.anchorNode;
    var focusNode = selection.focusNode;
    var anchorOffset = selection.anchorOffset;
    var focusOffset = selection.focusOffset;

    var headNode = undefined,
        tailNode = undefined,
        headOffset = undefined,
        tailOffset = undefined,
        direction = undefined;

    var position = anchorNode.compareDocumentPosition(focusNode);

    // IE may select return focus and anchor nodes far up the DOM tree instead of
    // picking the deepest, most specific possible node. For example in
    //
    //     <div><span>abc</span><span>def</span></div>
    //
    // with a cursor between c and d, IE might say the focusNode is <div> with
    // an offset of 1. However the anchorNode for a selection might still be
    // <span> 2 if there was a selection.
    //
    // This code walks down the DOM tree until a good comparison of position can be
    // made.
    //
    if (position & Node.DOCUMENT_POSITION_CONTAINS) {
      if (focusOffset < focusNode.childNodes.length) {
        focusNode = focusNode.childNodes[focusOffset];
        focusOffset = 0;
      } else {
        // This situation happens on IE when triple-clicking to select.
        // Set the focus to the very last character inside the node.
        while (focusNode.lastChild) {
          focusNode = focusNode.lastChild;
        }
        focusOffset = focusNode.textContent.length;
      }

      _x3 = {
        focusNode: focusNode,
        focusOffset: focusOffset,
        anchorNode: anchorNode, anchorOffset: anchorOffset
      };
      _again2 = true;
      anchorNode = focusNode = anchorOffset = focusOffset = headNode = tailNode = headOffset = tailOffset = direction = position = undefined;
      continue _function2;
    } else if (position & Node.DOCUMENT_POSITION_CONTAINED_BY) {
      var offset = anchorOffset - 1;
      if (offset < 0) {
        offset = 0;
      }
      _x3 = {
        anchorNode: anchorNode.childNodes[offset],
        anchorOffset: 0,
        focusNode: focusNode, focusOffset: focusOffset
      };
      _again2 = true;
      anchorNode = focusNode = anchorOffset = focusOffset = headNode = tailNode = headOffset = tailOffset = direction = position = offset = undefined;
      continue _function2;

      // The meat of translating anchor and focus nodes to head and tail nodes
    } else if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
        headNode = anchorNode;tailNode = focusNode;
        headOffset = anchorOffset;tailOffset = focusOffset;
        direction = _utilsKey.DIRECTION.FORWARD;
      } else if (position & Node.DOCUMENT_POSITION_PRECEDING) {
        headNode = focusNode;tailNode = anchorNode;
        headOffset = focusOffset;tailOffset = anchorOffset;
        direction = _utilsKey.DIRECTION.BACKWARD;
      } else {
        // same node
        headNode = tailNode = anchorNode;
        headOffset = anchorOffset;
        tailOffset = focusOffset;
        if (tailOffset < headOffset) {
          // Swap the offset order
          headOffset = focusOffset;
          tailOffset = anchorOffset;
          direction = _utilsKey.DIRECTION.BACKWARD;
        } else if (headOffset < tailOffset) {
          direction = _utilsKey.DIRECTION.FORWARD;
        } else {
          direction = null;
        }
      }

    return { headNode: headNode, headOffset: headOffset, tailNode: tailNode, tailOffset: tailOffset, direction: direction };
  }
}

exports.clearSelection = clearSelection;
exports.comparePosition = comparePosition;
exports.findOffsetInNode = findOffsetInNode;
exports.constrainSelectionTo = constrainSelectionTo;