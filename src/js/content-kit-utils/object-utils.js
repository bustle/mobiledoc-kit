/**
 * Merges defaults/options into an Object
 * Useful for constructors
 */
function mergeWithOptions(original, updates, options) {
  options = options || {};
  for(var prop in updates) {
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
 */
function merge(original, updates) {
  return mergeWithOptions(original, updates);
}

/**
 * Prototype inheritance helper
 */
function inherit(Subclass, Superclass) {
  if (typeof Object.create === 'function') {
    Subclass._super = Superclass;
    Subclass.prototype = Object.create(Superclass.prototype, {
      constructor: {
        value: Subclass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  } else {
    for (var key in Superclass) {
      if (Superclass.hasOwnProperty(key)) {
        Subclass[key] = Superclass[key];
      }
    }
    Subclass.prototype = new Superclass();
    Subclass.constructor = Subclass;
  }
}

export { mergeWithOptions, merge, inherit };
