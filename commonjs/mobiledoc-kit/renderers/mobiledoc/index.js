'use strict';

var _ = require('./0-2');

var _2 = require('./0-3');

var _utilsAssert = require('../../utils/assert');

var MOBILEDOC_VERSION = _2.MOBILEDOC_VERSION;

exports.MOBILEDOC_VERSION = MOBILEDOC_VERSION;
exports['default'] = {
  render: function render(post, version) {
    switch (version) {
      case _.MOBILEDOC_VERSION:
        return _['default'].render(post);
      case undefined:
      case null:
      case _2.MOBILEDOC_VERSION:
        return _2['default'].render(post);
      default:
        (0, _utilsAssert['default'])('Unknown version of mobiledoc renderer requested: ' + version, false);
    }
  }
};