'use strict';

var _arrayUtils = require('./array-utils');

var NODE_TYPES = {
  ELEMENT: 1,
  TEXT: 3,
  COMMENT: 8
};

exports.NODE_TYPES = NODE_TYPES;
function isTextNode(node) {
  return node.nodeType === NODE_TYPES.TEXT;
}

function isCommentNode(node) {
  return node.nodeType === NODE_TYPES.COMMENT;
}

function isElementNode(node) {
  return node.nodeType === NODE_TYPES.ELEMENT;
}

// perform a pre-order tree traversal of the dom, calling `callbackFn(node)`
// for every node for which `conditionFn(node)` is true
function walkDOM(topNode) {
  var callbackFn = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];
  var conditionFn = arguments.length <= 2 || arguments[2] === undefined ? function () {
    return true;
  } : arguments[2];

  var currentNode = topNode;

  if (conditionFn(currentNode)) {
    callbackFn(currentNode);
  }

  currentNode = currentNode.firstChild;

  while (currentNode) {
    walkDOM(currentNode, callbackFn, conditionFn);
    currentNode = currentNode.nextSibling;
  }
}

function walkTextNodes(topNode) {
  var callbackFn = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

  var conditionFn = function conditionFn(node) {
    return isTextNode(node);
  };
  walkDOM(topNode, callbackFn, conditionFn);
}

function clearChildNodes(element) {
  while (element.childNodes.length) {
    element.removeChild(element.childNodes[0]);
  }
}

/**
 * @return {Boolean} true when the child node is contained or the same as
 * (e.g., inclusive containment)  the parent node
 *  see https://github.com/webmodules/node-contains/blob/master/index.js
 *  Mimics the behavior of `Node.contains`, which is broken in IE 10
 *  @private
 */
function containsNode(parentNode, childNode) {
  if (parentNode === childNode) {
    return true;
  }
  var position = parentNode.compareDocumentPosition(childNode);
  return !!(position & Node.DOCUMENT_POSITION_CONTAINED_BY);
}

/**
 * converts the element's NamedNodeMap of attrs into
 * an object with key-value pairs
 * @param {DOMNode} element
 * @return {Object} key-value pairs
 * @private
 */
function getAttributes(element) {
  var result = {};
  if (element.hasAttributes()) {
    (0, _arrayUtils.forEach)(element.attributes, function (_ref) {
      var name = _ref.name;
      var value = _ref.value;

      result[name] = value;
    });
  }
  return result;
}

function addClassName(element, className) {
  element.classList.add(className);
}

function removeClassName(element, className) {
  element.classList.remove(className);
}

function normalizeTagName(tagName) {
  return tagName.toLowerCase();
}

function parseHTML(html) {
  var div = document.createElement('div');
  div.innerHTML = html;
  return div;
}

function serializeHTML(node) {
  var div = document.createElement('div');
  div.appendChild(node);
  return div.innerHTML;
}

exports.containsNode = containsNode;
exports.clearChildNodes = clearChildNodes;
exports.getAttributes = getAttributes;
exports.walkDOM = walkDOM;
exports.walkTextNodes = walkTextNodes;
exports.addClassName = addClassName;
exports.removeClassName = removeClassName;
exports.normalizeTagName = normalizeTagName;
exports.isTextNode = isTextNode;
exports.isCommentNode = isCommentNode;
exports.isElementNode = isElementNode;
exports.parseHTML = parseHTML;
exports.serializeHTML = serializeHTML;