import {
  DEFAULT_TAG_NAME,
  VALID_MARKUP_SECTION_TAGNAMES
} from 'mobiledoc-kit/models/markup-section';

import {
  VALID_LIST_SECTION_TAGNAMES
} from 'mobiledoc-kit/models/list-section';

import {
  VALID_LIST_ITEM_TAGNAMES
} from 'mobiledoc-kit/models/list-item';

import {
  LIST_SECTION_TYPE,
  LIST_ITEM_TYPE,
  MARKUP_SECTION_TYPE
} from 'mobiledoc-kit/models/types';

import {
  VALID_MARKUP_TAGNAMES
} from 'mobiledoc-kit/models/markup';

import {
  getAttributes,
  normalizeTagName,
  isTextNode,
  isCommentNode,
  NODE_TYPES
} from 'mobiledoc-kit/utils/dom-utils';

import {
  any,
  forEach,
  contains
} from 'mobiledoc-kit/utils/array-utils';

import {
  transformHTMLText,
  trimSectionText
} from '../parsers/dom';

import assert from '../utils/assert';

const SKIPPABLE_ELEMENT_TAG_NAMES = [
  'style', 'head', 'title', 'meta'
].map(normalizeTagName);

const NEWLINES = /\n/g;
function sanitize(text) {
  return text.replace(NEWLINES, ' ');
}

/**
 * parses an element into a section, ignoring any non-markup
 * elements contained within
 * @private
 */
class SectionParser {
  constructor(builder, options={}) {
    this.builder = builder;
    this.plugins = options.plugins || [];
  }

  parse(element) {
    if (this._isSkippable(element)) {
      return [];
    }
    this.sections = [];
    this.state = {};

    this._updateStateFromElement(element);

    let finished = false;

    // top-level text nodes will be run through parseNode later so avoid running
    // the node through parserPlugins twice
    if (!isTextNode(element)) {
      finished = this.runPlugins(element);
    }

    if (!finished) {
      let childNodes = isTextNode(element) ? [element] : element.childNodes;

      forEach(childNodes, el => {
        this.parseNode(el);
      });
    }

    this._closeCurrentSection();

    return this.sections;
  }

  runPlugins(node) {
    let isNodeFinished = false;
    let env = {
      addSection: (section) => {
        // avoid creating empty paragraphs due to wrapper elements around
        // parser-plugin-handled elements
        if (this.state.section && this.state.section.isMarkerable && !this.state.section.text && !this.state.text) {
          this.state.section = null;
        } else {
          this._closeCurrentSection();
        }
        this.sections.push(section);
      },
      addMarkerable: (marker) => {
        let { state } = this;
        let { section } = state;
        // if the first element doesn't create it's own state and it's plugin
        // handler uses `addMarkerable` we won't have a section yet
        if (!section) {
          state.text = '';
          state.section = this.builder.createMarkupSection(normalizeTagName('p'));
          section = state.section;
        }
        assert(
          'Markerables can only be appended to markup sections and list item sections',
          section && section.isMarkerable
        );
        if (state.text) {
          this._createMarker();
        }
        section.markers.append(marker);
      },
      nodeFinished() {
        isNodeFinished = true;
      }
    };
    for (let i=0; i<this.plugins.length; i++) {
      let plugin = this.plugins[i];
      plugin(node, this.builder, env);
      if (isNodeFinished) {
        return true;
      }
    }
    return false;
  }

  /* eslint-disable complexity */
  parseNode(node) {
    if (!this.state.section) {
      this._updateStateFromElement(node);
    }

    let nodeFinished = this.runPlugins(node);
    if (nodeFinished) {
      return;
    }

    // handle closing the current section and starting a new one if we hit a
    // new-section-creating element.
    if (this.state.section && !isTextNode(node) && node.tagName) {
      let tagName = normalizeTagName(node.tagName);
      let isListSection = contains(VALID_LIST_SECTION_TAGNAMES, tagName);
      let isListItem = contains(VALID_LIST_ITEM_TAGNAMES, tagName);
      let isMarkupSection = contains(VALID_MARKUP_SECTION_TAGNAMES, tagName);
      let isNestedListSection = isListSection && this.state.section.isListItem;
      let lastSection = this.sections[this.sections.length - 1];

      // we can hit a list item after parsing a nested list, when that happens
      // and the lists are of different types we need to make sure we switch
      // the list type back
      if (isListItem && lastSection && lastSection.isListSection) {
        let parentElement = node.parentElement;
        let parentElementTagName = normalizeTagName(parentElement.tagName);
        if (parentElementTagName !== lastSection.tagName) {
          this._closeCurrentSection();
          this._updateStateFromElement(parentElement);
        }
      }

      // if we've broken out of a list due to nested section-level elements we
      // can hit the next list item without having a list section in the current
      // state. In this instance we find the parent list node and use it to
      // re-initialize the state with a new list section
      if (
        isListItem &&
        !(this.state.section.isListItem || this.state.section.isListSection) &&
        !lastSection.isListSection
      ) {
        this._closeCurrentSection();
        this._updateStateFromElement(node.parentElement);
      }

      // if we have consecutive list sections of different types (ul, ol) then
      // ensure we close the current section and start a new one
      let isNewListSection = lastSection
        && lastSection.isListSection
        && this.state.section.isListItem
        && isListSection
        && tagName !== lastSection.tagName;

      if (
        isNewListSection ||
        (isListSection && !isNestedListSection) ||
        isMarkupSection ||
        isListItem
      ) {
        // don't break out of the list for list items that contain a single <p>.
        // deals with typical case of <li><p>Text</p></li><li><p>Text</p></li>
        if (
          this.state.section.isListItem &&
          tagName === 'p' &&
          !node.nextSibling &&
          contains(VALID_LIST_ITEM_TAGNAMES, normalizeTagName(node.parentElement.tagName))
         ) {
          this.parseElementNode(node);
          return;
        }

        // avoid creating empty paragraphs due to wrapper elements around
        // section-creating elements
        if (this.state.section.isMarkerable && !this.state.text && this.state.section.markers.length === 0) {
          this.state.section = null;
        } else {
          this._closeCurrentSection();
        }

        this._updateStateFromElement(node);
      }

      if (this.state.section.isListSection) {
        // ensure the list section is closed and added to the sections list.
        // _closeCurrentSection handles pushing list items onto the list section
        this._closeCurrentSection();

        forEach(node.childNodes, (node) => {
          this.parseNode(node);
        });
        return;
      }
    }

    switch (node.nodeType) {
      case NODE_TYPES.TEXT:
        this.parseTextNode(node);
        break;
      case NODE_TYPES.ELEMENT:
        this.parseElementNode(node);
        break;
    }
  }

  parseElementNode(element) {
    let { state } = this;

    const markups = this._markupsFromElement(element);
    if (markups.length && state.text.length && state.section.isMarkerable) {
      this._createMarker();
    }
    state.markups.push(...markups);

    forEach(element.childNodes, (node) => {
      this.parseNode(node);
    });

    if (markups.length && state.text.length && state.section.isMarkerable) {
      // create the marker started for this node
      this._createMarker();
    }

    // pop the current markups from the stack
    state.markups.splice(-markups.length, markups.length);
  }

  parseTextNode(textNode) {
    let { state } = this;
    state.text += sanitize(textNode.textContent);
  }

  _updateStateFromElement(element) {
    if (isCommentNode(element)) {
      return;
    }

    let { state } = this;
    state.section = this._createSectionFromElement(element);
    state.markups = this._markupsFromElement(element);
    state.text = '';
  }

  _closeCurrentSection() {
    let { sections, state } = this;
    let lastSection = sections[sections.length - 1];

    if (!state.section) {
      return;
    }

    // close a trailing text node if it exists
    if (state.text.length && state.section.isMarkerable) {
      this._createMarker();
    }

    // push listItems onto the listSection or add a new section
    if (state.section.isListItem && lastSection && lastSection.isListSection) {
      trimSectionText(state.section);
      lastSection.items.append(state.section);
    } else {
      // avoid creating empty markup sections, especially useful for indented source
      if (
        state.section.isMarkerable &&
        !state.section.text.trim() &&
        !any(state.section.markers, marker => marker.isAtom)
      ) {
        state.section = null;
        state.text = '';
        return;
      }

      // remove empty list sections before creating a new section
      if (lastSection && lastSection.isListSection && lastSection.items.length === 0) {
        sections.pop();
      }

      sections.push(state.section);
    }

    state.section = null;
    state.text = '';
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
    let text = transformHTMLText(state.text);
    let marker = this.builder.createMarker(text, state.markups);
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
    if (isCommentNode(element)) {
      return;
    }

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
        assert('Cannot parse section from element', false);
    }

    return section;
  }

  _isSkippable(element) {
    return element.nodeType === NODE_TYPES.ELEMENT &&
           contains(SKIPPABLE_ELEMENT_TAG_NAMES,
                    normalizeTagName(element.tagName));
  }
}

export default SectionParser;
