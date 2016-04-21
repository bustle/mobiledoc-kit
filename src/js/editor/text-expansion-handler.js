// from lodash
const reRegExpChar = /[\\^$.*+?()[\]{}|]/g,
      reHasRegExpChar = new RegExp(reRegExpChar.source);

// from lodash
function escapeForRegex(string) {
  return (string && reHasRegExpChar.test(string)) ? string.replace(reRegExpChar, '\\$&') : string;
}

export function convertExpansiontoHandler(expansion) {
  let { run: originalRun, text, trigger } = expansion;
  if (!!trigger) {
    text = text + String.fromCharCode(trigger);
  }
  let match = new RegExp('^' + escapeForRegex(text) + '$');
  let run = (editor, ...args) => {
    let { range: { head } } = editor;
    if (head.isTail()) {
      originalRun(editor, ...args);
    }
  };

  return { match, run };
}
