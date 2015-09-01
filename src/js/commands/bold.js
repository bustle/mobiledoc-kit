import TextFormatCommand from './text-format';
export default class BoldCommand extends TextFormatCommand {
  constructor(editor) {
    super(editor, {
      tag: 'strong',
      name: 'bold',
      button: '<i class="ck-icon-bold"></i>'
    });
  }
}
