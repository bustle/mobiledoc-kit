import assert from 'mobiledoc-kit/utils/assert';
import {
  MARKUP_SECTION_TYPE,
  LIST_SECTION_TYPE
} from 'mobiledoc-kit/models/types';
import {
  DEFAULT_TAG_NAME as DEFAULT_MARKUP_SECTION_TAG_NAME
} from 'mobiledoc-kit/models/markup-section';

const UL_LI_REGEX = /^\* (.*)$/;
const OL_LI_REGEX = /^\d\.? (.*)$/;
const CR = '\r';
const LF = '\n';
const CR_REGEX = new RegExp(CR, 'g');
const CR_LF_REGEX = new RegExp(CR+LF, 'g');

export const SECTION_BREAK = LF;

function normalizeLineEndings(text) {
  return text.replace(CR_LF_REGEX, LF)
             .replace(CR_REGEX, LF);
}

export default class TextParser {
  constructor(builder, options) {
    this.builder = builder;
    this.options = options;

    this.post = this.builder.createPost();
    this.prevSection = null;
  }

  /**
   * @param {String} text to parse
   * @return {Post} a post abstract
   */
  parse(text) {
    text = normalizeLineEndings(text);
    text.split(SECTION_BREAK).forEach(text => {
      let section = this._parseSection(text);
      this._appendSection(section);
    });

    return this.post;
  }

  _parseSection(text) {
    let tagName = DEFAULT_MARKUP_SECTION_TAG_NAME,
        type    = MARKUP_SECTION_TYPE,
        section;

    if (UL_LI_REGEX.test(text)) {
      tagName = 'ul';
      type = LIST_SECTION_TYPE;
      text = text.match(UL_LI_REGEX)[1];
    } else if (OL_LI_REGEX.test(text)) {
      tagName = 'ol';
      type = LIST_SECTION_TYPE;
      text = text.match(OL_LI_REGEX)[1];
    }

    let markers = [this.builder.createMarker(text)];

    switch (type) {
      case LIST_SECTION_TYPE: {
        let item = this.builder.createListItem(markers);
        let list = this.builder.createListSection(tagName, [item]);
        section = list;
        break;
      }
      case MARKUP_SECTION_TYPE:
        section = this.builder.createMarkupSection(tagName, markers);
        break;
      default:
        assert(`Unknown type encountered ${type}`, false);
    }

    return section;
  }

  _appendSection(section) {
    let isSameListSection =
      section.isListSection &&
      this.prevSection && this.prevSection.isListSection &&
      this.prevSection.tagName === section.tagName;

    if (isSameListSection) {
      section.items.forEach(item => {
        this.prevSection.items.append(item.clone());
      });
    } else {
      this.post.sections.insertAfter(section, this.prevSection);
      this.prevSection = section;
    }
  }
}
