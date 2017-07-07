import { MODIFIERS } from 'mobiledoc-kit/utils/key';
import Keycodes from 'mobiledoc-kit/utils/keycodes';
import Helpers from '../test-helpers';
import Browser from 'mobiledoc-kit/utils/browser';
import { toggleLink } from 'mobiledoc-kit/editor/ui';

const { module, test, skip } = Helpers;

let editor, editorElement;

function labelForModifier(key) {
  switch (key) {
  case MODIFIERS.META: return 'META';
  case MODIFIERS.CTRL: return 'CTRL';
  }
}

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
    assert.expect(3);
    let done = assert.async();

    let modifier = MODIFIERS[modifierName];
    let modifierKeyCode = Keycodes[modifierName];
    let initialText = 'something';
    editor = Helpers.mobiledoc.renderIntoAndFocusTail(editorElement, ({post, markupSection, marker}) => post([
      markupSection('p', [marker(initialText)])
    ]));

    assert.ok(editor.hasCursor(), 'precond - editor should have cursor');

    assert.hasNoElement(`#editor ${markupName}`, `precond - no ${markupName} text`);
    Helpers.dom.selectText(editor ,initialText, editorElement);
    Helpers.dom.triggerKeyCommand(editor, key, modifier);
    Helpers.dom.triggerKeyEvent(editor, 'keyup', {charCode: 0, keyCode: modifierKeyCode});

    Helpers.wait(() => {
      assert.hasElement(`#editor ${markupName}:contains(${initialText})`,
                        `text wrapped in ${markupName}`);
      done();
    });
  });

  test(`${command} toggles ${markupName} for next entered text`, (assert) => {
    let done = assert.async();
    assert.expect(8);

    let modifier = MODIFIERS[modifierName];
    let modifierKeyCode = Keycodes[modifierName];
    let initialText = 'something';

    editor = Helpers.mobiledoc.renderIntoAndFocusTail(editorElement, ({post, markupSection, marker}) => post([
      markupSection('p', [marker(initialText)])
    ]));

    assert.ok(editor.hasCursor(), 'has cursor');

    assert.hasNoElement(`#editor ${markupName}`, `precond - no ${markupName} text`);
    Helpers.dom.moveCursorTo(editor,
      editor.post.sections.head.markers.head.renderNode.element,
      initialText.length);

    Helpers.wait(() => {
      Helpers.dom.triggerKeyCommand(editor, key, modifier);
      // simulate meta/ctrl keyup
      Helpers.dom.triggerKeyEvent(editor, 'keyup', { charCode: 0, keyCode:  modifierKeyCode});

      Helpers.wait(() => {
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

        Helpers.wait(() => {
          // un-toggles markup
          Helpers.dom.triggerKeyCommand(editor, key, modifier);
          Helpers.dom.triggerKeyEvent(editor, 'keyup', {charCode: 0, keyCode: modifierKeyCode});

          Helpers.wait(() => {
            Helpers.dom.insertText(editor, 'x');

            assert.postIsSimilar(editor.post, expected2);
            assert.renderTreeIsEqual(editor._renderTree, expected2);
            assert.positionIsEqual(editor.range.head, editor.post.tailPosition());

            done();
          });
        });
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

testStatefulCommand({
  modifierName: 'META',
  key: 'U',
  command: 'command-U',
  markupName: 'u'
});

testStatefulCommand({
  modifierName: 'CTRL',
  key: 'U',
  command: 'ctrl-U',
  markupName: 'u'
});

if (Browser.isMac()) {
  test(`[Mac] ctrl-k clears to the end of a line`, (assert) => {
    let initialText = 'something';
    editor = Helpers.mobiledoc.renderIntoAndFocusTail(editorElement, ({post, markupSection, marker}) => post([
      markupSection('p', [marker(initialText)])
    ]));

    assert.ok(editor.hasCursor(), 'has cursor');

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

  test(`[Mac] ctrl-k clears selected text`, (assert) => {
    let initialText = 'something';
    editor = Helpers.mobiledoc.renderIntoAndFocusTail(editorElement, ({post, markupSection, marker}) => post([
      markupSection('p', [marker(initialText)])
    ]));

    assert.ok(editor.hasCursor(), 'has cursor');

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
}

let toggleLinkTest = (assert, modifier) => {
  assert.expect(3);

  let url = 'http://bustle.com';
  editor = Helpers.mobiledoc.renderIntoAndFocusTail(editorElement, ({post, markupSection, marker}) => post([
    markupSection('p', [marker('something')])
  ]));

  editor.registerKeyCommand({
    str: `${labelForModifier(modifier)}+K`,
    run(editor) {
      toggleLink(editor, (prompt, defaultUrl, callback) => {
        assert.ok(true, 'calls showPrompt');
        callback(url);
      });
    }
  });

  assert.ok(editor.hasCursor(), 'has cursor');

  Helpers.dom.selectText(editor ,'something', editorElement);
  Helpers.dom.triggerKeyCommand(editor, 'K', modifier);

  assert.hasElement(`#editor a[href="${url}"]:contains(something)`);
};

let toggleLinkUnlinkTest = (assert, modifier) => {
  assert.expect(4);

  let url = 'http://bustle.com';
  editor = Helpers.mobiledoc.renderIntoAndFocusTail(editorElement, ({post, markupSection, marker, markup}) => post([
    markupSection('p', [marker('something', [markup('a', {href:url})])])
  ]));

  editor.registerKeyCommand({
    str: `${labelForModifier(modifier)}+K`,
    run(editor) {
      toggleLink(editor, (prompt, defaultUrl, callback) => {
        assert.ok(false, 'should not call showPrompt');
        callback(url);
      });
    }
  });

  assert.ok(editor.hasCursor(), 'has cursor');

  assert.hasElement(`#editor a[href="${url}"]:contains(something)`,
                    'precond -- has link');

  Helpers.dom.selectText(editor ,'something', editorElement);
  Helpers.dom.triggerKeyCommand(editor, 'K', modifier);

  assert.hasNoElement(`#editor a[href="${url}"]:contains(something)`,
                     'removes linked text');
  assert.hasElement(`#editor p:contains(something)`, 'unlinked text remains');
};

let toggleTests = [
  {
    precondition: () => Browser.isMac(),
    msg: '[Mac] cmd-k links selected text',
    testFn: toggleLinkTest,
    modifier: MODIFIERS.META
  },
  {
    precondition: () => Browser.isMac(),
    msg: '[Mac] cmd-k unlinks selected text if it was already linked',
    testFn: toggleLinkUnlinkTest,
    modifier: MODIFIERS.META
  },
  {
    precondition: () => Browser.isWin(),
    msg: '[Windows] ctrl-k links selected text',
    testFn: toggleLinkTest,
    modifier: MODIFIERS.CTRL
  },
  {
    precondition: () => Browser.isWin(),
    msg: '[Windows] ctrl-k unlinks selected text if it was already linked',
    testFn: toggleLinkUnlinkTest,
    modifier: MODIFIERS.CTRL
  },
];

toggleTests.forEach(({precondition, msg, testFn, modifier}) => {
  if (!precondition()) {
    skip(msg);
  } else {
    test(msg, (assert) => {
      testFn(assert, modifier);
    });
  }
});

test('new key commands can be registered', (assert) => {
  editor = Helpers.mobiledoc.renderIntoAndFocusTail(editorElement, ({post, markupSection, marker}) => post([
    markupSection('p', [marker('something')])
  ]));

  assert.ok(editor.hasCursor(), 'has cursor');

  let passedEditor;
  editor.registerKeyCommand({
    str: 'ctrl+x',
    run(editor) { passedEditor = editor; }
  });

  Helpers.dom.triggerKeyCommand(editor, 'Y', MODIFIERS.CTRL);

  assert.ok(!passedEditor, 'incorrect key combo does not trigger key command');

  Helpers.dom.triggerKeyCommand(editor, 'X', MODIFIERS.CTRL);

  assert.ok(!!passedEditor && passedEditor === editor, 'run method is called');
});

test('new key commands can be registered without modifiers', (assert) => {
  editor = Helpers.mobiledoc.renderIntoAndFocusTail(editorElement, ({post, markupSection, marker}) => post([
    markupSection('p', [marker('something')])
  ]));

  assert.ok(editor.hasCursor(), 'has cursor');

  let passedEditor;
  editor.registerKeyCommand({
    str: 'X',
    run(editor) { passedEditor = editor; }
  });

  Helpers.dom.triggerKeyCommand(editor, 'Y', MODIFIERS.CTRL);

  assert.ok(!passedEditor, 'incorrect key combo does not trigger key command');

  Helpers.dom.triggerKeyCommand(editor, 'X', MODIFIERS.CTRL);

  assert.ok(!passedEditor, 'key with modifier combo does not trigger key command');

  Helpers.dom.triggerKeyCommand(editor, 'X');

  assert.ok(!!passedEditor && passedEditor === editor, 'run method is called');
});

test('duplicate key commands can be registered with the last registered winning', (assert) => {
  editor = Helpers.mobiledoc.renderIntoAndFocusTail(editorElement, ({post, markupSection, marker}) => post([
    markupSection('p', [marker('something')])
  ]));

  assert.ok(editor.hasCursor(), 'has cursor');

  let firstCommandRan, secondCommandRan;

  editor.registerKeyCommand({
    str: 'ctrl+x',
    run() { firstCommandRan = true; }
  });
  editor.registerKeyCommand({
    str: 'ctrl+x',
    run() { secondCommandRan = true; }
  });

  Helpers.dom.triggerKeyCommand(editor, 'X', MODIFIERS.CTRL);

  assert.ok(!firstCommandRan, 'first registered method not called');
  assert.ok(!!secondCommandRan, 'last registered method is called');
});

test('returning false from key command causes next match to run', (assert) => {
  editor = Helpers.mobiledoc.renderIntoAndFocusTail(editorElement, ({post, markupSection, marker}) => post([
    markupSection('p', [marker('something')])
  ]));

  assert.ok(editor.hasCursor(), 'has cursor');

  let firstCommandRan, secondCommandRan;

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

  Helpers.dom.triggerKeyCommand(editor, 'X', MODIFIERS.CTRL);

  assert.ok(!!secondCommandRan, 'last registered method is called');
  assert.ok(!!firstCommandRan, 'first registered method is called');
});

test('key commands can override built-in functionality', (assert) => {
  editor = Helpers.mobiledoc.renderIntoAndFocusTail(editorElement, ({post, markupSection, marker}) => post([
    markupSection('p', [marker('something')])
  ]));

  assert.ok(editor.hasCursor(), 'has cursor');

  let passedEditor;
  editor.registerKeyCommand({
    str: 'enter',
    run(editor) { passedEditor = editor; }
  });

  assert.equal($('#editor p').length, 1, 'has 1 paragraph to start');

  Helpers.dom.moveCursorTo(editor, editorElement.childNodes[0].childNodes[0], 5);
  Helpers.dom.triggerEnter(editor);

  assert.ok(!!passedEditor && passedEditor === editor, 'run method is called');

  assert.equal($('#editor p').length, 1, 'still has just one paragraph');
});

test('returning false from key command still runs built-in functionality', (assert) => {
  editor = Helpers.mobiledoc.renderIntoAndFocusTail(editorElement, ({post, markupSection, marker}) => post([
    markupSection('p', [marker('something')])
  ]));

  assert.ok(editor.hasCursor(), 'has cursor');

  let passedEditor;
  editor.registerKeyCommand({
    str: 'enter',
    run(editor) {
      passedEditor = editor;
      return false;
    }
  });

  assert.equal($('#editor p').length, 1, 'has 1 paragraph to start');

  Helpers.dom.moveCursorTo(editor, editorElement.childNodes[0].childNodes[0], 5);
  Helpers.dom.triggerEnter(editor);

  assert.ok(!!passedEditor && passedEditor === editor, 'run method is called');

  assert.equal($('#editor p').length, 2, 'has added a new paragraph');
});

test('new key commands can be registered and then unregistered', (assert) => {
  editor = Helpers.mobiledoc.renderIntoAndFocusTail(editorElement, ({post, markupSection, marker}) => post([
    markupSection('p', [marker('something')])
  ]));

  assert.ok(editor.hasCursor(), 'has cursor');
  let passedEditorCount = 0;
  let passedEditor;
  editor.registerKeyCommand({
    name: 'cut',
    str: 'ctrl+x',
    run(editor) { passedEditor = editor; passedEditorCount++; }
  });

  editor.registerKeyCommand({
    name: 'cut',
    str: 'ctrl+d',
    run(editor) { passedEditor = editor; passedEditorCount++; }
  });

  Helpers.dom.triggerKeyCommand(editor, 'x', MODIFIERS.CTRL);
  Helpers.dom.triggerKeyCommand(editor, 'd', MODIFIERS.CTRL);

  assert.ok(!!passedEditor && passedEditor === editor, 'run method is called');
  assert.ok(passedEditorCount === 2, 'the passedEditor has been called twice');

  editor.unregisterKeyCommands('cut');

  Helpers.dom.triggerKeyCommand(editor, 'x', MODIFIERS.CTRL);
  Helpers.dom.triggerKeyCommand(editor, 'd', MODIFIERS.CTRL);

  assert.ok(passedEditorCount === 2, 'the passedEditor has still only been called twice');
});
