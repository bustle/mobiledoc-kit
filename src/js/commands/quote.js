import FormatBlockCommand from './format-block';

export default class QuoteCommand extends FormatBlockCommand {
  constructor(editor) {
    super(editor, {
      name: 'quote',
      tag: 'blockquote',
      button: '<i class="ck-icon-quote"></i>'
    });
  }
}
