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

/**
 * @return {Array} The things in enumerable that are not in otherEnumerable,
 * aka the relative complement of `otherEnumerable` in `enumerable`
 */
function difference(enumerable, otherEnumerable) {
  const diff = [];
  forEach(enumerable, (item) => {
    if (otherEnumerable.indexOf(item) === -1) {
      diff.push(item);
    }
  });

  return diff;
}

function filter(enumerable, conditionFn) {
  const filtered = [];
  forEach(enumerable, i => {
    if (conditionFn(i)) { filtered.push(i); }
  });
  return filtered;
}

export {
  detect,
  forEach,
  any,
  difference,
  filter
};
