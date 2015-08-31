import { detect } from 'content-kit-editor/utils/array-utils';
import { detectParentNode } from 'content-kit-editor/utils/dom-utils';
import { MARKUP_SECTION_TYPE } from 'content-kit-editor/models/markup-section';
import { LIST_ITEM_TYPE } from 'content-kit-editor/models/list-item';
import { MARKER_TYPE } from 'content-kit-editor/models/marker';

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
  return renderNode && renderNode.postNode;
}

const Position = class Position {
  constructor(section, offsetInSection=0) {
    let marker = null,
        offsetInMarker = null;

    if (section !== null && offsetInSection !== null) {
      let markerPosition = section.markerPositionAtOffset(
        offsetInSection
      );
      marker = markerPosition.marker;
      offsetInMarker = markerPosition.offset;
    }

    this.section = section;
    this.offsetInSection = offsetInSection;
    this.marker = marker;
    this.offsetInMarker = offsetInMarker;
  }

  isEqual(position) {
    return this.section === position.section &&
           this.offsetInSection === position.offsetInSection;
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
          offsetInSection = marker.offsetInParent(offsetInNode);
          break;
      }
    }

    if (!section) {
      section = findSectionFromNode(node.parentNode, renderTree) ||
                findSectionContaining(sections, node);

      if (section) {
        offsetInSection = 0;
      }
    }

    return new Position(section, offsetInSection);
  }
};

export default Position;
