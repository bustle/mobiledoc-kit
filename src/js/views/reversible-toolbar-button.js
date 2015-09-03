import mixin from '../utils/mixin';
import EventListenerMixin from '../utils/event-listener';
import { addClassName, removeClassName } from '../utils/dom-utils';

const ELEMENT_TYPE = 'button';
const BUTTON_CLASS_NAME = 'ck-toolbar-btn';
const ACTIVE_CLASS_NAME = 'active';

class ReversibleToolbarButton {
  constructor(command, editor) {
    this.command = command;
    this.editor = editor;
    this.element = this.createElement();
    this.active = false;

    this.addEventListener(this.element, 'click', e => this.handleClick(e));
    this.editor.on('selection', () => this.updateActiveState());
    this.editor.on('selectionUpdated', () => this.updateActiveState());
    this.editor.on('selectionEnded', () => this.updateActiveState());
  }

  // These are here to match the API of the ToolbarButton class
  setInactive() {}
  setActive() {}

  handleClick(e) {
    e.stopPropagation();

    if (this.active) {
      this.unexec();
    } else {
      this.exec();
    }
  }

  exec(...args) {
    this.command.exec(...args);
  }

  unexec(...args) {
    this.command.unexec(...args);
  }

  updateActiveState() {
    this.active = this.command.isActive();
  }

  createElement() {
    const element = document.createElement(ELEMENT_TYPE);
    element.className = BUTTON_CLASS_NAME;
    element.innerHTML = this.command.button;
    element.title = this.command.name;
    return element;
  }

  set active(val) {
    this._active = val;
    let method = this._active ? addClassName : removeClassName;
    method(this.element, ACTIVE_CLASS_NAME);
  }

  get active() {
    return this._active;
  }

  destroy() {
    this.removeAllEventListeners();
  }
}

mixin(ReversibleToolbarButton, EventListenerMixin);

export default ReversibleToolbarButton;
