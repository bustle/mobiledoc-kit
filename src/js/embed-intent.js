var EmbedIntent = (function() {

  var container = document.body;
  var className = 'ck-embed-intent-btn';

  function EmbedIntent(options) {
    var embedIntent = this;
    var element = document.createElement('button');
    var rootElement = options.rootElement;
    element.className = className;
    element.title = 'Insert image or embed...';
    element.addEventListener('mouseup', function(e) {
      if (embedIntent.isActive) {
        embedIntent.deactivate();
      } else {
        embedIntent.activate();
      }
      e.stopPropagation();
    });
    embedIntent.element = element;
    embedIntent.toolbar = new Toolbar({ commands: options.commands, direction: ToolbarDirection.RIGHT });
    embedIntent.isShowing = false;
    embedIntent.isActive = false;

    function embedIntentHandler(e) {
      if (!selectionIsInElement(window.getSelection(), rootElement)) {
        embedIntent.hide();
        return;
      }
      var currentNode = getCurrentSelectionRootNode();
      var currentNodeHTML = currentNode.innerHTML;
      if (currentNodeHTML === '' || currentNodeHTML === '<br>') {
        embedIntent.showAt(currentNode);
      } else {
        embedIntent.hide();
      }
      e.stopPropagation();
    }

    rootElement.addEventListener('keyup', embedIntentHandler);
    document.addEventListener('mouseup', function(e) { setTimeout(function() { embedIntentHandler(e); }); });

    document.addEventListener('keyup', function(e) {
      if (e.keyCode === Keycodes.ESC) {
        embedIntent.deactivate();
      }
    });

    window.addEventListener('resize', function() {
      if(embedIntent.isShowing) {
        positionElementToLeftOf(embedIntent.element, embedIntent.atNode);
      }
    });
  }

  EmbedIntent.prototype = {
    show: function() {
      if (!this.isShowing) {
        container.appendChild(this.element);
        this.isShowing = true;
      }
    },
    showAt: function(node) {
      this.show();
      this.atNode = node;
      positionElementToLeftOf(this.element, node);
    },
    hide: function() {
      if (this.isShowing) {
        container.removeChild(this.element);
        this.deactivate();
        this.isShowing = false;
      }
    },
    activate: function() {
      if (!this.isActive) {
        this.element.className = className + ' activated';
        this.toolbar.show();
        this.toolbar.positionToContent(this.element);
        this.isActive = true;
      }
    },
    deactivate: function() {
      if (this.isActive) {
        this.element.className = className;
        this.toolbar.hide();
        this.isActive = false;
      }
    }
  };

  return EmbedIntent;
}());
