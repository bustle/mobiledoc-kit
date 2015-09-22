import Helpers from '../../test-helpers';
import { Editor } from 'content-kit-editor';

const { module, test } = Helpers;

let editor, editorElement;
let triggered = [];

const mobiledoc = Helpers.mobiledoc.build(({post, markupSection, marker}) => {
  return post([markupSection('p', [marker('this is the editor')])]);
});


module('Unit: Editor: events and lifecycle callbacks', {
  beforeEach() {
    editorElement = $('<div id="editor"></div>').appendTo('#qunit-fixture')[0];
    editor = new Editor({mobiledoc});
    editor.render(editorElement);
    editor.trigger = (name) => triggered.push(name);
  },

  afterEach() {
    if (editor) {
      editor.destroy();
      editor = null;
    }
    triggered = [];
  }
});

function assertTriggered(name, assert, message=`triggers ${name}`) {
  assert.ok(triggered.indexOf(name) > -1, message);
}

function assertNotTriggered(name, assert, message=`does not trigger ${name}`) {
  assert.ok(triggered.indexOf(name) === -1, message);
}

test('mouseup when text is selected triggers "selection" event', (assert) => {
  const done = assert.async();

  Helpers.dom.selectText('the editor', editorElement);
  Helpers.dom.triggerEvent(document, 'mouseup');

  assertNotTriggered('selection', assert, 'no selection before timeout');

  setTimeout(() => {
    assertTriggered('selection', assert, 'no selection before timeout');

    done();
  });
});

test('multiple mouseups when text is selected trigger "selectionUpdated" event', (assert) => {
  const done = assert.async();

  Helpers.dom.selectText('the editor', editorElement);
  Helpers.dom.triggerEvent(document, 'mouseup');

  setTimeout(() => {
    // mouseup again
    Helpers.dom.triggerEvent(document, 'mouseup');

    setTimeout(() => {
      assertTriggered('selectionUpdated', assert);

      done();
    });
  });
});

test('mouseup when no text is selected triggers no events', (assert) => {
  const done = assert.async();

  Helpers.dom.triggerEvent(document, 'mouseup');

  setTimeout(() => {
    assertNotTriggered('selection', assert);
    assertNotTriggered('selectionUpdated', assert);
    assertNotTriggered('selectionEnded', assert);

    done();
  });
});

test('mouseup after text was selected triggers "selectionEnded" event', (assert) => {
  const done = assert.async();

  Helpers.dom.selectText('the editor', editorElement);
  Helpers.dom.triggerEvent(document, 'mouseup');

  setTimeout(() => {
    Helpers.dom.clearSelection();
    Helpers.dom.triggerEvent(document, 'mouseup');

    setTimeout(() => {
      assertTriggered('selectionEnded', assert);

      done();
    });
  });
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
