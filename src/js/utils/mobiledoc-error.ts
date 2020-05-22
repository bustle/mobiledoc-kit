const errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack']

function MobiledocError(this: Error, message?: string) {
  let tmp = Error.call(this, message)

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor)
  }
  // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
  for (let idx = 0; idx < errorProps.length; idx++) {
    ;(this as any)[errorProps[idx]] = (tmp as any)[errorProps[idx]]
  }
}

MobiledocError.prototype = Object.create(Error.prototype)

export default MobiledocError
