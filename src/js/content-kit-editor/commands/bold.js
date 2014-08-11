import TextFormatCommand from './text-format';
import { inherit } from '../../content-kit-utils/object-utils';
import { Tags, RegEx } from '../constants';
import { getSelectionBlockTagName } from '../utils/selection-utils';

function BoldCommand() {
  TextFormatCommand.call(this, {
    name: 'bold',
    tag: Tags.BOLD,
    button: '<i class="ck-icon-bold"></i>'
  });
}
inherit(BoldCommand, TextFormatCommand);

BoldCommand.prototype.exec = function() {
  // Don't allow executing bold command on heading tags
  if (!RegEx.HEADING_TAG.test(getSelectionBlockTagName())) {
    BoldCommand._super.prototype.exec.call(this);
  }
};

export default BoldCommand;
