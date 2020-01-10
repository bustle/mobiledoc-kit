'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utilsAssert = require('../utils/assert');

var _modelsTypes = require('../models/types');

var _modelsMarkupSection = require('../models/markup-section');

var UL_LI_REGEX = /^\* (.*)$/;
var OL_LI_REGEX = /^\d\.? (.*)$/;
var CR = '\r';
var LF = '\n';
var CR_REGEX = new RegExp(CR, 'g');
var CR_LF_REGEX = new RegExp(CR + LF, 'g');

var SECTION_BREAK = LF;

exports.SECTION_BREAK = SECTION_BREAK;
function normalizeLineEndings(text) {
  return text.replace(CR_LF_REGEX, LF).replace(CR_REGEX, LF);
}

var TextParser = (function () {
  function TextParser(builder, options) {
    _classCallCheck(this, TextParser);

    this.builder = builder;
    this.options = options;

    this.post = this.builder.createPost();
    this.prevSection = null;
  }

  /**
   * @param {String} text to parse
   * @return {Post} a post abstract
   */

  _createClass(TextParser, [{
    key: 'parse',
    value: function parse(text) {
      var _this = this;

      text = normalizeLineEndings(text);
      text.split(SECTION_BREAK).forEach(function (text) {
        var section = _this._parseSection(text);
        _this._appendSection(section);
      });

      return this.post;
    }
  }, {
    key: '_parseSection',
    value: function _parseSection(text) {
      var tagName = _modelsMarkupSection.DEFAULT_TAG_NAME,
          type = _modelsTypes.MARKUP_SECTION_TYPE,
          section = undefined;

      if (UL_LI_REGEX.test(text)) {
        tagName = 'ul';
        type = _modelsTypes.LIST_SECTION_TYPE;
        text = text.match(UL_LI_REGEX)[1];
      } else if (OL_LI_REGEX.test(text)) {
        tagName = 'ol';
        type = _modelsTypes.LIST_SECTION_TYPE;
        text = text.match(OL_LI_REGEX)[1];
      }

      var markers = [this.builder.createMarker(text)];

      switch (type) {
        case _modelsTypes.LIST_SECTION_TYPE:
          {
            var item = this.builder.createListItem(markers);
            var list = this.builder.createListSection(tagName, [item]);
            section = list;
            break;
          }
        case _modelsTypes.MARKUP_SECTION_TYPE:
          section = this.builder.createMarkupSection(tagName, markers);
          break;
        default:
          (0, _utilsAssert['default'])('Unknown type encountered ' + type, false);
      }

      return section;
    }
  }, {
    key: '_appendSection',
    value: function _appendSection(section) {
      var _this2 = this;

      var isSameListSection = section.isListSection && this.prevSection && this.prevSection.isListSection && this.prevSection.tagName === section.tagName;

      if (isSameListSection) {
        section.items.forEach(function (item) {
          _this2.prevSection.items.append(item.clone());
        });
      } else {
        this.post.sections.insertAfter(section, this.prevSection);
        this.prevSection = section;
      }
    }
  }]);

  return TextParser;
})();

exports['default'] = TextParser;