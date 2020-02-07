import { Editor } from 'mobiledoc-kit';
import { clearSelection } from 'mobiledoc-kit/utils/selection-utils';
import Helpers from '../test-helpers';
import { MOBILEDOC_VERSION } from 'mobiledoc-kit/renderers/mobiledoc/0-2';

const { test, module } = Helpers;

let editor, editorElement;

const mobileDocWithSection = {
  version: MOBILEDOC_VERSION,
  sections: [
    [],
    [
      [1, "P", [
        [[], 0, "one trick pony"]
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

module('Acceptance: Editor Selections', {
  beforeEach() {
    editorElement = $('#editor')[0];
  },

  afterEach() {
    if (editor) { editor.destroy(); }
  }
});

test('selecting across sections is possible', (assert) => {
  editor = new Editor({mobiledoc: mobileDocWith2Sections});
  editor.render(editorElement);

  let firstSection = $('p:contains(first section)')[0];
  let secondSection = $('p:contains(second section)')[0];

  Helpers.dom.selectText(editor ,'section', firstSection,
                         'second', secondSection);

  Helpers.dom.triggerEvent(document, 'mouseup');
  assert.equal(editor.activeSections.length, 2, 'selects 2 sections');
});

test('when editing is disabled, the selection detection code is disabled', (assert) => {
  let done = assert.async();
  $('#qunit-fixture').append('<p>outside section 1</p>');
  $('#qunit-fixture').append('<p>outside section 2</p>');

  editor = new Editor({mobiledoc: mobileDocWithSection});
  editor.render(editorElement);
  editor.disableEditing();

  const outside1 = $('p:contains(outside section 1)')[0];
  const outside2 = $('p:contains(outside section 2)')[0];

  Helpers.wait(() => {
    Helpers.dom.selectText(editor ,'outside', outside1, 'section 2', outside2);

    Helpers.wait(() => {
      assert.equal(editor.activeSections.length, 0, 'no selection inside the editor');
      const selectedText = Helpers.dom.getSelectedText();
      assert.ok(selectedText.indexOf('outside section 1') !== -1 &&
                selectedText.indexOf('outside section 2') !== -1, 'selects the text');

      done();
    });
  });
});

test('selecting an entire section and deleting removes it', (assert) => {
  editor = new Editor({mobiledoc: mobileDocWith2Sections});
  editor.render(editorElement);

  Helpers.dom.selectText(editor ,'second section', editorElement);
  Helpers.dom.triggerDelete(editor);

  assert.hasElement('#editor p:contains(first section)');
  assert.hasNoElement('#editor p:contains(second section)', 'deletes contents of second section');
  assert.equal($('#editor p').length, 2, 'still has 2 sections');

  Helpers.dom.insertText(editor, 'X');

  assert.hasElement('#editor p:eq(1):contains(X)', 'inserts text in correct spot');
});

test('selecting text in a section and deleting deletes it', (assert) => {
  editor = new Editor({mobiledoc: mobileDocWith2Sections});
  editor.render(editorElement);

  Helpers.dom.selectText(editor ,'cond sec', editorElement);
  Helpers.dom.triggerDelete(editor);

  assert.hasElement('#editor p:contains(first section)', 'first section unchanged');
  assert.hasNoElement('#editor p:contains(second section)', 'second section is no longer there');
  assert.hasElement('#editor p:contains(setion)', 'second section has correct text');

  Helpers.dom.insertText(editor, 'Z');
  assert.hasElement('#editor p:contains(seZtion)', 'text inserted correctly');
});

test('selecting text across sections and deleting joins sections', (assert) => {
  editor = new Editor({mobiledoc: mobileDocWith2Sections});
  editor.render(editorElement);

  const firstSection = $('#editor p')[0],
        secondSection = $('#editor p')[1];

  Helpers.dom.selectText(editor ,'t section', firstSection,
                         'second s', secondSection);
  Helpers.dom.triggerDelete(editor);

  assert.hasElement('p:contains(firsection)');
  assert.hasNoElement('p:contains(first section)');
  assert.hasNoElement('p:contains(second section)');
  assert.equal($('#editor p').length, 1, 'only 1 section after deleting to join');
});

test('selecting text across markers and deleting joins markers', (assert) => {

  editor = new Editor({mobiledoc: mobileDocWith2Sections});
  editor.render(editorElement);

  Helpers.dom.selectText(editor ,'rst sect', editorElement);
  editor.run(postEditor => postEditor.toggleMarkup('strong'));

  let firstTextNode = editorElement
                         .childNodes[0] // p
                         .childNodes[1] // b
                         .childNodes[0]; // textNode containing "rst sect"
  let secondTextNode = editorElement
                           .childNodes[0] // p
                           .childNodes[2]; // textNode containing "ion"

  assert.equal(firstTextNode.textContent, 'rst sect', 'correct first text node');
  assert.equal(secondTextNode.textContent, 'ion', 'correct second text node');
  Helpers.dom.selectText(editor ,'t sect', firstTextNode,
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
});

test('select text and apply markup multiple times', (assert) => {
  const done = assert.async();

  editor = new Editor({mobiledoc: mobileDocWith2Sections});
  editor.render(editorElement);

  Helpers.dom.selectText(editor ,'t sect', editorElement);
  Helpers.dom.triggerEvent(document, 'mouseup');

  editor.run(postEditor => postEditor.toggleMarkup('strong'));

  Helpers.wait(() => {
    Helpers.dom.selectText(editor ,'fir', editorElement);
    editor.run(postEditor => postEditor.toggleMarkup('strong'));
    clearSelection();
    Helpers.dom.triggerEvent(document, 'mouseup');

    Helpers.wait(() => {
      editor.run(postEditor => postEditor.toggleMarkup('strong'));

      assert.hasElement('p:contains(first section)', 'correct first section');
      assert.hasElement('strong:contains(fir)', 'strong "fir"');
      assert.hasElement('strong:contains(t sect)', 'strong "t sect"');

      done();
    });
  });
});

test('selecting text across markers deletes intermediary markers', (assert) => {
  let mobiledoc = Helpers.mobiledoc.build(
    ({post, markupSection, marker, markup}) => {
    return post([
      markupSection('p', [
        marker('abc'),
        marker('123', [markup('strong')]),
        marker('def')
      ])
    ]);
  });
  editor = new Editor({mobiledoc});
  editor.render(editorElement);


  const textNode1 = editorElement.childNodes[0].childNodes[0],
        textNode2 = editorElement.childNodes[0].childNodes[2];

  assert.equal(textNode1.textContent, 'abc', 'precond - text node 1');
  assert.equal(textNode2.textContent, 'def', 'precond - text node 2');
  Helpers.dom.selectText(editor ,'b', textNode1,
                         'e', textNode2);

  Helpers.dom.triggerDelete(editor);

  assert.hasElement('p:contains(af)', 'has remaining first section');

  Helpers.dom.insertText(editor, 'X');
  assert.hasElement('p:contains(aXf)', 'inserts text at correct place');
});

test('deleting text across markers preserves node after', (assert) => {
  let mobiledoc = Helpers.mobiledoc.build(
    ({post, markupSection, marker, markup}) => {
    return post([
      markupSection('p', [
        marker('abc'),
        marker('123', [markup('strong')]),
        marker('def')
      ])
    ]);
  });
  editor = new Editor({mobiledoc});
  editor.render(editorElement);


  const textNode1 = editorElement.childNodes[0].childNodes[0],
        textNode2 = editorElement.childNodes[0].childNodes[1];
  assert.equal(textNode1.textContent, 'abc', 'precond -text node 1');
  assert.equal(textNode2.textContent, '123', 'precond -text node 2');

  Helpers.dom.selectText(editor ,'b', editorElement,
                         '2', editorElement);

  Helpers.dom.triggerDelete(editor);

  assert.equal(
    editorElement.childNodes[0].textContent, 'a3def',
    'has remaining first section'
  );
  Helpers.dom.insertText(editor, 'X');
  assert.equal(
    editorElement.childNodes[0].textContent, 'aX3def',
    'inserts text at correct spot');
});

test('selecting text across sections and hitting enter deletes and moves cursor to last selected section', (assert) => {
  editor = new Editor({mobiledoc: mobileDocWith2Sections});
  editor.render(editorElement);

  let firstSection = $('#editor p:eq(0)')[0],
      secondSection = $('#editor p:eq(1)')[0];

  Helpers.dom.selectText(editor ,' section', firstSection,
                         'second ', secondSection);

  Helpers.dom.triggerEnter(editor);

  assert.equal($('#editor p').length, 2, 'still 2 sections');
  assert.equal($('#editor p:eq(0)').text(), 'first', 'correct text in 1st section');
  assert.equal($('#editor p:eq(1)').text(), 'section', 'correct text in 2nd section');

  let secondSectionTextNode = editor.element.childNodes[1].childNodes[0];
  assert.deepEqual(Helpers.dom.getCursorPosition(),
                  {node: secondSectionTextNode, offset: 0},
                  'cursor is at start of second section');
});

test('keystroke of printable character while text is selected deletes the text', (assert) => {
  editor = new Editor({mobiledoc: mobileDocWith2Sections});
  editor.render(editorElement);

  Helpers.dom.selectText(editor ,'first section', editorElement);

  editor.run(postEditor => {
    editor.activeSections.forEach(section => {
      postEditor.changeSectionTagName(section, 'h2');
    });
  });

  assert.ok($('#editor h2:contains(first section)').length,
            'first section is a heading');

  const firstSectionTextNode = editorElement.childNodes[0].childNodes[0];
  const secondSectionTextNode = editorElement.childNodes[1].childNodes[0];
  Helpers.dom.selectText(editor ,'section', firstSectionTextNode,
                        'secon', secondSectionTextNode);

  Helpers.dom.insertText(editor, 'X');

  assert.ok($(`#editor h2:contains(first Xd section)`).length,
            'updates the section');
});

test('selecting text bounded by space and typing replaces it', (assert) => {
  let done = assert.async();
  editor = new Editor({mobiledoc: mobileDocWithSection});
  editor.render(editorElement);

  Helpers.dom.selectText(editor ,'trick', editorElement);
  Helpers.dom.insertText(editor, 'X');
  Helpers.wait(() => {
    assert.equal(editor.post.sections.head.text, 'one X pony',
                 'new text present');

    Helpers.dom.insertText(editor, 'Y');
    Helpers.wait(() => {
      assert.equal(editor.post.sections.head.text, 'one XY pony',
                   'further new text present');
      done();
    });
  });
});

test('selecting all text across sections and hitting enter deletes and moves cursor to empty section', (assert) => {
  editor = new Editor({mobiledoc: mobileDocWith2Sections});
  editor.render(editorElement);

  let firstSection = $('#editor p:eq(0)')[0],
      secondSection = $('#editor p:eq(1)')[0];

  Helpers.dom.selectText(editor ,'first section', firstSection,
                         'second section', secondSection);

  Helpers.dom.triggerEnter(editor);

  assert.equal($('#editor p').length, 1, 'single section');
  assert.equal($('#editor p:eq(0)').text(), '', 'blank text');

  // Firefox reports that the cursor is on the "<br>", but Safari and Chrome do not.
  // Grab the selection here, then set it to the expected value, and compare again
  // the window's selection
  let selection = window.getSelection();
  let cursorElement = $('#editor p br')[0];
  assert.ok(cursorElement, 'has cursor element');
  Helpers.dom.selectRange(cursorElement, 0, cursorElement, 0);
  let newSelection = window.getSelection();
  assert.equal(selection.anchorNode, newSelection.anchorNode, 'correct anchorNode');
  assert.equal(selection.focusNode, newSelection.focusNode, 'correct focusNode');
  assert.equal(selection.anchorOffset, newSelection.anchorOffset, 'correct anchorOffset');
  assert.equal(selection.focusOffset, newSelection.focusOffset, 'correct focusOffset');
});

test('selecting text across markup and list sections', (assert) => {
  const build = Helpers.mobiledoc.build;
  const mobiledoc = build(({post, markupSection, listSection, listItem, marker}) =>
    post([
      markupSection('p', [marker('abc')]),
      listSection('ul', [
        listItem([marker('123')]),
        listItem([marker('456')])
      ])
    ])
  );
  editor = new Editor({mobiledoc});
  editor.render(editorElement);

  Helpers.dom.selectText(editor ,'bc', editorElement, '12', editorElement);

  Helpers.dom.triggerDelete(editor);

  assert.hasElement('#editor p:contains(a3)',
                    'combines partially-selected list item onto markup section');

  assert.hasNoElement('#editor p:contains(bc)', 'deletes selected text "bc"');
  assert.hasNoElement('#editor p:contains(12)', 'deletes selected text "12"');

  assert.hasElement('#editor li:contains(6)', 'leaves remaining text in list item');
});

test('selecting text that covers a list section', (assert) => {
  const build = Helpers.mobiledoc.build;
  const mobiledoc = build(({post, markupSection, listSection, listItem, marker}) =>
    post([
      markupSection('p', [marker('abc')]),
      listSection('ul', [
        listItem([marker('123')]),
        listItem([marker('456')])
      ]),
      markupSection('p', [marker('def')])
    ])
  );
  editor = new Editor({mobiledoc});
  editor.render(editorElement);

  Helpers.dom.selectText(editor ,'bc', editorElement, 'de', editorElement);
  Helpers.dom.triggerEvent(document, 'mouseup');

  Helpers.dom.triggerDelete(editor);

  assert.hasElement('#editor p:contains(af)',
                    'combines sides of selection');

  assert.hasNoElement('#editor li:contains(123)', 'deletes li 1');
  assert.hasNoElement('#editor li:contains(456)', 'deletes li 2');
  assert.hasNoElement('#editor ul', 'removes ul');
});

test('selecting text that starts in a list item and ends in a markup section', (assert) => {
  const build = Helpers.mobiledoc.build;
  const mobiledoc = build(({post, markupSection, listSection, listItem, marker}) =>
    post([
      listSection('ul', [
        listItem([marker('123')]),
        listItem([marker('456')])
      ]),
      markupSection('p', [marker('def')])
    ])
  );
  editor = new Editor({mobiledoc});
  editor.render(editorElement);

  Helpers.dom.selectText(editor ,'23', editorElement, 'de', editorElement);
  Helpers.dom.triggerEvent(document, 'mouseup');
  Helpers.dom.triggerDelete(editor);

  assert.hasElement('#editor li:contains(1f)',
                    'combines sides of selection');

  assert.hasNoElement('#editor li:contains(123)', 'deletes li 1');
  assert.hasNoElement('#editor li:contains(456)', 'deletes li 2');
  assert.hasNoElement('#editor p:contains(def)', 'deletes p content');
  assert.hasNoElement('#editor p', 'removes p entirely');
});

test('selecting text that includes a card section and deleting deletes card section', (assert) => {
  const build = Helpers.mobiledoc.build;
  const mobiledoc = build(({post, markupSection, cardSection, marker}) =>
    post([
      markupSection('p', [marker('abc')]),
      cardSection('simple-card'),
      markupSection('p', [marker('def')])
    ])
  );
  const cards = [{
    name: 'simple-card',
    type: 'dom',
    render() {
      return $('<span id="card-el"></span>')[0];
    }
  }];
  editor = new Editor({mobiledoc, cards});
  editor.render(editorElement);

  assert.hasElement('#card-el', 'precond - card el is rendered');

  Helpers.dom.selectText(editor ,'bc', editorElement, 'de', editorElement);
  Helpers.dom.triggerEvent(document, 'mouseup');

  Helpers.dom.triggerDelete(editor);

  assert.hasElement('#editor p:contains(af)', 'combines sides of selection');

  assert.hasNoElement('#editor span#card-el', 'card el is removed');
  assert.hasNoElement('#editor p:contains(abc)', 'previous section 1 is removed');
  assert.hasNoElement('#editor p:contains(def)', 'previous section 2 is removed');
});

test('selecting text that touches bold text should not be considered bold', (assert) => {

  const mobiledoc = Helpers.mobiledoc.build(({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abc')])]);
  });
  editor = new Editor({mobiledoc});
  editor.render(editorElement);

  Helpers.dom.selectText(editor ,'b', editorElement);
  Helpers.dom.triggerEvent(document, 'mouseup');

  editor.run(postEditor => postEditor.toggleMarkup('strong'));

  assert.hasElement('#editor strong:contains(b)', 'precond - bold text');

  Helpers.dom.selectText(editor ,'c', editorElement);
  Helpers.dom.triggerEvent(document, 'mouseup');

  let bold = editor.builder.createMarkup('strong');
  assert.ok(editor.activeMarkups.indexOf(bold) === -1, 'strong is not in selection');
});

// https://github.com/bustle/mobiledoc-kit/issues/121
test('selecting text that includes a 1-character marker and unbolding it', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(({post, markupSection, marker, markup}) => {
    const b = markup('strong');
    return post([markupSection('p', [
      marker('a'),
      marker('b',[b]),
      marker('c')
    ])]);
  });
  editor = new Editor({mobiledoc});
  editor.render(editorElement);

  assert.hasElement('#editor strong:contains(b)', 'precond - bold');

  Helpers.dom.selectText(editor ,'b', editorElement, 'c', editorElement);

  let bold = editor.builder.createMarkup('strong');
  assert.ok(editor.activeMarkups.indexOf(bold) !== -1, 'strong is in selection');

  editor.run(postEditor => postEditor.toggleMarkup('strong'));

  assert.hasNoElement('#editor strong', 'bold text is unboldened');
});

// see https://github.com/bustle/mobiledoc-kit/issues/128
test('selecting text that includes an empty section and applying markup to it', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(({post, markupSection, marker}) => {
    return post([
      markupSection('p', [marker('abc')]),
      markupSection('p')
    ]);
  });
  editor = new Editor({mobiledoc});
  editor.render(editorElement);

  // precond
  assert.hasElement('#editor p:contains(abc)');
  assert.ok($('#editor p:eq(1)').text() === '', 'no text in second p');
  const t1 = $('#editor p:eq(0)')[0].childNodes[0];
  assert.equal(t1.textContent, 'abc', 'correct text node');
  const p2 = $('#editor p:eq(1)')[0];

  Helpers.dom.moveCursorTo(editor, t1, 0, p2, 0);

  editor.run(postEditor => postEditor.toggleMarkup('strong'));

  assert.hasElement('#editor p strong:contains(abc)', 'bold is applied to text');
});

test('placing cursor inside a strong section should cause activeMarkups to contain "strong"', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(({post, markupSection, marker, markup}) => {
    const b = markup('strong');
    return post([markupSection('p', [
      marker('before'),
      marker('loud',[b]),
      marker('after')
    ])]);
  });
  editor = new Editor({mobiledoc});
  editor.render(editorElement);

  Helpers.dom.moveCursorTo(editor, $('#editor strong')[0].firstChild, 1);

  let bold = editor.builder.createMarkup('strong');
  assert.ok(editor.activeMarkups.indexOf(bold) !== -1, 'strong is in selection');

  Helpers.dom.moveCursorTo(editor, $('#editor')[0].childNodes[0], 1);
  delete editor._activeMarkups;

  assert.ok(editor.activeMarkups.indexOf(bold) === -1, 'strong is not in selection');
});
