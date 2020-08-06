import { isArrayEqual } from '../utils/array-utils'
import Markuperable from '../utils/markuperable'
import assert from '../utils/assert'
import { Type } from './types'
import Markup from './markup'
import Markerable from './_markerable'
import RenderNode from './render-node'

// Unicode uses a pair of "surrogate" characters" (a high- and low-surrogate)
// to encode characters outside the basic multilingual plane (like emoji and
// some languages).
// These values are the unicode code points for the start and end of the
// high- and low-surrogate characters.
// See "high surrogate" and "low surrogate" on
// https://en.wikipedia.org/wiki/Unicode_block
export const HIGH_SURROGATE_RANGE = [0xd800, 0xdbff]
export const LOW_SURROGATE_RANGE = [0xdc00, 0xdfff]

export default class Marker extends Markuperable {
  type: Type = Type.MARKER
  isMarker = true

  value: string

  builder: any
  markups: Markup[] = []
  section: Markerable | null = null
  parent: Markerable | null = null
  renderNode: RenderNode | null = null

  constructor(value = '', markups: Markup[] = []) {
    super()
    this.value = value
    assert('Marker must have value', value !== undefined && value !== null)
    markups.forEach(m => this.addMarkup(m))
  }

  clone() {
    const clonedMarkups = this.markups.slice()
    return this.builder.createMarker(this.value, clonedMarkups)
  }

  get isEmpty() {
    return this.isBlank
  }

  get isBlank() {
    return this.length === 0
  }

  charAt(offset: number) {
    return this.value.slice(offset, offset + 1)
  }

  /**
   * A marker's text is equal to its value.
   * Compare with an Atom which distinguishes between text and value
   */
  get text() {
    return this.value
  }

  get length() {
    return this.value.length
  }

  // delete the character at this offset,
  // update the value with the new value
  deleteValueAtOffset(offset: number) {
    assert('Cannot delete value at offset outside bounds', offset >= 0 && offset <= this.length)

    let width = 1
    let code = this.value.charCodeAt(offset)
    if (code >= HIGH_SURROGATE_RANGE[0] && code <= HIGH_SURROGATE_RANGE[1]) {
      width = 2
    } else if (code >= LOW_SURROGATE_RANGE[0] && code <= LOW_SURROGATE_RANGE[1]) {
      width = 2
      offset = offset - 1
    }

    const [left, right] = [this.value.slice(0, offset), this.value.slice(offset + width)]
    this.value = left + right

    return width
  }

  canJoin(other: Marker) {
    return other && other.isMarker && isArrayEqual(this.markups, other.markups)
  }

  textUntil(offset: number) {
    return this.value.slice(0, offset)
  }

  split(offset = 0, endOffset = this.length) {
    let markers = [
      this.builder.createMarker(this.value.substring(0, offset)),
      this.builder.createMarker(this.value.substring(offset, endOffset)),
      this.builder.createMarker(this.value.substring(endOffset)),
    ]

    this.markups.forEach(mu => markers.forEach(m => m.addMarkup(mu)))
    return markers
  }

  /**
   * @return {Array} 2 markers either or both of which could be blank
   */
  splitAtOffset(offset: number) {
    assert('Cannot split a marker at an offset > its length', offset <= this.length)
    let { value, builder } = this

    let pre = builder.createMarker(value.substring(0, offset))
    let post = builder.createMarker(value.substring(offset))

    this.markups.forEach(markup => {
      pre.addMarkup(markup)
      post.addMarkup(markup)
    })

    return [pre, post]
  }
}
