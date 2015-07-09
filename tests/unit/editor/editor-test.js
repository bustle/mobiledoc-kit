var fixture = document.getElementById('qunit-fixture');
var editorElement = document.createElement('div');
editorElement.id = 'editor1';
editorElement.className = 'editor';

import Editor from 'content-kit-editor/editor/editor';

const { module, test, asyncTest } = window.QUnit;

module('Unit: Editor', {
  setup: function() {
    fixture.appendChild(editorElement);
  },
  teardown: function() {
    fixture.removeChild(editorElement);
  }
});

test('can create an editor via dom node reference', function() {
  var editor = new Editor(editorElement);
  equal(editor.element, editorElement);
});

test('can create an editor via dom node reference from getElementById', function() {
  var editor = new Editor(document.getElementById('editor1'));
  equal(editor.element, editorElement);
});

test('creating an editor without a class name adds appropriate class', function() {
  editorElement.className = '';

  var editor = new Editor(document.getElementById('editor1'));
  equal(editor.element.className, 'ck-editor');
});

asyncTest('editor fires update event', function() {
  expect(2);

  var editor = new Editor(editorElement);
  editor.on('update', function(data) {
    equal (this, editor);
    equal (data.index, 99);
    start();
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
