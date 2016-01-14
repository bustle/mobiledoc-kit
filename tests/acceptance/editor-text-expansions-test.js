import { Editor } from 'mobiledoc-kit';
import Helpers from '../test-helpers';
import Range from 'mobiledoc-kit/utils/cursor/range';
import { NO_BREAK_SPACE } from 'mobiledoc-kit/renderers/editor-dom';

const { module, test } = Helpers;

let editor, editorElement;

module('Acceptance: Editor: Text Expansions', {
  beforeEach() {
    editorElement = $('#editor')[0];
  },
  afterEach() {
    if (editor) { editor.destroy(); }
  }
});

function renderMobiledoc(builderFn) {
  let mobiledoc = Helpers.mobiledoc.build(builderFn);
  editor = new Editor({mobiledoc});
  editor.render(editorElement);
  editor.selectRange(new Range(editor.post.sections.head.tailPosition()));
}

test('typing "## " converts to h2', (assert) => {
  renderMobiledoc(({post, markupSection, marker}) => {
    return post([markupSection('p',[marker('##')])]);
  });

  Helpers.dom.insertText(editor, ' ');
  assert.hasNoElement('#editor p', 'p is gone');
  assert.hasElement('#editor h2', 'p -> h2');

  Helpers.dom.insertText(editor, 'X');
  assert.hasElement('#editor h2:contains(X)', 'text is inserted correctly');
});

test('space is required to trigger "## " expansion', (assert) => {
  renderMobiledoc(({post, markupSection, marker}) => {
    return post([markupSection('p',[marker('##')])]);
  });

  Helpers.dom.insertText(editor, 'X');
  assert.hasElement('#editor p:contains(##X)', 'text is inserted , no expansion');
});

test('typing "### " converts to h3', (assert) => {
  renderMobiledoc(({post, markupSection, marker}) => {
    return post([markupSection('p',[marker('###')])]);
  });

  Helpers.dom.insertText(editor, ' ');
  assert.hasNoElement('#editor p', 'p is gone');
  assert.hasElement('#editor h3', 'p -> h3');

  Helpers.dom.insertText(editor, 'X');
  assert.hasElement('#editor h3:contains(X)', 'text is inserted correctly');
});

test('typing "* " converts to ul > li', (assert) => {
  renderMobiledoc(({post, markupSection, marker}) => {
    return post([markupSection('p',[marker('*')])]);
  });

  Helpers.dom.insertText(editor, ' ');
  assert.hasNoElement('#editor p', 'p is gone');
  assert.hasElement('#editor ul > li', 'p -> "ul > li"');

  Helpers.dom.insertText(editor, 'X');
  assert.hasElement('#editor ul > li:contains(X)', 'text is inserted correctly');
});

// see https://github.com/bustlelabs/mobiledoc-kit/issues/280
test('typing "* " at start of markup section does not remove it', (assert) => {
  renderMobiledoc(({post, markupSection, marker}) => {
    return post([markupSection('p',[marker('*abc')])]);
  });

  let position = editor.post.sections.head.headPosition();
  position.offset = 1;
  editor.selectRange(new Range(position));

  Helpers.dom.insertText(editor, ' ');
  assert.hasElement('#editor p:contains(* abc)', 'p is still there');
});

test('typing "* " inside of a list section does not create a new list section', (assert) => {
  renderMobiledoc(({post, listSection, listItem, marker}) => {
    return post([listSection('ul', [listItem([marker('*')])])]);
  });
  let position = editor.post.sections.head.items.head.tailPosition();
  editor.selectRange(new Range(position));

  assert.hasElement('#editor ul > li:contains(*)', 'precond - has li');

  Helpers.dom.insertText(editor, ' ');
  // note: the actual text is "*&nbsp;", so only check that the "*" is there,
  assert.hasElement('#editor ul > li', 'still has li');
  let el = $('#editor ul > li')[0];
  assert.equal(el.textContent, `*${NO_BREAK_SPACE}`);
});

test('typing "1 " converts to ol > li', (assert) => {
  renderMobiledoc(({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('1')])]);
  });
  Helpers.dom.insertText(editor, ' ');
  assert.hasNoElement('#editor p', 'p is gone');
  assert.hasElement('#editor ol > li', 'p -> "ol > li"');
  Helpers.dom.insertText(editor, 'X');

  assert.hasElement('#editor li:contains(X)', 'text is inserted correctly');
});

test('typing "1. " converts to ol > li', (assert) => {
  renderMobiledoc(({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('1.')])]);
  });
  Helpers.dom.insertText(editor, ' ');
  assert.hasNoElement('#editor p', 'p is gone');
  assert.hasElement('#editor ol > li', 'p -> "ol > li"');
  Helpers.dom.insertText(editor, 'X');

  assert.hasElement('#editor li:contains(X)', 'text is inserted correctly');
});

test('a new expansion can be registered', (assert) => {
  renderMobiledoc(({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('quote')])]);
  });

  let didExpand = false;
  editor.registerExpansion({
    trigger: ' '.charCodeAt(0),
    text: 'quote',
    run: () => didExpand = true
  });
  Helpers.dom.insertText(editor, ' ');
  assert.ok(didExpand, 'expansion was run');
});
