import { normalizeTagName } from '../utils/dom-utils';
import { detect, commonItemLength, forEach, filter } from '../utils/array-utils';

export default class Markerupable {

  clearMarkups() {
    this.markups = [];
  }

  addMarkup(markup) {
    this.markups.push(markup);
  }

  addMarkupAtIndex(markup, index) {
    this.markups.splice(index, 0, markup);
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
}
