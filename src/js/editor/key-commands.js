import Key from '../utils/key';
import { MODIFIERS, SPECIAL_KEYS } from '../utils/key';
import { filter } from '../utils/array-utils';
import LinkCommand from '../commands/link';

export const DEFAULT_KEY_COMMANDS = [{
  modifier: MODIFIERS.META,
  str: 'B',
  run(editor) {
    editor.run(postEditor => postEditor.toggleMarkup('strong'));
  }
}, {
  modifier: MODIFIERS.CTRL,
  str: 'B',
  run(editor) {
    editor.run(postEditor => postEditor.toggleMarkup('strong'));
  }
}, {
  modifier: MODIFIERS.META,
  str: 'I',
  run(editor) {
    editor.run(postEditor => postEditor.toggleMarkup('em'));
  }
}, {
  modifier: MODIFIERS.CTRL,
  str: 'I',
  run(editor) {
    editor.run(postEditor => postEditor.toggleMarkup('em'));
  }
}, {
  modifier: MODIFIERS.META,
  str: 'K',
  run(editor) {
    if (!editor.cursor.hasSelection()) { return; }

    let selectedText = editor.cursor.selectedText();
    let defaultUrl = '';
    if (selectedText.indexOf('http') !== -1) { defaultUrl = selectedText; }

    editor.showPrompt('Enter a URL', defaultUrl, url => {
      if (!url) { return; }

      const linkCommand = new LinkCommand(editor);
      linkCommand.exec(url);
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
