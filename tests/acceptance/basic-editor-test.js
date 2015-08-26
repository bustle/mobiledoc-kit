import { Editor } from 'content-kit-editor';
import Helpers from '../test-helpers';

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
  editor = new Editor();
  editor.render(editorElement);

  assert.equal(editorElement.getAttribute('contenteditable'),
               'true',
               'element is contenteditable');
  assert.equal(editorElement.firstChild.tagName, 'P',
               `editor element has a P as its first child`);
});

test('#disableEditing before render is meaningful', (assert) => {
  editor = new Editor();
  editor.disableEditing();
  editor.render(editorElement);

  assert.ok(!editorElement.hasAttribute('contenteditable'),
            'element is not contenteditable');
  editor.enableEditing();
  assert.equal(editorElement.getAttribute('contenteditable'),
               'true',
               'element is contenteditable');
});

test('#disableEditing and #enableEditing toggle contenteditable', (assert) => {
  editor = new Editor();
  editor.render(editorElement);

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

test('clicking outside the editor does not raise an error', (assert) => {
  editor = new Editor({autofocus: false});
  editor.render(editorElement);

  let secondEditorElement = document.createElement('div');
  document.body.appendChild(secondEditorElement);

  let secondEditor = new Editor(); // This editor will be focused
  secondEditor.render(secondEditorElement);

  Helpers.dom.triggerEvent(editorElement, 'click');

  // Embed intent uses setTimeout, so this assertion must
  // setTimeout after it to catch the exception during failure
  // cases.
  let done = assert.async();
  setTimeout(() => {
    assert.ok(true, 'can click external item without error');
    done();
    secondEditor.destroy();
    document.body.removeChild(secondEditorElement);
  }, 1);
});
