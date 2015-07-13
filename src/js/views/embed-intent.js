import View from './view';
import Toolbar from './toolbar';
import { inherit } from 'content-kit-utils';
import { getSelectionBlockElement } from '../utils/selection-utils';
import { elementContentIsEmpty, positionElementToLeftOf, positionElementCenteredIn } from '../utils/element-utils';
import { createDiv } from '../utils/element-utils';
import Keycodes from '../utils/keycodes';

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

function EmbedIntent(options) {
  var embedIntent = this;
  var rootElement = embedIntent.rootElement = options.rootElement;
  options.classNames = ['ck-embed-intent'];
  View.call(embedIntent, options);

  embedIntent.isActive = false;
  embedIntent.editorContext = options.editorContext;
  embedIntent.loadingIndicator = createDiv('ck-embed-loading');
  embedIntent.button = document.createElement('button');
  embedIntent.button.className = 'ck-embed-intent-btn';
  embedIntent.button.title = 'Insert image or embed...';
  embedIntent.element.appendChild(embedIntent.button);

  this.addEventListener(embedIntent.button, 'mouseup', (e) => {
    if (embedIntent.isActive) {
      embedIntent.deactivate();
    } else {
      embedIntent.activate();
    }
    e.stopPropagation();
  });

  embedIntent.toolbar = new Toolbar({
    container: embedIntent.element,
    embedIntent: embedIntent,
    editor: embedIntent.editorContext,
    commands: options.commands,
    direction: Toolbar.Direction.RIGHT
  });

  function embedIntentHandler() {
    var blockElement = getSelectionBlockElement();
    if (blockElement && elementContentIsEmpty(blockElement)) {
      embedIntent.showAt(blockElement);
    } else {
      embedIntent.hide();
    }
  }

  this.addEventListener(rootElement, 'keyup', embedIntentHandler);
  this.addEventListener(document, 'mouseup', () => {
    setTimeout(() => {
      embedIntentHandler();
    });
  });

  this.addEventListener(document, 'keyup', (e) => {
    if (e.keyCode === Keycodes.ESC) {
      embedIntent.hide();
    }
  });

  this.addEventListener(window, 'resize', () => {
    if(embedIntent.isShowing) {
      embedIntent.reposition();
    }
  });
}
inherit(EmbedIntent, View);

EmbedIntent.prototype.hide = function() {
  if (EmbedIntent._super.prototype.hide.call(this)) {
    this.deactivate();
  }
};

EmbedIntent.prototype.showAt = function(node) {
  this.atNode = node;
  this.show();
  this.deactivate();
  this.reposition();
};

EmbedIntent.prototype.reposition = function() {
  if (computeLayoutStyle(this.rootElement) === LayoutStyle.GUTTER) {
    positionElementToLeftOf(this.element, this.atNode);
  } else {
    positionElementCenteredIn(this.element, this.atNode);
  }
};

EmbedIntent.prototype.activate = function() {
  if (!this.isActive) {
    this.addClass('activated');
    this.toolbar.show();
    this.isActive = true;
  }
};

EmbedIntent.prototype.deactivate = function() {
  if (this.isActive) {
    this.removeClass('activated');
    this.toolbar.hide();
    this.isActive = false;
  }
};

EmbedIntent.prototype.showLoading = function() {
  var embedIntent = this;
  var loadingIndicator = embedIntent.loadingIndicator;
  embedIntent.hide();
  embedIntent.atNode.appendChild(loadingIndicator);
};

EmbedIntent.prototype.hideLoading = function() {
  this.atNode.removeChild(this.loadingIndicator);
};

export default EmbedIntent;
