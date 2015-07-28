export const MARKUP_TYPE = 'markup';
export const VALID_MARKUP_TAGNAMES = [
  'b',
  'i',
  'strong',
  'em',
  'a',
  'li'
];

export default class Markup {
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
}
