'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utilsDomUtils = require('../utils/dom-utils');

var _utilsArrayUtils = require('../utils/array-utils');

var Markerupable = (function () {
  function Markerupable() {
    _classCallCheck(this, Markerupable);
  }

  _createClass(Markerupable, [{
    key: 'clearMarkups',
    value: function clearMarkups() {
      this.markups = [];
    }
  }, {
    key: 'addMarkup',
    value: function addMarkup(markup) {
      this.markups.push(markup);
    }
  }, {
    key: 'addMarkupAtIndex',
    value: function addMarkupAtIndex(markup, index) {
      this.markups.splice(index, 0, markup);
    }
  }, {
    key: 'removeMarkup',
    value: function removeMarkup(markupOrMarkupCallback) {
      var _this = this;

      var callback = undefined;
      if (typeof markupOrMarkupCallback === 'function') {
        callback = markupOrMarkupCallback;
      } else {
        (function () {
          var markup = markupOrMarkupCallback;
          callback = function (_markup) {
            return _markup === markup;
          };
        })();
      }

      (0, _utilsArrayUtils.forEach)((0, _utilsArrayUtils.filter)(this.markups, callback), function (m) {
        return _this._removeMarkup(m);
      });
    }
  }, {
    key: '_removeMarkup',
    value: function _removeMarkup(markup) {
      var index = this.markups.indexOf(markup);
      if (index !== -1) {
        this.markups.splice(index, 1);
      }
    }
  }, {
    key: 'hasMarkup',
    value: function hasMarkup(tagNameOrMarkup) {
      return !!this.getMarkup(tagNameOrMarkup);
    }
  }, {
    key: 'getMarkup',
    value: function getMarkup(tagNameOrMarkup) {
      var _this2 = this;

      if (typeof tagNameOrMarkup === 'string') {
        var _ret2 = (function () {
          var tagName = (0, _utilsDomUtils.normalizeTagName)(tagNameOrMarkup);
          return {
            v: (0, _utilsArrayUtils.detect)(_this2.markups, function (markup) {
              return markup.tagName === tagName;
            })
          };
        })();

        if (typeof _ret2 === 'object') return _ret2.v;
      } else {
        var _ret3 = (function () {
          var targetMarkup = tagNameOrMarkup;
          return {
            v: (0, _utilsArrayUtils.detect)(_this2.markups, function (markup) {
              return markup === targetMarkup;
            })
          };
        })();

        if (typeof _ret3 === 'object') return _ret3.v;
      }
    }
  }, {
    key: 'openedMarkups',
    get: function get() {
      var count = 0;
      if (this.prev) {
        count = (0, _utilsArrayUtils.commonItemLength)(this.markups, this.prev.markups);
      }

      return this.markups.slice(count);
    }
  }, {
    key: 'closedMarkups',
    get: function get() {
      var count = 0;
      if (this.next) {
        count = (0, _utilsArrayUtils.commonItemLength)(this.markups, this.next.markups);
      }

      return this.markups.slice(count);
    }
  }]);

  return Markerupable;
})();

exports['default'] = Markerupable;