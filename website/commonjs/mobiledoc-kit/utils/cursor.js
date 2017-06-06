'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utilsSelectionUtils = require('../utils/selection-utils');

var _utilsDomUtils = require('../utils/dom-utils');

var _cursorPosition = require('./cursor/position');

var _cursorRange = require('./cursor/range');

var _utilsKey = require('../utils/key');

exports.Position = _cursorPosition['default'];
exports.Range = _cursorRange['default'];

var Cursor = (function () {
  function Cursor(editor) {
    _classCallCheck(this, Cursor);

    this.editor = editor;
    this.renderTree = editor._renderTree;
    this.post = editor.post;
  }

  _createClass(Cursor, [{
    key: 'clearSelection',
    value: function clearSelection() {
      (0, _utilsSelectionUtils.clearSelection)();
    }

    /**
     * @return {Boolean} true when there is either a collapsed cursor in the
     * editor's element or a selection that is contained in the editor's element
     */
  }, {
    key: 'hasCursor',
    value: function hasCursor() {
      return this.editor.hasRendered && (this._hasCollapsedSelection() || this._hasSelection());
    }
  }, {
    key: 'hasSelection',
    value: function hasSelection() {
      return this.editor.hasRendered && this._hasSelection();
    }

    /**
     * @return {Boolean} Can the cursor be on this element?
     */
  }, {
    key: 'isAddressable',
    value: function isAddressable(element) {
      var renderTree = this.renderTree;

      var renderNode = renderTree.findRenderNodeFromElement(element);
      if (renderNode && renderNode.postNode.isCardSection) {
        var renderedElement = renderNode.element;

        // card sections have addressable text nodes containing &zwnj;
        // as their first and last child
        if (element !== renderedElement && element !== renderedElement.firstChild && element !== renderedElement.lastChild) {
          return false;
        }
      }

      return !!renderNode;
    }

    /*
     * @return {Range} Cursor#Range object
     */
  }, {
    key: '_findNodeForPosition',
    value: function _findNodeForPosition(position) {
      var section = position.section;

      var node = undefined,
          offset = undefined;
      if (section.isCardSection) {
        offset = 0;
        if (position.offset === 0) {
          node = section.renderNode.element.firstChild;
        } else {
          node = section.renderNode.element.lastChild;
        }
      } else if (section.isBlank) {
        node = section.renderNode.cursorElement;
        offset = 0;
      } else {
        var marker = position.marker;
        var offsetInMarker = position.offsetInMarker;

        if (marker.isAtom) {
          if (offsetInMarker > 0) {
            // FIXME -- if there is a next marker, focus on it?
            offset = 0;
            node = marker.renderNode.tailTextNode;
          } else {
            offset = 0;
            node = marker.renderNode.headTextNode;
          }
        } else {
          node = marker.renderNode.element;
          offset = offsetInMarker;
        }
      }

      return { node: node, offset: offset };
    }
  }, {
    key: 'selectRange',
    value: function selectRange(range) {
      if (range.isBlank) {
        this.clearSelection();
        return;
      }

      var head = range.head;
      var tail = range.tail;
      var direction = range.direction;

      var _findNodeForPosition2 = this._findNodeForPosition(head);

      var headNode = _findNodeForPosition2.node;
      var headOffset = _findNodeForPosition2.offset;

      var _findNodeForPosition3 = this._findNodeForPosition(tail);

      var tailNode = _findNodeForPosition3.node;
      var tailOffset = _findNodeForPosition3.offset;

      this._moveToNode(headNode, headOffset, tailNode, tailOffset, direction);

      // Firefox sometimes doesn't keep focus in the editor after adding a card
      this.editor._ensureFocus();
    }
  }, {
    key: 'selectedText',
    value: function selectedText() {
      // FIXME remove this
      return this.selection.toString();
    }

    /**
     * @param {textNode} node
     * @param {integer} offset
     * @param {textNode} endNode
     * @param {integer} endOffset
     * @param {integer} direction forward or backward, default forward
     * @private
     */
  }, {
    key: '_moveToNode',
    value: function _moveToNode(node, offset, endNode, endOffset) {
      var direction = arguments.length <= 4 || arguments[4] === undefined ? _utilsKey.DIRECTION.FORWARD : arguments[4];

      this.clearSelection();

      if (direction === _utilsKey.DIRECTION.BACKWARD) {
        var _ref = [endNode, endOffset, node, offset];
        node = _ref[0];
        offset = _ref[1];
        endNode = _ref[2];
        endOffset = _ref[3];
      }

      var range = document.createRange();
      range.setStart(node, offset);
      if (direction === _utilsKey.DIRECTION.BACKWARD && !!this.selection.extend) {
        this.selection.addRange(range);
        this.selection.extend(endNode, endOffset);
      } else {
        range.setEnd(endNode, endOffset);
        this.selection.addRange(range);
      }
    }
  }, {
    key: '_hasSelection',
    value: function _hasSelection() {
      var element = this.editor.element;
      var _selectionRange = this._selectionRange;

      if (!_selectionRange || _selectionRange.collapsed) {
        return false;
      }

      return (0, _utilsDomUtils.containsNode)(element, this.selection.anchorNode) && (0, _utilsDomUtils.containsNode)(element, this.selection.focusNode);
    }
  }, {
    key: '_hasCollapsedSelection',
    value: function _hasCollapsedSelection() {
      var _selectionRange = this._selectionRange;

      if (!_selectionRange) {
        return false;
      }

      var element = this.editor.element;
      return (0, _utilsDomUtils.containsNode)(element, this.selection.anchorNode);
    }
  }, {
    key: 'offsets',
    get: function get() {
      if (!this.hasCursor()) {
        return _cursorRange['default'].blankRange();
      }

      var selection = this.selection;
      var renderTree = this.renderTree;

      var parentNode = this.editor.element;
      selection = (0, _utilsSelectionUtils.constrainSelectionTo)(selection, parentNode);

      var _comparePosition = (0, _utilsSelectionUtils.comparePosition)(selection);

      var headNode = _comparePosition.headNode;
      var headOffset = _comparePosition.headOffset;
      var tailNode = _comparePosition.tailNode;
      var tailOffset = _comparePosition.tailOffset;
      var direction = _comparePosition.direction;

      var headPosition = _cursorPosition['default'].fromNode(renderTree, headNode, headOffset);
      var tailPosition = _cursorPosition['default'].fromNode(renderTree, tailNode, tailOffset);

      return new _cursorRange['default'](headPosition, tailPosition, direction);
    }
  }, {
    key: 'selection',
    get: function get() {
      return window.getSelection();
    }
  }, {
    key: '_selectionRange',
    get: function get() {
      var selection = this.selection;

      if (selection.rangeCount === 0) {
        return null;
      }
      return selection.getRangeAt(0);
    }
  }]);

  return Cursor;
})();

exports['default'] = Cursor;