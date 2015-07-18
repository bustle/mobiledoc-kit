export const MARKUP_TYPES = ['b', 'a', 'i', 'em', 'strong'];
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
      markup = {type: markup};
    }
    let {type, attributes} = markup;
    type = type.toLowerCase();

    if (MARKUP_TYPES.indexOf(type) === -1) {
      throw new Error(`Cannot add markup of type ${type}`);
    }

    markup = {type, attributes};

    if (!this.hasMarkup(type)) {
      this.markups.push(markup);
    }
  }

  hasMarkup(type) {
    return detect(this.markups, markup => markup.type === type);
  }

  getMarkup(type) {
    return this.hasMarkup(type);
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
