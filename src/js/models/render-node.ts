import LinkedItem from '../utils/linked-item'
import LinkedList from '../utils/linked-list'
import { containsNode } from '../utils/dom-utils'
import assert, { unwrap } from '../utils/assert'
import RenderTree from './render-tree'
import { Option } from '../utils/types'
import CardNode from './card-node'
import AtomNode from './atoms/atom-node'
import Section from './_section'
import Markuperable from '../utils/markuperable'
import { PostNode } from './post-node-builder'

export default class RenderNode<T extends Node = Node> extends LinkedItem {
  parent: Option<RenderNode> = null
  isDirty = true
  isRemoved = false

  postNode: Option<PostNode>
  renderTree: Option<RenderTree>

  // RenderNodes for Markers keep track of their markupElement
  markupElement: Option<Node> = null

  // RenderNodes for Atoms use these properties
  headTextNode: Option<Text> = null
  tailTextNode: Option<Text> = null
  atomNode: Option<AtomNode> = null

  // RenderNodes for cards use this property
  cardNode: Option<CardNode> = null

  _childNodes: Option<LinkedList<RenderNode>> = null
  _element: Option<T> = null
  _cursorElement: Option<Node> = null // blank render nodes need a cursor element

  constructor(postNode: PostNode, renderTree: RenderTree) {
    super()
    this.postNode = postNode
    this.renderTree = renderTree
  }

  isAttached() {
    assert('Cannot check if a renderNode is attached without an element.', !!this.element)
    return containsNode(unwrap(unwrap(this.renderTree).rootElement), this.element)
  }

  get childNodes(): LinkedList<RenderNode> {
    if (!this._childNodes) {
      this._childNodes = new LinkedList({
        adoptItem: item => (item.parent = this),
        freeItem: item => item.destroy(),
      })
    }
    return this._childNodes
  }

  scheduleForRemoval() {
    this.isRemoved = true
    if (this.parent) {
      this.parent.markDirty()
    }
  }

  markDirty() {
    this.isDirty = true
    if (this.parent) {
      this.parent.markDirty()
    }
  }

  get isRendered() {
    return !!this.element
  }

  markClean() {
    this.isDirty = false
  }

  get element() {
    return this._element
  }

  set element(element) {
    const currentElement = this._element
    this._element = element

    if (currentElement) {
      this.renderTree!.removeElementRenderNode(currentElement)
    }

    if (element) {
      this.renderTree!.setElementRenderNode(element, this)
    }
  }

  set cursorElement(cursorElement: Node | null) {
    this._cursorElement = cursorElement
  }

  get cursorElement() {
    return this._cursorElement || this.element
  }

  destroy() {
    this.element = null
    this.parent = null
    this.postNode = null
    this.renderTree = null
  }

  reparsesMutationOfChildNode(node: Node) {
    if ((this.postNode as Section).isCardSection) {
      return !containsNode(this.cardNode!.element, node)
    } else if ((this.postNode as Markuperable).isAtom) {
      return !containsNode(this.atomNode!.element, node)
    }
    return true
  }
}
