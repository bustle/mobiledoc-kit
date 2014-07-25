var Prompt = (function() {

  var container = document.body;
  var hiliter = createDiv('ck-editor-hilite');

  function Prompt(options) {
    var prompt = this;
    options.tagName = 'input';
    View.call(prompt, options);

    prompt.command = options.command;
    prompt.element.placeholder = options.placeholder || '';
    prompt.element.addEventListener('mouseup', function(e) { e.stopPropagation(); }); // prevents closing prompt when clicking input 
    prompt.element.addEventListener('keyup', function(e) {
      var entry = this.value;
      if(entry && !e.shiftKey && e.which === Keycodes.ENTER) {
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
  inherits(Prompt, View);

  Prompt.prototype = {
    show: function(callback) {
      var prompt = this;
      var element = prompt.element;
      element.value = null;
      prompt.range = window.getSelection().getRangeAt(0); // save the selection range
      container.appendChild(hiliter);
      positionHiliteRange(prompt.range);
      setTimeout(function(){ element.focus(); }); // defer focus (disrupts mouseup events)
      if (callback) { prompt.onComplete = callback; }
    },
    hide: function() {
      container.removeChild(hiliter);
    }
  };

  function positionHiliteRange(range) {
    var rect = range.getBoundingClientRect();
    var style = hiliter.style;
    style.width  = rect.width  + 'px';
    style.height = rect.height + 'px';
    positionElementToRect(hiliter, rect);
  }

  return Prompt;
}());
