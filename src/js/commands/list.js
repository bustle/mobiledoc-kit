import TextFormatCommand from './text-format';
import { getSelectionBlockElement, selectNode, getSelectionTagName } from '../utils/selection-utils';
import { inherit } from 'node_modules/content-kit-utils/src/object-utils';
import Type from 'node_modules/content-kit-compiler/src/types/type';

function ListCommand(options) {
  TextFormatCommand.call(this, options);
}
inherit(ListCommand, TextFormatCommand);

ListCommand.prototype.exec = function() {
  ListCommand._super.prototype.exec.call(this);
  
  // After creation, lists need to be unwrapped
  // TODO: eventually can remove this when direct model manipulation is ready
  var listElement = getSelectionBlockElement();
  var wrapperNode = listElement.parentNode;
  if (wrapperNode.firstChild === listElement) {
    var editorNode = wrapperNode.parentNode;
    editorNode.insertBefore(listElement, wrapperNode);
    editorNode.removeChild(wrapperNode);
    selectNode(listElement);
  }
};

ListCommand.prototype.checkAutoFormat = function(node) {
  // Creates unordered lists when node starts with '- '
  // or ordered list if node starts with '1. '
  var regex = this.autoFormatRegex, text;
  if (node && regex) {
    text = node.textContent;
    if (Type.LIST_ITEM.tag !== getSelectionTagName() && regex.test(text)) {
      this.exec();
      window.getSelection().anchorNode.textContent = text.replace(regex, '');
      return true;
    }
  }
  return false;
};

export default ListCommand;
