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
  constructor(tagName, attributes=[]) {
    this.tagName = tagName.toLowerCase();
    this.attributes = attributes;
    this.type = MARKUP_TYPE;

    if (VALID_MARKUP_TAGNAMES.indexOf(this.tagName) === -1) {
      throw new Error(`Cannot create markup of tagName ${tagName}`);
    }
  }
}
