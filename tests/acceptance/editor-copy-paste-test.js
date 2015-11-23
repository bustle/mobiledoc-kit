import { Editor } from 'mobiledoc-kit';
import Helpers from '../test-helpers';

const { test, module } = Helpers;

const cards = [{
  name: 'my-card',
  type: 'dom',
  render() {},
  edit() {}
}];

let editor, editorElement;

module('Acceptance: editor: copy-paste', {
  beforeEach() {
    editorElement = $('#editor')[0];
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
    type: 'dom',
    render({payload}) {
      return $(`<div class='${payload.foo}'>${payload.foo}</div>`)[0];
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

test('copy sets html & text for pasting externally', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(
    ({post, markupSection, marker}) => {
      return post([
        markupSection('h1', [marker('h1 heading')]),
        markupSection('h2', [marker('h2 subheader')]),
        markupSection('p', [marker('The text')])
      ]);
  });
  editor = new Editor({mobiledoc});
  editor.render(editorElement);

  Helpers.dom.selectText('heading', editor.element,
                         'The text', editor.element);

  Helpers.dom.triggerCopyEvent(editor);

  let text = Helpers.dom.getCopyData('text/plain');
  let html = Helpers.dom.getCopyData('text/html');
  assert.equal(text, [
    "heading",
    "h2 subheader",
    "The text"
  ].join('\n'), 'gets plain text');

  assert.ok(html.indexOf("<h1>heading") !== -1,
            'html has h1');
  assert.ok(html.indexOf("<h2>h2 subheader") !== -1,
            'html has h2');
  assert.ok(html.indexOf("<p>The text") !== -1,
            'html has p');
});

test('pasting when on the end of a card is blocked', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(
    ({post, cardSection, markupSection, marker}) => {
    return post([
      cardSection('my-card'),
      markupSection('p', [marker('abc')])
    ]);
  });
  editor = new Editor({mobiledoc, cards});
  editor.render(editorElement);

  Helpers.dom.selectText('abc', editorElement);
  Helpers.dom.triggerCopyEvent(editor);

  editor.cursor.moveToSection(editor.post.sections.head, 0);
  Helpers.dom.triggerPasteEvent(editor);

  let updatedMobiledoc = editor.serialize();
  assert.deepEqual(updatedMobiledoc.sections, [
    [],
    [
      [10, 'my-card', {}],
      [1, 'p', [
        [[], 0, 'abc']
      ]]
    ]
  ], 'no paste has occurred');

  editor.cursor.moveToSection(editor.post.sections.head, 1);
  Helpers.dom.triggerPasteEvent(editor);

  updatedMobiledoc = editor.serialize();
  assert.deepEqual(updatedMobiledoc.sections, [
    [],
    [
      [10, 'my-card', {}],
      [1, 'p', [
        [[], 0, 'abc']
      ]]
    ]
  ], 'no paste has occurred');
});
