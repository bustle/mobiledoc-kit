import TextFormatCommand from './text-format';

export default class LinkCommand extends TextFormatCommand {
  constructor(editor) {
    super(editor, {
      name: 'link',
      tag: 'a',
      button: '<i class="ck-icon-link"></i>'
    });
  }

  exec(url) {
    this.editor.run(postEditor => {
      const markup = postEditor.builder.createMarkup('a', ['href', url]);
      this.editor.run(postEditor => postEditor.toggleMarkup(markup));
    });
  }
}
