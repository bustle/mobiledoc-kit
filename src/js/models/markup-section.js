import Markerable from './_markerable';
import { normalizeTagName } from '../utils/dom-utils';

export const VALID_MARKUP_SECTION_TAGNAMES = [
  'p', 'h3', 'h2', 'h1', 'blockquote', 'ul', 'ol'
].map(normalizeTagName);
export const DEFAULT_TAG_NAME = VALID_MARKUP_SECTION_TAGNAMES[0];

export const MARKUP_SECTION_TYPE = 'markup-section';

const MarkupSection = class MarkupSection extends Markerable {
  constructor(tagName=DEFAULT_TAG_NAME, markers=[]) {
    super(tagName, markers);
    this.type = MARKUP_SECTION_TYPE;
  }

  set tagName(val) {
    this._tagName = normalizeTagName(val);
  }

  get tagName() {
    return this._tagName;
  }

  setTagName(newTagName) {
    newTagName = normalizeTagName(newTagName);
    if (VALID_MARKUP_SECTION_TAGNAMES.indexOf(newTagName) === -1) {
      throw new Error(`Cannot change section tagName to "${newTagName}`);
    }
    this.tagName = newTagName;
  }

  resetTagName() {
    this.tagName = DEFAULT_TAG_NAME;
  }

  splitAtMarker(marker, offset=0) {
    let [beforeSection, afterSection] = [
      this.builder.createMarkupSection(this.tagName, []),
      // FIXME we probably want to make it so that we create a new default markup
      // section instead of copying the same tagname to the section below
      this.builder.createMarkupSection(this.tagName, [])
    ];

    return this._redistributeMarkers(beforeSection, afterSection, marker, offset);
  }

};

export default MarkupSection;
