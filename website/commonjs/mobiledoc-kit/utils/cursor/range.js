'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _position = require('./position');

var _key = require('../key');

var _utilsAssert = require('../../utils/assert');

/**
 * A logical range of a {@link Post}.
 * Usually an instance of Range will be read from the {@link Editor#range} property,
 * but it may be useful to instantiate a range directly when programmatically modifying a Post.
 */

var Range = (function () {
  /**
   * @param {Position} head
   * @param {Position} [tail=head]
   * @param {Direction} [direction=null]
   * @return {Range}
   * @private
   */

  function Range(head) {
    var tail = arguments.length <= 1 || arguments[1] === undefined ? head : arguments[1];
    var direction = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
    return (function () {
      _classCallCheck(this, Range);

      /** @property {Position} head */
      this.head = head;

      /** @property {Position} tail */
      this.tail = tail;

      /** @property {Direction} direction */
      this.direction = direction;
    }).apply(this, arguments);
  }

  /**
   * Shorthand to create a new range from a section(s) and offset(s).
   * When given only a head section and offset, creates a collapsed range.
   * @param {Section} headSection
   * @param {number} headOffset
   * @param {Section} [tailSection=headSection]
   * @param {number} [tailOffset=headOffset]
   * @param {Direction} [direction=null]
   * @return {Range}
   */

  _createClass(Range, [{
    key: 'trimTo',

    /**
     * @param {Markerable} section
     * @return {Range} A range that is constrained to only the part that
     * includes the section.
     * FIXME -- if the section isn't the head or tail, it's assumed to be
     * wholly contained. It's possible to call `trimTo` with a selection that is
     * outside of the range, though, which would invalidate that assumption.
     * There's no efficient way to determine if a section is within a range, yet.
     * @private
     */
    value: function trimTo(section) {
      var length = section.length;

      var headOffset = section === this.head.section ? Math.min(this.head.offset, length) : 0;
      var tailOffset = section === this.tail.section ? Math.min(this.tail.offset, length) : length;

      return Range.create(section, headOffset, section, tailOffset);
    }

    /**
     * Expands the range 1 unit in the given direction
     * If the range is expandable in the given direction, always returns a
     * non-collapsed range.
     * @param {Number} units If units is > 0, the range is extended to the right,
     *                 otherwise range is extended to the left.
     * @return {Range}
     * @public
     */
  }, {
    key: 'extend',
    value: function extend(units) {
      (0, _utilsAssert['default'])('Must pass integer to Range#extend', typeof units === 'number');

      if (units === 0) {
        return this;
      }

      var head = this.head;
      var tail = this.tail;
      var currentDirection = this.direction;

      switch (currentDirection) {
        case _key.DIRECTION.FORWARD:
          return new Range(head, tail.move(units), currentDirection);
        case _key.DIRECTION.BACKWARD:
          return new Range(head.move(units), tail, currentDirection);
        default:
          {
            var newDirection = units > 0 ? _key.DIRECTION.FORWARD : _key.DIRECTION.BACKWARD;
            return new Range(head, tail, newDirection).extend(units);
          }
      }
    }

    /**
     * Moves this range 1 unit in the given direction.
     * If the range is collapsed, returns a collapsed range shifted by 1 unit,
     * otherwise collapses this range to the position at the `direction` end of the range.
     * Always returns a collapsed range.
     * @param {Direction} direction
     * @return {Range}
     * @public
     */
  }, {
    key: 'move',
    value: function move(direction) {
      (0, _utilsAssert['default'])('Must pass DIRECTION.FORWARD (' + _key.DIRECTION.FORWARD + ') or DIRECTION.BACKWARD (' + _key.DIRECTION.BACKWARD + ') to Range#move', direction === _key.DIRECTION.FORWARD || direction === _key.DIRECTION.BACKWARD);

      var focusedPosition = this.focusedPosition;
      var isCollapsed = this.isCollapsed;

      if (isCollapsed) {
        return new Range(focusedPosition.move(direction));
      } else {
        return this._collapse(direction);
      }
    }

    /**
     * expand a range to all markers matching a given check
     *
     * @param {Function} detectMarker
     * @return {Range} The expanded range
     *
     * @public
     */
  }, {
    key: 'expandByMarker',
    value: function expandByMarker(detectMarker) {
      var head = this.head;
      var tail = this.tail;
      var direction = this.direction;
      var headSection = head.section;

      if (headSection !== tail.section) {
        throw new Error('#expandByMarker does not work across sections. Perhaps you should confirm the range is collapsed');
      }

      var firstNotMatchingDetect = function firstNotMatchingDetect(i) {
        return !detectMarker(i);
      };

      var headMarker = headSection.markers.detect(firstNotMatchingDetect, head.marker, true);
      if (!headMarker && detectMarker(headSection.markers.head)) {
        headMarker = headSection.markers.head;
      } else {
        headMarker = headMarker.next || head.marker;
      }
      var headPosition = new _position['default'](headSection, headSection.offsetOfMarker(headMarker));

      var tailMarker = tail.section.markers.detect(firstNotMatchingDetect, tail.marker);
      if (!tailMarker && detectMarker(headSection.markers.tail)) {
        tailMarker = headSection.markers.tail;
      } else {
        tailMarker = tailMarker.prev || tail.marker;
      }
      var tailPosition = new _position['default'](tail.section, tail.section.offsetOfMarker(tailMarker) + tailMarker.length);

      return headPosition.toRange(tailPosition, direction);
    }
  }, {
    key: '_collapse',
    value: function _collapse(direction) {
      return new Range(direction === _key.DIRECTION.BACKWARD ? this.head : this.tail);
    }
  }, {
    key: 'isEqual',
    value: function isEqual(other) {
      return other && this.head.isEqual(other.head) && this.tail.isEqual(other.tail);
    }
  }, {
    key: 'focusedPosition',
    get: function get() {
      return this.direction === _key.DIRECTION.BACKWARD ? this.head : this.tail;
    }
  }, {
    key: 'isBlank',
    get: function get() {
      return this.head.isBlank && this.tail.isBlank;
    }

    // "legacy" APIs
  }, {
    key: 'headSection',
    get: function get() {
      return this.head.section;
    }
  }, {
    key: 'tailSection',
    get: function get() {
      return this.tail.section;
    }
  }, {
    key: 'headSectionOffset',
    get: function get() {
      return this.head.offset;
    }
  }, {
    key: 'tailSectionOffset',
    get: function get() {
      return this.tail.offset;
    }
  }, {
    key: 'isCollapsed',
    get: function get() {
      return this.head.isEqual(this.tail);
    }
  }, {
    key: 'headMarker',
    get: function get() {
      return this.head.marker;
    }
  }, {
    key: 'tailMarker',
    get: function get() {
      return this.tail.marker;
    }
  }, {
    key: 'headMarkerOffset',
    get: function get() {
      return this.head.offsetInMarker;
    }
  }, {
    key: 'tailMarkerOffset',
    get: function get() {
      return this.tail.offsetInMarker;
    }
  }], [{
    key: 'create',
    value: function create(headSection, headOffset) {
      var tailSection = arguments.length <= 2 || arguments[2] === undefined ? headSection : arguments[2];
      var tailOffset = arguments.length <= 3 || arguments[3] === undefined ? headOffset : arguments[3];
      var direction = arguments.length <= 4 || arguments[4] === undefined ? null : arguments[4];
      return (function () {
        return new Range(new _position['default'](headSection, headOffset), new _position['default'](tailSection, tailOffset), direction);
      })();
    }
  }, {
    key: 'blankRange',
    value: function blankRange() {
      return new Range(_position['default'].blankPosition(), _position['default'].blankPosition());
    }
  }]);

  return Range;
})();

exports['default'] = Range;