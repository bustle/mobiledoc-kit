import Command from './base';
import { inherit } from '../../content-kit-utils/object-utils';

function TextFormatCommand(options) {
  options = options || {};
  Command.call(this, options);
  this.tag = options.tag;
  this.mappedTags = options.mappedTags || [];
  this.mappedTags.push(this.tag);
  this.action = options.action || this.name;
  this.removeAction = options.removeAction || this.action;
}
inherit(TextFormatCommand, Command);

TextFormatCommand.prototype = {
  exec: function(value) {
    document.execCommand(this.action, false, value || null);
  },
  unexec: function(value) {
    document.execCommand(this.removeAction, false, value || null);
  }
};

export default TextFormatCommand;
