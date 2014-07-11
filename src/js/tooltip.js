var Tooltip = (function() {

  var container = document.body;

  function Tooltip() {
    var tooltip = this;
    tooltip.element = createDiv('ck-tooltip');
    tooltip.isShowing = false;
  }

  Tooltip.prototype = {
    showMessage: function(message, element) {
      var tooltip = this;
      var tooltipElement = tooltip.element;
      var elementRect = element.getBoundingClientRect();

      tooltipElement.innerHTML = message;
      if (!tooltip.isShowing) {
        container.appendChild(tooltipElement);
        tooltip.isShowing = true;
      }

      tooltipElement.style.left = parseInt(elementRect.left + (element.offsetWidth / 2) - (tooltipElement.offsetWidth / 2), 10) + 'px';
      tooltipElement.style.top  = parseInt(window.pageYOffset + elementRect.top + element.offsetHeight + 2, 10) + 'px';
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
