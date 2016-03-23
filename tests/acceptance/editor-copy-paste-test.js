import { Editor } from 'mobiledoc-kit';
import Helpers from '../test-helpers';
import Range from 'mobiledoc-kit/utils/cursor/range';
import { supportsStandardClipboardAPI } from '../helpers/browsers';
import {
  MIME_TEXT_PLAIN,
  MIME_TEXT_HTML
} from 'mobiledoc-kit/utils/parse-utils';

const { module, skipInIE11 } = Helpers;

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

// These tests do not work in Sauce Labs on IE11 because access to the clipboard must be manually allowed.
// TODO: Configure IE11 to automatically allow access to the clipboard.
skipInIE11('simple copy-paste at end of section works', (assert) => {
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

skipInIE11('paste plain text', (assert) => {
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

skipInIE11('paste plain text with line breaks', (assert) => {
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

  if (supportsStandardClipboardAPI()) {
    assert.hasElement('#editor p:contains(abcabc)', 'pastes the text');
    assert.hasElement('#editor p:contains(def)', 'second section is pasted');
    assert.equal($('#editor p').length, 2, 'adds a second section');
  } else {
    assert.hasElement('#editor p:contains(abcabc\ndef)', 'pastes the text');
    assert.equal($('#editor p').length, 1, 'adds a second section');
  }
});

skipInIE11('paste plain text with list items', (assert) => {
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

  if (supportsStandardClipboardAPI()) {
    assert.hasElement('#editor p:contains(abcabc)', 'pastes the text');
    assert.hasElement('#editor ul li:contains(def)', 'list item is pasted');
  } else {
    assert.hasElement('#editor p:contains(abc* abc\n* def)', 'pastes the text');
  }
});

skipInIE11('can cut and then paste content', (assert) => {
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

skipInIE11('paste when text is selected replaces that text', (assert) => {
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

skipInIE11('simple copy-paste with markup at end of section works', (assert) => {
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

skipInIE11('simple copy-paste in middle of section works', (assert) => {
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

skipInIE11('simple copy-paste at start of section works', (assert) => {
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

skipInIE11('copy-paste can copy cards', (assert) => {
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

skipInIE11('copy-paste can copy list sections', (assert) => {
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

skipInIE11('copy sets html & text for pasting externally', (assert) => {
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
  if (supportsStandardClipboardAPI()) {
    let text = Helpers.dom.getCopyData(MIME_TEXT_PLAIN);
    assert.equal(text, ["heading", "h2 subheader", "The text" ].join('\n'),
                 'gets plain text');
  }

  assert.ok(html.indexOf("<h1>heading") !== -1, 'html has h1');
  assert.ok(html.indexOf("<h2>h2 subheader") !== -1, 'html has h2');
  assert.ok(html.indexOf("<p>The text") !== -1, 'html has p');
});

skipInIE11('pasting when on the end of a card is blocked', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(
    ({post, cardSection, markupSection, marker}) => {
    return post([
      cardSection('my-card'),
      markupSection('p', [marker('abc')])
    ]);
  });
  editor = new Editor({mobiledoc, cards});
  editor.render(editorElement);

  Helpers.dom.selectText(editor, 'abc', editorElement);
  Helpers.dom.triggerCopyEvent(editor);

  editor.selectRange(new Range(editor.post.sections.head.headPosition()));
  Helpers.dom.triggerPasteEvent(editor);

  assert.postIsSimilar(editor.post, Helpers.postAbstract.build(
    ({post, cardSection, markupSection, marker}) => {
      return post([
        cardSection('my-card'),
        markupSection('p', [marker('abc')])
      ]);
    }), 'no paste has occurred');

  editor.selectRange(new Range(editor.post.sections.head.tailPosition()));
  Helpers.dom.triggerPasteEvent(editor);

  assert.postIsSimilar(editor.post, Helpers.postAbstract.build(
    ({post, cardSection, markupSection, marker}) => {
      return post([
        cardSection('my-card'),
        markupSection('p', [marker('abc')])
      ]);
    }), 'no paste has occurred');
});

// see https://github.com/bustlelabs/mobiledoc-kit/issues/249
skipInIE11('pasting when replacing a list item works', (assert) => {
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
