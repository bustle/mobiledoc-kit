'use strict';

var _ = require('./0-2');

var _2 = require('./0-3');

var _3 = require('./0-3-1');

var _4 = require('./0-3-2');

var _utilsAssert = require('../../utils/assert');

var MOBILEDOC_VERSION = _4.MOBILEDOC_VERSION;

exports.MOBILEDOC_VERSION = MOBILEDOC_VERSION;
exports['default'] = {
  render: function render(post, version) {
    switch (version) {
      case _.MOBILEDOC_VERSION:
        return _['default'].render(post);
      case _2.MOBILEDOC_VERSION:
        return _2['default'].render(post);
      case _3.MOBILEDOC_VERSION:
        return _3['default'].render(post);
      case undefined:
      case null:
      case _4.MOBILEDOC_VERSION:
        return _4['default'].render(post);
      default:
        (0, _utilsAssert['default'])('Unknown version of mobiledoc renderer requested: ' + version, false);
    }
  }
};