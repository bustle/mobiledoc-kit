import Position from './position';
import { DIRECTION } from '../key';
import assert from 'mobiledoc-kit/utils/assert';

/**
 * A logical range of a {@link Post}.
 * Usually an instance of Range will be read from the {@link Editor#range} property,
 * but it may be useful to instantiate a range directly when programmatically modifying a Post.
 */
class Range {
  /**
   * @param {Position} head
   * @param {Position} [tail=head]
   * @param {Direction} [direction=null]
   * @return {Range}
   * @private
   */
  constructor(head, tail=head, direction=null) {
    /** @property {Position} head */
    this.head = head;

    /** @property {Position} tail */
    this.tail = tail;

    /** @property {Direction} direction */
    this.direction = direction;
  }

  /**
   * Shorthand to create a new range from a section(s) and offset(s).
   * When given only a head section and offset, creates a collapsed range.
   * @param {Section} headSection
   * @param {number} headOffset
   * @param {Section} [tailSection=headSection]
   * @param {number} [tailOffset=headOffset]
   * @param {Direction} [direction=null]
   * @return {Range}
   */
  static create(headSection, headOffset, tailSection=headSection, tailOffset=headOffset, direction=null) {
    return new Range(
      new Position(headSection, headOffset),
      new Position(tailSection, tailOffset),
      direction
    );
  }

  static blankRange() {
    return new Range(Position.blankPosition(), Position.blankPosition());
  }

  /**
   * @param {Markerable} section
   * @return {Range} A range that is constrained to only the part that
   * includes the section.
   * FIXME -- if the section isn't the head or tail, it's assumed to be
   * wholly contained. It's possible to call `trimTo` with a selection that is
   * outside of the range, though, which would invalidate that assumption.
   * There's no efficient way to determine if a section is within a range, yet.
   * @private
   */
  trimTo(section) {
    const length = section.length;

    let headOffset = section === this.head.section ?
      Math.min(this.head.offset, length) : 0;
    let tailOffset = section === this.tail.section ?
      Math.min(this.tail.offset, length) : length;

    return Range.create(section, headOffset, section, tailOffset);
  }

  /**
   * Expands the range 1 unit in the given direction
   * If the range is expandable in the given direction, always returns a
   * non-collapsed range.
   * @param {Number} units If units is > 0, the range is extended to the right,
   *                 otherwise range is extended to the left.
   * @return {Range}
   * @public
   */
  extend(units) {
    assert(`Must pass integer to Range#extend`, typeof units === 'number');

    if (units === 0) { return this; }

    let { head, tail, direction: currentDirection } = this;
    switch (currentDirection) {
      case DIRECTION.FORWARD:
        return new Range(head, tail.move(units), currentDirection);
      case DIRECTION.BACKWARD:
        return new Range(head.move(units), tail, currentDirection);
      default: {
        let newDirection = units > 0 ? DIRECTION.FORWARD : DIRECTION.BACKWARD;
        return new Range(head, tail, newDirection).extend(units);
      }
    }
  }

  /**
   * Moves this range 1 unit in the given direction.
   * If the range is collapsed, returns a collapsed range shifted by 1 unit,
   * otherwise collapses this range to the position at the `direction` end of the range.
   * Always returns a collapsed range.
   * @param {Direction} direction
   * @return {Range}
   * @public
   */
  move(direction) {
    assert(`Must pass DIRECTION.FORWARD (${DIRECTION.FORWARD}) or DIRECTION.BACKWARD (${DIRECTION.BACKWARD}) to Range#move`,
           direction === DIRECTION.FORWARD || direction === DIRECTION.BACKWARD);

    let { focusedPosition, isCollapsed } = this;

    if (isCollapsed) {
      return new Range(focusedPosition.move(direction));
    } else {
      return this._collapse(direction);
    }
  }

  /**
   * expand a range to all markers matching a given check
   *
   * @param {Function} detectMarker
   * @return {Range} The expanded range
   *
   * @public
   */
  expandByMarker(detectMarker) {
    let {
      head,
      tail,
      direction
    } = this;
    let {section: headSection} = head;
    if (headSection !== tail.section) {
      throw new Error('#expandByMarker does not work across sections. Perhaps you should confirm the range is collapsed');
    }

    let firstNotMatchingDetect = i => {
      return !detectMarker(i);
    };

    let headMarker = headSection.markers.detect(firstNotMatchingDetect, head.marker, true);
    if (!headMarker && detectMarker(headSection.markers.head)) {
      headMarker = headSection.markers.head;
    } else {
      headMarker = headMarker.next || head.marker;
    }
    let headPosition = new Position(headSection, headSection.offsetOfMarker(headMarker));

    let tailMarker = tail.section.markers.detect(firstNotMatchingDetect, tail.marker);
    if (!tailMarker && detectMarker(headSection.markers.tail)) {
      tailMarker = headSection.markers.tail;
    } else {
      tailMarker = tailMarker.prev || tail.marker;
    }
    let tailPosition = new Position(tail.section, tail.section.offsetOfMarker(tailMarker) + tailMarker.length);

    return headPosition.toRange(tailPosition, direction);
  }

  _collapse(direction) {
    return new Range(direction === DIRECTION.BACKWARD ? this.head : this.tail);
  }

  get focusedPosition() {
    return this.direction === DIRECTION.BACKWARD ? this.head : this.tail;
  }

  isEqual(other) {
    return other &&
      this.head.isEqual(other.head) &&
      this.tail.isEqual(other.tail);
  }

  get isBlank() {
    return this.head.isBlank && this.tail.isBlank;
  }

  // "legacy" APIs
  get headSection() {
    return this.head.section;
  }
  get tailSection() {
    return this.tail.section;
  }
  get headSectionOffset() {
    return this.head.offset;
  }
  get tailSectionOffset() {
    return this.tail.offset;
  }
  get isCollapsed() {
    return this.head.isEqual(this.tail);
  }
  get headMarker() {
    return this.head.marker;
  }
  get tailMarker() {
    return this.tail.marker;
  }
  get headMarkerOffset() {
    return this.head.offsetInMarker;
  }
  get tailMarkerOffset() {
    return this.tail.offsetInMarker;
  }
}

export default Range;
