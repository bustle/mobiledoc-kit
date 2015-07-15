import RenderNode from 'content-kit-editor/models/render-node';
import ElementMap from "../utils/element-map";

export default class RenderTree {
  constructor(node) {
    this.node = node;
    this.elements = new ElementMap();
  }
  getElementRenderNode(element) {
    return this.elements.get(element);
  }
  buildRenderNode(section) {
    let renderNode = new RenderNode(section);
    renderNode.renderTree = this;
    section.renderNode = renderNode;
    return renderNode;
  }
}
