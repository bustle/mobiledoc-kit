import {
  detect
} from '../utils/array-utils';

import {
  isSelectionInElement,
  clearSelection
} from '../utils/selection-utils';

import {
  detectParentNode,
  isTextNode,
  walkDOM
} from '../utils/dom-utils';

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
  const {result:section} = detectParentNode(childNode, node => {
    return detect(sections, s => s.renderNode.element === node);
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
    const selection = this.selection;
    const { isCollapsed, rangeCount } = selection;
    const range = rangeCount > 0 && selection.getRangeAt(0);

    if (!range) {
      return {};
    }


    let {leftNode, leftOffset, rightNode, rightOffset} = comparePosition(selection);

    // The selection should contain two text nodes, but may contain a P
    // tag if the section only has a blank br marker or on
    // Chrome/Safari using shift+<Up arrow> can create a selection with
    // a tag rather than a text node. This fixes that.
    // See https://github.com/bustlelabs/content-kit-editor/issues/56

    let leftRenderNode = this.renderTree.getElementRenderNode(leftNode),
        rightRenderNode = this.renderTree.getElementRenderNode(rightNode);

    if (!rightRenderNode) {
      let rightSection = findSectionContaining(sections, rightNode);
      let rightMarker = rightSection.markers.head;
      rightRenderNode = rightMarker.renderNode;
      rightNode = rightRenderNode.element;
      rightOffset = 0;
    }

    if (!leftRenderNode) {
      let leftSection = findSectionContaining(sections, leftNode);
      let leftMarker = leftSection.markers.head;
      leftRenderNode = leftMarker.renderNode;
      leftNode = leftRenderNode.element;
      leftOffset = 0;
    }

    const startMarker = leftRenderNode && leftRenderNode.postNode,
          endMarker = rightRenderNode && rightRenderNode.postNode;

    const startSection = startMarker && startMarker.section;
    const endSection = endMarker && endMarker.section;

    const headSectionOffset = startSection &&
      startMarker &&
      startMarker.offsetInParent(leftOffset);

    const tailSectionOffset = endSection &&
      endMarker &&
      endMarker.offsetInParent(rightOffset);

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
      endSection,

      // FIXME: this should become the public API
      headMarker: startMarker,
      tailMarker: endMarker,
      headOffset: leftOffset,
      tailOffset: rightOffset,
      headNode: leftNode,
      tailNode: rightNode,

      headSection: startSection,
      tailSection: endSection,
      headSectionOffset,
      tailSectionOffset,
      isCollapsed
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
    const startSection = findSectionContaining(sections, startContainer);
    const endSection = findSectionContaining(sections, endContainer);

    return sections.readRange(startSection, endSection);
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
