import TextFormatCommand from './text-format';
import { getSelectionBlockTagName } from '../utils/selection-utils';
import { inherit } from 'content-kit-utils';
import { Type } from 'content-kit-compiler';

var RegExpHeadingTag = /^(h1|h2|h3|h4|h5|h6)$/i;

function BoldCommand() {
  TextFormatCommand.call(this, {
    name: 'bold',
    tag: Type.BOLD.tag,
    mappedTags: Type.BOLD.mappedTags,
    button: '<i class="ck-icon-bold"></i>'
  });
}
inherit(BoldCommand, TextFormatCommand);

BoldCommand.prototype.exec = function() {
  // Don't allow executing bold command on heading tags
  if (!RegExpHeadingTag.test(getSelectionBlockTagName())) {
    BoldCommand._super.prototype.exec.call(this);
  }
};

export default BoldCommand;
