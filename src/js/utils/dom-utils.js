import { forEach } from './array-utils';

const TEXT_NODE_TYPE = 3;

function detectParentNode(element, callback) {
  while (element) {
    const result = callback(element);
    if (result) {
      return {
        element,
        result
      };
    }
    element = element.parentNode;
  }

  return {
    element: null,
    result: null
  };
}

function isTextNode(node) {
  return node.nodeType === TEXT_NODE_TYPE;
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

// walks DOWN the dom from node to childNodes, returning the element
// for which `conditionFn(element)` is true
function walkDOMUntil(topNode, conditionFn=() => {}) {
  if (!topNode) { throw new Error('Cannot call walkDOMUntil without a node'); }
  let stack = [topNode];
  let currentElement;

  while (stack.length) {
    currentElement = stack.pop();

    if (conditionFn(currentElement)) {
      return currentElement;
    }

    forEach(currentElement.childNodes, (el) => stack.push(el));
  }
}

// see https://github.com/webmodules/node-contains/blob/master/index.js
function containsNode(parentNode, childNode) {
  const isSame = () => parentNode === childNode;
  const isContainedBy = () => {
    const position = parentNode.compareDocumentPosition(childNode);
    return !!(position & Node.DOCUMENT_POSITION_CONTAINED_BY);
  };
  return isSame() || isContainedBy();
}

/**
 * converts the element's NamedNodeMap of attrs into
 * an object with key-value pairs
 * FIXME should add a whitelist as a second arg
 */
function getAttributes(element) {
  let result = {};
  if (element.hasAttributes()) {
    let attributes = element.attributes;

    forEach(attributes, ({name,value}) => result[name] = value);
  }
  return result;
}

/**
 * converts the element's NamedNodeMap of attrs into
 * an array of key1,value1,key2,value2,...
 * FIXME should add a whitelist as a second arg
 */
function getAttributesArray(element) {
  let attributes = getAttributes(element);
  let result = [];
  Object.keys(attributes).forEach((key) => {
    result.push(key);
    result.push(attributes[key]);
  });
  return result;
}

function addClassName(element, className) {
  // FIXME-IE IE10+
  element.classList.add(className);
}

export {
  detectParentNode,
  containsNode,
  clearChildNodes,
  getAttributes,
  getAttributesArray,
  walkDOMUntil,
  walkTextNodes,
  addClassName
};
