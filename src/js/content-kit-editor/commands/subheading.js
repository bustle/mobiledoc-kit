import FormatBlockCommand from './format-block';
import { Tags } from '../constants';
import { inherit } from '../../content-kit-utils/object-utils';

function SubheadingCommand() {
  FormatBlockCommand.call(this, {
    name: 'subheading',
    tag: Tags.SUBHEADING,
    button: '<i class="ck-icon-heading"></i>2'
  });
}
inherit(SubheadingCommand, FormatBlockCommand);

export default SubheadingCommand;
