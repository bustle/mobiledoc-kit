'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utilsDomUtils = require('../utils/dom-utils');

var _utilsArrayUtils = require('../utils/array-utils');

var _types = require('./types');

var _utilsAssert = require('../utils/assert');

var VALID_MARKUP_TAGNAMES = ['b', 'i', 'strong', 'em', 'a', 'u', 'sub', // subscript
'sup', // superscript
's' // strikethrough
].map(_utilsDomUtils.normalizeTagName);

exports.VALID_MARKUP_TAGNAMES = VALID_MARKUP_TAGNAMES;
var VALID_ATTRIBUTES = ['href', 'ref'];

exports.VALID_ATTRIBUTES = VALID_ATTRIBUTES;

var Markup = (function () {
  /*
   * @param {Object} attributes key-values
   */

  function Markup(tagName) {
    var attributes = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, Markup);

    this.tagName = (0, _utilsDomUtils.normalizeTagName)(tagName);

    (0, _utilsAssert['default'])('Must use attributes object param (not array) for Markup', !Array.isArray(attributes));

    this.attributes = (0, _utilsArrayUtils.filterObject)(attributes, VALID_ATTRIBUTES);
    this.type = _types.MARKUP_TYPE;

    (0, _utilsAssert['default'])('Cannot create markup of tagName ' + tagName, VALID_MARKUP_TAGNAMES.indexOf(this.tagName) !== -1);
  }

  _createClass(Markup, [{
    key: 'isForwardInclusive',
    value: function isForwardInclusive() {
      return this.tagName === (0, _utilsDomUtils.normalizeTagName)("a") ? false : true;
    }
  }, {
    key: 'isBackwardInclusive',
    value: function isBackwardInclusive() {
      return false;
    }
  }, {
    key: 'hasTag',
    value: function hasTag(tagName) {
      return this.tagName === (0, _utilsDomUtils.normalizeTagName)(tagName);
    }
  }, {
    key: 'getAttribute',
    value: function getAttribute(name) {
      return this.attributes[name];
    }
  }], [{
    key: 'isValidElement',
    value: function isValidElement(element) {
      var tagName = (0, _utilsDomUtils.normalizeTagName)(element.tagName);
      return VALID_MARKUP_TAGNAMES.indexOf(tagName) !== -1;
    }
  }]);

  return Markup;
})();

exports['default'] = Markup;