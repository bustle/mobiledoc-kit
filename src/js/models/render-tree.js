import RenderNode from 'mobiledoc-kit/models/render-node';
import ElementMap from '../utils/element-map';

export default class RenderTree {
  constructor(rootPostNode) {
    this._rootNode = this.buildRenderNode(rootPostNode);
    this._elements = new ElementMap();
  }
  /*
   * @return {RenderNode} The root render node in this tree
   */
  get rootNode() {
    return this._rootNode;
  }
  /**
   * @return {Boolean}
   */
  get isDirty() {
    return this.rootNode && this.rootNode.isDirty;
  }
  /*
   * @return {DOMNode} The root DOM element in this tree
   */
  get rootElement() {
    return this.rootNode.element;
  }
  /*
   * @param {DOMNode} element
   * @return {RenderNode} The renderNode for this element, if any
   */
  getElementRenderNode(element) {
    return this._elements.get(element);
  }
  setElementRenderNode(element, renderNode) {
    this._elements.set(element, renderNode);
  }
  removeElementRenderNode(element) {
    this._elements.remove(element);
  }
  /**
   * @param {DOMNode} element
   * Walk up from the dom element until we find a renderNode element
   */
  findRenderNodeFromElement(element, conditionFn=()=>true) {
    let renderNode;
    while (element) {
      renderNode = this.getElementRenderNode(element);
      if (renderNode && conditionFn(renderNode)) {
        return renderNode;
      }

      // continue loop
      element = element.parentNode;

      // stop if we are at the root element
      if (element === this.rootElement) {
        if (conditionFn(this.rootNode)) {
          return this.rootNode;
        } else {
          return;
        }
      }
    }
  }
  buildRenderNode(postNode) {
    const renderNode = new RenderNode(postNode, this);
    postNode.renderNode = renderNode;
    return renderNode;
  }
}
