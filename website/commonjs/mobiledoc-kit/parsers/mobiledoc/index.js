'use strict';

var _ = require('./0-2');

var _2 = require('./0-3');

var _3 = require('./0-3-1');

var _4 = require('./0-3-2');

var _renderersMobiledoc02 = require('../../renderers/mobiledoc/0-2');

var _renderersMobiledoc03 = require('../../renderers/mobiledoc/0-3');

var _renderersMobiledoc031 = require('../../renderers/mobiledoc/0-3-1');

var _renderersMobiledoc032 = require('../../renderers/mobiledoc/0-3-2');

var _utilsAssert = require('../../utils/assert');

function parseVersion(mobiledoc) {
  return mobiledoc.version;
}

exports['default'] = {
  parse: function parse(builder, mobiledoc) {
    var version = parseVersion(mobiledoc);
    switch (version) {
      case _renderersMobiledoc02.MOBILEDOC_VERSION:
        return new _['default'](builder).parse(mobiledoc);
      case _renderersMobiledoc03.MOBILEDOC_VERSION:
        return new _2['default'](builder).parse(mobiledoc);
      case _renderersMobiledoc031.MOBILEDOC_VERSION:
        return new _3['default'](builder).parse(mobiledoc);
      case _renderersMobiledoc032.MOBILEDOC_VERSION:
        return new _4['default'](builder).parse(mobiledoc);
      default:
        (0, _utilsAssert['default'])('Unknown version of mobiledoc parser requested: ' + version, false);
    }
  }
};