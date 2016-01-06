import { MARKER_TYPE } from './types';
import { normalizeTagName } from '../utils/dom-utils';
import { detect, commonItemLength, forEach, filter } from '../utils/array-utils';
import LinkedItem from '../utils/linked-item';
import assert from '../utils/assert';

// Unicode uses a pair of "surrogate" characters" (a high- and low-surrogate)
// to encode characters outside the basic multilingual plane (like emoji and
// some languages).
// These values are the unicode code points for the start and end of the
// high- and low-surrogate characters.
// See "high surrogate" and "low surrogate" on
// https://en.wikipedia.org/wiki/Unicode_block
const HIGH_SURROGATE_RANGE = [0xD800, 0xDBFF];
const LOW_SURROGATE_RANGE  = [0xDC00, 0xDFFF];

const Marker = class Marker extends LinkedItem {
  constructor(value='', markups=[]) {
    super();
    this.value = value;
    this.markups = [];
    this.type = MARKER_TYPE;
    this.isMarker = true;
    markups.forEach(m => this.addMarkup(m));
  }

  clone() {
    const clonedMarkups = this.markups.slice();
    return this.builder.createMarker(this.value, clonedMarkups);
  }

  get isEmpty() {
    return this.length === 0;
  }

  get isBlank() {
    return this.value.length === 0;
  }

  get length() {
    return this.value.length;
  }

  clearMarkups() {
    this.markups = [];
  }

  addMarkup(markup) {
    this.markups.push(markup);
  }

  removeMarkup(markupOrMarkupCallback) {
    let callback;
    if (typeof markupOrMarkupCallback === 'function') {
      callback = markupOrMarkupCallback;
    } else {
      let markup = markupOrMarkupCallback;
      callback = (_markup) => _markup === markup;
    }

    forEach(
      filter(this.markups, callback),
      m => this._removeMarkup(m)
    );
  }

  _removeMarkup(markup) {
    const index = this.markups.indexOf(markup);
    if (index !== -1) {
      this.markups.splice(index, 1);
    }
  }

  /**
   * delete the character at this offset,
   * update the value with the new value.
   * This method mutates the marker.
   *
   * @return {Number} the length of the change
   * (usually 1 but can be 2 when deleting an emoji, e.g.)
   */
  deleteValueAtOffset(offset) {
    assert('Cannot delete value at offset outside bounds',
           offset >= 0 && offset <= this.length);

    let width = 1;
    let code = this.value.charCodeAt(offset);
    if (code >= HIGH_SURROGATE_RANGE[0] && code <= HIGH_SURROGATE_RANGE[1]) {
      width = 2;
    } else if (code >= LOW_SURROGATE_RANGE[0] && code <= LOW_SURROGATE_RANGE[1]) {
      width = 2;
      offset = offset - 1;
    }

    const [ left, right ] = [
      this.value.slice(0, offset),
      this.value.slice(offset+width)
    ];
    this.value = left + right;

    return width;
  }

  hasMarkup(tagNameOrMarkup) {
    return !!this.getMarkup(tagNameOrMarkup);
  }

  getMarkup(tagNameOrMarkup) {
    if (typeof tagNameOrMarkup === 'string') {
      let tagName = normalizeTagName(tagNameOrMarkup);
      return detect(this.markups, markup => markup.tagName === tagName);
    } else {
      let targetMarkup = tagNameOrMarkup;
      return detect(this.markups, markup => markup === targetMarkup);
    }
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

  /**
   * @return {Array} 2 markers either or both of which could be blank
   */
  splitAtOffset(offset) {
    assert('Cannot split a marker at an offset > its length',
           offset <= this.length);
    let { value, builder } = this;

    let pre  = builder.createMarker(value.substring(0, offset));
    let post = builder.createMarker(value.substring(offset));

    this.markups.forEach(markup => {
      pre.addMarkup(markup);
      post.addMarkup(markup);
    });

    return [pre, post];
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
