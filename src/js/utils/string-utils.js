/*
 * @param {String} string
 * @return {String} a dasherized string. 'modelIndex' -> 'model-index', etc
 */
export function dasherize(string) {
  return string.replace(/[A-Z]/g, (match, offset) => {
    const lower = match.toLowerCase();

    return (offset === 0 ? lower : '-' + lower);
  });
}

export function startsWith(string, character) {
  return string.charAt(0) === character;
}

export function endsWith(string, character) {
  return string.charAt(string.length -1) === character;
}
