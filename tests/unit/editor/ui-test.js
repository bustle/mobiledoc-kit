import { toggleLink } from 'mobiledoc-kit/editor/ui';
import Helpers from '../../test-helpers';

const { module, test } = Helpers;

let editor, editorElement;

module('Unit: UI', {
  beforeEach() {
    editorElement = $('#editor')[0];
  },
  afterEach() {
    if (editor) {
      editor.destroy();
      editor = null;
    }
  }
});

test('toggleLink calls the default window prompt', (assert) => {
  assert.expect(1);
  window.prompt = () => assert.ok(true, 'window.prompt called');

  editor = Helpers.mobiledoc.renderIntoAndFocusTail(editorElement, ({post, markupSection, marker}) => post([
    markupSection('p', [marker('something')])
  ]));

  Helpers.dom.selectText(editor ,'something', editorElement);

  toggleLink(editor);
});

test('toggleLink accepts a custom prompt function', (assert) => {
  assert.expect(1);

  let prompt = () => assert.ok(true, 'custom prompt called');

  editor = Helpers.mobiledoc.renderIntoAndFocusTail(editorElement, ({post, markupSection, marker}) => post([
    markupSection('p', [marker('something')])
  ]));

  Helpers.dom.selectText(editor ,'something', editorElement);

  toggleLink(editor, prompt);
});
