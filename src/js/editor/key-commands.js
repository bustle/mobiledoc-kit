import Key from '../utils/key';
import { MODIFIERS, SPECIAL_KEYS } from '../utils/key';
import { filter, reduce } from '../utils/array-utils';
import Position from '../utils/cursor/position';
import assert from '../utils/assert';

export const DEFAULT_KEY_COMMANDS = [{
  str: 'META+B',
  run(editor) {
    if (editor.cursor.hasSelection()) {
      editor.run(postEditor => postEditor.toggleMarkup('strong'));
    } else {
      document.execCommand('bold', false, null);
    }
  }
}, {
  str: 'CTRL+B',
  run(editor) {
    if (editor.cursor.hasSelection()) {
      editor.run(postEditor => postEditor.toggleMarkup('strong'));
    } else {
      document.execCommand('bold', false, null);
    }
  }
}, {
  str: 'META+I',
  run(editor) {
    if (editor.cursor.hasSelection()) {
      editor.run(postEditor => postEditor.toggleMarkup('em'));
    } else {
      document.execCommand('italic', false, null);
    }
  }
}, {
  str: 'CTRL+I',
  run(editor) {
    if (editor.cursor.hasSelection()) {
      editor.run(postEditor => postEditor.toggleMarkup('em'));
    } else {
      document.execCommand('italic', false, null);
    }
  }
}, {
  str: 'CTRL+K',
  run(editor) {
    let range = editor.cursor.offsets;
    if (!editor.cursor.hasSelection()) {
      range.tail = new Position(range.head.section, range.head.section.length);
    }
    let nextPosition = editor.run(postEditor => postEditor.deleteRange(range));
    editor.cursor.moveToPosition(nextPosition);
  }
}, {
  str: 'META+K',
  run(editor) {
    if (!editor.cursor.hasSelection()) {
      return;
    }

    let selectedText = editor.cursor.selectedText();
    let defaultUrl = '';
    if (selectedText.indexOf('http') !== -1) { defaultUrl = selectedText; }

    editor.showPrompt('Enter a URL', defaultUrl, url => {
      if (!url) { return; }

      editor.run(postEditor => {
        let markup = postEditor.builder.createMarkup('a', {href: url});
        postEditor.toggleMarkup(markup);
      });
    });
  }
}];

function modifierNamesToMask(modiferNames) {
  let defaultVal = 0;
  return reduce(modiferNames,
                (sum, name) => {
                  let modifier = MODIFIERS[name.toUpperCase()];
                  assert(`No modifier named "${name}" found`, !!modifier);
                  return sum + modifier;
                },
                defaultVal);
}

function characterToCode(character) {
  const upperCharacter = character.toUpperCase();
  const special = SPECIAL_KEYS[upperCharacter];
  if (special) {
    return special;
  } else {
    assert(`Only 1 character can be used in a key command str (got "${character}")`,
           character.length === 1);
    return upperCharacter.charCodeAt(0);
  }
}

export function buildKeyCommand(keyCommand) {
  let { str } = keyCommand;

  if (!str) {
    return keyCommand;
  }
  assert('[deprecation] Key commands no longer use the `modifier` property',
         !keyCommand.modifier);

  let [character, ...modifierNames] = str.split('+').reverse();

  keyCommand.modifierMask = modifierNamesToMask(modifierNames);
  keyCommand.code = characterToCode(character);

  return keyCommand;
}

export function validateKeyCommand(keyCommand) {
  return !!keyCommand.code && !!keyCommand.run;
}

export function findKeyCommands(keyCommands, keyEvent) {
  const key = Key.fromEvent(keyEvent);

  return filter(keyCommands, ({modifierMask, code}) => {
    return key.keyCode === code && key.modifierMask === modifierMask;
  });
}
