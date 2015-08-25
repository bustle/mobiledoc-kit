import Editor from 'content-kit-editor/editor/editor';
import { EDITOR_ELEMENT_CLASS_NAME } from 'content-kit-editor/editor/editor';
import { normalizeTagName } from 'content-kit-editor/utils/dom-utils';
import { MOBILEDOC_VERSION } from 'content-kit-editor/renderers/mobiledoc';

const { module, test } = window.QUnit;

let fixture, editorElement, editor;

module('Unit: Editor', {
  beforeEach: function() {
    fixture = document.getElementById('qunit-fixture');
    editorElement = document.createElement('div');
    editorElement.id = 'editor1';
    editorElement.className = 'editor';
    fixture.appendChild(editorElement);
  },

  afterEach() {
    if (editor) {
      editor.destroy();
    }
  }
});

test('can render an editor via dom node reference', (assert) => {
  editor = new Editor();
  editor.render(editorElement);
  assert.equal(editor.element, editorElement);
  assert.ok(editor.post);
  assert.equal(editor.post.sections.length, 1);
  assert.equal(editor.post.sections.head.tagName, 'p');
  assert.equal(editor.post.sections.head.markers.length, 1);
  assert.equal(editor.post.sections.head.markers.head.value, '');
});

test('creating an editor with DOM node throws', (assert) => {
  assert.throws(function() {
    editor = new Editor(document.createElement('div'));
  }, /accepts an options object/);
});

test('rendering an editor without a class name adds appropriate class', (assert) => {
  editorElement.className = '';

  editor = new Editor();
  editor.render(editorElement);
  assert.equal(editor.element.className, EDITOR_ELEMENT_CLASS_NAME);
});

test('rendering an editor adds EDITOR_ELEMENT_CLASS_NAME if not there', (assert) => {
  editorElement.className = 'abc def';

  editor = new Editor();
  editor.render(editorElement);
  const hasClass = (className) => editor.element.classList.contains(className);
  assert.ok(hasClass(EDITOR_ELEMENT_CLASS_NAME), 'has editor el class name');
  assert.ok(hasClass('abc') && hasClass('def'), 'preserves existing class names');
});

test('editor fires update event', (assert) => {
  assert.expect(2);
  let done = assert.async();

  editor = new Editor();
  editor.render(editorElement);
  editor.on('update', function(data) {
    assert.equal(this, editor);
    assert.equal(data.index, 99);
    done();
  });
  editor.trigger('update', { index: 99 });
});

test('editor parses and renders mobiledoc format', (assert) => {
  const mobiledoc = {
    version: MOBILEDOC_VERSION,
    sections: [
      [],
      [
        [1, normalizeTagName('p'), [
          [[], 0, 'hello world']
        ]]
      ]
    ]
  };
  editorElement.innerHTML = '<p>something here</p>';
  editor = new Editor({mobiledoc});
  editor.render(editorElement);

  assert.ok(editor.mobiledoc, 'editor has mobiledoc');
  assert.equal(editorElement.innerHTML,
               `<p>hello world</p>`);

  assert.deepEqual(editor.serialize(), mobiledoc,
                   'serialized editor === mobiledoc');
});

test('editor parses and renders html', (assert) => {
  editorElement.innerHTML = '<p>something here</p>';
  editor = new Editor({html: '<p>hello world</p>'});
  editor.render(editorElement);

  assert.equal(editorElement.innerHTML,
               `<p>hello world</p>`);
});

test('editor parses and renders DOM', (assert) => {
  editorElement.innerHTML = '<p>something here</p>';
  editor = new Editor({html: $('<p>hello world</p>')[0]});
  editor.render(editorElement);

  assert.equal(editorElement.innerHTML,
               `<p>hello world</p>`);
});
