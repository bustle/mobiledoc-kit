export const MARKUP_TAG_NAMES = ['b', 'a', 'i', 'em', 'strong'];
const MARKER_TYPE = 'marker';

import { detect } from 'content-kit-editor/utils/array-utils';

const Marker = class Marker {
  constructor(value='', markups=[]) {
    this.value = value;
    this.markups = [];
    this.type = MARKER_TYPE;

    markups.forEach(m => this.addMarkup(m));
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

  addMarkup(markup) {
    // simple markup, no attributes
    if (typeof markup === 'string') {
      markup = {tagName: markup};
    }
    let {tagName, attributes} = markup;
    tagName = tagName.toLowerCase();

    if (MARKUP_TAG_NAMES.indexOf(tagName) === -1) {
      throw new Error(`Cannot add markup of tagName ${tagName}`);
    }

    markup = {tagName, attributes};

    if (!this.hasMarkup(tagName)) {
      this.markups.push(markup);
    }
  }

  hasMarkup(tagName) {
    tagName = tagName.toLowerCase();
    return detect(this.markups, markup => markup.tagName === tagName);
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

  split(offset) {
    const [m1, m2] = [
      new Marker(this.value.substr(0, offset)),
      new Marker(this.value.substr(offset))
    ];
    this.markups.forEach(m => {m1.addMarkup(m); m2.addMarkup(m);});

    return [m1, m2];
  }
};

export default Marker;
