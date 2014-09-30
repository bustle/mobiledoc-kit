function renderClasses(view) {
  var classNames = view.classNames;
  if (classNames && classNames.length) {
    view.element.className = classNames.join(' ');
  } else if(view.element.className) {
    view.element.removeAttribute('className');
  }
}

function View(options) {
  this.tagName = options.tagName || 'div';
  this.classNames = options.classNames || [];
  this.element = document.createElement(this.tagName);
  this.container = options.container || document.body;
  this.isShowing = false;
  renderClasses(this);
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
  addClass: function(className) {
    var index = this.classNames && this.classNames.indexOf(className);
    if (index === -1) {
      this.classNames.push(className);
      renderClasses(this);
    }
  },
  removeClass: function(className) {
    var index = this.classNames && this.classNames.indexOf(className);
    if (index > -1) {
      this.classNames.splice(index, 1);
      renderClasses(this);
    }
  },
  setClasses: function(classNameArr) {
    this.classNames = classNameArr;
    renderClasses(this);
  }
};

export default View;
