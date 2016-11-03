'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _editorSelectionChangeObserver = require('../editor/selection-change-observer');

var SelectionManager = (function () {
  function SelectionManager(editor, callback) {
    _classCallCheck(this, SelectionManager);

    this.editor = editor;
    this.callback = callback;
    this.started = false;
  }

  _createClass(SelectionManager, [{
    key: 'start',
    value: function start() {
      if (this.started) {
        return;
      }

      _editorSelectionChangeObserver['default'].addListener(this);
      this.started = true;
    }
  }, {
    key: 'stop',
    value: function stop() {
      this.started = false;
      _editorSelectionChangeObserver['default'].removeListener(this);
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.stop();
    }
  }, {
    key: 'selectionDidChange',
    value: function selectionDidChange() {
      if (this.started) {
        this.callback.apply(this, arguments);
      }
    }
  }]);

  return SelectionManager;
})();

exports['default'] = SelectionManager;