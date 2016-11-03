'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utilsAssert = require('../utils/assert');

var CardNode = (function () {
  function CardNode(editor, card, section, element, options) {
    _classCallCheck(this, CardNode);

    this.editor = editor;
    this.card = card;
    this.section = section;
    this.element = element;
    this.options = options;

    this.mode = null;

    this._teardownCallback = null;
    this._rendered = null;
  }

  _createClass(CardNode, [{
    key: 'render',
    value: function render(mode) {
      if (this.mode === mode) {
        return;
      }

      this.teardown();

      this.mode = mode;

      var method = mode === 'display' ? 'render' : 'edit';
      method = this.card[method];

      (0, _utilsAssert['default'])('Card is missing "' + method + '" (tried to render mode: "' + mode + '")', !!method);
      var rendered = method({
        env: this.env,
        options: this.options,
        payload: this.section.payload
      });

      this._validateAndAppendRenderResult(rendered);
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
    key: 'didRender',
    value: function didRender() {
      if (this._didRenderCallback) {
        this._didRenderCallback();
      }
    }
  }, {
    key: 'display',
    value: function display() {
      this.render('display');
    }
  }, {
    key: 'edit',
    value: function edit() {
      this.render('edit');
    }
  }, {
    key: 'remove',
    value: function remove() {
      var _this = this;

      this.editor.run(function (postEditor) {
        return postEditor.removeSection(_this.section);
      });
    }
  }, {
    key: '_validateAndAppendRenderResult',
    value: function _validateAndAppendRenderResult(rendered) {
      if (!rendered) {
        return;
      }

      var name = this.card.name;

      (0, _utilsAssert['default'])('Card "' + name + '" must render dom (render value was: "' + rendered + '")', !!rendered.nodeType);
      this.element.appendChild(rendered);
      this._rendered = rendered;
      this.didRender();
    }
  }, {
    key: 'env',
    get: function get() {
      var _this2 = this;

      return {
        name: this.card.name,
        isInEditor: true,
        onTeardown: function onTeardown(callback) {
          return _this2._teardownCallback = callback;
        },
        didRender: function didRender(callback) {
          return _this2._didRenderCallback = callback;
        },
        edit: function edit() {
          return _this2.edit();
        },
        save: function save(payload) {
          var transition = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

          _this2.section.payload = payload;

          _this2.editor._postDidChange();
          if (transition) {
            _this2.display();
          }
        },
        cancel: function cancel() {
          return _this2.display();
        },
        remove: function remove() {
          return _this2.remove();
        },
        postModel: this.section
      };
    }
  }]);

  return CardNode;
})();

exports['default'] = CardNode;