import { Editor } from 'content-kit-editor';
import Helpers from '../../test-helpers';
import { MOBILEDOC_VERSION } from 'content-kit-editor/renderers/mobiledoc';
import LinkCommand from 'content-kit-editor/commands/link';

const { module } = Helpers;

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

module('Unit: LinkCommand', {
  beforeEach() {
    fixture = document.getElementById('qunit-fixture');
    editorElement = document.createElement('div');
    editorElement.setAttribute('id', 'editor');
    fixture.appendChild(editorElement);
    editor = new Editor({mobiledoc});
    editor.render(editorElement);
    command = new LinkCommand(editor);

    selectedText = 'IS A';
    Helpers.dom.selectText(selectedText, editorElement);
    Helpers.dom.triggerEvent(document, 'mouseup');
  },

  afterEach() {
    if (editor) { editor.destroy(); }
  }
});

Helpers.skipInPhantom('highlight text, exec link command shows input for URL, makes link', (assert) => {
  const done = assert.async();

  setTimeout(() => {
    let url = 'http://example.com';
    command.exec(url);

    setTimeout(() => {
      assert.hasElement(`#editor a[href="${url}"]:contains(${selectedText})`);
      assert.selectedText(selectedText, 'text remains selected');
      Helpers.dom.triggerEvent(document, 'mouseup');

      setTimeout(() => {
        assert.ok(editor.markupsInSelection.map(m => m.tagName).indexOf('a') !== -1, 'a is in selection');
        command.unexec();
        done();
      });
    });
  });
});

