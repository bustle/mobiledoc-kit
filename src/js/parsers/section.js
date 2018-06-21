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
  forEach,
  contains
} from 'mobiledoc-kit/utils/array-utils';

import {
  transformHTMLText
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

      if (this.state.section.isListSection) {
        this.parseListItems(childNodes);
      } else {
        forEach(childNodes, el => {
          this.parseNode(el);
        });
      }
    }

    this._closeCurrentSection();

    return this.sections;
  }

  parseListItems(childNodes) {
    let { state } = this;
    forEach(childNodes, el => {
      let parsed = new this.constructor(this.builder).parse(el);
      let li = parsed[0];
      if (li && li.isListItem) {
        state.section.items.append(li);
      }
    });
  }

  runPlugins(node) {
    let isNodeFinished = false;
    let env = {
      addSection: (section) => {
        this._closeCurrentSection();
        this.sections.push(section);
      },
      addMarkerable: (marker) => {
        let { state } = this;
        let { section } = state;
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

  parseNode(node) {
    if (!this.state.section) {
      this._updateStateFromElement(node);
    }

    let nodeFinished = this.runPlugins(node);
    if (nodeFinished) {
      return;
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
    state.text += sanitize(textNode.textContent);
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
      this._createMarker();
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
    return isCommentNode(element) ||
           (element.nodeType === NODE_TYPES.ELEMENT &&
            contains(SKIPPABLE_ELEMENT_TAG_NAMES,
                    normalizeTagName(element.tagName)));
  }
}

export default SectionParser;
