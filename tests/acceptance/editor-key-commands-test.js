import { Editor } from 'mobiledoc-kit';
import { MODIFIERS } from 'mobiledoc-kit/utils/key';
import Helpers from '../test-helpers';
import { detectIE } from '../helpers/browsers';

const { module, test } = Helpers;

let editor, editorElement;

module('Acceptance: Editor: Key Commands', {
  beforeEach() {
    editorElement = $('#editor')[0];
  },
  afterEach() {
    if (editor) {
      editor.destroy();
      editor = null;
    }
  }
});

function testStatefulCommand({modifier, key, command, markupName}) {
  test(`${command} applies markup ${markupName} to highlighted text`, (assert) => {
    let initialText = 'something';
    const mobiledoc = Helpers.mobiledoc.build(
      ({post, markupSection, marker}) => post([
        markupSection('p', [marker(initialText)])
      ]));

    editor = new Editor({mobiledoc});
    editor.render(editorElement);

    assert.hasNoElement(`#editor ${markupName}`, `precond - no ${markupName} text`);
    Helpers.dom.selectText(initialText, editorElement);
    Helpers.dom.triggerKeyCommand(editor, key, modifier);

    assert.hasElement(`#editor ${markupName}:contains(${initialText})`,
                      `text wrapped in ${markupName}`);
  });

  if (!detectIE()) {
    // FIXME: IE does not respect the current typing styles (such as an
    // `execCommand('bold', false, null)`) when calling the `insertText`
    // command. Skip these tests in IE until we can implement non-parsing
    // text entry.
    test(`${command} applies ${markupName} to next entered text`, (assert) => {
      let done = assert.async();
      let initialText = 'something';
      const mobiledoc = Helpers.mobiledoc.build(
        ({post, markupSection, marker}) => post([
          markupSection('p', [marker(initialText)])
        ]));

      editor = new Editor({mobiledoc});
      editor.render(editorElement);

      assert.hasNoElement(`#editor ${markupName}`, `precond - no ${markupName} text`);
      Helpers.dom.moveCursorTo(
        editor.post.sections.head.markers.head.renderNode.element,
        initialText.length);
      Helpers.dom.triggerKeyCommand(editor, key, modifier);
      Helpers.dom.insertText(editor, 'z');
      window.setTimeout(() => {
        let changedMobiledoc = editor.serialize();
        let expectedMobiledoc = Helpers.mobiledoc.build(
          ({post, markupSection, marker, markup: buildMarkup}) => {
            let markup = buildMarkup(markupName);
            return post([
              markupSection('p', [
                marker(initialText),
                marker('z', [markup])
              ])
            ]);
        });
        assert.deepEqual(changedMobiledoc, expectedMobiledoc);
        done();
      },0);
    });
  }
}

testStatefulCommand({
  modifier: MODIFIERS.META,
  key: 'B',
  command: 'command-B',
  markupName: 'strong'
});

testStatefulCommand({
  modifier: MODIFIERS.CTRL,
  key: 'B',
  command: 'command-B',
  markupName: 'strong'
});

testStatefulCommand({
  modifier: MODIFIERS.META,
  key: 'I',
  command: 'command-I',
  markupName: 'em'
});

testStatefulCommand({
  modifier: MODIFIERS.CTRL,
  key: 'I',
  command: 'command-I',
  markupName: 'em'
});

test(`ctrl-k clears to the end of a line`, (assert) => {
  let initialText = 'something';
  const mobiledoc = Helpers.mobiledoc.build(
    ({post, markupSection, marker}) => post([
      markupSection('p', [marker(initialText)])
    ]));

  editor = new Editor({mobiledoc});
  editor.render(editorElement);

  let textElement = editor.post.sections.head.markers.head.renderNode.element;
  Helpers.dom.moveCursorTo(textElement, 4);
  Helpers.dom.triggerKeyCommand(editor, 'K', MODIFIERS.CTRL);

  let changedMobiledoc = editor.serialize();
  let expectedMobiledoc = Helpers.mobiledoc.build(
    ({post, markupSection, marker}) => {
      return post([
        markupSection('p', [
          marker('some')
        ])
      ]);
  });
  assert.deepEqual(changedMobiledoc, expectedMobiledoc,
                   'mobiledoc updated appropriately');
});

test(`ctrl-k clears selected text`, (assert) => {
  let initialText = 'something';
  const mobiledoc = Helpers.mobiledoc.build(
    ({post, markupSection, marker}) => post([
      markupSection('p', [marker(initialText)])
    ]));

  editor = new Editor({mobiledoc});
  editor.render(editorElement);

  let textElement = editor.post.sections.head.markers.head.renderNode.element;
  Helpers.dom.moveCursorTo(textElement, 4, textElement, 8);
  Helpers.dom.triggerKeyCommand(editor, 'K', MODIFIERS.CTRL);

  let changedMobiledoc = editor.serialize();
  let expectedMobiledoc = Helpers.mobiledoc.build(
    ({post, markupSection, marker}) => {
      return post([
        markupSection('p', [
          marker('someg')
        ])
      ]);
  });
  assert.deepEqual(changedMobiledoc, expectedMobiledoc,
                   'mobiledoc updated appropriately');
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

