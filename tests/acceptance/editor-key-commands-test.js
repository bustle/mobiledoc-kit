import { Editor } from 'mobiledoc-kit';
import { MODIFIERS } from 'mobiledoc-kit/utils/key';
import Keycodes from 'mobiledoc-kit/utils/keycodes';
import Helpers from '../test-helpers';

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

function testStatefulCommand({modifierName, key, command, markupName}) {
  test(`${command} applies markup ${markupName} to highlighted text`, (assert) => {
    assert.expect(2);
    let done = assert.async();

    let modifier = MODIFIERS[modifierName];
    let modifierKeyCode = Keycodes[modifierName];
    let initialText = 'something';
    const mobiledoc = Helpers.mobiledoc.build(
      ({post, markupSection, marker}) => post([
        markupSection('p', [marker(initialText)])
      ]));

    editor = new Editor({mobiledoc});
    editor.render(editorElement);

    assert.hasNoElement(`#editor ${markupName}`, `precond - no ${markupName} text`);
    Helpers.dom.selectText(editor ,initialText, editorElement);
    Helpers.dom.triggerKeyCommand(editor, key, modifier);
    Helpers.dom.triggerKeyEvent(editor, 'keyup', {charCode: 0, keyCode: modifierKeyCode});

    setTimeout(() => {
      assert.hasElement(`#editor ${markupName}:contains(${initialText})`,
                        `text wrapped in ${markupName}`);
      done();
    });
  });

  test(`${command} toggles ${markupName} for next entered text`, (assert) => {
    let done = assert.async();
    assert.expect(7);

    let modifier = MODIFIERS[modifierName];
    let modifierKeyCode = Keycodes[modifierName];
    let initialText = 'something';
    const mobiledoc = Helpers.mobiledoc.build(
      ({post, markupSection, marker}) => post([
        markupSection('p', [marker(initialText)])
      ]));

    editor = new Editor({mobiledoc});
    editor.render(editorElement);

    assert.hasNoElement(`#editor ${markupName}`, `precond - no ${markupName} text`);
    Helpers.dom.moveCursorTo(editor, 
      editor.post.sections.head.markers.head.renderNode.element,
      initialText.length);
    Helpers.dom.triggerKeyCommand(editor, key, modifier);
    // simulate meta/ctrl keyup
    Helpers.dom.triggerKeyEvent(editor, 'keyup', { charCode: 0, keyCode:  modifierKeyCode});

    setTimeout(() => {
      Helpers.dom.insertText(editor, 'z');

      let expected1 = Helpers.postAbstract.build(({post, markupSection, marker, markup}) => {
        return post([
          markupSection('p', [
            marker(initialText),
            marker('z', [markup(markupName)])
          ])
        ]);
      });
      let expected2 = Helpers.postAbstract.build(({post, markupSection, marker, markup}) => {
        return post([
          markupSection('p', [
            marker(initialText),
            marker('z', [markup(markupName)]),
            marker('x')
          ])
        ]);
      });

      assert.postIsSimilar(editor.post, expected1);
      assert.renderTreeIsEqual(editor._renderTree, expected1);
      assert.positionIsEqual(editor.range.head, editor.post.tailPosition());

      // un-toggles markup
      Helpers.dom.triggerKeyCommand(editor, key, modifier);
      Helpers.dom.triggerKeyEvent(editor, 'keyup', {charCode: 0, keyCode: modifierKeyCode});

      setTimeout(() => {
        Helpers.dom.insertText(editor, 'x');

        assert.postIsSimilar(editor.post, expected2);
        assert.renderTreeIsEqual(editor._renderTree, expected2);
        assert.positionIsEqual(editor.range.head, editor.post.tailPosition());

        done();
      });
    });
  });
}

testStatefulCommand({
  modifierName: 'META',
  key: 'B',
  command: 'command-B',
  markupName: 'strong'
});

testStatefulCommand({
  modifierName: 'CTRL',
  key: 'B',
  command: 'ctrl-B',
  markupName: 'strong'
});

testStatefulCommand({
  modifierName: 'META',
  key: 'I',
  command: 'command-I',
  markupName: 'em'
});

testStatefulCommand({
  modifierName: 'CTRL',
  key: 'I',
  command: 'ctrl-I',
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
  Helpers.dom.moveCursorTo(editor, textElement, 4);
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
  Helpers.dom.moveCursorTo(editor, textElement, 4, textElement, 8);
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

test('cmd-k links selected text', (assert) => {
  assert.expect(2);

  let url = 'http://bustle.com';
  let mobiledoc = Helpers.mobiledoc.build(
    ({post, markupSection, marker}) => post([
      markupSection('p', [marker('something')])
    ]));
  editor = new Editor({mobiledoc});
  editor.render(editorElement);
  editor.showPrompt = (prompt, defaultUrl, callback) => {
    assert.ok(true, 'calls showPrompt');
    callback(url);
  };

  Helpers.dom.selectText(editor ,'something', editorElement);
  Helpers.dom.triggerKeyCommand(editor, 'K', MODIFIERS.META);

  assert.hasElement(`#editor a[href="${url}"]:contains(something)`);
});

test('cmd-k unlinks selected text if it was already linked', (assert) => {
  assert.expect(3);

  let url = 'http://bustle.com';
  let mobiledoc = Helpers.mobiledoc.build(
    ({post, markupSection, marker, markup}) => post([
      markupSection('p', [marker('something', [markup('a', {href:url})])])
    ]));
  editor = new Editor({mobiledoc});
  editor.showPrompt = () => {
    assert.ok(false, 'should not call showPrompt');
  };
  editor.render(editorElement);
  assert.hasElement(`#editor a[href="${url}"]:contains(something)`,
                    'precond -- has link');

  Helpers.dom.selectText(editor ,'something', editorElement);
  Helpers.dom.triggerKeyCommand(editor, 'K', MODIFIERS.META);

  assert.hasNoElement(`#editor a[href="${url}"]:contains(something)`,
                     'removes linked text');
  assert.hasElement(`#editor p:contains(something)`, 'unlinked text remains');
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

  Helpers.dom.moveCursorTo(editor, editorElement.childNodes[0].childNodes[0], 5);
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

  Helpers.dom.moveCursorTo(editor, editorElement.childNodes[0].childNodes[0], 5);
  Helpers.dom.triggerEnter(editor);

  assert.ok(!!passedEditor && passedEditor === editor, 'run method is called');

  assert.equal($('#editor p').length, 2, 'has added a new paragraph');
});
