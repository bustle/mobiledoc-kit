import Toolbar from './toolbar';
import { inherit } from 'content-kit-utils';
import { selectionIsEditable, selectionIsInElement } from '../utils/selection-utils';
import Keycodes from '../utils/keycodes';

function selectionIsEditableByToolbar(selection, toolbar) {
  return selectionIsEditable(selection) && selectionIsInElement(selection, toolbar.rootElement);
}

function handleTextSelection(toolbar) {
  var selection = window.getSelection();
  if (toolbar.sticky) {
    toolbar.updateForSelection(selectionIsEditableByToolbar(selection, toolbar) ? selection : null);
  } else {
    if (selection.isCollapsed || selection.toString().trim() === '' || !selectionIsEditableByToolbar(selection, toolbar)) {
      toolbar.hide();
    } else {
      toolbar.show();
      toolbar.updateForSelection(selection);
    }
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
    var key = e.keyCode;
    if (key === 116) { //F5
      toolbar.toggleSticky();
      handleTextSelection(toolbar);
    } else if (!toolbar.sticky && key === Keycodes.ESC) {
      toolbar.hide();
    }
  });

  window.addEventListener('resize', function() {
    if(!toolbar.sticky && toolbar.isShowing) {
      var activePromptRange = toolbar.activePrompt && toolbar.activePrompt.range;
      toolbar.positionToContent(activePromptRange ? activePromptRange : window.getSelection().getRangeAt(0));
    }
  });
}
inherit(TextFormatToolbar, Toolbar);

export default TextFormatToolbar;
