import { Editor } from 'content-kit-editor';
import Helpers from '../test-helpers';

const { test, module } = Helpers;

let editor, editorElement;

module('Acceptance: editor: copy-paste', {
  beforeEach() {
    editorElement = $('<div id="editor"></div>').appendTo('#qunit-fixture')[0];
  },
  afterEach() {
    if (editor) { editor.destroy(); }
  }
});

test('simple copy-paste at end of section works', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(
    ({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abc')])]);
  });
  editor = new Editor({mobiledoc});
  editor.render(editorElement);

  Helpers.dom.selectText('abc', editorElement);
  Helpers.dom.triggerCopyEvent(editor);

  let textNode = $('#editor p')[0].childNodes[0];
  assert.equal(textNode.textContent, 'abc'); //precond
  Helpers.dom.moveCursorTo(textNode, textNode.length);

  Helpers.dom.triggerPasteEvent(editor);

  assert.hasElement('#editor p:contains(abcabc)', 'pastes the text');
});

test('can cut and then paste content', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(
    ({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abc')])]);
  });
  editor = new Editor({mobiledoc});
  editor.render(editorElement);

  assert.hasElement('#editor p:contains(abc)', 'precond - has p');

  Helpers.dom.selectText('abc', editorElement);
  Helpers.dom.triggerCutEvent(editor);

  assert.hasNoElement('#editor p:contains(abc)',
                      'content removed after cutting');

  let textNode = $('#editor p')[0].childNodes[0];
  Helpers.dom.moveCursorTo(textNode, textNode.length);

  Helpers.dom.triggerPasteEvent(editor);

  assert.hasElement('#editor p:contains(abc)', 'pastes the text');
});

test('paste when text is selected replaces that text', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(
    ({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abc')])]);
  });
  editor = new Editor({mobiledoc});
  editor.render(editorElement);

  assert.hasElement('#editor p:contains(abc)', 'precond - has p');

  Helpers.dom.selectText('bc', editorElement);
  Helpers.dom.triggerCopyEvent(editor);

  Helpers.dom.selectText('a', editorElement);

  Helpers.dom.triggerPasteEvent(editor);

  assert.hasElement('#editor p:contains(bcbc)',
                    'pastes, replacing the selection');
});

test('simple copy-paste with markup at end of section works', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(
    ({post, markupSection, marker, markup}) => {
    return post([markupSection('p', [
      marker('a', [markup('strong')]),
      marker('bc')
    ])]);
  });
  editor = new Editor({mobiledoc});
  editor.render(editorElement);

  Helpers.dom.selectText('a', editorElement, 'b', editorElement);
  Helpers.dom.triggerCopyEvent(editor);

  let textNode = $('#editor p')[0].childNodes[1];
  assert.equal(textNode.textContent, 'bc'); //precond
  Helpers.dom.moveCursorTo(textNode, textNode.length);

  Helpers.dom.triggerPasteEvent(editor);

  assert.hasElement('#editor p:contains(abcab)', 'pastes the text');
  assert.equal($('#editor p strong:contains(a)').length, 2, 'two bold As');
});

test('simple copy-paste in middle of section works', (assert) => {
   const mobiledoc = Helpers.mobiledoc.build(({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abcd')])]);
  });
  editor = new Editor({mobiledoc});
  editor.render(editorElement);

  Helpers.dom.selectText('c', editorElement);
  Helpers.dom.triggerCopyEvent(editor);

  let textNode = $('#editor p')[0].childNodes[0];
  assert.equal(textNode.textContent, 'abcd'); //precond
  Helpers.dom.moveCursorTo(textNode, 1);

  Helpers.dom.triggerPasteEvent(editor);

  assert.hasElement('#editor p:contains(acbcd)', 'pastes the text');
  Helpers.dom.insertText(editor, 'X');
  assert.hasElement('#editor p:contains(acXbcd)', 'inserts text in right spot');
});

test('simple copy-paste at start of section works', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abcd')])]);
  });
  editor = new Editor({mobiledoc});
  editor.render(editorElement);

  Helpers.dom.selectText('c', editorElement);
  Helpers.dom.triggerCopyEvent(editor);

  let textNode = $('#editor p')[0].childNodes[0];
  assert.equal(textNode.textContent, 'abcd'); //precond
  Helpers.dom.moveCursorTo(textNode, 0);

  Helpers.dom.triggerPasteEvent(editor);

  assert.hasElement('#editor p:contains(cabcd)', 'pastes the text');
  Helpers.dom.insertText(editor, 'X');
  assert.hasElement('#editor p:contains(cXabcd)', 'inserts text in right spot');
});

test('copy-paste can copy cards', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(
    ({post, markupSection, marker, cardSection}) => {
    return post([
      markupSection('p', [marker('abc')]),
      cardSection('test-card', {foo: 'bar'}),
      markupSection('p', [marker('123')])
    ]);
  });
  let cards = [{
    name: 'test-card',
    display: {
      setup(element, options, env, payload) {
        $(element).append(`<div class='${payload.foo}'>${payload.foo}</div>`);
      }
    }
  }];
  editor = new Editor({mobiledoc, cards});
  editor.render(editorElement);

  assert.hasElement('#editor .bar', 'precond - renders card');

  let startEl = $('#editor p:eq(0)')[0],
      endEl = $('#editor p:eq(1)')[0];
  assert.equal(endEl.textContent, '123', 'precond - endEl has correct text');
  Helpers.dom.selectText('c', startEl, '1', endEl);

  Helpers.dom.triggerCopyEvent(editor);

  let textNode = $('#editor p')[1].childNodes[0];
  assert.equal(textNode.textContent, '123', 'precond - correct textNode');

  Helpers.dom.moveCursorTo(textNode, 2); // '3'
  Helpers.dom.triggerPasteEvent(editor);

  assert.equal($('#editor .bar').length, 2, 'renders a second card');
});

test('copy-paste can copy list sections', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(
    ({post, markupSection, marker, listSection, listItem}) => {
    return post([
      markupSection('p', [marker('abc')]),
      listSection('ul', [
        listItem([marker('list')])
      ]),
      markupSection('p', [marker('123')])
    ]);
  });
  editor = new Editor({mobiledoc});
  editor.render(editorElement);

  Helpers.dom.selectText('c', editor.element, '1', editor.element);

  Helpers.dom.triggerCopyEvent(editor);

  let textNode = $('#editor p')[1].childNodes[0];
  assert.equal(textNode.textContent, '123', 'precond - correct textNode');

  Helpers.dom.moveCursorTo(textNode, 3); // end of node
  Helpers.dom.triggerPasteEvent(editor);

  assert.equal($('#editor ul').length, 2, 'pastes the list');
  assert.hasElement($('#editor ul:eq(0) li:contains(list)'));
});
