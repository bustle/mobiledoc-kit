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
    return any(this.editor.markupsInSelection, m => m.hasTag(this.tag));
  }

  exec(url) {
    const range = this.editor.cursor.offsets;
    this.editor.run(postEditor => {
      const markup = postEditor.builder.createMarkup('a', ['href', url]);
      postEditor.applyMarkupToRange(range, markup);
    });
    this.editor.moveToPosition(range.tail);
  }

  unexec() {
    const range = this.editor.cursor.offsets;
    this.editor.run(postEditor => {
      postEditor.removeMarkupFromRange(range, markup => markup.hasTag('a'));
    });
    this.editor.selectRange(range);
  }
}
