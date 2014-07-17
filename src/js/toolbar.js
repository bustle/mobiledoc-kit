var Toolbar = (function() {

  var container = document.body;

  function Toolbar(options) {
    var toolbar = this;
    var commands = options && options.commands;
    var commandCount = commands && commands.length;
    var element = createDiv('ck-toolbar');
    var i, button;
    toolbar.element = element;
    toolbar.direction = options.direction || ToolbarDirection.TOP;
    if (toolbar.direction === ToolbarDirection.RIGHT) {
      element.className += ' right';
    }
    toolbar.isShowing = false;
    toolbar.activePrompt = null;
    toolbar.buttons = [];
    bindEvents(toolbar);

    toolbar.promptContainerElement = createDiv('ck-toolbar-prompt');
    toolbar.buttonContainerElement = createDiv('ck-toolbar-buttons');
    element.appendChild(toolbar.promptContainerElement);
    element.appendChild(toolbar.buttonContainerElement);

    for(i = 0; i < commandCount; i++) {
      button = new ToolbarButton({ command: commands[i], toolbar: toolbar });
      toolbar.buttons.push(button);
      toolbar.buttonContainerElement.appendChild(button.element);
    }
  }

  Toolbar.prototype = {
    show: function() {
      var toolbar = this;
      if(!toolbar.isShowing) {
        container.appendChild(toolbar.element);
        toolbar.isShowing = true;
      }
    },
    hide: function() {
      var toolbar = this;
      var element = toolbar.element;
      var style = element.style;
      if(toolbar.isShowing) {
        container.removeChild(element);
        style.left = '';
        style.top = '';
        toolbar.dismissPrompt();
        toolbar.isShowing = false;
      }
    },
    displayPrompt: function(prompt) {
      var toolbar = this;
      swapElements(toolbar.promptContainerElement, toolbar.buttonContainerElement);
      toolbar.promptContainerElement.appendChild(prompt.element);
      prompt.display(function() {
        toolbar.dismissPrompt();
        toolbar.updateForSelection(window.getSelection());
      });
      toolbar.activePrompt = prompt;
    },
    dismissPrompt: function() {
      var toolbar = this;
      var activePrompt = toolbar.activePrompt;
      if (activePrompt) {
        activePrompt.dismiss();
        swapElements(toolbar.buttonContainerElement, toolbar.promptContainerElement);
        toolbar.activePrompt = null;
      }
    },
    updateForSelection: function(selection) {
      var toolbar = this;
      if (selection.isCollapsed) {
        toolbar.hide();
      } else {
        toolbar.show();
        toolbar.positionToContent(selection.getRangeAt(0));
        updateButtonsForSelection(toolbar.buttons, selection);
      }
    },
    positionToContent: function(content) {
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
    }
  };

  function bindEvents(toolbar) {
    document.addEventListener('keyup', function(e) {
      if (e.keyCode === Keycodes.ESC) {
        toolbar.hide();
      }
    });

    window.addEventListener('resize', function() {
      var activePrompt = toolbar.activePrompt;
      if(toolbar.isShowing) {
        toolbar.positionToContent(activePrompt ? activePrompt.range : window.getSelection().getRangeAt(0));
      }
    });
  }

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
