import Editor from './editor';
import { doc } from 'content-kit-compiler';

/**
 * @class EditorFactory
 * @private
 * `EditorFactory` is publically exposed as `Editor`
 * It takes an `element` param which can be a css selector, Node, or NodeList
 * and sets up indiviual `Editor` instances
 */
function EditorFactory(element, options) {
  var editors = [];
  var elements, elementsLen, i;

  if (!element) {
    return new Editor(element, options);
  }

  if (typeof element === 'string') {
    elements = doc.querySelectorAll(element);
  } else if (element && element.length) {
    elements = element;
  } else if (element) {
    elements = [element];
  }

  if (elements) {
    elementsLen = elements.length;
    for (i = 0; i < elementsLen; i++) {
      editors.push(new Editor(elements[i], options));
    }
  }

  return editors.length > 1 ? editors : editors[0];
}

EditorFactory.prototype = Editor.prototype;

export default EditorFactory;
