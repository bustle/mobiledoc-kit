import FormatBlockCommand from './format-block';

export default class HeadingCommand extends FormatBlockCommand {
  constructor(editor) {
    const options = {
      name: 'heading',
      tag: 'h2',
      button: '<i class="ck-icon-heading"></i>2'
    };
    super(editor, options);
  }
}
