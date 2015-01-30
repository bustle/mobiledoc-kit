import View from './view';
import { inherit } from 'node_modules/content-kit-utils/src/object-utils';
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

function Prompt(options) {
  var prompt = this;
  options.tagName = 'input';
  View.call(prompt, options);

  prompt.command = options.command;
  prompt.element.placeholder = options.placeholder || '';
  prompt.element.addEventListener('mouseup', function(e) { e.stopPropagation(); }); // prevents closing prompt when clicking input 
  prompt.element.addEventListener('keyup', function(e) {
    var entry = this.value;
    if(entry && prompt.range && !e.shiftKey && e.which === Keycodes.ENTER) {
      restoreRange(prompt.range);
      prompt.command.exec(entry);
      if (prompt.onComplete) { prompt.onComplete(); }
    }
  });

  window.addEventListener('resize', function() {
    var activeHilite = hiliter.parentNode;
    var range = prompt.range;
    if(activeHilite && range) {
      positionHiliteRange(range);
    }
  });
}
inherit(Prompt, View);

Prompt.prototype.show = function(callback) {
  var prompt = this;
  var element = prompt.element;
  var selection = window.getSelection();
  var range = selection && selection.rangeCount && selection.getRangeAt(0);
  element.value = null;
  prompt.range = range || null;
  if (range) {
    container.appendChild(hiliter);
    positionHiliteRange(prompt.range);
    setTimeout(function(){ element.focus(); }); // defer focus (disrupts mouseup events)
    if (callback) { prompt.onComplete = callback; }
  }
};

Prompt.prototype.hide = function() {
  if (hiliter.parentNode) {
    container.removeChild(hiliter);
  }
};

export default Prompt;
