import FormatBlockCommand from './format-block';
import { inherit } from 'node_modules/content-kit-utils/src/object-utils';
import Type from '../../content-kit-compiler/types/type';

function SubheadingCommand() {
  FormatBlockCommand.call(this, {
    name: 'subheading',
    tag: Type.SUBHEADING.tag,
    button: '<i class="ck-icon-heading"></i>2'
  });
}
inherit(SubheadingCommand, FormatBlockCommand);

export default SubheadingCommand;
