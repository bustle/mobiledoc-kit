import Command from './base';
import { any } from '../utils/array-utils';

export default class TextFormatCommand extends Command {
  constructor(editor, options={}) {
    super(options);
    this.editor = editor;
    this.tag = options.tag;
  }

  isActive() {
    return any(this.editor.markupsInSelection, m => m.hasTag(this.tag));
  }

  exec() {
    this.editor.run(postEditor => postEditor.toggleMarkup(this.tag));
  }

  unexec() {
    this.editor.run(postEditor => postEditor.toggleMarkup(this.tag));
  }
}
