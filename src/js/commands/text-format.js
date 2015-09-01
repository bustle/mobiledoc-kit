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
    const { builder } = this.editor;
    this._markup = builder.createMarkup(this.tag);
    return this._markup;
  }

  isActive() {
    return any(this.editor.activeMarkers, m => m.hasMarkup(this.markup));
  }

  exec() {
    const range = this.editor.cursor.offsets;
    const markers = this.editor.run((postEditor) => {
      return postEditor.applyMarkupToMarkers(range, this.markup);
    });
    this.editor.selectMarkers(markers);
  }

  unexec() {
    const range = this.editor.cursor.offsets;
    const markers = this.editor.run((postEditor) => {
      return postEditor.removeMarkupFromMarkers(range, this.markup);
    });
    this.editor.selectMarkers(markers);
  }
}
