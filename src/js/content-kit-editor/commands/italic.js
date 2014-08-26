import TextFormatCommand from './text-format';
import { inherit } from '../../content-kit-utils/object-utils';
import Type from '../../content-kit-compiler/types/type';

function ItalicCommand() {
  TextFormatCommand.call(this, {
    name: 'italic',
    tag: Type.ITALIC.tag,
    button: '<i class="ck-icon-italic"></i>'
  });
}
inherit(ItalicCommand, TextFormatCommand);

export default ItalicCommand;
