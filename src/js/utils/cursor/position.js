import { detect } from 'content-kit-editor/utils/array-utils';
import { detectParentNode } from 'content-kit-editor/utils/dom-utils';

function findSectionContaining(sections, childNode) {
  const { result: section } = detectParentNode(childNode, node => {
    return detect(sections, section => {
      return section.renderNode.element === node;
    });
  });
  return section;
}

export default class Position {
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
    // Only markers are registered into the element/renderNode map
    let markerRenderNode = renderTree.getElementRenderNode(node);

    let section = null, offsetInSection = null;
    if (markerRenderNode) {
      let marker = markerRenderNode.postNode;
      section = marker.section;
      offsetInSection = marker.offsetInParent(offsetInNode);
    }

    if (!section) {
      // The selection should contain two text nodes, but may contain a P
      // tag if the section only has a blank br marker or on
      // Chrome/Safari using shift+<Up arrow> can create a selection with
      // a tag rather than a text node. This fixes that.
      // See https://github.com/bustlelabs/content-kit-editor/issues/56
      section = findSectionContaining(sections, node);
      if (section) {
        offsetInSection = 0;
      }
    }

    return new Position(section, offsetInSection);
  }
}
