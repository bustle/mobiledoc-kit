import { Editor } from 'mobiledoc-kit';
import Helpers from '../test-helpers';
import { MODIFIERS } from 'mobiledoc-kit/utils/key';
import { supportsSelectionExtend } from '../helpers/browsers';

const { test, module } = Helpers;

const cards = [{
  name: 'my-card',
  type: 'dom',
  render() {},
  edit() {}
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
  let cardHead = editor.post.sections.head.headPosition();

  // Before zwnj
  Helpers.dom.moveCursorTo(editorElement.firstChild.lastChild, 0);
  Helpers.dom.triggerLeftArrowKey(editor);
  let { offsets } = editor.cursor;

  assert.positionIsEqual(offsets.head, cardHead);
  assert.positionIsEqual(offsets.tail, cardHead);

  // After zwnj
  Helpers.dom.moveCursorTo(editorElement.firstChild.lastChild, 1);
  Helpers.dom.triggerLeftArrowKey(editor);
  offsets = editor.cursor.offsets;

  assert.positionIsEqual(offsets.head, cardHead);
  assert.positionIsEqual(offsets.tail, cardHead);

  // On wrapper
  Helpers.dom.moveCursorTo(editorElement.firstChild, 2);
  Helpers.dom.triggerLeftArrowKey(editor);
  offsets = editor.cursor.offsets;

  assert.positionIsEqual(offsets.head, cardHead);
  assert.positionIsEqual(offsets.tail, cardHead);
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
  let sectionTail = editor.post.sections.head.tailPosition();

  // Before zwnj
  let sectionElement = editor.post.sections.tail.renderNode.element;
  Helpers.dom.moveCursorTo(sectionElement.firstChild, 0);
  Helpers.dom.triggerLeftArrowKey(editor);
  let { offsets } = editor.cursor;

  assert.positionIsEqual(offsets.head, sectionTail);
  assert.positionIsEqual(offsets.tail, sectionTail);

  // After zwnj
  sectionElement = editor.post.sections.tail.renderNode.element;
  Helpers.dom.moveCursorTo(sectionElement.firstChild, 1);
  Helpers.dom.triggerLeftArrowKey(editor);
  offsets = editor.cursor.offsets;

  assert.positionIsEqual(offsets.head, sectionTail);
  assert.positionIsEqual(offsets.tail, sectionTail);
});

test('left arrow when at the start of a card moves to previous list item', assert => {
  let mobiledoc = Helpers.mobiledoc.build(
    ({post, listSection, listItem, marker, cardSection}) => {
    return post([
      listSection('ul', [listItem([marker('abc')])]),
      cardSection('my-card')
    ]);
  });
  editor = new Editor({mobiledoc, cards});
  editor.render(editorElement);
  let itemTail = editor.post.sections.head.items.head.tailPosition();

  // Before zwnj
  let sectionElement = editor.post.sections.tail.renderNode.element;
  Helpers.dom.moveCursorTo(sectionElement.firstChild, 0);
  Helpers.dom.triggerLeftArrowKey(editor);
  let { offsets } = editor.cursor;

  assert.positionIsEqual(offsets.head, itemTail);
  assert.positionIsEqual(offsets.tail, itemTail);

  // After zwnj
  sectionElement = editor.post.sections.tail.renderNode.element;
  Helpers.dom.moveCursorTo(sectionElement.firstChild, 1);
  Helpers.dom.triggerLeftArrowKey(editor);
  offsets = editor.cursor.offsets;

  assert.positionIsEqual(offsets.head, itemTail);
  assert.positionIsEqual(offsets.tail, itemTail);
});

test('right arrow at start of card moves the cursor across the card', assert => {
  let mobiledoc = Helpers.mobiledoc.build(({post, cardSection}) => {
    return post([
      cardSection('my-card')
    ]);
  });
  editor = new Editor({mobiledoc, cards});
  editor.render(editorElement);
  let cardTail = editor.post.sections.head.tailPosition();

  // Before zwnj
  Helpers.dom.moveCursorTo(editorElement.firstChild.firstChild, 0);
  Helpers.dom.triggerRightArrowKey(editor);
  let { offsets } = editor.cursor;

  assert.positionIsEqual(offsets.head, cardTail);
  assert.positionIsEqual(offsets.tail, cardTail);

  // After zwnj
  Helpers.dom.moveCursorTo(editorElement.firstChild.firstChild, 1);
  Helpers.dom.triggerRightArrowKey(editor);
  offsets = editor.cursor.offsets;

  assert.positionIsEqual(offsets.head, cardTail);
  assert.positionIsEqual(offsets.tail, cardTail);
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
  let sectionHead = editor.post.sections.tail.headPosition();

  // Before zwnj
  let sectionElement = editor.post.sections.head.renderNode.element;
  Helpers.dom.moveCursorTo(sectionElement.lastChild, 0);
  Helpers.dom.triggerRightArrowKey(editor);
  let { offsets } = editor.cursor;

  assert.positionIsEqual(offsets.head, sectionHead);
  assert.positionIsEqual(offsets.tail, sectionHead);

  // After zwnj
  sectionElement = editor.post.sections.head.renderNode.element;
  Helpers.dom.moveCursorTo(sectionElement.lastChild, 1);
  Helpers.dom.triggerRightArrowKey(editor);
  offsets = editor.cursor.offsets;

  // On wrapper
  Helpers.dom.moveCursorTo(editorElement.firstChild, 2);
  Helpers.dom.triggerRightArrowKey(editor);
  offsets = editor.cursor.offsets;

  assert.positionIsEqual(offsets.head, sectionHead);
  assert.positionIsEqual(offsets.tail, sectionHead);
});

test('right arrow at end of card moves cursor to next list item', assert => {
  let mobiledoc = Helpers.mobiledoc.build(
    ({post, listSection, listItem, marker, cardSection}) => {
    return post([
      cardSection('my-card'),
      listSection('ul', [listItem([marker('abc')])])
    ]);
  });
  editor = new Editor({mobiledoc, cards});
  editor.render(editorElement);
  let itemHead = editor.post.sections.tail.items.head.headPosition();

  // Before zwnj
  let sectionElement = editor.post.sections.head.renderNode.element;
  Helpers.dom.moveCursorTo(sectionElement.lastChild, 0);
  Helpers.dom.triggerRightArrowKey(editor);
  let { offsets } = editor.cursor;

  assert.positionIsEqual(offsets.head, itemHead);
  assert.positionIsEqual(offsets.tail, itemHead);

  // After zwnj
  Helpers.dom.moveCursorTo(sectionElement.lastChild, 1);
  Helpers.dom.triggerRightArrowKey(editor);
  offsets = editor.cursor.offsets;

  assert.positionIsEqual(offsets.head, itemHead);
  assert.positionIsEqual(offsets.tail, itemHead);
});

module('Acceptance: Cursor Movement w/ shift', {
  beforeEach() {
    editorElement = $('#editor')[0];
  },

  afterEach() {
    if (editor) { editor.destroy(); }
  }
});

if (supportsSelectionExtend()) {
  // FIXME: Older versions of IE do not support `extends` on selection
  // objects, and thus cannot support highlighting left until we implement
  // selections without native APIs.
  test('left arrow when at the end of a card moves the selection across the card', assert => {
    let mobiledoc = Helpers.mobiledoc.build(({post, cardSection}) => {
      return post([
        cardSection('my-card')
      ]);
    });
    editor = new Editor({mobiledoc, cards});
    editor.render(editorElement);

    let cardHead = editor.post.sections.head.headPosition();
    let cardTail = editor.post.sections.head.tailPosition();

    // Before zwnj
    Helpers.dom.moveCursorTo(editorElement.firstChild.lastChild, 0);
    Helpers.dom.triggerLeftArrowKey(editor, MODIFIERS.SHIFT);
    let { offsets } = editor.cursor;

    assert.positionIsEqual(offsets.head, cardHead);
    assert.positionIsEqual(offsets.tail, cardTail);

    // After zwnj
    Helpers.dom.moveCursorTo(editorElement.firstChild.lastChild, 1);
    Helpers.dom.triggerLeftArrowKey(editor, MODIFIERS.SHIFT);
    offsets = editor.cursor.offsets;

    assert.positionIsEqual(offsets.head, cardHead);
    assert.positionIsEqual(offsets.tail, cardTail);

    // On wrapper
    Helpers.dom.moveCursorTo(editorElement.firstChild, 2);
    Helpers.dom.triggerLeftArrowKey(editor, MODIFIERS.SHIFT);
    offsets = editor.cursor.offsets;

    assert.positionIsEqual(offsets.head, cardHead);
    assert.positionIsEqual(offsets.tail, cardTail);
  });

  test('left arrow at start of card moves selection to prev section', assert => {
    let mobiledoc = Helpers.mobiledoc.build(
      ({post, markupSection, marker, cardSection}) => {
      return post([
        markupSection('p', [marker('abc')]),
        cardSection('my-card')
      ]);
    });
    editor = new Editor({mobiledoc, cards});
    editor.render(editorElement);

    let cardHead = editor.post.sections.tail.headPosition();
    let sectionTail = editor.post.sections.head.tailPosition();

    // Before zwnj
    Helpers.dom.moveCursorTo(editorElement.lastChild.firstChild, 0);
    Helpers.dom.triggerLeftArrowKey(editor, MODIFIERS.SHIFT);
    let { offsets } = editor.cursor;

    assert.positionIsEqual(offsets.head, sectionTail);
    assert.positionIsEqual(offsets.tail, cardHead);

    // After zwnj
    Helpers.dom.moveCursorTo(editorElement.lastChild.firstChild, 1);
    Helpers.dom.triggerLeftArrowKey(editor, MODIFIERS.SHIFT);
    offsets = editor.cursor.offsets;

    assert.positionIsEqual(offsets.head, sectionTail);
    assert.positionIsEqual(offsets.tail, cardHead);
  });

  test('left arrow at start of card moves selection to prev list item', assert => {
    let mobiledoc = Helpers.mobiledoc.build(
      ({post, listSection, listItem, marker, cardSection}) => {
      return post([
        listSection('ul', [listItem([marker('abc')])]),
        cardSection('my-card')
      ]);
    });
    editor = new Editor({mobiledoc, cards});
    editor.render(editorElement);

    let cardHead = editor.post.sections.tail.headPosition();
    let sectionTail = editor.post.sections.head.items.head.tailPosition();

    // Before zwnj
    Helpers.dom.moveCursorTo(editorElement.lastChild.firstChild, 0);
    Helpers.dom.triggerLeftArrowKey(editor, MODIFIERS.SHIFT);
    let { offsets } = editor.cursor;

    assert.positionIsEqual(offsets.head, sectionTail);
    assert.positionIsEqual(offsets.tail, cardHead);

    // After zwnj
    Helpers.dom.moveCursorTo(editorElement.lastChild.firstChild, 1);
    Helpers.dom.triggerLeftArrowKey(editor, MODIFIERS.SHIFT);
    offsets = editor.cursor.offsets;

    assert.positionIsEqual(offsets.head, sectionTail);
    assert.positionIsEqual(offsets.tail, cardHead);
  });
}

test('right arrow at start of card moves the cursor across the card', assert => {
  let mobiledoc = Helpers.mobiledoc.build(({post, cardSection}) => {
    return post([
      cardSection('my-card')
    ]);
  });
  editor = new Editor({mobiledoc, cards});
  editor.render(editorElement);

  let cardHead = editor.post.sections.head.headPosition();
  let cardTail = editor.post.sections.head.tailPosition();

  // Before zwnj
  Helpers.dom.moveCursorTo(editorElement.firstChild.firstChild, 0);
  Helpers.dom.triggerRightArrowKey(editor, MODIFIERS.SHIFT);
  let { offsets } = editor.cursor;

  assert.positionIsEqual(offsets.head, cardHead);
  assert.positionIsEqual(offsets.tail, cardTail);

  // After zwnj
  Helpers.dom.moveCursorTo(editorElement.firstChild.firstChild, 1);
  Helpers.dom.triggerRightArrowKey(editor, MODIFIERS.SHIFT);
  offsets = editor.cursor.offsets;

  assert.positionIsEqual(offsets.head, cardHead);
  assert.positionIsEqual(offsets.tail, cardTail);
});

test('right arrow at end of card moves to next section', (assert) => {
  let mobiledoc = Helpers.mobiledoc.build(
    ({post, markupSection, marker, cardSection}) => {
    return post([
      cardSection('my-card'),
      markupSection('p', [marker('abc')])
    ]);
  });
  editor = new Editor({mobiledoc, cards});
  editor.render(editorElement);

  let cardTail = editor.post.sections.head.tailPosition();
  let sectionHead = editor.post.sections.tail.headPosition();

  // Before zwnj
  Helpers.dom.moveCursorTo(editorElement.firstChild.lastChild, 0);
  Helpers.dom.triggerRightArrowKey(editor, MODIFIERS.SHIFT);
  let { offsets } = editor.cursor;

  assert.positionIsEqual(offsets.head, cardTail);
  assert.positionIsEqual(offsets.tail, sectionHead);

  // After zwnj
  Helpers.dom.moveCursorTo(editorElement.firstChild.lastChild, 1);
  Helpers.dom.triggerRightArrowKey(editor, MODIFIERS.SHIFT);
  offsets = editor.cursor.offsets;

  assert.positionIsEqual(offsets.head, cardTail);
  assert.positionIsEqual(offsets.tail, sectionHead);
});

test('right arrow at end of card moves to next list item', (assert) => {
  let mobiledoc = Helpers.mobiledoc.build(
    ({post, listSection, listItem, marker, cardSection}) => {
    return post([
      cardSection('my-card'),
      listSection('ul', [listItem([marker('abc')])])
    ]);
  });
  editor = new Editor({mobiledoc, cards});
  editor.render(editorElement);

  let cardTail = editor.post.sections.head.tailPosition();
  let itemHead = editor.post.sections.tail.items.head.headPosition();

  // Before zwnj
  Helpers.dom.moveCursorTo(editorElement.firstChild.lastChild, 0);
  Helpers.dom.triggerRightArrowKey(editor, MODIFIERS.SHIFT);
  let { offsets } = editor.cursor;

  assert.positionIsEqual(offsets.head, cardTail);
  assert.positionIsEqual(offsets.tail, itemHead);

  // After zwnj
  Helpers.dom.moveCursorTo(editorElement.firstChild.lastChild, 1);
  Helpers.dom.triggerRightArrowKey(editor, MODIFIERS.SHIFT);
  offsets = editor.cursor.offsets;

  assert.positionIsEqual(offsets.head, cardTail);
  assert.positionIsEqual(offsets.tail, itemHead);
});
