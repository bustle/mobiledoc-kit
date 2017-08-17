import { Editor } from 'mobiledoc-kit';
import Helpers from '../test-helpers';
import { TAB, ENTER } from 'mobiledoc-kit/utils/characters';
import { MIME_TEXT_PLAIN } from 'mobiledoc-kit/utils/parse-utils';

const { test, module } = Helpers;

const cards = [{
  name: 'my-card',
  type: 'dom',
  render() {},
  edit() {}
}];

let editor, editorElement;

module('Acceptance: editor: #disableEditing', {
  beforeEach() {
    editorElement = $('#editor')[0];
  },
  afterEach() {
    if (editor) { editor.destroy(); }
  }
});

test('#disableEditing before render is meaningful', (assert) => {
  editor = new Editor();
  editor.disableEditing();
  editor.render(editorElement);

  assert.equal(editorElement.getAttribute('contenteditable'),'false',
            'element is not contenteditable');
  editor.enableEditing();
  assert.equal(editorElement.getAttribute('contenteditable'), 'true',
               'element is contenteditable');
});

test('when editing is disabled, the placeholder is not shown', (assert) => {
  editor = new Editor({placeholder: 'the placeholder'});
  editor.disableEditing();
  editor.render(editorElement);

  assert.isBlank(Helpers.dom.getData(editorElement, 'placeholder'),
    'no placeholder when disabled');
  editor.enableEditing();
  assert.equal(Helpers.dom.getData(editorElement, 'placeholder'), 'the placeholder',
               'placeholder is shown when editable');
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

// https://github.com/bustle/mobiledoc-kit/issues/572
test('pasting after #disableEditing does not insert text', function(assert) {
  editor = Helpers.editor.buildFromText('abc|', {element: editorElement});

  Helpers.dom.setCopyData(MIME_TEXT_PLAIN, 'def');
  Helpers.dom.triggerPasteEvent(editor);
  assert.hasElement('#editor:contains(abcdef)', 'precond - text is pasted');

  editor.disableEditing();

  Helpers.dom.selectText(editor, 'def');
  Helpers.dom.setCopyData(MIME_TEXT_PLAIN, 'ghi');
  Helpers.dom.triggerPasteEvent(editor);
  assert.hasNoElement('#editor:contains(ghi)', 'text is not pasted after #disableEditing');
});
