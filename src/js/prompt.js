var Prompt = (function() {

  var container = document.body;
  var hiliter = createDiv('ck-editor-hilite');

  function Prompt(options) {
    if (options) {
      var prompt = this;
      var element = document.createElement('input');
      this.placeholder = options.placeholder;
      this.command = options.command;
      this.element = element;
      element.type = 'text';
      element.placeholder = this.placeholder;
      element.addEventListener('mouseup', function(e) { e.stopPropagation(); }); // prevents closing prompt when clicking input 
      element.addEventListener('keyup', function(e) {
        var entry = this.value;
        if(entry && !e.shiftKey && e.which === Keycodes.ENTER) {
          restoreRange(prompt.range);
          prompt.command.exec(entry);
          if (prompt.onComplete) { prompt.onComplete(); }
        }
      });
    }
  }

  Prompt.prototype = {
    display: function(callback) {
      this.range = window.getSelection().getRangeAt(0); // save the selection range
      hiliteRange(this.range);
      this.clear();
      var element = this.element;
      setTimeout(function(){ element.focus(); }); // defer focus (disrupts mouseup events)
      if (callback) { this.onComplete = callback; }
    },
    dismiss: function() {
      this.clear();
      unhiliteRange();
    },
    clear: function() {
      this.element.value = null;
    }
  };

  function hiliteRange(range) {
    var rangeBounds = range.getBoundingClientRect();
    var hiliterStyle = hiliter.style;
    var offset = getElementOffset(container);

    hiliterStyle.width  = rangeBounds.width + 'px';
    hiliterStyle.height = rangeBounds.height + 'px';
    hiliterStyle.left   = rangeBounds.left - offset.left + 'px';
    hiliterStyle.top    = rangeBounds.top + window.pageYOffset - offset.top + 'px';
    container.appendChild(hiliter);
  }

  function unhiliteRange() {
    container.removeChild(hiliter);
  }

  return Prompt;
}());
