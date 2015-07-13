let fixture = document.getElementById('qunit-fixture');
let editorElement = document.createElement('div');
let editor;
editorElement.id = 'editor1';
editorElement.className = 'editor';

import Editor from 'content-kit-editor/editor/editor';

const { module, test } = window.QUnit;

module('Unit: Editor', {
  beforeEach: function() {
    fixture.appendChild(editorElement);
  },
  afterEach: function() {
    if (editor) {
      editor.destroy();
    }
    fixture.removeChild(editorElement);
  }
});

test('can create an editor via dom node reference', (assert) => {
  editor = new Editor(editorElement);
  assert.equal(editor.element, editorElement);
});

test('can create an editor via dom node reference from getElementById', (assert) => {
  editor = new Editor(document.getElementById('editor1'));
  assert.equal(editor.element, editorElement);
});

test('creating an editor without a class name adds appropriate class', (assert) => {
  editorElement.className = '';

  var editor = new Editor(document.getElementById('editor1'));
  assert.equal(editor.element.className, 'ck-editor');
});

test('editor fires update event', (assert) => {
  assert.expect(2);
  let done = assert.async();

  var editor = new Editor(editorElement);
  editor.on('update', function(data) {
    assert.equal(this, editor);
    assert.equal(data.index, 99);
    done();
  });
  editor.trigger('update', { index: 99 });
});

test('editor parses and renders mobiledoc format', (assert) => {
  const mobiledoc = [
    [],
    [
      [1, 'P', [
        [[], 0, 'hello world']
      ]]
    ]
  ];
  editorElement.innerHTML = '<p>something here</p>';
  let editor = new Editor(editorElement, {mobiledoc});

  assert.ok(editor.mobiledoc, 'editor has mobiledoc');
  assert.equal(editorElement.innerHTML,
               `<p>hello world</p>`);

  assert.deepEqual(editor.serialize(), mobiledoc,
                   'serialized editor === mobiledoc');
});
