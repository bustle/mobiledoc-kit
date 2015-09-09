import Position from './position';

export default class Range {
  constructor(head, tail) {
    this.head = head;
    this.tail = tail;
  }

  static create(headSection, headOffset, tailSection, tailOffset) {
    return new Range(
      new Position(headSection, headOffset),
      new Position(tailSection, tailOffset)
    );
  }

  /**
   * @param {Markerable} section
   * @return {Range} A range that is constrained to only the part that
   * includes the section.
   * FIXME -- if the section isn't the head or tail, it's assumed to be
   * wholly contained. It's possible to call `trimTo` with a selection that is
   * outside of the range, though, which would invalidate that assumption.
   */
  trimTo(section) {
    const length = section.length;

    let headOffset = section === this.head.section ?
      Math.min(this.head.offset, length) : 0;
    let tailOffset = section === this.tail.section ?
      Math.min(this.tail.offset, length) : length;

    return Range.create(section, headOffset, section, tailOffset);
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
