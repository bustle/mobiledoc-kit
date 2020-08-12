import { normalizeTagName } from './dom-utils'
import { detect, commonItemLength, forEach, filter } from './array-utils'
import { Option } from './types'
import Markup from '../models/markup'
import RenderNode from '../models/render-node'
import { Type } from '../models/types'
import Markerable from '../models/_markerable'

type MarkupCallback = (markup: Markup) => boolean
type MarkupOrMarkupCallback = Markup | MarkupCallback

export default abstract class Markuperable {
  markups: Markup[] = []

  prev: this | null = null
  next: this | null = null

  isAtom = false
  isMarker = false

  section: Option<Markerable> = null
  parent: Option<Markerable> = null

  renderNode: RenderNode | null = null

  abstract text: string
  abstract value: string
  abstract type: Type
  abstract length: number
  abstract clone(): Markuperable
  abstract isBlank: boolean
  abstract canJoin(other: Markuperable): boolean
  abstract textUntil(offset: number): string
  abstract splitAtOffset(offset: number): [Markuperable, Markuperable]

  charAt(offset: number) {
    return this.value.slice(offset, offset + 1)
  }

  clearMarkups() {
    this.markups = []
  }

  addMarkup(markup: Markup) {
    this.markups.push(markup)
  }

  addMarkupAtIndex(markup: Markup, index: number) {
    this.markups.splice(index, 0, markup)
  }

  removeMarkup(markupOrMarkupCallback: MarkupOrMarkupCallback) {
    let callback: MarkupCallback
    if (typeof markupOrMarkupCallback === 'function') {
      callback = markupOrMarkupCallback as MarkupCallback
    } else {
      let markup = markupOrMarkupCallback
      callback = _markup => _markup === markup
    }

    forEach(filter(this.markups, callback), m => this._removeMarkup(m))
  }

  _removeMarkup(markup: Markup) {
    const index = this.markups.indexOf(markup)
    if (index !== -1) {
      this.markups.splice(index, 1)
    }
  }

  hasMarkup(tagNameOrMarkup: string | Markup) {
    return !!this.getMarkup(tagNameOrMarkup)
  }

  getMarkup(tagNameOrMarkup: string | Markup) {
    if (typeof tagNameOrMarkup === 'string') {
      let tagName = normalizeTagName(tagNameOrMarkup)
      return detect(this.markups, markup => markup.tagName === tagName)
    } else {
      let targetMarkup = tagNameOrMarkup
      return detect(this.markups, markup => markup === targetMarkup)
    }
  }

  get openedMarkups() {
    let count = 0
    if (this.prev) {
      count = commonItemLength(this.markups, this.prev.markups)
    }

    return this.markups.slice(count)
  }

  get closedMarkups() {
    let count = 0
    if (this.next) {
      count = commonItemLength(this.markups, this.next.markups)
    }

    return this.markups.slice(count)
  }
}
