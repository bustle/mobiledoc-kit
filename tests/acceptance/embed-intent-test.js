import { Editor } from 'content-kit-editor';
import Helpers from '../test-helpers';

const { test, module } = Helpers;

let fixture, editor, editorElement;
let mobiledocWith1Section, mobiledocWith3Sections;

const embedIntentSelector = '.ck-embed-intent-btn';

function assertHasEmbedIntent(assert, message='shows embed intent') {
  assert.hasElement(embedIntentSelector, message);
}

function assertHasNoEmbedIntent(assert, message='hides embed intent') {
  assert.hasNoElement(embedIntentSelector, message);
}

function clickEmbedIntent() {
  const embedIntent = $(embedIntentSelector)[0];
  if (!embedIntent) { throw new Error('Could not find embed intent btn'); }
  Helpers.dom.triggerEvent(embedIntent, 'click');

}

module('Acceptance: Embed intent', {
  beforeEach() {
    fixture = document.getElementById('qunit-fixture');
    editorElement = document.createElement('div');
    editorElement.setAttribute('id', 'editor');
    fixture.appendChild(editorElement);

    const build = Helpers.mobiledoc.build;
    mobiledocWith1Section = build(({post, markupSection, marker}) =>
      post([markupSection('p', [marker('only section')])])
    );
    mobiledocWith3Sections = build(({post, markupSection, marker}) =>
      post([
        markupSection('p', [marker('first section')]),
        markupSection('p'),
        markupSection('p', [marker('third section')])
      ])
    );
  },

  afterEach() {
    if (editor) { editor.destroy(); }
  }
});

test('typing inserts empty section and displays embed-intent button', (assert) => {
  editor = new Editor({mobiledoc: mobiledocWith1Section});
  editor.render(editorElement);

  assert.hasElement('#editor p', 'precond - p');

  assertHasNoEmbedIntent(assert);

  Helpers.dom.moveCursorTo(editorElement.childNodes[0].childNodes[0], 12);
  Helpers.dom.triggerEnter(editor);
  Helpers.dom.triggerEvent(editorElement, 'keyup');

  assertHasEmbedIntent(assert);
});

test('add image card between sections', (assert) => {
  const done = assert.async();

  editor = new Editor({mobiledoc: mobiledocWith3Sections});
  editor.render(editorElement);
  assert.equal($('#editor p').length, 3, 'precond - 3 p');
  assert.hasNoElement('#editor .ck-card', 'precond - no card');

  Helpers.dom.moveCursorTo(editorElement.childNodes[1].firstChild, 0);
  Helpers.dom.triggerEvent(editorElement.childNodes[1].firstChild, 'click');

  setTimeout(() => { // delay due to internal async
    assertHasEmbedIntent(assert);
    clickEmbedIntent();

    Helpers.toolbar.assertVisible(assert, 'image');
    Helpers.toolbar.clickButton(assert, 'image');

    assertHasNoEmbedIntent(assert, 'embed intent hidden after making selection');

    assert.equal($('#editor p').length, 2, '2 p after card');
    assert.hasElement('#editor .ck-card', 'has card');

    done();
  });
});

test('inserting unordered list at cursor', (assert) => {
  const done = assert.async();
  const build = Helpers.mobiledoc.build;
  const mobiledoc = build(({post, markupSection}) => post([markupSection()]));
  editor = new Editor({mobiledoc});
  editor.render(editorElement);

  assert.hasElement('#editor p', 'precond - has p');
  const p = $('#editor p')[0];
  Helpers.dom.moveCursorTo(p.childNodes[0], 0);
  Helpers.dom.triggerEvent(document, 'click'); // make embed intent show

  setTimeout(() => {
    assertHasEmbedIntent(assert);
    clickEmbedIntent();

    setTimeout(() => {
      Helpers.toolbar.assertVisible(assert, 'Unordered List');
      Helpers.toolbar.clickButton(assert, 'Unordered List');

      setTimeout(() => {
        assert.hasNoElement('#editor p', 'p has been removed');
        assert.hasElement('#editor ul li', 'adds a ul li');
        assert.equal($('#editor ul li').text(), '', 'li has no text');

        Helpers.dom.insertText(editor, 'X');
        assert.hasElement('#editor ul li:contains(X)', 'inserts text at correct spot');

        done();
      });
    });
  });
});

test('clicking in empty mobiledoc shows embed intent', (assert) => {
  const done = assert.async();
  const mobiledoc = Helpers.mobiledoc.build(({post}) => post());
  editor = new Editor({mobiledoc});
  editor.render(editorElement);

  assert.hasElement('#editor', 'precond - editor');
  assert.hasNoElement('#editor p', 'precond - editor has no p');

  Helpers.dom.moveCursorTo($('#editor')[0]);
  Helpers.dom.triggerEvent(document, 'click');

  setTimeout(() => {
    assertHasEmbedIntent(assert, 'shows embed intent');
    clickEmbedIntent();

    setTimeout(() => {
      Helpers.toolbar.assertVisible(assert, 'Unordered List');
      Helpers.toolbar.clickButton(assert, 'Unordered List');

      setTimeout(() => {
        assert.hasElement('#editor ul', 'adds list');
        Helpers.dom.insertText(editor, 'X');
        assert.hasElement('#editor ul li:contains(X)', 'inserts text');

        done();
      });
    });
  });
});

test('when editing is disabled, embedIntent does not show', (assert) => {
  const done = assert.async();
  const mobiledoc = Helpers.mobiledoc.build(({post}) => post());
  editor = new Editor({mobiledoc});
  editor.disableEditing();
  editor.render(editorElement);

  assert.hasElement('#editor', 'precond - editor');
  assert.hasNoElement('#editor p', 'precond - editor has no p');

  Helpers.dom.moveCursorTo($('#editor')[0]);
  Helpers.dom.triggerEvent(document, 'click');

  setTimeout(() => {
    assertHasNoEmbedIntent(assert, 'embed intent not shown');
    done();
  });
});
