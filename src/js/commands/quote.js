import FormatBlockCommand from './format-block';
import { inherit } from 'content-kit-utils';
import { Type } from 'content-kit-compiler';

function QuoteCommand() {
  FormatBlockCommand.call(this, {
    name: 'quote',
    tag: Type.QUOTE.tag,
    button: '<i class="ck-icon-quote"></i>'
  });
}
inherit(QuoteCommand, FormatBlockCommand);

export default QuoteCommand;
