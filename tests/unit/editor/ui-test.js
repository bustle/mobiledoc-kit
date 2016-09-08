import { toggleLink } from 'mobiledoc-kit/editor/ui';
import Helpers from '../../test-helpers';
import Range from 'mobiledoc-kit/utils/cursor/range';

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

// In Firefox, if the window isn't active (which can happen when running tests
// at SauceLabs), the editor element won't have the selection. This helper method
// ensures that it has a cursor selection.
// See https://github.com/bustlelabs/mobiledoc-kit/issues/388
function renderIntoAndFocusTail(treeFn, options={}) {
  let editor = Helpers.mobiledoc.renderInto(editorElement, treeFn, options);
  editor.selectRange(new Range(editor.post.tailPosition()));
  return editor;
}

test('toggleLink calls the default window prompt', (assert) => {
  assert.expect(1);
  window.prompt = () => assert.ok(true, 'window.prompt called');

  editor = renderIntoAndFocusTail(({post, markupSection, marker}) => post([
    markupSection('p', [marker('something')])
  ]));

  Helpers.dom.selectText(editor ,'something', editorElement);

  toggleLink(editor);
});

test('toggleLink accepts a custom prompt function', (assert) => {
  assert.expect(1);

  let prompt = () => assert.ok(true, 'custom prompt called');

  editor = renderIntoAndFocusTail(({post, markupSection, marker}) => post([
    markupSection('p', [marker('something')])
  ]));

  Helpers.dom.selectText(editor ,'something', editorElement);

  toggleLink(editor, prompt);
});
