import { Editor } from 'content-kit-editor';
import Helpers from '../test-helpers';
import { MOBILEDOC_VERSION } from 'content-kit-editor/renderers/mobiledoc';
import { UNPRINTABLE_CHARACTER } from 'content-kit-editor/renderers/editor-dom';

const { test, module } = QUnit;

let fixture, editor, editorElement;
const mobileDocWith1Section = {
  version: MOBILEDOC_VERSION,
  sections: [
    [],
    [
      [1, "P", [
        [[], 0, "only section"]
      ]]
    ]
  ]
};
const mobileDocWith2Sections = {
  version: MOBILEDOC_VERSION,
  sections: [
    [],
    [
      [1, "P", [
        [[], 0, "first section"]
      ]],
      [1, "P", [
        [[], 0, "second section"]
      ]]
    ]
  ]
};
const mobileDocWith3Sections = {
  version: MOBILEDOC_VERSION,
  sections: [
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
  ]
};

const mobileDocWith2Markers = {
  version: MOBILEDOC_VERSION,
  sections: [
    [['b']],
    [
      [1, "P", [
        [[0], 1, "bold"],
        [[], 0, "plain"]
      ]]
    ]
  ]
};

const mobileDocWith1Character = {
  version: MOBILEDOC_VERSION,
  sections: [
    [],
    [
      [1, "P", [
        [[], 0, "c"]
      ]]
    ]
  ]
};

const mobileDocWithNoCharacter = {
  version: MOBILEDOC_VERSION,
  sections: [
    [],
    [
      [1, "P", [
        [[], 0, ""]
      ]]
    ]
  ]
};

module('Acceptance: Editor sections', {
  beforeEach() {
    fixture = document.getElementById('qunit-fixture');
    editorElement = document.createElement('div');
    editorElement.setAttribute('id', 'editor');
    fixture.appendChild(editorElement);
  },

  afterEach() {
    if (editor) {
      editor.destroy();
    }
  }
});

Helpers.skipInPhantom('typing inserts section', (assert) => {
  editor = new Editor(editorElement, {mobiledoc: mobileDocWith1Section});
  assert.equal($('#editor p').length, 1, 'has 1 paragraph to start');

  Helpers.dom.moveCursorTo(editorElement.childNodes[0].childNodes[0], 5);
  Helpers.dom.triggerKeyEvent(document, 'keydown', Helpers.dom.KEY_CODES.ENTER);

  assert.equal($('#editor p').length, 2, 'has 2 paragraphs after typing return');
  assert.hasElement(`#editor p:contains(only)`, 'has correct first pargraph text');
  assert.hasElement('#editor p:contains(section)', 'has correct second paragraph text');
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

test('keystroke of delete removes that character', (assert) => {
  editor = new Editor(editorElement, {mobiledoc: mobileDocWith3Sections});
  const getFirstTextNode = () => {
    return editor.element.
             firstChild. // section
             firstChild; // marker
  };
  const textNode = getFirstTextNode();
  Helpers.dom.moveCursorTo(textNode, 1);

  Helpers.dom.triggerDelete(editor);

  assert.equal($('#editor p:eq(0)').html(), 'irst section',
               'deletes first character');

  const newTextNode = getFirstTextNode();
  assert.deepEqual(Helpers.dom.getCursorPosition(),
                   {node: newTextNode, offset: 0},
                   'cursor is at start of new text node');
});

test('keystroke of delete when cursor is at beginning of marker removes character from previous marker', (assert) => {
  editor = new Editor(editorElement, {mobiledoc: mobileDocWith2Markers});
  const textNode = editor.element.
                    firstChild.    // section
                    childNodes[1]; // plain marker

  assert.ok(!!textNode, 'gets text node');
  Helpers.dom.moveCursorTo(textNode, 0);

  Helpers.dom.triggerDelete(editor);

  assert.equal($('#editor p:eq(0)').html(), '<b>bol</b>plain',
               'deletes last character of previous marker');

  const boldNode = editor.element.firstChild. // section
                                  firstChild; // bold marker
  const boldTextNode = boldNode.firstChild;

  assert.deepEqual(Helpers.dom.getCursorPosition(),
                  {node: boldTextNode, offset: 3},
                  'cursor moves to end of previous text node');
});

test('keystroke of delete when cursor is after only char in only marker of section removes character', (assert) => {
  editor = new Editor(editorElement, {mobiledoc: mobileDocWith1Character});
  const getTextNode = () => editor.element.
                                  firstChild. // section
                                  firstChild; // c marker

  let textNode = getTextNode();
  assert.ok(!!textNode, 'gets text node');
  Helpers.dom.moveCursorTo(textNode, 1);

  Helpers.dom.triggerDelete(editor);

  assert.equal($('#editor p:eq(0)')[0].textContent, UNPRINTABLE_CHARACTER,
               'deletes only character');

  textNode = getTextNode();
  assert.deepEqual(Helpers.dom.getCursorPosition(),
                  {node: textNode, offset: 0},
                  'cursor moves to start of empty text node');
});

Helpers.skipInPhantom('keystroke of character results in unprintable being removed', (assert) => {
  editor = new Editor(editorElement, {mobiledoc: mobileDocWithNoCharacter});
  const getTextNode = () => editor.element.
                                  firstChild. // section
                                  firstChild; // marker

  let textNode = getTextNode();
  assert.ok(!!textNode, 'gets text node');
  Helpers.dom.moveCursorTo(textNode, 1);

  const runDefault = Helpers.dom.triggerKeyEvent(document, 'keydown', Helpers.dom.KEY_CODES.M);
  if (runDefault) {
    document.execCommand('insertText', false, 'm');
    Helpers.dom.triggerEvent(editor.element, 'input');
  }

  textNode = getTextNode();
  assert.equal(textNode.textContent, 'm',
               'adds character');

  assert.equal(textNode.textContent.length, 1);

  assert.deepEqual(Helpers.dom.getCursorPosition(),
                  {node: textNode, offset: 1},
                  'cursor moves to end of m text node');
});

test('keystroke of delete at start of section joins with previous section', (assert) => {
  editor = new Editor(editorElement, {mobiledoc: mobileDocWith2Sections});

  let secondSectionTextNode = editor.element.childNodes[1].firstChild;

  assert.equal(secondSectionTextNode.textContent, 'second section',
               'finds section section text node');

  Helpers.dom.moveCursorTo(secondSectionTextNode, 0);
  Helpers.dom.triggerDelete(editor);

  assert.equal(editor.element.childNodes.length, 1, 'only 1 section remaining');

  let secondSectionNode = editor.element.firstChild;
  secondSectionTextNode = secondSectionNode.firstChild;
  assert.equal(secondSectionNode.textContent,
               'first sectionsecond section',
               'joins two sections');

  assert.deepEqual(Helpers.dom.getCursorPosition(),
                  {node: secondSectionTextNode,
                   offset: secondSectionTextNode.textContent.length},
                  'cursor moves to end of first section');
});


test('keystroke of delete at start of first section does nothing', (assert) => {
  editor = new Editor(editorElement, {mobiledoc: mobileDocWith2Sections});

  let firstSectionTextNode = editor.element.childNodes[0].firstChild;

  assert.equal(firstSectionTextNode.textContent, 'first section',
               'finds first section text node');

  Helpers.dom.moveCursorTo(firstSectionTextNode, 0);

  Helpers.dom.triggerDelete(editor);

  assert.equal(editor.element.childNodes.length, 2, 'still 2 sections');
  firstSectionTextNode = editor.element.childNodes[0].firstChild;
  assert.equal(firstSectionTextNode.textContent,
               'first section',
               'first section still has same text content');

  assert.deepEqual(Helpers.dom.getCursorPosition(),
                  {node: firstSectionTextNode,
                   offset: 0},
                  'cursor stays at start of first section');
});

// test: deleting at start of section when previous section is a non-markup section
