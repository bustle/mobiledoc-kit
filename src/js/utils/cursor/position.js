import { isTextNode, walkTextNodes } from 'content-kit-editor/utils/dom-utils';
import { MARKUP_SECTION_TYPE } from 'content-kit-editor/models/markup-section';
import { LIST_ITEM_TYPE } from 'content-kit-editor/models/list-item';
import { CARD_TYPE } from 'content-kit-editor/models/card';

function isSection(postNode) {
  if (!(postNode && postNode.type)) { return false; }
  return postNode.type === MARKUP_SECTION_TYPE ||
    postNode.type === LIST_ITEM_TYPE ||
    postNode.type === CARD_TYPE;
}

function isCardSection(section) {
  return section.type === CARD_TYPE;
}

function findParentSectionFromNode(renderTree, node) {
  let renderNode;
  while (node && node !== renderTree.rootElement) {
    renderNode = renderTree.getElementRenderNode(node);
    if (renderNode && isSection(renderNode.postNode)) {
      return renderNode.postNode;
    }
    node = node.parentNode;
  }
}

function findOffsetInElement(elementNode, textNode, offsetInTextNode) {
  let offset = 0, found = false;
  walkTextNodes(elementNode, _textNode => {
    if (found) { return; }
    if (_textNode === textNode) {
      found = true;
      offset += offsetInTextNode;
    } else {
      offset += _textNode.textContent.length;
    }
  });
  return offset;
}

const Position = class Position {
  constructor(section, offset=0) {
    this.section = section;
    this.offset = offset;
    this._inCard = isCardSection(section);
  }

  clone() {
    return new Position(this.section, this.offset);
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

  static fromNode(renderTree, node, offset) {
    if (isTextNode(node)) {
      return Position.fromTextNode(renderTree, node, offset);
    } else {
      return Position.fromElementNode(renderTree, node, offset);
    }
  }

  static fromTextNode(renderTree, textNode, offsetInNode) {
    const renderNode = renderTree.getElementRenderNode(textNode);
    let section, offsetInSection;

    if (renderNode) {
      let marker = renderNode.postNode;
      section = marker.section;

      if (!section) { throw new Error(`Could not find parent section for mapped text node "${textNode.textContent}"`); }
      offsetInSection = section.offsetOfMarker(marker, offsetInNode);
    } else {
      // all text nodes should be rendered by markers except:
      //   * text nodes inside cards
      //   * text nodes created by the browser during text input
      // both of these should have rendered parent sections, though
      section = findParentSectionFromNode(renderTree, textNode);
      if (!section) { throw new Error(`Could not find parent section for un-mapped text node "${textNode.textContent}"`); }

      if (isCardSection(section)) {
        offsetInSection = 0; // we don't care about offsets in card sections
      } else {
        offsetInSection = findOffsetInElement(section.renderNode.element,
                                              textNode, offsetInNode);
      }
    }

    return new Position(section, offsetInSection);
  }

  static fromElementNode(renderTree, elementNode) {
    let section, offsetInSection = 0;

    section = findParentSectionFromNode(renderTree, elementNode);
    if (!section) { throw new Error('Could not find parent section from element node'); }

    // FIXME We assume that offsetInSection will always be 0 because we assume
    // that only empty br tags (offsetInSection=0) will be those that cause
    // us to call `fromElementNode`. This may not be a reliable assumption.
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
