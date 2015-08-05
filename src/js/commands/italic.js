import TextFormatCommand from './text-format';
import Markup from '../models/markup';
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
    this.markup = Markup.create('em');
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
