'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _utilsDomUtils = require('../utils/dom-utils');

var _utilsLinkedItem = require('../utils/linked-item');

var _utilsAssert = require('../utils/assert');

var _utilsCursorPosition = require('../utils/cursor/position');

function unimplementedMethod(methodName, me) {
  (0, _utilsAssert['default'])('`' + methodName + '()` must be implemented by ' + me.constructor.name, false);
}

var Section = (function (_LinkedItem) {
  _inherits(Section, _LinkedItem);

  function Section(type) {
    _classCallCheck(this, Section);

    _get(Object.getPrototypeOf(Section.prototype), 'constructor', this).call(this);
    (0, _utilsAssert['default'])('Cannot create section without type', !!type);
    this.type = type;
    this.isSection = true;
    this.isMarkerable = false;
    this.isNested = false;
    this.isSection = true;
    this.isLeafSection = true;
  }

  _createClass(Section, [{
    key: 'isValidTagName',
    value: function isValidTagName() /* normalizedTagName */{
      unimplementedMethod('isValidTagName', this);
    }
  }, {
    key: 'clone',
    value: function clone() {
      unimplementedMethod('clone', this);
    }
  }, {
    key: 'canJoin',
    value: function canJoin() /* otherSection */{
      unimplementedMethod('canJoin', this);
    }

    /**
     * @return {Position} The position at the start of this section
     * @public
     */
  }, {
    key: 'headPosition',
    value: function headPosition() {
      return this.toPosition(0);
    }

    /**
     * @return {Position} The position at the end of this section
     * @public
     */
  }, {
    key: 'tailPosition',
    value: function tailPosition() {
      return this.toPosition(this.length);
    }

    /**
     * @param {Number} offset
     * @return {Position} The position in this section at the given offset
     * @public
     */
  }, {
    key: 'toPosition',
    value: function toPosition(offset) {
      (0, _utilsAssert['default'])("Must pass number to `toPosition`", typeof offset === 'number');
      (0, _utilsAssert['default'])("Cannot call `toPosition` with offset > length", offset <= this.length);

      return new _utilsCursorPosition['default'](this, offset);
    }

    /**
     * @return {Range} A range from this section's head to tail positions
     * @public
     */
  }, {
    key: 'toRange',
    value: function toRange() {
      return this.headPosition().toRange(this.tailPosition());
    }
  }, {
    key: 'join',
    value: function join() {
      unimplementedMethod('join', this);
    }
  }, {
    key: 'textUntil',
    value: function textUntil() /* position */{
      return '';
    }

    /**
     * Markerable sections should override this method
     */
  }, {
    key: 'splitMarkerAtOffset',
    value: function splitMarkerAtOffset() {
      var blankEdit = { added: [], removed: [] };
      return blankEdit;
    }
  }, {
    key: 'nextLeafSection',
    value: function nextLeafSection() {
      var next = this.next;
      if (next) {
        if (next.items) {
          return next.items.head;
        } else {
          return next;
        }
      } else {
        if (this.isNested) {
          return this.parent.nextLeafSection();
        }
      }
    }
  }, {
    key: 'immediatelyNextMarkerableSection',
    value: function immediatelyNextMarkerableSection() {
      var next = this.nextLeafSection();
      while (next && !next.isMarkerable) {
        next = next.nextLeafSection();
      }
      return next;
    }
  }, {
    key: 'previousLeafSection',
    value: function previousLeafSection() {
      var prev = this.prev;

      if (prev) {
        if (prev.items) {
          return prev.items.tail;
        } else {
          return prev;
        }
      } else {
        if (this.isNested) {
          return this.parent.previousLeafSection();
        }
      }
    }
  }, {
    key: 'tagName',
    set: function set(val) {
      var normalizedTagName = (0, _utilsDomUtils.normalizeTagName)(val);
      (0, _utilsAssert['default'])('Cannot set section tagName to ' + val, this.isValidTagName(normalizedTagName));
      this._tagName = normalizedTagName;
    },
    get: function get() {
      return this._tagName;
    }
  }, {
    key: 'length',
    get: function get() {
      return 0;
    }
  }, {
    key: 'isBlank',
    get: function get() {
      unimplementedMethod('isBlank', this);
    }
  }]);

  return Section;
})(_utilsLinkedItem['default']);

exports['default'] = Section;