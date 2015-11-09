import {
  isTextNode, findOffsetInElement
} from 'content-kit-editor/utils/dom-utils';
import {
  MARKUP_SECTION_TYPE, LIST_ITEM_TYPE, CARD_TYPE
} from 'content-kit-editor/models/types';
import { DIRECTION } from 'content-kit-editor/utils/key';
import assert from 'content-kit-editor/utils/assert';

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
  let renderNode =  renderTree.findRenderNodeFromElement(
    node,
    (renderNode) => isSection(renderNode.postNode)
  );

  return renderNode && renderNode.postNode;
}

function findOffsetInSection(section, node, offset) {
  if (!isCardSection(section)) {
    return findOffsetInElement(section.renderNode.element,
                               node, offset);
  }

  // Only the card case
  let wrapperNode = section.renderNode.element;
  let endTextNode = wrapperNode.lastChild;
  if (node === endTextNode) {
    return 1;
  }
  return 0;
}

const Position = class Position {
  constructor(section, offset=0) {
    this.section = section;
    this.offset = offset;
    this._inCard = isCardSection(section);
  }

  static emptyPosition() {
    return {
      section: null,
      offset: 0,
      _inCard: false,
      marker: null,
      offsetInTextNode: 0,
      _isEmpty: true,
      isEqual(other) { return other._isEmpty; },
      markerPosition: {}
    };
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

  move(direction) {
    switch (direction) {
      case DIRECTION.BACKWARD:
        return this.moveLeft();
      case DIRECTION.FORWARD:
        return this.moveRight();
      default:
        assert('Must pass a valid direction to Position.move', false);
    }
  }

  moveLeft() {
    if (this.offset > 0) {
      return new Position(this.section, this.offset - 1);
    } else if (this.section.prev) {
      return new Position(this.section.prev, this.section.prev.length);
    } else {
      return null;
    }
  }

  moveRight() {
    if (this.offset < this.section.length) {
      return new Position(this.section, this.offset + 1);
    } else if (this.section.next) {
      return new Position(this.section.next, 0);
    } else {
      return null;
    }
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
      const marker = renderNode.postNode;
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

      offsetInSection = findOffsetInSection(section, textNode, offsetInNode);
    }

    return new Position(section, offsetInSection);
  }

  static fromElementNode(renderTree, elementNode, offset) {
    // The browser may change the reported selection to equal the editor's root
    // element if the user clicks an element that is immediately removed,
    // which can happen when clicking to remove a card.
    if (elementNode === renderTree.rootElement) {
      return Position.emptyPosition();
    }

    let section = findParentSectionFromNode(renderTree, elementNode);
    if (!section) { throw new Error('Could not find parent section from element node'); }

    let offsetInSection;

    if (isCardSection(section)) {
      // Selections in cards are usually made on a text node containing a &zwnj; 
      // on one side or the other of the card but some scenarios will result in
      // selecting the card's wrapper div. If the offset is 2 we've selected
      // the final zwnj and should consider the cursor at the end of the card (offset 1). Otherwise,
      // the cursor is at the start of the card
      offsetInSection = offset < 2 ? 0 : 1;
    } else {
      offsetInSection = 0;
    }

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
