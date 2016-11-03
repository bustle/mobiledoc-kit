'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _section = require('./_section');

var _types = require('./types');

var _utilsCopy = require('../utils/copy');

var CARD_MODES = {
  DISPLAY: 'display',
  EDIT: 'edit'
};

exports.CARD_MODES = CARD_MODES;
var CARD_LENGTH = 1;

var DEFAULT_INITIAL_MODE = CARD_MODES.DISPLAY;

var Card = (function (_Section) {
  _inherits(Card, _Section);

  function Card(name, payload) {
    _classCallCheck(this, Card);

    _get(Object.getPrototypeOf(Card.prototype), 'constructor', this).call(this, _types.CARD_TYPE);
    this.name = name;
    this.payload = payload;
    this.setInitialMode(DEFAULT_INITIAL_MODE);
    this.isCardSection = true;
  }

  _createClass(Card, [{
    key: 'canJoin',
    value: function canJoin() {
      return false;
    }
  }, {
    key: 'clone',
    value: function clone() {
      var payload = (0, _utilsCopy.shallowCopyObject)(this.payload);
      var card = this.builder.createCardSection(this.name, payload);
      // If this card is currently rendered, clone the mode it is
      // currently in as the default mode of the new card.
      var mode = this._initialMode;
      if (this.renderNode && this.renderNode.cardNode) {
        mode = this.renderNode.cardNode.mode;
      }
      card.setInitialMode(mode);
      return card;
    }

    /**
     * set the mode that this will be rendered into initially
     * @private
     */
  }, {
    key: 'setInitialMode',
    value: function setInitialMode(initialMode) {
      // TODO validate initialMode
      this._initialMode = initialMode;
    }
  }, {
    key: 'isBlank',
    get: function get() {
      return false;
    }
  }, {
    key: 'length',
    get: function get() {
      return CARD_LENGTH;
    }
  }]);

  return Card;
})(_section['default']);

exports['default'] = Card;