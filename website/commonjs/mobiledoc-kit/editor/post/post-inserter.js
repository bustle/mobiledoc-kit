'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utilsAssert = require('../../utils/assert');

var _modelsTypes = require('../../models/types');

var MARKERABLE = 'markerable',
    NESTED_MARKERABLE = 'nested_markerable',
    NON_MARKERABLE = 'non_markerable';

var Visitor = (function () {
  function Visitor(inserter, cursorPosition) {
    _classCallCheck(this, Visitor);

    var postEditor = inserter.postEditor;
    var post = inserter.post;

    this.postEditor = postEditor;
    this._post = post;
    this.cursorPosition = cursorPosition;
    this.builder = this.postEditor.builder;

    this._hasInsertedFirstLeafSection = false;
  }

  _createClass(Visitor, [{
    key: 'visit',
    value: function visit(node) {
      var method = node.type;
      (0, _utilsAssert['default'])('Cannot visit node of type ' + node.type, !!this[method]);
      this[method](node);
    }
  }, {
    key: '_canMergeSection',
    value: function _canMergeSection(section) {
      if (this._hasInsertedFirstLeafSection) {
        return false;
      } else {
        return this._isMarkerable && section.isMarkerable;
      }
    }
  }, {
    key: _modelsTypes.POST_TYPE,
    value: function value(node) {
      var _this = this;

      if (this.cursorSection.isBlank && !this._isNested) {
        // replace blank section with entire post
        var newSections = node.sections.map(function (s) {
          return s.clone();
        });
        this._replaceSection(this.cursorSection, newSections);
      } else {
        node.sections.forEach(function (section) {
          return _this.visit(section);
        });
      }
    }
  }, {
    key: _modelsTypes.MARKUP_SECTION_TYPE,
    value: function value(node) {
      this[MARKERABLE](node);
    }
  }, {
    key: _modelsTypes.LIST_SECTION_TYPE,
    value: function value(node) {
      var _this2 = this;

      var hasNext = !!node.next;
      node.items.forEach(function (item) {
        return _this2.visit(item);
      });

      if (this._isNested && hasNext) {
        this._breakNestedAtCursor();
      }
    }
  }, {
    key: _modelsTypes.LIST_ITEM_TYPE,
    value: function value(node) {
      this[NESTED_MARKERABLE](node);
    }
  }, {
    key: _modelsTypes.CARD_TYPE,
    value: function value(node) {
      this[NON_MARKERABLE](node);
    }
  }, {
    key: _modelsTypes.IMAGE_SECTION_TYPE,
    value: function value(node) {
      this[NON_MARKERABLE](node);
    }
  }, {
    key: NON_MARKERABLE,
    value: function value(section) {
      if (this._isNested) {
        this._breakNestedAtCursor();
      } else if (!this.cursorSection.isBlank) {
        this._breakAtCursor();
      }

      this._insertLeafSection(section);
    }
  }, {
    key: MARKERABLE,
    value: function value(section) {
      if (this._canMergeSection(section)) {
        this._mergeSection(section);
      } else if (this._isNested && this._isMarkerable) {
        // If we are attaching a markerable section to a list item,
        // insert a linebreak then merge the section onto the resulting blank list item
        this._breakAtCursor();

        // Advance the cursor to the head of the blank list item
        var nextPosition = this.cursorSection.next.headPosition();
        this.cursorPosition = nextPosition;

        // Merge this section onto the list item
        this._mergeSection(section);
      } else {
        this._breakAtCursor();
        this._insertLeafSection(section);
      }
    }
  }, {
    key: NESTED_MARKERABLE,
    value: function value(section) {
      if (this._canMergeSection(section)) {
        this._mergeSection(section);
        return;
      }

      section = this._isNested ? section : this._wrapNestedSection(section);
      this._breakAtCursor();
      this._insertLeafSection(section);
    }

    // break out of a nested cursor position
  }, {
    key: '_breakNestedAtCursor',
    value: function _breakNestedAtCursor() {
      (0, _utilsAssert['default'])('Cannot call _breakNestedAtCursor if not nested', this._isNested);

      var parent = this.cursorSection.parent;
      var cursorAtEndOfList = this.cursorPosition.isEqual(parent.tailPosition());

      if (cursorAtEndOfList) {
        var blank = this.builder.createMarkupSection();
        this._insertSectionAfter(blank, parent);
      } else {
        var _breakListAtCursor2 = this._breakListAtCursor();

        var _breakListAtCursor22 = _slicedToArray(_breakListAtCursor2, 2);

        var blank = _breakListAtCursor22[1];

        this.cursorPosition = blank.tailPosition();
      }
    }
  }, {
    key: '_breakListAtCursor',
    value: function _breakListAtCursor() {
      (0, _utilsAssert['default'])('Cannot _splitParentSection if cursor position is not nested', this._isNested);

      var list = this.cursorSection.parent,
          position = this.cursorPosition,
          blank = this.builder.createMarkupSection();

      var _postEditor$_splitListAtPosition = this.postEditor._splitListAtPosition(list, position);

      var _postEditor$_splitListAtPosition2 = _slicedToArray(_postEditor$_splitListAtPosition, 2);

      var pre = _postEditor$_splitListAtPosition2[0];
      var post = _postEditor$_splitListAtPosition2[1];

      var collection = this._post.sections,
          reference = post;
      this.postEditor.insertSectionBefore(collection, blank, reference);
      return [pre, blank, post];
    }
  }, {
    key: '_wrapNestedSection',
    value: function _wrapNestedSection(section) {
      var tagName = section.parent.tagName;
      var parent = this.builder.createListSection(tagName);
      parent.items.append(section.clone());
      return parent;
    }
  }, {
    key: '_mergeSection',
    value: function _mergeSection(section) {
      (0, _utilsAssert['default'])('Can only merge markerable sections', this._isMarkerable && section.isMarkerable);
      this._hasInsertedFirstLeafSection = true;

      var markers = section.markers.map(function (m) {
        return m.clone();
      });
      var position = this.postEditor.insertMarkers(this.cursorPosition, markers);

      this.cursorPosition = position;
    }

    // Can be called to add a line break when in a nested section or a parent
    // section.
  }, {
    key: '_breakAtCursor',
    value: function _breakAtCursor() {
      if (this.cursorSection.isBlank) {
        return;
      } else if (this._isMarkerable) {
        this._breakMarkerableAtCursor();
      } else {
        this._breakNonMarkerableAtCursor();
      }
    }

    // Inserts a blank section before/after the cursor,
    // depending on cursor position.
  }, {
    key: '_breakNonMarkerableAtCursor',
    value: function _breakNonMarkerableAtCursor() {
      var collection = this._post.sections,
          blank = this.builder.createMarkupSection(),
          reference = this.cursorPosition.isHead() ? this.cursorSection : this.cursorSection.next;
      this.postEditor.insertSectionBefore(collection, blank, reference);
      this.cursorPosition = blank.tailPosition();
    }
  }, {
    key: '_breakMarkerableAtCursor',
    value: function _breakMarkerableAtCursor() {
      var _postEditor$splitSection = this.postEditor.splitSection(this.cursorPosition);

      var _postEditor$splitSection2 = _slicedToArray(_postEditor$splitSection, 1);

      var pre = _postEditor$splitSection2[0];

      this.cursorPosition = pre.tailPosition();
    }
  }, {
    key: '_replaceSection',
    value: function _replaceSection(section, newSections) {
      var _this3 = this;

      (0, _utilsAssert['default'])('Cannot replace section that does not have parent.sections', section.parent && section.parent.sections);
      (0, _utilsAssert['default'])('Must pass enumerable to _replaceSection', !!newSections.forEach);

      var collection = section.parent.sections;
      var reference = section.next;
      this.postEditor.removeSection(section);
      newSections.forEach(function (section) {
        _this3.postEditor.insertSectionBefore(collection, section, reference);
      });
      var lastSection = newSections[newSections.length - 1];

      this.cursorPosition = lastSection.tailPosition();
    }
  }, {
    key: '_insertSectionBefore',
    value: function _insertSectionBefore(section, reference) {
      var collection = this.cursorSection.parent.sections;
      this.postEditor.insertSectionBefore(collection, section, reference);

      this.cursorPosition = section.tailPosition();
    }

    // Insert a section after the parent section.
    // E.g., add a markup section after a list section
  }, {
    key: '_insertSectionAfter',
    value: function _insertSectionAfter(section, parent) {
      (0, _utilsAssert['default'])('Cannot _insertSectionAfter nested section', !parent.isNested);
      var reference = parent.next;
      var collection = this._post.sections;
      this.postEditor.insertSectionBefore(collection, section, reference);
      this.cursorPosition = section.tailPosition();
    }
  }, {
    key: '_insertLeafSection',
    value: function _insertLeafSection(section) {
      (0, _utilsAssert['default'])('Can only _insertLeafSection when cursor is at end of section', this.cursorPosition.isTail());

      this._hasInsertedFirstLeafSection = true;
      section = section.clone();

      if (this.cursorSection.isBlank) {
        (0, _utilsAssert['default'])('Cannot insert leaf non-markerable section when cursor is nested', !(section.isMarkerable && this._isNested));
        this._replaceSection(this.cursorSection, [section]);
      } else if (this.cursorSection.next && this.cursorSection.next.isBlank) {
        this._replaceSection(this.cursorSection.next, [section]);
      } else {
        var reference = this.cursorSection.next;
        this._insertSectionBefore(section, reference);
      }
    }
  }, {
    key: 'cursorPosition',
    get: function get() {
      return this._cursorPosition;
    },
    set: function set(position) {
      this._cursorPosition = position;
      this.postEditor.setRange(position);
    }
  }, {
    key: '_isMarkerable',
    get: function get() {
      return this.cursorSection.isMarkerable;
    }
  }, {
    key: 'cursorSection',
    get: function get() {
      return this.cursorPosition.section;
    }
  }, {
    key: 'cursorOffset',
    get: function get() {
      return this.cursorPosition.offset;
    }
  }, {
    key: '_isNested',
    get: function get() {
      return this.cursorSection.isNested;
    }
  }]);

  return Visitor;
})();

var Inserter = (function () {
  function Inserter(postEditor, post) {
    _classCallCheck(this, Inserter);

    this.postEditor = postEditor;
    this.post = post;
  }

  _createClass(Inserter, [{
    key: 'insert',
    value: function insert(cursorPosition, newPost) {
      var visitor = new Visitor(this, cursorPosition);
      if (!newPost.isBlank) {
        visitor.visit(newPost);
      }
      return visitor.cursorPosition;
    }
  }]);

  return Inserter;
})();

exports['default'] = Inserter;