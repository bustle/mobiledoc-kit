import { forEach } from './array-utils'

export const NODE_TYPES = {
  ELEMENT: 1,
  TEXT: 3,
  COMMENT: 8,
}

export function isTextNode(node: Node): node is Text {
  return node.nodeType === NODE_TYPES.TEXT
}

export function isCommentNode(node: Node) {
  return node.nodeType === NODE_TYPES.COMMENT
}

export function isElementNode(node: Node): node is Element {
  return node.nodeType === NODE_TYPES.ELEMENT
}

// perform a pre-order tree traversal of the dom, calling `callbackFn(node)`
// for every node for which `conditionFn(node)` is true
export function walkDOM(
  topNode: Node,
  callbackFn: (node: Node) => void = () => {},
  conditionFn: (node: Node) => boolean = () => true
) {
  let currentNode: Node | null = topNode

  if (conditionFn(currentNode)) {
    callbackFn(currentNode)
  }

  currentNode = currentNode.firstChild

  while (currentNode) {
    walkDOM(currentNode, callbackFn, conditionFn)
    currentNode = currentNode.nextSibling
  }
}

export function walkTextNodes(topNode: Node, callbackFn = () => {}) {
  const conditionFn = (node: Node) => isTextNode(node)
  walkDOM(topNode, callbackFn, conditionFn)
}

export function clearChildNodes(element: Element) {
  while (element.childNodes.length) {
    element.removeChild(element.childNodes[0])
  }
}

/**
 * @return {Boolean} true when the child node is contained or the same as
 * (e.g., inclusive containment)  the parent node
 *  see https://github.com/webmodules/node-contains/blob/master/index.js
 *  Mimics the behavior of `Node.contains`, which is broken in IE 10
 *  @private
 */
export function containsNode(parentNode: Node, childNode: Node) {
  if (parentNode === childNode) {
    return true
  }
  const position = parentNode.compareDocumentPosition(childNode)
  return !!(position & Node.DOCUMENT_POSITION_CONTAINED_BY)
}

/**
 * converts the element's NamedNodeMap of attrs into
 * an object with key-value pairs
 * @param {DOMNode} element
 * @return {Object} key-value pairs
 * @private
 */
export function getAttributes(element: Element) {
  const result: { [key: string]: unknown } = {}
  if (element.hasAttributes()) {
    forEach(element.attributes, ({ name, value }) => {
      result[name] = value
    })
  }
  return result
}

export function addClassName(element: Element, className: string) {
  element.classList.add(className)
}

export function removeClassName(element: Element, className: string) {
  element.classList.remove(className)
}

export function normalizeTagName(tagName: string) {
  return tagName.toLowerCase()
}

export function parseHTML(html: string) {
  const div = document.createElement('div')
  div.innerHTML = html
  return div
}

export function serializeHTML(node: Node) {
  const div = document.createElement('div')
  div.appendChild(node)
  return div.innerHTML
}
