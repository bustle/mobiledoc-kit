import Key from '../utils/key';
import { MODIFIERS } from '../utils/key';
import { detect } from '../utils/array-utils';
import LinkCommand from '../commands/link';
import BoldCommand from '../commands/bold';
import ItalicCommand from '../commands/italic';

function runSelectionCommand(editor, CommandKlass) {
  if (editor.cursor.hasSelection()) {
    const cmd = new CommandKlass(editor);
    if (cmd.isActive()) {
      cmd.unexec();
    } else {
      cmd.exec();
    }
  }
}

export const DEFAULT_KEY_COMMANDS = [{
  modifier: MODIFIERS.META,
  str: 'B',
  run(editor) {
    runSelectionCommand(editor, BoldCommand);
  }
}, {
  modifier: MODIFIERS.CTRL,
  str: 'B',
  run(editor) {
    runSelectionCommand(editor, BoldCommand);
  }
}, {
  modifier: MODIFIERS.META,
  str: 'I',
  run(editor) {
    runSelectionCommand(editor, ItalicCommand);
  }
}, {
  modifier: MODIFIERS.CTRL,
  str: 'I',
  run(editor) {
    runSelectionCommand(editor, ItalicCommand);
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

export function validateKeyCommand(keyCommand) {
  return !!keyCommand.modifier && !!keyCommand.str && !!keyCommand.run;
}

export function findKeyCommand(keyCommands, keyEvent) {
  const key = Key.fromEvent(keyEvent);

  return detect(keyCommands, ({modifier, str}) => {
    return key.hasModifier(modifier) && key.isChar(str);
  });
}
