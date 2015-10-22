const TEXT_NODE = 3;
const ELEMENT_NODE = 1;

import {
  DEFAULT_TAG_NAME,
  VALID_MARKUP_SECTION_TAGNAMES
} from 'content-kit-editor/models/markup-section';

import {
  VALID_MARKUP_TAGNAMES
} from 'content-kit-editor/models/markup';

import {
  getAttributes,
  normalizeTagName,
  isTextNode
} from 'content-kit-editor/utils/dom-utils';

import {
  forEach
} from 'content-kit-editor/utils/array-utils';

/**
 * parses an element into a section, ignoring any non-markup
 * elements contained within
 * @return {Section}
 */
export default class SectionParser {
  constructor(builder) {
    this.builder = builder;
  }

  parse(element) {
    const section = this.createSectionFromElement(element);
    const markups = this.markupsFromElement(element);
    const state = {section, markups, text:''};

    let childNodes = isTextNode(element) ? [element] : element.childNodes;

    forEach(childNodes, el => {
      this.parseNode(el, state);
    });

    // close a trailing text nodes if it exists
    if (state.text.length) {
      let marker = this.builder.createMarker(state.text, state.markups);
      state.section.markers.append(marker);
    }

    return section;
  }

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
  }

  parseElementNode(element, state) {
    const markups = this.markupsFromElement(element);
    if (markups.length && state.text.length) {
      this._createMarkerFromState(state);
    }
    state.markups.push(...markups);

    forEach(element.childNodes, (node) => {
      this.parseNode(node, state);
    });

    if (markups.length && state.text.length) {
      // create the marker started for this node
      this._createMarkerFromState(state);
    }

    // pop the current markups from the stack
    state.markups.splice(-markups.length, markups.length);
  }

  parseTextNode(textNode, state) {
    state.text += textNode.textContent;
  }

  isSectionElement(element) {
    return element.nodeType === ELEMENT_NODE &&
      VALID_MARKUP_SECTION_TAGNAMES.indexOf(normalizeTagName(element.tagName)) !== -1;
  }

  markupsFromElement(element) {
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

  _createMarkerFromState(state) {
    let marker = this.builder.createMarker(state.text, state.markups);
    state.section.markers.append(marker);
    state.text = '';
  }

  _sectionTagNameFromElement(element) {
    if (isTextNode(element)) {
      return null;
    }
    let tagName;

    let elementTagName = normalizeTagName(element.tagName);

    if (VALID_MARKUP_SECTION_TAGNAMES.indexOf(elementTagName) !== -1) {
      tagName = elementTagName;
    }

    return tagName;
  }

  inferSectionTagNameFromElement(/* element */) {
    return DEFAULT_TAG_NAME;
  }

  createSectionFromElement(element) {
    let { builder } = this;

    let inferredTagName = false;
    let tagName = this._sectionTagNameFromElement(element);
    if (!tagName) {
      inferredTagName = true;
      tagName = this.inferSectionTagNameFromElement(element);
    }
    let section = builder.createMarkupSection(tagName);

    if (inferredTagName) {
      section._inferredTagName = true;
    }
    return section;
  }

}
