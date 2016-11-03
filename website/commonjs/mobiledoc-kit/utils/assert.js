'use strict';

var _mobiledocError = require('./mobiledoc-error');

exports['default'] = function (message, conditional) {
  if (!conditional) {
    throw new _mobiledocError['default'](message);
  }
};