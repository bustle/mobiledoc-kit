import RenderNode from 'content-kit-editor/models/render-node';
import ElementMap from "../utils/element-map";

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
  buildRenderNode(postNode) {
    const renderNode = new RenderNode(postNode, this);
    postNode.renderNode = renderNode;
    return renderNode;
  }
}
