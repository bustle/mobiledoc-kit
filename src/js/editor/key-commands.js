import Key from '../utils/key';
import { MODIFIERS, specialCharacterToCode } from '../utils/key';
import { filter, reduce } from '../utils/array-utils';
import assert from '../utils/assert';
import Browser from '../utils/browser';
import { toggleLink } from './ui';

function selectAll(editor) {
  let { post } = editor;
  editor.selectRange(post.toRange());
}

function gotoStartOfLine(editor) {
  let {range} = editor;
  let {tail: {section}} = range;
  editor.run(postEditor => {
    postEditor.setRange(section.headPosition());
  });
}

function gotoEndOfLine(editor) {
  let {range} = editor;
  let {tail: {section}} = range;
  editor.run(postEditor => {
    postEditor.setRange(section.tailPosition());
  });
}

function deleteToEndOfSection(editor) {
  let { range } = editor;
  if (range.isCollapsed) {
    let { head, head: { section } } = range;
    range = head.toRange(section.tailPosition());
  }
  editor.run(postEditor => {
    let nextPosition = postEditor.deleteRange(range);
    postEditor.setRange(nextPosition);
  });
}

const MAC_KEY_COMMANDS = [{
  str: 'META+B',
  name: 'default-bold',
  run(editor) {
    editor.toggleMarkup('strong');
  }
}, {
  str: 'META+I',
  name: 'default-italic',
  run(editor) {
    editor.toggleMarkup('em');
  }
}, {
  str: 'META+U',
  name: 'default-underline',
  run(editor) {
    editor.toggleMarkup('u');
  }
}, {
  str: 'META+K',
  name: 'default-link',
  run(editor) {
    return toggleLink(editor);
  }
}, {
  str: 'META+A',
  name: 'default-select-all',
  run(editor) {
    selectAll(editor);
  }
}, {
  str: 'META+Z',
  name: 'default-undo',
  run(editor) {
    editor.run(postEditor => postEditor.undoLastChange());
  }
}, {
  str: 'META+SHIFT+Z',
  name: 'default-redo',
  run(editor) {
    editor.run(postEditor => postEditor.redoLastChange());
  }
}, {
  str: 'CTRL+K',
  name: 'default-delete-line',
  run(editor) {
    return deleteToEndOfSection(editor);
  }
}, {
  str: 'CTRL+A',
  name: 'default-goto-line-start',
  run(editor) {
    gotoStartOfLine(editor);
  }
}, {
  str: 'CTRL+E',
  name: 'default-goto-line-end',
  run(editor) {
    gotoEndOfLine(editor);
  }
}];

const WINDOWS_KEY_COMMANDS = [{
  str: 'CTRL+B',
  name: 'default-bold',
  run(editor) {
    editor.toggleMarkup('strong');
  }
}, {
  str: 'CTRL+I',
  name: 'default-italic',
  run(editor) {
    editor.toggleMarkup('em');
  }
}, {
  str: 'CTRL+U',
  name: 'default-underline',
  run(editor) {
    editor.toggleMarkup('u');
  }
}, {
  str: 'CTRL+K',
  name: 'default-link',
  run(editor) {
    return toggleLink(editor);
  }
}, {
  str: 'CTRL+A',
  name: 'default-select-all',
  run(editor) {
    selectAll(editor);
  }
}, {
  str: 'CTRL+Z',
  name: 'default-undo',
  run(editor) {
    editor.run(postEditor => postEditor.undoLastChange());
  }
}, {
  str: 'CTRL+SHIFT+Z',
  name: 'default-redo',
  run(editor) {
    editor.run(postEditor => postEditor.redoLastChange());
  }
}];

export const DEFAULT_KEY_COMMANDS = (Browser.isMac() && MAC_KEY_COMMANDS)
                                 || (Browser.isWin() && WINDOWS_KEY_COMMANDS)
                                 || [];

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
  const special = specialCharacterToCode(upperCharacter);
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
