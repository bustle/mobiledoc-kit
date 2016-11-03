'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _utilsLinkedItem = require('../utils/linked-item');

var _utilsLinkedList = require('../utils/linked-list');

var _utilsDomUtils = require('../utils/dom-utils');

var _utilsAssert = require('../utils/assert');

var RenderNode = (function (_LinkedItem) {
  _inherits(RenderNode, _LinkedItem);

  function RenderNode(postNode, renderTree) {
    _classCallCheck(this, RenderNode);

    _get(Object.getPrototypeOf(RenderNode.prototype), 'constructor', this).call(this);
    this.parent = null;
    this.isDirty = true;
    this.isRemoved = false;
    this.postNode = postNode;
    this._childNodes = null;
    this._element = null;
    this._cursorElement = null; // blank render nodes need a cursor element
    this.renderTree = renderTree;

    // RenderNodes for Markers keep track of their markupElement
    this.markupElement = null;

    // RenderNodes for Atoms use these properties
    this.headTextNode = null;
    this.tailTextNode = null;
    this.atomNode = null;

    // RenderNodes for cards use this property
    this.cardNode = null;
  }

  _createClass(RenderNode, [{
    key: 'isAttached',
    value: function isAttached() {
      (0, _utilsAssert['default'])('Cannot check if a renderNode is attached without an element.', !!this.element);
      return (0, _utilsDomUtils.containsNode)(this.renderTree.rootElement, this.element);
    }
  }, {
    key: 'scheduleForRemoval',
    value: function scheduleForRemoval() {
      this.isRemoved = true;
      if (this.parent) {
        this.parent.markDirty();
      }
    }
  }, {
    key: 'markDirty',
    value: function markDirty() {
      this.isDirty = true;
      if (this.parent) {
        this.parent.markDirty();
      }
    }
  }, {
    key: 'markClean',
    value: function markClean() {
      this.isDirty = false;
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.element = null;
      this.parent = null;
      this.postNode = null;
      this.renderTree = null;
    }
  }, {
    key: 'reparsesMutationOfChildNode',
    value: function reparsesMutationOfChildNode(node) {
      if (this.postNode.isCardSection) {
        return !(0, _utilsDomUtils.containsNode)(this.cardNode.element, node);
      } else if (this.postNode.isAtom) {
        return !(0, _utilsDomUtils.containsNode)(this.atomNode.element, node);
      }
      return true;
    }
  }, {
    key: 'childNodes',
    get: function get() {
      var _this = this;

      if (!this._childNodes) {
        this._childNodes = new _utilsLinkedList['default']({
          adoptItem: function adoptItem(item) {
            return item.parent = _this;
          },
          freeItem: function freeItem(item) {
            return item.destroy();
          }
        });
      }
      return this._childNodes;
    }
  }, {
    key: 'isRendered',
    get: function get() {
      return !!this.element;
    }
  }, {
    key: 'element',
    set: function set(element) {
      var currentElement = this._element;
      this._element = element;

      if (currentElement) {
        this.renderTree.removeElementRenderNode(currentElement);
      }

      if (element) {
        this.renderTree.setElementRenderNode(element, this);
      }
    },
    get: function get() {
      return this._element;
    }
  }, {
    key: 'cursorElement',
    set: function set(cursorElement) {
      this._cursorElement = cursorElement;
    },
    get: function get() {
      return this._cursorElement || this.element;
    }
  }]);

  return RenderNode;
})(_utilsLinkedItem['default']);

exports['default'] = RenderNode;