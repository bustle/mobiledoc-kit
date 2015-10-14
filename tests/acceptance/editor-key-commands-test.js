import { Editor } from 'content-kit-editor';
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

test('new key commands can be registered', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(
    ({post, markupSection, marker}) => post([
      markupSection('p', [marker('something')])
    ]));

  let passedEditor;
  editor = new Editor({mobiledoc});
  editor.registerKeyCommand({
    str: 'ctrl+x',
    run(editor) { passedEditor = editor; }
  });
  editor.render(editorElement);

  Helpers.dom.triggerKeyCommand(editor, 'Y', MODIFIERS.CTRL);

  assert.ok(!passedEditor, 'incorrect key combo does not trigger key command');

  Helpers.dom.triggerKeyCommand(editor, 'X', MODIFIERS.CTRL);

  assert.ok(!!passedEditor && passedEditor === editor, 'run method is called');
});

test('new key commands can be registered without modifiers', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(
    ({post, markupSection, marker}) => post([
      markupSection('p', [marker('something')])
    ]));

  let passedEditor;
  editor = new Editor({mobiledoc});
  editor.registerKeyCommand({
    str: 'X',
    run(editor) { passedEditor = editor; }
  });
  editor.render(editorElement);

  Helpers.dom.triggerKeyCommand(editor, 'Y', MODIFIERS.CTRL);

  assert.ok(!passedEditor, 'incorrect key combo does not trigger key command');

  Helpers.dom.triggerKeyCommand(editor, 'X', MODIFIERS.CTRL);

  assert.ok(!passedEditor, 'key with modifier combo does not trigger key command');

  Helpers.dom.triggerKeyCommand(editor, 'X');

  assert.ok(!!passedEditor && passedEditor === editor, 'run method is called');
});

test('duplicate key commands can be registered with the last registered winning', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(
    ({post, markupSection, marker}) => post([
      markupSection('p', [marker('something')])
    ]));

  let firstCommandRan, secondCommandRan;
  editor = new Editor({mobiledoc});
  editor.registerKeyCommand({
    str: 'ctrl+x',
    run() { firstCommandRan = true; }
  });
  editor.registerKeyCommand({
    str: 'ctrl+x',
    run() { secondCommandRan = true; }
  });
  editor.render(editorElement);

  Helpers.dom.triggerKeyCommand(editor, 'X', MODIFIERS.CTRL);

  assert.ok(!firstCommandRan, 'first registered method not called');
  assert.ok(!!secondCommandRan, 'last registered method is called');
});

test('returning false from key command causes next match to run', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(
    ({post, markupSection, marker}) => post([
      markupSection('p', [marker('something')])
    ]));

  let firstCommandRan, secondCommandRan;
  editor = new Editor({mobiledoc});
  editor.registerKeyCommand({
    str: 'ctrl+x',
    run() { firstCommandRan = true; }
  });
  editor.registerKeyCommand({
    str: 'ctrl+x',
    run() {
      secondCommandRan = true;
      return false;
    }
  });
  editor.render(editorElement);

  Helpers.dom.triggerKeyCommand(editor, 'X', MODIFIERS.CTRL);

  assert.ok(!!secondCommandRan, 'last registered method is called');
  assert.ok(!!firstCommandRan, 'first registered method is called');
});

test('key commands can override built-in functionality', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(
    ({post, markupSection, marker}) => post([
      markupSection('p', [marker('something')])
    ]));

  editor = new Editor({mobiledoc});

  let passedEditor;
  editor.registerKeyCommand({
    str: 'enter',
    run(editor) { passedEditor = editor; }
  });

  editor.render(editorElement);
  assert.equal($('#editor p').length, 1, 'has 1 paragraph to start');

  Helpers.dom.moveCursorTo(editorElement.childNodes[0].childNodes[0], 5);
  Helpers.dom.triggerEnter(editor);

  assert.ok(!!passedEditor && passedEditor === editor, 'run method is called');

  assert.equal($('#editor p').length, 1, 'still has just one paragraph');
});

test('returning false from key command still runs built-in functionality', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(
    ({post, markupSection, marker}) => post([
      markupSection('p', [marker('something')])
    ]));

  editor = new Editor({mobiledoc});

  let passedEditor;
  editor.registerKeyCommand({
    str: 'enter',
    run(editor) {
      passedEditor = editor;
      return false;
    }
  });

  editor.render(editorElement);
  assert.equal($('#editor p').length, 1, 'has 1 paragraph to start');

  Helpers.dom.moveCursorTo(editorElement.childNodes[0].childNodes[0], 5);
  Helpers.dom.triggerEnter(editor);

  assert.ok(!!passedEditor && passedEditor === editor, 'run method is called');

  assert.equal($('#editor p').length, 2, 'has added a new paragraph');
});

