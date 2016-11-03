"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Set = (function () {
  function Set() {
    var _this = this;

    var items = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

    _classCallCheck(this, Set);

    this.items = [];
    items.forEach(function (i) {
      return _this.add(i);
    });
  }

  _createClass(Set, [{
    key: "add",
    value: function add(item) {
      if (!this.has(item)) {
        this.items.push(item);
      }
    }
  }, {
    key: "has",
    value: function has(item) {
      return this.items.indexOf(item) !== -1;
    }
  }, {
    key: "toArray",
    value: function toArray() {
      return this.items;
    }
  }, {
    key: "length",
    get: function get() {
      return this.items.length;
    }
  }]);

  return Set;
})();

exports["default"] = Set;