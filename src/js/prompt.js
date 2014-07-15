var Prompt = (function() {

  var container = document.body;
  var hiliter = createDiv('ck-editor-hilite');

  function Prompt(options) {
    if (options) {
      var prompt = this;
      var element = document.createElement('input');
      prompt.command = options.command;
      prompt.element = element;
      element.type = 'text';
      element.placeholder = options.placeholder || '';
      element.addEventListener('mouseup', function(e) { e.stopPropagation(); }); // prevents closing prompt when clicking input 
      element.addEventListener('keyup', function(e) {
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
  }

  Prompt.prototype = {
    display: function(callback) {
      var prompt = this;
      var element = prompt.element;
      prompt.range = window.getSelection().getRangeAt(0); // save the selection range
      container.appendChild(hiliter);
      positionHiliteRange(prompt.range);
      prompt.clear();
      setTimeout(function(){ element.focus(); }); // defer focus (disrupts mouseup events)
      if (callback) { prompt.onComplete = callback; }
    },
    dismiss: function() {
      this.clear();
      container.removeChild(hiliter);
    },
    clear: function() {
      this.element.value = null;
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
