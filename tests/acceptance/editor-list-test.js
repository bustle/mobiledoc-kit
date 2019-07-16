import { Editor } from 'mobiledoc-kit';
import Helpers from '../test-helpers';

const { module, test } = Helpers;

let editor, editorElement;


function listMobileDoc() {
  return Helpers.mobiledoc.build(({post, listSection, listItem, marker}) =>
    post([
      listSection('ul', [
        listItem([marker('first item')]),
        listItem([marker('second item')])
      ])
    ])
  );
}

function createEditorWithMobiledoc(mobiledoc) {
  editor = new Editor({mobiledoc});
  editor.render(editorElement);
}

function createEditorWithListMobiledoc() {
  createEditorWithMobiledoc(listMobileDoc());
}

module('Acceptance: Editor: Lists', {
  beforeEach() {
    editorElement = $('#editor')[0];
  },
  afterEach() {
    if (editor) { editor.destroy(); }
  }
});

test('can type in middle of a list item', (assert) => {
  createEditorWithListMobiledoc();

  const listItem = $('#editor li:contains(first item)')[0];
  assert.ok(!!listItem, 'precond - has li');

  Helpers.dom.moveCursorTo(editor, listItem.childNodes[0], 'first'.length);
  Helpers.dom.insertText(editor, 'X');

  assert.hasElement('#editor li:contains(firstX item)', 'inserts text at right spot');
});

test('can type at end of a list item', (assert) => {
  createEditorWithListMobiledoc();

  const listItem = $('#editor li:contains(first item)')[0];
  assert.ok(!!listItem, 'precond - has li');

  Helpers.dom.moveCursorTo(editor, listItem.childNodes[0], 'first item'.length);
  Helpers.dom.insertText(editor, 'X');

  assert.hasElement('#editor li:contains(first itemX)', 'inserts text at right spot');
});

test('can type at start of a list item', (assert) => {
  createEditorWithListMobiledoc();

  const listItem = $('#editor li:contains(first item)')[0];
  assert.ok(!!listItem, 'precond - has li');

  Helpers.dom.moveCursorTo(editor, listItem.childNodes[0], 0);
  Helpers.dom.insertText(editor, 'X');

  assert.hasElement('#editor li:contains(Xfirst item)', 'inserts text at right spot');
});

test('can delete selection across list items', (assert) => {
  createEditorWithListMobiledoc();

  const listItem = $('#editor li:contains(first item)')[0];
  assert.ok(!!listItem, 'precond - has li1');

  const listItem2 = $('#editor li:contains(second item)')[0];
  assert.ok(!!listItem2, 'precond - has li2');

  Helpers.dom.selectText(editor ,' item', listItem, 'secon', listItem2);
  Helpers.dom.triggerDelete(editor);

  assert.hasElement('#editor li:contains(d item)', 'results in correct text');
  assert.equal($('#editor li').length, 1, 'only 1 remaining li');
});

test('can exit list section altogether by deleting', (assert) => {
  createEditorWithListMobiledoc();

  const listItem2 = $('#editor li:contains(second item)')[0];
  assert.ok(!!listItem2, 'precond - has listItem2');

  Helpers.dom.moveCursorTo(editor, listItem2.childNodes[0], 0);
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

  Helpers.dom.moveCursorTo(editor, li.childNodes[0], 'fir'.length);
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
  Helpers.dom.moveCursorTo(editor, li.childNodes[0], 'fi'.length);
  Helpers.dom.triggerEnter(editor);

  assert.hasNoElement('#editor li:contains(fir)');
  assert.hasElement('#editor li:contains(fi)', 'has split "fi" li');
  assert.hasElement('#editor li:contains(r)', 'has split "r" li');
  assert.equal($('#editor li').length, 4, 'has 4 lis');
});

test('can hit enter at end of list item to add new item', (assert) => {
  let done = assert.async();
  createEditorWithListMobiledoc();

  const li = $('#editor li:contains(first item)')[0];
  assert.ok(!!li, 'precond');

  Helpers.dom.moveCursorTo(editor, li.childNodes[0], 'first item'.length);
  Helpers.dom.triggerEnter(editor);

  assert.equal($('#editor li').length, 3, 'adds a new li');
  let newLi = $('#editor li:eq(1)');
  assert.equal(newLi.text(), '', 'new li has no text');

  Helpers.dom.insertText(editor, 'X');
  Helpers.wait(() => {
    assert.hasElement('#editor li:contains(X)', 'text goes in right spot');

    const liCount = $('#editor li').length;
    Helpers.dom.triggerEnter(editor);
    Helpers.dom.triggerEnter(editor);

    assert.equal($('#editor li').length, liCount+2, 'adds two new empty list items');
    done();
  });
});

test('hitting enter to add list item, deleting to remove it, adding new list item, exiting list and typing', (assert) => {
  createEditorWithListMobiledoc();

  let li = $('#editor li:contains(first item)')[0];
  assert.ok(!!li, 'precond');

  Helpers.dom.moveCursorTo(editor, li.childNodes[0], 'first item'.length);
  Helpers.dom.triggerEnter(editor);

  assert.equal($('#editor li').length, 3, 'adds a new li');

  Helpers.dom.triggerDelete(editor);

  assert.equal($('#editor li').length, 2, 'removes middle, empty li after delete');
  assert.equal($('#editor p').length, 1, 'adds a new paragraph section where delete happened');

  li = $('#editor li:contains(first item)')[0];
  Helpers.dom.moveCursorTo(editor, li.childNodes[0], 'first item'.length);
  Helpers.dom.triggerEnter(editor);

  assert.equal($('#editor li').length, 3, 'adds a new li after enter again');

  Helpers.dom.triggerEnter(editor);

  assert.equal($('#editor li').length, 2,
               'removes newly added li after enter on last list item');
  assert.equal($('#editor p').length, 2, 'adds a second p section');

  Helpers.dom.insertText(editor, 'X');

  assert.hasElement('#editor p:eq(0):contains(X)', 'inserts text in right spot');
});

test('hitting enter at empty last list item exists list', (assert) => {
  createEditorWithListMobiledoc();

  assert.equal($('#editor p').length, 0, 'precond - no ps');

  const li = $('#editor li:contains(second item)')[0];
  assert.ok(!!li, 'precond');

  Helpers.dom.moveCursorTo(editor, li.childNodes[0], 'second item'.length);
  Helpers.dom.triggerEnter(editor);

  assert.equal($('#editor li').length, 3, 'precond - adds a third li');

  Helpers.dom.triggerEnter(editor);

  assert.equal($('#editor li').length, 2, 'removes empty li');
  assert.equal($('#editor p').length, 1, 'adds 1 new p');
  assert.equal($('#editor p').text(), '', 'p has no text');
  assert.hasNoElement('#editor ul p', 'does not nest p under ul');

  Helpers.dom.insertText(editor, 'X');
  assert.hasElement('#editor p:contains(X)', 'text goes in right spot');
});

// https://github.com/bustle/mobiledoc-kit/issues/117
test('deleting at start of non-empty section after list item joins it with list item', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(builder => {
    const {post, markupSection, marker, listSection, listItem} = builder;
    return post([
      listSection('ul', [listItem([marker('abc')])]),
      markupSection('p', [marker('def')])
    ]);
  });
  createEditorWithMobiledoc(mobiledoc);

  const p = $('#editor p:contains(def)')[0];
  Helpers.dom.moveCursorTo(editor, p.childNodes[0], 0);
  Helpers.dom.triggerDelete(editor);

  assert.hasNoElement('#editor p');
  assert.hasElement('#editor li:contains(abcdef)');
});

// https://github.com/bustle/mobiledoc-kit/issues/117
test('deleting at start of empty section after list item joins it with list item', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(builder => {
    const {post, markupSection, marker, listSection, listItem} = builder;
    return post([
      listSection('ul', [listItem([marker('abc')])]),
      markupSection('p')
    ]);
  });
  createEditorWithMobiledoc(mobiledoc);

  assert.hasElement('#editor p br', 'precond - br');
  const node = $('#editor p br')[0];
  Helpers.dom.moveCursorTo(editor, node, 0);
  Helpers.dom.triggerDelete(editor);

  assert.hasNoElement('#editor p', 'removes p');

  Helpers.dom.insertText(editor, 'X');

  assert.hasElement('#editor li:contains(abcX)', 'inserts text at right spot');
});

test('forward-delete in empty list item with nothing after it does nothing', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(builder => {
    const {post, listSection, listItem} = builder;
    return post([
      listSection('ul', [listItem()])
    ]);
  });
  createEditorWithMobiledoc(mobiledoc);

  assert.hasElement('#editor li br', 'precond - br');
  const node = $('#editor li br')[0];
  Helpers.dom.moveCursorTo(editor, node, 0);
  Helpers.dom.triggerForwardDelete(editor);

  assert.hasElement('#editor li', 'li remains');

  Helpers.dom.insertText(editor, 'X');

  assert.hasElement('#editor li:contains(X)', 'inserts text at right spot');
});

test('forward-delete in empty li with li after it joins with li', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(builder => {
    const {post, listSection, listItem, marker} = builder;
    return post([
      listSection('ul', [listItem(), listItem([marker('abc')])])
    ]);
  });
  createEditorWithMobiledoc(mobiledoc);

  assert.equal($('#editor li').length, 2, 'precond - 2 lis');
  assert.hasElement('#editor li br', 'precond - br');
  const node = $('#editor li br')[0];
  Helpers.dom.moveCursorTo(editor, node, 0);
  Helpers.dom.triggerForwardDelete(editor);

  assert.equal($('#editor li').length, 1, '1 li remains');
  assert.hasElement('#editor li:contains(abc)', 'correct li remains');

  Helpers.dom.insertText(editor, 'X');

  assert.hasElement('#editor li:contains(Xabc)', 'inserts text at right spot');
});

test('forward-delete in empty li with markup section after it joins markup section', (assert) => {
   const mobiledoc = Helpers.mobiledoc.build(builder => {
    const {post, listSection, listItem, markupSection, marker} = builder;
    return post([
      listSection('ul', [listItem()]),
      markupSection('p', [marker('abc')])
    ]);
  });
  createEditorWithMobiledoc(mobiledoc);

  assert.hasElement('#editor li br', 'precond - br');
  const node = $('#editor li br')[0];
  Helpers.dom.moveCursorTo(editor, node, 0);
  Helpers.dom.triggerForwardDelete(editor);

  assert.hasElement('#editor li:contains(abc)', 'joins markup section');
  assert.hasNoElement('#editor p', 'p is removed');

  Helpers.dom.insertText(editor, 'X');

  assert.hasElement('#editor li:contains(Xabc)', 'inserts text at right spot');
});

test('forward-delete end of li with nothing after', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(builder => {
    const {post, listSection, listItem, marker} = builder;
    return post([
      listSection('ul', [listItem([marker('abc')])])
    ]);
  });
  createEditorWithMobiledoc(mobiledoc);

  const node = $('#editor li')[0].childNodes[0];
  Helpers.dom.moveCursorTo(editor, node, 'abc'.length);
  Helpers.dom.triggerForwardDelete(editor);

  assert.hasElement('#editor li:contains(abc)', 'li remains');
  Helpers.dom.insertText(editor, 'X');
  assert.hasElement('#editor li:contains(abcX)', 'inserts text at right spot');
});

test('forward-delete end of li with li after', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(builder => {
    const {post, listSection, listItem, marker} = builder;
    return post([
      listSection('ul', [
        listItem([marker('abc')]),
        listItem([marker('def')])
      ])
    ]);
  });
  createEditorWithMobiledoc(mobiledoc);

  assert.equal($('#editor li').length, 2, 'precond - 2 lis');
  const node = $('#editor li')[0].childNodes[0];
  Helpers.dom.moveCursorTo(editor, node, 'abc'.length);
  Helpers.dom.triggerForwardDelete(editor);

  assert.hasElement('#editor li:contains(abcdef)', 'li is joined');
  assert.equal($('#editor li').length, 1, 'only 1 li');
  Helpers.dom.insertText(editor, 'X');
  assert.hasElement('#editor li:contains(abcXdef)', 'inserts text at right spot');
});

test('forward-delete end of li with markup section after', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(builder => {
    const {post, listSection, listItem, marker, markupSection} = builder;
    return post([
      listSection('ul', [listItem([marker('abc')])]),
      markupSection('p', [marker('def')])
    ]);
  });
  createEditorWithMobiledoc(mobiledoc);

  const node = $('#editor li')[0].childNodes[0];
  Helpers.dom.moveCursorTo(editor, node, 'abc'.length);
  Helpers.dom.triggerForwardDelete(editor);

  assert.hasElement('#editor li:contains(abcdef)', 'li is joined');
  assert.equal($('#editor li').length, 1, 'only 1 li');
  assert.hasNoElement('#editor p', 'p is removed');
  Helpers.dom.insertText(editor, 'X');
  assert.hasElement('#editor li:contains(abcXdef)', 'inserts text at right spot');
});

// see https://github.com/bustle/mobiledoc-kit/issues/130
test('selecting empty list items does not cause error', (assert) => {
  const done = assert.async();
  const mobiledoc = Helpers.mobiledoc.build(builder => {
    const {post, listSection, listItem, marker} = builder;
    return post([
      listSection('ul', [
        listItem([marker('abc')]),
        listItem(),
        listItem([marker('def')])
      ])
    ]);
  });

  createEditorWithMobiledoc(mobiledoc);

  assert.equal($('#editor li').length, 3, 'precond - 3 lis');
  Helpers.dom.moveCursorTo(editor, $('#editor li:eq(1)')[0], 0,
                           $('#editor li:eq(2)')[0], 0);
  Helpers.dom.triggerEvent(editor.element, 'click');
  Helpers.wait(() => {
    assert.ok(true, 'no error');

    Helpers.dom.insertText(editor, 'X');
    assert.hasElement('#editor li:contains(Xdef)', 'insert text');
    assert.equal($('#editor li').length, 2, 'inserting text deletes selected li');
    done();
  });
});

// see https://github.com/bustle/mobiledoc-kit/issues/128
test('selecting list item and deleting leaves following section intact', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(builder => {
    const {post, markupSection, listSection, listItem, marker} = builder;
    return post([
      listSection('ul', [
        listItem([marker('abc')]), listItem()
      ]),
      markupSection('p', [marker('123')])
    ]);
  });

  createEditorWithMobiledoc(mobiledoc);

  // precond
  assert.hasElement('#editor p:contains(123)');
  assert.hasElement('#editor li:contains(abc)');

  const liTextNode  = $('#editor li:eq(0)')[0].childNodes[0];
  const emptyLiNode = $('#editor li:eq(1)')[0];
  assert.equal(liTextNode.textContent, 'abc'); // precond
  Helpers.dom.moveCursorTo(editor, liTextNode, 0, emptyLiNode, 0);
  Helpers.dom.triggerDelete(editor);

  assert.hasElement('#editor p', 'does not delete p');
  Helpers.dom.insertText(editor, 'X');
  assert.hasNoElement('#editor li:contains(abc)', 'li text is removed');
  assert.hasElement('#editor li:contains(X)', 'text is inserted');
});

test('list sections may contain attributes', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(({post, listSection, listItem, marker}) => {
    return post([
      listSection('ul', [
        listItem([marker('abc')]), listItem()
      ], {'data-md-text-align': 'center'})
    ]);
  });

  editor = new Editor({mobiledoc});
  editor.render(editorElement);

  assert.hasElement('#editor ul[data-md-text-align="center"]');
});
