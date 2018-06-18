import { Editor } from 'mobiledoc-kit';
import Helpers from '../test-helpers';
import { MOBILEDOC_VERSION } from 'mobiledoc-kit/renderers/mobiledoc/0-2';
import { NO_BREAK_SPACE } from 'mobiledoc-kit/renderers/editor-dom';
import Range from 'mobiledoc-kit/utils/cursor/range';
import Keycodes from 'mobiledoc-kit/utils/keycodes';
import Browser from 'mobiledoc-kit/utils/browser';
import { DIRECTION } from 'mobiledoc-kit/utils/key';

const { test, module } = Helpers;

let editor, editorElement;
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
    editorElement = $('#editor')[0];
  },

  afterEach() {
    if (editor) {
      editor.destroy();
      editor = null;
    }
  }
});

test('typing enter inserts new section', (assert) => {
  editor = new Editor({mobiledoc: mobileDocWith1Section});
  editor.render(editorElement);
  assert.equal($('#editor p').length, 1, 'has 1 paragraph to start');

  Helpers.dom.moveCursorTo(editor, editorElement.childNodes[0].childNodes[0], 5);
  Helpers.dom.triggerEnter(editor);

  assert.equal($('#editor p').length, 2, 'has 2 paragraphs after typing return');
  assert.hasElement(`#editor p:contains(only)`, 'has correct first pargraph text');
  assert.hasElement('#editor p:contains(section)', 'has correct second paragraph text');
});

test('typing enter inserts new section from blank section', (assert) => {
  editor = new Editor({mobiledoc: mobileDocWithNoCharacter});
  editor.render(editorElement);
  assert.equal($('#editor p').length, 1, 'has 1 paragraph to start');

  Helpers.dom.moveCursorTo(editor, editorElement.childNodes[0].childNodes[0], 0);
  Helpers.dom.triggerEnter(editor);

  assert.equal($('#editor p').length, 2, 'has 2 paragraphs after typing return');
});

test('hitting enter in first section splits it correctly', (assert) => {
  editor = new Editor({mobiledoc: mobileDocWith2Sections});
  editor.render(editorElement);
  assert.equal($('#editor p').length, 2, 'precond - has 2 paragraphs');

  Helpers.dom.moveCursorTo(editor, editorElement.childNodes[0].childNodes[0], 3);
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

  Helpers.dom.moveCursorTo(editor, editorElement.childNodes[0].childNodes[0], 0);
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

  Helpers.dom.moveCursorTo(editor, editorElement.childNodes[0].childNodes[0], 'only section'.length);
  Helpers.dom.triggerEnter(editor);

  assert.equal($('#editor p').length, 2, 'has 2 sections after typing return');
  assert.hasElement('#editor p:eq(0):contains(only section)', 'has same first section text');
  assert.hasElement('#editor p:eq(1):contains()', 'second section has no text');

  Helpers.dom.insertText(editor, 'X');

  assert.hasElement('#editor p:eq(1):contains(X)', 'text is inserted in the new section');
});

test('hitting enter in a section creates a new basic section', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(({post, markupSection, marker}) =>
    post([
      markupSection('h2', [marker('abc')])
    ])
  );
  editor = new Editor({mobiledoc});
  editor.render(editorElement);
  assert.hasElement('#editor h2:contains(abc)', 'precond - h2 is there');
  assert.hasNoElement('#editor p', 'precond - no p tag');

  Helpers.dom.moveCursorTo(editor, $('#editor h2')[0].childNodes[0], 'abc'.length);
  Helpers.dom.triggerEnter(editor);
  Helpers.dom.insertText(editor, 'X');

  assert.hasElement('#editor h2:contains(abc)', 'h2 still there');
  assert.hasElement('#editor p:contains(X)', 'p tag instead of h2 generated');
});

test('deleting across 2 sections does nothing if editing is disabled', (assert) => {
  editor = new Editor({mobiledoc: mobileDocWith2Sections});
  editor.render(editorElement);
  editor.disableEditing();
  assert.equal($('#editor p').length, 2, 'precond - has 2 sections to start');

  const p0 = $('#editor p:eq(0)')[0],
        p1 = $('#editor p:eq(1)')[0];

  Helpers.dom.selectText(editor ,'tion', p0, 'sec', p1);
  Helpers.dom.triggerDelete(editor);

  assert.equal($('#editor p').length, 2, 'still has 2 sections');
});

test('deleting across 2 sections merges them', (assert) => {
  editor = new Editor({mobiledoc: mobileDocWith2Sections});
  editor.render(editorElement);
  assert.equal($('#editor p').length, 2, 'precond - has 2 sections to start');

  const p0 = $('#editor p:eq(0)')[0],
        p1 = $('#editor p:eq(1)')[0];

  Helpers.dom.selectText(editor ,'tion', p0, 'sec', p1);
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

  Helpers.dom.selectText(editor ,'section', p0, 'third ', p2);
  Helpers.dom.triggerDelete(editor);

  assert.equal($('#editor p').length, 1, 'has only 1 paragraph after deletion');
  assert.hasElement('#editor p:contains(first section)',
                    'remaining paragraph has correct text');
});

test('failing to delete will not trigger deleting hooks', (assert) => {
  assert.expect(0);
  editor = new Editor({mobiledoc: mobileDocWith2Sections});
  editor.willDelete(() => {
    assert.ok(false, 'willDelete should not be triggered');
  });
  editor.didDelete(() => {
    assert.ok(false, 'didDelete should not be triggered');
  });

  editor.render(editorElement);
  editor.disableEditing();
  Helpers.dom.triggerDelete(editor);
});

test('deleting chracter triggers deleting hooks', (assert) => {
  assert.expect(9);
  let lifeCycles = [];

  editor = new Editor({mobiledoc: mobileDocWith2Sections});
  editor.willDelete((range, direction, unit) => {
    assert.ok(range, 'range is not empty');
    assert.equal(direction, -1, 'direction defaults to -1');
    assert.equal(unit, 'char', 'unit defaults to char');
    assert.ok(true, 'willDelete is triggered');
    lifeCycles.push('willDelete');
  });
  editor.didDelete((range, direction, unit) => {
    assert.ok(range, 'range is not empty');
    assert.equal(direction, -1, 'direction defaults to -1');
    assert.equal(unit, 'char', 'unit defaults to char');
    assert.ok(true, 'didDelete is triggered');
    lifeCycles.push('didDelete');
  });
  editor.render(editorElement);

  Helpers.dom.triggerDelete(editor);
  assert.deepEqual(lifeCycles, ['willDelete', 'didDelete'], 'hooks are triggered in order');
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
  Helpers.dom.moveCursorTo(editor, textNode, 1);

  Helpers.dom.triggerDelete(editor);

  assert.equal($('#editor p:eq(0)').html(), 'irst section',
               'deletes first character');

  const newTextNode = getFirstTextNode();
  assert.deepEqual(Helpers.dom.getCursorPosition(),
                   {node: newTextNode, offset: 0},
                   'cursor is at start of new text node');
});

test('keystroke of delete removes emoji character', (assert) => {
  let monkey = 'monkey🙈';
  let mobiledoc = Helpers.mobiledoc.build(({post, markupSection, marker}) => {
    return post([markupSection('p', [marker(monkey)])]);
  });
  editor = new Editor({mobiledoc});
  editor.render(editorElement);
  let textNode = editorElement.firstChild. // section
                               firstChild; // marker
  assert.equal(textNode.textContent, monkey, 'precond - correct text');

  Helpers.dom.moveCursorTo(editor, textNode, monkey.length);
  Helpers.dom.triggerDelete(editor);

  assert.equal($('#editor p:eq(0)').text(), 'monkey', 'deletes the emoji');
});

test('keystroke of forward delete removes emoji character', (assert) => {
  let monkey = 'monkey🙈';
  let mobiledoc = Helpers.mobiledoc.build(({post, markupSection, marker}) => {
    return post([markupSection('p', [marker(monkey)])]);
  });
  editor = new Editor({mobiledoc});
  editor.render(editorElement);
  let textNode = editorElement.firstChild. // section
                               firstChild; // marker
  assert.equal(textNode.textContent, monkey, 'precond - correct text');

  Helpers.dom.moveCursorTo(editor, textNode, 'monkey'.length);
  Helpers.dom.triggerForwardDelete(editor);

  assert.equal($('#editor p:eq(0)').text(), 'monkey', 'deletes the emoji');
});

test('keystroke of delete when cursor is at beginning of marker removes character from previous marker', (assert) => {
  editor = new Editor({mobiledoc: mobileDocWith2Markers});
  editor.render(editorElement);
  const textNode = editor.element.
                    firstChild.    // section
                    childNodes[1]; // plain marker

  assert.ok(!!textNode, 'gets text node');
  Helpers.dom.moveCursorTo(editor, textNode, 0);

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
  Helpers.dom.moveCursorTo(editor, textNode, 1);

  Helpers.dom.triggerDelete(editor);

  assert.hasElement('#editor p:eq(0):contains()', 'first p is empty');

  Helpers.dom.insertText(editor, 'X');
  assert.hasElement('#editor p:eq(0):contains(X)', 'text is added back to section');
});

test('keystroke of character in empty section adds character, moves cursor', (assert) => {
  editor = new Editor({mobiledoc: mobileDocWithNoCharacter});
  editor.render(editorElement);

  assert.hasElement('#editor p br', 'precond - br tag rendered for empty section');
  let pNode = $('#editor p')[0];

  // Firefox requires that the cursor be placed explicitly for this test to pass
  Helpers.dom.moveCursorTo(editor, pNode, 0);

  const letter = 'M';
  Helpers.dom.insertText(editor, letter);

  assert.hasElement(`#editor p:contains(${letter})`, 'adds char');

  const otherLetter = 'X';
  Helpers.dom.insertText(editor, otherLetter);

  assert.hasElement(`#editor p:contains(${letter}${otherLetter})`, 'adds char in correct spot');
});

test('keystroke of delete at start of section joins with previous section', (assert) => {
  editor = new Editor({mobiledoc: mobileDocWith2Sections});
  editor.render(editorElement);

  let secondSectionTextNode = editor.element.childNodes[1].firstChild;

  assert.equal(secondSectionTextNode.textContent, 'second section',
               'precond - section section text node');

  Helpers.dom.moveCursorTo(editor, secondSectionTextNode, 0);
  //editor.range = null;
  Helpers.dom.triggerDelete(editor);

  assert.equal(editor.element.childNodes.length, 1, 'only 1 section remaining');

  let secondSectionNode = editor.element.firstChild;
  secondSectionTextNode = secondSectionNode.firstChild;
  assert.equal(secondSectionNode.textContent,
               'first sectionsecond section',
               'joins two sections');

  Helpers.dom.insertText(editor, 'X');

  assert.hasElement('#editor p:contains(first sectionXsecond section)',
                    'inserts text at correct spot');
});


test('keystroke of delete at start of first section does nothing', (assert) => {
  editor = new Editor({mobiledoc: mobileDocWith2Sections});
  editor.render(editorElement);

  let firstSectionTextNode = editor.element.childNodes[0].firstChild;

  assert.equal(firstSectionTextNode.textContent, 'first section',
               'finds first section text node');

  Helpers.dom.moveCursorTo(editor, firstSectionTextNode, 0);

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

  Helpers.dom.moveCursorTo(editor, firstSectionPNode, 0,
                           secondSectionTextNode, 0);
  Helpers.dom.triggerEvent(document, 'mouseup');

  Helpers.wait(() => {
    assert.ok(true, 'No error should occur');

    let {
      headSection, tailSection, headMarker, tailMarker,
      headSectionOffset, tailSectionOffset, headMarkerOffset, tailMarkerOffset
    } = editor.range;

    assert.ok(headSection === editor.post.sections.objectAt(0),
              'returns first section head');
    assert.ok(tailSection === editor.post.sections.objectAt(1),
              'returns second section tail');
    assert.ok(headMarker === editor.post.sections.objectAt(0).markers.head,
              'returns first section marker head');
    assert.ok(tailMarker === editor.post.sections.objectAt(1).markers.head,
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

  Helpers.dom.moveCursorTo(editor, firstSectionTextNode, 0,
                           secondSectionPNode, 0);
  Helpers.dom.triggerEvent(document, 'mouseup');

  Helpers.wait(() => {
    assert.ok(true, 'No error should occur');

    let {
      headSection, tailSection, headMarker, tailMarker,
      headSectionOffset, tailSectionOffset, headMarkerOffset, tailMarkerOffset
    } = editor.range;

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
  Helpers.dom.moveCursorTo(editor, firstSectionTextNode, 'first section'.length);

  let count = 'ection'.length;
  while (count--) {
    Helpers.dom.triggerDelete(editor);
  }

  assert.equal($('#editor p:eq(0)').text(), 'first s', 'precond - correct section text after initial deletions');

  Helpers.dom.triggerDelete(editor);

  assert.equal($('#editor p:eq(0)').text(), `first${NO_BREAK_SPACE}`, 'precond - correct text after deleting last char before space');

  let text = 'e';
  Helpers.dom.insertText(editor, text);

  Helpers.wait(() => {
    assert.equal(editor.post.sections.head.text, `first ${text}`, 'character is placed after space');

    done();
  });
});

test('deleting when after deletion there is a leading space positions cursor at start of selection', (assert) => {
  const done = assert.async();

  editor = new Editor({mobiledoc: mobileDocWith2Sections});
  editor.render(editorElement);

  Helpers.dom.selectText(editor ,'second', editorElement);
  Helpers.dom.triggerDelete(editor);

  assert.equal($('#editor p:eq(1)').text(), `${NO_BREAK_SPACE}section`, 'correct text after deletion');
  let text = 'e';
  Helpers.dom.insertText(editor, text);

  Helpers.wait(() => {
    assert.equal(editor.post.sections.tail.text, `${text} section`, 'correct text after insertion');
    done();
  });
});

test('inserting multiple spaces renders them with nbsps', (assert) => {
  let mobiledoc = Helpers.mobiledoc.build(({post, markupSection}) => {
    return post([markupSection()]);
  });
  editor = new Editor({mobiledoc});
  editor.render(editorElement);

  // Tests on FF fail if the editor doesn't have a cursor, we must
  // render it explicitly
  editor.selectRange(new Range(editor.post.tailPosition()));

  assert.ok(editor.hasCursor(), 'precond - has cursor');

  let sp = ' ', nbsp = NO_BREAK_SPACE;
  Helpers.dom.insertText(editor, sp + sp + sp);
  assert.equal($('#editor p:eq(0)').text(),
               nbsp + nbsp + nbsp,
               'correct nbsps in text');
});

test('deleting when the previous section is also blank', (assert) => {
  editor = new Editor({mobiledoc: mobileDocWithNoCharacter});
  editor.render(editorElement);

  Helpers.dom.moveCursorTo(editor, editorElement.childNodes[0].childNodes[0], 0);
  Helpers.dom.triggerEnter(editor);

  assert.equal($('#editor p').length, 2, 'has 2 paragraphs after typing return');

  Helpers.dom.triggerDelete(editor);

  assert.equal($('#editor p').length, 1, 'has 1 paragraphs after typing delete');
});

test('deleting from head of section when previous section is non-markerable', (assert) => {
  let card = {
    name: 'some-card',
    type: 'dom',
    render() {}
  };

  let expected;
  editor = Helpers.mobiledoc.renderInto(editorElement, ({post, markupSection, marker, cardSection}) => {
    expected = post([
      cardSection('some-card'),
      markupSection('p', [marker('abc')])
    ]);
    return post([
      cardSection('some-card'),
      markupSection('p', [marker('abc')])
    ]);
  }, {cards:[card]});

  let node = Helpers.dom.findTextNode(editorElement, 'abc');
  Helpers.dom.moveCursorTo(editor, node, 0);
  Helpers.dom.triggerDelete(editor);

  assert.positionIsEqual(editor.range.head, editor.post.sections.head.tailPosition(),
                         'moves cursor to end of card section');
  assert.postIsSimilar(editor.post, expected, 'post is not changed');
});

test('delete with option (Mac) or control (Win)  key deletes full word', (assert) => {
  assert.expect(1);
  if (!Browser.isMac() && !Browser.isWin()) {
    assert.ok(true, 'SKIP on non-mac non-win');
    return;
  }

  let done = assert.async();

  let { post } = Helpers.postAbstract.buildFromText("abc def");
  let { post: expected } = Helpers.postAbstract.buildFromText("abc ");
  editor = Helpers.mobiledoc.renderPostInto(editorElement, post);

  editor.selectRange(new Range(editor.post.tailPosition()));

  let altKey, ctrlKey;
  if (Browser.isMac()) {
    /* Mac key codes for navigation by word */
    altKey = true;
    ctrlKey = false;
  } else {
    /* PC key codes for navigation by word */
    altKey = false;
    ctrlKey = true;
  }

  Helpers.wait(() => {
    Helpers.dom.triggerDelete(editor, DIRECTION.BACKWARD, {altKey, ctrlKey});

    Helpers.wait(() => {
      assert.postIsSimilar(editor.post, expected);
      done();
    });
  });
});
