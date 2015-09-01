import {
  normalizeTagName
} from '../utils/dom-utils';
export const MARKUP_TYPE = 'markup';
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
   * @param {attributes} array flat array of key1,value1,key2,value2,...
   */
  constructor(tagName, attributes=[]) {
    this.tagName = normalizeTagName(tagName);
    this.attributes = attributes;
    this.type = MARKUP_TYPE;

    if (VALID_MARKUP_TAGNAMES.indexOf(this.tagName) === -1) {
      throw new Error(`Cannot create markup of tagName ${tagName}`);
    }
  }

  hasTag(tagName) {
    tagName = normalizeTagName(tagName);
    return this.tagName === tagName;
  }

  static isValidElement(element) {
    let tagName = normalizeTagName(element.tagName);
    return VALID_MARKUP_TAGNAMES.indexOf(tagName) !== -1;
  }
}

export default Markup;
