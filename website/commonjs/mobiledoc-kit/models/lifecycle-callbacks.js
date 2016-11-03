'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utilsAssert = require('../utils/assert');

var LifecycleCallbacks = (function () {
  function LifecycleCallbacks() {
    var _this = this;

    var queueNames = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

    _classCallCheck(this, LifecycleCallbacks);

    this.callbackQueues = {};
    this.removalQueues = {};

    queueNames.forEach(function (name) {
      _this.callbackQueues[name] = [];
      _this.removalQueues[name] = [];
    });
  }

  _createClass(LifecycleCallbacks, [{
    key: 'runCallbacks',
    value: function runCallbacks(queueName) {
      var args = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

      var queue = this._getQueue(queueName);
      queue.forEach(function (cb) {
        return cb.apply(undefined, _toConsumableArray(args));
      });

      var toRemove = this.removalQueues[queueName];
      toRemove.forEach(function (cb) {
        var index = queue.indexOf(cb);
        if (index !== -1) {
          queue.splice(index, 1);
        }
      });

      this.removalQueues[queueName] = [];
    }
  }, {
    key: 'addCallback',
    value: function addCallback(queueName, callback) {
      this._getQueue(queueName).push(callback);
    }
  }, {
    key: '_scheduleCallbackForRemoval',
    value: function _scheduleCallbackForRemoval(queueName, callback) {
      this.removalQueues[queueName].push(callback);
    }
  }, {
    key: 'addCallbackOnce',
    value: function addCallbackOnce(queueName, callback) {
      var queue = this._getQueue(queueName);
      if (queue.indexOf(callback) === -1) {
        queue.push(callback);
        this._scheduleCallbackForRemoval(queueName, callback);
      }
    }
  }, {
    key: '_getQueue',
    value: function _getQueue(queueName) {
      var queue = this.callbackQueues[queueName];
      (0, _utilsAssert['default'])('No queue found for "' + queueName + '"', !!queue);
      return queue;
    }
  }]);

  return LifecycleCallbacks;
})();

exports['default'] = LifecycleCallbacks;