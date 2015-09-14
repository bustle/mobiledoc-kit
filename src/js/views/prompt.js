import View from './view';
import { restoreRange } from '../utils/selection-utils';
import { createDiv, positionElementToRect } from '../utils/element-utils';
import Key from '../utils/key';

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
    this.toolbar = options.toolbar;

    this.element.placeholder = options.placeholder || '';
    this.addEventListener(this.element, 'click', (e) => {
      // prevents closing prompt when clicking input
      e.stopPropagation();
    });
    this.addEventListener(this.element, 'keyup', (e) => {
      const key = Key.fromEvent(e);
      const entry = this.element.value;

      if (entry && this.range && !key.isShift() && key.isEnter()) {
        restoreRange(this.range);
        this.doComplete(entry);
      }
    });

    this.addEventListener(window, 'resize', () => {
      var activeHilite = hiliter.parentNode;
      var range = this.range;
      if(activeHilite && range) {
        positionHiliteRange(range);
      }
    });
  }

  doComplete(value) {
    this.hide();
    this.onComplete(value);
    this.toolbar.hide();
  }

  show(callback=() => {}) {
    const { toolbar } = this;
    toolbar.displayPrompt(this);

    this.onComplete = callback;
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
    }
  }

  hide() {
    if (hiliter.parentNode) {
      container.removeChild(hiliter);
    }
    this.toolbar.dismissPrompt();
  }
}

export default Prompt;
