var errorProps = [
  'description',
  'fileName',
  'lineNumber',
  'message',
  'name',
  'number',
  'stack'
];

function MobiledocError() {
  let tmp = Error.apply(this, arguments);

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  }
  // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
  for (let idx = 0; idx < errorProps.length; idx++) {
    this[errorProps[idx]] = tmp[errorProps[idx]];
  }
}

MobiledocError.prototype = Object.create(Error.prototype);

export default MobiledocError;
