import { contains, isArrayEqual, objectToSortedKVArray } from '../utils/array-utils'
import Range from '../utils/cursor/range'
import { Option, Dict } from '../utils/types'
import Editor from './editor'
import { Cloneable } from '../models/_cloneable'
import Section from '../models/_section'
import Markup from '../models/markup'
import { TagNameable } from '../models/_tag-nameable'
import { getSectionAttributes } from '../models/_attributable'

interface EditStateState {
  range: Range
  activeMarkups: Markup[]
  activeSections: Section[]
  activeSectionTagNames: string[]
  activeSectionAttributes: Dict<string[]>
}

/**
 * Used by {@link Editor} to manage its current state (cursor, active markups
 * and active sections).
 * @private
 */
export default class EditState {
  editor: Option<Editor>
  state: Option<EditStateState>
  prevState: Option<EditStateState>

  constructor(editor: Editor) {
    this.editor = editor

    let defaultState: EditStateState = {
      range: Range.blankRange(),
      activeMarkups: [],
      activeSections: [],
      activeSectionTagNames: [],
      activeSectionAttributes: {},
    }

    this.prevState = this.state = defaultState
  }

  updateRange(newRange: Range) {
    this.prevState = this.state
    this.state = this._readState(newRange)
  }

  destroy() {
    this.editor = null
    this.prevState = this.state = null
  }

  /**
   * @return {Boolean}
   */
  rangeDidChange(): boolean {
    const { state, prevState } = this
    const { range } = state!
    const { range: prevRange } = prevState!

    return !prevRange.isEqual(range)
  }

  /**
   * @return {Boolean} Whether the input mode (active markups or active section tag names)
   * has changed.
   */
  inputModeDidChange(): boolean {
    const state = this.state!
    const prevState = this.prevState!

    return (
      !isArrayEqual(state.activeMarkups, prevState.activeMarkups) ||
      !isArrayEqual(state.activeSectionTagNames, prevState.activeSectionTagNames) ||
      !isArrayEqual(
        objectToSortedKVArray(state.activeSectionAttributes),
        objectToSortedKVArray(prevState.activeSectionAttributes)
      )
    )
  }

  /**
   * @return {Range}
   */
  get range(): Range {
    return this.state!.range
  }

  /**
   * @return {Section[]}
   */
  get activeSections(): Section[] {
    return this.state!.activeSections
  }

  /**
   * @return {Object}
   */
  get activeSectionAttributes(): Dict<string[]> {
    return this.state!.activeSectionAttributes
  }

  /**
   * @return {Markup[]}
   */
  get activeMarkups(): Markup[] {
    return this.state!.activeMarkups
  }

  /**
   * Update the editor's markup state. This is used when, e.g.,
   * a user types meta+B when the editor has a cursor but no selected text;
   * in this case the editor needs to track that it has an active "b" markup
   * and apply it to the next text the user types.
   */
  toggleMarkupState(markup: Markup) {
    if (contains(this.activeMarkups, markup)) {
      this._removeActiveMarkup(markup)
    } else {
      this._addActiveMarkup(markup)
    }
  }

  _readState(range: Range): EditStateState {
    let state: Partial<EditStateState> = {
      range,
      activeMarkups: this._readActiveMarkups(range),
      activeSections: this._readActiveSections(range),
    }
    // Section objects are 'live', so to check that they changed, we
    // need to map their tagNames now (and compare to mapped tagNames later).
    // In addition, to catch changes from ul -> ol, we keep track of the
    // un-nested tag names (otherwise we'd only see li -> li change)
    state.activeSectionTagNames = state.activeSections!.map(s => {
      return s.isNested ? ((s.parent as unknown) as TagNameable).tagName : ((s as unknown) as TagNameable).tagName
    })
    state.activeSectionAttributes = this._readSectionAttributes(state.activeSections!)

    return state as EditStateState
  }

  _readActiveSections(range: Range) {
    const { head, tail } = range
    const { editor } = this
    const { post } = editor!

    if (range.isBlank) {
      return []
    } else {
      return post.sections.readRange(head.section as Cloneable<Section>, tail.section as Cloneable<Section>)
    }
  }

  _readActiveMarkups(range: Range) {
    const { editor } = this
    const { post } = editor!

    return post.markupsInRange(range)
  }

  _readSectionAttributes(sections: Section[]) {
    return sections.reduce<Dict<string[]>>((sectionAttributes, s) => {
      let attributes: Dict<string> = getSectionAttributes(s)

      Object.keys(attributes).forEach(attrName => {
        let camelizedAttrName = attrName.replace(/^data-md-/, '')
        let attrValue = attributes[attrName]

        sectionAttributes[camelizedAttrName] = sectionAttributes[camelizedAttrName] || []

        if (!contains(sectionAttributes[camelizedAttrName], attrValue)) {
          sectionAttributes[camelizedAttrName].push(attrValue)
        }
      })

      return sectionAttributes
    }, {})
  }

  _removeActiveMarkup(markup: Markup) {
    let index = this.state!.activeMarkups.indexOf(markup)
    this.state!.activeMarkups.splice(index, 1)
  }

  _addActiveMarkup(markup: Markup) {
    this.state!.activeMarkups.push(markup)
  }
}
