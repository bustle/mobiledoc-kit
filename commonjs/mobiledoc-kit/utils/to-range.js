'use strict';

exports['default'] = toRange;

var _utilsCursorRange = require('../utils/cursor/range');

var _utilsCursorPosition = require('../utils/cursor/position');

var _utilsAssert = require('../utils/assert');

function toRange(rangeLike) {
  (0, _utilsAssert['default'])('Must pass non-blank object to "toRange"', !!rangeLike);

  if (rangeLike instanceof _utilsCursorRange['default']) {
    return rangeLike;
  } else if (rangeLike instanceof _utilsCursorPosition['default']) {
    return rangeLike.toRange();
  }

  (0, _utilsAssert['default'])('Incorrect structure for rangeLike: ' + rangeLike, false);
}