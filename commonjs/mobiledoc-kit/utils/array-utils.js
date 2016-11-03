"use strict";

function detect(enumerable, callback) {
  if (enumerable.detect) {
    return enumerable.detect(callback);
  } else {
    for (var i = 0; i < enumerable.length; i++) {
      if (callback(enumerable[i])) {
        return enumerable[i];
      }
    }
  }
}

function any(enumerable, callback) {
  if (enumerable.any) {
    return enumerable.any(callback);
  }

  for (var i = 0; i < enumerable.length; i++) {
    if (callback(enumerable[i])) {
      return true;
    }
  }

  return false;
}

function every(enumerable, callback) {
  if (enumerable.every) {
    return enumerable.every(callback);
  }

  for (var i = 0; i < enumerable.length; i++) {
    if (!callback(enumerable[i])) {
      return false;
    }
  }
  return true;
}

function toArray(arrayLike) {
  return Array.prototype.slice.call(arrayLike);
}

/**
 * Useful for array-like things that aren't
 * actually arrays, like NodeList
 * @private
 */
function forEach(enumerable, callback) {
  if (enumerable.forEach) {
    enumerable.forEach(callback);
  } else {
    for (var i = 0; i < enumerable.length; i++) {
      callback(enumerable[i], i);
    }
  }
}

function filter(enumerable, conditionFn) {
  var filtered = [];
  forEach(enumerable, function (i) {
    if (conditionFn(i)) {
      filtered.push(i);
    }
  });
  return filtered;
}

/**
 * @return {Integer} the number of items that are the same, starting from the 0th index, in a and b
 * @private
 */
function commonItemLength(listA, listB) {
  var offset = 0;
  while (offset < listA.length && offset < listB.length) {
    if (listA[offset] !== listB[offset]) {
      break;
    }
    offset++;
  }
  return offset;
}

/**
 * @return {Array} the items that are the same, starting from the 0th index, in a and b
 * @private
 */
function commonItems(listA, listB) {
  var offset = 0;
  while (offset < listA.length && offset < listB.length) {
    if (listA[offset] !== listB[offset]) {
      break;
    }
    offset++;
  }
  return listA.slice(0, offset);
}

// return new array without falsy items like ruby's `compact`
function compact(enumerable) {
  return filter(enumerable, function (i) {
    return !!i;
  });
}

function reduce(enumerable, callback, initialValue) {
  var previousValue = initialValue;
  forEach(enumerable, function (val, index) {
    previousValue = callback(previousValue, val, index);
  });
  return previousValue;
}

/**
 * @param {Array} array of key1,value1,key2,value2,...
 * @return {Object} {key1:value1, key2:value2, ...}
 * @private
 */
function kvArrayToObject(array) {
  var obj = {};
  for (var i = 0; i < array.length; i += 2) {
    var key = array[i];
    var value = array[i + 1];

    obj[key] = value;
  }
  return obj;
}

function objectToSortedKVArray(obj) {
  var keys = Object.keys(obj).sort();
  var result = [];
  keys.forEach(function (k) {
    result.push(k);
    result.push(obj[k]);
  });
  return result;
}

// check shallow equality of two non-nested arrays
function isArrayEqual(arr1, arr2) {
  var l1 = arr1.length,
      l2 = arr2.length;
  if (l1 !== l2) {
    return false;
  }

  for (var i = 0; i < l1; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }
  return true;
}

// return an object with only the valid keys
function filterObject(object) {
  var validKeys = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

  var result = {};
  forEach(filter(Object.keys(object), function (key) {
    return validKeys.indexOf(key) !== -1;
  }), function (key) {
    return result[key] = object[key];
  });
  return result;
}

function contains(array, item) {
  return array.indexOf(item) !== -1;
}

function values(object) {
  return Object.keys(object).map(function (key) {
    return object[key];
  });
}

exports.detect = detect;
exports.forEach = forEach;
exports.any = any;
exports.every = every;
exports.filter = filter;
exports.commonItemLength = commonItemLength;
exports.commonItems = commonItems;
exports.compact = compact;
exports.reduce = reduce;
exports.objectToSortedKVArray = objectToSortedKVArray;
exports.kvArrayToObject = kvArrayToObject;
exports.isArrayEqual = isArrayEqual;
exports.toArray = toArray;
exports.filterObject = filterObject;
exports.contains = contains;
exports.values = values;