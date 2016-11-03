'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utilsSet = require('../utils/set');

var _utilsArrayUtils = require('../utils/array-utils');

var _utilsAssert = require('../utils/assert');

var _utilsDomUtils = require('../utils/dom-utils');

var MUTATION = {
  NODES_CHANGED: 'childList',
  CHARACTER_DATA: 'characterData'
};

var MutationHandler = (function () {
  function MutationHandler(editor) {
    var _this = this;

    _classCallCheck(this, MutationHandler);

    this.editor = editor;
    this.logger = editor.loggerFor('mutation-handler');
    this.renderTree = null;
    this._isObserving = false;

    this._observer = new MutationObserver(function (mutations) {
      _this._handleMutations(mutations);
    });
  }

  _createClass(MutationHandler, [{
    key: 'init',
    value: function init() {
      this.startObserving();
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.stopObserving();
      this._observer = null;
    }
  }, {
    key: 'suspendObservation',
    value: function suspendObservation(callback) {
      this.stopObserving();
      callback();
      this.startObserving();
    }
  }, {
    key: 'stopObserving',
    value: function stopObserving() {
      if (this._isObserving) {
        this._isObserving = false;
        this._observer.disconnect();
      }
    }
  }, {
    key: 'startObserving',
    value: function startObserving() {
      if (!this._isObserving) {
        var editor = this.editor;

        (0, _utilsAssert['default'])('Cannot observe un-rendered editor', editor.hasRendered);

        this._isObserving = true;
        this.renderTree = editor._renderTree;

        this._observer.observe(editor.element, {
          characterData: true,
          childList: true,
          subtree: true
        });
      }
    }
  }, {
    key: 'reparsePost',
    value: function reparsePost() {
      this.editor._reparsePost();
    }
  }, {
    key: 'reparseSections',
    value: function reparseSections(sections) {
      this.editor._reparseSections(sections);
    }

    /**
     * for each mutation:
     *   * find the target nodes:
     *     * if nodes changed, target nodes are:
     *        * added nodes
     *        * the target from which removed nodes were removed
     *     * if character data changed
     *       * target node is the mutation event's target (text node)
     *     * filter out nodes that are no longer attached (parentNode is null)
     *   * for each remaining node:
     *   *  find its section, add to sections-to-reparse
     *   *  if no section, reparse all (and break)
     */
  }, {
    key: '_handleMutations',
    value: function _handleMutations(mutations) {
      var reparsePost = false;
      var sections = new _utilsSet['default']();

      for (var i = 0; i < mutations.length; i++) {
        if (reparsePost) {
          break;
        }

        var nodes = this._findTargetNodes(mutations[i]);

        for (var j = 0; j < nodes.length; j++) {
          var node = nodes[j];
          var renderNode = this._findRenderNodeFromNode(node);
          if (renderNode) {
            if (renderNode.reparsesMutationOfChildNode(node)) {
              var section = this._findSectionFromRenderNode(renderNode);
              if (section) {
                sections.add(section);
              } else {
                reparsePost = true;
              }
            }
          } else {
            reparsePost = true;
            break;
          }
        }
      }

      if (reparsePost) {
        this.logger.log('reparsePost (' + mutations.length + ' mutations)');
        this.reparsePost();
      } else if (sections.length) {
        this.logger.log('reparse ' + sections.length + ' sections (' + mutations.length + ' mutations)');
        this.reparseSections(sections.toArray());
      }
    }
  }, {
    key: '_findTargetNodes',
    value: function _findTargetNodes(mutation) {
      var nodes = [];

      switch (mutation.type) {
        case MUTATION.CHARACTER_DATA:
          nodes.push(mutation.target);
          break;
        case MUTATION.NODES_CHANGED:
          (0, _utilsArrayUtils.forEach)(mutation.addedNodes, function (n) {
            return nodes.push(n);
          });
          if (mutation.removedNodes.length) {
            nodes.push(mutation.target);
          }
          break;
      }

      var element = this.editor.element;
      var attachedNodes = (0, _utilsArrayUtils.filter)(nodes, function (node) {
        return (0, _utilsDomUtils.containsNode)(element, node);
      });
      return attachedNodes;
    }
  }, {
    key: '_findSectionRenderNodeFromNode',
    value: function _findSectionRenderNodeFromNode(node) {
      return this.renderTree.findRenderNodeFromElement(node, function (rn) {
        return rn.postNode.isSection;
      });
    }
  }, {
    key: '_findRenderNodeFromNode',
    value: function _findRenderNodeFromNode(node) {
      return this.renderTree.findRenderNodeFromElement(node);
    }
  }, {
    key: '_findSectionFromRenderNode',
    value: function _findSectionFromRenderNode(renderNode) {
      var sectionRenderNode = this._findSectionRenderNodeFromNode(renderNode.element);
      return sectionRenderNode && sectionRenderNode.postNode;
    }
  }]);

  return MutationHandler;
})();

exports['default'] = MutationHandler;