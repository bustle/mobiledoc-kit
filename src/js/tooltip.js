var Tooltip = (function() {

  var container = document.body;
  var className = 'ck-tooltip';
  var delay = 200;

  function Tooltip(options) {
    var tooltip = this;
    var rootElement = options.rootElement;
    var timeout;

    tooltip.element = createDiv(className);
    tooltip.isShowing = false;

    rootElement.addEventListener('mouseover', function(e) {
      var target = getEventTargetMatchingTag(options.showForTag, e.target, rootElement);
      if (target) {
        timeout = setTimeout(function() {
          tooltip.showLink(target.href, target);
        }, delay);
      }
    });
    
    rootElement.addEventListener('mouseout', function(e) {
      clearTimeout(timeout);
      var toElement = e.toElement || e.relatedTarget;
      if (toElement && toElement.className !== className) {
        tooltip.hide();
      }
    });
  }

  Tooltip.prototype = {
    showMessage: function(message, element) {
      var tooltip = this;
      var tooltipElement = tooltip.element;

      tooltipElement.innerHTML = message;
      if (!tooltip.isShowing) {
        container.appendChild(tooltipElement);
        tooltip.isShowing = true;
      }
      positionElementCenteredBelow(tooltipElement, element);
    },
    showLink: function(link, element) {
      var message = '<a href="' + link + '" target="_blank">' + link + '</a>';
      this.showMessage(message, element);
    },
    hide: function() {
      var tooltip = this;
      if (tooltip.isShowing) {
        container.removeChild(tooltip.element);
        tooltip.isShowing = false;
      }
    }
  };

  return Tooltip;
}());
