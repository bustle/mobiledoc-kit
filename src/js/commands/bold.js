import TextFormatCommand from './text-format';
import Markup from '../models/markup';
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
    this.markup = Markup.create('b');
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
