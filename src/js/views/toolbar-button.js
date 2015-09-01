import mixin from '../utils/mixin';
import EventListenerMixin from '../utils/event-listener';

const ELEMENT_TYPE = 'button';
const BUTTON_CLASS_NAME = 'ck-toolbar-btn';

class ToolbarButton {
  constructor(options={}) {
    const { toolbar, command } = options;
    this.command = command;
    this.element = this.createElement();
    this.isActive = false;

    this.addEventListener(this.element, 'click', (e) => {
      command.exec();
      if (toolbar.embedIntent) {
        toolbar.embedIntent.hide();
      }
      e.stopPropagation();
    });
  }

  createElement() {
    const element = document.createElement(ELEMENT_TYPE);
    element.className = BUTTON_CLASS_NAME;
    element.innerHTML = this.command.button;
    element.title = this.command.name;
    return element;
  }

  destroy() {
    this.removeAllEventListeners();
  }
}

mixin(ToolbarButton, EventListenerMixin);

export default ToolbarButton;
