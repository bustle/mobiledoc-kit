import { Editor } from 'content-kit-editor';
import Helpers from '../test-helpers';

const { test, module } = QUnit;

const newline = '\r\n';

let fixture, editor, editorElement;
const mobileDocWith1Section = [
  [],
  [
    [1, "P", [
      [[], 0, "only section"]
    ]]
  ]
];
const mobileDocWith2Sections = [
  [],
  [
    [1, "P", [
      [[], 0, "first section"]
    ]],
    [1, "P", [
      [[], 0, "second section"]
    ]]
  ]
];
const mobileDocWith3Sections = [
  [],
  [
    [1, "P", [
      [[], 0, "first section"]
    ]],
    [1, "P", [
      [[], 0, "second section"]
    ]],
    [1, "P", [
      [[], 0, "third section"]
    ]]
  ]
];

module('Acceptance: Editor sections', {
  beforeEach() {
    fixture = document.getElementById('qunit-fixture');
    editorElement = document.createElement('div');
    editorElement.setAttribute('id', 'editor');
    fixture.appendChild(editorElement);
  },

  afterEach() {
    editor.destroy();
  }
});

test('typing inserts section', (assert) => {
  editor = new Editor(editorElement, {mobiledoc: mobileDocWith1Section});
  assert.equal($('#editor p').length, 1, 'has 1 paragraph to start');

  const text = 'new section';

  Helpers.dom.moveCursorTo(editorElement);
  document.execCommand('insertText', false, text + newline);

  assert.equal($('#editor p').length, 2, 'has 2 paragraphs after typing return');
  assert.hasElement(`#editor p:contains(${text})`, 'has first pargraph with "A"');
  assert.hasElement('#editor p:contains(only section)', 'has correct second paragraph text');
});

test('deleting across 0 sections merges them', (assert) => {
  editor = new Editor(editorElement, {mobiledoc: mobileDocWith2Sections});
  assert.equal($('#editor p').length, 2, 'precond - has 2 sections to start');

  const p0 = $('#editor p:eq(0)')[0],
        p1 = $('#editor p:eq(1)')[0];

  Helpers.dom.selectText('tion', p0, 'sec', p1);
  document.execCommand('delete', false);

  assert.equal($('#editor p').length, 1, 'has only 1 paragraph after deletion');
  assert.hasElement('#editor p:contains(first second section)',
                    'remaining paragraph has correct text');
});

test('deleting across 1 section removes it, joins the 2 boundary sections', (assert) => {
  editor = new Editor(editorElement, {mobiledoc: mobileDocWith3Sections});
  assert.equal($('#editor p').length, 3, 'precond - has 3 paragraphs to start');

  const p0 = $('#editor p:eq(0)')[0],
        p1 = $('#editor p:eq(1)')[0],
        p2 = $('#editor p:eq(2)')[0];
  assert.ok(p0 && p1 && p2, 'precond - paragraphs exist');

  Helpers.dom.selectText('section', p0, 'third ', p2);

  document.execCommand('delete', false);


  assert.equal($('#editor p').length, 1, 'has only 1 paragraph after deletion');
  assert.hasElement('#editor p:contains(first section)',
                    'remaining paragraph has correct text');
});
