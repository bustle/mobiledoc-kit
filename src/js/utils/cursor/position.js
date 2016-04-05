import { isTextNode } from 'mobiledoc-kit/utils/dom-utils';
import { DIRECTION } from 'mobiledoc-kit/utils/key';
import assert from 'mobiledoc-kit/utils/assert';
import {
  HIGH_SURROGATE_RANGE,
  LOW_SURROGATE_RANGE
} from 'mobiledoc-kit/models/marker';
import { containsNode } from 'mobiledoc-kit/utils/dom-utils';
import { findOffsetInNode } from 'mobiledoc-kit/utils/selection-utils';

function findParentSectionFromNode(renderTree, node) {
  let renderNode =  renderTree.findRenderNodeFromElement(
    node,
    (renderNode) => renderNode.postNode.isSection
  );

  return renderNode && renderNode.postNode;
}

function findOffsetInMarkerable(markerable, node, offset) {
  let offsetInSection = 0;
  let marker = markerable.markers.head;
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

function findOffsetInSection(section, node, offset) {
  if (section.isMarkerable) {
    return findOffsetInMarkerable(section, node, offset);
  } else {
    assert('findOffsetInSection must be called with markerable or card section',
           section.isCardSection);

    let wrapperNode = section.renderNode.element;
    let endTextNode = wrapperNode.lastChild;
    if (node === endTextNode) {
      return 1;
    }
    return 0;
  }
}

const Position = class Position {
  /**
   * A position is a logical location (zero-width, or "collapsed") in a post,
   * typically between two characters in a section.
   * Two positions (a head and a tail) make up a {@link Range}.
   * @constructor
   */
  constructor(section, offset=0) {
    assert('Position must have a section that is addressable by the cursor',
           (section && section.isLeafSection));
    assert('Position must have numeric offset',
           (offset !== null && offset !== undefined));

    /** @property {Section} section */
    this.section = section;
    /** @property {number} offset */
    this.offset = offset;

    this.isBlank = false;
  }

  /**
   * @param {integer} x x-position in current viewport
   * @param {integer} y y-position in current viewport
   * @param {Editor} editor
   * @return {Position|null}
   */
  static atPoint(x, y, editor) {
    let { _renderTree, element: rootElement } = editor;
    let elementFromPoint = document.elementFromPoint(x, y);
    if (!containsNode(rootElement, elementFromPoint)) {
      return;
    }

    let { node, offset } = findOffsetInNode(elementFromPoint, {left: x, top: y});
    return Position.fromNode(_renderTree, node, offset);
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

  get leafSectionIndex() {
    let post = this.section.post;
    let leafSectionIndex;
    post.walkAllLeafSections((section, index) => {
      if (section === this.section) {
        leafSectionIndex = index;
      }
    });
    return leafSectionIndex;
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
   * Move the position 1 unit in `direction`.
   *
   * @param {Direction} direction to move
   * @return {Position|null} Return a new position one unit in the given
   * direction or null if it is not possible to move that direction
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
   * The position to the left of this position.
   * If this position is the post's headPosition it returns itself.
   * @return {Position}
   */
  moveLeft() {
    if (this.isHead()) {
      let prev = this.section.previousLeafSection();
      return prev ? prev.tailPosition() : this;
    } else {
      let offset = this.offset - 1;
      if (this.isMarkerable && this.marker) {
        let code = this.marker.value.charCodeAt(offset);
        if (code >= LOW_SURROGATE_RANGE[0] && code <= LOW_SURROGATE_RANGE[1]) {
          offset = offset - 1;
        }
      }
      return new Position(this.section, offset);
    }
  }

  /**
   * The position to the right of this position.
   * If this position is the post's tailPosition it returns itself.
   * @return {Position}
   */
  moveRight() {
    if (this.isTail()) {
      let next = this.section.nextLeafSection();
      return next ? next.headPosition() : this;
    } else {
      let offset = this.offset + 1;
      if (this.isMarkerable && this.marker) {
        let code = this.marker.value.charCodeAt(offset - 1);
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
    let position;

    // The browser may change the reported selection to equal the editor's root
    // element if the user clicks an element that is immediately removed,
    // which can happen when clicking to remove a card.
    if (elementNode === renderTree.rootElement) {
      let post = renderTree.rootNode.postNode;
      position = offset === 0 ? post.headPosition() : post.tailPosition();
    } else {
      let section = findParentSectionFromNode(renderTree, elementNode);
      assert('Could not find parent section from element node', !!section);

      if (section.isCardSection) {
        // Selections in cards are usually made on a text node
        // containing a &zwnj;  on one side or the other of the card but
        // some scenarios (Firefox) will result in selecting the
        // card's wrapper div. If the offset is 2 we've selected
        // the final zwnj and should consider the cursor at the
        // end of the card (offset 1). Otherwise,  the cursor is at
        // the start of the card
        position = offset < 2 ? section.headPosition() : section.tailPosition();
      } else {

        // In Firefox it is possible for the cursor to be on an atom's wrapper
        // element. (In Chrome/Safari, the browser corrects this to be on
        // one of the text nodes surrounding the wrapper).
        // This code corrects for when the browser reports the cursor position
        // to be on the wrapper element itself
        let renderNode = renderTree.getElementRenderNode(elementNode);
        let postNode = renderNode && renderNode.postNode;
        if (postNode && postNode.isAtom) {
          let sectionOffset = section.offsetOfMarker(postNode);
          if (offset > 1) {
            // we are on the tail side of the atom
            sectionOffset += postNode.length;
          }
          position = new Position(section, sectionOffset);
        } else {
          // The offset is 0 if the cursor is on a non-atom-wrapper element node
          // (e.g., a <br> tag in a blank markup section)
          position = section.headPosition();
        }
      }
    }

    return position;
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
