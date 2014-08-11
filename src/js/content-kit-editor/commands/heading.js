import FormatBlockCommand from './format-block';
import { Tags } from '../constants';
import { inherit } from '../../content-kit-utils/object-utils';

function HeadingCommand() {
  FormatBlockCommand.call(this, {
    name: 'heading',
    tag: Tags.HEADING,
    button: '<i class="ck-icon-heading"></i>1'
  });
}
inherit(HeadingCommand, FormatBlockCommand);

export default HeadingCommand;
