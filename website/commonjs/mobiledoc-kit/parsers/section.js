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
  text = text.replace(NEWLINES, '');
  return text;
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

      var childNodes = (0, _utilsDomUtils.isTextNode)(element) ? [element] : element.childNodes;

      if (this.state.section.isListSection) {
        this.parseListItems(childNodes);
      } else {
        (0, _utilsArrayUtils.forEach)(childNodes, function (el) {
          _this.parseNode(el);
        });
      }

      this._closeCurrentSection();

      return this.sections;
    }
  }, {
    key: 'parseListItems',
    value: function parseListItems(childNodes) {
      var _this2 = this;

      var state = this.state;

      (0, _utilsArrayUtils.forEach)(childNodes, function (el) {
        var parsed = new _this2.constructor(_this2.builder).parse(el);
        var li = parsed[0];
        if (li && li.isListItem) {
          state.section.items.append(li);
        }
      });
    }
  }, {
    key: 'runPlugins',
    value: function runPlugins(node) {
      var _this3 = this;

      var isNodeFinished = false;
      var env = {
        addSection: function addSection(section) {
          _this3._closeCurrentSection();
          _this3.sections.push(section);
        },
        addMarkerable: function addMarkerable(marker) {
          var state = _this3.state;
          var section = state.section;

          (0, _utilsAssert['default'])('Markerables can only be appended to markup sections and list item sections', section && section.isMarkerable);
          if (state.text) {
            _this3._createMarker();
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
  }, {
    key: 'parseNode',
    value: function parseNode(node) {
      if (!this.state.section) {
        this._updateStateFromElement(node);
      }

      var nodeFinished = this.runPlugins(node);
      if (nodeFinished) {
        return;
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
      if (markups.length && state.text.length) {
        this._createMarker();
      }
      (_state$markups = state.markups).push.apply(_state$markups, _toConsumableArray(markups));

      (0, _utilsArrayUtils.forEach)(element.childNodes, function (node) {
        _this4.parseNode(node);
      });

      if (markups.length && state.text.length) {
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