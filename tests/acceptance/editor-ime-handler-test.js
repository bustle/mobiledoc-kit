import Keycodes from 'mobiledoc-kit/utils/keycodes';
import Browser from 'mobiledoc-kit/utils/browser';
import Helpers from '../test-helpers';

let editor, editorElement;

const { test, module } = Helpers;

module('Acceptance: editor: IME Composition Event Handler', {
  beforeEach() {
    editorElement = $('#editor')[0];
  },
  afterEach() {
    if (editor) { editor.destroy(); }
  }
});

['Enter', 'Tab', 'Backspace'].forEach((key) => {
  test(`ignore ${key} keydowns when using an IME`, (assert) => {
    let { post: expected } = Helpers.postAbstract.buildFromText('你好');
    editor = Helpers.editor.buildFromText('你好', { element: editorElement });

    Helpers.dom.moveCursorTo(editor, editorElement.firstChild, 1);

    Helpers.dom.triggerKeyEvent(editor, 'keydown', {
      key,
      keyCode: Keycodes.IME,
      charCode: Keycodes[key.toUpperCase()]
    });

    assert.postIsSimilar(editor.post, expected);
  });
});

test('ignore horizontal arrow keydowns when using an IME', (assert) => {
  editor = Helpers.editor.buildFromText("안녕하세요", { element: editorElement });

  Helpers.dom.moveCursorTo(editor, editorElement.firstChild);

  Helpers.dom.triggerKeyEvent(editor, 'keydown', {
    key: 'ArrowRight',
    keyCode: Keycodes.IME,
    charCode: Keycodes.RIGHT
  });

  assert.positionIsEqual(editor.range.head, editor.post.headPosition());

  Helpers.dom.moveCursorTo(editor, editorElement.firstChild, 1);

  Helpers.dom.triggerKeyEvent(editor, 'keydown', {
    key: 'ArrowLeft',
    keyCode: Keycodes.IME,
    charCode: Keycodes.LEFT
  });

  assert.positionIsEqual(editor.range.head, editor.post.tailPosition());
});

// There doesn't seem to be a way to directly test the usage
// of an OS-level IME, however this test roughly simulates
// how the IME inputs text into the DOM.
test('test handling of IME composition events', (assert) => {
  let done = assert.async();

  editor = Helpers.editor.buildFromText("", { element: editorElement });

  Helpers.dom.moveCursorTo(editor, editorElement);

  editor.element.dispatchEvent(
    new CompositionEvent('compositionstart', { 'data': 'n' })
  );

  Helpers.wait(() => {
    if(Browser.isChrome()) {
      editorElement.firstChild.innerHTML = "こんにちは";
    } else {
      editorElement.firstChild.innerHTML += "こんにちは";
    }

    Helpers.wait(() => {
      editor.element.dispatchEvent(
        new CompositionEvent('compositionend', { 'data': 'こんにちは' })
      );

      Helpers.wait(() => {
        assert.positionIsEqual(editor.range.head, editor.post.tailPosition());
        assert.hasElement('#editor p:contains(こんにちは)');

        done();
      });
    });
  });
});
