import { forEach } from './array-utils';

export const NODE_TYPES = {
  ELEMENT: 1,
  TEXT: 3,
  COMMENT: 8
};

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
function walkDOM(topNode, callbackFn=()=>{}, conditionFn=()=>true) {
  let currentNode = topNode;

  if (conditionFn(currentNode)) {
    callbackFn(currentNode);
  }

  currentNode = currentNode.firstChild;

  while (currentNode) {
    walkDOM(currentNode, callbackFn, conditionFn);
    currentNode = currentNode.nextSibling;
  }
}

function walkTextNodes(topNode, callbackFn=()=>{}) {
  const conditionFn = (node) => isTextNode(node);
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
 */
function containsNode(parentNode, childNode) {
  if (parentNode === childNode) {
    return true;
  }
  const position = parentNode.compareDocumentPosition(childNode);
  return !!(position & Node.DOCUMENT_POSITION_CONTAINED_BY);
}

/**
 * converts the element's NamedNodeMap of attrs into
 * an object with key-value pairs
 * @param {DOMNode} element
 * @return {Object} key-value pairs
 */
function getAttributes(element) {
  const result = {};
  if (element.hasAttributes()) {
    forEach(element.attributes, ({name,value}) => {
      result[name] = value;
    });
  }
  return result;
}

function addClassName(element, className) {
  // FIXME-IE IE10+
  element.classList.add(className);
}

function normalizeTagName(tagName) {
  return tagName.toLowerCase();
}

function parseHTML(html) {
  var div = document.createElement('div');
  div.innerHTML = html;
  return div;
}

function closest(el, selector, contentOnly=false) {
  if (!isElementNode(el)) {
    el = el.parentElement;
  }
  var matchesSelector = el.matches || el.webkitMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector;

  if (contentOnly && matchesSelector.call(el, selector)) {
    return null;
  }

  while (el) {
    if (matchesSelector.call(el, selector)) {
      break;
    }
    el = el.parentElement;
  }
  return el;
}

export {
  containsNode,
  clearChildNodes,
  getAttributes,
  walkDOM,
  walkTextNodes,
  addClassName,
  normalizeTagName,
  isTextNode,
  isCommentNode,
  isElementNode,
  parseHTML,
  closest
};
