import Helpers from '../test-helpers';

const { module, test } = Helpers;

let editor, editorElement;

function renderEditor(...args) {
  editor = Helpers.mobiledoc.renderInto(editorElement, ...args);
  editor.selectRange(editor.post.tailPosition());
  return editor;
}

module('Acceptance: Editor: Attributes', {
  beforeEach() {
    editorElement = $('#editor')[0];
  },
  afterEach() {
    if (editor) { editor.destroy(); }
  }
});

test('pressing ENTER at the end of an aligned paragraph maintains the alignment (bug #694)', (assert) => {
  renderEditor(({post, markupSection, marker}) => {
    return post([
      markupSection(
        'p',
        [marker('abc')],
        false,
        { 'data-md-text-align': 'center' }
      )
    ]);
  });

  Helpers.dom.triggerEnter(editor);

  const firstParagraph = document.querySelector('#editor p:first-of-type');
  assert.equal(firstParagraph.getAttribute('data-md-text-align'), 'center');
});

test('toggling the section inside an aligned list maintains the alignment of the list (bug #694)', (assert) => {
  renderEditor(({post, listSection, listItem, marker}) => {
    return post([
      listSection(
        'ul',
        [
          listItem([marker('abc')]),
          listItem([marker('123')])
        ],
        { 'data-md-text-align': 'center' }
      )
    ]);
  });

  editor.run(postEditor => postEditor.toggleSection('h1'));

  const ul = document.querySelector('#editor ul');
  assert.equal(ul.getAttribute('data-md-text-align'), 'center');
});
