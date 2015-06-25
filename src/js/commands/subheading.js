import FormatBlockCommand from './format-block';
import { inherit } from 'content-kit-utils';
import { Type } from 'content-kit-compiler';

function SubheadingCommand() {
  FormatBlockCommand.call(this, {
    name: 'subheading',
    tag: Type.SUBHEADING.tag,
    button: '<i class="ck-icon-heading"></i>2'
  });
}
inherit(SubheadingCommand, FormatBlockCommand);

export default SubheadingCommand;
