import FormatBlockCommand from './format-block';
import { inherit } from 'content-kit-utils';

function SubheadingCommand() {
  FormatBlockCommand.call(this, {
    name: 'subheading',
    tag: 'h3',
    button: '<i class="ck-icon-heading"></i>2'
  });
}
inherit(SubheadingCommand, FormatBlockCommand);

export default SubheadingCommand;
