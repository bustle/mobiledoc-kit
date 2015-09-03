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
      this.positionToContent();
    }
  }

  handleSelection() {
    this.show();
    this.updateForSelection();
  }

  handleSelectionEnded() {
    this.hide();
  }
}
