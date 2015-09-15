import LinkedItem from 'content-kit-editor/utils/linked-item';
import LinkedList from 'content-kit-editor/utils/linked-list';
import { containsNode } from 'content-kit-editor/utils/dom-utils';

export default class RenderNode extends LinkedItem {
  constructor(postNode, renderTree) {
    super();
    this.parent = null;
    this.isDirty = true;
    this.isRemoved = false;
    this.postNode = postNode;
    this._childNodes = null;
    this._element = null;
    this.renderTree = renderTree;
  }
  isAttached() {
    if (!this.element) {
      throw new Error('Cannot check if a renderNode is attached without an element.');
    }
    return containsNode(this.renderTree.rootElement, this.element);
  }
  get childNodes() {
    if (!this._childNodes) {
      this._childNodes = new LinkedList({
        adoptItem: item => item.parent = this,
        freeItem: item => item.destroy()
      });
    }
    return this._childNodes;
  }
  scheduleForRemoval() {
    this.isRemoved = true;
    if (this.parent) { this.parent.markDirty(); }
  }
  markDirty() {
    this.isDirty = true;
    if (this.parent) { this.parent.markDirty(); }
  }
  markClean() {
    this.isDirty = false;
  }
  set element(element) {
    const currentElement = this._element;
    this._element = element;

    if (currentElement) {
      this.renderTree.removeElementRenderNode(currentElement);
    }

    if (element) {
      this.renderTree.setElementRenderNode(element, this);
    }
  }
  get element() {
    return this._element;
  }
  destroy() {
    this.element = null;
    this.parent = null;
    this.postNode = null;
    this.renderTree = null;
  }
}
