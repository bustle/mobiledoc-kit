"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FixedQueue = (function () {
  function FixedQueue() {
    var length = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

    _classCallCheck(this, FixedQueue);

    this._maxLength = length;
    this._items = [];
  }

  _createClass(FixedQueue, [{
    key: "pop",
    value: function pop() {
      return this._items.pop();
    }
  }, {
    key: "push",
    value: function push(item) {
      this._items.push(item);
      if (this.length > this._maxLength) {
        this._items.shift();
      }
    }
  }, {
    key: "clear",
    value: function clear() {
      this._items = [];
    }
  }, {
    key: "toArray",
    value: function toArray() {
      return this._items;
    }
  }, {
    key: "length",
    get: function get() {
      return this._items.length;
    }
  }]);

  return FixedQueue;
})();

exports["default"] = FixedQueue;