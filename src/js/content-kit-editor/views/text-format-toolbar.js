import Toolbar from './toolbar';
import { inherit } from '../../content-kit-utils/object-utils';
import { selectionIsEditable, selectionIsInElement } from '../utils/selection-utils';
import { Keycodes } from '../constants';

function TextFormatToolbar(options) {
  var toolbar = this;
  Toolbar.call(this, options);
  toolbar.rootElement = options.rootElement;
  toolbar.rootElement.addEventListener('keyup', function() { toolbar.handleTextSelection(); });

  document.addEventListener('keyup', function(e) {
    if (e.keyCode === Keycodes.ESC) {
      toolbar.hide();
    }
  });

  document.addEventListener('mouseup', function() {
    setTimeout(function() { toolbar.handleTextSelection(); });
  });

  window.addEventListener('resize', function() {
    if(toolbar.isShowing) {
      var activePromptRange = toolbar.activePrompt && toolbar.activePrompt.range;
      toolbar.positionToContent(activePromptRange ? activePromptRange : window.getSelection().getRangeAt(0));
    }
  });
}
inherit(TextFormatToolbar, Toolbar);

TextFormatToolbar.prototype.handleTextSelection = function() {
  var toolbar = this;
  var selection = window.getSelection();
  if (selection.isCollapsed || !selectionIsEditable(selection) || selection.toString().trim() === '' || !selectionIsInElement(selection, toolbar.rootElement)) {
    toolbar.hide();
  } else {
    toolbar.updateForSelection(selection);
  }
};

export default TextFormatToolbar;
