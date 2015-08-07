import LinkedItem from "content-kit-editor/utils/linked-item";
import LinkedList from "content-kit-editor/utils/linked-list";

export default class RenderNode extends LinkedItem {
  constructor(postNode) {
    super();
    this.parent = null;
    this.isDirty = true;
    this.isRemoved = false;
    this.postNode = postNode;
    this.childNodes = new LinkedList({
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
  appendChild(child) {
    this.childNodes.append(child);
  }
  removeChild(child) {
    this.childNodes.remove(child);
  }
  insertAfter(node, prev) {
    this.childNodes.insertAfter(node, prev);
  }
  set element(element) {
    this._element = element;
    this.renderTree.elements.set(element, this);
    return element;
  }
  get element() {
    return this._element;
  }
}
