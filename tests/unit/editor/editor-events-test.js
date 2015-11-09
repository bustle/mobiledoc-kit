import Helpers from '../../test-helpers';
import { Editor } from 'content-kit-editor';

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

test('"cursorChanged" callbacks fired on mouseup', (assert) => {
  const done = assert.async();

  let cursorChanged = 0;
  editor.cursorDidChange(() => cursorChanged++);
  const textNode = $('#editor p')[0].childNodes[0];
  Helpers.dom.moveCursorTo(textNode, 0);

  assert.equal(cursorChanged, 0, 'precond');

  Helpers.dom.triggerEvent(document, 'mouseup');

  setTimeout(() => {
    assert.equal(cursorChanged, 1, 'cursor changed');
    cursorChanged = 0;

    Helpers.dom.moveCursorTo(textNode, textNode.textContent.length);
    Helpers.dom.triggerEvent(document, 'mouseup');

    setTimeout(() => {
    assert.equal(cursorChanged, 1, 'cursor changed again');
      done();
    });
  });
});

test('"cursorChanged" callback called after hitting arrow key', (assert) => {
  let cursorChanged = 0;
  editor.cursorDidChange(() => cursorChanged++);
  const textNode = $('#editor p')[0].childNodes[0];
  Helpers.dom.moveCursorTo(textNode, 0);

  assert.equal(cursorChanged, 0, 'precond');
  Helpers.dom.triggerRightArrowKey(editor);
  assert.equal(cursorChanged, 1, 'cursor changed');
});
