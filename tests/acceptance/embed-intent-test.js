import { Editor } from 'content-kit-editor';
import Helpers from '../test-helpers';

const { test, module } = Helpers;

let fixture, editor, editorElement;
let mobiledocWith1Section, mobiledocWith3Sections;

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
  assert.equal($('#editor p').length, 1, 'has 1 paragraph to start');
  assert.hasNoElement('.ck-embed-intent', 'embed intent is hidden');

  Helpers.dom.moveCursorTo(editorElement.childNodes[0].childNodes[0], 12);
  Helpers.dom.triggerEnter(editor);
  Helpers.dom.triggerEvent(editorElement, 'keyup');

  assert.hasElement('.ck-embed-intent');
});

test('add image card between sections', (assert) => {
  const done = assert.async();

  editor = new Editor({mobiledoc: mobiledocWith3Sections});
  editor.render(editorElement);
  assert.equal(editorElement.childNodes.length, 3, 'has 3 paragraphs to start');

  Helpers.dom.moveCursorTo(editorElement.childNodes[1].firstChild, 0);
  Helpers.dom.triggerEvent(editorElement.childNodes[1].firstChild, 'click');

  setTimeout(() => { // delay due to internal async
    assert.hasElement('.ck-embed-intent', 'embed intent appears');

    Helpers.dom.triggerEvent($('.ck-embed-intent-btn')[0], 'click');
    Helpers.dom.triggerEvent($('button[title=image]')[0], 'click');

    assert.hasNoElement('.ck-embed-intent', 'embed intent is hidden');
    assert.equal(editorElement.childNodes.length, 3, 'has 3 sections after card insertion');
    assert.equal(editor.element.childNodes[0].tagName, 'P');
    assert.equal(editor.element.childNodes[1].tagName, 'DIV');
    assert.equal(editor.element.childNodes[2].tagName, 'P');

    done();
  });
});

test('inserting unordered list at cursor', (assert) => {
  const done = assert.async();
  const build = Helpers.mobiledoc.build;
  const mobiledoc = build(({post, markupSection}) =>
    post([markupSection()])
  );
  editor = new Editor({mobiledoc});
  editor.render(editorElement);

  assert.hasElement('#editor p', 'precond - has p');
  const p = $('#editor p')[0];
  Helpers.dom.moveCursorTo(p.childNodes[0], 0);
  Helpers.dom.triggerEvent(document, 'click'); // make embed intent show

  setTimeout(() => {
    assert.hasElement('.ck-embed-intent-btn');
    Helpers.dom.triggerEvent($('.ck-embed-intent-btn')[0], 'click'); // make toolbar show

    setTimeout(() => {
      Helpers.toolbar.assertVisible(assert, 'Unordered List');
      Helpers.toolbar.clickButton(assert, 'Unordered List');

      setTimeout(() => {
        assert.hasNoElement('#editor p', 'p has been removed');
        assert.hasElement('#editor ul li', 'adds a ul li');
        assert.equal($('#editor ul li').text(), '', 'li has no text');

        Helpers.dom.insertText('X');
        assert.hasElement('#editor ul li:contains(X)', 'inserts text at correct spot');

        done();
      });
    });
  });
});
