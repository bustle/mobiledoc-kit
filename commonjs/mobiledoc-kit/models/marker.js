'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x5, _x6, _x7) { var _again = true; _function: while (_again) { var object = _x5, property = _x6, receiver = _x7; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x5 = parent; _x6 = property; _x7 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _types = require('./types');

var _utilsMixin = require('../utils/mixin');

var _utilsMarkuperable = require('../utils/markuperable');

var _utilsLinkedItem = require('../utils/linked-item');

var _utilsAssert = require('../utils/assert');

var _utilsArrayUtils = require('../utils/array-utils');

// Unicode uses a pair of "surrogate" characters" (a high- and low-surrogate)
// to encode characters outside the basic multilingual plane (like emoji and
// some languages).
// These values are the unicode code points for the start and end of the
// high- and low-surrogate characters.
// See "high surrogate" and "low surrogate" on
// https://en.wikipedia.org/wiki/Unicode_block
var HIGH_SURROGATE_RANGE = [0xD800, 0xDBFF];
exports.HIGH_SURROGATE_RANGE = HIGH_SURROGATE_RANGE;
var LOW_SURROGATE_RANGE = [0xDC00, 0xDFFF];

exports.LOW_SURROGATE_RANGE = LOW_SURROGATE_RANGE;
var Marker = (function (_LinkedItem) {
  _inherits(Marker, _LinkedItem);

  function Marker() {
    var _this = this;

    var value = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
    var markups = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

    _classCallCheck(this, Marker);

    _get(Object.getPrototypeOf(Marker.prototype), 'constructor', this).call(this);
    this.value = value;
    (0, _utilsAssert['default'])('Marker must have value', value !== undefined && value !== null);
    this.markups = [];
    this.type = _types.MARKER_TYPE;
    this.isMarker = true;
    this.isAtom = false;
    markups.forEach(function (m) {
      return _this.addMarkup(m);
    });
  }

  _createClass(Marker, [{
    key: 'clone',
    value: function clone() {
      var clonedMarkups = this.markups.slice();
      return this.builder.createMarker(this.value, clonedMarkups);
    }
  }, {
    key: 'charAt',
    value: function charAt(offset) {
      return this.value.slice(offset, offset + 1);
    }

    /**
     * A marker's text is equal to its value.
     * Compare with an Atom which distinguishes between text and value
     */
  }, {
    key: 'deleteValueAtOffset',

    // delete the character at this offset,
    // update the value with the new value
    value: function deleteValueAtOffset(offset) {
      (0, _utilsAssert['default'])('Cannot delete value at offset outside bounds', offset >= 0 && offset <= this.length);

      var width = 1;
      var code = this.value.charCodeAt(offset);
      if (code >= HIGH_SURROGATE_RANGE[0] && code <= HIGH_SURROGATE_RANGE[1]) {
        width = 2;
      } else if (code >= LOW_SURROGATE_RANGE[0] && code <= LOW_SURROGATE_RANGE[1]) {
        width = 2;
        offset = offset - 1;
      }

      var left = this.value.slice(0, offset);
      var right = this.value.slice(offset + width);

      this.value = left + right;

      return width;
    }
  }, {
    key: 'canJoin',
    value: function canJoin(other) {
      return other && other.isMarker && (0, _utilsArrayUtils.isArrayEqual)(this.markups, other.markups);
    }
  }, {
    key: 'textUntil',
    value: function textUntil(offset) {
      return this.value.slice(0, offset);
    }
  }, {
    key: 'split',
    value: function split() {
      var offset = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
      var endOffset = arguments.length <= 1 || arguments[1] === undefined ? this.length : arguments[1];

      var markers = [this.builder.createMarker(this.value.substring(0, offset)), this.builder.createMarker(this.value.substring(offset, endOffset)), this.builder.createMarker(this.value.substring(endOffset))];

      this.markups.forEach(function (mu) {
        return markers.forEach(function (m) {
          return m.addMarkup(mu);
        });
      });
      return markers;
    }

    /**
     * @return {Array} 2 markers either or both of which could be blank
     */
  }, {
    key: 'splitAtOffset',
    value: function splitAtOffset(offset) {
      (0, _utilsAssert['default'])('Cannot split a marker at an offset > its length', offset <= this.length);
      var value = this.value;
      var builder = this.builder;

      var pre = builder.createMarker(value.substring(0, offset));
      var post = builder.createMarker(value.substring(offset));

      this.markups.forEach(function (markup) {
        pre.addMarkup(markup);
        post.addMarkup(markup);
      });

      return [pre, post];
    }
  }, {
    key: 'isEmpty',
    get: function get() {
      return this.isBlank;
    }
  }, {
    key: 'isBlank',
    get: function get() {
      return this.length === 0;
    }
  }, {
    key: 'text',
    get: function get() {
      return this.value;
    }
  }, {
    key: 'length',
    get: function get() {
      return this.value.length;
    }
  }]);

  return Marker;
})(_utilsLinkedItem['default']);

(0, _utilsMixin['default'])(Marker, _utilsMarkuperable['default']);

exports['default'] = Marker;