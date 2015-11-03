import {
  clearSelection,
  comparePosition
} from '../utils/selection-utils';
import { containsNode } from '../utils/dom-utils';
import Position from './cursor/position';
import Range from './cursor/range';

export {Position, Range};

const Cursor = class Cursor {
  constructor(editor) {
    this.editor = editor;
    this.renderTree = editor._renderTree;
    this.post = editor.post;
  }

  clearSelection() {
    clearSelection();
  }

  /**
   * @return {Boolean} true when there is either a collapsed cursor in the
   * editor's element or a selection that is contained in the editor's element
   */
  hasCursor() {
    return this._hasCollapsedSelection() || this._hasSelection();
  }

  isInCard() {
    if (!this.hasCursor()) { return false; }

    const {head, tail} = this.offsets;
    return head && tail && (head._inCard || tail._inCard);
  }

  hasSelection() {
    return this._hasSelection();
  }

  /*
   * @return {Range} Cursor#Range object
   */
  get offsets() {
    if (!this.hasCursor()) { return Range.emptyRange(); }

    const { selection, renderTree } = this;

    const {
      headNode, headOffset, tailNode, tailOffset
    } = comparePosition(selection);

    const headPosition = Position.fromNode(renderTree, headNode, headOffset);
    const tailPosition = Position.fromNode(renderTree, tailNode, tailOffset);

    return new Range(headPosition, tailPosition);
  }

  get activeSections() {
    if (!this.hasCursor()) { return []; }

    const {head, tail} = this.offsets;
    return this.post.sections.readRange(head.section, tail.section);
  }

  // moves cursor to the start of the section
  moveToSection(section, offsetInSection=0) {
    this.moveToPosition(new Position(section, offsetInSection));
  }

  selectSections(sections) {
    const headSection = sections[0], tailSection = sections[sections.length - 1];
    const range = Range.create(headSection, 0, tailSection, tailSection.length);
    this.selectRange(range);
  }

  _findNodeForPosition(position) {
    const { section } = position;
    let node, offset;
    if (section.isBlank) {
      node = section.renderNode.element;
      offset = 0;
    } else {
      const {marker, offsetInMarker} = position;
      node = marker.renderNode.element;
      offset = offsetInMarker;
    }

    return {node, offset};
  }

  selectRange(range) {
    const { head, tail } = range;
    const { node:headNode, offset:headOffset } = this._findNodeForPosition(head),
          { node:tailNode, offset:tailOffset } = this._findNodeForPosition(tail);
    this._moveToNode(headNode, headOffset, tailNode, tailOffset);
  }

  get selection() {
    return window.getSelection();
  }

  selectedText() {
    return this.selection.toString();
  }

  moveToPosition(position) {
    if (position._inCard) {
      // FIXME add the ability to position the cursor on/in a card
      return;
    }
    this.selectRange(new Range(position, position));
  }

  /**
   * @private
   * @param {textNode} node
   * @param {integer} offset
   * @param {textNode} endNode (default: node)
   * @param {integer} endOffset (default: offset)
   */
  _moveToNode(node, offset=0, endNode=node, endOffset=offset) {
    this.clearSelection();

    const range = document.createRange();
    range.setStart(node, offset);
    range.setEnd(endNode, endOffset);

    this.selection.addRange(range);
  }

  _hasSelection() {
    const element = this.editor.element;
    const { _selectionRange } = this;
    if (!_selectionRange || _selectionRange.collapsed) { return false; }

    return containsNode(element, this.selection.anchorNode) &&
           containsNode(element, this.selection.focusNode);
  }

  _hasCollapsedSelection() {
    const { _selectionRange } = this;
    if (!_selectionRange) { return false; }

    const element = this.editor.element;
    return containsNode(element, this.selection.anchorNode);
  }

  get _selectionRange() {
    const { selection } = this;
    if (selection.rangeCount === 0) { return null; }
    return selection.getRangeAt(0);
  }
};

export default Cursor;
