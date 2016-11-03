'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x4, _x5, _x6) { var _again = true; _function: while (_again) { var object = _x4, property = _x5, receiver = _x6; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x4 = parent; _x5 = property; _x6 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _types = require('./types');

var _utilsMixin = require('../utils/mixin');

var _utilsMarkuperable = require('../utils/markuperable');

var _utilsLinkedItem = require('../utils/linked-item');

var _utilsAssert = require('../utils/assert');

var ATOM_LENGTH = 1;

var Atom = (function (_LinkedItem) {
  _inherits(Atom, _LinkedItem);

  function Atom(name, value, payload) {
    var _this = this;

    var markups = arguments.length <= 3 || arguments[3] === undefined ? [] : arguments[3];

    _classCallCheck(this, Atom);

    _get(Object.getPrototypeOf(Atom.prototype), 'constructor', this).call(this);
    this.name = name;
    this.value = value;
    this.text = ''; // An atom never has text, but it does have a value
    (0, _utilsAssert['default'])('Atom must have value', value !== undefined && value !== null);
    this.payload = payload;
    this.type = _types.ATOM_TYPE;
    this.isMarker = false;
    this.isAtom = true;

    this.markups = [];
    markups.forEach(function (m) {
      return _this.addMarkup(m);
    });
  }

  _createClass(Atom, [{
    key: 'clone',
    value: function clone() {
      var clonedMarkups = this.markups.slice();
      return this.builder.createAtom(this.name, this.value, this.payload, clonedMarkups);
    }
  }, {
    key: 'canJoin',
    value: function canJoin() /* other */{
      return false;
    }
  }, {
    key: 'textUntil',
    value: function textUntil() /* offset */{
      return '';
    }
  }, {
    key: 'split',
    value: function split() {
      var offset = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
      var endOffset = arguments.length <= 1 || arguments[1] === undefined ? offset : arguments[1];
      return (function () {
        var markers = [];

        if (endOffset === 0) {
          markers.push(this.builder.createMarker('', this.markups.slice()));
        }

        markers.push(this.clone());

        if (offset === ATOM_LENGTH) {
          markers.push(this.builder.createMarker('', this.markups.slice()));
        }

        return markers;
      }).apply(this, arguments);
    }
  }, {
    key: 'splitAtOffset',
    value: function splitAtOffset(offset) {
      (0, _utilsAssert['default'])('Cannot split a marker at an offset > its length', offset <= this.length);

      var builder = this.builder;

      var clone = this.clone();
      var blankMarker = builder.createMarker('');
      var pre = undefined,
          post = undefined;

      if (offset === 0) {
        pre = blankMarker;
        post = clone;
      } else if (offset === ATOM_LENGTH) {
        pre = clone;
        post = blankMarker;
      } else {
        (0, _utilsAssert['default'])('Invalid offset given to Atom#splitAtOffset: "' + offset + '"', false);
      }

      this.markups.forEach(function (markup) {
        pre.addMarkup(markup);
        post.addMarkup(markup);
      });
      return [pre, post];
    }
  }, {
    key: 'isBlank',
    get: function get() {
      return false;
    }
  }, {
    key: 'length',
    get: function get() {
      return ATOM_LENGTH;
    }
  }]);

  return Atom;
})(_utilsLinkedItem['default']);

(0, _utilsMixin['default'])(Atom, _utilsMarkuperable['default']);

exports['default'] = Atom;