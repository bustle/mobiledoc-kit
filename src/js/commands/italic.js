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
    let markerRange = this.editor.cursor.offsets;
    if (!markerRange.headSection || !markerRange.tailSection) {
      return;
    }
    let markers = this.editor.run((postEditor) => {
      return postEditor.applyMarkupToMarkers(markerRange, this.markup);
    });
    this.editor.selectMarkers(markers);
  }
  unexec() {
    let markerRange = this.editor.cursor.offsets;
    let markers = this.editor.run((postEditor) => {
      return postEditor.removeMarkupFromMarkers(markerRange, this.markup);
    });
    this.editor.selectMarkers(markers);
  }
  isActive() {
    return any(this.editor.activeMarkers, m => m.hasMarkup(this.markup));
  }
}
