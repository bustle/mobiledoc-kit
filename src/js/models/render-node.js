export default class RenderNode {
  constructor(postNode) {
    this.parentNode = null;
    this.isDirty = true;
    this.isRemoved = false;
    this.postNode = postNode;

    this.firstChild = null;
    this.nextSibling = null;
    this.previousSibling = null;
  }
  scheduleForRemoval() {
    this.isRemoved = true;
    if (this.parentNode) {
      this.parentNode.markDirty();
    }
  }
  markDirty() {
    this.isDirty = true;
    if (this.parentNode) {
      this.parentNode.markDirty();
    }
  }
  markClean() {
    this.isDirty = false;
  }
  appendChild(child) {
    if (!this.firstChild) {
      this.firstChild = child;
    }
    if (this.lastChild) {
      child.previousSibling = this.lastChild;
      this.lastChild.nextSibling = child;
    }
    this.lastChild = child;
    child.parentNode = this;
    child.renderTree = this.renderTree;
  }
  removeChild(child) {
    if (child.nextSibling) {
      child.nextSibling.previousSibling = child.previousSibling;
    } else {
      this.lastChild = child.previousSibling;
    }
    if (child.previousSibling) {
      child.previousSibling.nextSibling = child.nextSibling;
    } else {
      this.firstChild = child.nextSibling;
    }
  }
  insertAfter(node, previousChild) {
    if (previousChild) {
      node.previousSibling = previousChild;
      if (previousChild.nextSibling) {
        previousChild.nextSibling.previousSibling = node;
        node.nextSibling = previousChild.nextSibling;
      } else {
        this.lastChild = node;
      }
      previousChild.nextSibling = node;
    } else {
      node.nextSibling = this.firstChild;
      if (node.nextSibling) {
        node.nextSibling.previousSibling = node;
      } else {
        this.lastChild = node;
      }
      this.firstChild = node;
    }
    node.parentNode = this;
    node.renderTree = this.renderTree;
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
