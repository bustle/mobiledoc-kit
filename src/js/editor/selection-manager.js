import SelectionChangeObserver from 'mobiledoc-kit/editor/selection-change-observer';

export default class SelectionManager {
  constructor(editor, callback) {
    this.editor   = editor;
    this.callback = callback;
    this.started  = false;
  }

  start() {
    if (this.started) { return; }

    SelectionChangeObserver.addListener(this);
    this.started = true;
  }

  stop() {
    this.started = false;
    SelectionChangeObserver.removeListener(this);
  }

  destroy() {
    this.stop();
  }

  selectionDidChange() {
    if (this.started) {
      this.callback(...arguments);
    }
  }
}
