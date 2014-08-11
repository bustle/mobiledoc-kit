import View from './view';
import ToolbarButton from './toolbar-button';
import { inherit } from '../../content-kit-utils/object-utils';
import { tagsInSelection } from '../utils/selection-utils';
import { ToolbarDirection } from '../constants';
import { createDiv, swapElements, positionElementToRightOf, positionElementCenteredAbove } from '../utils/element-utils';

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

function Toolbar(options) {
  var toolbar = this;
  var commands = options.commands;
  var commandCount = commands && commands.length;
  var i, button, command;
  toolbar.editor = options.editor || null;
  toolbar.embedIntent = options.embedIntent || null;
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
    this.addCommand(commands[i]);
  }

  // Closes prompt if displayed when changing selection
  document.addEventListener('mouseup', function() {
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
    toolbar.updateForSelection(window.getSelection());
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

export default Toolbar;
