import Toolbar from './toolbar';

export default class TextFormatToolbar extends Toolbar {
  constructor(options={}) {
    super(options);

    this.editor.on('selection', () => this.handleSelection());
    this.editor.on('selectionUpdated', () => this.handleSelection());
    this.editor.on('selectionEnded', () => this.handleSelectionEnded());
    this.editor.on('escapeKey', () => this.editor.cancelSelection());
    this.addEventListener(window, 'resize', () => this.handleResize());
  }

  handleResize() {
    if (this.isShowing) {
      const activePromptRange = this.activePrompt && this.activePrompt.range;
      this.positionToContent(activePromptRange ? activePromptRange : window.getSelection().getRangeAt(0));
    }
  }

  handleSelection() {
    this.show();
    this.updateForSelection(window.getSelection());
  }

  handleSelectionEnded() {
    this.hide();
  }
}
