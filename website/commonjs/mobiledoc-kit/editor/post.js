'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utilsCursorPosition = require('../utils/cursor/position');

var _utilsCursorRange = require('../utils/cursor/range');

var _utilsArrayUtils = require('../utils/array-utils');

var _utilsKey = require('../utils/key');

var _modelsLifecycleCallbacks = require('../models/lifecycle-callbacks');

var _utilsAssert = require('../utils/assert');

var _utilsDomUtils = require('../utils/dom-utils');

var _postPostInserter = require('./post/post-inserter');

var _utilsDeprecate = require('../utils/deprecate');

var _utilsToRange = require('../utils/to-range');

var FORWARD = _utilsKey.DIRECTION.FORWARD;
var BACKWARD = _utilsKey.DIRECTION.BACKWARD;

function isListSectionTagName(tagName) {
  return tagName === 'ul' || tagName === 'ol';
}

var CALLBACK_QUEUES = {
  BEFORE_COMPLETE: 'beforeComplete',
  COMPLETE: 'complete',
  AFTER_COMPLETE: 'afterComplete'
};

// There are only two events that we're concerned about for Undo, that is inserting text and deleting content.
// These are the only two states that go on a "run" and create a combined undo, everything else has it's own
// deadicated undo.
var EDIT_ACTIONS = {
  INSERT_TEXT: 1,
  DELETE: 2
};

/**
 * The PostEditor is used to modify a post. It should not be instantiated directly.
 * Instead, a new instance of a PostEditor is created by the editor and passed
 * as the argument to the callback in {@link Editor#run}.
 *
 * Usage:
 * ```
 * editor.run((postEditor) => {
 *   // postEditor is an instance of PostEditor that can operate on the
 *   // editor's post
 * });
 * ```
 */

var PostEditor = (function () {
  /**
   * @private
   */

  function PostEditor(editor) {
    var _this = this;

    _classCallCheck(this, PostEditor);

    this.editor = editor;
    this.builder = this.editor.builder;
    this._callbacks = new _modelsLifecycleCallbacks['default']((0, _utilsArrayUtils.values)(CALLBACK_QUEUES));

    this._didComplete = false;
    this.editActionTaken = null;

    this._renderRange = function () {
      return _this.editor.selectRange(_this._range);
    };
    this._postDidChange = function () {
      return _this.editor._postDidChange();
    };
    this._rerender = function () {
      return _this.editor.rerender();
    };
  }

  _createClass(PostEditor, [{
    key: 'addCallback',
    value: function addCallback() {
      var _callbacks;

      (_callbacks = this._callbacks).addCallback.apply(_callbacks, arguments);
    }
  }, {
    key: 'addCallbackOnce',
    value: function addCallbackOnce() {
      var _callbacks2;

      (_callbacks2 = this._callbacks).addCallbackOnce.apply(_callbacks2, arguments);
    }
  }, {
    key: 'runCallbacks',
    value: function runCallbacks() {
      var _callbacks3;

      (_callbacks3 = this._callbacks).runCallbacks.apply(_callbacks3, arguments);
    }
  }, {
    key: 'begin',
    value: function begin() {
      // cache the editor's range
      this._range = this.editor.range;
    }

    /**
     * Schedules to select the given range on the editor after the postEditor
     * has completed its work. This also updates the postEditor's active range
     * (so that multiple calls to range-changing methods on the postEditor will
     * update the correct range).
     *
     * Usage:
     *   let range = editor.range;
     *   editor.run(postEditor => {
     *     let nextPosition = postEditor.deleteRange(range);
     *
     *     // Will position the editor's cursor at `nextPosition` after
     *     // the postEditor finishes work and the editor rerenders.
     *     postEditor.setRange(nextPosition);
     *   });
     * @param {Range|Position} range
     * @public
     */
  }, {
    key: 'setRange',
    value: function setRange(range) {
      range = (0, _utilsToRange['default'])(range);

      // TODO validate that the range is valid
      // (does not contain marked-for-removal head or tail sections?)
      this._range = range;
      this.scheduleAfterRender(this._renderRange, true);
    }

    /**
     * Delete a range from the post
     *
     * Usage:
     * ```
     *     let { range } = editor;
     *     editor.run((postEditor) => {
     *       let nextPosition = postEditor.deleteRange(range);
     *       postEditor.setRange(nextPosition);
     *     });
     * ```
     * @param {Range} range Cursor Range object with head and tail Positions
     * @return {Position} The position where the cursor would go after deletion
     * @public
     */
  }, {
    key: 'deleteRange',
    value: function deleteRange(range) {
      (0, _utilsAssert['default'])("Must pass MobiledocKit Range to `deleteRange`", range instanceof _utilsCursorRange['default']);

      this.editActionTaken = EDIT_ACTIONS.DELETE;

      var head = range.head;
      var headSection = range.head.section;
      var tail = range.tail;
      var tailSection = range.tail.section;
      var post = this.editor.post;

      if (headSection === tailSection) {
        return this.cutSection(headSection, head, tail);
      }

      var nextSection = headSection.nextLeafSection();

      var nextPos = this.cutSection(headSection, head, headSection.tailPosition());
      // cutSection can replace the section, so re-read headSection here
      headSection = nextPos.section;

      // Remove sections in the middle of the range
      while (nextSection !== tailSection) {
        var tmp = nextSection;
        nextSection = nextSection.nextLeafSection();
        this.removeSection(tmp);
      }

      var tailPos = this.cutSection(tailSection, tailSection.headPosition(), tail);
      // cutSection can replace the section, so re-read tailSection here
      tailSection = tailPos.section;

      if (tailSection.isBlank) {
        this.removeSection(tailSection);
      } else {
        // If head and tail sections are markerable, join them
        // Note: They may not be the same section type. E.g. this may join
        // a tail section that was a list item onto a markup section, or vice versa.
        // (This is the desired behavior.)
        if (headSection.isMarkerable && tailSection.isMarkerable) {
          headSection.join(tailSection);
          this._markDirty(headSection);
          this.removeSection(tailSection);
        } else if (headSection.isBlank) {
          this.removeSection(headSection);
          nextPos = tailPos;
        }
      }

      if (post.isBlank) {
        post.sections.append(this.builder.createMarkupSection('p'));
        nextPos = post.headPosition();
      }

      return nextPos;
    }

    /**
     * Note: This method may replace `section` with a different section.
     *
     * "Cut" out the part of the section inside `headOffset` and `tailOffset`.
     * If section is markerable this splits markers that straddle the head or tail (if necessary),
     * and removes markers that are wholly inside the offsets.
     * If section is a card, this may replace it with a blank markup section if the
     * positions contain the entire card.
     *
     * @param {Section} section
     * @param {Position} head
     * @param {Position} tail
     * @return {Position}
     * @private
     */
  }, {
    key: 'cutSection',
    value: function cutSection(section, head, tail) {
      var _this2 = this;

      (0, _utilsAssert['default'])('Must pass head position and tail position to `cutSection`', head instanceof _utilsCursorPosition['default'] && tail instanceof _utilsCursorPosition['default']);
      (0, _utilsAssert['default'])('Must pass positions within same section to `cutSection`', head.section === tail.section);

      if (section.isBlank || head.isEqual(tail)) {
        return head;
      }
      if (section.isCardSection) {
        if (head.isHead() && tail.isTail()) {
          var newSection = this.builder.createMarkupSection();
          this.replaceSection(section, newSection);
          return newSection.headPosition();
        } else {
          return tail;
        }
      }

      var range = head.toRange(tail);
      this.splitMarkers(range).forEach(function (m) {
        return _this2.removeMarker(m);
      });

      return head;
    }
  }, {
    key: '_coalesceMarkers',
    value: function _coalesceMarkers(section) {
      if (section.isMarkerable) {
        this._removeBlankMarkers(section);
        this._joinSimilarMarkers(section);
      }
    }
  }, {
    key: '_removeBlankMarkers',
    value: function _removeBlankMarkers(section) {
      var _this3 = this;

      (0, _utilsArrayUtils.forEach)((0, _utilsArrayUtils.filter)(section.markers, function (m) {
        return m.isBlank;
      }), function (m) {
        return _this3.removeMarker(m);
      });
    }

    // joins markers that have identical markups
  }, {
    key: '_joinSimilarMarkers',
    value: function _joinSimilarMarkers(section) {
      var marker = section.markers.head;
      var nextMarker = undefined;
      while (marker && marker.next) {
        nextMarker = marker.next;

        if (marker.canJoin(nextMarker)) {
          nextMarker.value = marker.value + nextMarker.value;
          this._markDirty(nextMarker);
          this.removeMarker(marker);
        }

        marker = nextMarker;
      }
    }
  }, {
    key: 'removeMarker',
    value: function removeMarker(marker) {
      this._scheduleForRemoval(marker);
      if (marker.section) {
        this._markDirty(marker.section);
        marker.section.markers.remove(marker);
      }
    }
  }, {
    key: '_scheduleForRemoval',
    value: function _scheduleForRemoval(postNode) {
      var _this4 = this;

      if (postNode.renderNode) {
        postNode.renderNode.scheduleForRemoval();

        this.scheduleRerender();
        this.scheduleDidUpdate();
      }
      var removedAdjacentToList = postNode.prev && postNode.prev.isListSection || postNode.next && postNode.next.isListSection;
      if (removedAdjacentToList) {
        this.addCallback(CALLBACK_QUEUES.BEFORE_COMPLETE, function () {
          return _this4._joinContiguousListSections();
        });
      }
    }
  }, {
    key: '_joinContiguousListSections',
    value: function _joinContiguousListSections() {
      var _this5 = this;

      var post = this.editor.post;

      var range = this._range;
      var prev = undefined;
      var groups = [];
      var currentGroup = undefined;

      // FIXME do we need to force a re-render of the range if changed sections
      // are contained within the range?
      var updatedHead = null;
      (0, _utilsArrayUtils.forEach)(post.sections, function (section) {
        if (prev && prev.isListSection && section.isListSection && prev.tagName === section.tagName) {

          currentGroup = currentGroup || [prev];
          currentGroup.push(section);
        } else {
          if (currentGroup) {
            groups.push(currentGroup);
          }
          currentGroup = null;
        }
        prev = section;
      });

      if (currentGroup) {
        groups.push(currentGroup);
      }

      (0, _utilsArrayUtils.forEach)(groups, function (group) {
        var list = group[0];
        (0, _utilsArrayUtils.forEach)(group, function (listSection) {
          if (listSection === list) {
            return;
          }

          var currentHead = range.head;
          var prevPosition = undefined;

          // FIXME is there a currentHead if there is no range?
          // is the current head a list item in the section
          if (!range.isBlank && currentHead.section.isListItem && currentHead.section.parent === listSection) {
            prevPosition = list.tailPosition();
          }
          _this5._joinListSections(list, listSection);
          if (prevPosition) {
            updatedHead = prevPosition.move(FORWARD);
          }
        });
      });

      if (updatedHead) {
        this.setRange(updatedHead);
      }
    }
  }, {
    key: '_joinListSections',
    value: function _joinListSections(baseList, nextList) {
      baseList.join(nextList);
      this._markDirty(baseList);
      this.removeSection(nextList);
    }
  }, {
    key: '_markDirty',
    value: function _markDirty(postNode) {
      var _this6 = this;

      if (postNode.renderNode) {
        postNode.renderNode.markDirty();

        this.scheduleRerender();
        this.scheduleDidUpdate();
      }
      if (postNode.section) {
        this._markDirty(postNode.section);
      }
      if (postNode.isMarkerable) {
        this.addCallback(CALLBACK_QUEUES.BEFORE_COMPLETE, function () {
          return _this6._coalesceMarkers(postNode);
        });
      }
    }

    /**
     * @param {Position} position object with {section, offset} the marker and offset to delete from
     * @param {Number} direction The direction to delete in (default is BACKWARD)
     * @return {Position} for positioning the cursor
     * @public
     * @deprecated after v0.10.3
     */
  }, {
    key: 'deleteFrom',
    value: function deleteFrom(position) {
      var direction = arguments.length <= 1 || arguments[1] === undefined ? _utilsKey.DIRECTION.BACKWARD : arguments[1];

      (0, _utilsDeprecate['default'])("`postEditor#deleteFrom is deprecated. Use `deleteAtPosition(position, direction=BACKWARD, {unit}={unit: 'char'})` instead");
      return this.deleteAtPosition(position, direction, { unit: 'char' });
    }

    /**
     * Delete 1 `unit` (can be 'char' or 'word') in the given `direction` at the given
     * `position`. In almost all cases this will be equivalent to deleting the range formed
     * by expanding the position 1 unit in the given direction. The exception is when deleting
     * backward from the beginning of a list item, which reverts the list item into a markup section
     * instead of joining it with its previous list item (if any).
     *
     * Usage:
     *
     *     let position = section.tailPosition();
     *     // Section has text of "Howdy!"
     *     editor.run((postEditor) => {
     *       postEditor.deleteAtPosition(position);
     *     });
     *     // section has text of "Howdy"
     *
     * @param {Position} position The position to delete at
     * @param {Direction} [direction=DIRECTION.BACKWARD] direction The direction to delete in
     * @param {Object} [options]
     * @param {String} [options.unit="char"] The unit of deletion ("word" or "char")
     * @return {Position}
     */
  }, {
    key: 'deleteAtPosition',
    value: function deleteAtPosition(position) {
      var direction = arguments.length <= 1 || arguments[1] === undefined ? _utilsKey.DIRECTION.BACKWARD : arguments[1];

      var _ref = arguments.length <= 2 || arguments[2] === undefined ? { unit: 'char' } : arguments[2];

      var unit = _ref.unit;

      if (direction === _utilsKey.DIRECTION.BACKWARD) {
        return this._deleteAtPositionBackward(position, unit);
      } else {
        return this._deleteAtPositionForward(position, unit);
      }
    }
  }, {
    key: '_deleteAtPositionBackward',
    value: function _deleteAtPositionBackward(position, unit) {
      if (position.isHead() && position.section.isListItem) {
        this.toggleSection('p', position);
        return this._range.head;
      } else {
        var prevPosition = unit === 'word' ? position.moveWord(BACKWARD) : position.move(BACKWARD);
        var range = prevPosition.toRange(position);
        return this.deleteRange(range);
      }
    }
  }, {
    key: '_deleteAtPositionForward',
    value: function _deleteAtPositionForward(position, unit) {
      var nextPosition = unit === 'word' ? position.moveWord(FORWARD) : position.move(FORWARD);
      var range = position.toRange(nextPosition);
      return this.deleteRange(range);
    }

    /**
     * Split markers at two positions, once at the head, and if necessary once
     * at the tail.
     *
     * Usage:
     * ```
     *     let range = editor.range;
     *     editor.run((postEditor) => {
     *       postEditor.splitMarkers(range);
     *     });
     * ```
     * The return value will be marker object completely inside the offsets
     * provided. Markers outside of the split may also have been modified.
     *
     * @param {Range} markerRange
     * @return {Array} of markers that are inside the split
     * @private
     */
  }, {
    key: 'splitMarkers',
    value: function splitMarkers(range) {
      var post = this.editor.post;
      var head = range.head;
      var tail = range.tail;

      this.splitSectionMarkerAtOffset(head.section, head.offset);
      this.splitSectionMarkerAtOffset(tail.section, tail.offset);

      return post.markersContainedByRange(range);
    }
  }, {
    key: 'splitSectionMarkerAtOffset',
    value: function splitSectionMarkerAtOffset(section, offset) {
      var _this7 = this;

      var edit = section.splitMarkerAtOffset(offset);
      edit.removed.forEach(function (m) {
        return _this7.removeMarker(m);
      });
    }

    /**
     * Split the section at the position.
     *
     * Usage:
     * ```
     *     let position = editor.cursor.offsets.head;
     *     editor.run((postEditor) => {
     *       postEditor.splitSection(position);
     *     });
     *     // Will result in the creation of two new sections
     *     // replacing the old one at the cursor position
     * ```
     * The return value will be the two new sections. One or both of these
     * sections can be blank (contain only a blank marker), for example if the
     * headMarkerOffset is 0.
     *
     * @param {Position} position
     * @return {Array} new sections, one for the first half and one for the second (either one can be null)
     * @public
     */
  }, {
    key: 'splitSection',
    value: function splitSection(position) {
      var _this8 = this;

      var section = position.section;

      if (section.isCardSection) {
        return this._splitCardSection(section, position);
      } else if (section.isListItem) {
        var isLastAndBlank = section.isBlank && !section.next;
        if (isLastAndBlank) {
          // if is last, replace the item with a blank markup section
          var _parent = section.parent;
          var collection = this.editor.post.sections;
          var blank = this.builder.createMarkupSection();
          this.removeSection(section);
          this.insertSectionBefore(collection, blank, _parent.next);

          return [null, blank];
        } else {
          var _splitListItem2 = this._splitListItem(section, position);

          var _splitListItem22 = _slicedToArray(_splitListItem2, 2);

          var pre = _splitListItem22[0];
          var post = _splitListItem22[1];

          return [pre, post];
        }
      } else {
        var splitSections = section.splitAtPosition(position);
        splitSections.forEach(function (s) {
          return _this8._coalesceMarkers(s);
        });
        this._replaceSection(section, splitSections);

        return splitSections;
      }
    }

    /**
     * @param {Section} cardSection
     * @param {Position} position to split at
     * @return {Section[]} 2-item array of pre and post-split sections
     * @private
     */
  }, {
    key: '_splitCardSection',
    value: function _splitCardSection(cardSection, position) {
      var offset = position.offset;

      (0, _utilsAssert['default'])('Cards section must be split at offset 0 or 1', offset === 0 || offset === 1);

      var newSection = this.builder.createMarkupSection();
      var nextSection = undefined;
      var surroundingSections = undefined;

      if (offset === 0) {
        nextSection = cardSection;
        surroundingSections = [newSection, cardSection];
      } else {
        nextSection = cardSection.next;
        surroundingSections = [cardSection, newSection];
      }

      var collection = this.editor.post.sections;
      this.insertSectionBefore(collection, newSection, nextSection);

      return surroundingSections;
    }

    /**
     * @param {Section} section
     * @param {Section} newSection
     * @return null
     * @public
     */
  }, {
    key: 'replaceSection',
    value: function replaceSection(section, newSection) {
      if (!section) {
        // FIXME should a falsy section be a valid argument?
        this.insertSectionBefore(this.editor.post.sections, newSection, null);
      } else {
        this._replaceSection(section, [newSection]);
      }
    }
  }, {
    key: 'moveSectionBefore',
    value: function moveSectionBefore(collection, renderedSection, beforeSection) {
      var newSection = renderedSection.clone();
      this.removeSection(renderedSection);
      this.insertSectionBefore(collection, newSection, beforeSection);
      return newSection;
    }

    /**
     * @param {Section} section A section that is already in DOM
     * @public
     */
  }, {
    key: 'moveSectionUp',
    value: function moveSectionUp(renderedSection) {
      var isFirst = !renderedSection.prev;
      if (isFirst) {
        return renderedSection;
      }

      var collection = renderedSection.parent.sections;
      var beforeSection = renderedSection.prev;
      return this.moveSectionBefore(collection, renderedSection, beforeSection);
    }

    /**
     * @param {Section} section A section that is already in DOM
     * @public
     */
  }, {
    key: 'moveSectionDown',
    value: function moveSectionDown(renderedSection) {
      var isLast = !renderedSection.next;
      if (isLast) {
        return renderedSection;
      }

      var beforeSection = renderedSection.next.next;
      var collection = renderedSection.parent.sections;
      return this.moveSectionBefore(collection, renderedSection, beforeSection);
    }

    /**
     * Insert an array of markers at the given position. If the position is in
     * a non-markerable section (like a card section), this method throws an error.
     *
     * @param {Position} position
     * @param {Marker[]} markers
     * @return {Position} The position that represents the end of the inserted markers.
     * @public
     */
  }, {
    key: 'insertMarkers',
    value: function insertMarkers(position, markers) {
      var _this9 = this;

      var section = position.section;
      var offset = position.offset;

      (0, _utilsAssert['default'])('Cannot insert markers at non-markerable position', section.isMarkerable);

      this.editActionTaken = EDIT_ACTIONS.INSERT_TEXT;

      var edit = section.splitMarkerAtOffset(offset);
      edit.removed.forEach(function (marker) {
        return _this9._scheduleForRemoval(marker);
      });

      var prevMarker = section.markerBeforeOffset(offset);
      markers.forEach(function (marker) {
        section.markers.insertAfter(marker, prevMarker);
        offset += marker.length;
        prevMarker = marker;
      });

      this._coalesceMarkers(section);
      this._markDirty(section);

      var nextPosition = section.toPosition(offset);
      this.setRange(nextPosition);
      return nextPosition;
    }

    /**
     * Inserts text with the given markups, ignoring the existing markups at
     * the position, if any.
     *
     * @param {Position} position
     * @param {String} text
     * @param {Markup[]} markups
     * @return {Position} position at the end of the inserted text
     */
  }, {
    key: 'insertTextWithMarkup',
    value: function insertTextWithMarkup(position, text) {
      var markups = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];
      var section = position.section;

      if (!section.isMarkerable) {
        return;
      }
      var marker = this.builder.createMarker(text, markups);
      return this.insertMarkers(position, [marker]);
    }

    /**
     * Insert the text at the given position
     * Inherits the markups already at that position, if any.
     *
     * @param {Position} position
     * @param {String} text
     * @return {Position} position at the end of the inserted text.
     */
  }, {
    key: 'insertText',
    value: function insertText(position, text) {
      var section = position.section;

      if (!section.isMarkerable) {
        return;
      }
      var markups = position.marker && position.marker.markups;
      markups = markups || [];
      return this.insertTextWithMarkup(position, text, markups);
    }
  }, {
    key: '_replaceSection',
    value: function _replaceSection(section, newSections) {
      var _this10 = this;

      var nextSection = section.next;
      var collection = section.parent.sections;

      var nextNewSection = newSections[0];
      if (nextNewSection.isMarkupSection && section.isListItem) {
        // put the new section after the ListSection (section.parent)
        // instead of after the ListItem
        collection = section.parent.parent.sections;
        nextSection = section.parent.next;
      }

      newSections.forEach(function (s) {
        return _this10.insertSectionBefore(collection, s, nextSection);
      });
      this.removeSection(section);
    }

    /**
     * Given a markerRange (for example `editor.range`) mark all markers
     * inside it as a given markup. The markup must be provided as a post
     * abstract node.
     *
     * Usage:
     *
     *     let range = editor.range;
     *     let strongMarkup = editor.builder.createMarkup('strong');
     *     editor.run((postEditor) => {
     *       postEditor.addMarkupToRange(range, strongMarkup);
     *     });
     *     // Will result some markers possibly being split, and the markup
     *     // being applied to all markers between the split.
     *
     * @param {Range} range
     * @param {Markup} markup A markup post abstract node
     * @public
     */
  }, {
    key: 'addMarkupToRange',
    value: function addMarkupToRange(range, markup) {
      var _this11 = this;

      if (range.isCollapsed) {
        return;
      }

      var markers = this.splitMarkers(range);
      if (markers.length) {
        (function () {
          // We insert the new markup at a consistent index across the range.
          // If we just push on the end of the list, it can end up in different positions
          // of the markup stack. This results in unnecessary closing and re-opening of
          // the markup each time it changes position.
          // If we just push it at the beginning of the list, this causes unnecessary closing
          // and re-opening of surrounding tags.
          // So, we look for any tags open across the whole range, and push into the stack
          // at the end of those.
          // Prompted by https://github.com/bustle/mobiledoc-kit/issues/360

          var markupsOpenAcrossRange = (0, _utilsArrayUtils.reduce)(markers, function (soFar, marker) {
            return (0, _utilsArrayUtils.commonItems)(soFar, marker.markups);
          }, markers[0].markups);
          var indexToInsert = markupsOpenAcrossRange.length;

          markers.forEach(function (marker) {
            marker.addMarkupAtIndex(markup, indexToInsert);
            _this11._markDirty(marker);
          });
        })();
      }
    }

    /**
     * Given a markerRange (for example `editor.range`) remove the given
     * markup from all contained markers.
     *
     * Usage:
     * ```
     *     let { range } = editor;
     *     let markup = markerRange.headMarker.markups[0];
     *     editor.run(postEditor => {
     *       postEditor.removeMarkupFromRange(range, markup);
     *     });
     *     // Will result in some markers possibly being split, and the markup
     *     // being removed from all markers between the split.
     * ```
     * @param {Range} range Object with offsets
     * @param {Markup|Function} markupOrCallback A markup post abstract node or
     * a function that returns true when passed a markup that should be removed
     * @private
     */
  }, {
    key: 'removeMarkupFromRange',
    value: function removeMarkupFromRange(range, markupOrMarkupCallback) {
      var _this12 = this;

      if (range.isCollapsed) {
        return;
      }

      this.splitMarkers(range).forEach(function (marker) {
        marker.removeMarkup(markupOrMarkupCallback);
        _this12._markDirty(marker);
      });
    }

    /**
     * Toggle the given markup in the given range (or at the position given). If the range/position
     * has the markup, the markup will be removed. If nothing in the range/position
     * has the markup, the markup will be added to everything in the range/position.
     *
     * Usage:
     * ```
     * // Remove any 'strong' markup if it exists in the selection, otherwise
     * // make it all 'strong'
     * editor.run(postEditor => postEditor.toggleMarkup('strong'));
     *
     * // add/remove a link to 'bustle.com' to the selection
     * editor.run(postEditor => {
     *   const linkMarkup = postEditor.builder.createMarkup('a', {href: 'http://bustle.com'});
     *   postEditor.toggleMarkup(linkMarkup);
     * });
     * ```
     * @param {Markup|String} markupOrString Either a markup object created using
     * the builder (useful when adding a markup with attributes, like an 'a' markup),
     * or, if a string, the tag name of the markup (e.g. 'strong', 'em') to toggle.
     * @param {Range|Position} range in which to toggle. Defaults to current editor range.
     * @public
     */
  }, {
    key: 'toggleMarkup',
    value: function toggleMarkup(markupOrMarkupString) {
      var range = arguments.length <= 1 || arguments[1] === undefined ? this._range : arguments[1];

      range = (0, _utilsToRange['default'])(range);
      var markup = typeof markupOrMarkupString === 'string' ? this.builder.createMarkup(markupOrMarkupString) : markupOrMarkupString;

      var hasMarkup = this.editor.detectMarkupInRange(range, markup.tagName);
      // FIXME: This implies only a single markup in a range. This may not be
      // true for links (which are not the same object instance like multiple
      // strong tags would be).
      if (hasMarkup) {
        this.removeMarkupFromRange(range, hasMarkup);
      } else {
        this.addMarkupToRange(range, markup);
      }

      this.setRange(range);
    }

    /**
     * Toggles the tagName of the active section or sections in the given range/position.
     * If every section has the tag name, they will all be reset to default sections.
     * Otherwise, every section will be changed to the requested type
     *
     * @param {String} sectionTagName A valid markup section or
     *        list section tag name (e.g. 'blockquote', 'h2', 'ul')
     * @param {Range|Position} range The range over which to toggle.
     *        Defaults to the current editor range.
     * @public
     */
  }, {
    key: 'toggleSection',
    value: function toggleSection(sectionTagName) {
      var _this13 = this;

      var range = arguments.length <= 1 || arguments[1] === undefined ? this._range : arguments[1];

      range = (0, _utilsToRange['default'])(range);

      sectionTagName = (0, _utilsDomUtils.normalizeTagName)(sectionTagName);
      var post = this.editor.post;

      var everySectionHasTagName = true;
      post.walkMarkerableSections(range, function (section) {
        if (!_this13._isSameSectionType(section, sectionTagName)) {
          everySectionHasTagName = false;
        }
      });

      var tagName = everySectionHasTagName ? 'p' : sectionTagName;
      var sectionTransformations = [];
      post.walkMarkerableSections(range, function (section) {
        var changedSection = _this13.changeSectionTagName(section, tagName);
        sectionTransformations.push({
          from: section,
          to: changedSection
        });
      });

      var nextRange = this._determineNextRangeAfterToggleSection(range, sectionTransformations);
      this.setRange(nextRange);
    }
  }, {
    key: '_determineNextRangeAfterToggleSection',
    value: function _determineNextRangeAfterToggleSection(range, sectionTransformations) {
      if (sectionTransformations.length) {
        var changedHeadSection = (0, _utilsArrayUtils.detect)(sectionTransformations, function (_ref2) {
          var from = _ref2.from;

          return from === range.headSection;
        }).to;
        var changedTailSection = (0, _utilsArrayUtils.detect)(sectionTransformations, function (_ref3) {
          var from = _ref3.from;

          return from === range.tailSection;
        }).to;

        if (changedHeadSection.isListSection || changedTailSection.isListSection) {
          // We don't know to which ListItem's the original sections point at, so
          // we don't have enough information to reconstruct the range when
          // dealing with lists.
          return sectionTransformations[0].to.headPosition().toRange();
        } else {
          return _utilsCursorRange['default'].create(changedHeadSection, range.headSectionOffset, changedTailSection, range.tailSectionOffset, range.direction);
        }
      } else {
        return range;
      }
    }
  }, {
    key: 'setAttribute',
    value: function setAttribute(key, value) {
      var range = arguments.length <= 2 || arguments[2] === undefined ? this._range : arguments[2];

      this._mutateAttribute(key, range, function (section, attribute) {
        if (section.getAttribute(attribute) !== value) {
          section.setAttribute(attribute, value);
          return true;
        }
      });
    }
  }, {
    key: 'removeAttribute',
    value: function removeAttribute(key) {
      var range = arguments.length <= 1 || arguments[1] === undefined ? this._range : arguments[1];

      this._mutateAttribute(key, range, function (section, attribute) {
        if (section.hasAttribute(attribute)) {
          section.removeAttribute(attribute);
          return true;
        }
      });
    }
  }, {
    key: '_mutateAttribute',
    value: function _mutateAttribute(key, range, cb) {
      var _this14 = this;

      range = (0, _utilsToRange['default'])(range);
      var post = this.editor.post;

      var attribute = 'data-md-' + key;

      post.walkMarkerableSections(range, function (section) {
        if (section.isListItem) {
          section = section.parent;
        }

        if (cb(section, attribute) === true) {
          _this14._markDirty(section);
        }
      });

      this.setRange(range);
    }
  }, {
    key: '_isSameSectionType',
    value: function _isSameSectionType(section, sectionTagName) {
      return section.isListItem ? section.parent.tagName === sectionTagName : section.tagName === sectionTagName;
    }

    /**
     * @param {Markerable} section
     * @private
     */
  }, {
    key: 'changeSectionTagName',
    value: function changeSectionTagName(section, newTagName) {
      (0, _utilsAssert['default'])('Cannot pass non-markerable section to `changeSectionTagName`', section.isMarkerable);

      if (isListSectionTagName(newTagName)) {
        return this._changeSectionToListItem(section, newTagName);
      } else if (section.isListItem) {
        return this._changeSectionFromListItem(section, newTagName);
      } else {
        section.tagName = newTagName;
        this._markDirty(section);
        return section;
      }
    }

    /**
     * Splits the item at the position given.
     * If the position is at the start or end of the item, the pre- or post-item
     * will contain a single empty ("") marker.
     * @param {ListItem} item
     * @param {Position} position
     * @return {Array} the pre-item and post-item on either side of the split
     * @private
     */
  }, {
    key: '_splitListItem',
    value: function _splitListItem(item, position) {
      var section = position.section;
      var offset = position.offset;

      (0, _utilsAssert['default'])('Cannot split list item at position that does not include item', item === section);

      item.splitMarkerAtOffset(offset);
      var prevMarker = item.markerBeforeOffset(offset);
      var preItem = this.builder.createListItem(),
          postItem = this.builder.createListItem();

      var currentItem = preItem;
      item.markers.forEach(function (marker) {
        currentItem.markers.append(marker.clone());
        if (marker === prevMarker) {
          currentItem = postItem;
        }
      });
      this._replaceSection(item, [preItem, postItem]);
      return [preItem, postItem];
    }

    /**
     * Splits the list at the position given.
     * @return {Array} pre-split list and post-split list, either of which could
     * be blank (0-item list) if the position is at the start or end of the list.
     *
     * Note: Contiguous list sections will be joined in the before_complete queue
     * of the postEditor.
     *
     * @private
     */
  }, {
    key: '_splitListAtPosition',
    value: function _splitListAtPosition(list, position) {
      (0, _utilsAssert['default'])('Cannot split list at position not in list', position.section.parent === list);

      var positionIsMiddle = !position.isHead() && !position.isTail();
      if (positionIsMiddle) {
        var item = position.section;

        var _splitListItem3 = this._splitListItem(item, position);

        var _splitListItem32 = _slicedToArray(_splitListItem3, 1);

        var pre = _splitListItem32[0];

        position = pre.tailPosition();
      }

      var preList = this.builder.createListSection(list.tagName);
      var postList = this.builder.createListSection(list.tagName);

      var preItem = position.section;
      var currentList = preList;
      list.items.forEach(function (item) {
        // If this item matches the start item and the position is at its start,
        // it should be appended to the postList instead of the preList
        if (item === preItem && position.isEqual(item.headPosition())) {
          currentList = postList;
        }
        currentList.items.append(item.clone());
        // If we just appended the preItem, append the remaining items to the postList
        if (item === preItem) {
          currentList = postList;
        }
      });

      this._replaceSection(list, [preList, postList]);
      return [preList, postList];
    }

    /**
     * @return Array of [prev, mid, next] lists. `prev` and `next` can
     *         be blank, depending on the position of `item`. `mid` will always
     *         be a 1-item list containing `item`. `prev` and `next` will be
     *         removed in the before_complete queue if they are blank
     *         (and still attached).
     *
     * @private
     */
  }, {
    key: '_splitListAtItem',
    value: function _splitListAtItem(list, item) {
      var _this15 = this;

      var next = list;
      var prev = this.builder.createListSection(next.tagName, [], next.attributes);
      var mid = this.builder.createListSection(next.tagName);

      var addToPrev = true;
      // must turn the LinkedList into an array so that we can remove items
      // as we iterate through it
      var items = next.items.toArray();
      items.forEach(function (i) {
        var listToAppend = undefined;
        if (i === item) {
          addToPrev = false;
          listToAppend = mid;
        } else if (addToPrev) {
          listToAppend = prev;
        } else {
          return; // break after iterating prev and mid parts of the list
        }
        listToAppend.join(i);
        _this15.removeSection(i);
      });
      var found = !addToPrev;
      (0, _utilsAssert['default'])('Cannot split list at item that is not present in the list', found);

      var collection = this.editor.post.sections;
      this.insertSectionBefore(collection, mid, next);
      this.insertSectionBefore(collection, prev, mid);

      // Remove possibly blank prev/next lists
      this.addCallback(CALLBACK_QUEUES.BEFORE_COMPLETE, function () {
        [prev, next].forEach(function (_list) {
          var isAttached = !!_list.parent;
          if (_list.isBlank && isAttached) {
            _this15.removeSection(_list);
          }
        });
      });

      return [prev, mid, next];
    }
  }, {
    key: '_changeSectionFromListItem',
    value: function _changeSectionFromListItem(section, newTagName) {
      (0, _utilsAssert['default'])('Must pass list item to `_changeSectionFromListItem`', section.isListItem);

      var listSection = section.parent;
      var markupSection = this.builder.createMarkupSection(newTagName);
      markupSection.join(section);

      var _splitListAtItem2 = this._splitListAtItem(listSection, section);

      var _splitListAtItem22 = _slicedToArray(_splitListAtItem2, 2);

      var mid = _splitListAtItem22[1];

      this.replaceSection(mid, markupSection);
      return markupSection;
    }
  }, {
    key: '_changeSectionToListItem',
    value: function _changeSectionToListItem(section, newTagName) {
      var isAlreadyCorrectListItem = section.isListItem && section.parent.tagName === newTagName;

      if (isAlreadyCorrectListItem) {
        return section;
      }

      var listSection = this.builder.createListSection(newTagName);
      listSection.join(section);

      var sectionToReplace = undefined;
      if (section.isListItem) {
        var _splitListAtItem3 = this._splitListAtItem(section.parent, section);

        var _splitListAtItem32 = _slicedToArray(_splitListAtItem3, 2);

        var mid = _splitListAtItem32[1];

        sectionToReplace = mid;
      } else {
        sectionToReplace = section;
      }
      this.replaceSection(sectionToReplace, listSection);
      return listSection;
    }

    /**
     * Insert a given section before another one, updating the post abstract
     * and the rendered UI.
     *
     * Usage:
     * ```
     *     let markerRange = editor.range;
     *     let sectionWithCursor = markerRange.headMarker.section;
     *     let section = editor.builder.createCardSection('my-image');
     *     let collection = sectionWithCursor.parent.sections;
     *     editor.run((postEditor) => {
     *       postEditor.insertSectionBefore(collection, section, sectionWithCursor);
     *     });
     * ```
     * @param {LinkedList} collection The list of sections to insert into
     * @param {Object} section The new section
     * @param {Object} beforeSection Optional The section "before" is relative to,
     *        if falsy the new section will be appended to the collection
     * @public
     */
  }, {
    key: 'insertSectionBefore',
    value: function insertSectionBefore(collection, section, beforeSection) {
      collection.insertBefore(section, beforeSection);
      this._markDirty(section.parent);
    }

    /**
     * Insert the given section after the current active section, or, if no
     * section is active, at the end of the document.
     * @param {Section} section
     * @public
     */
  }, {
    key: 'insertSection',
    value: function insertSection(section) {
      var activeSection = this.editor.activeSection;
      var nextSection = activeSection && activeSection.next;

      var collection = this.editor.post.sections;
      this.insertSectionBefore(collection, section, nextSection);
    }

    /**
     * Insert the given section at the end of the document.
     * @param {Section} section
     * @public
     */
  }, {
    key: 'insertSectionAtEnd',
    value: function insertSectionAtEnd(section) {
      this.insertSectionBefore(this.editor.post.sections, section, null);
    }

    /**
     * Insert the `post` at the given position in the editor's post.
     * @param {Position} position
     * @param {Post} post
     * @private
     */
  }, {
    key: 'insertPost',
    value: function insertPost(position, newPost) {
      var post = this.editor.post;
      var inserter = new _postPostInserter['default'](this, post);
      var nextPosition = inserter.insert(position, newPost);
      return nextPosition;
    }

    /**
     * Remove a given section from the post abstract and the rendered UI.
     *
     * Usage:
     * ```
     *     let { range } = editor;
     *     let sectionWithCursor = range.head.section;
     *     editor.run((postEditor) => {
     *       postEditor.removeSection(sectionWithCursor);
     *     });
     * ```
     * @param {Object} section The section to remove
     * @public
     */
  }, {
    key: 'removeSection',
    value: function removeSection(section) {
      var parent = section.parent;
      this._scheduleForRemoval(section);
      parent.sections.remove(section);

      if (parent.isListSection) {
        this._scheduleListRemovalIfEmpty(parent);
      }
    }
  }, {
    key: 'removeAllSections',
    value: function removeAllSections() {
      var _this16 = this;

      this.editor.post.sections.toArray().forEach(function (section) {
        _this16.removeSection(section);
      });
    }
  }, {
    key: 'migrateSectionsFromPost',
    value: function migrateSectionsFromPost(post) {
      var _this17 = this;

      post.sections.toArray().forEach(function (section) {
        post.sections.remove(section);
        _this17.insertSectionBefore(_this17.editor.post.sections, section, null);
      });
    }
  }, {
    key: '_scheduleListRemovalIfEmpty',
    value: function _scheduleListRemovalIfEmpty(listSection) {
      var _this18 = this;

      this.addCallback(CALLBACK_QUEUES.BEFORE_COMPLETE, function () {
        // if the list is attached and blank after we do other rendering stuff,
        // remove it
        var isAttached = !!listSection.parent;
        if (isAttached && listSection.isBlank) {
          _this18.removeSection(listSection);
        }
      });
    }

    /**
     * A method for adding work the deferred queue
     *
     * @param {Function} callback to run during completion
     * @param {Boolean} [once=false] Whether to only schedule the callback once.
     * @public
     */
  }, {
    key: 'schedule',
    value: function schedule(callback) {
      var once = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      (0, _utilsAssert['default'])('Work can only be scheduled before a post edit has completed', !this._didComplete);
      if (once) {
        this.addCallbackOnce(CALLBACK_QUEUES.COMPLETE, callback);
      } else {
        this.addCallback(CALLBACK_QUEUES.COMPLETE, callback);
      }
    }

    /**
     * A method for adding work the deferred queue. The callback will only
     * be added to the queue once, even if `scheduleOnce` is called multiple times.
     * The function cannot be an anonymous function.
     *
     * @param {Function} callback to run during completion
     * @public
     */
  }, {
    key: 'scheduleOnce',
    value: function scheduleOnce(callback) {
      this.schedule(callback, true);
    }

    /**
     * Add a rerender job to the queue
     *
     * @public
     */
  }, {
    key: 'scheduleRerender',
    value: function scheduleRerender() {
      this.scheduleOnce(this._rerender);
    }

    /**
     * Schedule a notification that the post has been changed.
     * The notification will result in the editor firing its `postDidChange`
     * hook after the postEditor completes its work (at the end of {@link Editor#run}).
     *
     * @public
     */
  }, {
    key: 'scheduleDidUpdate',
    value: function scheduleDidUpdate() {
      this.scheduleOnce(this._postDidChange);
    }
  }, {
    key: 'scheduleAfterRender',
    value: function scheduleAfterRender(callback) {
      var once = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      if (once) {
        this.addCallbackOnce(CALLBACK_QUEUES.AFTER_COMPLETE, callback);
      } else {
        this.addCallback(CALLBACK_QUEUES.AFTER_COMPLETE, callback);
      }
    }

    /**
     * Flush any work on the queue. {@link Editor#run} calls this method; it
     * should not be called directly.
     *
     * @private
     */
  }, {
    key: 'complete',
    value: function complete() {
      (0, _utilsAssert['default'])('Post editing can only be completed once', !this._didComplete);

      this.runCallbacks(CALLBACK_QUEUES.BEFORE_COMPLETE);
      this._didComplete = true;
      this.runCallbacks(CALLBACK_QUEUES.COMPLETE);
      this.runCallbacks(CALLBACK_QUEUES.AFTER_COMPLETE);
    }
  }, {
    key: 'undoLastChange',
    value: function undoLastChange() {
      this.editor._editHistory.stepBackward(this);
    }
  }, {
    key: 'redoLastChange',
    value: function redoLastChange() {
      this.editor._editHistory.stepForward(this);
    }
  }, {
    key: 'cancelSnapshot',
    value: function cancelSnapshot() {
      this._shouldCancelSnapshot = true;
    }
  }]);

  return PostEditor;
})();

exports['default'] = PostEditor;