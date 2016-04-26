import assert from 'mobiledoc-kit/utils/assert';
import {
  parsePostFromPaste,
  setClipboardData,
  parsePostFromDrop
} from 'mobiledoc-kit/utils/parse-utils';
import Range from 'mobiledoc-kit/utils/cursor/range';
import { filter, forEach, contains } from 'mobiledoc-kit/utils/array-utils';
import Key from 'mobiledoc-kit/utils/key';
import { TAB } from 'mobiledoc-kit/utils/characters';
import TextInputHandler from 'mobiledoc-kit/editor/text-input-handler';

const ELEMENT_EVENT_TYPES = [
  'keydown', 'keyup', 'cut', 'copy', 'paste', 'keypress', 'drop'
];
const DOCUMENT_EVENT_TYPES = ['mouseup'];

export default class EventManager {
  constructor(editor) {
    this.editor = editor;
    this.logger = editor.loggerFor('event-manager');
    this._textInputHandler = new TextInputHandler(editor);
    this._listeners = [];
    this.isShift = false;
  }

  init() {
    let { editor: { element } } = this;
    assert(`Cannot init EventManager without element`, !!element);

    ELEMENT_EVENT_TYPES.forEach(type => {
      this._addListener(element, type);
    });

    DOCUMENT_EVENT_TYPES.forEach(type => {
      this._addListener(document, type);
    });
  }

  registerInputHandler(inputHandler) {
    this._textInputHandler.register(inputHandler);
  }

  _addListener(context, type) {
    assert(`Missing listener for ${type}`, !!this[type]);

    let listener = (event) => this._handleEvent(type, event);
    context.addEventListener(type, listener);
    this._listeners.push([context, type, listener]);
  }

  _removeListeners() {
    this._listeners.forEach(([context, type, listener]) => {
      context.removeEventListener(type, listener);
    });
  }

  // This is primarily useful for programmatically simulating events on the
  // editor from the tests.
  _trigger(context, type, event) {
    forEach(
      filter(this._listeners, ([_context, _type]) => {
        return _context === context && _type === type;
      }),
      ([context, type, listener]) => {
        listener.call(context, event);
      }
    );
  }

  destroy() {
    this._textInputHandler.destroy();
    this._removeListeners();
    this._listeners = [];
  }

  _handleEvent(type, event) {
    let { editor } = this;

    if (contains(ELEMENT_EVENT_TYPES, type)) {
      let {target: element} = event;
      if (!editor.cursor.isAddressable(element)) {
        // abort handling this event
        return true;
      }
    }

    this[type](event);
  }

  keypress(event) {
    let { editor, _textInputHandler } = this;
    if (!editor.hasCursor()) { return; }

    let key = Key.fromEvent(event);
    if (!key.isPrintable()) {
      return;
    } else {
      event.preventDefault();
    }

    _textInputHandler.handle(key.toString());
  }

  keydown(event) {
    let { editor } = this;
    if (!editor.hasCursor()) { return; }
    if (!editor.isEditable) { return; }

    let key = Key.fromEvent(event);
    if (key.isShiftKey()) {
      this.isShift = true;
    }

    if (editor.handleKeyCommand(event)) { return; }

    if (editor.post.isBlank) {
      editor._insertEmptyMarkupSectionAtCursor();
    }

    let range = editor.range;

    switch(true) {
      case key.isHorizontalArrow():
        let newRange;
        if (key.isShift()) {
          newRange = range.extend(key.direction * 1);
        } else {
          newRange = range.move(key.direction);
        }

        editor.selectRange(newRange);
        event.preventDefault();
        break;
      case key.isDelete():
        editor.handleDeletion(event);
        event.preventDefault();
        break;
      case key.isEnter():
        editor.handleNewline(event);
        break;
      case key.isTab():
        event.preventDefault();
        editor.insertText(TAB);
        break;
    }
  }

  keyup(event) {
    let { editor } = this;
    if (!editor.hasCursor()) { return; }
    let key = Key.fromEvent(event);
    if (key.isShiftKey()) {
      this.isShift = false;
    }

    // Only movement-related keys require re-checking the active range
    if (key.isMovement()) {
      setTimeout(() => this.editor._notifyRangeChange());
    }
  }

  cut(event) {
    event.preventDefault();

    this.copy(event);
    this.editor.handleDeletion();
  }

  copy(event) {
    event.preventDefault();

    let { editor, editor: { range, post } } = this;
    post = post.trimTo(range);

    let data = {
      html: editor.serializePost(post, 'html'),
      text: editor.serializePost(post, 'text'),
      mobiledoc: editor.serializePost(post, 'mobiledoc')
    };

    setClipboardData(event, data, window);
  }

  paste(event) {
    event.preventDefault();

    let { editor } = this;
    let range = editor.range;

    if (!range.isCollapsed) {
      editor.handleDeletion();
    }
    let position = editor.range.head;
    let targetFormat = this.isShift ? 'text' : 'html';
    let pastedPost = parsePostFromPaste(event, editor, {targetFormat});

    editor.run(postEditor => {
      let nextPosition = postEditor.insertPost(position, pastedPost);
      postEditor.setRange(new Range(nextPosition));
    });
  }

  mouseup(/* event */) {
    // mouseup does not correctly report a selection until the next tick
    setTimeout(() => this.editor._notifyRangeChange());
  }

  drop(event) {
    event.preventDefault();

    let { clientX: x, clientY: y } = event;
    let { editor } = this;

    let position = editor.positionAtPoint(x, y);
    if (!position) {
      this.logger.log('Could not find drop position');
      return;
    }

    let post = parsePostFromDrop(event, editor, {logger: this.logger});
    if (!post) {
      this.logger.log('Could not determine post from drop event');
      return;
    }

    editor.run(postEditor => {
      let nextPosition = postEditor.insertPost(position, post);
      postEditor.setRange(new Range(nextPosition));
    });
  }
}
