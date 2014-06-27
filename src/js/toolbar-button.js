var ToolbarButton = (function() {

  var buttonClassName = 'ck-toolbar-btn';

  function ToolbarButton(options) {
    var toolbar = options.toolbar,
        command = options.command,
        prompt = command.prompt,
        element = document.createElement('button'),
        button = this;

    if(typeof command === 'string') {
      command = Command.index[command];
    }

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
    this.element = element;
    this.command = command;
    this.isActive = false;
  }

  ToolbarButton.prototype = {
    setActive: function() {
      if (!this.isActive) {
        this.element.className = buttonClassName + ' active';
        this.isActive = true;
      }
    },
    setInactive: function() {
      if (this.isActive) {
        this.element.className = buttonClassName;
        this.isActive = false;
      }
    }
  };

  return ToolbarButton;
}());
