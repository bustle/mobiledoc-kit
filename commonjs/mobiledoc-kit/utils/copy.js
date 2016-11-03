"use strict";

function shallowCopyObject(object) {
  var copy = {};
  Object.keys(object).forEach(function (key) {
    copy[key] = object[key];
  });
  return copy;
}

exports.shallowCopyObject = shallowCopyObject;