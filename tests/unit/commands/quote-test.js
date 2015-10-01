import { Editor } from 'content-kit-editor';
import Helpers from '../../test-helpers';
import { MOBILEDOC_VERSION } from 'content-kit-editor/renderers/mobiledoc';
import QuoteCommand from 'content-kit-editor/commands/quote';

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

module('Unit: QuoteCommand', {
  beforeEach() {
    fixture = document.getElementById('qunit-fixture');
    editorElement = document.createElement('div');
    editorElement.setAttribute('id', 'editor');
    fixture.appendChild(editorElement);
    editor = new Editor({mobiledoc});
    editor.render(editorElement);
    command = new QuoteCommand(editor);

    selectedText = 'IS A';
    Helpers.dom.selectText(selectedText, editorElement);
    Helpers.dom.triggerEvent(document, 'mouseup');
  },

  afterEach() {
    if (editor) { editor.destroy(); }
  }
});

test('highlight text, exec quote command turns text into blockquote', (assert) => {
  const done = assert.async();

  setTimeout(() => {
    command.exec();
    assert.hasElement('#editor blockquote:contains(THIS IS A TEST)');

    done();
  });
});
