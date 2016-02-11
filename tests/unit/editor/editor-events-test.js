import Helpers from '../../test-helpers';
import { Editor } from 'mobiledoc-kit';

const { module, test } = Helpers;

let editor, editorElement;

const mobiledoc = Helpers.mobiledoc.build(({post, markupSection, marker}) => {
  return post([markupSection('p', [marker('this is the editor')])]);
});


module('Unit: Editor: events and lifecycle callbacks', {
  beforeEach() {
    editorElement = $('#editor')[0];
    editor = new Editor({mobiledoc});
    editor.render(editorElement);
  },

  afterEach() {
    if (editor) {
      editor.destroy();
      editor = null;
    }
  }
});

test('cursorDidChange callback fired after mouseup', (assert) => {
  assert.expect(2);
  let done = assert.async();

  let cursorChanged = 0;
  editor.cursorDidChange(() => cursorChanged++);

  let node = Helpers.dom.findTextNode(editorElement, 'this is the editor');
  Helpers.dom.moveCursorWithoutNotifyingEditorTo(editor, node, 0);

  assert.equal(cursorChanged, 0, 'precond - no cursor change yet');

  Helpers.dom.triggerEvent(document, 'mouseup');

  setTimeout(() => {
    assert.equal(cursorChanged, 1, 'cursor did change');
    cursorChanged = 0;

    done();
  });
});

test('cursorDidChange callback not fired after mouseup when selection is unchanged', (assert) => {
  assert.expect(2);
  let done = assert.async();

  let cursorChanged = 0;
  editor.cursorDidChange(() => cursorChanged++);

  let node = Helpers.dom.findTextNode(editorElement, 'this is the editor');
  Helpers.dom.moveCursorWithoutNotifyingEditorTo(editor, node, 0);
  Helpers.dom.triggerEvent(document, 'mouseup');

  setTimeout(() => {
    assert.equal(cursorChanged, 1, 'cursor did change');
    cursorChanged = 0;

    Helpers.dom.triggerEvent(document, 'mouseup');
    setTimeout(() => {
      assert.equal(cursorChanged, 0, 'cursor did not change after mouseup when selection is unchanged');

      done();
    });
  });
});

test('cursorDidChange callback fired after mouseup when editor loses focus', (assert) => {
  assert.expect(1);
  let done = assert.async();

  let cursorChanged = 0;
  editor.cursorDidChange(() => cursorChanged++);

  Helpers.dom.clearSelection();
  Helpers.dom.triggerEvent(document, 'mouseup');

  setTimeout(() => {
    assert.equal(cursorChanged, 1, 'cursor changed when mouseup and no selection');

    done();
  });
});

test('cursorDidChange callback fired after keypress', (assert) => {
  let done = assert.async();
  assert.expect(2);

  let cursorChanged = 0;
  editor.cursorDidChange(() => cursorChanged++);

  let node = Helpers.dom.findTextNode(editorElement, 'this is the editor');
  Helpers.dom.moveCursorTo(editor, node, 0);

  assert.equal(cursorChanged, 1, 'precond - cursor changed by move');
  cursorChanged = 0;

  Helpers.dom.moveCursorWithoutNotifyingEditorTo(editor, node, 'this is the editor'.length);
  Helpers.dom.triggerRightArrowKey(editor);

  setTimeout(() => {
    assert.equal(cursorChanged, 1, 'cursor changed after key up');
    done();
  });
});
