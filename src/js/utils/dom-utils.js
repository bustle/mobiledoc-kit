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

function clearChildNodes(element) {
  while (element.childNodes.length) {
    element.removeChild(element.childNodes[0]);
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

function forEachChildNode(element, callback) {
  for (let i=0; i<element.childNodes.length; i++) {
    callback(element.childNodes[i]);
  }
}

export {
  detectParentNode,
  containsNode,
  clearChildNodes,
  forEachChildNode
};
