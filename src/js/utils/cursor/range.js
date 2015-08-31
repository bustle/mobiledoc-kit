export default class Range {
  constructor(head, tail) {
    this.head = head;
    this.tail = tail;
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

  static fromPositions(head, tail) {
    return new Range(head, tail);
  }
}
