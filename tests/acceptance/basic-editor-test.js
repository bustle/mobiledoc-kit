import { Editor } from 'content-kit-editor';

const { test, module } = QUnit;

let fixture, editor, editorElement;

module('Acceptance: editor: basic', {
  beforeEach() {
    fixture = document.getElementById('qunit-fixture');
    editorElement = document.createElement('div');
    editorElement.setAttribute('id', 'editor');
    fixture.appendChild(editorElement);
  },
  afterEach() {
    if (editor) { editor.destroy(); }
  }
});

test('sets element as contenteditable', (assert) => {
  let innerHTML = `<p>Hello</p>`;
  editorElement.innerHTML = innerHTML;
  editor = new Editor(document.getElementById('editor'));

  assert.equal(editorElement.getAttribute('contenteditable'),
               'true',
               'element is contenteditable');
  assert.equal(editorElement.firstChild.tagName, 'P',
               `editor element has a P as its first child`);
});

test('#disableEditing and #enableEditing toggle contenteditable', (assert) => {
  let innerHTML = `<p>Hello</p>`;
  editorElement.innerHTML = innerHTML;
  editor = new Editor(document.getElementById('editor'));

  assert.equal(editorElement.getAttribute('contenteditable'),
               'true',
               'element is contenteditable');
  editor.disableEditing();
  assert.equal(editorElement.getAttribute('contenteditable'),
               'false',
               'element is not contenteditable');
  editor.enableEditing();
  assert.equal(editorElement.getAttribute('contenteditable'),
               'true',
               'element is contenteditable');
});
