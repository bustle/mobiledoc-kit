import { MARKER_TYPE } from './types';
import mixin from '../utils/mixin';
import MarkuperableMixin from '../utils/markuperable';
import LinkedItem from '../utils/linked-item';
import assert from '../utils/assert';
import { isArrayEqual } from '../utils/array-utils';

// Unicode uses a pair of "surrogate" characters" (a high- and low-surrogate)
// to encode characters outside the basic multilingual plane (like emoji and
// some languages).
// These values are the unicode code points for the start and end of the
// high- and low-surrogate characters.
// See "high surrogate" and "low surrogate" on
// https://en.wikipedia.org/wiki/Unicode_block
export const HIGH_SURROGATE_RANGE = [0xD800, 0xDBFF];
export const LOW_SURROGATE_RANGE  = [0xDC00, 0xDFFF];

const Marker = class Marker extends LinkedItem {
  constructor(value='', markups=[]) {
    super();
    this.value = value;
    assert('Marker must have value', value !== undefined && value !== null);
    this.markups = [];
    this.type = MARKER_TYPE;
    this.isMarker = true;
    this.isAtom = false;
    markups.forEach(m => this.addMarkup(m));
  }

  clone() {
    const clonedMarkups = this.markups.slice();
    return this.builder.createMarker(this.value, clonedMarkups);
  }

  get isEmpty() {
    return this.isBlank;
  }

  get isBlank() {
    return this.length === 0;
  }

  charAt(offset) {
    return this.value.slice(offset, offset+1);
  }

  /**
   * A marker's text is equal to its value.
   * Compare with an Atom which distinguishes between text and value
   */
  get text() {
    return this.value;
  }

  get length() {
    return this.value.length;
  }

  // delete the character at this offset,
  // update the value with the new value
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

  canJoin(other) {
    return other && other.isMarker && isArrayEqual(this.markups, other.markups);
  }

  textUntil(offset) {
    return this.value.slice(0, offset);
  }

  split(offset=0, endOffset=this.length) {
    let markers = [
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

};

mixin(Marker, MarkuperableMixin);

export default Marker;
