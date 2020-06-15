import RenderNode from '../models/render-node'
import ElementMap from '../utils/element-map'

interface Post {
  renderNode: RenderNode
}

export default class RenderTree {
  _rootNode: RenderNode
  _elements: ElementMap<RenderNode>

  constructor(rootPostNode: Post) {
    this._rootNode = this.buildRenderNode(rootPostNode)
    this._elements = new ElementMap()
  }
  /*
   * @return {RenderNode} The root render node in this tree
   */
  get rootNode() {
    return this._rootNode
  }
  /**
   * @return {Boolean}
   */
  get isDirty() {
    return this.rootNode && this.rootNode.isDirty
  }
  /*
   * @return {DOMNode} The root DOM element in this tree
   */
  get rootElement() {
    return this.rootNode.element
  }
  /*
   * @param {DOMNode} element
   * @return {RenderNode} The renderNode for this element, if any
   */
  getElementRenderNode(element: Element) {
    return this._elements.get(element)
  }
  setElementRenderNode(element: Element, renderNode: RenderNode) {
    this._elements.set(element, renderNode)
  }
  removeElementRenderNode(element: Element) {
    this._elements.remove(element)
  }
  /**
   * @param {DOMNode} element
   * Walk up from the dom element until we find a renderNode element
   */
  findRenderNodeFromElement(element: Element, conditionFn: (node: RenderNode) => boolean = () => true) {
    let renderNode: RenderNode | null
    let _element: Element | null = element

    while (_element) {
      renderNode = this.getElementRenderNode(_element)
      if (renderNode && conditionFn(renderNode)) {
        return renderNode
      }

      // continue loop
      _element = _element.parentElement

      // stop if we are at the root element
      if (_element === this.rootElement) {
        if (conditionFn(this.rootNode)) {
          return this.rootNode
        } else {
          return
        }
      }
    }
  }

  buildRenderNode(postNode: Post) {
    const renderNode = new RenderNode(postNode, this)
    postNode.renderNode = renderNode
    return renderNode
  }
}
