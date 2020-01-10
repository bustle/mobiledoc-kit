'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utilsStringUtils = require('../utils/string-utils');

var _utilsAssert = require('../utils/assert');

var _utilsDeprecate = require('../utils/deprecate');

var _utilsCharacters = require('../utils/characters');

var TextInputHandler = (function () {
  function TextInputHandler(editor) {
    _classCallCheck(this, TextInputHandler);

    this.editor = editor;
    this._handlers = [];
  }

  _createClass(TextInputHandler, [{
    key: 'register',
    value: function register(handler) {
      (0, _utilsAssert['default'])('Input Handler is not valid', this._validateHandler(handler));
      this._handlers.push(handler);
    }
  }, {
    key: 'unregister',
    value: function unregister(name) {
      var handlers = this._handlers;
      for (var i = 0; i < handlers.length; i++) {
        if (handlers[i].name === name) {
          handlers.splice(i, 1);
        }
      }
    }
  }, {
    key: 'handle',
    value: function handle(string) {
      var editor = this.editor;

      editor.insertText(string);

      var matchedHandler = this._findHandler();
      if (matchedHandler) {
        var _matchedHandler = _slicedToArray(matchedHandler, 2);

        var handler = _matchedHandler[0];
        var matches = _matchedHandler[1];

        handler.run(editor, matches);
      }
    }
  }, {
    key: 'handleNewLine',
    value: function handleNewLine() {
      var editor = this.editor;

      var matchedHandler = this._findHandler(_utilsCharacters.ENTER);
      if (matchedHandler) {
        var _matchedHandler2 = _slicedToArray(matchedHandler, 2);

        var handler = _matchedHandler2[0];
        var matches = _matchedHandler2[1];

        handler.run(editor, matches);
      }
    }
  }, {
    key: '_findHandler',
    value: function _findHandler() {
      var string = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];
      var _editor$range = this.editor.range;
      var head = _editor$range.head;
      var section = _editor$range.head.section;

      var preText = section.textUntil(head) + string;

      for (var i = 0; i < this._handlers.length; i++) {
        var handler = this._handlers[i];
        var text = handler.text;
        var match = handler.match;

        if (text && (0, _utilsStringUtils.endsWith)(preText, text)) {
          return [handler, [text]];
        } else if (match && match.test(preText)) {
          return [handler, match.exec(preText)];
        }
      }
    }
  }, {
    key: '_validateHandler',
    value: function _validateHandler(handler) {
      (0, _utilsDeprecate['default'])('Registered input handlers require a "name" property so that they can be unregistered', !!handler.name);
      return !!handler.run && ( // has `run`
      !!handler.text || !!handler.match) && // and `text` or `match`
      !(!!handler.text && !!handler.match); // not both `text` and `match`
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this._handlers = [];
    }
  }]);

  return TextInputHandler;
})();

exports['default'] = TextInputHandler;