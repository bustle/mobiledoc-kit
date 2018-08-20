import { endsWith } from 'mobiledoc-kit/utils/string-utils';
import assert from 'mobiledoc-kit/utils/assert';
import deprecate from 'mobiledoc-kit/utils/deprecate';
import { ENTER } from 'mobiledoc-kit/utils/characters';

class TextInputHandler {
  constructor(editor) {
    this.editor = editor;
    this._handlers = [];
  }

  register(handler) {
    assert(`Input Handler is not valid`, this._validateHandler(handler));
    this._handlers.push(handler);
  }

  unregister(name) {
    let handlers = this._handlers;
    for (let i=0; i<handlers.length; i++) {
      if (handlers[i].name === name) {
        handlers.splice(i, 1);
      }
    }
  }

  handle(string) {
    let { editor } = this;

    editor.insertText(string);

    let matchedHandler = this._findHandler();
    if (matchedHandler) {
      let [ handler, matches ] = matchedHandler;
      handler.run(editor, matches);
    }
  }

  handleNewLine() {
    let { editor } = this;

    let matchedHandler = this._findHandler(ENTER);
    if (matchedHandler) {
      let [ handler, matches ] = matchedHandler;
      handler.run(editor, matches);
    }
  }

  _findHandler(string = "") {
    let { editor: { range: { head, head: { section } } } } = this;
    let preText = section.textUntil(head) + string;

    for (let i=0; i < this._handlers.length; i++) {
      let handler = this._handlers[i];
      let {text, match} = handler;

      if (text && endsWith(preText, text)) {
        return [handler, [text]];
      } else if (match && match.test(preText)) {
        return [handler, match.exec(preText)];
      }
    }
  }

  _validateHandler(handler) {
    deprecate('Registered input handlers require a "name" property so that they can be unregistered', !!handler.name);
    return !!handler.run &&                        // has `run`
           (!!handler.text || !!handler.match) &&  // and `text` or `match`
           !(!!handler.text && !!handler.match);   // not both `text` and `match`
  }

  destroy() {
    this._handlers = [];
  }
}

export default TextInputHandler;
