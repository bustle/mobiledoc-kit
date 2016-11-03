'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _modelsRenderNode = require('../models/render-node');

var _utilsElementMap = require('../utils/element-map');

var RenderTree = (function () {
  function RenderTree(rootPostNode) {
    _classCallCheck(this, RenderTree);

    this._rootNode = this.buildRenderNode(rootPostNode);
    this._elements = new _utilsElementMap['default']();
  }

  /*
   * @return {RenderNode} The root render node in this tree
   */

  _createClass(RenderTree, [{
    key: 'getElementRenderNode',

    /*
     * @param {DOMNode} element
     * @return {RenderNode} The renderNode for this element, if any
     */
    value: function getElementRenderNode(element) {
      return this._elements.get(element);
    }
  }, {
    key: 'setElementRenderNode',
    value: function setElementRenderNode(element, renderNode) {
      this._elements.set(element, renderNode);
    }
  }, {
    key: 'removeElementRenderNode',
    value: function removeElementRenderNode(element) {
      this._elements.remove(element);
    }

    /**
     * @param {DOMNode} element
     * Walk up from the dom element until we find a renderNode element
     */
  }, {
    key: 'findRenderNodeFromElement',
    value: function findRenderNodeFromElement(element) {
      var conditionFn = arguments.length <= 1 || arguments[1] === undefined ? function () {
        return true;
      } : arguments[1];

      var renderNode = undefined;
      while (element) {
        renderNode = this.getElementRenderNode(element);
        if (renderNode && conditionFn(renderNode)) {
          return renderNode;
        }

        // continue loop
        element = element.parentNode;

        // stop if we are at the root element
        if (element === this.rootElement) {
          if (conditionFn(this.rootNode)) {
            return this.rootNode;
          } else {
            return;
          }
        }
      }
    }
  }, {
    key: 'buildRenderNode',
    value: function buildRenderNode(postNode) {
      var renderNode = new _modelsRenderNode['default'](postNode, this);
      postNode.renderNode = renderNode;
      return renderNode;
    }
  }, {
    key: 'rootNode',
    get: function get() {
      return this._rootNode;
    }

    /**
     * @return {Boolean}
     */
  }, {
    key: 'isDirty',
    get: function get() {
      return this.rootNode && this.rootNode.isDirty;
    }

    /*
     * @return {DOMNode} The root DOM element in this tree
     */
  }, {
    key: 'rootElement',
    get: function get() {
      return this.rootNode.element;
    }
  }]);

  return RenderTree;
})();

exports['default'] = RenderTree;