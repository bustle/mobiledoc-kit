import Helpers from '../test-helpers';

const { module, test } = Helpers;

let editor, editorElement;

function findCenterPointOfTextNode(node) {
  let range = document.createRange();
  range.setStart(node, 0);
  range.setEnd(node, node.textContent.length);

  let {left, top, width, height} = range.getBoundingClientRect();

  let clientX = left + width/2;
  let clientY = top + height/2;

  return {clientX, clientY};
}

module('Acceptance: editor: drag-drop', {
  beforeEach() {
    editorElement = $('#editor')[0];

    /**
     * `document.elementFromPoint` return `null` if the element is outside the
     * viewport, so force the editor element to be in the viewport for this test suite
     */
    $(editorElement).css({
      position: 'fixed',
      top: '100px',
      left: '100px'
    });
  },
  afterEach() {
    if (editor) {
      editor.destroy();
      editor = null;
    }
  }
});

test('inserts dropped HTML content at the drop position', (assert) => {
  let expected;
  editor = Helpers.mobiledoc.renderInto(editorElement, ({post, markupSection, marker}) => {
    expected = post([markupSection('h2', [marker('--->some text<---')])]);
    return post([markupSection('h2', [marker('---><---')])]);
  });

  let html = '<p>some text</p>';
  let node = Helpers.dom.findTextNode(editorElement, '---><---');
  let {clientX, clientY} = findCenterPointOfTextNode(node);
  Helpers.dom.triggerDropEvent(editor, {html, clientX, clientY});

  assert.postIsSimilar(editor.post, expected);
});

test('inserts dropped text content at the drop position if no html data', (assert) => {
  let expected;
  editor = Helpers.mobiledoc.renderInto(editorElement, ({post, markupSection, marker}) => {
    expected = post([markupSection('h2', [marker('--->some text<---')])]);
    return post([markupSection('h2', [marker('---><---')])]);
  });

  let text = 'some text';
  let node = Helpers.dom.findTextNode(editorElement, '---><---');
  let {clientX, clientY} = findCenterPointOfTextNode(node);
  Helpers.dom.triggerDropEvent(editor, {text, clientX, clientY});

  assert.postIsSimilar(editor.post, expected);
});
