import { detect } from 'content-kit-editor/utils/array-utils';
import {
  detectParentNode,
  isTextNode,
  walkTextNodes
} from 'content-kit-editor/utils/dom-utils';
import { MARKUP_SECTION_TYPE } from 'content-kit-editor/models/markup-section';
import { LIST_ITEM_TYPE } from 'content-kit-editor/models/list-item';
import { MARKER_TYPE } from 'content-kit-editor/models/marker';

// FIXME This assumes that all sections are children of the Post,
// but that isn't a valid assumption, some sections (ListItem) are
// grand-children of the post.
function findSectionContaining(sections, childNode) {
  const { result: section } = detectParentNode(childNode, node => {
    return detect(sections, section => {
      return section.renderNode.element === node;
    });
  });
  return section;
}

function findSectionFromNode(node, renderTree) {
  const renderNode = renderTree.getElementRenderNode(node);
  const postNode = renderNode && renderNode.postNode;
  return postNode;
}

// cursorElement is the DOM element that the browser reports that the cursor
// is on
function findOffsetInSection(sectionElement, cursorElement, offsetInElement) {
  if (!isTextNode(cursorElement)) {
    // if the cursor element is not a text node, assume that the cursor is
    // on the section element itself and return 0
    return 0;
  }

  let offset = 0, found = false;
  walkTextNodes(sectionElement, (textNode) => {
    if (found) { return; }

    if (textNode === cursorElement) {
      found = true;
      offset += offsetInElement;
    } else {
      offset += textNode.textContent.length;
    }
  });

  return offset;
}

const Position = class Position {
  constructor(section, offset=0) {
    this.section = section;
    this.offset = offset;
  }

  get marker() {
    return this.markerPosition.marker;
  }

  get offsetInMarker() {
    return this.markerPosition.offset;
  }

  isEqual(position) {
    return this.section === position.section &&
           this.offset  === position.offset;
  }

  static fromNode(renderTree, sections, node, offsetInNode) {
    // Sections and markers are registered into the element/renderNode map
    let renderNode = renderTree.getElementRenderNode(node),
        section = null,
        offsetInSection = null;

    if (renderNode) {
      switch (renderNode.postNode.type) {
        case MARKUP_SECTION_TYPE:
          section = renderNode.postNode;
          offsetInSection = offsetInNode;
          break;
        case LIST_ITEM_TYPE:
          section = renderNode.postNode;
          offsetInSection = offsetInNode;
          break;
        case MARKER_TYPE:
          let marker = renderNode.postNode;
          section = marker.section;
          offsetInSection = section.offsetOfMarker(marker, offsetInNode);
          break;
      }
    }

    if (!section) {
      section = findSectionFromNode(node.parentNode, renderTree) ||
                findSectionContaining(sections, node);

      if (section) {
        const sectionElement = section.renderNode.element;
        offsetInSection = findOffsetInSection(sectionElement, node, offsetInNode);
      } else {
        throw new Error('Unable to determine section for cursor');
      }
    }

    return new Position(section, offsetInSection);
  }

  /**
   * @private
   */
  get markerPosition() {
    if (!this.section) { throw new Error('cannot get markerPosition without a section'); }
    return this.section.markerPositionAtOffset(this.offset);
  }

};

export default Position;
