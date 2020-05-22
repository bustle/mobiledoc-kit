/*
 * @param {String} string
 * @return {String} a dasherized string. 'modelIndex' -> 'model-index', etc
 */
export function dasherize(string: string) {
  return string.replace(/[A-Z]/g, (match, offset) => {
    const lower = match.toLowerCase()

    return offset === 0 ? lower : '-' + lower
  })
}

export function capitalize(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

export function startsWith(string: string, character: string) {
  return string.charAt(0) === character
}

export function endsWith(string: string, endString: string) {
  let index = string.lastIndexOf(endString)
  return index !== -1 && index === string.length - endString.length
}
