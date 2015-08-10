export const MARKER_TYPE = 'marker';

import {
  normalizeTagName
} from '../utils/dom-utils';
import {
  detect,
  difference
} from 'content-kit-editor/utils/array-utils';

const Marker = class Marker {
  constructor(value='', markups=[]) {
    this.value = value;
    this.markups = [];
    this.type = MARKER_TYPE;

    if (markups && markups.length) {
      markups.forEach(m => this.addMarkup(m));
    }
  }

  clone() {
    const clonedMarkups = this.markups.slice();
    return new this.constructor(this.value, clonedMarkups);
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
    const joined = new Marker(this.value + other.value);
    this.markups.forEach(m => joined.addMarkup(m));
    other.markups.forEach(m => joined.addMarkup(m));

    return joined;
  }

  split(offset=0, endOffset=this.length) {
    let markers = [];

    if (offset !== 0) {
      markers.push(
        new Marker(this.value.substring(0, offset))
      );
    }

    markers.push(
      new Marker(this.value.substring(offset, endOffset))
    );

    if (endOffset < this.length) {
      markers.push(
        new Marker(this.value.substring(endOffset))
      );
    }

    this.markups.forEach(mu => markers.forEach(m => m.addMarkup(mu)));
    return markers;
  }

  get openedMarkups() {
    let previousMarkups = this.previousSibling && this.previousSibling.markups;
    return difference(this.markups, previousMarkups || []);
  }

  get closedMarkups() {
    let nextMarkups = this.nextSibling && this.nextSibling.markups;
    return difference(this.markups, nextMarkups || []);
  }

  // FIXME this should be implemented as a linked list
  get nextSibling() {
    let index = this.section.markers.indexOf(this);
    if (index > -1 && index < this.section.markers.length-1) {
      return this.section.markers[index + 1];
    }
  }

  get previousSibling() {
    let index = this.section.markers.indexOf(this);
    if (index > 0) {
      return this.section.markers[index - 1];
    }
  }
};

export default Marker;
