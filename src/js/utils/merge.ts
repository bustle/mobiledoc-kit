function mergeWithOptions<A, B, O>(original: A, updates: B, options?: O) {
  return Object.assign(original, updates, options)
}

/**
 * Merges properties of one object into another
 * @private
 */
function merge<A, B>(original: A, updates: B) {
  return mergeWithOptions(original, updates)
}

export { mergeWithOptions, merge }
