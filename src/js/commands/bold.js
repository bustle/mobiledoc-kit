import TextFormatCommand from './text-format';
import {
  any
} from '../utils/array-utils';

export default class BoldCommand extends TextFormatCommand {
  constructor(editor) {
    super({
      name: 'bold',
      button: '<i class="ck-icon-bold"></i>'
    });
    this.editor = editor;
    const { builder } = this.editor;
    this.markup = builder.createMarkup('strong');
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
