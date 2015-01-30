import FormatBlockCommand from './format-block';
import { inherit } from 'node_modules/content-kit-utils/src/object-utils';
import Type from 'node_modules/content-kit-compiler/src/types/type';

function HeadingCommand() {
  FormatBlockCommand.call(this, {
    name: 'heading',
    tag: Type.HEADING.tag,
    button: '<i class="ck-icon-heading"></i>1'
  });
}
inherit(HeadingCommand, FormatBlockCommand);

export default HeadingCommand;
