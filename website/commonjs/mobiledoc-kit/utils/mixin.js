'use strict';

exports['default'] = mixin;
var CONSTRUCTOR_FN_NAME = 'constructor';

function mixin(target, source) {
  target = target.prototype;
  // Fallback to just `source` to allow mixing in a plain object (pojo)
  source = source.prototype || source;

  Object.getOwnPropertyNames(source).forEach(function (name) {
    if (name !== CONSTRUCTOR_FN_NAME) {
      var descriptor = Object.getOwnPropertyDescriptor(source, name);

      Object.defineProperty(target, name, descriptor);
    }
  });
}