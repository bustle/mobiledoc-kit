const TEXT_NODE = 3;
const ELEMENT_NODE = 1;

import {
  DEFAULT_TAG_NAME,
  VALID_MARKUP_SECTION_TAGNAMES
} from 'content-kit-editor/models/markup-section';

import {
  VALID_LIST_SECTION_TAGNAMES
} from 'content-kit-editor/models/list-section';

import {
  VALID_LIST_ITEM_TAGNAMES
} from 'content-kit-editor/models/list-item';

import {
  LIST_SECTION_TYPE,
  LIST_ITEM_TYPE,
  MARKUP_SECTION_TYPE
} from 'content-kit-editor/models/types';

import {
  VALID_MARKUP_TAGNAMES
} from 'content-kit-editor/models/markup';

import {
  getAttributes,
  normalizeTagName,
  isTextNode
} from 'content-kit-editor/utils/dom-utils';

import {
  forEach,
  contains
} from 'content-kit-editor/utils/array-utils';

function isListSection(section) {
  return section.type === LIST_SECTION_TYPE;
}

function isListItem(section) {
  return section.type === LIST_ITEM_TYPE;
}

/**
 * parses an element into a section, ignoring any non-markup
 * elements contained within
 * @return {Section}
 */
export default class SectionParser {
  constructor(builder, options={}) {
    this.builder = builder;
    this.cardParsers = options.cardParsers || [];
  }

  parse(element) {
    this.sections = [];
    this.state = {};

    this._updateStateFromElement(element);

    let childNodes = isTextNode(element) ? [element] : element.childNodes;

    if (isListSection(this.state.section)) {
      this.parseListItems(childNodes);
    } else {
      forEach(childNodes, el => {
        this.parseNode(el);
      });
    }

    this._closeCurrentSection();

    return this.sections;
  }

  parseListItems(childNodes) {
    let { state } = this;
    forEach(childNodes, el => {
      let parsed = new this.constructor(this.builder).parse(el);
      let li = parsed[0];
      if (li && isListItem(li)) {
        state.section.items.append(li);
      }
    });
  }

  parseNode(node) {
    if (!this.state.section) {
      this._updateStateFromElement(node);
    }

    switch (node.nodeType) {
      case TEXT_NODE:
        this.parseTextNode(node);
        break;
      case ELEMENT_NODE:
        this.parseElementNode(node);
        break;
      default:
        throw new Error(`parseNode got unexpected element type ${node.nodeType} ` + node);
    }
  }

  parseCard(element) {
    let { builder } = this;

    for (let i=0; i<this.cardParsers.length; i++) {
      let card = this.cardParsers[i].parse(element, builder);
      if (card) {
        this._closeCurrentSection();
        this.sections.push(card);
        return true;
      }
    }
  }

  parseElementNode(element) {
    let { state } = this;

    let parsedCard = this.parseCard(element);
    if (parsedCard) {
      return;
    }

    const markups = this._markupsFromElement(element);
    if (markups.length && state.text.length) {
      this._createMarker();
    }
    state.markups.push(...markups);

    forEach(element.childNodes, (node) => {
      this.parseNode(node);
    });

    if (markups.length && state.text.length) {
      // create the marker started for this node
      this._createMarker();
    }

    // pop the current markups from the stack
    state.markups.splice(-markups.length, markups.length);
  }

  parseTextNode(textNode) {
    let { state } = this;
    state.text += textNode.textContent;
  }

  _updateStateFromElement(element) {
    let { state } = this;
    state.section = this._createSectionFromElement(element);
    state.markups = this._markupsFromElement(element);
    state.text = '';
  }

  _closeCurrentSection() {
    let { sections, state } = this;

    if (!state.section) {
      return;
    }

    // close a trailing text node if it exists
    if (state.text.length) {
      let marker = this.builder.createMarker(state.text, state.markups);
      state.section.markers.append(marker);
    }

    sections.push(state.section);
    state.section = null;
  }

  _markupsFromElement(element) {
    let { builder } = this;
    let markups = [];
    if (isTextNode(element)) {
      return markups;
    }

    const tagName = normalizeTagName(element.tagName);
    if (this._isValidMarkupForElement(tagName, element)) {
      markups.push(builder.createMarkup(tagName, getAttributes(element)));
    }

    this._markupsFromElementStyle(element).forEach(
      markup => markups.push(markup)
    );

    return markups;
  }

  _isValidMarkupForElement(tagName, element) {
    if (VALID_MARKUP_TAGNAMES.indexOf(tagName) === -1) {
      return false;
    } else if (tagName === 'b') {
      // google docs add a <b style="font-weight: normal;"> that should not
      // create a "b" markup
      return element.style.fontWeight !== 'normal';
    }
    return true;
  }

  _markupsFromElementStyle(element) {
    let { builder } = this;
    let markups = [];
    let { fontStyle, fontWeight } = element.style;
    if (fontStyle === 'italic') {
      markups.push(builder.createMarkup('em'));
    }
    if (fontWeight === 'bold' || fontWeight === '700') {
      markups.push(builder.createMarkup('strong'));
    }
    return markups;
  }

  _createMarker() {
    let { state } = this;
    let marker = this.builder.createMarker(state.text, state.markups);
    state.section.markers.append(marker);
    state.text = '';
  }

  _getSectionDetails(element) {
    let sectionType,
        tagName,
        inferredTagName = false;
    if (isTextNode(element)) {
      tagName = DEFAULT_TAG_NAME;
      sectionType = MARKUP_SECTION_TYPE;
      inferredTagName = true;
    } else {
      tagName = normalizeTagName(element.tagName);

      if (contains(VALID_LIST_SECTION_TAGNAMES, tagName)) {
        sectionType = LIST_SECTION_TYPE;
      } else if (contains(VALID_LIST_ITEM_TAGNAMES, tagName)) {
        sectionType = LIST_ITEM_TYPE;
      } else if (contains(VALID_MARKUP_SECTION_TAGNAMES, tagName)) {
        sectionType = MARKUP_SECTION_TYPE;
      } else {
        sectionType = MARKUP_SECTION_TYPE;
        tagName = DEFAULT_TAG_NAME;
        inferredTagName = true;
      }
    }

    return {sectionType, tagName, inferredTagName};
  }

  _createSectionFromElement(element) {
    let { builder } = this;

    let section;
    let {tagName, sectionType, inferredTagName} =
      this._getSectionDetails(element);

    switch (sectionType) {
      case LIST_SECTION_TYPE:
        section = builder.createListSection(tagName);
        break;
      case LIST_ITEM_TYPE:
        section = builder.createListItem();
        break;
      case MARKUP_SECTION_TYPE:
        section = builder.createMarkupSection(tagName);
        section._inferredTagName = inferredTagName;
        break;
      default:
        throw new Error('Cannot parse section from element');
    }

    return section;
  }

}
