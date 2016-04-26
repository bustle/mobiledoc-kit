import LinkedItem from 'mobiledoc-kit/utils/linked-item';
import LinkedList from 'mobiledoc-kit/utils/linked-list';
import { containsNode } from 'mobiledoc-kit/utils/dom-utils';
import assert from 'mobiledoc-kit/utils/assert';

export default class RenderNode extends LinkedItem {
  constructor(postNode, renderTree) {
    super();
    this.parent = null;
    this.isDirty = true;
    this.isRemoved = false;
    this.postNode = postNode;
    this._childNodes = null;
    this._element = null;
    this._cursorElement = null; // blank render nodes need a cursor element
    this.renderTree = renderTree;

    // RenderNodes for Markers keep track of their markupElement
    this.markupElement = null;

    // RenderNodes for Atoms use these properties
    this.headTextNode = null;
    this.tailTextNode = null;
    this.atomNode = null;

    // RenderNodes for cards use this property
    this.cardNode = null;
  }
  isAttached() {
    assert('Cannot check if a renderNode is attached without an element.',
           !!this.element);
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
  get isRendered() {
    return !!this.element;
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
  set cursorElement(cursorElement) {
    this._cursorElement = cursorElement;
  }
  get cursorElement() {
    return this._cursorElement || this.element;
  }
  destroy() {
    this.element = null;
    this.parent = null;
    this.postNode = null;
    this.renderTree = null;
  }
  reparsesMutationOfChildNode(node) {
    if (this.postNode.isCardSection) {
      return !containsNode(this.cardNode.element, node);
    } else if (this.postNode.isAtom) {
      return !containsNode(this.atomNode.element, node);
    }
    return true;
  }
}
