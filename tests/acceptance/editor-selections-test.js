import { Editor } from 'content-kit-editor';
import Helpers from '../test-helpers';
import { MOBILEDOC_VERSION } from 'content-kit-editor/renderers/mobiledoc';

const { test, module } = QUnit;

let fixture, editor, editorElement;

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

module('Acceptance: Editor Selections', {
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

test('selecting across sections is possible', (assert) => {
  const done = assert.async();

  editor = new Editor(editorElement, {mobiledoc: mobileDocWith2Sections});

  let firstSection = $('p:contains(first section)')[0];
  let secondSection = $('p:contains(second section)')[0];

  Helpers.dom.selectText('section', firstSection,
                         'second', secondSection);

  Helpers.dom.triggerEvent(document, 'mouseup');

  setTimeout(() => {
    assert.equal(editor.activeSections.length, 2, 'selects 2 sections');
    done();
  });
});

test('selecting an entire section and deleting removes it', (assert) => {
  const done = assert.async();

  editor = new Editor(editorElement, {mobiledoc: mobileDocWith2Sections});

  Helpers.dom.selectText('second section', editorElement);
  Helpers.dom.triggerDelete(editor);

  assert.hasElement('p:contains(first section)');
  assert.hasNoElement('p:contains(second section)', 'deletes contents of second section');
  assert.equal($('#editor p').length, 2, 'still has 2 sections');

  Helpers.dom.insertText('X');

  assert.hasElement('#editor p:eq(1):contains(X)', 'inserts text in correct spot');

  done();
});

test('selecting text in a section and deleting deletes it', (assert) => {
  editor = new Editor(editorElement, {mobiledoc: mobileDocWith2Sections});

  Helpers.dom.selectText('cond sec', editorElement);
  Helpers.dom.triggerDelete(editor);

  assert.hasElement('p:contains(first section)', 'first section unchanged');
  assert.hasNoElement('p:contains(second section)', 'second section is no longer there');
  assert.hasElement('p:contains(setion)', 'second section has correct text');

  let textNode = $('p:contains(setion)')[0].childNodes[0];
  assert.equal(textNode.textContent, 'se', 'precond - has correct text node');
  let charOffset = 2; // after the 'e' in 'se'

  assert.deepEqual(Helpers.dom.getCursorPosition(),
                   {node: textNode, offset: charOffset});
});

test('selecting text across sections and deleting joins sections', (assert) => {
  editor = new Editor(editorElement, {mobiledoc: mobileDocWith2Sections});

  const firstSection = $('#editor p')[0],
        secondSection = $('#editor p')[1];

  Helpers.dom.selectText('t section', firstSection,
                         'second s', secondSection);
  Helpers.dom.triggerDelete(editor);

  assert.hasElement('p:contains(firsection)');
  assert.hasNoElement('p:contains(first section)');
  assert.hasNoElement('p:contains(second section)');
  assert.equal($('#editor p').length, 1, 'only 1 section after deleting to join');
});

test('selecting text across markers and deleting joins markers', (assert) => {
  const done = assert.async();

  editor = new Editor(editorElement, {mobiledoc: mobileDocWith2Sections});

  Helpers.dom.selectText('rst sect', editorElement);
  Helpers.dom.triggerEvent(document, 'mouseup');

  setTimeout(() => {
    Helpers.toolbar.clickButton(assert, 'bold');

    let firstTextNode = editorElement
                           .childNodes[0] // p
                           .childNodes[1] // b
                           .childNodes[0]; // textNode containing "rst sect"
    let secondTextNode = editorElement
                             .childNodes[0] // p
                             .childNodes[2]; // textNode containing "ion"

    assert.equal(firstTextNode.textContent, 'rst sect', 'correct first text node');
    assert.equal(secondTextNode.textContent, 'ion', 'correct second text node');
    Helpers.dom.selectText('t sect', firstTextNode,
                           'ion',    secondTextNode);
    Helpers.dom.triggerDelete(editor);

    assert.hasElement('p:contains(firs)', 'deletes across markers');
    assert.hasElement('strong:contains(rs)', 'maintains bold text');

    firstTextNode = editorElement
                      .childNodes[0] // p
                      .childNodes[1] // b
                      .childNodes[0]; // textNode now containing "rs"

    assert.deepEqual(Helpers.dom.getCursorPosition(),
                     {node: firstTextNode, offset: 2});

    done();
  });
});

test('select text and apply markup multiple times', (assert) => {
  const done = assert.async();
  editor = new Editor(editorElement, {mobiledoc: mobileDocWith2Sections});

  Helpers.dom.selectText('t sect', editorElement);
  Helpers.dom.triggerEvent(document, 'mouseup');

  setTimeout(() => {
    Helpers.toolbar.clickButton(assert, 'bold');

    Helpers.dom.selectText('fir', editorElement);
    Helpers.dom.triggerEvent(document, 'mouseup');

    setTimeout(() => {
      Helpers.toolbar.clickButton(assert, 'bold');

      assert.hasElement('p:contains(first section)', 'correct first section');
      assert.hasElement('strong:contains(fir)', 'strong "fir"');
      assert.hasElement('strong:contains(t sect)', 'strong "t sect"');

      done();
    });
  });
});

test('selecting text across markers deletes intermediary markers', (assert) => {
  const done = assert.async();
  editor = new Editor(editorElement, {mobiledoc: mobileDocWith2Sections});

  Helpers.dom.selectText('rst sec', editorElement);
  Helpers.dom.triggerEvent(document, 'mouseup');

  setTimeout(() => {
    Helpers.toolbar.clickButton(assert, 'bold');

    const textNode1 = editorElement.childNodes[0].childNodes[0],
          textNode2 = editorElement.childNodes[0].childNodes[2];
    Helpers.dom.selectText('i', textNode1,
                           'tio', textNode2);
    Helpers.dom.triggerEvent(document, 'mouseup');

    setTimeout(() => {
      Helpers.dom.triggerDelete(editor);

      assert.hasElement('p:contains(fn)', 'has remaining first section');
      assert.deepEqual(Helpers.dom.getCursorPosition(),
                       {node: editorElement.childNodes[0].childNodes[0],
                         offset: 1});

      done();
    });
  });
});

test('selecting text across markers preserves node after', (assert) => {
  const done = assert.async();
  editor = new Editor(editorElement, {mobiledoc: mobileDocWith2Sections});

  Helpers.dom.selectText('rst sec', editorElement);
  Helpers.dom.triggerEvent(document, 'mouseup');

  setTimeout(() => {
    Helpers.toolbar.clickButton(assert, 'bold');

    const textNode1 = editorElement.childNodes[0].childNodes[0],
          textNode2 = editorElement.childNodes[0].childNodes[1];
    Helpers.dom.selectText('i', textNode1,
                           'sec', textNode2);
    Helpers.dom.triggerEvent(document, 'mouseup');

    setTimeout(() => {
      Helpers.dom.triggerDelete(editor);

      assert.deepEqual(
        editorElement.childNodes[0].innerHTML, 'ftion',
        'has remaining first section'
      );
      assert.deepEqual(Helpers.dom.getCursorPosition(),
                       {node: editorElement.childNodes[0].childNodes[0],
                         offset: 1});
      done();
    });
  });
});

test('selecting text across sections and hitting enter deletes and moves cursor to last selected section', (assert) => {
  const done = assert.async();
  editor = new Editor(editorElement, {mobiledoc: mobileDocWith2Sections});

  let firstSection = $('#editor p:eq(0)')[0],
      secondSection = $('#editor p:eq(1)')[0];

  Helpers.dom.selectText(' section', firstSection,
                         'second ', secondSection);

  Helpers.dom.triggerEnter(editor);

  setTimeout(() => {
    assert.equal($('#editor p').length, 2, 'still 2 sections');
    assert.equal($('#editor p:eq(0)').text(), 'first', 'correct text in 1st section');
    assert.equal($('#editor p:eq(1)').text(), 'section', 'correct text in 2nd section');

    let secondSectionTextNode = editor.element.childNodes[1].childNodes[0];
    assert.deepEqual(Helpers.dom.getCursorPosition(),
                    {node: secondSectionTextNode, offset: 0},
                    'cursor is at start of second section');
    done();
  });
});

Helpers.skipInPhantom('keystroke of printable character while text is selected deletes the text', (assert) => {
  const done = assert.async();
  editor = new Editor(editorElement, {mobiledoc: mobileDocWith2Sections});

  Helpers.dom.selectText('first section', editorElement);
  Helpers.dom.triggerEvent(document, 'mouseup');

  setTimeout(() => {
    Helpers.toolbar.clickButton(assert, 'heading');

    assert.ok($('#editor h2:contains(first section)').length,
              'first section is a heading');

    const firstSectionTextNode = editorElement.childNodes[0].childNodes[0];
    const secondSectionTextNode = editorElement.childNodes[1].childNodes[0];
    Helpers.dom.selectText('section', firstSectionTextNode,
                          'secon', secondSectionTextNode);

    const key = 'A';
    const charCodeA = 65;
    Helpers.dom.triggerKeyEvent(document, 'keydown', charCodeA, key);

    assert.ok($(`#editor h2:contains(first ${key}d section)`).length,
              'updates the section');

    done();
  });
});

// test selecting text that includes entire sections deletes the sections
