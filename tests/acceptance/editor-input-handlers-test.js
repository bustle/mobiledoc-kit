import Helpers from '../test-helpers';
import Range from 'mobiledoc-kit/utils/cursor/range';
import { NO_BREAK_SPACE } from 'mobiledoc-kit/renderers/editor-dom';
import { TAB, ENTER } from 'mobiledoc-kit/utils/characters';
import { MODIFIERS }  from 'mobiledoc-kit/utils/key';

const { module, test } = Helpers;
const { editor: { buildFromText } } = Helpers;
const { postAbstract: { DEFAULT_ATOM_NAME } } = Helpers;

let editor, editorElement;

function renderEditor(...args) {
  editor = Helpers.mobiledoc.renderInto(editorElement, ...args);
  editor.selectRange(editor.post.tailPosition());
  return editor;
}

let atom = {
  name: DEFAULT_ATOM_NAME,
  type: 'dom',
  render() {}
};

module('Acceptance: Editor: Text Input Handlers', {
  beforeEach() {
    editorElement = $('#editor')[0];
  },
  afterEach() {
    if (editor) { editor.destroy(); }
  }
});

const headerTests = [{
  text: '#',
  toInsert: ' ',
  headerTagName: 'h1'
}, {
  text: '##',
  toInsert: ' ',
  headerTagName: 'h2'
}, {
  text: '###',
  toInsert: ' ',
  headerTagName: 'h3'
}, {
  text: '####',
  toInsert: ' ',
  headerTagName: 'h4'
}, {
  text: '#####',
  toInsert: ' ',
  headerTagName: 'h5'
}, {
  text: '######',
  toInsert: ' ',
  headerTagName: 'h6'
}];

headerTests.forEach(({text, toInsert, headerTagName}) => {
  test(`typing "${text}${toInsert}" converts to ${headerTagName}`, (assert) => {
    renderEditor(({post, markupSection, marker}) => {
      return post([markupSection('p',[marker(text)])]);
    });
    assert.hasElement('#editor p', 'precond - has p');
    Helpers.dom.insertText(editor, toInsert);
    assert.hasNoElement('#editor p', 'p is gone');
    assert.hasElement(`#editor ${headerTagName}`, `p -> ${headerTagName}`);

    // Different browsers report different selections, so we grab the selection
    // here and then set it to what we expect it to be, and compare what
    // window.getSelection() reports.
    // E.g., in Firefox getSelection() reports that the anchorNode is the "br",
    // but Safari and Chrome report that the anchorNode is the header element
    let selection = window.getSelection();

    let cursorElement = $(`#editor ${headerTagName} br`)[0];
    assert.ok(cursorElement, 'has cursorElement');
    Helpers.dom.selectRange(cursorElement, 0, cursorElement, 0);

    let newSelection = window.getSelection();
    assert.equal(selection.anchorNode, newSelection.anchorNode, 'correct anchorNode');
    assert.equal(selection.focusNode, newSelection.focusNode, 'correct focusNode');
    assert.equal(selection.anchorOffset, newSelection.anchorOffset, 'correct anchorOffset');
    assert.equal(selection.focusOffset, newSelection.focusOffset, 'correct focusOffset');

    Helpers.dom.insertText(editor, 'X');
    assert.hasElement(`#editor ${headerTagName}:contains(X)`, 'text is inserted correctly');
  });

  test(`typing "${text}" but not "${toInsert}" does not convert to ${headerTagName}`, (assert) => {
    editor = buildFromText(text, {element: editorElement});
    assert.hasElement('#editor p', 'precond - has p');
    Helpers.dom.insertText(editor, 'X');

    assert.hasElement('#editor p', 'still has p');
    assert.hasNoElement(`#editor ${headerTagName}`, `does not change to ${headerTagName}`);
  });
});

test('typing "* " converts to ul > li', (assert) => {
  renderEditor(({post, markupSection, marker}) => {
    return post([markupSection('p',[marker('*')])]);
  });

  Helpers.dom.insertText(editor, ' ');
  assert.hasNoElement('#editor p', 'p is gone');
  assert.hasElement('#editor ul > li', 'p -> "ul > li"');

  // Store the selection so we can compare later
  let selection = window.getSelection();
  let cursorElement = $('#editor ul > li > br')[0];
  assert.ok(cursorElement, 'has cursorElement for cursor position');
  Helpers.dom.selectRange(cursorElement, 0, cursorElement, 0);

  let newSelection = window.getSelection();
  assert.equal(selection.anchorNode, newSelection.anchorNode, 'correct anchorNode');
  assert.equal(selection.focusNode, newSelection.focusNode, 'correct focusNode');
  assert.equal(selection.anchorOffset, newSelection.anchorOffset, 'correct anchorOffset');
  assert.equal(selection.focusOffset, newSelection.focusOffset, 'correct focusOffset');

  Helpers.dom.insertText(editor, 'X');
  assert.hasElement('#editor ul > li:contains(X)', 'text is inserted correctly');
});

// see https://github.com/bustle/mobiledoc-kit/issues/280
test('typing "* " at start of markup section does not remove it', (assert) => {
  renderEditor(({post, markupSection, marker}) => {
    return post([markupSection('p',[marker('*abc')])]);
  });

  editor.selectRange(editor.post.sections.head.toPosition(1));

  Helpers.dom.insertText(editor, ' ');
  assert.hasElement('#editor p:contains(* abc)', 'p is still there');
});

test('typing "* " inside of a list section does not create a new list section', (assert) => {
  renderEditor(({post, listSection, listItem, marker}) => {
    return post([listSection('ul', [listItem([marker('*')])])]);
  });
  let position = editor.post.sections.head.items.head.tailPosition();
  editor.selectRange(position);

  assert.hasElement('#editor ul > li:contains(*)', 'precond - has li');

  Helpers.dom.insertText(editor, ' ');
  // note: the actual text is "*&nbsp;", so only check that the "*" is there,
  assert.hasElement('#editor ul > li', 'still has li');
  let el = $('#editor ul > li')[0];
  assert.equal(el.textContent, `*${NO_BREAK_SPACE}`);
});

test('typing "1 " converts to ol > li', (assert) => {
  editor = buildFromText(['1|'], {element: editorElement});
  Helpers.dom.insertText(editor, ' ');
  assert.hasNoElement('#editor p', 'p is gone');
  assert.hasElement('#editor ol > li', 'p -> "ol > li"');

  // Store the selection so we can compare later
  let selection = window.getSelection();
  let cursorElement = $('#editor ol > li > br')[0];
  assert.ok(cursorElement, 'has cursorElement for cursor position');
  Helpers.dom.selectRange(cursorElement, 0, cursorElement, 0);

  let newSelection = window.getSelection();
  assert.equal(selection.anchorNode, newSelection.anchorNode, 'correct anchorNode');
  assert.equal(selection.focusNode, newSelection.focusNode, 'correct focusNode');
  assert.equal(selection.anchorOffset, newSelection.anchorOffset, 'correct anchorOffset');
  assert.equal(selection.focusOffset, newSelection.focusOffset, 'correct focusOffset');

  Helpers.dom.insertText(editor, 'X');

  assert.hasElement('#editor li:contains(X)', 'text is inserted correctly');
});

test('typing "1. " converts to ol > li', (assert) => {
  editor = buildFromText('1.|', {element: editorElement});
  Helpers.dom.insertText(editor, ' ');
  assert.hasNoElement('#editor p', 'p is gone');
  assert.hasElement('#editor ol > li', 'p -> "ol > li"');
  Helpers.dom.insertText(editor, 'X');

  assert.hasElement('#editor li:contains(X)', 'text is inserted correctly');
});

test('an input handler will trigger anywhere in the text', (assert) => {
  editor = buildFromText('@abc@', {element: editorElement, atoms: [atom]});

  let expandCount = 0;
  let lastMatches;
  editor.onTextInput({
    name: 'at',
    text: '@',
    run: (editor, matches) => {
      expandCount++;
      lastMatches = matches;
    }
  });

  // at start
  editor.selectRange(editor.post.headPosition());
  Helpers.dom.insertText(editor, '@');
  assert.equal(expandCount, 1, 'expansion was run at start');
  assert.deepEqual(lastMatches, ['@'], 'correct match at start');

  // middle
  editor.selectRange(editor.post.sections.head.toPosition('@'.length + 1 + 'ab'.length));
  Helpers.dom.insertText(editor, '@');
  assert.equal(expandCount, 2, 'expansion was run at middle');
  assert.deepEqual(lastMatches, ['@'], 'correct match at middle');

  // end
  editor.selectRange(editor.post.tailPosition());
  Helpers.dom.insertText(editor, '@');
  assert.equal(expandCount, 3, 'expansion was run at end');
  assert.deepEqual(lastMatches, ['@'], 'correct match at end');
});

test('an input handler can provide a `match` instead of `text`', (assert) => {
  editor = buildFromText('@abc@', {element: editorElement, atoms: [atom]});

  let expandCount = 0;
  let lastMatches;
  let regex = /.(.)X$/;
  editor.onTextInput({
    name: 'test',
    match: regex,
    run: (editor, matches) => {
      expandCount++;
      lastMatches = matches;
    }
  });

  // at start
  editor.selectRange(new Range(editor.post.headPosition()));
  Helpers.dom.insertText(editor, 'abX');
  assert.equal(expandCount, 1, 'expansion was run at start');
  assert.deepEqual(lastMatches, regex.exec('abX'), 'correct match at start');

  // middle
  editor.selectRange(editor.post.sections.head.toPosition('abX'.length + 1 + 'ab'.length));
  Helpers.dom.insertText(editor, '..X');
  assert.equal(expandCount, 2, 'expansion was run at middle');
  assert.deepEqual(lastMatches, regex.exec('..X'), 'correct match at middle');

  // end
  editor.selectRange(new Range(editor.post.tailPosition()));
  Helpers.dom.insertText(editor, '**X');
  assert.equal(expandCount, 3, 'expansion was run at end');
  assert.deepEqual(lastMatches, regex.exec('**X'), 'correct match at end');
});

test('an input handler can provide a `match` that matches at start and end', (assert) => {
  editor = Helpers.editor.buildFromText(['@abc@'], {element: editorElement, atoms: [atom]});

  let expandCount = 0;
  let lastMatches;
  let regex = /^\d\d\d$/;
  editor.onTextInput({
    name: 'test',
    match: regex,
    run: (editor, matches) => {
      expandCount++;
      lastMatches = matches;
    }
  });

  // at start
  editor.selectRange(editor.post.headPosition());
  Helpers.dom.insertText(editor, '123');
  assert.equal(expandCount, 1, 'expansion was run at start');
  assert.deepEqual(lastMatches, regex.exec('123'), 'correct match at start');

  // middle
  editor.selectRange(editor.post.sections.head.toPosition('123'.length+2));
  Helpers.dom.insertText(editor, '123');
  assert.equal(expandCount, 1, 'expansion was not run at middle');

  // end
  editor.selectRange(editor.post.tailPosition());
  Helpers.dom.insertText(editor, '123');
  assert.equal(expandCount, 1, 'expansion was not run at end');
});

// See https://github.com/bustle/mobiledoc-kit/issues/400
test('input handler can be triggered by TAB', (assert) => {
  editor = Helpers.editor.buildFromText('abc|', {element: editorElement});

  let didMatch;
  editor.onTextInput({
    name: 'test',
    match: /abc\t/,
    run() {
      didMatch = true;
    }
  });

  Helpers.dom.insertText(editor, TAB);

  assert.ok(didMatch);
});

test('input handler can be triggered by ENTER', (assert) => {
  editor = Helpers.editor.buildFromText('abc|', {element: editorElement});

  let didMatch;
  editor.onTextInput({
    name: 'test',
    match: /abc\n/,
    run() {
      didMatch = true;
    }
  });

  Helpers.dom.insertText(editor, ENTER);

  assert.ok(didMatch);
});

// See https://github.com/bustle/mobiledoc-kit/issues/565
test('typing ctrl-TAB does not insert TAB text', (assert) => {
  editor = Helpers.editor.buildFromText('abc|', {element: editorElement});

  Helpers.dom.triggerKeyCommand(editor, TAB, [MODIFIERS.CTRL]);

  assert.equal(editorElement.textContent, 'abc', 'no TAB is inserted');
});

test('can unregister all handlers', (assert) => {
  editor = Helpers.editor.buildFromText('');
  // there are 3 default helpers
  assert.equal(editor._eventManager._textInputHandler._handlers.length, 3);
  editor.onTextInput({
    name: 'first',
    match: /abc\t/,
    run() {}
  });
  editor.onTextInput({
    name: 'second',
    match: /abc\t/,
    run() {}
  });
  assert.equal(editor._eventManager._textInputHandler._handlers.length, 5);
  editor.unregisterAllTextInputHandlers();
  assert.equal(editor._eventManager._textInputHandler._handlers.length, 0);
});

test('can unregister handler by name', (assert) => {
  editor = Helpers.editor.buildFromText('');
  const handlerName = 'ul';
  let handlers = editor._eventManager._textInputHandler._handlers;
  assert.ok(handlers.filter(handler => handler.name === handlerName).length);
  editor.unregisterTextInputHandler(handlerName);
  assert.notOk(handlers.filter(handler => handler.name === handlerName).length);
});

test('can unregister handlers by duplicate name', (assert) => {
  editor = Helpers.editor.buildFromText('');
  const handlerName = 'ul';
  editor.onTextInput({
    name: handlerName,
    match: /abc/,
    run() {}
  });
  let handlers = editor._eventManager._textInputHandler._handlers;
  assert.equal(handlers.length, 4); // 3 default + 1 custom handlers
  editor.unregisterTextInputHandler(handlerName);
  assert.equal(handlers.length, 2);
  assert.notOk(handlers.filter(handler => handler.name === handlerName).length);
});
