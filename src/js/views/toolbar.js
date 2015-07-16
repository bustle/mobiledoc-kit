import View from './view';
import ToolbarButton from './toolbar-button';
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

class Toolbar extends View {
  constructor(options={}) {
    options.classNames = ['ck-toolbar'];
    super(options);

    let commands = options.commands;
    let commandCount = commands && commands.length;

    this.setDirection(options.direction || ToolbarDirection.TOP);
    this.editor = options.editor || null;
    this.embedIntent = options.embedIntent || null;
    this.activePrompt = null;
    this.buttons = [];

    this.contentElement = createDiv('ck-toolbar-content');
    this.promptContainerElement = createDiv('ck-toolbar-prompt');
    this.buttonContainerElement = createDiv('ck-toolbar-buttons');
    this.contentElement.appendChild(this.promptContainerElement);
    this.contentElement.appendChild(this.buttonContainerElement);
    this.element.appendChild(this.contentElement);

    for(let i = 0; i < commandCount; i++) {
      this.addCommand(commands[i]);
    }

    // Closes prompt if displayed when changing selection
    this.addEventListener(document, 'mouseup', () => {
      this.dismissPrompt();
    });
  }

  hide() {
    if (super.hide()) {
      let style = this.element.style;
      style.left = '';
      style.top = '';
      this.dismissPrompt();
    }
  }

  addCommand(command) {
    command.editorContext = this.editor;
    command.embedIntent = this.embedIntent;
    let button = new ToolbarButton({command: command, toolbar: this});
    this.buttons.push(button);
    this.buttonContainerElement.appendChild(button.element);
  }

  displayPrompt(prompt) {
    swapElements(this.promptContainerElement, this.buttonContainerElement);
    this.promptContainerElement.appendChild(prompt.element);
    prompt.show(() => {
      this.dismissPrompt();
      this.updateForSelection();
    });
    this.activePrompt = prompt;
  }

  dismissPrompt() {
    let activePrompt = this.activePrompt;
    if (activePrompt) {
      activePrompt.hide();
      swapElements(this.buttonContainerElement, this.promptContainerElement);
      this.activePrompt = null;
    }
  }

  updateForSelection(selection=window.getSelection()) {
    if (!selection.isCollapsed) {
      this.positionToContent(selection.getRangeAt(0));
      updateButtonsForSelection(this.buttons, selection);
    }
  }

  positionToContent(content) {
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
  }

  setDirection(direction) {
    this.direction = direction;
    if (direction === ToolbarDirection.RIGHT) {
      this.addClass('right');
    } else {
      this.removeClass('right');
    }
  }
}

Toolbar.Direction = ToolbarDirection;

export default Toolbar;
