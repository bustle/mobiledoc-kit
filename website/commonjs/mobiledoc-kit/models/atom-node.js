'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utilsAssert = require('../utils/assert');

var AtomNode = (function () {
  function AtomNode(editor, atom, model, element, atomOptions) {
    _classCallCheck(this, AtomNode);

    this.editor = editor;
    this.atom = atom;
    this.model = model;
    this.atomOptions = atomOptions;
    this.element = element;

    this._teardownCallback = null;
    this._rendered = null;
  }

  _createClass(AtomNode, [{
    key: 'render',
    value: function render() {
      if (!this._rendered) {
        var options = this.atomOptions;
        var env = this.env;
        var _model = this.model;
        var value = _model.value;
        var payload = _model.payload;

        // cache initial render
        this._rendered = this.atom.render({ options: options, env: env, value: value, payload: payload });
      }

      this._validateAndAppendRenderResult(this._rendered);
    }
  }, {
    key: 'teardown',
    value: function teardown() {
      if (this._teardownCallback) {
        this._teardownCallback();
        this._teardownCallback = null;
      }
      if (this._rendered) {
        this.element.removeChild(this._rendered);
        this._rendered = null;
      }
    }
  }, {
    key: '_validateAndAppendRenderResult',
    value: function _validateAndAppendRenderResult(rendered) {
      if (!rendered) {
        return;
      }

      var name = this.atom.name;

      (0, _utilsAssert['default'])('Atom "' + name + '" must return a DOM node (returned value was: "' + rendered + '")', !!rendered.nodeType);
      this.element.appendChild(rendered);
    }
  }, {
    key: 'env',
    get: function get() {
      var _this = this;

      return {
        name: this.atom.name,
        onTeardown: function onTeardown(callback) {
          return _this._teardownCallback = callback;
        },
        save: function save(value) {
          var payload = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

          _this.model.value = value;
          _this.model.payload = payload;

          _this.editor._postDidChange();
          _this.teardown();
          _this.render();
        }
      };
    }
  }]);

  return AtomNode;
})();

exports['default'] = AtomNode;