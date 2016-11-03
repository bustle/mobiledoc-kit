"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Logger = (function () {
  function Logger(type, manager) {
    _classCallCheck(this, Logger);

    this.type = type;
    this.manager = manager;
  }

  _createClass(Logger, [{
    key: "isEnabled",
    value: function isEnabled() {
      return this.manager.isEnabled(this.type);
    }
  }, {
    key: "log",
    value: function log() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      args.unshift("[" + this.type + "]");
      if (this.isEnabled()) {
        var _window$console;

        (_window$console = window.console).log.apply(_window$console, args);
      }
    }
  }]);

  return Logger;
})();

var LogManager = (function () {
  function LogManager() {
    _classCallCheck(this, LogManager);

    this.enabledTypes = [];
    this.allEnabled = false;
  }

  _createClass(LogManager, [{
    key: "for",
    value: function _for(type) {
      return new Logger(type, this);
    }
  }, {
    key: "enableAll",
    value: function enableAll() {
      this.allEnabled = true;
    }
  }, {
    key: "enableTypes",
    value: function enableTypes(types) {
      this.enabledTypes = this.enabledTypes.concat(types);
    }
  }, {
    key: "disable",
    value: function disable() {
      this.enabledTypes = [];
      this.allEnabled = false;
    }
  }, {
    key: "isEnabled",
    value: function isEnabled(type) {
      return this.allEnabled || this.enabledTypes.indexOf(type) !== -1;
    }
  }]);

  return LogManager;
})();

exports["default"] = LogManager;