import FormatBlockCommand from './format-block';
import { inherit } from 'node_modules/content-kit-utils/src/object-utils';
import Type from '../../content-kit-compiler/types/type';

function QuoteCommand() {
  FormatBlockCommand.call(this, {
    name: 'quote',
    tag: Type.QUOTE.tag,
    button: '<i class="ck-icon-quote"></i>'
  });
}
inherit(QuoteCommand, FormatBlockCommand);

export default QuoteCommand;
