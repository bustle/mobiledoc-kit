import Command from '../commands/base';

var buttonClassName = 'ck-toolbar-btn';

function ToolbarButton(options) {
  var button = this;
  var toolbar = options.toolbar;
  var command = options.command;
  var prompt = command.prompt;
  var element = document.createElement('button');

  if(typeof command === 'string') {
    command = Command.index[command];
  }

  button.element = element;
  button.command = command;
  button.isActive = false;

  element.title = command.name;
  element.className = buttonClassName;
  element.innerHTML = command.button;
  element.addEventListener('click', function() {
    if (!button.isActive && prompt) {
      toolbar.displayPrompt(prompt);
    } else {
      command.exec();
    }
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

export default ToolbarButton;
