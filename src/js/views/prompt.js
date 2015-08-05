import View from './view';
import { restoreRange } from '../utils/selection-utils';
import { createDiv, positionElementToRect } from '../utils/element-utils';
import Keycodes from '../utils/keycodes';

var container = document.body;
var hiliter = createDiv('ck-editor-hilite');

function positionHiliteRange(range) {
  var rect = range.getBoundingClientRect();
  var style = hiliter.style;
  style.width  = rect.width  + 'px';
  style.height = rect.height + 'px';
  positionElementToRect(hiliter, rect);
}

class Prompt extends View {
  constructor(options) {
    options.tagName = 'input';
    super(options);

    var prompt = this;

    prompt.command = options.command;
    prompt.element.placeholder = options.placeholder || '';
    this.addEventListener(prompt.element, 'click', (e) => {
      // prevents closing prompt when clicking input
      e.stopPropagation();
    });
    this.addEventListener(prompt.element, 'keyup', (e) => {
      const entry = prompt.element.value;

      if (entry && prompt.range && !e.shiftKey && e.which === Keycodes.ENTER) {
        restoreRange(prompt.range);
        this.command.exec(entry);
        if (this.onComplete) { this.onComplete(); }
      }
    });

    this.addEventListener(window, 'resize', () => {
      var activeHilite = hiliter.parentNode;
      var range = prompt.range;
      if(activeHilite && range) {
        positionHiliteRange(range);
      }
    });
  }

  show(callback) {
    var element = this.element;
    var selection = window.getSelection();
    var range = selection && selection.rangeCount && selection.getRangeAt(0);
    element.value = null;
    this.range = range || null;

    if (range) {
      container.appendChild(hiliter);
      positionHiliteRange(this.range);
      setTimeout(() => {
        // defer focus (disrupts mouseup events)
        element.focus();
      });
      if (callback) {
        this.onComplete = callback;
      }
    }
  }

  hide() {
    if (hiliter.parentNode) {
      container.removeChild(hiliter);
    }
  }
}

export default Prompt;
