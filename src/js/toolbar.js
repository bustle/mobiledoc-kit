var Toolbar = (function() {

  var container = document.body,
      buttonContainerElement, promptContainerElement;

  function Toolbar(options) {
    var commands = options && options.commands,
        commandCount = commands && commands.length,
        i, button;
    this.element = createDiv('ck-toolbar');
    this.isShowing = false;
    this.activePrompt = null;
    this.buttons = [];
    promptContainerElement = createDiv('ck-toolbar-prompt');
    this.element.appendChild(promptContainerElement);
    buttonContainerElement = createDiv('ck-toolbar-buttons');
    this.element.appendChild(buttonContainerElement);
    for(i = 0; i < commandCount; i++) {
      button = new ToolbarButton({ command: commands[i], toolbar: this });
      buttonContainerElement.appendChild(button.element);
      this.buttons.push(button);
    }
    bindEvents(this);
  }

  Toolbar.prototype = {
    show: function() {
      if(!this.isShowing) {
        container.appendChild(this.element);
        this.isShowing = true;
      }
    },
    hide: function() {
      if(this.isShowing) {
        container.removeChild(this.element);
        this.dismissPrompt();
        this.isShowing = false;
      }
    },
    displayPrompt: function(prompt) {
      var toolbar = this;
      buttonContainerElement.style.display = 'none';
      promptContainerElement.style.display = 'block';
      promptContainerElement.appendChild(prompt.element);
      prompt.display(function() {
        toolbar.dismissPrompt();
        toolbar.updateForSelection(window.getSelection());
      });
      this.activePrompt = prompt;
    },
    dismissPrompt: function() {
      if (this.activePrompt) {
        promptContainerElement.style.display = 'none';
        promptContainerElement.innerHTML = '';
        buttonContainerElement.style.display = 'block';
        this.activePrompt.dismiss();
        this.activePrompt = null;
      }
    },
    updateForSelection: function(selection) {
      this.show();
      this.positionToSelection(selection);
      updateButtonsForSelection(this.buttons, selection);
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

  function tagsInSelection(selection) {
    var node = selection.focusNode.parentNode,
        tags = [];

    if (!selection.isCollapsed) {
      while(node) {
        // Stop traversing up dom when hitting an editor element
        if (node.contentEditable === 'true') { break; }
        if (node.tagName) {
          tags.push(node.tagName.toLowerCase());
        }
        node = node.parentNode;
      }
    }
    return tags;
  }

  return Toolbar;
}());
