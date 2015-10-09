import { Editor } from 'content-kit-editor';
import Keycodes from 'content-kit-editor/utils/keycodes';
import { MODIFIERS } from 'content-kit-editor/utils/key';
import Helpers from '../test-helpers';

const { module, test } = Helpers;

let editor, editorElement;

module('Acceptance: Editor: Key Commands', {
  beforeEach() {
    editorElement = document.createElement('div');
    editorElement.setAttribute('id', 'editor');
    $('#qunit-fixture').append(editorElement);
  },
  afterEach() {
    if (editor) { editor.destroy(); }
  }
});

test('typing command-B bolds highlighted text', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(
    ({post, markupSection, marker}) => post([
      markupSection('p', [marker('something')])
    ]));

  editor = new Editor({mobiledoc});
  editor.render(editorElement);

  assert.hasNoElement('#editor strong', 'precond - no strong text');
  Helpers.dom.selectText('something', editorElement);
  Helpers.dom.triggerKeyCommand(editor, 'B', MODIFIERS.META);

  assert.hasElement('#editor strong:contains(something)', 'text is strengthened');
});

test('typing command-I italicizes highlighted text', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(
    ({post, markupSection, marker}) => post([
      markupSection('p', [marker('something')])
    ]));

  editor = new Editor({mobiledoc});
  editor.render(editorElement);

  assert.hasNoElement('#editor em', 'precond - no strong text');
  Helpers.dom.selectText('something', editorElement);
  Helpers.dom.triggerKeyCommand(editor, 'I', MODIFIERS.META);

  assert.hasElement('#editor em:contains(something)', 'text is emphasized');
});

test('new simple key commands can be registered', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(
    ({post, markupSection, marker}) => post([
      markupSection('p', [marker('something')])
    ]));

  let passedEditor;
  editor = new Editor({mobiledoc});
  editor.registerKeyCommand({
    modifier: MODIFIERS.CTRL,
    str: 'X',
    run(editor) { passedEditor = editor; }
  });
  editor.render(editorElement);

  Helpers.dom.triggerKeyCommand(editor, 'Y', MODIFIERS.CTRL);

  assert.ok(!passedEditor, 'incorrect key combo does not trigger key command');

  Helpers.dom.triggerKeyCommand(editor, 'X', MODIFIERS.CTRL);

  assert.ok(!!passedEditor && passedEditor === editor, 'run method is called');
});

test('new custom key commands can be registered', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(
    ({post, markupSection, marker}) => post([
      markupSection('p', [marker('something')])
    ]));

  let passedEditor;
  editor = new Editor({mobiledoc});
  editor.registerKeyCommand({
    check(e) { return e.keyCode === Keycodes.ENTER; },
    run(editor) { passedEditor = editor; }
  });
  editor.render(editorElement);

  Helpers.dom.triggerKeyCommand(editor, 'Y', MODIFIERS.CTRL);

  assert.ok(!passedEditor, 'incorrect key combo does not trigger key command');

  Helpers.dom.triggerEnter(editor);

  assert.ok(!!passedEditor && passedEditor === editor, 'run method is called');
});

