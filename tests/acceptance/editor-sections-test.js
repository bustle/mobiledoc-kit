import { Editor } from 'content-kit-editor';
import Helpers from '../test-helpers';
import { MOBILEDOC_VERSION } from 'content-kit-editor/renderers/mobiledoc';
import { NO_BREAK_SPACE } from 'content-kit-editor/renderers/editor-dom';

const { test, module } = Helpers;

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
    if (editor) { editor.destroy(); }
  }
});

test('typing enter inserts new section', (assert) => {
  editor = new Editor({mobiledoc: mobileDocWith1Section});
  editor.render(editorElement);
  assert.equal($('#editor p').length, 1, 'has 1 paragraph to start');

  Helpers.dom.moveCursorTo(editorElement.childNodes[0].childNodes[0], 5);
  Helpers.dom.triggerEnter(editor);

  assert.equal($('#editor p').length, 2, 'has 2 paragraphs after typing return');
  assert.hasElement(`#editor p:contains(only)`, 'has correct first pargraph text');
  assert.hasElement('#editor p:contains(section)', 'has correct second paragraph text');
});

test('hitting enter in first section splits it correctly', (assert) => {
  editor = new Editor({mobiledoc: mobileDocWith2Sections});
  editor.render(editorElement);
  assert.equal($('#editor p').length, 2, 'precond - has 2 paragraphs');

  Helpers.dom.moveCursorTo(editorElement.childNodes[0].childNodes[0], 3);
  Helpers.dom.triggerEnter(editor);

  assert.equal($('#editor p').length, 3, 'has 3 paragraphs after typing return');

  assert.equal($('#editor p:eq(0)').text(), 'fir', 'first para has correct text');
  assert.equal($('#editor p:eq(1)').text(), 'st section', 'second para has correct text');
  assert.equal($('#editor p:eq(2)').text(), 'second section', 'third para still has correct text');

  assert.deepEqual(Helpers.dom.getCursorPosition(),
                   {node: editorElement.childNodes[1].childNodes[0],
                    offset: 0});
});

test('hitting enter at start of a section creates empty section where cursor was', (assert) => {
  editor = new Editor({mobiledoc: mobileDocWith1Section});
  editor.render(editorElement);
  assert.equal($('#editor p').length, 1, 'has 1 paragraph to start');

  Helpers.dom.moveCursorTo(editorElement.childNodes[0].childNodes[0], 0);
  Helpers.dom.triggerEnter(editor);

  assert.equal($('#editor p').length, 2, 'has 2 paragraphs after typing return');

  let firstP = $('#editor p:eq(0)');
  assert.equal(firstP.text(), '', 'first para has no text');
  assert.hasElement('#editor p:eq(1):contains(only section)', 'has correct second paragraph text');

  assert.deepEqual(Helpers.dom.getCursorPosition(),
                   {node: editorElement.childNodes[1].childNodes[0],
                    offset: 0});
});

test('hitting enter at end of a section creates new empty section', (assert) => {
  editor = new Editor({mobiledoc: mobileDocWith1Section});
  editor.render(editorElement);
  assert.equal($('#editor p').length, 1, 'has 1 section to start');

  Helpers.dom.moveCursorTo(editorElement.childNodes[0].childNodes[0], 'only section'.length);
  Helpers.dom.triggerEnter(editor);

  assert.equal($('#editor p').length, 2, 'has 2 sections after typing return');
  assert.hasElement('#editor p:eq(0):contains(only section)', 'has same first section text');
  assert.hasElement('#editor p:eq(1):contains()', 'second section has no text');

  Helpers.dom.insertText('X');

  assert.hasElement('#editor p:eq(1):contains(X)', 'text is inserted in the new section');
});

// Phantom does not recognize toggling contenteditable off
Helpers.skipInPhantom('deleting across 2 sections does nothing if editing is disabled', (assert) => {
  editor = new Editor({mobiledoc: mobileDocWith2Sections});
  editor.render(editorElement);
  editor.disableEditing();
  assert.equal($('#editor p').length, 2, 'precond - has 2 sections to start');

  const p0 = $('#editor p:eq(0)')[0],
        p1 = $('#editor p:eq(1)')[0];

  Helpers.dom.selectText('tion', p0, 'sec', p1);
  Helpers.dom.triggerDelete(editor);

  assert.equal($('#editor p').length, 2, 'still has 2 sections');
});

test('deleting across 2 sections merges them', (assert) => {
  editor = new Editor({mobiledoc: mobileDocWith2Sections});
  editor.render(editorElement);
  assert.equal($('#editor p').length, 2, 'precond - has 2 sections to start');

  const p0 = $('#editor p:eq(0)')[0],
        p1 = $('#editor p:eq(1)')[0];

  Helpers.dom.selectText('tion', p0, 'sec', p1);
  Helpers.dom.triggerDelete(editor);

  assert.equal($('#editor p').length, 1, 'has only 1 paragraph after deletion');
  assert.hasElement('#editor p:contains(first second section)',
                    'remaining paragraph has correct text');
});

test('deleting across 1 section removes it, joins the 2 boundary sections', (assert) => {
  editor = new Editor({mobiledoc: mobileDocWith3Sections});
  editor.render(editorElement);
  assert.equal($('#editor p').length, 3, 'precond - has 3 paragraphs to start');

  const p0 = $('#editor p:eq(0)')[0],
        p1 = $('#editor p:eq(1)')[0],
        p2 = $('#editor p:eq(2)')[0];
  assert.ok(p0 && p1 && p2, 'precond - paragraphs exist');

  Helpers.dom.selectText('section', p0, 'third ', p2);
  Helpers.dom.triggerDelete(editor);

  assert.equal($('#editor p').length, 1, 'has only 1 paragraph after deletion');
  assert.hasElement('#editor p:contains(first section)',
                    'remaining paragraph has correct text');
});

test('keystroke of delete removes that character', (assert) => {
  editor = new Editor({mobiledoc: mobileDocWith3Sections});
  editor.render(editorElement);
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
  editor = new Editor({mobiledoc: mobileDocWith2Markers});
  editor.render(editorElement);
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
  editor = new Editor({mobiledoc: mobileDocWith1Character});
  editor.render(editorElement);
  const getTextNode = () => editor.element.
                                  firstChild. // section
                                  firstChild; // c marker

  let textNode = getTextNode();
  assert.ok(!!textNode, 'gets text node');
  Helpers.dom.moveCursorTo(textNode, 1);

  Helpers.dom.triggerDelete(editor);

  assert.hasElement('#editor p:eq(0):contains()', 'first p is empty');

  Helpers.dom.insertText('X');
  assert.hasElement('#editor p:eq(0):contains(X)', 'text is added back to section');
});

test('keystroke of character in empty section adds character, moves cursor', (assert) => {
  editor = new Editor({mobiledoc: mobileDocWithNoCharacter});
  editor.render(editorElement);
  const getTextNode = () => editor.element.
                                  childNodes[0]. // section
                                  childNodes[0]; // marker

  let textNode = getTextNode();
  assert.ok(!!textNode, 'precond - gets text node');
  Helpers.dom.moveCursorTo(textNode, 0);

  const letter = 'M';
  Helpers.dom.insertText(letter);

  assert.equal(getTextNode().textContent, letter, 'adds character');
  assert.equal(getTextNode().textContent.length, 1);

  assert.deepEqual(Helpers.dom.getCursorPosition(),
                  {node: getTextNode(), offset: 1},
                  `cursor moves to end of ${letter} text node`);

  const otherLetter = 'X';
  Helpers.dom.insertText(otherLetter);

  assert.equal(getTextNode().textContent, `${letter}${otherLetter}`,
               'adds character in the correct spot');
  assert.equal(getTextNode().textContent.length, letter.length + otherLetter.length);
});

test('keystroke of delete at start of section joins with previous section', (assert) => {
  editor = new Editor({mobiledoc: mobileDocWith2Sections});
  editor.render(editorElement);

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
  editor = new Editor({mobiledoc: mobileDocWith2Sections});
  editor.render(editorElement);

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

test('when selection incorrectly contains P end tag, editor reports correct selection', (assert) => {
  const done = assert.async();

  editor = new Editor({mobiledoc: mobileDocWith2Sections});
  editor.render(editorElement);

  let secondSectionTextNode = editor.element.childNodes[1].firstChild;
  let firstSectionPNode = editor.element.childNodes[0];

  Helpers.dom.moveCursorTo(firstSectionPNode, 0,
                           secondSectionTextNode, 0);
  Helpers.dom.triggerEvent(document, 'mouseup');

  setTimeout(() => {
    assert.ok(true, 'No error should occur');

    let {
      headSection, tailSection, headMarker, tailMarker,
      headSectionOffset, tailSectionOffset, headMarkerOffset, tailMarkerOffset
    } = editor.cursor.offsets;

    assert.equal(headSection, editor.post.sections.objectAt(0),
                 'returns first section head');
    assert.equal(tailSection, editor.post.sections.objectAt(1),
                 'returns second section tail');
    assert.equal(headMarker, editor.post.sections.objectAt(0).markers.head,
                 'returns first section marker head');
    assert.equal(tailMarker, editor.post.sections.objectAt(1).markers.head,
                 'returns second section marker tail');
    assert.equal(headMarkerOffset, 0, 'headMarkerOffset correct');
    assert.equal(tailMarkerOffset, 0, 'tailMarkerOffset correct');
    assert.equal(headSectionOffset, 0, 'headSectionOffset correct');
    assert.equal(tailSectionOffset, 0, 'tailSectionOffset correct');

    done();
  });
});

test('when selection incorrectly contains P start tag, editor reports correct selection', (assert) => {
  const done = assert.async();

  editor = new Editor({mobiledoc: mobileDocWith2Sections});
  editor.render(editorElement);

  let firstSectionTextNode = editor.element.childNodes[0].firstChild;
  let secondSectionPNode = editor.element.childNodes[1];

  Helpers.dom.moveCursorTo(firstSectionTextNode, 0,
                           secondSectionPNode, 0);
  Helpers.dom.triggerEvent(document, 'mouseup');

  setTimeout(() => {
    assert.ok(true, 'No error should occur');

    let {
      headSection, tailSection, headMarker, tailMarker,
      headSectionOffset, tailSectionOffset, headMarkerOffset, tailMarkerOffset
    } = editor.cursor.offsets;

    assert.equal(headSection, editor.post.sections.objectAt(0),
                 'returns first section head');
    assert.equal(tailSection, editor.post.sections.objectAt(1),
                 'returns second section tail');
    assert.equal(headMarker, editor.post.sections.objectAt(0).markers.head,
                 'returns first section marker head');
    assert.equal(tailMarker, editor.post.sections.objectAt(1).markers.head,
                 'returns second section marker tail');
    assert.equal(headMarkerOffset, 0, 'headMarkerOffset correct');
    assert.equal(tailMarkerOffset, 0, 'tailMarkerOffset correct');
    assert.equal(headSectionOffset, 0, 'headSectionOffset correct');
    assert.equal(tailSectionOffset, 0, 'tailSectionOffset correct');

    done();
  });
});

test('deleting when after deletion there is a trailing space positions cursor at end of selection', (assert) => {
  const done = assert.async();

  editor = new Editor({mobiledoc: mobileDocWith2Sections});
  editor.render(editorElement);

  let firstSectionTextNode = editor.element.childNodes[0].firstChild;
  Helpers.dom.moveCursorTo(firstSectionTextNode, 'first section'.length);

  let count = 'ection'.length;
  while (count--) {
    Helpers.dom.triggerDelete(editor);
  }

  assert.equal($('#editor p:eq(0)').text(), 'first s', 'precond - correct section text after initial deletions');

  Helpers.dom.triggerDelete(editor);

  assert.equal($('#editor p:eq(0)').text(), `first${NO_BREAK_SPACE}`, 'precond - correct text after deleting last char before space');

  let text = 'e';
  Helpers.dom.insertText(text);

  setTimeout(() => {
    assert.equal($('#editor p:eq(0)').text(), `first ${text}`, 'character is placed after space');

    done();
  });
});

test('deleting when after deletion there is a leading space positions cursor at start of selection', (assert) => {
  const done = assert.async();

  editor = new Editor({mobiledoc: mobileDocWith2Sections});
  editor.render(editorElement);

  Helpers.dom.selectText('second', editorElement);
  Helpers.dom.triggerDelete(editor);

  assert.equal($('#editor p:eq(1)').text(), `${NO_BREAK_SPACE}section`, 'correct text after deletion');
  let text = 'e';
  Helpers.dom.insertText(text);

  setTimeout(() => {
    assert.equal($('#editor p:eq(1)').text(), `${text} section`, 'correct text after insertion');
    done();
  });
});

// test: deleting at start of section when previous section is a non-markup section
