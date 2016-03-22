import Position from './position';
import { DIRECTION } from '../key';

export default class Range {
  constructor(head, tail=head, direction=null) {
    this.head = head;
    this.tail = tail;
    this.direction = direction;
  }

  static create(headSection, headOffset, tailSection=headSection, tailOffset=headOffset, direction=null) {
    return new Range(
      new Position(headSection, headOffset),
      new Position(tailSection, tailOffset),
      direction
    );
  }

  static fromSection(section) {
    return new Range(section.headPosition(), section.tailPosition());
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
   * Expands the range in the given direction
   * @param {Direction} newDirection
   * @return {Range} Always returns an expanded, non-collapsed range
   * @public
   */
  extend(newDirection) {
    let { head, tail, direction } = this;
    switch (direction) {
      case DIRECTION.FORWARD:
        return new Range(head, tail.move(newDirection), direction);
      case DIRECTION.BACKWARD:
        return new Range(head.move(newDirection), tail, direction);
      default:
        return new Range(head, tail, newDirection).extend(newDirection);
    }
  }

  /**
   * Moves this range in {newDirection}.
   * If the range is collapsed, returns a collapsed range shifted 1 unit in
   * {newDirection}, otherwise collapses this range to the position at the
   * {newDirection} end of the range.
   * @param {Direction} newDirection
   * @return {Range} Always returns a collapsed range
   * @public
   */
  move(newDirection) {
    let { focusedPosition, isCollapsed } = this;

    if (isCollapsed) {
      return new Range(focusedPosition.move(newDirection));
    } else {
      return this._collapse(newDirection);
    }
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
