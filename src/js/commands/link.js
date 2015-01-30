import TextFormatCommand from './text-format';
import Prompt from '../views/prompt';
import { getSelectionTagName } from '../utils/selection-utils';
import { inherit } from 'node_modules/content-kit-utils/src/object-utils';
import Type from 'node_modules/content-kit-compiler/src/types/type';

var RegExpHttp = /^https?:\/\//i;

function LinkCommand() {
  TextFormatCommand.call(this, {
    name: 'link',
    tag: Type.LINK.tag,
    action: 'createLink',
    removeAction: 'unlink',
    button: '<i class="ck-icon-link"></i>',
    prompt: new Prompt({
      command: this,
      placeholder: 'Enter a url, press return...'
    })
  });
}
inherit(LinkCommand, TextFormatCommand);

LinkCommand.prototype.exec = function(url) {
  if (!url) {
    return LinkCommand._super.prototype.unexec.call(this);
  }

  if(this.tag === getSelectionTagName()) {
    this.unexec();
  } else {
    if (!RegExpHttp.test(url)) {
      url = 'http://' + url;
    }
    LinkCommand._super.prototype.exec.call(this, url);
  }
};

export default LinkCommand;
