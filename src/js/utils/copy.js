function shallowCopyObject(object) {
  let copy = {};
  Object.keys(object).forEach(key => {
    copy[key] = object[key];
  });
  return copy;
}

export {
  shallowCopyObject
};
