import Editor from './editor';
import { TextFormatCommands, EmbedCommands } from '../commands/commands';
import { merge } from '../../content-kit-utils/object-utils';

var defaults = {
  placeholder: 'Write here...',
  spellcheck: true,
  autofocus: true,
  textFormatCommands: TextFormatCommands.all,
  embedCommands: EmbedCommands.all
};

/**
 * Publically expose this class which sets up indiviual `Editor` classes
 * depending if user passes string selector, Node, or NodeList
 */
function EditorFactory(element, options) {
  var editors = [];
  var elements, elementsLen, i;

  if (typeof element === 'string') {
    elements = document.querySelectorAll(element);
  } else if (element && element.length) {
    elements = element;
  } else if (element) {
    elements = [element];
  }

  if (elements) {
    options = merge(defaults, options);
    elementsLen = elements.length;
    for (i = 0; i < elementsLen; i++) {
      editors.push(new Editor(elements[i], options));
    }
  }

  return editors.length > 1 ? editors : editors[0];
}

export default EditorFactory;
