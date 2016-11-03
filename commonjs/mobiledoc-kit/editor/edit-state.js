'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utilsArrayUtils = require('../utils/array-utils');

var _utilsCursorRange = require('../utils/cursor/range');

/**
 * Used by {@link Editor} to manage its current state (cursor, active markups
 * and active sections).
 * @private
 */

var EditState = (function () {
  function EditState(editor) {
    _classCallCheck(this, EditState);

    this.editor = editor;

    var defaultState = {
      range: _utilsCursorRange['default'].blankRange(),
      activeMarkups: [],
      activeSections: [],
      activeSectionTagNames: []
    };

    this.prevState = this.state = defaultState;
  }

  _createClass(EditState, [{
    key: 'updateRange',
    value: function updateRange(newRange) {
      this.prevState = this.state;
      this.state = this._readState(newRange);
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.editor = null;
      this.prevState = this.state = null;
    }

    /**
     * @return {Boolean}
     */
  }, {
    key: 'rangeDidChange',
    value: function rangeDidChange() {
      var range = this.state.range;
      var prevRange = this.prevState.range;

      return !prevRange.isEqual(range);
    }

    /**
     * @return {Boolean} Whether the input mode (active markups or active section tag names)
     * has changed.
     */
  }, {
    key: 'inputModeDidChange',
    value: function inputModeDidChange() {
      var state = this.state;
      var prevState = this.prevState;

      return !(0, _utilsArrayUtils.isArrayEqual)(state.activeMarkups, prevState.activeMarkups) || !(0, _utilsArrayUtils.isArrayEqual)(state.activeSectionTagNames, prevState.activeSectionTagNames);
    }

    /**
     * @return {Range}
     */
  }, {
    key: 'toggleMarkupState',

    /**
     * Update the editor's markup state. This is used when, e.g.,
     * a user types meta+B when the editor has a cursor but no selected text;
     * in this case the editor needs to track that it has an active "b" markup
     * and apply it to the next text the user types.
     */
    value: function toggleMarkupState(markup) {
      if ((0, _utilsArrayUtils.contains)(this.activeMarkups, markup)) {
        this._removeActiveMarkup(markup);
      } else {
        this._addActiveMarkup(markup);
      }
    }
  }, {
    key: '_readState',
    value: function _readState(range) {
      var state = {
        range: range,
        activeMarkups: this._readActiveMarkups(range),
        activeSections: this._readActiveSections(range)
      };
      // Section objects are 'live', so to check that they changed, we
      // need to map their tagNames now (and compare to mapped tagNames later).
      // In addition, to catch changes from ul -> ol, we keep track of the
      // un-nested tag names (otherwise we'd only see li -> li change)
      state.activeSectionTagNames = state.activeSections.map(function (s) {
        return s.isNested ? s.parent.tagName : s.tagName;
      });
      return state;
    }
  }, {
    key: '_readActiveSections',
    value: function _readActiveSections(range) {
      var head = range.head;
      var tail = range.tail;
      var post = this.editor.post;

      if (range.isBlank) {
        return [];
      } else {
        return post.sections.readRange(head.section, tail.section);
      }
    }
  }, {
    key: '_readActiveMarkups',
    value: function _readActiveMarkups(range) {
      var post = this.editor.post;

      return post.markupsInRange(range);
    }
  }, {
    key: '_removeActiveMarkup',
    value: function _removeActiveMarkup(markup) {
      var index = this.state.activeMarkups.indexOf(markup);
      this.state.activeMarkups.splice(index, 1);
    }
  }, {
    key: '_addActiveMarkup',
    value: function _addActiveMarkup(markup) {
      this.state.activeMarkups.push(markup);
    }
  }, {
    key: 'range',
    get: function get() {
      return this.state.range;
    }

    /**
     * @return {Section[]}
     */
  }, {
    key: 'activeSections',
    get: function get() {
      return this.state.activeSections;
    }

    /**
     * @return {Markup[]}
     */
  }, {
    key: 'activeMarkups',
    get: function get() {
      return this.state.activeMarkups;
    }
  }]);

  return EditState;
})();

exports['default'] = EditState;