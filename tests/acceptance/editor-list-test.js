import { Editor } from 'content-kit-editor';
import Helpers from '../test-helpers';

const { module, test } = Helpers;

let editor, editorElement;

function createEditorWithListMobiledoc() {
  const mobiledoc = Helpers.mobiledoc.build(({post, listSection, listItem, marker}) =>
    post([
      listSection('ul', [
        listItem([marker('first item')]),
        listItem([marker('second item')])
      ])
    ])
  );

  editor = new Editor({mobiledoc});
  editor.render(editorElement);
}

module('Acceptance: Editor: Lists', {
  beforeEach() {
    editorElement = document.createElement('div');
    editorElement.setAttribute('id', 'editor');
    $('#qunit-fixture').append(editorElement);
  },
  afterEach() {
    if (editor) { editor.destroy(); }
  }
});

test('can type in middle of a list item', (assert) => {
  createEditorWithListMobiledoc();

  const listItem = $('#editor li:contains(first item)')[0];
  assert.ok(!!listItem, 'precond - has li');

  Helpers.dom.moveCursorTo(listItem.childNodes[0], 'first'.length);
  Helpers.dom.insertText(editor, 'X');

  assert.hasElement('#editor li:contains(firstX item)', 'inserts text at right spot');
});

test('can type at end of a list item', (assert) => {
  createEditorWithListMobiledoc();

  const listItem = $('#editor li:contains(first item)')[0];
  assert.ok(!!listItem, 'precond - has li');

  Helpers.dom.moveCursorTo(listItem.childNodes[0], 'first item'.length);
  Helpers.dom.insertText(editor, 'X');

  assert.hasElement('#editor li:contains(first itemX)', 'inserts text at right spot');
});

test('can type at start of a list item', (assert) => {
  createEditorWithListMobiledoc();

  const listItem = $('#editor li:contains(first item)')[0];
  assert.ok(!!listItem, 'precond - has li');

  Helpers.dom.moveCursorTo(listItem.childNodes[0], 0);
  Helpers.dom.insertText(editor, 'X');

  assert.hasElement('#editor li:contains(Xfirst item)', 'inserts text at right spot');
});

test('can delete selection across list items', (assert) => {
  createEditorWithListMobiledoc();

  const listItem = $('#editor li:contains(first item)')[0];
  assert.ok(!!listItem, 'precond - has li1');

  const listItem2 = $('#editor li:contains(second item)')[0];
  assert.ok(!!listItem2, 'precond - has li2');

  Helpers.dom.selectText(' item', listItem, 'secon', listItem2);
  Helpers.dom.triggerDelete(editor);

  assert.hasElement('#editor li:contains(d item)', 'results in correct text');
  assert.equal($('#editor li').length, 1, 'only 1 remaining li');
});

test('can exit list section altogether by deleting', (assert) => {
  createEditorWithListMobiledoc();

  const listItem2 = $('#editor li:contains(second item)')[0];
  assert.ok(!!listItem2, 'precond - has listItem2');

  Helpers.dom.moveCursorTo(listItem2.childNodes[0], 0);
  Helpers.dom.triggerDelete(editor);

  assert.hasElement('#editor li:contains(first item)', 'still has first item');
  assert.hasNoElement('#editor li:contains(second item)', 'second li is gone');
  assert.hasElement('#editor p:contains(second item)', 'second li becomes p');

  Helpers.dom.insertText(editor, 'X');

  assert.hasElement('#editor p:contains(Xsecond item)', 'new text is in right spot');
});

test('can split list item with <enter>', (assert) => {
  createEditorWithListMobiledoc();

  let li = $('#editor li:contains(first item)')[0];
  assert.ok(!!li, 'precond');

  Helpers.dom.moveCursorTo(li.childNodes[0], 'fir'.length);
  Helpers.dom.triggerEnter(editor);

  assert.hasNoElement('#editor li:contains(first item)', 'first item is split');
  assert.hasElement('#editor li:contains(fir)', 'has split "fir" li');
  assert.hasElement('#editor li:contains(st item)', 'has split "st item" li');
  assert.hasElement('#editor li:contains(second item)', 'has unchanged last li');
  assert.equal($('#editor li').length, 3, 'has 3 lis');

  // hitting enter can create the right DOM but put the AT out of sync with the
  // renderTree, so we must hit enter once more to fully test this

  li = $('#editor li:contains(fir)')[0];
  assert.ok(!!li, 'precond - has "fir"');
  Helpers.dom.moveCursorTo(li.childNodes[0], 'fi'.length);
  Helpers.dom.triggerEnter(editor);

  assert.hasNoElement('#editor li:contains(fir)');
  assert.hasElement('#editor li:contains(fi)', 'has split "fi" li');
  assert.hasElement('#editor li:contains(r)', 'has split "r" li');
  assert.equal($('#editor li').length, 4, 'has 4 lis');
});

test('can hit enter at end of list item to add new item', (assert) => {
  createEditorWithListMobiledoc();

  const li = $('#editor li:contains(first item)')[0];
  assert.ok(!!li, 'precond');

  Helpers.dom.moveCursorTo(li.childNodes[0], 'first item'.length);
  Helpers.dom.triggerEnter(editor);

  assert.equal($('#editor li').length, 3, 'adds a new li');
  let newLi = $('#editor li:eq(1)');
  assert.equal(newLi.text(), '', 'new li has no text');

  Helpers.dom.insertText(editor, 'X');
  assert.hasElement('#editor li:contains(X)', 'text goes in right spot');

  const liCount = $('#editor li').length;
  Helpers.dom.triggerEnter(editor);
  Helpers.dom.triggerEnter(editor);

  assert.equal($('#editor li').length, liCount+2, 'adds two new empty list items');
});

test('hitting enter to add list item, deleting to remove it, adding new list item, exiting list and typing', (assert) => {
  createEditorWithListMobiledoc();

  let li = $('#editor li:contains(first item)')[0];
  assert.ok(!!li, 'precond');

  Helpers.dom.moveCursorTo(li.childNodes[0], 'first item'.length);
  Helpers.dom.triggerEnter(editor);

  assert.equal($('#editor li').length, 3, 'adds a new li');

  Helpers.dom.triggerDelete(editor);

  assert.equal($('#editor li').length, 2, 'removes middle, empty li after delete');
  assert.equal($('#editor p').length, 1, 'adds a new paragraph section where delete happened');

  li = $('#editor li:contains(first item)')[0];
  Helpers.dom.moveCursorTo(li.childNodes[0], 'first item'.length);
  Helpers.dom.triggerEnter(editor);

  assert.equal($('#editor li').length, 3, 'adds a new li after enter again');

  Helpers.dom.triggerEnter(editor);

  assert.equal($('#editor li').length, 2, 'removes newly added li after enter on last list item');
  assert.equal($('#editor p').length, 2, 'adds a second p section');

  Helpers.dom.insertText(editor, 'X');

  assert.hasElement('#editor p:eq(0):contains(X)', 'inserts text in right spot');
});

test('hitting enter at empty last list item exists list', (assert) => {
  createEditorWithListMobiledoc();

  assert.equal($('#editor p').length, 0, 'precond - no ps');

  const li = $('#editor li:contains(second item)')[0];
  assert.ok(!!li, 'precond');

  Helpers.dom.moveCursorTo(li.childNodes[0], 'second item'.length);
  Helpers.dom.triggerEnter(editor);

  assert.equal($('#editor li').length, 3, 'precond - adds a third li');

  Helpers.dom.triggerEnter(editor);

  assert.equal($('#editor li').length, 2, 'removes empty li');
  assert.equal($('#editor p').length, 1, 'adds 1 new p');
  assert.equal($('#editor p').text(), '', 'p has no text');

  Helpers.dom.insertText(editor, 'X');
  assert.hasElement('#editor p:contains(X)', 'text goes in right spot');
});
