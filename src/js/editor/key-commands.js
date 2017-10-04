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

export const DEFAULT_KEY_COMMANDS = [{
  str: 'META+B',
  run(editor) {
    editor.toggleMarkup('strong');
  }
}, {
  str: 'CTRL+B',
  run(editor) {
    editor.toggleMarkup('strong');
  }
}, {
  str: 'META+I',
  run(editor) {
    editor.toggleMarkup('em');
  }
}, {
  str: 'CTRL+I',
  run(editor) {
    editor.toggleMarkup('em');
  }
}, {
  str: 'META+U',
  run(editor) {
    editor.toggleMarkup('u');
  }
}, {
  str: 'CTRL+U',
  run(editor) {
    editor.toggleMarkup('u');
  }
}, {
  str: 'CTRL+K',
  run(editor) {
    if (Browser.isMac()) {
      return deleteToEndOfSection(editor);
    } else if (Browser.isWin()) {
      return toggleLink(editor);
    }
  }
}, {
  str: 'CTRL+A',
  run(editor) {
    if (Browser.isMac()) {
      gotoStartOfLine(editor);
    } else {
      selectAll(editor);
    }
  }
}, {
  str: 'META+A',
  run(editor) {
    if (Browser.isMac()) {
      selectAll(editor);
    }
  }
}, {
  str: 'CTRL+E',
  run(editor) {
    if (Browser.isMac()) {
      gotoEndOfLine(editor);
    }
  }
}, {
  str: 'META+K',
  run(editor) {
    return toggleLink(editor);
  },

}, {
  str: 'META+Z',
  run(editor) {
    editor.run(postEditor => {
      postEditor.undoLastChange();
    });
  }
}, {
  str: 'META+SHIFT+Z',
  run(editor) {
    editor.run(postEditor => {
      postEditor.redoLastChange();
    });
  }
}, {
  str: 'CTRL+Z',
  run(editor) {
    if (Browser.isMac()) { return false; }
    editor.run(postEditor => postEditor.undoLastChange());
  }
}, {
  str: 'CTRL+SHIFT+Z',
  run(editor) {
    if (Browser.isMac()) { return false; }
    editor.run(postEditor => postEditor.redoLastChange());
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
