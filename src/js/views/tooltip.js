import View from './view';
import { toggleLink } from '../editor/ui'
import {
  positionElementCenteredBelow,
  getEventTargetMatchingTag,
  whenElementIsNotInDOM
} from '../utils/element-utils';

const DELAY = 200;
const EDIT_LINK_CLASSNAME = '__mobiledoc-tooltip__edit-link';

export default class Tooltip extends View {
  constructor(options) {
    let { rootElement, editor } = options;
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

    this.addEventListener(this.element, 'click', (e) => {
      let target = e.target;
      if (target.classList.contains(EDIT_LINK_CLASSNAME)) {
        e.preventDefault();
        editor.selectNode(this.linkElement);
        console.log(editor.range.head.offset, editor.range.tail.offset, '(', editor.cursor.offsets.head.offset, editor.cursor.offsets.tail.offset ,')')
        editor.run(() => {})
        console.log(editor.range.head.offset, editor.range.tail.offset, '(', editor.cursor.offsets.head.offset, editor.cursor.offsets.tail.offset ,')')
        // editor.run(postEditor => postEditor.setRange(editor.range));
        toggleLink(editor);
      }
    });
  }

  showMessage(message, element) {
    let tooltipElement = this.element;
    tooltipElement.innerHTML = message;
    this.show();
    positionElementCenteredBelow(tooltipElement, element);
  }

  showLink(url, element) {
    this.linkUrl = url;
    this.linkElement = element;
    let message = `<a href="${url}" target="_blank" class="__mobiledoc-tooltip__link-url">${url}</a><button class="${EDIT_LINK_CLASSNAME}">Edit</button>`;
    this.showMessage(message, element);
    this.elementObserver = whenElementIsNotInDOM(element, () => this.hide());
  }
}
