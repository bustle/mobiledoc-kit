import { clearSelection, comparePosition, isFullSelection } from '../utils/selection-utils'
import { containsNode } from '../utils/dom-utils'
import Position from './cursor/position'
import Range, { Direction } from './cursor/range'
import { DIRECTION } from '../utils/key'
import { constrainSelectionTo } from '../utils/selection-utils'
import Editor from '../editor/editor'
import RenderTree from '../models/render-tree'
import Post from '../models/post'
import { unwrap, assertNotNull, expect } from './assert'
import { isCardSection } from '../models/card'
import Section from '../models/_section'

export { Position, Range }

class Cursor {
  editor: Editor
  renderTree: RenderTree
  post: Post

  constructor(editor: Editor) {
    this.editor = editor
    this.renderTree = editor._renderTree
    this.post = editor.post
  }

  clearSelection() {
    clearSelection()
  }

  /**
   * @return {Boolean} true when there is either a collapsed cursor in the
   * editor's element or a selection that is contained in the editor's element
   */
  hasCursor() {
    return this.editor.hasRendered && (this._hasCollapsedSelection() || this._hasSelection())
  }

  hasSelection() {
    return this.editor.hasRendered && this._hasSelection()
  }

  /**
   * @return {Boolean} Can the cursor be on this element?
   */
  isAddressable(element: Element) {
    let { renderTree } = this
    let renderNode = renderTree.findRenderNodeFromElement(element)
    if (renderNode && (renderNode.postNode as Section).isCardSection) {
      let renderedElement = renderNode.element!

      // card sections have addressable text nodes containing &zwnj;
      // as their first and last child
      if (
        element !== renderedElement &&
        element !== renderedElement.firstChild &&
        element !== renderedElement.lastChild
      ) {
        return false
      }
    }

    return !!renderNode
  }

  /*
   * @return {Range} Cursor#Range object
   */
  get offsets() {
    if (!this.hasCursor()) {
      return Range.blankRange()
    }

    let { renderTree } = this
    let parentNode = unwrap(this.editor.element)
    let selection = constrainSelectionTo(this.selection, parentNode)

    const { headNode, headOffset, tailNode, tailOffset, direction } = comparePosition(selection)

    const headPosition = Position.fromNode(renderTree, headNode, headOffset)
    const tailPosition = Position.fromNode(renderTree, tailNode, tailOffset)

    return new Range(headPosition, tailPosition, direction)
  }

  _findNodeForPosition(position: Position) {
    let section = unwrap(position.section)
    let node, offset
    assertNotNull('expected section to have render node', section.renderNode)

    if (isCardSection(section)) {
      offset = 0
      if (position.offset === 0) {
        node = section.renderNode.element!.firstChild
      } else {
        node = section.renderNode.element!.lastChild
      }
    } else if (section.isBlank) {
      node = section.renderNode.cursorElement
      offset = 0
    } else {
      let { marker, offsetInMarker } = position
      assertNotNull('expected position to have marker', marker)
      assertNotNull('expected marker to have render node', marker.renderNode)

      if (marker.isAtom) {
        if (offsetInMarker > 0) {
          // FIXME -- if there is a next marker, focus on it?
          offset = 0
          node = marker.renderNode.tailTextNode
        } else {
          offset = 0
          node = marker.renderNode.headTextNode
        }
      } else {
        node = marker.renderNode.element
        offset = offsetInMarker
      }
    }

    return { node, offset }
  }

  selectRange(range: Range) {
    if (range.isBlank) {
      this.clearSelection()
      return
    }

    const { head, tail, direction } = range
    const { node: headNode, offset: headOffset } = this._findNodeForPosition(head),
      { node: tailNode, offset: tailOffset } = this._findNodeForPosition(tail)
    this._moveToNode(headNode, headOffset, tailNode, tailOffset, direction)

    // Firefox sometimes doesn't keep focus in the editor after adding a card
    this.editor._ensureFocus()
  }

  get selection() {
    return expect(window.getSelection(), 'expected window selection to not be null')
  }

  selectedText() {
    // FIXME remove this
    return this.selection.toString()
  }

  /**
   * @param {textNode} node
   * @param {integer} offset
   * @param {textNode} endNode
   * @param {integer} endOffset
   * @param {integer} direction forward or backward, default forward
   * @private
   */
  _moveToNode(node: Text, offset: number, endNode: Text, endOffset: number, direction: Direction = DIRECTION.FORWARD) {
    this.clearSelection()

    if (direction === DIRECTION.BACKWARD) {
      ;[node, offset, endNode, endOffset] = [endNode, endOffset, node, offset]
    }

    const range = document.createRange()
    range.setStart(node, offset)
    if (direction === DIRECTION.BACKWARD && isFullSelection(this.selection)) {
      this.selection.addRange(range)
      this.selection.extend(endNode, endOffset)
    } else {
      range.setEnd(endNode, endOffset)
      this.selection.addRange(range)
    }
  }

  _hasSelection() {
    const element = unwrap(this.editor.element)
    const { _selectionRange } = this
    if (!_selectionRange || _selectionRange.collapsed) {
      return false
    }

    return (
      containsNode(element, unwrap(this.selection.anchorNode)) &&
      containsNode(element, unwrap(this.selection.focusNode))
    )
  }

  _hasCollapsedSelection() {
    const { _selectionRange } = this
    if (!_selectionRange) {
      return false
    }

    const element = this.editor.element
    return containsNode(unwrap(element), unwrap(this.selection.anchorNode))
  }

  get _selectionRange() {
    const { selection } = this
    if (selection.rangeCount === 0) {
      return null
    }
    return selection.getRangeAt(0)
  }
}

export default Cursor
