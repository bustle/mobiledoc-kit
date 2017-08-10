import View from './view';
import {
  positionElementCenteredBelow,
  getEventTargetMatchingTag,
  whenElementIsNotInDOM
} from '../utils/element-utils';

const DELAY = 200;

export default class Tooltip extends View {
  constructor(options) {
    let { rootElement } = options;
    let timeout;
    options.classNames = ['__mobiledoc-tooltip'];
    super(options);

    this.addEventListener(rootElement, 'mouseover', (e) => {
      let target = getEventTargetMatchingTag(options.showForTag, e.target, rootElement);
      if (target && target.isContentEditable) {
        timeout = setTimeout(() => {
          this.showLink(target.href, target);
        }, DELAY);
      }
    });
    
    this.addEventListener(rootElement, 'mouseout', (e) => {
      clearTimeout(timeout);
      if (this.elementObserver) { this.elementObserver.cancel(); }
      let toElement = e.toElement || e.relatedTarget;
      if (toElement && toElement.className !== this.element.className) {
        this.hide();
      }
    });
  }

  showMessage(message, element) {
    let tooltipElement = this.element;
    tooltipElement.innerHTML = message;
    this.show();
    positionElementCenteredBelow(tooltipElement, element);
  }

  showLink(link, element) {
    let message = `<a href="${link}" target="_blank">${link}</a>`;
    this.showMessage(message, element);
    this.elementObserver = whenElementIsNotInDOM(element, () => this.hide());
  }
}
