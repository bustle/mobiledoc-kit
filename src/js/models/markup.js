import { normalizeTagName } from '../utils/dom-utils';
import { MARKUP_TYPE } from './types';

export const VALID_MARKUP_TAGNAMES = [
  'b',
  'i',
  'strong',
  'em',
  'a',
  'li'
].map(normalizeTagName);

class Markup {
  /*
   * @param {Object} attributes key-values
   */
  constructor(tagName, attributes={}) {
    this.tagName = normalizeTagName(tagName);
    if (Array.isArray(attributes)) {
      throw new Error('Must use attributes object param (not array) to Markup');
    }
    this.attributes = attributes;
    this.type = MARKUP_TYPE;

    if (VALID_MARKUP_TAGNAMES.indexOf(this.tagName) === -1) {
      throw new Error(`Cannot create markup of tagName ${tagName}`);
    }
  }

  hasTag(tagName) {
    return this.tagName === normalizeTagName(tagName);
  }

  static isValidElement(element) {
    const tagName = normalizeTagName(element.tagName);
    return VALID_MARKUP_TAGNAMES.indexOf(tagName) !== -1;
  }
}

export default Markup;
