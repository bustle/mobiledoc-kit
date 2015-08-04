import {
  normalizeTagName
} from '../utils/dom-utils';

export const DEFAULT_TAG_NAME = normalizeTagName('p');
export const VALID_MARKUP_SECTION_TAGNAMES = [
  'p', 'h3', 'h2', 'h1', 'blockquote', 'ul', 'ol'
].map(normalizeTagName);
export const MARKUP_SECTION_TYPE = 'markup-section';

export default class Section {
  constructor(tagName, markers=[]) {
    this.markers = [];
    this.tagName = tagName || DEFAULT_TAG_NAME;
    this.type = MARKUP_SECTION_TYPE;
    this.element = null;

    markers.forEach(m => this.appendMarker(m));
  }

  set tagName(val) {
    this._tagName = normalizeTagName(val);
  }

  get tagName() {
    return this._tagName;
  }

  setTagName(newTagName) {
    newTagName = normalizeTagName(newTagName);
    if (VALID_MARKUP_SECTION_TAGNAMES.indexOf(newTagName) === -1) {
      throw new Error(`Cannot change section tagName to "${newTagName}`);
    }
    this.tagName = newTagName;
  }

  resetTagName() {
    this.tagName = DEFAULT_TAG_NAME;
  }

  prependMarker(marker) {
    marker.section = this;
    this.markers.unshift(marker);
  }

  appendMarker(marker) {
    marker.section = this;
    this.markers.push(marker);
  }

  removeMarker(marker) {
    const index = this.markers.indexOf(marker);
    if (index === -1) {
      throw new Error('Cannot remove not-found marker');
    }
    this.markers.splice(index, 1);
  }

  insertMarkerAfter(marker, previousMarker) {
    const index = this.markers.indexOf(previousMarker);
    if (index === -1) {
      throw new Error('Cannot insert marker after: ' + previousMarker);
    }

    marker.section = this;
    this.markers.splice(index + 1, 0, marker);
  }

  /**
   * @return {Array} 2 new sections
   */
  split(offset) {
    let left = [], right = [], middle;

    middle = this.markerContaining(offset);
    // end of section
    if (!middle) {
      return [
        new this.constructor(this.tagName, this.markers),
        new this.constructor(this.tagName, [])
      ];
    }
    const middleIndex = this.markers.indexOf(middle);

    for (let i=0; i<this.markers.length; i++) {
      if (i < middleIndex) { left.push(this.markers[i]); }
      if (i > middleIndex) { right.push(this.markers[i]); }
    }

    let leftLength = left.reduce((prev, cur) => prev + cur.length, 0);
    let middleOffset = offset - leftLength;

    let [leftMiddle, rightMiddle] = middle.split(middleOffset);
    left.push(leftMiddle);
    right.push(rightMiddle);

    return [
      new this.constructor(this.tagName, left),
      new this.constructor(this.tagName, right)
    ];
  }

  // mutates this by appending the other section's (cloned) markers to it
  join(otherSection) {
    otherSection.markers.forEach(m => this.appendMarker(m.clone()));
  }

  /**
   * A marker contains this offset if:
   *   * The offset is between the marker's start and end
   *   * the offset is between two markers and this is the right marker (and leftInclusive is true)
   *   * the offset is between two markers and this is the left marker (and leftInclusive is false)
   *
   * @return {Marker} The marker that contains this offset
   */
  markerContaining(offset, leftInclusive=true) {
    var length=0, i=0;

    if (offset === 0) { return this.markers[0]; }

    while (length < offset && i < this.markers.length) {
      length += this.markers[i].length;
      i++;
    }

    if (length > offset) {
      return this.markers[i-1];
    } else if (length === offset) {
      return this.markers[leftInclusive ? i : i-1];
    }
  }
}
