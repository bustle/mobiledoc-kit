import TextFormatCommand from './text-format';
import { Tags } from '../constants';
import { inherit } from '../../content-kit-utils/object-utils';

function ItalicCommand() {
  TextFormatCommand.call(this, {
    name: 'italic',
    tag: Tags.ITALIC,
    button: '<i class="ck-icon-italic"></i>'
  });
}
inherit(ItalicCommand, TextFormatCommand);

export default ItalicCommand;
