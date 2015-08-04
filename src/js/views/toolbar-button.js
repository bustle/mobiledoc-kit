var buttonClassName = 'ck-toolbar-btn';
import mixin from '../utils/mixin';
import EventListenerMixin from '../utils/event-listener';

function ToolbarButton(options) {
  var button = this;
  var toolbar = options.toolbar;
  var command = options.command;
  var prompt = command.prompt;
  var element = document.createElement('button');

  button.element = element;
  button.command = command;
  button.isActive = false;

  element.title = command.name;
  element.className = buttonClassName;
  element.innerHTML = command.button;
  this.addEventListener(element, 'click', (e) => {
    if (!button.isActive && prompt) {
      toolbar.displayPrompt(prompt);
    } else {
      command.exec();
      toolbar.updateForSelection();
      if (toolbar.embedIntent) {
        toolbar.embedIntent.hide();
      }
    }
    e.stopPropagation();
  });
}

ToolbarButton.prototype = {
  setActive: function() {
    var button = this;
    if (!button.isActive) {
      button.element.className = buttonClassName + ' active';
      button.isActive = true;
    }
  },
  setInactive: function() {
    var button = this;
    if (button.isActive) {
      button.element.className = buttonClassName;
      button.isActive = false;
    }
  }
};

mixin(ToolbarButton, EventListenerMixin);

export default ToolbarButton;
