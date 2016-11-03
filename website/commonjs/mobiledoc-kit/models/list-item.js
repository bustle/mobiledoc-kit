'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _markerable = require('./_markerable');

var _types = require('./types');

var _utilsDomUtils = require('../utils/dom-utils');

var _utilsArrayUtils = require('../utils/array-utils');

var VALID_LIST_ITEM_TAGNAMES = ['li'].map(_utilsDomUtils.normalizeTagName);

exports.VALID_LIST_ITEM_TAGNAMES = VALID_LIST_ITEM_TAGNAMES;

var ListItem = (function (_Markerable) {
  _inherits(ListItem, _Markerable);

  function ListItem(tagName) {
    var markers = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

    _classCallCheck(this, ListItem);

    _get(Object.getPrototypeOf(ListItem.prototype), 'constructor', this).call(this, _types.LIST_ITEM_TYPE, tagName, markers);
    this.isListItem = true;
    this.isNested = true;
  }

  _createClass(ListItem, [{
    key: 'isValidTagName',
    value: function isValidTagName(normalizedTagName) {
      return (0, _utilsArrayUtils.contains)(VALID_LIST_ITEM_TAGNAMES, normalizedTagName);
    }
  }, {
    key: 'splitAtMarker',
    value: function splitAtMarker(marker) {
      var offset = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

      // FIXME need to check if we are going to split into two list items
      // or a list item and a new markup section:
      var isLastItem = !this.next;
      var createNewSection = !marker && offset === 0 && isLastItem;

      var beforeSection = this.builder.createListItem();
      var afterSection = createNewSection ? this.builder.createMarkupSection() : this.builder.createListItem();

      return this._redistributeMarkers(beforeSection, afterSection, marker, offset);
    }
  }, {
    key: 'post',
    get: function get() {
      return this.section.post;
    }
  }]);

  return ListItem;
})(_markerable['default']);

exports['default'] = ListItem;