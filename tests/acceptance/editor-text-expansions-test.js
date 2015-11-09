import { Editor } from 'content-kit-editor';
import Helpers from '../test-helpers';

const { module, test } = Helpers;

let editor, editorElement;

function insertText(text, cursorNode) {
  if (!cursorNode) {
    cursorNode = $('#editor p:eq(0)')[0];
  }
  Helpers.dom.moveCursorTo(cursorNode);
  Helpers.dom.insertText(editor, text);
}

module('Acceptance: Editor: Text Expansions', {
  beforeEach() {
    editorElement = $('#editor')[0];
  },
  afterEach() {
    if (editor) { editor.destroy(); }
  }
});

test('typing "## " converts to h2', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(
    ({post, markupSection}) => post([markupSection()]));

  editor = new Editor({mobiledoc});
  editor.render(editorElement);
  insertText('## ');

  assert.hasNoElement('#editor p', 'p is gone');
  assert.hasElement('#editor h2', 'p -> h2');

  Helpers.dom.insertText(editor, 'X');
  assert.hasElement('#editor h2:contains(X)', 'text is inserted correctly');
});

test('space is required to trigger "## " expansion', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(
    ({post, markupSection}) => post([markupSection()]));

  editor = new Editor({mobiledoc});
  editor.render(editorElement);
  insertText('##X');

  assert.hasElement('#editor p:contains(##X)', 'text inserted, no expansion');
});

test('typing "### " converts to h3', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(
    ({post, markupSection}) => post([markupSection()]));

  editor = new Editor({mobiledoc});
  editor.render(editorElement);
  insertText('### ');

  assert.hasNoElement('#editor p', 'p is gone');
  assert.hasElement('#editor h3', 'p -> h3');

  Helpers.dom.insertText(editor, 'X');
  assert.hasElement('#editor h3:contains(X)', 'text is inserted correctly');
});

test('typing "* " converts to ul > li', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(
    ({post, markupSection}) => post([markupSection()]));

  editor = new Editor({mobiledoc});
  editor.render(editorElement);
  insertText('* ');

  assert.hasNoElement('#editor p', 'p is gone');
  assert.hasElement('#editor ul > li', 'p -> "ul > li"');

  Helpers.dom.insertText(editor, 'X');
  assert.hasElement('#editor li:contains(X)', 'text is inserted correctly');
});

test('typing "* " inside of a list section does not create a new list section', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(
    ({post, listSection, listItem}) => post([listSection('ul', [listItem()])]));

  editor = new Editor({mobiledoc});
  editor.render(editorElement);

  assert.hasElement('#editor ul > li', 'precond - has li');

  const cursorNode = $('#editor li:eq(0)')[0];
  insertText('* ', cursorNode);

  // note: the actual text is "*&nbsp;", so only check that the "*" is there,
  // because checking for "* " will fail
  assert.hasElement('#editor ul > li:contains(*)', 'adds text without expanding it');
});

test('typing "1 " converts to ol > li', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(
    ({post, markupSection}) => post([markupSection()]));

  editor = new Editor({mobiledoc});
  editor.render(editorElement);
  insertText('1 ');

  assert.hasNoElement('#editor p', 'p is gone');
  assert.hasElement('#editor ol > li', 'p -> "ol > li"');

  Helpers.dom.insertText(editor, 'X');
  assert.hasElement('#editor li:contains(X)', 'text is inserted correctly');
});

test('typing "1. " converts to ol > li', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(
    ({post, markupSection}) => post([markupSection()]));

  editor = new Editor({mobiledoc});
  editor.render(editorElement);
  insertText('1. ');

  assert.hasNoElement('#editor p', 'p is gone');
  assert.hasElement('#editor ol > li', 'p -> "ol > li"');

  Helpers.dom.insertText(editor, 'X');
  assert.hasElement('#editor li:contains(X)', 'text is inserted correctly');
});

test('a new expansion can be registered', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(
    ({post, markupSection}) => post([markupSection()]));

  let didExpand = false;
  editor = new Editor({mobiledoc});
  editor.registerExpansion({
    trigger: ' '.charCodeAt(0),
    text: 'quote',
    run: () => didExpand = true
  });
  editor.render(editorElement);
  insertText('quote ');

  assert.ok(didExpand, 'expansion was run');
});
