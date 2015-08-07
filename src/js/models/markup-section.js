import {
  normalizeTagName
} from '../utils/dom-utils';

export const DEFAULT_TAG_NAME = normalizeTagName('p');
export const VALID_MARKUP_SECTION_TAGNAMES = [
  'p', 'h3', 'h2', 'h1', 'blockquote', 'ul', 'ol'
].map(normalizeTagName);
export const MARKUP_SECTION_TYPE = 'markup-section';
import LinkedItem from "content-kit-editor/utils/linked-item";

export default class Section extends LinkedItem {
  constructor(tagName, markers=[]) {
    super();
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

  isEmpty() {
    return this.markers.length === 0;
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

  /**
   * Splits the marker at the offset (until the endOffset, if given)
   * into 1, 2, or 3 markers and replaces the existing marker
   * with the new ones
   */
  splitMarker(marker, offset, endOffset=marker.length) {
    const newMarkers = marker.split(offset, endOffset);
    this.replaceMarker(marker, newMarkers);
    return newMarkers;
  }

  replaceMarker(oldMarker, newMarkers=[]) {
    let previousMarker = oldMarker;

    let i = newMarkers.length;
    while (i--) {
      let currentMarker = newMarkers[i];
      this.insertMarkerAfter(currentMarker, previousMarker);
    }

    this.removeMarker(oldMarker);
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

  get nextSibling() {
    return this.next;
  }
}
