'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utilsDomUtils = require('../utils/dom-utils');

var _utilsAssert = require('../utils/assert');

var _dom = require('./dom');

var HTMLParser = (function () {
  function HTMLParser(builder) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, HTMLParser);

    (0, _utilsAssert['default'])('Must pass builder to HTMLParser', builder);
    this.builder = builder;
    this.options = options;
  }

  /**
   * @param {String} html to parse
   * @return {Post} A post abstract
   */

  _createClass(HTMLParser, [{
    key: 'parse',
    value: function parse(html) {
      var dom = (0, _utilsDomUtils.parseHTML)(html);
      var parser = new _dom['default'](this.builder, this.options);
      return parser.parse(dom);
    }
  }]);

  return HTMLParser;
})();

exports['default'] = HTMLParser;