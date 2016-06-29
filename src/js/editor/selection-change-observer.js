let instance;

class SelectionChangeObserver {
  constructor() {
    this.started   = false;
    this.listeners  = [];
    this.selection = {};
  }

  static getInstance() {
    if (!instance) {
      instance = new SelectionChangeObserver();
    }
    return instance;
  }

  static addListener(listener) {
    SelectionChangeObserver.getInstance().addListener(listener);
  }

  addListener(listener) {
    if (this.listeners.indexOf(listener) === -1) {
      this.listeners.push(listener);
      this.start();
    }
  }

  static removeListener(listener) {
    SelectionChangeObserver.getInstance().removeListener(listener);
  }

  removeListener(listener) {
    let index = this.listeners.indexOf(listener);
    if (index !== -1) {
      this.listeners.splice(index, 1);
      if (this.listeners.length === 0) {
        this.stop();
      }
    }
  }

  start() {
    if (this.started) { return; }
    this.started = true;

    this.poll();
  }

  stop() {
    this.started = false;
    this.selection = {};
  }

  notifyListeners(/* newSelection, prevSelection */) {
    this.listeners.forEach(listener => {
      listener.selectionDidChange(...arguments);
    });
  }

  destroy() {
    this.stop();
    this.listeners = [];
  }

  getSelection() {
    let selection = window.getSelection();
    let { anchorNode, focusNode, anchorOffset, focusOffset } = selection;
    return { anchorNode, focusNode, anchorOffset, focusOffset };
  }

  poll() {
    if (this.started) {
      this.update();
      this.runNext(() => this.poll());
    }
  }

  runNext(fn) {
    window.requestAnimationFrame(fn);
  }

  update() {
    let prevSelection = this.selection;
    let curSelection = this.getSelection();
    if (!this.selectionIsEqual(prevSelection, curSelection)) {
      this.selection = curSelection;
      this.notifyListeners(curSelection, prevSelection);
    }
  }

  selectionIsEqual(s1, s2) {
    return s1.anchorNode === s2.anchorNode &&
      s1.anchorOffset === s2.anchorOffset &&
      s1.focusNode === s2.focusNode &&
      s1.focusOffset === s2.focusOffset;
  }
}

export default SelectionChangeObserver;
