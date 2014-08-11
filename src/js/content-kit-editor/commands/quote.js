import FormatBlockCommand from './format-block';
import { Tags } from '../constants';
import { inherit } from '../../content-kit-utils/object-utils';

function QuoteCommand() {
  FormatBlockCommand.call(this, {
    name: 'quote',
    tag: Tags.QUOTE,
    button: '<i class="ck-icon-quote"></i>'
  });
}
inherit(QuoteCommand, FormatBlockCommand);

export default QuoteCommand;
