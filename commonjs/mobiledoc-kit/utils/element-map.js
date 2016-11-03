'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utilsAssert = require('../utils/assert');

// start at one to make the falsy semantics easier
var uuidGenerator = 1;

var ElementMap = (function () {
  function ElementMap() {
    _classCallCheck(this, ElementMap);

    this._map = {};
  }

  _createClass(ElementMap, [{
    key: 'set',
    value: function set(key, value) {
      var uuid = key._uuid;
      if (!uuid) {
        key._uuid = uuid = '' + uuidGenerator++;
      }
      this._map[uuid] = value;
    }
  }, {
    key: 'get',
    value: function get(key) {
      if (key._uuid) {
        return this._map[key._uuid];
      }
      return null;
    }
  }, {
    key: 'remove',
    value: function remove(key) {
      (0, _utilsAssert['default'])('tried to fetch a value for an element not seen before', !!key._uuid);
      delete this._map[key._uuid];
    }
  }]);

  return ElementMap;
})();

exports['default'] = ElementMap;