function View(options) {
  this.tagName = options.tagName || 'div';
  this.classNames = options.classNames || [];
  this.element = document.createElement(this.tagName);
  this.element.className = this.classNames.join(' ');
  this.container = options.container || document.body;
  this.isShowing = false;
}

View.prototype = {
  show: function() {
    var view = this;
    if(!view.isShowing) {
      view.container.appendChild(view.element);
      view.isShowing = true;
      return true;
    }
  },
  hide: function() {
    var view = this;
    if(view.isShowing) {
      view.container.removeChild(view.element);
      view.isShowing = false;
      return true;
    }
  },
  focus: function() {
    this.element.focus();
  },
  addClass: function(className) {
    this.classNames.push(className);
    this.element.className = this.classNames.join(' ');
  },
  removeClass: function(className) {
    this.classNames.splice(this.classNames.indexOf(className), 1);
    this.element.className = this.classNames.join(' ');
  }
};

export default View;
