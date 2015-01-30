import TextFormatCommand from './text-format';
import { inherit } from 'node_modules/content-kit-utils/src/object-utils';
import Type from '../../content-kit-compiler/types/type';

function ItalicCommand() {
  TextFormatCommand.call(this, {
    name: 'italic',
    tag: Type.ITALIC.tag,
    mappedTags: Type.ITALIC.mappedTags,
    button: '<i class="ck-icon-italic"></i>'
  });
}
inherit(ItalicCommand, TextFormatCommand);

export default ItalicCommand;
