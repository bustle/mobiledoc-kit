import { normalizeTagName } from '../utils/dom-utils'
import { filterObject } from '../utils/array-utils'
import { MARKUP_TYPE } from './types'
import assert from '../utils/assert'

export const VALID_MARKUP_TAGNAMES = [
  'a',
  'b',
  'code',
  'em',
  'i',
  's', // strikethrough
  'del', // deleted text (also strikethrough)
  'strong',
  'sub', // subscript
  'sup', // superscript
  'u',
].map(normalizeTagName)

export const VALID_ATTRIBUTES = ['href', 'rel']

/**
 * A Markup is similar with an inline HTML tag that might be added to
 * text to modify its meaning and/or display. Examples of types of markup
 * that could be added are bold ('b'), italic ('i'), strikethrough ('s'), and `a` tags (links).
 * @property {String} tagName
 */
export default class Markup {
  tagName: string
  attributes: { [key: string]: unknown }

  type = MARKUP_TYPE

  /*
   * @param {Object} attributes key-values
   */
  constructor(tagName: string, attributes = {}) {
    assert(`Cannot create markup of tagName ${tagName}`, VALID_MARKUP_TAGNAMES.indexOf(tagName) !== -1)
    this.tagName = normalizeTagName(tagName)

    assert('Must use attributes object param (not array) for Markup', !Array.isArray(attributes))
    this.attributes = filterObject(attributes, VALID_ATTRIBUTES)
  }

  /**
   * Whether text in the forward direction of the cursor (i.e. to the right in ltr text)
   * should be considered to have this markup applied to it.
   * @private
   */
  isForwardInclusive() {
    return this.tagName === normalizeTagName('a') ? false : true
  }

  isBackwardInclusive() {
    return false
  }

  hasTag(tagName: string) {
    return this.tagName === normalizeTagName(tagName)
  }

  /**
   * Returns the attribute value
   * @param {String} name, e.g. "href"
   */
  getAttribute(name: string) {
    return this.attributes[name]
  }

  static isValidElement(element: Element) {
    const tagName = normalizeTagName(element.tagName)
    return VALID_MARKUP_TAGNAMES.indexOf(tagName) !== -1
  }
}
