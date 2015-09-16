import View from './view';
import Toolbar from './toolbar';
import { positionElementToLeftOf, positionElementCenteredIn } from '../utils/element-utils';

import UnorderedListCommand from '../commands/unordered-list';
import OrderedListCommand from '../commands/ordered-list';
import ImageCommand from '../commands/image';
import CardCommand from '../commands/card';

var LayoutStyle = {
  GUTTER   : 1,
  CENTERED : 2
};

function computeLayoutStyle(rootElement) {
  if (rootElement.getBoundingClientRect().left > 100) {
    return LayoutStyle.GUTTER;
  }
  return LayoutStyle.CENTERED;
}

class EmbedIntent extends View {
  constructor(options={}) {
    options.classNames = ['ck-embed-intent'];
    super(options);
    this.rootElement = options.rootElement;

    this.isActive = false;
    this.editor = options.editor;
    this.button = document.createElement('button');
    this.button.className = 'ck-embed-intent-btn';
    this.button.title = 'Insert image or embed...';
    this.element.appendChild(this.button);

    const commands = [
      new ImageCommand(),
      new CardCommand(),
      new UnorderedListCommand(this.editor),
      new OrderedListCommand(this.editor)
    ];

    this.addEventListener(this.button, 'click', (e) => {
      if (this.isActive) {
        this.deactivate();
      } else {
        this.activate();
      }
      e.stopPropagation();
    });

    this.toolbar = new Toolbar({
      container: this.element,
      embedIntent: this,
      editor: this.editor,
      commands: commands,
      direction: Toolbar.Direction.RIGHT
    });

    const embedIntentHandler = () => {
      const { editor } = this;
      if (this._isDestroyed || editor._isDestroyed) { return; }
      if (!editor.isEditable) { return; }

      let showElement;

      const { headSection } = this.editor.cursor.offsets;
      const headElement = headSection &&
        headSection.renderNode && headSection.renderNode.element;
      if (headElement && headSection.isBlank) {
        showElement = headElement;
      } else if (editor.post.isBlank) {
        showElement = editor.post.renderNode.element;
      }

      if (showElement) {
        this.showAt(showElement);
      } else {
        this.hide();
      }
    };

    this.addEventListener(this.rootElement, 'keyup', embedIntentHandler);
    this.addEventListener(document, 'click', () => {
      setTimeout(embedIntentHandler);
    });
    this.addEventListener(window, 'resize', () => { this.reposition(); });
  }

  hide() {
    if (super.hide()) { this.deactivate(); }
  }

  showAt(node) {
    this.atNode = node;
    this.show();
    this.deactivate();
    this.reposition();
  }

  reposition() {
    if (!this.isShowing) { return; }
    if (computeLayoutStyle(this.rootElement) === LayoutStyle.GUTTER) {
      positionElementToLeftOf(this.element, this.atNode);
    } else {
      positionElementCenteredIn(this.element, this.atNode);
    }
  }

  activate() {
    if (this.isActive) { return; }

    this.addClass('activated');
    this.toolbar.show();
    this.isActive = true;
  }

  deactivate() {
    if (!this.isActive) { return; }

    this.removeClass('activated');
    this.toolbar.hide();
    this.isActive = false;
  }

  destroy() {
    this.toolbar.destroy();
    super.destroy();
  }
}

export default EmbedIntent;
