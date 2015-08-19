export const MARKER_TYPE = 'marker';

import {
  normalizeTagName
} from '../utils/dom-utils';
import {
  detect,
  commonItemLength
} from 'content-kit-editor/utils/array-utils';
import LinkedItem from "content-kit-editor/utils/linked-item";

const Marker = class Marker extends LinkedItem {
  constructor(value='', markups=[]) {
    super();
    this.value = value;
    this.markups = [];
    this.type = MARKER_TYPE;

    if (markups && markups.length) {
      markups.forEach(m => this.addMarkup(m));
    }
  }

  clone() {
    const clonedMarkups = this.markups.slice();
    return this.builder.createMarker(this.value, clonedMarkups);
  }

  get isEmpty() {
    return this.length === 0;
  }

  get length() {
    return this.value.length;
  }

  truncateFrom(offset) {
    this.value = this.value.substr(0, offset);
  }

  truncateTo(offset) {
    this.value = this.value.substr(offset);
  }

  clearMarkups() {
    this.markups = [];
  }

  addMarkup(markup) {
    this.markups.push(markup);
  }

  // find the value of the absolute offset in this marker's parent section
  offsetInParent(offset) {
    const parent = this.section;
    const markers = parent.markers;

    let foundMarker = false;
    let parentOffset = 0;
    let marker = markers.head;
    var length;
    while (marker && !foundMarker) {
      length = marker.length;
      if (marker === this) {
        foundMarker = true;
        length = offset;
      }

      parentOffset += length;
      marker = marker.next;
    }

    if (!foundMarker) {
      throw new Error('offsetInParent could not find offset for marker');
    }
    return parentOffset;
  }

  removeMarkup(markup) {
    const index = this.markups.indexOf(markup);
    if (index !== -1) {
      this.markups.splice(index, 1);
    }
  }

  // delete the character at this offset,
  // update the value with the new value
  deleteValueAtOffset(offset) {
    const [ left, right ] = [
      this.value.slice(0, offset),
      this.value.slice(offset+1)
    ];
    this.value = left + right;
  }

  hasMarkup(tagNameOrMarkup) {
    if (typeof tagNameOrMarkup === 'string') {
      let tagName = normalizeTagName(tagNameOrMarkup);
      return detect(this.markups, markup => markup.tagName === tagName);
    } else {
      let targetMarkup = tagNameOrMarkup;
      return detect(this.markups, markup => markup === targetMarkup);
    }
  }

  getMarkup(tagName) {
    return this.hasMarkup(tagName);
  }

  join(other) {
    const joined = this.builder.createMarker(this.value + other.value);
    this.markups.forEach(m => joined.addMarkup(m));
    other.markups.forEach(m => joined.addMarkup(m));

    return joined;
  }

  split(offset=0, endOffset=this.length) {
    let markers = [];

    markers = [
      this.builder.createMarker(this.value.substring(0, offset)),
      this.builder.createMarker(this.value.substring(offset, endOffset)),
      this.builder.createMarker(this.value.substring(endOffset))
    ];

    this.markups.forEach(mu => markers.forEach(m => m.addMarkup(mu)));
    return markers;
  }

  get openedMarkups() {
    let count = 0;
    if (this.prev) {
      count = commonItemLength(this.markups, this.prev.markups);
    }

    return this.markups.slice(count);
  }

  get closedMarkups() {
    let count = 0;
    if (this.next) {
      count = commonItemLength(this.markups, this.next.markups);
    }

    return this.markups.slice(count);
  }

};

export default Marker;
