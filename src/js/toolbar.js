var Toolbar = (function() {

  var container = document.body;
  var buttonContainerElement, promptContainerElement;

  function Toolbar(options) {
    var toolbar = this;
    var commands = options && options.commands;
    var commandCount = commands && commands.length;
    var element = createDiv('ck-toolbar');
    var i, button;
    toolbar.element = element;
    toolbar.isShowing = false;
    toolbar.activePrompt = null;
    toolbar.buttons = [];
    bindEvents(toolbar);

    promptContainerElement = createDiv('ck-toolbar-prompt');
    buttonContainerElement = createDiv('ck-toolbar-buttons');
    element.appendChild(promptContainerElement);
    element.appendChild(buttonContainerElement);

    for(i = 0; i < commandCount; i++) {
      button = new ToolbarButton({ command: commands[i], toolbar: toolbar });
      toolbar.buttons.push(button);
      buttonContainerElement.appendChild(button.element);
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
      if(toolbar.isShowing) {
        container.removeChild(toolbar.element);
        toolbar.dismissPrompt();
        toolbar.isShowing = false;
      }
    },
    displayPrompt: function(prompt) {
      var toolbar = this;
      swapElements(promptContainerElement, buttonContainerElement);
      promptContainerElement.appendChild(prompt.element);
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
        swapElements(buttonContainerElement, promptContainerElement);
        toolbar.activePrompt = null;
      }
    },
    updateForSelection: function(selection) {
      var toolbar = this;
      toolbar.show();
      toolbar.positionToSelection(selection);
      updateButtonsForSelection(toolbar.buttons, selection);
    },
    positionToSelection: function(selection) {
      if (!selection.isCollapsed) {
        var clientRectBounds = selection.getRangeAt(0).getBoundingClientRect();
        this.setPosition(
          (clientRectBounds.left + clientRectBounds.right) / 2,
          clientRectBounds.top + window.pageYOffset
        );
      }
    },
    setPosition: function(x, y) {
      var element = this.element,
          style = element.style,
          offset = getElementOffset(container);

      style.left = parseInt(x - (element.offsetWidth / 2) - offset.left, 10) + 'px';
      style.top  = parseInt(y - element.offsetHeight - offset.top, 10) + 'px';
    }
  };

  function bindEvents(toolbar) {
    document.addEventListener('keyup', function(e) {
      if (e.keyCode === Keycodes.ESC) {
        toolbar.hide();
      }
    });

    document.addEventListener('mouseup', function() {
      toolbar.dismissPrompt();
    });

    window.addEventListener('resize', function() {
      if(toolbar.isShowing) {
        toolbar.positionToSelection(window.getSelection());
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
