import Command from './base';

export default class TextFormatCommand extends Command {
  constructor(options={}) {
    super(options);

    this.tag = options.tag;
    this.mappedTags = options.mappedTags || [];
    this.mappedTags.push(this.tag);
    this.action = options.action || this.name;
    this.removeAction = options.removeAction || this.action;
  }

  exec(value) {
    document.execCommand(this.action, false, value || null);
  }

  unexec(value) {
    document.execCommand(this.removeAction, false, value || null);
  }
}
