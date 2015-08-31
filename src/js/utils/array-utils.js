function detect(enumerable, callback) {
  if (enumerable.detect) {
    return enumerable.detect(callback);
  } else {
    for (let i=0; i<enumerable.length; i++) {
      if (callback(enumerable[i])) {
        return enumerable[i];
      }
    }
  }
}

function any(array, callback) {
  for (let i=0; i<array.length; i++) {
    if (callback(array[i])) {
      return true;
    }
  }

  return false;
}

/**
 * Useful for array-like things that aren't
 * actually arrays, like NodeList
 */
function forEach(enumerable, callback) {
  if (enumerable.forEach) {
    enumerable.forEach(callback);
  } else {
    for (let i=0; i<enumerable.length; i++) {
      callback(enumerable[i], i);
    }
  }
}

function filter(enumerable, conditionFn) {
  const filtered = [];
  forEach(enumerable, i => {
    if (conditionFn(i)) { filtered.push(i); }
  });
  return filtered;
}

/**
 * @return {Integer} the number of items that are the same, starting from the 0th index, in a and b
 */
function commonItemLength(listA, listB) {
  let offset = 0;
  while (offset < listA.length && offset < listB.length) {
    if (listA[offset] !== listB[offset]) {
      break;
    }
    offset++;
  }
  return offset;
}

// return new array without falsy items like ruby's `compact`
function compact(enumerable) {
  return filter(enumerable, i => !!i);
}

function reduce(enumerable, callback, initialValue) {
  let previousValue = initialValue;
  forEach(enumerable, (val, index) => {
    previousValue = callback(previousValue, val, index);
  });
  return previousValue;
}

export {
  detect,
  forEach,
  any,
  filter,
  commonItemLength,
  compact,
  reduce
};
