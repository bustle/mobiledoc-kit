import FormatBlockCommand from './format-block';
import { inherit } from 'content-kit-utils';

function QuoteCommand() {
  FormatBlockCommand.call(this, {
    name: 'quote',
    tag: 'blockquote',
    button: '<i class="ck-icon-quote"></i>'
  });
}
inherit(QuoteCommand, FormatBlockCommand);

export default QuoteCommand;
