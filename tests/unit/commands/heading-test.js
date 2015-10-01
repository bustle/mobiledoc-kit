import { Editor } from 'content-kit-editor';
import Helpers from '../../test-helpers';
import { MOBILEDOC_VERSION } from 'content-kit-editor/renderers/mobiledoc';
import HeadingCommand from 'content-kit-editor/commands/heading';
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

module('Unit: HeadingCommand', {
  beforeEach() {
    fixture = document.getElementById('qunit-fixture');
    editorElement = document.createElement('div');
    editorElement.setAttribute('id', 'editor');
    fixture.appendChild(editorElement);
    editor = new Editor({mobiledoc});
    editor.render(editorElement);
    command = new HeadingCommand(editor);

    selectedText = 'IS A';
    Helpers.dom.selectText(selectedText, editorElement);
    Helpers.dom.triggerEvent(document, 'mouseup');
  },

  afterEach() {
    if (editor) { editor.destroy(); }
  }
});

test('highlight text, click "heading" button turns text into h2 header', (assert) => {
  command.exec();
  assert.hasElement('#editor h2:contains(THIS IS A TEST)');
  assert.selectedText('THIS IS A TEST', 'expands selection to entire section');
});

test('click heading button triggers update', (assert) => {
  const triggered = [];
  const triggerFn = editor.trigger;
  editor.trigger = (name, ...args) => {
    triggered.push(name);
    triggerFn.call(editor, name, ...args);
  };

  command.exec();
  assert.ok(triggered.indexOf('update') !== -1,
            'update was triggered');
});

test('highlighting heading text creates section', (assert) => {
  assert.inactiveButton('heading');
  assert.ok(editor.activeSections.map(s => s.tagName).indexOf('h2') === -1, 'heading is not in sections');

  command.exec();

  assert.ok(editor.activeSections.map(s => s.tagName).indexOf('h2') !== -1, 'heading is in sections');

  // FIXME must actually trigger the mouseup
  Helpers.dom.clearSelection();
  Helpers.dom.triggerEvent(document, 'mouseup');

  Helpers.dom.selectText(selectedText, editorElement);
  Helpers.dom.triggerEvent(document, 'mouseup');

  assert.ok(editor.activeSections.map(s => s.tagName).indexOf('h2') !== -1, 'heading is in sections');
});

test('when heading text is highlighted, exec turns it to plain text', (assert) => {
  command.exec();
  assert.hasElement('#editor h2:contains(THIS IS A TEST)');

  command.unexec();

  assert.hasNoElement('#editor h2:contains(THIS IS A TEST)');
  assert.hasElement('#editor p:contains(THIS IS A TEST)');
});

test('clicking multiple heading buttons keeps the correct ones active', (assert) => {
  let subheadingCommand = new SubheadingCommand(editor);

  subheadingCommand.exec();
  assert.hasElement('#editor h3:contains(THIS IS A TEST)');
  assert.ok(editor.activeSections.map(s => s.tagName).indexOf('h3') !== -1, 'subheading is in sections');
  assert.ok(editor.activeSections.map(s => s.tagName).indexOf('h2') === -1, 'heading is not in sections');

  command.exec();
  assert.hasElement('#editor h2:contains(THIS IS A TEST)');
  assert.ok(editor.activeSections.map(s => s.tagName).indexOf('h3') === -1, 'subheading is not in sections');
  assert.ok(editor.activeSections.map(s => s.tagName).indexOf('h2') !== -1, 'heading is not in sections');


  command.unexec();
  assert.hasElement('#editor p:contains(THIS IS A TEST)');
  assert.ok(editor.activeSections.map(s => s.tagName).indexOf('h3') === -1, 'subheading is not in sections');
  assert.ok(editor.activeSections.map(s => s.tagName).indexOf('h2') === -1, 'heading is not in sections');
});
