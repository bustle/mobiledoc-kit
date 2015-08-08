import {
  normalizeTagName
} from '../utils/dom-utils';

export const DEFAULT_TAG_NAME = normalizeTagName('p');
export const VALID_MARKUP_SECTION_TAGNAMES = [
  'p', 'h3', 'h2', 'h1', 'blockquote', 'ul', 'ol'
].map(normalizeTagName);
export const MARKUP_SECTION_TYPE = 'markup-section';
import LinkedList from "content-kit-editor/utils/linked-list";
import LinkedItem from "content-kit-editor/utils/linked-item";

export default class Section extends LinkedItem {
  constructor(tagName, markers=[]) {
    super();
    this.markers = new LinkedList({
      adoptItem: (marker) => {
        marker.section = this;
      },
      freeItem: (marker) => {
        marker.section = null;
      }
    });
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

  replaceMarker(previousMarker, newMarkers=[]) {
    let nextMarker = previousMarker.next;
    newMarkers.forEach(marker => {
      this.markers.insertBefore(marker, nextMarker);
    });
    this.removeMarker(previousMarker);
  }

  prependMarker(marker) {
    this.markers.prepend(marker);
  }

  appendMarker(marker) {
    this.markers.append(marker);
  }

  removeMarker(marker) {
    this.markers.remove(marker);
  }

  insertMarkerAfter(marker, previousMarker) {
    this.markers.insertAfter(marker, previousMarker);
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

    left = (middle.prev ? this.markers.takeRange(null, middle.prev) : []);
    right = (middle.next ? this.markers.takeRange(middle.next, null) : []);

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
    let length = 0;
    let lastMarker = null;

    if (offset === 0) {
      return this.markers.head;
    }

    this.markers.detect((marker) => {
      if (length < offset) {
        lastMarker = marker;
        length += marker.length;
        return false;
      } else {
        return true; // stop iteration
      }
    });

    if (length > offset) {
      return lastMarker;
    } else if (length === offset) {
      return (leftInclusive ? lastMarker.next : lastMarker);
    }
  }
}
