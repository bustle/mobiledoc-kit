import ReversibleToolbarButton from './reversible-toolbar-button';

export default class PromptButton extends ReversibleToolbarButton {
  constructor(command, editor) {
    super(command, editor);
  }

  get prompt() {
    return this.toolbar.prompt;
  }

  handleClick(e) {
    e.stopPropagation();

    const { prompt } = this;

    if (!this.active) {
      prompt.show((...args) => this.exec(...args));
    } else {
      this.unexec();
    }
  }
}
