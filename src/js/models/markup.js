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

let markupsOfType = {};

class Markup {
  /*
   * @param {attributes} array flat array of key1,value1,key2,value2,...
   */
  constructor(tagName, attributes=[]) {
    this.tagName = tagName.toLowerCase();
    this.attributes = attributes;
    this.type = MARKUP_TYPE;

    if (VALID_MARKUP_TAGNAMES.indexOf(this.tagName) === -1) {
      throw new Error(`Cannot create markup of tagName ${tagName}`);
    }
  }

  static ofType(tagName) {
    tagName = normalizeTagName(tagName);
    if (!markupsOfType[tagName]) {
      markupsOfType[tagName] = new Markup(tagName);
    }

    return markupsOfType[tagName];
  }

  static isValidElement(element) {
    let tagName = element.tagName.toLowerCase();
    return VALID_MARKUP_TAGNAMES.indexOf(tagName) !== -1;
  }
}

export default Markup;
