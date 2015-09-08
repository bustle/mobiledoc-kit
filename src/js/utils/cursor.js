import {
  containsNode,
  clearSelection,
  comparePosition
} from '../utils/selection-utils';
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
    if (!this.hasCursor()) { return {}; }

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
    const {marker, offset} = section.markerPositionAtOffset(offsetInSection);
    if (marker) {
      this.moveToMarker(marker, offset);
    } else {
      this._moveToNode(section.renderNode.element, offsetInSection);
    }
  }

  // moves cursor to marker
  moveToMarker(headMarker, headOffset=0, tailMarker=headMarker, tailOffset=headOffset) {
    if (!headMarker) { throw new Error('Cannot move cursor to marker without a marker'); }
    const headElement = headMarker.renderNode.element;
    const tailElement = tailMarker.renderNode.element;

    this._moveToNode(headElement, headOffset, tailElement, tailOffset);
  }

  selectSections(sections) {
    const headSection = sections[0],
          tailSection = sections[sections.length - 1];

    const range = new Range(
      new Position(headSection, 0),
      new Position(tailSection, tailSection.text.length)
    );
    this.selectRange(range);
  }

  selectRange(range) {
    const {
      headMarker,
      headMarkerOffset,
      tailMarker,
      tailMarkerOffset
    } = range;
    this.moveToMarker(
      headMarker, headMarkerOffset, tailMarker, tailMarkerOffset);
  }

  get selection() {
    return window.getSelection();
  }

  selectedText() {
    return this.selection.toString();
  }

  moveToPosition(position) {
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
