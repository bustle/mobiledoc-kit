"use strict";

function mergeWithOptions(original, updates, options) {
  options = options || {};
  for (var prop in updates) {
    if (options.hasOwnProperty(prop)) {
      original[prop] = options[prop];
    } else if (updates.hasOwnProperty(prop)) {
      original[prop] = updates[prop];
    }
  }
  return original;
}

/**
 * Merges properties of one object into another
 * @private
 */
function merge(original, updates) {
  return mergeWithOptions(original, updates);
}

exports.mergeWithOptions = mergeWithOptions;
exports.merge = merge;