import { contains, isArrayEqual } from 'mobiledoc-kit/utils/array-utils';

/**
 * Used by {@link Editor} to manage its current state (cursor, active markups
 * and active sections).
 * @private
 */
class EditState {
  constructor(editor) {
    this.editor = editor;
    this.prevState = this.state = this._readState();
  }

  /**
   * Cache the last state, force a reread of current state
   */
  reset() {
    this.prevState = this.state;
    this.state = this._readState();
  }

  /**
   * @return {Boolean} Whether the input mode (active markups or active section tag names)
   * has changed.
   */
  inputModeDidChange() {
    let { state, prevState } = this;
    return (!isArrayEqual(state.activeMarkups, prevState.activeMarkups) ||
            !isArrayEqual(state.activeSectionTagNames, prevState.activeSectionTagNames));
  }

  /**
   * @return {Boolean} Whether the range has changed.
   */
  rangeDidChange() {
    let { state, prevState } = this;
    return !state.range.isEqual(prevState.range);
  }

  /**
   * @return {Range}
   */
  get range() {
    return this.state.range;
  }

  /**
   * @return {Section[]}
   */
  get activeSections() {
    return this.state.activeSections;
  }

  /**
   * @return {Markup[]}
   */
  get activeMarkups() {
    return this.state.activeMarkups;
  }

  /**
   * Update the editor's markup state. This is used when, e.g.,
   * a user types meta+B when the editor has a cursor but no selected text;
   * in this case the editor needs to track that it has an active "b" markup
   * and apply it to the next text the user types.
   */
  toggleMarkupState(markup) {
    if (contains(this.activeMarkups, markup)) {
      this._removeActiveMarkup(markup);
    } else {
      this._addActiveMarkup(markup);
    }
  }

  _readState() {
    let range = this._readRange();
    let state = {
      range:          range,
      activeMarkups:  this._readActiveMarkups(range),
      activeSections: this._readActiveSections(range)
    };
    // Section objects are 'live', so to check that they changed, we
    // need to map their tagNames now (and compare to mapped tagNames later).
    state.activeSectionTagNames = state.activeSections.map(s => s.tagName);
    return state;
  }

  _readRange() {
    return this.editor.range;
  }

  _readActiveSections(range) {
    let { head, tail } = range;
    let { editor: { post } } = this;
    if (range.isBlank) {
      return [];
    } else {
      return post.sections.readRange(head.section, tail.section);
    }
  }

  _readActiveMarkups(range) {
    let { editor: { post } } = this;
    return post.markupsInRange(range);
  }

  _removeActiveMarkup(markup) {
    let index = this.state.activeMarkups.indexOf(markup);
    this.state.activeMarkups.splice(index, 1);
  }

  _addActiveMarkup(markup) {
    this.state.activeMarkups.push(markup);
  }
}

export default EditState;
