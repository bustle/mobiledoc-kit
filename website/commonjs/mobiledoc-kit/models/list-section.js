'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _utilsLinkedList = require('../utils/linked-list');

var _utilsArrayUtils = require('../utils/array-utils');

var _types = require('./types');

var _section = require('./_section');

var _utilsDomUtils = require('../utils/dom-utils');

var _utilsAssert = require('../utils/assert');

var VALID_LIST_SECTION_TAGNAMES = ['ul', 'ol'].map(_utilsDomUtils.normalizeTagName);

exports.VALID_LIST_SECTION_TAGNAMES = VALID_LIST_SECTION_TAGNAMES;
var DEFAULT_TAG_NAME = VALID_LIST_SECTION_TAGNAMES[0];

exports.DEFAULT_TAG_NAME = DEFAULT_TAG_NAME;

var ListSection = (function (_Section) {
  _inherits(ListSection, _Section);

  function ListSection() {
    var _this = this;

    var tagName = arguments.length <= 0 || arguments[0] === undefined ? DEFAULT_TAG_NAME : arguments[0];
    var items = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

    _classCallCheck(this, ListSection);

    _get(Object.getPrototypeOf(ListSection.prototype), 'constructor', this).call(this, _types.LIST_SECTION_TYPE);
    this.tagName = tagName;
    this.isListSection = true;
    this.isLeafSection = false;

    this.items = new _utilsLinkedList['default']({
      adoptItem: function adoptItem(i) {
        (0, _utilsAssert['default'])('Cannot insert non-list-item to list (is: ' + i.type + ')', i.isListItem);
        i.section = i.parent = _this;
      },
      freeItem: function freeItem(i) {
        return i.section = i.parent = null;
      }
    });
    this.sections = this.items;

    items.forEach(function (i) {
      return _this.items.append(i);
    });
  }

  _createClass(ListSection, [{
    key: 'canJoin',
    value: function canJoin() {
      return false;
    }
  }, {
    key: 'isValidTagName',
    value: function isValidTagName(normalizedTagName) {
      return (0, _utilsArrayUtils.contains)(VALID_LIST_SECTION_TAGNAMES, normalizedTagName);
    }
  }, {
    key: 'headPosition',
    value: function headPosition() {
      return this.items.head.headPosition();
    }
  }, {
    key: 'tailPosition',
    value: function tailPosition() {
      return this.items.tail.tailPosition();
    }
  }, {
    key: 'clone',
    value: function clone() {
      var newSection = this.builder.createListSection(this.tagName);
      (0, _utilsArrayUtils.forEach)(this.items, function (i) {
        return newSection.items.append(i.clone());
      });
      return newSection;
    }

    /**
     * Mutates this list
     * @param {ListSection|Markerable}
     * @return null
     */
  }, {
    key: 'join',
    value: function join(other) {
      var _this2 = this;

      if (other.isListSection) {
        other.items.forEach(function (i) {
          return _this2.join(i);
        });
      } else if (other.isMarkerable) {
        var item = this.builder.createListItem();
        item.join(other);
        this.items.append(item);
      }
    }
  }, {
    key: 'isBlank',
    get: function get() {
      return this.items.isEmpty;
    }
  }]);

  return ListSection;
})(_section['default']);

exports['default'] = ListSection;