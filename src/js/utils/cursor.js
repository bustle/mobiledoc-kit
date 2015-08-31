import {
  containsNode,
  clearSelection,
  comparePosition
} from '../utils/selection-utils';
import Position from './cursor/position';
import Range from './cursor/range';

export default class Cursor {
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

  hasSelection() {
    return this._hasSelection();
  }

  /*
   * @return {Range} Cursor#Range object
   */
  get offsets() {
    if (!this.hasCursor()) { return {}; }

    const { sections } = this.post;
    const { selection } = this;

    const {
      headNode, headOffset, tailNode, tailOffset
    } = comparePosition(selection);

    const headPosition = Position.fromNode(
      this.renderTree, sections, headNode, headOffset
    );
    const tailPosition = Position.fromNode(
      this.renderTree, sections, tailNode, tailOffset
    );

    return Range.fromPositions(headPosition, tailPosition);
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

    const headMarker = headSection.markers.head,
          tailMarker = tailSection.markers.tail;

    const headMarkerOffset = 0,
          tailMarkerOffset = tailMarker.length;

    this.moveToMarker(headMarker, headMarkerOffset, tailMarker, tailMarkerOffset);
  }

  selectMarkers(markers) {
    const headMarker = markers[0],
          tailMarker = markers[markers.length - 1],
          headOffset = 0,
          tailOffset = tailMarker.length;
    this.moveToMarker(headMarker, headOffset, tailMarker, tailOffset);
  }

  get selection() {
    return window.getSelection();
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
}
