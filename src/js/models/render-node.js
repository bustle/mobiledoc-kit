import LinkedItem from "content-kit-editor/utils/linked-item";
import LinkedList from "content-kit-editor/utils/linked-list";

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
