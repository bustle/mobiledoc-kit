var Toolbar = (function() {

  function Toolbar(options) {
    var toolbar = this;
    var commands = options.commands;
    var commandCount = commands && commands.length;
    var i, button;
    toolbar.direction = options.direction || ToolbarDirection.TOP;
    options.classNames = ['ck-toolbar'];
    if (toolbar.direction === ToolbarDirection.RIGHT) {
      options.classNames.push('right');
    }

    View.call(toolbar, options);

    toolbar.activePrompt = null;
    toolbar.buttons = [];

    toolbar.promptContainerElement = createDiv('ck-toolbar-prompt');
    toolbar.buttonContainerElement = createDiv('ck-toolbar-buttons');
    toolbar.element.appendChild(toolbar.promptContainerElement);
    toolbar.element.appendChild(toolbar.buttonContainerElement);

    for(i = 0; i < commandCount; i++) {
      button = new ToolbarButton({ command: commands[i], toolbar: toolbar });
      toolbar.buttons.push(button);
      toolbar.buttonContainerElement.appendChild(button.element);
    }
  }
  inherits(Toolbar, View);

  Toolbar.prototype.hide = function() {
    if (Toolbar._super.prototype.hide.call(this)) {
      var style = this.element.style;
      style.left = '';
      style.top = '';
      this.dismissPrompt();
    }
  };

  Toolbar.prototype.displayPrompt = function(prompt) {
    var toolbar = this;
    swapElements(toolbar.promptContainerElement, toolbar.buttonContainerElement);
    toolbar.promptContainerElement.appendChild(prompt.element);
    prompt.show(function() {
      toolbar.dismissPrompt();
      toolbar.updateForSelection(window.getSelection());
    });
    toolbar.activePrompt = prompt;
  };

  Toolbar.prototype.dismissPrompt = function(prompt) {
    var toolbar = this;
    var activePrompt = toolbar.activePrompt;
    if (activePrompt) {
      activePrompt.hide();
      swapElements(toolbar.buttonContainerElement, toolbar.promptContainerElement);
      toolbar.activePrompt = null;
    }
  };
  
  Toolbar.prototype.updateForSelection = function(selection) {
    var toolbar = this;
    if (selection.isCollapsed) {
      toolbar.hide();
    } else {
      toolbar.show();
      toolbar.positionToContent(selection.getRangeAt(0));
      updateButtonsForSelection(toolbar.buttons, selection);
    }
  };

  Toolbar.prototype.positionToContent = function(content) {
    var directions = ToolbarDirection;
    var positioningMethod;
    switch(this.direction) {
      case directions.RIGHT:
        positioningMethod = positionElementToRightOf;
        break;
      default:
        positioningMethod = positionElementCenteredAbove;
    }
    positioningMethod(this.element, content);
  };

  function updateButtonsForSelection(buttons, selection) {
    var selectedTags = tagsInSelection(selection),
        len = buttons.length,
        i, button;
        
    for (i = 0; i < len; i++) {
      button = buttons[i];
      if (selectedTags.indexOf(button.command.tag) > -1) {
        button.setActive();
      } else {
        button.setInactive();
      }
    }
  }

  return Toolbar;
}());


var TextFormatToolbar = (function() {

  function TextFormatToolbar(options) {
    var toolbar = this;
    Toolbar.call(this, options);
    toolbar.rootElement = options.rootElement;
    toolbar.rootElement.addEventListener('keyup', function() { toolbar.handleTextSelection(); });

    document.addEventListener('keyup', function(e) {
      if (e.keyCode === Keycodes.ESC) {
        toolbar.hide();
      }
    });

    document.addEventListener('mouseup', function() {
      setTimeout(function() { toolbar.handleTextSelection(); });
    });

    window.addEventListener('resize', function() {
      if(toolbar.isShowing) {
        var activePromptRange = toolbar.activePrompt && toolbar.activePrompt.range;
        toolbar.positionToContent(activePromptRange ? activePromptRange : window.getSelection().getRangeAt(0));
      }
    });
  }
  inherits(TextFormatToolbar, Toolbar);

  TextFormatToolbar.prototype.handleTextSelection = function() {
    var toolbar = this;
    var selection = window.getSelection();
    if (selection.isCollapsed || selection.toString().trim() === '' || !selectionIsInElement(selection, toolbar.rootElement)) {
      toolbar.hide();
    } else {
      toolbar.updateForSelection(selection);
    }
  };

  return TextFormatToolbar;
}());
