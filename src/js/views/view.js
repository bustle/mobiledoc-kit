import mixin from '../utils/mixin';
import EventListenerMixin from '../utils/event-listener';

function renderClasses(view) {
  var classNames = view.classNames;
  if (classNames && classNames.length) {
    view.element.className = classNames.join(' ');
  } else if(view.element.className) {
    view.element.removeAttribute('className');
  }
}

class View {
  constructor(options={}) {
    this.tagName = options.tagName || 'div';
    this.classNames = options.classNames || [];
    this.element = document.createElement(this.tagName);
    this.container = options.container || document.body;
    this.isShowing = false;
    renderClasses(this);
  }

  show() {
    var view = this;
    if(!view.isShowing) {
      view.container.appendChild(view.element);
      view.isShowing = true;
      return true;
    }
  }

  hide() {
    if (this.isShowing) {
      this.container.removeChild(this.element);
      this.isShowing = false;
      return true;
    }
  }

  addClass(className) {
    var index = this.classNames && this.classNames.indexOf(className);
    if (index === -1) {
      this.classNames.push(className);
      renderClasses(this);
    }
  }

  removeClass(className) {
    var index = this.classNames && this.classNames.indexOf(className);
    if (index > -1) {
      this.classNames.splice(index, 1);
      renderClasses(this);
    }
  }

  setClasses(classNameArr) {
    this.classNames = classNameArr;
    renderClasses(this);
  }

  destroy() {
    this.removeAllEventListeners();
    this.hide();
    this._isDestroyed = true;
  }
}

mixin(View, EventListenerMixin);

export default View;
