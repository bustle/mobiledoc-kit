const TEXT_NODE = 3;
const ELEMENT_NODE = 1;

import Section from 'content-kit-editor/models/section';
import {
  DEFAULT_TYPE,
  SECTION_TYPES
} from 'content-kit-editor/models/section';

import Marker from 'content-kit-editor/models/marker';
import { MARKUP_TYPES } from 'content-kit-editor/models/marker';

export default {
  parse(element) {
    if (!this.isSectionElement(element)) {
      element = this.wrapInSectionElement(element);
    }

    const type = this.typeFromTagName(element.tagName);
    const section = new Section(type);
    const state = {section, markups:[], text:''};

    this.toArray(element.childNodes).forEach(el => {
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
    const parent = document.createElement(DEFAULT_TYPE);
    parent.appendChild(element);
    return parent;
  },

  parseNode(node, state={text:'', markups:[], section:new Section()}) {
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

    this.toArray(element.childNodes).forEach(node => {
      this.parseNode(node, state);
    });

    if (markup) {
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
    return SECTION_TYPES.indexOf(element.tagName) !== -1;
  },

  markupFromElement(element) {
    const tagName = element.tagName.toLowerCase();
    if (MARKUP_TYPES.indexOf(tagName) === -1) { return null; }

    return {
      type: tagName,
      attributes: this.attributesToObject(element.attributes)
    };
  },

  // convert a NamedNodeMap (`element.attributes`) to a real object with
  // key-value pairs
  attributesToObject(attributes=[]) {
    let result = {};

    for (let i=0; i<attributes.length; i++) {
      let {name, value} = attributes[i];
      result[name] = value;
    }

    return result;
  },

  toArray(nodeList) {
    let arr = [];
    for (let i=0; i<nodeList.length; i++) {
      arr.push(nodeList[i]);
    }

    return arr;
  },

  typeFromTagName(tagName) {
    let type = tagName.toLowerCase();
    if (SECTION_TYPES.indexOf(tagName) === -1) { type = DEFAULT_TYPE; }
    return type;
  }
};
