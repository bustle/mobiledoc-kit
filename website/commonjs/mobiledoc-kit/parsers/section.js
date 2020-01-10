'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _modelsMarkupSection = require('../models/markup-section');

var _modelsListSection = require('../models/list-section');

var _modelsListItem = require('../models/list-item');

var _modelsTypes = require('../models/types');

var _modelsMarkup = require('../models/markup');

var _utilsDomUtils = require('../utils/dom-utils');

var _utilsArrayUtils = require('../utils/array-utils');

var _parsersDom = require('../parsers/dom');

var _utilsAssert = require('../utils/assert');

var SKIPPABLE_ELEMENT_TAG_NAMES = ['style', 'head', 'title', 'meta'].map(_utilsDomUtils.normalizeTagName);

var NEWLINES = /\n/g;
function sanitize(text) {
  return text.replace(NEWLINES, ' ');
}

/**
 * parses an element into a section, ignoring any non-markup
 * elements contained within
 * @private
 */

var SectionParser = (function () {
  function SectionParser(builder) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, SectionParser);

    this.builder = builder;
    this.plugins = options.plugins || [];
  }

  _createClass(SectionParser, [{
    key: 'parse',
    value: function parse(element) {
      var _this = this;

      if (this._isSkippable(element)) {
        return [];
      }
      this.sections = [];
      this.state = {};

      this._updateStateFromElement(element);

      var finished = false;

      // top-level text nodes will be run through parseNode later so avoid running
      // the node through parserPlugins twice
      if (!(0, _utilsDomUtils.isTextNode)(element)) {
        finished = this.runPlugins(element);
      }

      if (!finished) {
        var childNodes = (0, _utilsDomUtils.isTextNode)(element) ? [element] : element.childNodes;

        (0, _utilsArrayUtils.forEach)(childNodes, function (el) {
          _this.parseNode(el);
        });
      }

      this._closeCurrentSection();

      return this.sections;
    }
  }, {
    key: 'runPlugins',
    value: function runPlugins(node) {
      var _this2 = this;

      var isNodeFinished = false;
      var env = {
        addSection: function addSection(section) {
          // avoid creating empty paragraphs due to wrapper elements around
          // parser-plugin-handled elements
          if (_this2.state.section.isMarkerable && !_this2.state.text && !_this2.state.section.text) {
            _this2.state.section = null;
          } else {
            _this2._closeCurrentSection();
          }
          _this2.sections.push(section);
        },
        addMarkerable: function addMarkerable(marker) {
          var state = _this2.state;
          var section = state.section;

          (0, _utilsAssert['default'])('Markerables can only be appended to markup sections and list item sections', section && section.isMarkerable);
          if (state.text) {
            _this2._createMarker();
          }
          section.markers.append(marker);
        },
        nodeFinished: function nodeFinished() {
          isNodeFinished = true;
        }
      };
      for (var i = 0; i < this.plugins.length; i++) {
        var plugin = this.plugins[i];
        plugin(node, this.builder, env);
        if (isNodeFinished) {
          return true;
        }
      }
      return false;
    }

    /* eslint-disable complexity */
  }, {
    key: 'parseNode',
    value: function parseNode(node) {
      var _this3 = this;

      if (!this.state.section) {
        this._updateStateFromElement(node);
      }

      var nodeFinished = this.runPlugins(node);
      if (nodeFinished) {
        return;
      }

      // handle closing the current section and starting a new one if we hit a
      // new-section-creating element.
      if (this.state.section && !(0, _utilsDomUtils.isTextNode)(node) && node.tagName) {
        var tagName = (0, _utilsDomUtils.normalizeTagName)(node.tagName);
        var isListSection = (0, _utilsArrayUtils.contains)(_modelsListSection.VALID_LIST_SECTION_TAGNAMES, tagName);
        var isListItem = (0, _utilsArrayUtils.contains)(_modelsListItem.VALID_LIST_ITEM_TAGNAMES, tagName);
        var isMarkupSection = (0, _utilsArrayUtils.contains)(_modelsMarkupSection.VALID_MARKUP_SECTION_TAGNAMES, tagName);
        var isNestedListSection = isListSection && this.state.section.isListItem;
        var lastSection = this.sections[this.sections.length - 1];

        // we can hit a list item after parsing a nested list, when that happens
        // and the lists are of different types we need to make sure we switch
        // the list type back
        if (isListItem && lastSection && lastSection.isListSection) {
          var parentElement = node.parentElement;
          var parentElementTagName = (0, _utilsDomUtils.normalizeTagName)(parentElement.tagName);
          if (parentElementTagName !== lastSection.tagName) {
            this._closeCurrentSection();
            this._updateStateFromElement(parentElement);
          }
        }

        // if we've broken out of a list due to nested section-level elements we
        // can hit the next list item without having a list section in the current
        // state. In this instance we find the parent list node and use it to
        // re-initialize the state with a new list section
        if (isListItem && !(this.state.section.isListItem || this.state.section.isListSection) && !lastSection.isListSection) {
          this._closeCurrentSection();
          this._updateStateFromElement(node.parentElement);
        }

        // if we have consecutive list sections of different types (ul, ol) then
        // ensure we close the current section and start a new one
        var isNewListSection = lastSection && lastSection.isListSection && this.state.section.isListItem && isListSection && tagName !== lastSection.tagName;

        if (isNewListSection || isListSection && !isNestedListSection || isMarkupSection || isListItem) {
          // don't break out of the list for list items that contain a single <p>.
          // deals with typical case of <li><p>Text</p></li><li><p>Text</p></li>
          if (this.state.section.isListItem && tagName === 'p' && !node.nextSibling && (0, _utilsArrayUtils.contains)(_modelsListItem.VALID_LIST_ITEM_TAGNAMES, (0, _utilsDomUtils.normalizeTagName)(node.parentElement.tagName))) {
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

          (0, _utilsArrayUtils.forEach)(node.childNodes, function (node) {
            _this3.parseNode(node);
          });
          return;
        }
      }

      switch (node.nodeType) {
        case _utilsDomUtils.NODE_TYPES.TEXT:
          this.parseTextNode(node);
          break;
        case _utilsDomUtils.NODE_TYPES.ELEMENT:
          this.parseElementNode(node);
          break;
      }
    }
  }, {
    key: 'parseElementNode',
    value: function parseElementNode(element) {
      var _state$markups,
          _this4 = this;

      var state = this.state;

      var markups = this._markupsFromElement(element);
      if (markups.length && state.text.length && state.section.isMarkerable) {
        this._createMarker();
      }
      (_state$markups = state.markups).push.apply(_state$markups, _toConsumableArray(markups));

      (0, _utilsArrayUtils.forEach)(element.childNodes, function (node) {
        _this4.parseNode(node);
      });

      if (markups.length && state.text.length && state.section.isMarkerable) {
        // create the marker started for this node
        this._createMarker();
      }

      // pop the current markups from the stack
      state.markups.splice(-markups.length, markups.length);
    }
  }, {
    key: 'parseTextNode',
    value: function parseTextNode(textNode) {
      var state = this.state;

      state.text += sanitize(textNode.textContent);
    }
  }, {
    key: '_updateStateFromElement',
    value: function _updateStateFromElement(element) {
      var state = this.state;

      state.section = this._createSectionFromElement(element);
      state.markups = this._markupsFromElement(element);
      state.text = '';
    }
  }, {
    key: '_closeCurrentSection',
    value: function _closeCurrentSection() {
      var sections = this.sections;
      var state = this.state;

      var lastSection = sections[sections.length - 1];

      if (!state.section) {
        return;
      }

      // close a trailing text node if it exists
      if (state.text.length && state.section.isMarkerable) {
        this._createMarker();
      }

      // push listItems onto the listSection or add a new section
      if (state.section.isListItem && lastSection && lastSection.isListSection) {
        (0, _parsersDom.trimSectionText)(state.section);
        lastSection.items.append(state.section);
      } else {
        // avoid creating empty markup sections, especially useful for indented source
        if (state.section.isMarkerable && !state.section.text.trim() && !(0, _utilsArrayUtils.any)(state.section.markers, function (marker) {
          return marker.isAtom;
        })) {
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
  }, {
    key: '_markupsFromElement',
    value: function _markupsFromElement(element) {
      var builder = this.builder;

      var markups = [];
      if ((0, _utilsDomUtils.isTextNode)(element)) {
        return markups;
      }

      var tagName = (0, _utilsDomUtils.normalizeTagName)(element.tagName);
      if (this._isValidMarkupForElement(tagName, element)) {
        markups.push(builder.createMarkup(tagName, (0, _utilsDomUtils.getAttributes)(element)));
      }

      this._markupsFromElementStyle(element).forEach(function (markup) {
        return markups.push(markup);
      });

      return markups;
    }
  }, {
    key: '_isValidMarkupForElement',
    value: function _isValidMarkupForElement(tagName, element) {
      if (_modelsMarkup.VALID_MARKUP_TAGNAMES.indexOf(tagName) === -1) {
        return false;
      } else if (tagName === 'b') {
        // google docs add a <b style="font-weight: normal;"> that should not
        // create a "b" markup
        return element.style.fontWeight !== 'normal';
      }
      return true;
    }
  }, {
    key: '_markupsFromElementStyle',
    value: function _markupsFromElementStyle(element) {
      var builder = this.builder;

      var markups = [];
      var _element$style = element.style;
      var fontStyle = _element$style.fontStyle;
      var fontWeight = _element$style.fontWeight;

      if (fontStyle === 'italic') {
        markups.push(builder.createMarkup('em'));
      }
      if (fontWeight === 'bold' || fontWeight === '700') {
        markups.push(builder.createMarkup('strong'));
      }
      return markups;
    }
  }, {
    key: '_createMarker',
    value: function _createMarker() {
      var state = this.state;

      var text = (0, _parsersDom.transformHTMLText)(state.text);
      var marker = this.builder.createMarker(text, state.markups);
      state.section.markers.append(marker);
      state.text = '';
    }
  }, {
    key: '_getSectionDetails',
    value: function _getSectionDetails(element) {
      var sectionType = undefined,
          tagName = undefined,
          inferredTagName = false;
      if ((0, _utilsDomUtils.isTextNode)(element)) {
        tagName = _modelsMarkupSection.DEFAULT_TAG_NAME;
        sectionType = _modelsTypes.MARKUP_SECTION_TYPE;
        inferredTagName = true;
      } else {
        tagName = (0, _utilsDomUtils.normalizeTagName)(element.tagName);

        if ((0, _utilsArrayUtils.contains)(_modelsListSection.VALID_LIST_SECTION_TAGNAMES, tagName)) {
          sectionType = _modelsTypes.LIST_SECTION_TYPE;
        } else if ((0, _utilsArrayUtils.contains)(_modelsListItem.VALID_LIST_ITEM_TAGNAMES, tagName)) {
          sectionType = _modelsTypes.LIST_ITEM_TYPE;
        } else if ((0, _utilsArrayUtils.contains)(_modelsMarkupSection.VALID_MARKUP_SECTION_TAGNAMES, tagName)) {
          sectionType = _modelsTypes.MARKUP_SECTION_TYPE;
        } else {
          sectionType = _modelsTypes.MARKUP_SECTION_TYPE;
          tagName = _modelsMarkupSection.DEFAULT_TAG_NAME;
          inferredTagName = true;
        }
      }

      return { sectionType: sectionType, tagName: tagName, inferredTagName: inferredTagName };
    }
  }, {
    key: '_createSectionFromElement',
    value: function _createSectionFromElement(element) {
      var builder = this.builder;

      var section = undefined;

      var _getSectionDetails2 = this._getSectionDetails(element);

      var tagName = _getSectionDetails2.tagName;
      var sectionType = _getSectionDetails2.sectionType;
      var inferredTagName = _getSectionDetails2.inferredTagName;

      switch (sectionType) {
        case _modelsTypes.LIST_SECTION_TYPE:
          section = builder.createListSection(tagName);
          break;
        case _modelsTypes.LIST_ITEM_TYPE:
          section = builder.createListItem();
          break;
        case _modelsTypes.MARKUP_SECTION_TYPE:
          section = builder.createMarkupSection(tagName);
          section._inferredTagName = inferredTagName;
          break;
        default:
          (0, _utilsAssert['default'])('Cannot parse section from element', false);
      }

      return section;
    }
  }, {
    key: '_isSkippable',
    value: function _isSkippable(element) {
      return (0, _utilsDomUtils.isCommentNode)(element) || element.nodeType === _utilsDomUtils.NODE_TYPES.ELEMENT && (0, _utilsArrayUtils.contains)(SKIPPABLE_ELEMENT_TAG_NAMES, (0, _utilsDomUtils.normalizeTagName)(element.tagName));
    }
  }]);

  return SectionParser;
})();

exports['default'] = SectionParser;