import TextFormatCommand from './text-format';
import { RegEx } from '../constants';
import { getSelectionBlockTagName } from '../utils/selection-utils';
import { inherit } from '../../content-kit-utils/object-utils';
import Type from '../../content-kit-compiler/types/type';

function BoldCommand() {
  TextFormatCommand.call(this, {
    name: 'bold',
    tag: Type.BOLD.tag,
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
