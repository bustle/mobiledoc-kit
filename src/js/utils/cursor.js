import { detect } from '../utils/array-utils';
import {
  isSelectionInElement,
  clearSelection
} from '../utils/selection-utils';
import {
  detectParentNode,
  isTextNode,
  walkDOM
} from '../utils/dom-utils';
import Position from "./cursor/position";
import Range from "./cursor/range";

function findOffsetInParent(parentElement, targetElement, targetOffset) {
  let offset = 0;
  let found = false;
  // FIXME: would be nice to exit this walk early after we find the end node
  walkDOM(parentElement, (childElement) => {
    if (found) { return; }
    found = childElement === targetElement;

    if (found) {
      offset += targetOffset;
    } else if (isTextNode(childElement)) {
      offset += childElement.textContent.length;
    }
  });
  return offset;
}

function findSectionContaining(sections, childNode) {
  const { result: section } = detectParentNode(childNode, node => {
    return detect(sections, section => {
      return section.renderNode.element === node;
    });
  });
  return section;
}

function comparePosition(selection) {
  let { anchorNode, focusNode, anchorOffset, focusOffset } = selection;
  let leftNode, rightNode, leftOffset, rightOffset;

  const position = anchorNode.compareDocumentPosition(focusNode);

  if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
    leftNode = anchorNode; rightNode = focusNode;
    leftOffset = anchorOffset; rightOffset = focusOffset;
  } else if (position & Node.DOCUMENT_POSITION_PRECEDING) {
    leftNode = focusNode; rightNode = anchorNode;
    leftOffset = focusOffset; rightOffset = anchorOffset;
  } else { // same node
    leftNode = anchorNode;
    rightNode = focusNode;
    leftOffset = Math.min(anchorOffset, focusOffset);
    rightOffset = Math.max(anchorOffset, focusOffset);
  }

  return {leftNode, leftOffset, rightNode, rightOffset};
}

export default class Cursor {
  constructor(editor) {
    this.editor = editor;
    this.renderTree = editor._renderTree;
    this.post = editor.post;
  }

  hasSelection() {
    const parentElement = this.editor.element;
    return isSelectionInElement(parentElement);
  }

  clearSelection() {
    clearSelection();
  }

  get selection() {
    return window.getSelection();
  }

  get sectionOffsets() {
    const { sections } = this.post;
    const selection = this.selection;
    const { rangeCount } = selection;
    const range = rangeCount > 0 && selection.getRangeAt(0);

    if (!range) {
      return {};
    }

    let {leftNode:headNode, leftOffset:headOffset} = comparePosition(selection);
    let headSection = findSectionContaining(sections, headNode);
    let headSectionOffset = findOffsetInParent(headSection.renderNode.element, headNode, headOffset);

    return {headSection, headSectionOffset};
  }

  get offsets() {
    const { sections } = this.post;
    const { selection } = this;

    if (selection.rangeCount === 0 || !selection.getRangeAt(0)) {
      return {};
    }

    let {
      leftNode, leftOffset, rightNode, rightOffset
    } = comparePosition(selection);

    let headPosition = Position.fromNode(
      this.renderTree, sections, leftNode, leftOffset
    );
    let tailPosition = Position.fromNode(
      this.renderTree, sections, rightNode, rightOffset
    );

    return Range.fromPositions(headPosition, tailPosition);
  }

  get activeSections() {
    const { sections } = this.post;
    const { selection } = this;
    const { rangeCount } = selection;
    const range = rangeCount > 0 && selection.getRangeAt(0);

    if (!range) {
      return [];
    }

    const { startContainer, endContainer } = range;
    const headSection = findSectionContaining(sections, startContainer);
    const tailSection = findSectionContaining(sections, endContainer);

    return sections.readRange(headSection, tailSection);
  }

  // moves cursor to the start of the section
  moveToSection(section, offsetInSection=0) {
    const {marker, offset} = section.markerPositionAtOffset(offsetInSection);
    if (!marker) { throw new Error('Cannot move cursor to section without a marker'); }
    this.moveToMarker(marker, offset);
  }

  // moves cursor to marker
  moveToMarker(headMarker, headOffset=0, tailMarker=headMarker, tailOffset=headOffset) {
    if (!headMarker) { throw new Error('Cannot move cursor to section without a marker'); }
    const headElement = headMarker.renderNode.element;
    const tailElement = tailMarker.renderNode.element;

    this.moveToNode(headElement, headOffset, tailElement, tailOffset);
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

  /**
   * @param {textNode} node
   * @param {integer} offset
   * @param {textNode} endNode (default: node)
   * @param {integer} endOffset (default: offset)
   */
  moveToNode(node, offset=0, endNode=node, endOffset=offset) {
    let r = document.createRange();
    r.setStart(node, offset);
    r.setEnd(endNode, endOffset);
    const selection = this.selection;
    if (selection.rangeCount > 0) {
      selection.removeAllRanges();
    }
    selection.addRange(r);
  }
}
