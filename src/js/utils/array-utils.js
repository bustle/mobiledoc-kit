function detect(array, callback) {
  for (let i=0; i<array.length; i++) {
    if (callback(array[i])) {
      return array[i];
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
  for (let i=0; i<enumerable.length; i++) {
    callback(enumerable[i]);
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

export {
  detect,
  forEach,
  any,
  difference
};
