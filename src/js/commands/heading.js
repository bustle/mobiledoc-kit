import FormatBlockCommand from './format-block';
import { inherit } from 'content-kit-utils';

function HeadingCommand() {
  FormatBlockCommand.call(this, {
    name: 'heading',
    tag: 'h2',
    button: '<i class="ck-icon-heading"></i>1'
  });
}
inherit(HeadingCommand, FormatBlockCommand);

export default HeadingCommand;
