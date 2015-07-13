import View from './view';
import ToolbarButton from './toolbar-button';
import { inherit } from 'content-kit-utils';
import { tagsInSelection } from '../utils/selection-utils';
import { createDiv, swapElements, positionElementToRightOf, positionElementCenteredAbove } from '../utils/element-utils';

var ToolbarDirection = {
  TOP   : 1,
  RIGHT : 2
};

function selectionContainsButtonsTag(selectedTags, buttonsTags) {
  return selectedTags.filter(function(tag) {
    return buttonsTags.indexOf(tag) > -1;
  }).length;
}

function updateButtonsForSelection(buttons, selection) {
  var selectedTags = tagsInSelection(selection);
  var len = buttons.length;
  var i, button;

  for (i = 0; i < len; i++) {
    button = buttons[i];
    if (selectionContainsButtonsTag(selectedTags, button.command.mappedTags)) {
      button.setActive();
    } else {
      button.setInactive();
    }
  }
}

function Toolbar(options) {
  options = options || {};
  var toolbar = this;
  var commands = options.commands;
  var commandCount = commands && commands.length, i;
  options.classNames = ['ck-toolbar'];
  View.call(toolbar, options);

  toolbar.setSticky(options.sticky || false);
  toolbar.setDirection(options.direction || ToolbarDirection.TOP);
  toolbar.editor = options.editor || null;
  toolbar.embedIntent = options.embedIntent || null;
  toolbar.activePrompt = null;
  toolbar.buttons = [];

  toolbar.contentElement = createDiv('ck-toolbar-content');
  toolbar.promptContainerElement = createDiv('ck-toolbar-prompt');
  toolbar.buttonContainerElement = createDiv('ck-toolbar-buttons');
  toolbar.contentElement.appendChild(toolbar.promptContainerElement);
  toolbar.contentElement.appendChild(toolbar.buttonContainerElement);
  toolbar.element.appendChild(toolbar.contentElement);

  for(i = 0; i < commandCount; i++) {
    this.addCommand(commands[i]);
  }

  // Closes prompt if displayed when changing selection
  this.addEventListener(document, 'mouseup', () => {
    toolbar.dismissPrompt();
  });
}
inherit(Toolbar, View);

Toolbar.prototype.hide = function() {
  if (Toolbar._super.prototype.hide.call(this)) {
    var style = this.element.style;
    style.left = '';
    style.top = '';
    this.dismissPrompt();
  }
};

Toolbar.prototype.addCommand = function(command) {
  command.editorContext = this.editor;
  command.embedIntent = this.embedIntent;
  var button = new ToolbarButton({ command: command, toolbar: this });
  this.buttons.push(button);
  this.buttonContainerElement.appendChild(button.element);
};

Toolbar.prototype.displayPrompt = function(prompt) {
  var toolbar = this;
  swapElements(toolbar.promptContainerElement, toolbar.buttonContainerElement);
  toolbar.promptContainerElement.appendChild(prompt.element);
  prompt.show(function() {
    toolbar.dismissPrompt();
    toolbar.updateForSelection();
  });
  toolbar.activePrompt = prompt;
};

Toolbar.prototype.dismissPrompt = function() {
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
  selection = selection || window.getSelection();
  if (toolbar.sticky) {
    updateButtonsForSelection(toolbar.buttons, selection);
  } else if (!selection.isCollapsed) {
    toolbar.positionToContent(selection.getRangeAt(0));
    updateButtonsForSelection(toolbar.buttons, selection);
  }
};

Toolbar.prototype.positionToContent = function(content) {
  var directions = ToolbarDirection;
  var positioningMethod, position, sideEdgeOffset;
  switch(this.direction) {
    case directions.RIGHT:
      positioningMethod = positionElementToRightOf;
      break;
    default:
      positioningMethod = positionElementCenteredAbove;
  }
  position = positioningMethod(this.element, content);
  sideEdgeOffset = Math.min(Math.max(10, position.left), document.body.clientWidth - this.element.offsetWidth - 10);
  this.contentElement.style.transform = 'translateX(' + (sideEdgeOffset - position.left) + 'px)';
};

Toolbar.prototype.setDirection = function(direction) {
  this.direction = direction;
  if (direction === ToolbarDirection.RIGHT) {
    this.addClass('right');
  } else {
    this.removeClass('right');
  }
};

Toolbar.prototype.setSticky = function(sticky) {
  this.sticky = sticky;
  if (sticky) {
    this.addClass('sticky');
    this.element.removeAttribute('style'); // clears any prior positioning
    this.show();
  } else {
    this.removeClass('sticky');
    this.hide();
  }
};

Toolbar.prototype.toggleSticky = function() {
  this.setSticky(!this.sticky);
};

Toolbar.Direction = ToolbarDirection;

export default Toolbar;
