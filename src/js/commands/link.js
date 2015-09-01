import TextFormatCommand from './text-format';
import { any }  from 'content-kit-editor/utils/array-utils';

export default class LinkCommand extends TextFormatCommand {
  constructor(editor) {
    super(editor, {
      name: 'link',
      tag: 'a',
      button: '<i class="ck-icon-link"></i>'
    });
  }

  isActive() {
    return any(this.editor.activeMarkers, m => m.hasMarkup(this.tag));
  }

  exec(url) {
    const range = this.editor.cursor.offsets;

    let markers = this.editor.run(postEditor => {
      const markup = postEditor.builder.createMarkup('a', ['href', url]);
      return postEditor.applyMarkupToMarkers(range, markup);
    });

    if (markers.length) {
      let lastMarker = markers[markers.length - 1];
      this.editor.cursor.moveToMarker(lastMarker, lastMarker.length);
    } /* else {
      // FIXME should handle the case when linking creating no new markers
      // this.editor.cursor.moveToSection(range.head.section);
    } */
  }

  unexec() {
    const range = this.editor.cursor.offsets;

    const markers = this.editor.run(postEditor => {
      return postEditor.removeMarkupFromMarkers(
        range,
        markup => markup.hasTag('a')
      );
    });

    this.editor.selectMarkers(markers);
  }
}
