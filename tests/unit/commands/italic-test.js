import { Editor } from 'content-kit-editor';
import Helpers from '../../test-helpers';
import { MOBILEDOC_VERSION } from 'content-kit-editor/renderers/mobiledoc';
import ItalicCommand from 'content-kit-editor/commands/italic';

const { test, module } = Helpers;

let fixture, editor, editorElement, selectedText, command;

const mobiledoc = {
  version: MOBILEDOC_VERSION,
  sections: [
    [],
    [[
      1, 'P', [[[], 0, 'THIS IS A TEST']],
      1, 'P', [[[], 0, 'second section']]
    ]]
  ]
};

module('Unit: ItalicCommand', {
  beforeEach() {
    fixture = document.getElementById('qunit-fixture');
    editorElement = document.createElement('div');
    editorElement.setAttribute('id', 'editor');
    fixture.appendChild(editorElement);
    editor = new Editor({mobiledoc});
    editor.render(editorElement);
    command = new ItalicCommand(editor);

    selectedText = 'IS A';
    Helpers.dom.selectText(selectedText, editorElement);
    Helpers.dom.triggerEvent(document, 'mouseup');
  },

  afterEach() {
    if (editor) { editor.destroy(); }
  }
});

test('can italicize text', (assert) => {
  const done = assert.async();

  setTimeout(() => {
    assert.ok(editor.markupsInSelection.map(m => m.tagName).indexOf('em') === -1, 'em not in selection');
    command.exec();

    assert.hasElement('#editor em:contains(IS A)');
    assert.selectedText('IS A');
    assert.ok(editor.markupsInSelection.map(m => m.tagName).indexOf('em') !== -1, 'em in selection');

    command.unexec();
    assert.hasNoElement('#editor em:contains(IS A)');
    assert.ok(editor.markupsInSelection.map(m => m.tagName).indexOf('em') === -1, 'em not in selection');

    done();
  });
});
