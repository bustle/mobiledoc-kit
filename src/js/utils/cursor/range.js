import Position from './position';
import { DIRECTION } from '../key';

export default class Range {
  constructor(head, tail=head, direction=DIRECTION.FORWARD) {
    this.head = head;
    this.tail = tail;
    this.direction = direction;
  }

  static create(headSection, headOffset, tailSection=headSection, tailOffset=headOffset) {
    return new Range(
      new Position(headSection, headOffset),
      new Position(tailSection, tailOffset)
    );
  }

  static fromSection(section) {
    return new Range(section.headPosition(), section.tailPosition());
  }

  static emptyRange() {
    return new Range(Position.emptyPosition(), Position.emptyPosition());
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

  moveFocusedPosition(direction) {
    switch (this.direction) {
      case DIRECTION.FORWARD:
        return new Range(this.head, this.tail.move(direction), this.direction);
      case DIRECTION.BACKWARD:
        return new Range(this.head.move(direction), this.tail, this.direction);
      default:
        return new Range(this.head, this.tail, direction).moveFocusedPosition(direction);
    }
  }

  isEqual(other) {
    return this.head.isEqual(other.head) &&
           this.tail.isEqual(other.tail);
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
