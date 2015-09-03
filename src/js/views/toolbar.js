import View from './view';
import Prompt from './prompt';
import ToolbarButton from './toolbar-button';
import { createDiv, swapElements, positionElementToRightOf, positionElementCenteredAbove } from '../utils/element-utils';

var ToolbarDirection = {
  TOP   : 1,
  RIGHT : 2
};

class Toolbar extends View {
  constructor(options={}) {
    options.classNames = ['ck-toolbar'];
    super(options);

    this.prompt = new Prompt({toolbar:this});

    this.setDirection(options.direction || ToolbarDirection.TOP);
    this.editor = options.editor || null;
    this.embedIntent = options.embedIntent || null;
    this.buttons = [];

    this.contentElement = createDiv('ck-toolbar-content');
    this.promptContainerElement = createDiv('ck-toolbar-prompt');
    this.buttonContainerElement = createDiv('ck-toolbar-buttons');
    this.contentElement.appendChild(this.promptContainerElement);
    this.contentElement.appendChild(this.buttonContainerElement);
    this.element.appendChild(this.contentElement);

    (options.buttons || []).forEach(b => this.addButton(b));
    (options.commands || []).forEach(c => this.addCommand(c));

    // Closes prompt if displayed when changing selection
    this.addEventListener(document, 'click', () => {
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
    command.editor = this.editor;
    command.embedIntent = this.embedIntent;
    this.addButton(new ToolbarButton({command: command, toolbar: this}));
  }

  addButton(button) {
    button.toolbar = this;
    this.buttons.push(button);
    this.buttonContainerElement.appendChild(button.element);
  }

  displayPrompt(prompt) {
    swapElements(this.promptContainerElement, this.buttonContainerElement);
    this.promptContainerElement.appendChild(prompt.element);
  }

  dismissPrompt() {
    swapElements(this.buttonContainerElement, this.promptContainerElement);
    this.updateForSelection();
  }

  updateForSelection() {
    if (!this.isShowing) { return; }
    const selection = window.getSelection(),
          range     = selection && selection.getRangeAt(0);
    if (!range.collapsed) {
      this.positionToContent(range);
    }
  }

  positionToContent(content=window.getSelection().getRangeAt(0)) {
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

  destroy() {
    this.buttons.forEach(b => b.destroy());
    this.prompt.destroy();
    super.destroy();
  }
}

Toolbar.Direction = ToolbarDirection;

export default Toolbar;
