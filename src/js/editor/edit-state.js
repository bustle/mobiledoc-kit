import { contains, isArrayEqual } from 'mobiledoc-kit/utils/array-utils';

export default class EditState {
  constructor(editor) {
    this.editor = editor;
    this._activeMarkups = [];
    this._activeSections = [];
  }

  get activeSections() {
    let { editor: { range, post } } = this;
    if (range.isBlank) {
      return [];
    } else {
      return post.sections.readRange(range.head.section, range.tail.section);
    }
  }

  get activeMarkups() {
    let { editor: { cursor, post, range } } = this;

    if (!cursor.hasCursor()) {
      return [];
    } else if (!this._activeMarkups) {
      this._activeMarkups = post.markupsInRange(range);
    }

    return this._activeMarkups;
  }

  toggleMarkupState(markup) {
    if (contains(this.activeMarkups, markup)) {
      this._removeActiveMarkup(markup);
    } else {
      this._addActiveMarkup(markup);
    }
  }

  /**
   * @return {Boolean} Whether the markups after reset have changed
   */
  resetActiveMarkups() {
    let prevMarkups = this._activeMarkups || [];
    delete this._activeMarkups;
    let markups = this.activeMarkups || [];

    let didChange = !isArrayEqual(prevMarkups, markups);
    return didChange;
  }

  _removeActiveMarkup(markup) {
    let index = this._activeMarkups.indexOf(markup);
    this._activeMarkups.splice(index, 1);
  }

  _addActiveMarkup(markup) {
    this._activeMarkups.push(markup);
  }
}
