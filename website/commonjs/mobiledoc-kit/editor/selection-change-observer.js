"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var instance = undefined;

var SelectionChangeObserver = (function () {
  function SelectionChangeObserver() {
    _classCallCheck(this, SelectionChangeObserver);

    this.started = false;
    this.listeners = [];
    this.selection = {};
  }

  _createClass(SelectionChangeObserver, [{
    key: "addListener",
    value: function addListener(listener) {
      if (this.listeners.indexOf(listener) === -1) {
        this.listeners.push(listener);
        this.start();
      }
    }
  }, {
    key: "removeListener",
    value: function removeListener(listener) {
      var index = this.listeners.indexOf(listener);
      if (index !== -1) {
        this.listeners.splice(index, 1);
        if (this.listeners.length === 0) {
          this.stop();
        }
      }
    }
  }, {
    key: "start",
    value: function start() {
      if (this.started) {
        return;
      }
      this.started = true;

      this.poll();
    }
  }, {
    key: "stop",
    value: function stop() {
      this.started = false;
      this.selection = {};
    }
  }, {
    key: "notifyListeners",
    value: function notifyListeners() /* newSelection, prevSelection */{
      var _arguments = arguments;

      this.listeners.forEach(function (listener) {
        listener.selectionDidChange.apply(listener, _arguments);
      });
    }
  }, {
    key: "destroy",
    value: function destroy() {
      this.stop();
      this.listeners = [];
    }
  }, {
    key: "getSelection",
    value: function getSelection() {
      var selection = window.getSelection();
      var anchorNode = selection.anchorNode;
      var focusNode = selection.focusNode;
      var anchorOffset = selection.anchorOffset;
      var focusOffset = selection.focusOffset;

      return { anchorNode: anchorNode, focusNode: focusNode, anchorOffset: anchorOffset, focusOffset: focusOffset };
    }
  }, {
    key: "poll",
    value: function poll() {
      var _this = this;

      if (this.started) {
        this.update();
        this.runNext(function () {
          return _this.poll();
        });
      }
    }
  }, {
    key: "runNext",
    value: function runNext(fn) {
      window.requestAnimationFrame(fn);
    }
  }, {
    key: "update",
    value: function update() {
      var prevSelection = this.selection;
      var curSelection = this.getSelection();
      if (!this.selectionIsEqual(prevSelection, curSelection)) {
        this.selection = curSelection;
        this.notifyListeners(curSelection, prevSelection);
      }
    }
  }, {
    key: "selectionIsEqual",
    value: function selectionIsEqual(s1, s2) {
      return s1.anchorNode === s2.anchorNode && s1.anchorOffset === s2.anchorOffset && s1.focusNode === s2.focusNode && s1.focusOffset === s2.focusOffset;
    }
  }], [{
    key: "getInstance",
    value: function getInstance() {
      if (!instance) {
        instance = new SelectionChangeObserver();
      }
      return instance;
    }
  }, {
    key: "addListener",
    value: function addListener(listener) {
      SelectionChangeObserver.getInstance().addListener(listener);
    }
  }, {
    key: "removeListener",
    value: function removeListener(listener) {
      SelectionChangeObserver.getInstance().removeListener(listener);
    }
  }]);

  return SelectionChangeObserver;
})();

exports["default"] = SelectionChangeObserver;