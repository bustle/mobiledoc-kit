const TEXT_NODE = 3;
const ELEMENT_NODE = 1;

import MarkupSection from 'content-kit-editor/models/markup-section';
import {
  DEFAULT_TAG_NAME,
  VALID_MARKUP_SECTION_TAGNAMES
} from 'content-kit-editor/models/markup-section';

import Marker from 'content-kit-editor/models/marker';
import Markup from 'content-kit-editor/models/markup';
import { VALID_MARKUP_TAGNAMES } from 'content-kit-editor/models/markup';
import { getAttributes } from 'content-kit-editor/utils/dom-utils';
import { forEach } from 'content-kit-editor/utils/array-utils';

/**
 * parses an element into a section, ignoring any non-markup
 * elements contained within
 * @return {Section}
 */
export default {
  parse(element) {
    if (!this.isSectionElement(element)) {
      element = this.wrapInSectionElement(element);
    }

    const tagName = this.sectionTagNameFromElement(element);
    const section = new MarkupSection(tagName);
    const state = {section, markups:[], text:''};

    forEach(element.childNodes, (el) => {
      this.parseNode(el, state);
    });

    // close a trailing text nodes if it exists
    if (state.text.length) {
      let marker = new Marker(state.text, state.markups);
      state.section.appendMarker(marker);
    }

    return section;
  },

  wrapInSectionElement(element) {
    const parent = document.createElement(DEFAULT_TAG_NAME);
    parent.appendChild(element);
    return parent;
  },

  parseNode(node, state) {
    switch (node.nodeType) {
      case TEXT_NODE:
        this.parseTextNode(node, state);
        break;
      case ELEMENT_NODE:
        this.parseElementNode(node, state);
        break;
      default:
        throw new Error(`parseNode got unexpected element type ${node.nodeType} ` + node);
    }
  },

  parseElementNode(element, state) {
    const markup = this.markupFromElement(element);
    if (markup) {
      if (state.text.length) {
        // close previous text marker
        let marker = new Marker(state.text, state.markups);
        state.section.appendMarker(marker);
        state.text = '';
      }

      state.markups.push(markup);
    }

    forEach(element.childNodes, (node) => {
      this.parseNode(node, state);
    });

    if (markup) {
      // close the marker started for this node and pop
      // its markup from the stack
      let marker = new Marker(state.text, state.markups);
      state.section.appendMarker(marker);
      state.markups.pop();
      state.text = '';
    }
  },

  parseTextNode(textNode, state) {
    state.text += textNode.textContent;
  },

  isSectionElement(element) {
    return element.nodeType === ELEMENT_NODE &&
      VALID_MARKUP_SECTION_TAGNAMES.indexOf(element.tagName.toLowerCase()) !== -1;
  },

  markupFromElement(element) {
    const tagName = element.tagName.toLowerCase();
    if (VALID_MARKUP_TAGNAMES.indexOf(tagName) === -1) { return null; }

    return new Markup(tagName, getAttributes(element));
  },

  sectionTagNameFromElement(element) {
    let tagName = element.tagName.toLowerCase();
    if (VALID_MARKUP_SECTION_TAGNAMES.indexOf(tagName) === -1) { tagName = DEFAULT_TAG_NAME; }
    return tagName;
  }
};
