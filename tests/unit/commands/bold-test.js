import { Editor } from 'content-kit-editor';
import Helpers from '../../test-helpers';
import { MOBILEDOC_VERSION } from 'content-kit-editor/renderers/mobiledoc';
import BoldCommand from 'content-kit-editor/commands/bold';

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

module('Unit: BoldCommand', {
  beforeEach() {
    fixture = document.getElementById('qunit-fixture');
    editorElement = document.createElement('div');
    editorElement.setAttribute('id', 'editor');
    fixture.appendChild(editorElement);
    editor = new Editor({mobiledoc});
    editor.render(editorElement);
    command = new BoldCommand(editor);

    selectedText = 'IS A';
    Helpers.dom.selectText(selectedText, editorElement);
    Helpers.dom.triggerEvent(document, 'mouseup');
  },

  afterEach() {
    if (editor) { editor.destroy(); }
  }
});

test('highlight text, click "bold" button bolds text', (assert) => {
  let done = assert.async();

  setTimeout(() => {
    command.exec();
    assert.hasElement('#editor strong:contains(IS A)');

    done();
  });
});

test('highlight text, click "bold", type more text, re-select text, bold button is active', (assert) => {
  let done = assert.async();

  setTimeout(() => {
    command.exec();
    assert.hasElement('#editor strong:contains(IS A)');

    let boldTag = $('#editor strong:contains(IS A)')[0];
    let textNode = boldTag.childNodes[0];
    assert.equal(textNode.textContent, 'IS A', 'precond - correct node');

    Helpers.dom.moveCursorTo(textNode, 'IS'.length);
    Helpers.dom.insertText(editor, 'X');

    assert.hasElement('strong:contains(ISX A)', 'adds text to bold');

    Helpers.dom.selectText('ISX A', editorElement);
    Helpers.dom.triggerEvent(document, 'mouseup');

    setTimeout(() => {
      let bold = editor.builder.createMarkup('strong');
      assert.ok(editor.markupsInSelection.indexOf(bold) !== -1, 'strong is in selection');
      done();
    });
  });
});

test('exec bold command applies bold to selected text', (assert) => {
  const done = assert.async();

  setTimeout(() => {
    assert.ok(editor.markupsInSelection.map(m => m.tagName).indexOf('strong') === -1, 'strong not in selection');
    command.exec();
    assert.ok(editor.markupsInSelection.map(m => m.tagName).indexOf('strong') !== -1, 'strong in selection');

    assert.hasNoElement('#editor strong:contains(THIS)');
    assert.hasNoElement('#editor strong:contains(TEST)');
    assert.hasElement('#editor strong:contains(IS A)');

    assert.selectedText(selectedText);

    command.unexec();

    assert.hasNoElement('#editor strong:contains(IS A)', 'bold text is no longer bold');
    assert.ok(editor.markupsInSelection.map(m => m.tagName).indexOf('strong') === -1, 'strong not in selection');

    done();
  });
});

test('can unbold part of a larger set of bold text', (assert) => {
  const done = assert.async();

  setTimeout(() => {
    assert.ok(editor.markupsInSelection.map(m => m.tagName).indexOf('strong') === -1, 'strong not in selection');
    command.exec();
    assert.ok(editor.markupsInSelection.map(m => m.tagName).indexOf('strong') !== -1, 'strong in selection');

    assert.hasElement('#editor strong:contains(IS A)');

    Helpers.dom.selectText('S A', editorElement);
    Helpers.dom.triggerEvent(document, 'mouseup');

    setTimeout(() => {
      assert.ok(editor.markupsInSelection.map(m => m.tagName).indexOf('strong') !== -1, 'strong in selection');
      command.unexec();

      assert.hasElement('#editor strong:contains(I)', 'unselected text is bold');
      assert.hasNoElement('#editor strong:contains(IS A)', 'unselected text is bold');
      assert.hasElement('#editor p:contains(S A)', 'unselected text is bold');

      done();
    });
  });
});
