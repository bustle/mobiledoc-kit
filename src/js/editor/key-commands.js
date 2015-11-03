import Key from '../utils/key';
import { MODIFIERS, SPECIAL_KEYS } from '../utils/key';
import { filter } from '../utils/array-utils';
import Position from '../utils/cursor/position';

export const DEFAULT_KEY_COMMANDS = [{
  modifier: MODIFIERS.META,
  str: 'B',
  run(editor) {
    if (editor.cursor.hasSelection()) {
      editor.run(postEditor => postEditor.toggleMarkup('strong'));
    } else {
      document.execCommand('bold', false, null);
    }
  }
}, {
  modifier: MODIFIERS.CTRL,
  str: 'B',
  run(editor) {
    if (editor.cursor.hasSelection()) {
      editor.run(postEditor => postEditor.toggleMarkup('strong'));
    } else {
      document.execCommand('bold', false, null);
    }
  }
}, {
  modifier: MODIFIERS.META,
  str: 'I',
  run(editor) {
    if (editor.cursor.hasSelection()) {
      editor.run(postEditor => postEditor.toggleMarkup('em'));
    } else {
      document.execCommand('italic', false, null);
    }
  }
}, {
  modifier: MODIFIERS.CTRL,
  str: 'I',
  run(editor) {
    if (editor.cursor.hasSelection()) {
      editor.run(postEditor => postEditor.toggleMarkup('em'));
    } else {
      document.execCommand('italic', false, null);
    }
  }
}, {
  modifier: MODIFIERS.CTRL,
  str: 'K',
  run(editor) {
    let range = editor.cursor.offsets;
    if (!editor.cursor.hasSelection()) {
      range.tail = new Position(range.head.section, range.head.section.length);
    }
    let nextPosition = editor.run(postEditor => postEditor.deleteRange(range));
    editor.cursor.moveToPosition(nextPosition);
  }
}, {
  modifier: MODIFIERS.META,
  str: 'K',
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

function stringToModifier(string) {
  return MODIFIERS[string.toUpperCase()];
}

function characterToCode(character) {
  const upperCharacter = character.toUpperCase();
  const special = SPECIAL_KEYS[upperCharacter];
  if (special) {
    return special;
  } else {
    return upperCharacter.charCodeAt(0);
  }
}

export function buildKeyCommand(keyCommand) {
  if (!keyCommand.str) {
    return keyCommand;
  }

  const str = keyCommand.str;
  if (str.indexOf('+') !== -1) {
    const [modifierName, character] = str.split('+');
    keyCommand.modifier = stringToModifier(modifierName);
    keyCommand.code = characterToCode(character);
  } else {
    keyCommand.code = characterToCode(str);
  }

  return keyCommand;
}

export function validateKeyCommand(keyCommand) {
  return !!keyCommand.code && !!keyCommand.run;
}

export function findKeyCommands(keyCommands, keyEvent) {
  const key = Key.fromEvent(keyEvent);

  return filter(keyCommands, ({modifier, code}) => {
    if (key.keyCode !== code) {
      return false;
    }

    return (modifier && key.hasModifier(modifier)) || (!modifier && !key.hasAnyModifier());
  });
}
