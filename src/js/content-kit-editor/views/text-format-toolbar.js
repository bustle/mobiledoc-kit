import Toolbar from './toolbar';
import { inherit } from '../../content-kit-utils/object-utils';
import { selectionIsEditable, selectionIsInElement } from '../utils/selection-utils';
import { Keycodes } from '../constants';

function handleTextSelection(toolbar) {
  var selection = window.getSelection();
  if (selection.isCollapsed || !selectionIsEditable(selection) || selection.toString().trim() === '' || !selectionIsInElement(selection, toolbar.rootElement)) {
    toolbar.hide();
  } else {
    toolbar.show();
    toolbar.updateForSelection(selection);
  }
}

function TextFormatToolbar(options) {
  var toolbar = this;
  Toolbar.call(this, options);
  toolbar.rootElement = options.rootElement;
  toolbar.rootElement.addEventListener('keyup', function() { handleTextSelection(toolbar); });

  document.addEventListener('mouseup', function() {
    setTimeout(function() {
      handleTextSelection(toolbar);
    });
  });

  document.addEventListener('keyup', function(e) {
    if (e.keyCode === Keycodes.ESC) {
      toolbar.hide();
    }
  });

  window.addEventListener('resize', function() {
    if(toolbar.isShowing) {
      var activePromptRange = toolbar.activePrompt && toolbar.activePrompt.range;
      toolbar.positionToContent(activePromptRange ? activePromptRange : window.getSelection().getRangeAt(0));
    }
  });
}
inherit(TextFormatToolbar, Toolbar);

export default TextFormatToolbar;
