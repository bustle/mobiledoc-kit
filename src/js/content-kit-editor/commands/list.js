import TextFormatCommand from './text-format';
import { inherit } from '../../content-kit-utils/object-utils';
import { getSelectionBlockElement, selectNode } from '../utils/selection-utils';

function ListCommand(options) {
  TextFormatCommand.call(this, options);
}
inherit(ListCommand, TextFormatCommand);

ListCommand.prototype.exec = function() {
  ListCommand._super.prototype.exec.call(this);
  
  // After creation, lists need to be unwrapped from the default formatter P tag
  var listElement = getSelectionBlockElement();
  var wrapperNode = listElement.parentNode;
  if (wrapperNode.firstChild === listElement) {
    var editorNode = wrapperNode.parentNode;
    editorNode.insertBefore(listElement, wrapperNode);
    editorNode.removeChild(wrapperNode);
    selectNode(listElement);
  }
};

export default ListCommand;
