import Command from './base';
import { any } from '../utils/array-utils';

export default class TextFormatCommand extends Command {
  constructor(editor, options={}) {
    super(options);
    this.editor = editor;
    this.tag = options.tag;
  }

  get markup() {
    if (this._markup) { return this._markup; }
    this._markup = this.editor.builder.createMarkup(this.tag);
    return this._markup;
  }

  isActive() {
    return any(this.editor.markupsInSelection, m => m === this.markup);
  }

  exec() {
    const range = this.editor.cursor.offsets, { markup } = this;
    this.editor.run(
      postEditor => postEditor.applyMarkupToRange(range, markup));
    this.editor.selectRange(range);
  }

  unexec() {
    const range = this.editor.cursor.offsets, { markup } = this;
    this.editor.run(
      postEditor => postEditor.removeMarkupFromRange(range, markup));
    this.editor.selectRange(range);
  }
}
