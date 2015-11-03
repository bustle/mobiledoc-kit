import mixin from '../utils/mixin';
import EventListenerMixin from '../utils/event-listener';
import { addClassName } from '../utils/dom-utils';

class View {
  constructor(options={}) {
    options.tagName   = options.tagName   || 'div';
    options.container = options.container || document.body;

    this.element = document.createElement(options.tagName);
    this.container = options.container;
    this.isShowing = false;

    let classNames = options.classNames || [];
    classNames.forEach(name => addClassName(this.element, name));
  }

  show() {
    if(!this.isShowing) {
      this.container.appendChild(this.element);
      this.isShowing = true;
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

  destroy() {
    this.removeAllEventListeners();
    this.hide();
    this._isDestroyed = true;
  }
}

mixin(View, EventListenerMixin);

export default View;
