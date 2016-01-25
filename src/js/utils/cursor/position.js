import {
  isTextNode
} from 'mobiledoc-kit/utils/dom-utils';
import { DIRECTION } from 'mobiledoc-kit/utils/key';
import assert from 'mobiledoc-kit/utils/assert';
import {
  HIGH_SURROGATE_RANGE,
  LOW_SURROGATE_RANGE
} from 'mobiledoc-kit/models/marker';

function isSection(postNode) {
  if (!(postNode && postNode.type)) { return false; }
  return postNode.isMarkerable || postNode.isCardSection;
}

function findParentSectionFromNode(renderTree, node) {
  let renderNode =  renderTree.findRenderNodeFromElement(
    node,
    (renderNode) => isSection(renderNode.postNode)
  );

  return renderNode && renderNode.postNode;
}

function findOffsetInSection(section, node, offset) {
  if (section.isCardSection) {
    let wrapperNode = section.renderNode.element;
    let endTextNode = wrapperNode.lastChild;
    return (node === endTextNode) ? 1 : 0;
  } else {
    let offsetInSection = 0;
    let marker = section.markers.head;
    while (marker) {
      let markerNode = marker.renderNode.element;
      if (markerNode === node) {
        return offsetInSection + offset;
      } else if (marker.isAtom) {
        if (marker.renderNode.headTextNode === node) {
          return offsetInSection;
        } else if (marker.renderNode.tailTextNode === node) {
          return offsetInSection + 1;
        }
      }

      offsetInSection += marker.length;
      marker = marker.next;
    }

    return offsetInSection;
  }

}

const Position = class Position {
  constructor(section, offset=0) {
    this.section = section;
    this.offset = offset;
    this.isBlank = false;
  }

  static blankPosition() {
    return {
      section: null,
      offset: 0,
      marker: null,
      offsetInTextNode: 0,
      isBlank: true,
      isEqual(other) { return other.isBlank; },
      markerPosition: {}
    };
  }

  clone() {
    return new Position(this.section, this.offset);
  }

  get isMarkerable() {
    return this.section && this.section.isMarkerable;
  }

  get marker() {
    return this.isMarkerable && this.markerPosition.marker;
  }

  get offsetInMarker() {
    return this.markerPosition.offset;
  }

  isEqual(position) {
    return this.section === position.section &&
           this.offset  === position.offset;
  }

  isHead() {
    return this.isEqual(this.section.headPosition());
  }

  isTail() {
    return this.isEqual(this.section.tailPosition());
  }

  /**
   * This method returns a new Position instance, it does not modify
   * this instance.
   *
   * @param {Direction} direction to move
   * @return {Position|null} Return the position one unit in the given
   * direction, or null if it is not possible to move that direction
   */
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

  /**
   * @return {Position|null}
   */
  moveLeft() {
    if (this.isHead()) {
      let prev = this.section.previousLeafSection();
      return prev && prev.tailPosition();
    } else {
      let offset = this.offset - 1;
      if (!this.section.isCardSection && this.marker.value) {
        let code = this.marker.value.charCodeAt(offset);
        if (code >= LOW_SURROGATE_RANGE[0] && code <= LOW_SURROGATE_RANGE[1]) {
          offset = offset - 1;
        }
      }
      return new Position(this.section, offset);
    }
  }

  /**
   * @return {Position|null}
   */
  moveRight() {
    if (this.isTail()) {
      let next = this.section.nextLeafSection();
      return next && next.headPosition();
    } else {
      let offset = this.offset + 1;
      if (!this.section.isCardSection && this.marker.value) {
        let code = this.marker.value.charCodeAt(offset);
        if (code >= HIGH_SURROGATE_RANGE[0] && code <= HIGH_SURROGATE_RANGE[1]) {
          offset = offset + 1;
        }
      }
      return new Position(this.section, offset);
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

      assert(`Could not find parent section for mapped text node "${textNode.textContent}"`,
             !!section);
      offsetInSection = section.offsetOfMarker(marker, offsetInNode);
    } else {
      // all text nodes should be rendered by markers except:
      //   * text nodes inside cards
      //   * text nodes created by the browser during text input
      // both of these should have rendered parent sections, though
      section = findParentSectionFromNode(renderTree, textNode);
      assert(`Could not find parent section for un-mapped text node "${textNode.textContent}"`,
             !!section);

      offsetInSection = findOffsetInSection(section, textNode, offsetInNode);
    }

    return new Position(section, offsetInSection);
  }

  static fromElementNode(renderTree, elementNode, offset) {
    let section, offsetInSection;

    // The browser may change the reported selection to equal the editor's root
    // element if the user clicks an element that is immediately removed,
    // which can happen when clicking to remove a card.
    if (elementNode === renderTree.rootElement) {
      let post = renderTree.rootNode.postNode;
      if (offset === 0) {
        section = post.sections.head;
        offsetInSection = 0;
      } else {
        section = post.sections.tail;
        offsetInSection = section.length;
      }
    } else {
      section = findParentSectionFromNode(renderTree, elementNode);
      assert('Could not find parent section from element node', !!section);

      if (section.isCardSection) {
        // Selections in cards are usually made on a text node containing a &zwnj;
        // on one side or the other of the card but some scenarios (Firefox) will result in
        // selecting the card's wrapper div. If the offset is 2 we've selected
        // the final zwnj and should consider the cursor at the end of the card (offset 1). Otherwise,
        // the cursor is at the start of the card
        offsetInSection = offset < 2 ? 0 : 1;
      } else {
        // The offset is 0 if the cursor is on an element node (e.g., a <br> tag in
        // a blank markup section)
        offsetInSection = 0;
      }
    }
    return new Position(section, offsetInSection);
  }

  /**
   * @private
   */
  get markerPosition() {
    assert('Cannot get markerPosition without a section', !!this.section);
    assert('cannot get markerPosition of a non-markerable', !!this.section.isMarkerable);
    return this.section.markerPositionAtOffset(this.offset);
  }

};

export default Position;
