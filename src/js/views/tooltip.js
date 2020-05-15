import View from './view';
import {
  positionElementCenteredBelow,
  getEventTargetMatchingTag,
  whenElementIsNotInDOM
} from '../utils/element-utils';
import Position from '../utils/cursor/position';
import { editLink } from '../editor/ui';

const SHOW_DELAY = 200;
const HIDE_DELAY = 1000;

export default class Tooltip extends View {
  constructor(options) {
    options.classNames = ['__mobiledoc-tooltip'];
    super(options);

    this.rootElement = options.rootElement;
    this.editor = options.editor;

    this.addListeners(options);
  }

  showLink(linkEl) {
    const { editor, element: tooltipEl } = this;
    const { tooltipPlugin } = editor;

    tooltipPlugin.renderLink(tooltipEl, linkEl, {
      editLink: () => {
        editLink(linkEl, editor);
        this.hide();
      }
    });

    this.show();
    positionElementCenteredBelow(this.element, linkEl);

    this.elementObserver = whenElementIsNotInDOM(linkEl, () => this.hide());
  }

  addListeners(options) {
    const { rootElement, element: tooltipElement } = this;
    let showTimeout, hideTimeout;

    const scheduleHide = () => {
      clearTimeout(hideTimeout);
      hideTimeout = setTimeout(() => {
        this.hide();
      }, HIDE_DELAY);
    };

    this.addEventListener(tooltipElement, 'mouseenter', e => {
      clearTimeout(hideTimeout);
    });

    this.addEventListener(tooltipElement, 'mouseleave', e => {
      scheduleHide();
    });

    this.addEventListener(rootElement, 'mouseover', (e) => {
      let target = getEventTargetMatchingTag(options.showForTag, e.target, rootElement);

      if (target && target.isContentEditable) {
        clearTimeout(hideTimeout);
        showTimeout = setTimeout(() => {
          this.showLink(target);
        }, SHOW_DELAY);
      }
    });

    this.addEventListener(rootElement, 'mouseout', (e) => {
      clearTimeout(showTimeout);
      if (this.elementObserver) { this.elementObserver.cancel(); }
      scheduleHide();
    });
  }
}

export const DEFAULT_TOOLTIP_PLUGIN = {
  renderLink(tooltipEl, linkEl, { editLink }) {
    const { href } = linkEl;
    tooltipEl.innerHTML = `<a href="${href}" target="_blank">${href}</a>`;
    const button = document.createElement('button');
    button.classList.add('__mobiledoc-tooltip__edit-link')
    button.innerText = 'Edit Link';
    button.addEventListener('click', editLink);
    tooltipEl.append(button);
  }
};
