function renderClasses(view) {
  var classNames = view.classNames;
  view.element.className = classNames && classNames.length ? classNames.join(' ') : '';
}

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
    var index = this.classNames.indexOf(className);
    if (index === -1) {
      this.classNames.push(className);
      renderClasses(this);
    }
  },
  removeClass: function(className) {
    var index = this.classNames.indexOf(className);
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
