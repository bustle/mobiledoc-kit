'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x4, _x5, _x6) { var _again = true; _function: while (_again) { var object = _x4, property = _x5, receiver = _x6; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x4 = parent; _x5 = property; _x6 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _utilsArrayUtils = require('../utils/array-utils');

var _utilsSet = require('../utils/set');

var _utilsLinkedList = require('../utils/linked-list');

var _section = require('./_section');

var _utilsAssert = require('../utils/assert');

var Markerable = (function (_Section) {
  _inherits(Markerable, _Section);

  function Markerable(type, tagName) {
    var _this = this;

    var markers = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];

    _classCallCheck(this, Markerable);

    _get(Object.getPrototypeOf(Markerable.prototype), 'constructor', this).call(this, type);
    this.isMarkerable = true;
    this.tagName = tagName;
    this.markers = new _utilsLinkedList['default']({
      adoptItem: function adoptItem(m) {
        (0, _utilsAssert['default'])('Can only insert markers and atoms into markerable (was: ' + m.type + ')', m.isMarker || m.isAtom);
        m.section = m.parent = _this;
      },
      freeItem: function freeItem(m) {
        return m.section = m.parent = null;
      }
    });

    markers.forEach(function (m) {
      return _this.markers.append(m);
    });
  }

  _createClass(Markerable, [{
    key: 'canJoin',
    value: function canJoin(other) {
      return other.isMarkerable && other.type === this.type && other.tagName === this.tagName;
    }
  }, {
    key: 'clone',
    value: function clone() {
      var newMarkers = this.markers.map(function (m) {
        return m.clone();
      });
      return this.builder.createMarkerableSection(this.type, this.tagName, newMarkers);
    }
  }, {
    key: 'textUntil',
    value: function textUntil(position) {
      (0, _utilsAssert['default'])('Cannot get textUntil for a position not in this section', position.section === this);
      var marker = position.marker;
      var offsetInMarker = position.offsetInMarker;

      var text = '';
      var currentMarker = this.markers.head;
      while (currentMarker) {
        if (currentMarker === marker) {
          text += currentMarker.textUntil(offsetInMarker);
          break;
        } else {
          text += currentMarker.text;
          currentMarker = currentMarker.next;
        }
      }
      return text;
    }

    /**
     * @param {Marker}
     * @param {Number} markerOffset The offset relative to the start of the marker
     *
     * @return {Number} The offset relative to the start of this section
     */
  }, {
    key: 'offsetOfMarker',
    value: function offsetOfMarker(marker) {
      var markerOffset = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

      (0, _utilsAssert['default'])('Cannot get offsetOfMarker for marker that is not child of this', marker.section === this);

      // FIXME it is possible, when we get a cursor position before having finished reparsing,
      // for markerOffset to be > marker.length. We shouldn't rely on this functionality.

      var offset = 0;
      var currentMarker = this.markers.head;
      while (currentMarker && currentMarker !== marker.next) {
        var _length = currentMarker === marker ? markerOffset : currentMarker.length;
        offset += _length;
        currentMarker = currentMarker.next;
      }

      return offset;
    }

    // puts clones of this.markers into beforeSection and afterSection,
    // all markers before the marker/offset split go in beforeSection, and all
    // after the marker/offset split go in afterSection
    // @return {Array} [beforeSection, afterSection], two new sections
  }, {
    key: '_redistributeMarkers',
    value: function _redistributeMarkers(beforeSection, afterSection, marker) {
      var offset = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];

      var currentSection = beforeSection;
      (0, _utilsArrayUtils.forEach)(this.markers, function (m) {
        if (m === marker) {
          var _marker$split = marker.split(offset);

          var _marker$split2 = _toArray(_marker$split);

          var beforeMarker = _marker$split2[0];

          var afterMarkers = _marker$split2.slice(1);

          beforeSection.markers.append(beforeMarker);
          (0, _utilsArrayUtils.forEach)(afterMarkers, function (_m) {
            return afterSection.markers.append(_m);
          });
          currentSection = afterSection;
        } else {
          currentSection.markers.append(m.clone());
        }
      });

      return [beforeSection, afterSection];
    }
  }, {
    key: 'splitAtMarker',
    value: function splitAtMarker() /*marker, offset=0*/{
      (0, _utilsAssert['default'])('splitAtMarker must be implemented by sub-class', false);
    }

    /**
     * Split this section's marker (if any) at the given offset, so that
     * there is now a marker boundary at that offset (useful for later applying
     * a markup to a range)
     * @param {Number} sectionOffset The offset relative to start of this section
     * @return {EditObject} An edit object with 'removed' and 'added' keys with arrays of Markers. The added markers may be blank.
     * After calling `splitMarkerAtOffset(offset)`, there will always be a valid
     * result returned from `markerBeforeOffset(offset)`.
     */
  }, {
    key: 'splitMarkerAtOffset',
    value: function splitMarkerAtOffset(sectionOffset) {
      (0, _utilsAssert['default'])('Cannot splitMarkerAtOffset when offset is > length', sectionOffset <= this.length);
      var markerOffset = undefined;
      var len = 0;
      var currentMarker = this.markers.head;
      var edit = { added: [], removed: [] };

      if (!currentMarker) {
        var blankMarker = this.builder.createMarker();
        this.markers.prepend(blankMarker);
        edit.added.push(blankMarker);
      } else {
        while (currentMarker) {
          len += currentMarker.length;
          if (len === sectionOffset) {
            // nothing to do, there is a gap at the requested offset
            break;
          } else if (len > sectionOffset) {
            var _edit$added;

            markerOffset = currentMarker.length - (len - sectionOffset);
            var newMarkers = currentMarker.splitAtOffset(markerOffset);
            (_edit$added = edit.added).push.apply(_edit$added, _toConsumableArray(newMarkers));
            edit.removed.push(currentMarker);
            this.markers.splice(currentMarker, 1, newMarkers);
            break;
          } else {
            currentMarker = currentMarker.next;
          }
        }
      }

      return edit;
    }
  }, {
    key: 'splitAtPosition',
    value: function splitAtPosition(position) {
      var marker = position.marker;
      var offsetInMarker = position.offsetInMarker;

      return this.splitAtMarker(marker, offsetInMarker);
    }

    // returns the marker just before this offset.
    // It is an error to call this method with an offset that is in the middle
    // of a marker.
  }, {
    key: 'markerBeforeOffset',
    value: function markerBeforeOffset(sectionOffset) {
      var len = 0;
      var currentMarker = this.markers.head;

      while (currentMarker) {
        len += currentMarker.length;
        if (len === sectionOffset) {
          return currentMarker;
        } else {
          (0, _utilsAssert['default'])('markerBeforeOffset called with sectionOffset not between markers', len < sectionOffset);
          currentMarker = currentMarker.next;
        }
      }
    }
  }, {
    key: 'markerPositionAtOffset',
    value: function markerPositionAtOffset(offset) {
      var currentOffset = 0;
      var currentMarker = undefined;
      var remaining = offset;
      this.markers.detect(function (marker) {
        currentOffset = Math.min(remaining, marker.length);
        remaining -= currentOffset;
        if (remaining === 0) {
          currentMarker = marker;
          return true; // break out of detect
        }
      });

      return { marker: currentMarker, offset: currentOffset };
    }
  }, {
    key: 'markersFor',

    /**
     * @return {Array} New markers that match the boundaries of the
     * range. Does not change the existing markers in this section.
     */
    value: function markersFor(headOffset, tailOffset) {
      var range = { head: { section: this, offset: headOffset },
        tail: { section: this, offset: tailOffset } };

      var markers = [];
      this._markersInRange(range, function (marker, _ref) {
        var markerHead = _ref.markerHead;
        var markerTail = _ref.markerTail;
        var isContained = _ref.isContained;

        var cloned = marker.clone();
        if (!isContained) {
          // cannot do marker.value.slice if the marker is an atom -- this breaks the atom's "atomic" value
          // If a marker is an atom `isContained` should always be true so
          // we shouldn't hit this code path. FIXME add tests
          cloned.value = marker.value.slice(markerHead, markerTail);
        }
        markers.push(cloned);
      });
      return markers;
    }
  }, {
    key: 'markupsInRange',
    value: function markupsInRange(range) {
      var markups = new _utilsSet['default']();
      this._markersInRange(range, function (marker) {
        marker.markups.forEach(function (m) {
          return markups.add(m);
        });
      });
      return markups.toArray();
    }

    // calls the callback with (marker, {markerHead, markerTail, isContained})
    // for each marker that is wholly or partially contained in the range.
  }, {
    key: '_markersInRange',
    value: function _markersInRange(range, callback) {
      var head = range.head;
      var tail = range.tail;

      (0, _utilsAssert['default'])('Cannot call #_markersInRange if range expands beyond this section', head.section === this && tail.section === this);
      var headOffset = head.offset;var tailOffset = tail.offset;

      var currentHead = 0,
          currentTail = 0,
          currentMarker = this.markers.head;

      while (currentMarker) {
        currentTail += currentMarker.length;

        if (currentTail > headOffset && currentHead < tailOffset) {
          var markerHead = Math.max(headOffset - currentHead, 0);
          var markerTail = currentMarker.length - Math.max(currentTail - tailOffset, 0);
          var isContained = markerHead === 0 && markerTail === currentMarker.length;

          callback(currentMarker, { markerHead: markerHead, markerTail: markerTail, isContained: isContained });
        }

        currentHead += currentMarker.length;
        currentMarker = currentMarker.next;

        if (currentHead > tailOffset) {
          break;
        }
      }
    }

    // mutates this by appending the other section's (cloned) markers to it
  }, {
    key: 'join',
    value: function join(otherSection) {
      var _this2 = this;

      var beforeMarker = this.markers.tail;
      var afterMarker = null;

      otherSection.markers.forEach(function (m) {
        if (!m.isBlank) {
          m = m.clone();
          _this2.markers.append(m);
          if (!afterMarker) {
            afterMarker = m;
          }
        }
      });

      return { beforeMarker: beforeMarker, afterMarker: afterMarker };
    }
  }, {
    key: 'isBlank',
    get: function get() {
      if (!this.markers.length) {
        return true;
      }
      return this.markers.every(function (m) {
        return m.isBlank;
      });
    }
  }, {
    key: 'text',
    get: function get() {
      return (0, _utilsArrayUtils.reduce)(this.markers, function (prev, m) {
        return prev + m.value;
      }, '');
    }
  }, {
    key: 'length',
    get: function get() {
      return (0, _utilsArrayUtils.reduce)(this.markers, function (prev, m) {
        return prev + m.length;
      }, 0);
    }
  }]);

  return Markerable;
})(_section['default']);

exports['default'] = Markerable;