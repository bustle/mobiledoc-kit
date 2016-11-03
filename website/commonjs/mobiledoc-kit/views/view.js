'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utilsDomUtils = require('../utils/dom-utils');

var View = (function () {
  function View() {
    var _this = this;

    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, View);

    options.tagName = options.tagName || 'div';
    options.container = options.container || document.body;

    this.element = document.createElement(options.tagName);
    this.container = options.container;
    this.isShowing = false;

    var classNames = options.classNames || [];
    classNames.forEach(function (name) {
      return (0, _utilsDomUtils.addClassName)(_this.element, name);
    });
    this._eventListeners = [];
  }

  _createClass(View, [{
    key: 'addEventListener',
    value: function addEventListener(element, type, listener) {
      element.addEventListener(type, listener);
      this._eventListeners.push([element, type, listener]);
    }
  }, {
    key: 'removeAllEventListeners',
    value: function removeAllEventListeners() {
      this._eventListeners.forEach(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 3);

        var element = _ref2[0];
        var type = _ref2[1];
        var listener = _ref2[2];

        element.removeEventListener(type, listener);
      });
    }
  }, {
    key: 'show',
    value: function show() {
      if (!this.isShowing) {
        this.container.appendChild(this.element);
        this.isShowing = true;
        return true;
      }
    }
  }, {
    key: 'hide',
    value: function hide() {
      if (this.isShowing) {
        this.container.removeChild(this.element);
        this.isShowing = false;
        return true;
      }
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.removeAllEventListeners();
      this.hide();
      this.isDestroyed = true;
    }
  }]);

  return View;
})();

exports['default'] = View;