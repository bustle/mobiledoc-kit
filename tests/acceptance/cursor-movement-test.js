import { Editor } from 'mobiledoc-kit';
import Helpers from '../test-helpers';
import { MODIFIERS } from 'mobiledoc-kit/utils/key';

const { test, module } = Helpers;

const cards = [{
  name: 'my-card',
  display: {
    setup() {},
    teardown() {}
  },
  edit: {
    setup() {},
    teardown() {}
  }
}];

let editor, editorElement;

module('Acceptance: Cursor Movement', {
  beforeEach() {
    editorElement = $('#editor')[0];
  },

  afterEach() {
    if (editor) { editor.destroy(); }
  }
});

test('left arrow when at the end of a card moves the cursor across the card', assert => {
  let mobiledoc = Helpers.mobiledoc.build(({post, cardSection}) => {
    return post([
      cardSection('my-card')
    ]);
  });
  editor = new Editor({mobiledoc, cards});
  editor.render(editorElement);

  // Before zwnj
  Helpers.dom.moveCursorTo(editorElement.firstChild.lastChild, 0);
  Helpers.dom.triggerLeftArrowKey(editor);
  let { offsets } = editor.cursor;

  assert.ok(offsets.head.section === editor.post.sections.head,
            'Cursor is positioned on first section');
  assert.equal(offsets.head.offset, 0,
               'Cursor is positioned at offset 0');

  // After zwnj
  Helpers.dom.moveCursorTo(editorElement.firstChild.lastChild, 1);
  Helpers.dom.triggerLeftArrowKey(editor);
  offsets = editor.cursor.offsets;

  assert.ok(offsets.head.section === editor.post.sections.head,
            'Cursor is positioned on first section');
  assert.equal(offsets.head.offset, 0,
               'Cursor is positioned at offset 0');

  // On wrapper
  Helpers.dom.moveCursorTo(editorElement.firstChild, 2);
  Helpers.dom.triggerLeftArrowKey(editor);
  offsets = editor.cursor.offsets;

  assert.ok(offsets.head.section === editor.post.sections.head,
            'Cursor is positioned on first section');
  assert.equal(offsets.head.offset, 0,
               'Cursor is positioned at offset 0');
});

test('left arrow when at the start of a card moves the cursor to the previous section', assert => {
  let mobiledoc = Helpers.mobiledoc.build(({post, markupSection, cardSection}) => {
    return post([
      markupSection('p'),
      cardSection('my-card')
    ]);
  });
  editor = new Editor({mobiledoc, cards});
  editor.render(editorElement);

  // Before zwnj
  let sectionElement = editor.post.sections.tail.renderNode.element;
  Helpers.dom.moveCursorTo(sectionElement.firstChild, 0);
  Helpers.dom.triggerLeftArrowKey(editor);
  let { offsets } = editor.cursor;

  assert.ok(offsets.head.section === editor.post.sections.head,
            'Cursor is positioned on first section');
  assert.equal(offsets.head.offset, 0,
               'Cursor is positioned at offset 0');

  // After zwnj
  sectionElement = editor.post.sections.tail.renderNode.element;
  Helpers.dom.moveCursorTo(sectionElement.firstChild, 1);
  Helpers.dom.triggerLeftArrowKey(editor);
  offsets = editor.cursor.offsets;

  assert.ok(offsets.head.section === editor.post.sections.head,
            'Cursor is positioned on first section');
  assert.equal(offsets.head.offset, 0,
               'Cursor is positioned at offset 0');
});

test('right arrow moves the cursor across the card', assert => {
  let mobiledoc = Helpers.mobiledoc.build(({post, cardSection}) => {
    return post([
      cardSection('my-card')
    ]);
  });
  editor = new Editor({mobiledoc, cards});
  editor.render(editorElement);

  // Before zwnj
  Helpers.dom.moveCursorTo(editorElement.firstChild.firstChild, 0);
  Helpers.dom.triggerRightArrowKey(editor);
  let { offsets } = editor.cursor;

  assert.ok(offsets.head.section === editor.post.sections.head,
            'Cursor is positioned on first section');
  assert.equal(offsets.head.offset, 1,
               'Cursor is positioned at offset 1');

  // After zwnj
  Helpers.dom.moveCursorTo(editorElement.firstChild.firstChild, 1);
  Helpers.dom.triggerRightArrowKey(editor);
  offsets = editor.cursor.offsets;

  assert.ok(offsets.head.section === editor.post.sections.head,
            'Cursor is positioned on first section');
  assert.equal(offsets.head.offset, 1,
               'Cursor is positioned at offset 1');
});

test('right arrow at end of card moves cursor to next section', assert => {
  let mobiledoc = Helpers.mobiledoc.build(({post, markupSection, cardSection}) => {
    return post([
      cardSection('my-card'),
      markupSection('p')
    ]);
  });
  editor = new Editor({mobiledoc, cards});
  editor.render(editorElement);

  // Before zwnj
  let sectionElement = editor.post.sections.head.renderNode.element;
  Helpers.dom.moveCursorTo(sectionElement.lastChild, 0);
  Helpers.dom.triggerRightArrowKey(editor);
  let { offsets } = editor.cursor;

  assert.ok(offsets.head.section === editor.post.sections.tail,
            'Cursor is positioned on tail section');
  assert.equal(offsets.head.offset, 0,
               'Cursor is positioned at offset 0');

  // After zwnj
  sectionElement = editor.post.sections.head.renderNode.element;
  Helpers.dom.moveCursorTo(sectionElement.lastChild, 1);
  Helpers.dom.triggerRightArrowKey(editor);
  offsets = editor.cursor.offsets;

  assert.ok(offsets.head.section === editor.post.sections.tail,
            'Cursor is positioned on tail section');
  assert.equal(offsets.head.offset, 0,
               'Cursor is positioned at offset 0');
});

module('Acceptance: Cursor Movement w/ shift', {
  beforeEach() {
    editorElement = $('#editor')[0];
  },

  afterEach() {
    if (editor) { editor.destroy(); }
  }
});

test('left arrow when at the end of a card moves the cursor across the card', assert => {
  let mobiledoc = Helpers.mobiledoc.build(({post, cardSection}) => {
    return post([
      cardSection('my-card')
    ]);
  });
  editor = new Editor({mobiledoc, cards});
  editor.render(editorElement);

  // Before zwnj
  Helpers.dom.moveCursorTo(editorElement.firstChild.lastChild, 0);
  Helpers.dom.triggerLeftArrowKey(editor, MODIFIERS.SHIFT);
  let { offsets } = editor.cursor;

  assert.ok(offsets.head.section === editor.post.sections.head,
            'selection head is positioned on first section');
  assert.ok(offsets.tail.section === editor.post.sections.head,
            'selection tail is positioned on first section');
  assert.equal(offsets.head.offset, 0,
               'selection head is positioned at offset 0');
  assert.equal(offsets.tail.offset, 1,
               'selection tail is positioned at offset 1');

  // After zwnj
  Helpers.dom.moveCursorTo(editorElement.firstChild.lastChild, 1);
  Helpers.dom.triggerLeftArrowKey(editor, MODIFIERS.SHIFT);
  offsets = editor.cursor.offsets;

  assert.ok(offsets.head.section === editor.post.sections.head,
            'selection head is positioned on first section');
  assert.ok(offsets.tail.section === editor.post.sections.head,
            'selection tail is positioned on first section');
  assert.equal(offsets.head.offset, 0,
               'selection head is positioned at offset 0');
  assert.equal(offsets.tail.offset, 1,
               'selection tail is positioned at offset 1');

  // On wrapper
  Helpers.dom.moveCursorTo(editorElement.firstChild, 2);
  Helpers.dom.triggerLeftArrowKey(editor, MODIFIERS.SHIFT);
  offsets = editor.cursor.offsets;

  assert.ok(offsets.head.section === editor.post.sections.head,
            'selection head is positioned on first section');
  assert.ok(offsets.tail.section === editor.post.sections.head,
            'selection tail is positioned on first section');
  assert.equal(offsets.head.offset, 0,
               'selection head is positioned at offset 0');
  assert.equal(offsets.tail.offset, 1,
               'selection tail is positioned at offset 1');
});

test('right arrow moves the cursor across the card', assert => {
  let mobiledoc = Helpers.mobiledoc.build(({post, cardSection}) => {
    return post([
      cardSection('my-card')
    ]);
  });
  editor = new Editor({mobiledoc, cards});
  editor.render(editorElement);

  // Before zwnj
  Helpers.dom.moveCursorTo(editorElement.firstChild.firstChild, 0);
  Helpers.dom.triggerRightArrowKey(editor, MODIFIERS.SHIFT);
  let { offsets } = editor.cursor;

  assert.ok(offsets.head.section === editor.post.sections.head,
            'selection head is positioned on first section');
  assert.ok(offsets.tail.section === editor.post.sections.head,
            'selection tail is positioned on first section');
  assert.equal(offsets.head.offset, 0,
               'selection head is positioned at offset 0');
  assert.equal(offsets.tail.offset, 1,
               'selection tail is positioned at offset 1');

  // After zwnj
  Helpers.dom.moveCursorTo(editorElement.firstChild.firstChild, 1);
  Helpers.dom.triggerRightArrowKey(editor, MODIFIERS.SHIFT);
  offsets = editor.cursor.offsets;

  assert.ok(offsets.head.section === editor.post.sections.head,
            'selection head is positioned on first section');
  assert.ok(offsets.tail.section === editor.post.sections.head,
            'selection tail is positioned on first section');
  assert.equal(offsets.head.offset, 0,
               'selection head is positioned at offset 0');
  assert.equal(offsets.tail.offset, 1,
               'selection tail is positioned at offset 1');
});
