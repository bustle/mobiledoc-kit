import { Editor } from 'content-kit-editor';
import Helpers from '../../test-helpers';
import { MOBILEDOC_VERSION } from 'content-kit-editor/renderers/mobiledoc';
import SubheadingCommand from 'content-kit-editor/commands/subheading';

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

module('Unit: SubheadingCommand', {
  beforeEach() {
    fixture = document.getElementById('qunit-fixture');
    editorElement = document.createElement('div');
    editorElement.setAttribute('id', 'editor');
    fixture.appendChild(editorElement);
    editor = new Editor({mobiledoc});
    editor.render(editorElement);
    command = new SubheadingCommand(editor);

    selectedText = 'IS A';
    Helpers.dom.selectText(selectedText, editorElement);
    Helpers.dom.triggerEvent(document, 'mouseup');
  },

  afterEach() {
    if (editor) { editor.destroy(); }
  }
});

test('highlight text, exec subheading turns text into h3 header', (assert) => {
  const done = assert.async();

  setTimeout(() => {
    command.exec();
    assert.hasElement('#editor h3:contains(THIS IS A TEST)');

    done();
  });
});

