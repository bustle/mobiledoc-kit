import TextFormatCommand from './text-format';
import {
  any
} from '../utils/array-utils';

export default class ItalicCommand extends TextFormatCommand {
  constructor(editor) {
    super({
      name: 'italic',
      button: '<i class="ck-icon-italic"></i>'
    });
    this.editor = editor;
    const { builder } = this.editor;
    this.markup = builder.createMarkup('em');
  }
  exec() {
    this.editor.applyMarkupToSelection(this.markup);
  }
  unexec() {
    this.editor.removeMarkupFromSelection(this.markup);
  }
  isActive() {
    return any(this.editor.activeMarkers, m => m.hasMarkup(this.markup));
  }
}
