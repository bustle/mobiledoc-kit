import FormatBlockCommand from './format-block';
import { inherit } from '../../content-kit-utils/object-utils';
import Type from '../../content-kit-compiler/types/type';

function HeadingCommand() {
  FormatBlockCommand.call(this, {
    name: 'heading',
    tag: Type.HEADING.tag,
    button: '<i class="ck-icon-heading"></i>1'
  });
}
inherit(HeadingCommand, FormatBlockCommand);

export default HeadingCommand;
