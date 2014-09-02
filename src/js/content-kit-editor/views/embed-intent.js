import View from './view';
import Toolbar from './toolbar';
import { inherit } from '../../content-kit-utils/object-utils';
import { getSelectionBlockElement } from '../utils/selection-utils';
import { elementContentIsEmpty, positionElementToLeftOf, positionElementCenteredIn } from '../utils/element-utils';
import { ToolbarDirection, Keycodes } from '../constants';
import { createDiv } from '../utils/element-utils';

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
  options.tagName = 'button';
  options.classNames = ['ck-embed-intent-btn'];
  View.call(embedIntent, options);

  embedIntent.editorContext = options.editorContext;
  embedIntent.loadingIndicator = createDiv('ck-embed-loading');
  embedIntent.element.title = 'Insert image or embed...';
  embedIntent.element.addEventListener('mouseup', function(e) {
    if (embedIntent.isActive) {
      embedIntent.deactivate();
    } else {
      embedIntent.activate();
    }
    e.stopPropagation();
  });

  embedIntent.toolbar = new Toolbar({ embedIntent: embedIntent, editor: embedIntent.editorContext, commands: options.commands, direction: ToolbarDirection.RIGHT });
  embedIntent.isActive = false;

  function embedIntentHandler() {
    var blockElement = getSelectionBlockElement();
    if (blockElement && elementContentIsEmpty(blockElement)) {
      embedIntent.showAt(blockElement);
    } else {
      embedIntent.hide();
    }
  }

  rootElement.addEventListener('keyup', embedIntentHandler);
  document.addEventListener('mouseup', function() {
    setTimeout(function() { embedIntentHandler(); });
  });

  document.addEventListener('keyup', function(e) {
    if (e.keyCode === Keycodes.ESC) {
      embedIntent.hide();
    }
  });

  window.addEventListener('resize', function() {
    if(embedIntent.isShowing) {
      embedIntent.reposition();
      if (embedIntent.toolbar.isShowing) {
        embedIntent.toolbar.positionToContent(embedIntent.element);
      }
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
    this.toolbar.positionToContent(this.element);
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
  embedIntent.container.appendChild(loadingIndicator);
  positionElementCenteredIn(loadingIndicator, embedIntent.atNode);
};

EmbedIntent.prototype.hideLoading = function() {
  this.container.removeChild(this.loadingIndicator);
};

export default EmbedIntent;
