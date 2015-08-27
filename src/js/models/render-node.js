import LinkedItem from 'content-kit-editor/utils/linked-item';
import LinkedList from 'content-kit-editor/utils/linked-list';
import { containsNode } from 'content-kit-editor/utils/dom-utils';

export default class RenderNode extends LinkedItem {
  constructor(postNode) {
    super();
    this.parent = null;
    this.isDirty = true;
    this.isRemoved = false;
    this.postNode = postNode;
    this._childNodes = null;
    this.element = null;
  }
  isAttached() {
    const rootElement = this.renderTree.node.element;
    if (!this.element) {
      throw new Error('Cannot check if a renderNode is attached without an element.');
    }
    return containsNode(rootElement, this.element);
  }
  get childNodes() {
    if (!this._childNodes) {
      this._childNodes = new LinkedList({
        adoptItem: item => {
          item.parent = this;
          item.renderTree = this.renderTree;
        },
        freeItem: item => {
          item.parent = null;
          item.renderTree = null;
        }
      });
    }
    return this._childNodes;
  }
  scheduleForRemoval() {
    this.isRemoved = true;
    if (this.parent) {
      this.parent.markDirty();
    }
  }
  markDirty() {
    this.isDirty = true;
    if (this.parent) {
      this.parent.markDirty();
    }
  }
  markClean() {
    this.isDirty = false;
  }
}
