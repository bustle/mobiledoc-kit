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
    let markerRange = this.editor.cursor.offsets;
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
