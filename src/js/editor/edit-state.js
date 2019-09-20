import {
  contains,
  isArrayEqual,
  objectToSortedKVArray
} from 'mobiledoc-kit/utils/array-utils';
import Range from 'mobiledoc-kit/utils/cursor/range';

/**
 * Used by {@link Editor} to manage its current state (cursor, active markups
 * and active sections).
 * @private
 */
class EditState {
  constructor(editor) {
    this.editor = editor;

    let defaultState = {
      range: Range.blankRange(),
      activeMarkups: [],
      activeSections: [],
      activeSectionTagNames: [],
      activeSectionAttributes: {}
    };

    this.prevState = this.state = defaultState;
  }

  updateRange(newRange) {
    this.prevState = this.state;
    this.state = this._readState(newRange);
  }

  destroy() {
    this.editor = null;
    this.prevState = this.state = null;
  }

  /**
   * @return {Boolean}
   */
  rangeDidChange() {
    let { state: { range } , prevState: {range: prevRange} } = this;

    return !prevRange.isEqual(range);
  }

  /**
   * @return {Boolean} Whether the input mode (active markups or active section tag names)
   * has changed.
   */
  inputModeDidChange() {
    let { state, prevState } = this;
    return (!isArrayEqual(state.activeMarkups, prevState.activeMarkups) ||
            !isArrayEqual(state.activeSectionTagNames, prevState.activeSectionTagNames) ||
            !isArrayEqual(objectToSortedKVArray(state.activeSectionAttributes), objectToSortedKVArray(prevState.activeSectionAttributes)));
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
   * @return {Object}
   */
  get activeSectionAttributes() {
    return this.state.activeSectionAttributes;
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

  _readState(range) {
    let state = {
      range,
      activeMarkups:  this._readActiveMarkups(range),
      activeSections: this._readActiveSections(range)
    };
    // Section objects are 'live', so to check that they changed, we
    // need to map their tagNames now (and compare to mapped tagNames later).
    // In addition, to catch changes from ul -> ol, we keep track of the
    // un-nested tag names (otherwise we'd only see li -> li change)
    state.activeSectionTagNames = state.activeSections.map(s => {
      return s.isNested ? s.parent.tagName : s.tagName;
    });
    state.activeSectionAttributes = this._readSectionAttributes(state.activeSections);
    return state;
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

  _readSectionAttributes(sections) {
    return sections.reduce((sectionAttributes, s) => {
      let attributes = s.isNested ? s.parent.attributes : s.attributes;
      Object.keys(attributes || {}).forEach(attrName => {
        let camelizedAttrName = attrName.replace(/^data-md-/, '');
        let attrValue = attributes[attrName];
        sectionAttributes[camelizedAttrName] = sectionAttributes[camelizedAttrName] || [];
        if (!contains(sectionAttributes[camelizedAttrName], attrValue)) {
          sectionAttributes[camelizedAttrName].push(attrValue);
        }
      });
      return sectionAttributes;
    }, {});
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
