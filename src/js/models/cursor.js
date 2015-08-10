import {
  detect
} from '../utils/array-utils';

import {
  isSelectionInElement,
  clearSelection
} from '../utils/selection-utils';

import {
  detectParentNode
} from '../utils/dom-utils';

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

  get offsets() {
    let leftNode, rightNode,
        leftOffset, rightOffset;
    const selection = this.selection;
    const { anchorNode, focusNode, anchorOffset, focusOffset } = selection;
    const { rangeCount } = selection;
    const range = rangeCount > 0 && selection.getRangeAt(0);

    if (!range) {
      return {};
    }

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

    const leftRenderNode = this.renderTree.elements.get(leftNode),
          rightRenderNode = this.renderTree.elements.get(rightNode);

    const startMarker = leftRenderNode && leftRenderNode.postNode,
          endMarker = rightRenderNode && rightRenderNode.postNode;

    const startSection = startMarker && startMarker.section;
    const endSection = endMarker && endMarker.section;

    return {
      leftNode,
      rightNode,
      leftOffset,
      rightOffset,
      leftRenderNode,
      rightRenderNode,
      startMarker,
      endMarker,
      startSection,
      endSection
    };
  }

  get activeSections() {
    const { sections } = this.post;
    const selection = this.selection;
    const { rangeCount } = selection;
    const range = rangeCount > 0 && selection.getRangeAt(0);

    if (!range) {
      return [];
    }

    const { startContainer, endContainer } = range;
    const isSectionElement = (element) => {
      return detect(sections, s => s.renderNode.element === element);
    };
    const {result:startSection} = detectParentNode(startContainer, isSectionElement);
    const {result:endSection} = detectParentNode(endContainer, isSectionElement);

    return sections.readRange(startSection, endSection);
  }

  // moves cursor to the start of the section
  moveToSection(section) {
    const marker = section.markers.head;
    if (!marker) { throw new Error('Cannot move cursor to section without a marker'); }
    const markerElement = marker.renderNode.element;

    let r = document.createRange();
    r.selectNode(markerElement);
    r.collapse(true);
    const selection = this.selection;
    if (selection.rangeCount > 0) {
      selection.removeAllRanges();
    }
    selection.addRange(r);
  }

  selectSections(sections) {
    const startSection = sections[0],
          endSection  = sections[sections.length - 1];

    const startNode = startSection.markers.head.renderNode.element,
          endNode   = endSection.markers.tail.renderNode.element;

    const startOffset = 0,
          endOffset = endNode.textContent.length;

    this.moveToNode(startNode, startOffset, endNode, endOffset);
  }

  selectMarkers(markers) {
    const startMarker = markers[0],
          endMarker   = markers[markers.length - 1];

    const startNode = startMarker.renderNode.element,
          endNode   = endMarker.renderNode.element;
    const startOffset = 0, endOffset = endMarker.length;

    this.moveToNode(startNode, startOffset, endNode, endOffset);
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
