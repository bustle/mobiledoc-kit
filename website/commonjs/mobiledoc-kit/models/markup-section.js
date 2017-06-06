'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x4, _x5, _x6) { var _again = true; _function: while (_again) { var object = _x4, property = _x5, receiver = _x6; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x4 = parent; _x5 = property; _x6 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _markerable = require('./_markerable');

var _utilsDomUtils = require('../utils/dom-utils');

var _utilsArrayUtils = require('../utils/array-utils');

var _types = require('./types');

// valid values of `tagName` for a MarkupSection
var VALID_MARKUP_SECTION_TAGNAMES = ['aside', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'].map(_utilsDomUtils.normalizeTagName);

exports.VALID_MARKUP_SECTION_TAGNAMES = VALID_MARKUP_SECTION_TAGNAMES;
// valid element names for a MarkupSection. A MarkupSection with a tagName
// not in this will be rendered as a div with a className matching the
// tagName
var MARKUP_SECTION_ELEMENT_NAMES = ['aside', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'].map(_utilsDomUtils.normalizeTagName);
exports.MARKUP_SECTION_ELEMENT_NAMES = MARKUP_SECTION_ELEMENT_NAMES;
var DEFAULT_TAG_NAME = VALID_MARKUP_SECTION_TAGNAMES[8];

exports.DEFAULT_TAG_NAME = DEFAULT_TAG_NAME;
var MarkupSection = (function (_Markerable) {
  _inherits(MarkupSection, _Markerable);

  function MarkupSection() {
    var tagName = arguments.length <= 0 || arguments[0] === undefined ? DEFAULT_TAG_NAME : arguments[0];
    var markers = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

    _classCallCheck(this, MarkupSection);

    _get(Object.getPrototypeOf(MarkupSection.prototype), 'constructor', this).call(this, _types.MARKUP_SECTION_TYPE, tagName, markers);
    this.isMarkupSection = true;
  }

  _createClass(MarkupSection, [{
    key: 'isValidTagName',
    value: function isValidTagName(normalizedTagName) {
      return (0, _utilsArrayUtils.contains)(VALID_MARKUP_SECTION_TAGNAMES, normalizedTagName);
    }
  }, {
    key: 'splitAtMarker',
    value: function splitAtMarker(marker) {
      var offset = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
      var beforeSection = this.builder.createMarkupSection(this.tagName, []);
      var afterSection = this.builder.createMarkupSection();

      return this._redistributeMarkers(beforeSection, afterSection, marker, offset);
    }
  }]);

  return MarkupSection;
})(_markerable['default']);

exports['default'] = MarkupSection;