import TextFormatCommand from './text-format';
import { inherit } from 'content-kit-utils';

function ItalicCommand() {
  TextFormatCommand.call(this, {
    name: 'italic',
    tag: 'em',
    mappedTags: ['i'],
    button: '<i class="ck-icon-italic"></i>'
  });
}
inherit(ItalicCommand, TextFormatCommand);

export default ItalicCommand;
