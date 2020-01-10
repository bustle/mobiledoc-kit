'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

exports.attributable = attributable;

var _utilsObjectUtils = require('../utils/object-utils');

var _utilsArrayUtils = require('../utils/array-utils');

var VALID_ATTRIBUTES = ['data-md-text-align'];

exports.VALID_ATTRIBUTES = VALID_ATTRIBUTES;
/*
 * A "mixin" to add section attribute support
 * to markup and list sections.
 */

function attributable(ctx) {
  ctx.attributes = {};

  ctx.hasAttribute = function (key) {
    return key in ctx.attributes;
  };

  ctx.setAttribute = function (key, value) {
    if (!(0, _utilsArrayUtils.contains)(VALID_ATTRIBUTES, key)) {
      throw new Error('Invalid attribute "' + key + '" was passed. Constrain attributes to the spec-compliant whitelist.');
    }
    ctx.attributes[key] = value;
  };
  ctx.removeAttribute = function (key) {
    delete ctx.attributes[key];
  };
  ctx.getAttribute = function (key) {
    return ctx.attributes[key];
  };
  ctx.eachAttribute = function (cb) {
    (0, _utilsObjectUtils.entries)(ctx.attributes).forEach(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2);

      var k = _ref2[0];
      var v = _ref2[1];
      return cb(k, v);
    });
  };
}