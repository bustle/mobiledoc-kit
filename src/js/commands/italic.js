import TextFormatCommand from './text-format';

export default class ItalicCommand extends TextFormatCommand {
  constructor(editor) {
    super(editor, {
      tag: 'em',
      name: 'italic',
      button: '<i class="ck-icon-italic"></i>'
    });
  }
}
