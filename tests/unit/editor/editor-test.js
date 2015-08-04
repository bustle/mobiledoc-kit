import { MOBILEDOC_VERSION } from 'content-kit-editor/renderers/mobiledoc';
import Editor, { EDITOR_ELEMENT_CLASS_NAME } from 'content-kit-editor/editor/editor';
import { normalizeTagName } from 'content-kit-editor/utils/dom-utils';

const { module, test } = window.QUnit;

let fixture = document.getElementById('qunit-fixture');
let editorElement = document.createElement('div');
let editor;
editorElement.id = 'editor1';
editorElement.className = 'editor';

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
  assert.equal(editor.element.className, EDITOR_ELEMENT_CLASS_NAME);
});

test('creating an editor adds EDITOR_ELEMENT_CLASS_NAME if not there', (assert) => {
  editorElement.className = 'abc def';

  var editor = new Editor(document.getElementById('editor1'));
  const hasClass = (className) => editor.element.classList.contains(className);
  assert.ok(hasClass(EDITOR_ELEMENT_CLASS_NAME), 'has editor el class name');
  assert.ok(hasClass('abc') && hasClass('def'), 'preserves existing class names');
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
  let editor = new Editor(editorElement, {mobiledoc});

  assert.ok(editor.mobiledoc, 'editor has mobiledoc');
  assert.equal(editorElement.innerHTML,
               `<p>hello world</p>`);

  assert.deepEqual(editor.serialize(), mobiledoc,
                   'serialized editor === mobiledoc');
});
