import PostParser from 'content-kit-editor/parsers/post';
import PostNodeBuilder from 'content-kit-editor/models/post-node-builder';
import Helpers from '../../test-helpers';
import { Editor } from 'content-kit-editor';

const {module, test} = Helpers;

let builder, parser, editor;

module('Unit: Parser: PostParser', {
  beforeEach() {
    builder = new PostNodeBuilder();
    parser = new PostParser(builder);
  },
  afterEach() {
    builder = null;
    parser = null;
    if (editor) {
      editor.destroy();
      editor = null;
    }
  }
});

test('#parse can parse a section element', (assert) => {
  let element = Helpers.dom.build(t =>
    t('div', {}, [
      t('p', {}, [
        t.text('some text')
      ])
    ])
  );

  const post = parser.parse(element);
  assert.ok(post, 'gets post');
  assert.equal(post.sections.length, 1, 'has 1 section');

  const s1 = post.sections.head;
  assert.equal(s1.markers.length, 1, 's1 has 1 marker');
  assert.equal(s1.markers.head.value, 'some text', 'has text');
});

test('#parse can parse multiple elements', (assert) => {
  const element = Helpers.dom.build(t =>
    t('div', {}, [
      t('p', {}, [
        t.text('some text')
      ]),
      t('p', {}, [
        t.text('some other text')
      ])
    ])
  );

  const post = parser.parse(element);
  assert.ok(post, 'gets post');
  assert.equal(post.sections.length, 2, 'has 2 sections');

  const [s1, s2] = post.sections.toArray();
  assert.equal(s1.markers.length, 1, 's1 has 1 marker');
  assert.equal(s1.markers.head.value, 'some text');

  assert.equal(s2.markers.length, 1, 's2 has 1 marker');
  assert.equal(s2.markers.head.value, 'some other text');
});

test('editor#reparse catches changes to section', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(({post, markupSection, marker}) => 
    post([
      markupSection('p', [marker('the marker')])
    ])
  );
  editor = new Editor({mobiledoc});
  const editorElement = $('<div id="editor"></div>')[0];
  $('#qunit-fixture').append(editorElement);
  editor.render(editorElement);

  assert.hasElement('#editor p:contains(the marker)', 'precond - rendered correctly');

  const p = $('#editor p:eq(0)')[0];
  p.childNodes[0].textContent = 'the NEW marker';

  // In Firefox, changing the text content changes the selection, so re-set it
  Helpers.dom.moveCursorTo(p.childNodes[0]);

  editor.reparse();

  const section = editor.post.sections.head;
  assert.equal(section.text, 'the NEW marker');
});

test('editor#reparse catches changes to list section', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(({post, listSection, listItem, marker}) => 
    post([
      listSection('ul', [
        listItem([marker('the list item')])
      ])
    ])
  );
  editor = new Editor({mobiledoc});
  const editorElement = $('<div id="editor"></div>')[0];
  $('#qunit-fixture').append(editorElement);
  editor.render(editorElement);

  assert.hasElement('#editor li:contains(list item)', 'precond - rendered correctly');

  const li = $('#editor li:eq(0)')[0];
  li.childNodes[0].textContent = 'the NEW list item';

  // In Firefox, changing the text content changes the selection, so re-set it
  Helpers.dom.moveCursorTo(li.childNodes[0]);

  editor.reparse();

  const listItem = editor.post.sections.head.items.head;
  assert.equal(listItem.text, 'the NEW list item');
});
