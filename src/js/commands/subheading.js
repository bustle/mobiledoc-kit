import FormatBlockCommand from './format-block';

export default class SubheadingCommand extends FormatBlockCommand {
  constructor(editor) {
    super(editor, {
      name: 'subheading',
      tag: 'h3',
      button: '<i class="ck-icon-heading"></i>3'
    });
  }
}
