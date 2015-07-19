const MARKUP_TYPE = 'markup';

export default class Markup {
  constructor(tagName, attributes={}) {
    this.tagName = tagName.toLowerCase();
    this.attributes = attributes;
    this.type = MARKUP_TYPE;
  }
}
