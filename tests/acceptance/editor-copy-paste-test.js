import { Editor } from 'mobiledoc-kit';
import Helpers from '../test-helpers';
import {
  MIME_TEXT_PLAIN,
  MIME_TEXT_HTML
} from 'mobiledoc-kit/utils/parse-utils';
import Keycodes  from 'mobiledoc-kit/utils/keycodes';

const { module, test } = Helpers;

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
    if (editor) {
      editor.destroy();
      editor = null;
    }
    Helpers.dom.clearCopyData();
  }
});

// TODO: Modify these tests to use IE's nonstandard clipboard access pattern
// See: https://remysharp.com/2015/10/14/the-art-of-debugging
test('simple copy-paste at end of section works', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(
    ({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abc')])]);
  });
  editor = new Editor({mobiledoc});
  editor.render(editorElement);

  Helpers.dom.selectText(editor, 'abc', editorElement);
  Helpers.dom.triggerCopyEvent(editor);

  let textNode = $('#editor p')[0].childNodes[0];
  assert.equal(textNode.textContent, 'abc'); //precond
  Helpers.dom.moveCursorTo(editor, textNode, textNode.length);

  Helpers.dom.triggerPasteEvent(editor);

  assert.hasElement('#editor p:contains(abcabc)', 'pastes the text');
});

test('paste plain text', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(
    ({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abc')])]);
  });
  editor = new Editor({mobiledoc});
  editor.render(editorElement);

  let textNode = $('#editor p')[0].childNodes[0];
  assert.equal(textNode.textContent, 'abc'); //precond
  Helpers.dom.moveCursorTo(editor, textNode, textNode.length);

  Helpers.dom.setCopyData(MIME_TEXT_PLAIN, 'abc');
  Helpers.dom.triggerPasteEvent(editor);

  assert.hasElement('#editor p:contains(abcabc)', 'pastes the text');
});

test('paste plain text with line breaks', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(
    ({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abc')])]);
  });
  editor = new Editor({mobiledoc});
  editor.render(editorElement);

  let textNode = $('#editor p')[0].childNodes[0];
  assert.equal(textNode.textContent, 'abc'); //precond
  Helpers.dom.moveCursorTo(editor, textNode, textNode.length);

  Helpers.dom.setCopyData(MIME_TEXT_PLAIN, ['abc', 'def'].join('\n'));
  Helpers.dom.triggerPasteEvent(editor);

  assert.hasElement('#editor p:contains(abcabc)', 'pastes the text');
  assert.hasElement('#editor p:contains(def)', 'second section is pasted');
  assert.equal($('#editor p').length, 2, 'adds a second section');
});

test('paste plain text with list items', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(
    ({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abc')])]);
  });
  editor = new Editor({mobiledoc});
  editor.render(editorElement);

  let textNode = $('#editor p')[0].childNodes[0];
  assert.equal(textNode.textContent, 'abc'); //precond
  Helpers.dom.moveCursorTo(editor, textNode, textNode.length);

  Helpers.dom.setCopyData(MIME_TEXT_PLAIN, ['* abc', '* def'].join('\n'));
  Helpers.dom.triggerPasteEvent(editor);

  assert.hasElement('#editor p:contains(abcabc)', 'pastes the text');
  assert.hasElement('#editor ul li:contains(def)', 'list item is pasted');
});

test('paste plain text into an empty Mobiledoc', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(
    ({post}) => {
    return post();
  });
  editor = new Editor({mobiledoc});
  editor.render(editorElement);

  Helpers.dom.setCopyData(MIME_TEXT_PLAIN, 'abc');
  Helpers.dom.triggerPasteEvent(editor);

  assert.hasElement('#editor p:contains(abc)', 'pastes the text');
});

test('can cut and then paste content', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(
    ({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abc')])]);
  });
  editor = new Editor({mobiledoc});
  editor.render(editorElement);

  assert.hasElement('#editor p:contains(abc)', 'precond - has p');

  Helpers.dom.selectText(editor, 'abc', editorElement);
  Helpers.dom.triggerCutEvent(editor);

  assert.hasNoElement('#editor p:contains(abc)',
                      'content removed after cutting');

  let textNode = $('#editor p')[0].childNodes[0];
  Helpers.dom.moveCursorTo(editor, textNode, textNode.length);

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

  Helpers.dom.selectText(editor, 'bc', editorElement);
  Helpers.dom.triggerCopyEvent(editor);

  Helpers.dom.selectText(editor, 'a', editorElement);

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

  Helpers.dom.selectText(editor, 'a', editorElement, 'b', editorElement);
  Helpers.dom.triggerCopyEvent(editor);

  let textNode = $('#editor p')[0].childNodes[1];
  assert.equal(textNode.textContent, 'bc'); //precond
  Helpers.dom.moveCursorTo(editor, textNode, textNode.length);

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

  Helpers.dom.selectText(editor, 'c', editorElement);
  Helpers.dom.triggerCopyEvent(editor);

  let textNode = $('#editor p')[0].childNodes[0];
  assert.equal(textNode.textContent, 'abcd'); //precond
  Helpers.dom.moveCursorTo(editor, textNode, 1);

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

  Helpers.dom.selectText(editor, 'c', editorElement);
  Helpers.dom.triggerCopyEvent(editor);

  let textNode = $('#editor p')[0].childNodes[0];
  assert.equal(textNode.textContent, 'abcd'); //precond
  Helpers.dom.moveCursorTo(editor, textNode, 0);

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
  Helpers.dom.selectText(editor, 'c', startEl, '1', endEl);

  Helpers.dom.triggerCopyEvent(editor);

  let textNode = $('#editor p')[1].childNodes[0];
  assert.equal(textNode.textContent, '123', 'precond - correct textNode');

  Helpers.dom.moveCursorTo(editor, textNode, 2); // '3'
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

  Helpers.dom.selectText(editor, 'c', editor.element, '1', editor.element);

  Helpers.dom.triggerCopyEvent(editor);

  let textNode = $('#editor p')[1].childNodes[0];
  assert.equal(textNode.textContent, '123', 'precond - correct textNode');

  Helpers.dom.moveCursorTo(editor, textNode, 3); // end of node
  Helpers.dom.triggerPasteEvent(editor);

  assert.equal($('#editor ul').length, 2, 'pastes the list');
  assert.hasElement($('#editor ul:eq(0) li:contains(list)'));
});

test('copy-paste can copy card following list section', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(
    ({post, markupSection, marker, listSection, listItem, cardSection}) => {
      return post([
        markupSection('p', [marker('abc')]),
        listSection('ul', [
          listItem([marker('list')])
        ]),
        cardSection('test-card', {foo: 'bar'}),
        markupSection('p', [marker('123')])
      ]);
    });
  let cards = [{
    name: 'test-card',
    type: 'dom',
    render({ payload }) {
      return $(`<div class='${payload.foo}'>${payload.foo}</div>`)[0];
    }
  }];
  editor = new Editor({mobiledoc, cards});
  editor.render(editorElement);

  assert.hasElement('#editor .bar', 'precond - renders card');

  Helpers.dom.selectText(editor, 'c', editor.element, '3', editor.element);

  Helpers.dom.triggerCopyEvent(editor);

  let textNode = $('#editor p')[1].childNodes[0];
  assert.equal(textNode.textContent, '123', 'precond - correct textNode');

  Helpers.dom.moveCursorTo(editor, textNode, 3); // end of node
  Helpers.dom.triggerPasteEvent(editor);

  assert.equal($('#editor ul').length, 2, 'pastes the list');
  assert.hasElement('#editor ul:eq(1) li:contains(list)');

  assert.equal($('#editor .bar').length, 2, 'renders a second card');
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

  Helpers.dom.selectText(editor, 'heading', editor.element,
                         'The text', editor.element);

  Helpers.dom.triggerCopyEvent(editor);

  let html = Helpers.dom.getCopyData(MIME_TEXT_HTML);
  let text = Helpers.dom.getCopyData(MIME_TEXT_PLAIN);
  assert.equal(text, ["heading", "h2 subheader", "The text" ].join('\n'),
               'gets plain text');

  assert.ok(html.indexOf("<h1>heading") !== -1, 'html has h1');
  assert.ok(html.indexOf("<h2>h2 subheader") !== -1, 'html has h2');
  assert.ok(html.indexOf("<p>The text") !== -1, 'html has p');
});

test('pasting when cursor is on left/right side of card adds content before/after card', (assert) => {
  let expected1, expected2;
  editor = Helpers.mobiledoc.renderInto(editorElement, ({post, markupSection, cardSection, marker}) => {
    expected1 = post([
      markupSection('p', [marker('abc')]),
      cardSection('my-card')
    ]);

    expected2 = post([
      markupSection('p', [marker('abc')]),
      cardSection('my-card'),
      markupSection('p', [marker('123')])
    ]);

    return post([
      cardSection('my-card')
    ]);
  }, {cards});

  let card = editor.post.sections.objectAt(0);
  assert.ok(card.isCardSection, 'precond - get card');

  Helpers.dom.setCopyData(MIME_TEXT_PLAIN, 'abc');
  editor.selectRange(card.headPosition());
  Helpers.dom.triggerPasteEvent(editor);

  assert.postIsSimilar(editor.post, expected1, 'content pasted before card');

  Helpers.dom.setCopyData(MIME_TEXT_PLAIN, '123');
  editor.selectRange(card.tailPosition());
  Helpers.dom.triggerPasteEvent(editor);

  assert.postIsSimilar(editor.post, expected2, 'content pasted after card');
});

// see https://github.com/bustle/mobiledoc-kit/issues/249
test('pasting when replacing a list item works', (assert) => {
  let mobiledoc = Helpers.mobiledoc.build(
    ({post, listSection, listItem, markupSection, marker}) => {
    return post([
      markupSection('p', [marker('X')]),
      listSection('ul', [
        listItem([marker('Y')])
      ])
    ]);
  });

  editor = new Editor({mobiledoc, cards});
  editor.render(editorElement);

  assert.hasElement('#editor li:contains(Y)', 'precond: has li with Y');

  Helpers.dom.selectText(editor, 'X', editorElement);
  Helpers.dom.triggerCopyEvent(editor);

  Helpers.dom.selectText(editor, 'Y', editorElement);
  Helpers.dom.triggerPasteEvent(editor);

  assert.hasElement('#editor li:contains(X)', 'replaces Y with X in li');
  assert.hasNoElement('#editor li:contains(Y)', 'li with Y is gone');
});

test('paste with shift key pastes plain text', (assert) => {
  let expected;
  editor = Helpers.mobiledoc.renderInto(editorElement, ({post, markupSection, marker, markup}) => {
    expected = post([
      markupSection('p', [
        marker('a'), marker('b', [markup('b')]), marker('cabc')
      ])
    ]);
    return post([
      markupSection('p', [
        marker('a'), marker('b', [markup('b')]), marker('c')
      ])
    ]);
  });

  editor.selectRange(editor.post.toRange());
  Helpers.dom.triggerCopyEvent(editor);
  editor.selectRange(editor.post.tailPosition());

  Helpers.dom.triggerKeyEvent(editor, 'keydown', { keyCode: Keycodes.SHIFT });
  Helpers.dom.triggerPasteEvent(editor);

  assert.postIsSimilar(editor.post, expected);
});

test('paste with html that parses to blank doc doesn\'t error', (assert) => {
  let expected;
  let mobiledoc = Helpers.mobiledoc.build(({post, markupSection, marker}) => {
    expected = post([
      markupSection('p', [])
    ]);

    return post([
      markupSection('p', [marker('abcd')])
    ]);
  });

  editor = new Editor({mobiledoc, cards});
  editor.render(editorElement);

  Helpers.dom.setCopyData('text/html', `<div></div>`);
  editor.selectRange(editor.post.toRange());
  Helpers.dom.triggerPasteEvent(editor);

  assert.postIsSimilar(editor.post, expected);
});
