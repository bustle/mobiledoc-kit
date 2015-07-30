import {
  detect
} from '../utils/array-utils';

import {
  isSelectionInElement,
  clearSelection
} from '../utils/selection-utils';

import {
  detectParentNode,
  containsNode,
  walkTextNodes
} from '../utils/dom-utils';

const Cursor = class Cursor {
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

  /**
   * the offset from the left edge of the section
   */
  get leftOffset() {
    return this.offsets.leftOffset;
  }

  get offsets() {
    let leftNode, rightNode,
        leftOffset, rightOffset;
    const { anchorNode, focusNode, anchorOffset, focusOffset } = this.selection;

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

    return {
      leftNode,
      rightNode,
      leftOffset,
      rightOffset,
      leftRenderNode,
      rightRenderNode
    };
  }

  get activeMarkers() {
    const firstSection = this.activeSections[0];
    if (!firstSection) { return []; }
    const firstSectionElement = firstSection.renderNode.element;

    const {
      leftNode, rightNode,
      leftOffset, rightOffset
    } = this.offsets;

    let textLeftOffset = 0,
        textRightOffset = 0,
        foundLeft = false,
        foundRight = false;

    walkTextNodes(firstSectionElement, (textNode) => {
      let textLength = textNode.textContent.length;

      if (!foundLeft) {
        if (containsNode(leftNode, textNode)) {
          textLeftOffset += leftOffset;
          foundLeft = true;
        } else {
          textLeftOffset += textLength;
        }
      }
      if (!foundRight) {
        if (containsNode(rightNode, textNode)) {
          textRightOffset += rightOffset;
          foundRight = true;
        } else {
          textRightOffset += textLength;
        }
      }
    });

    // get section element
    //   walk it until we find one containing the left node, adding up textContent length along the way
    //   add the selection offset in the left node -- this is the offset in the parent textContent
    //   repeat for right node (subtract the remaining chars after selection offset) -- this is the end offset
    //
    //   walk the section's markers, adding up length. Each marker with length >= offset and <= end offset is active

    const leftMarker = firstSection.markerContaining(textLeftOffset, true);
    const rightMarker = firstSection.markerContaining(textRightOffset, false);

    const leftMarkerIndex = firstSection.markers.indexOf(leftMarker),
          rightMarkerIndex = firstSection.markers.indexOf(rightMarker) + 1;

    return firstSection.markers.slice(leftMarkerIndex, rightMarkerIndex);
  }

  get activeSections() {
    const { sections } = this.post;
    const selection = this.selection;
    const { rangeCount } = selection;
    const range = rangeCount > 0 && selection.getRangeAt(0);

    if (!range) { throw new Error('Unable to get activeSections because no range'); }

    const { startContainer, endContainer } = range;
    const isSectionElement = (element) => {
      return detect(sections, (section) => {
        return section.renderNode.element === element;
      });
    };
    const {result:startSection} = detectParentNode(startContainer, isSectionElement);
    const {result:endSection} = detectParentNode(endContainer, isSectionElement);

    const startIndex = sections.indexOf(startSection),
          endIndex   = sections.indexOf(endSection) + 1;

    return sections.slice(startIndex, endIndex);
  }

  // moves cursor to the start of the section
  moveToSection(section) {
    const marker = section.markers[0];
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
};

export default Cursor;

