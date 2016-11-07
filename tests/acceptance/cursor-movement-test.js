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

const atoms = [{
  name: 'my-atom',
  type: 'dom',
  render() {
    return document.createTextNode('my-atom');
  }
}];

let editor, editorElement;
let editorOptions = {cards, atoms};

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
  Helpers.dom.moveCursorTo(editor, editorElement.firstChild.lastChild, 0);
  Helpers.dom.triggerLeftArrowKey(editor);
  let { range } = editor;

  assert.positionIsEqual(range.head, cardHead);
  assert.positionIsEqual(range.tail, cardHead);

  // After zwnj
  Helpers.dom.moveCursorTo(editor, editorElement.firstChild.lastChild, 1);
  Helpers.dom.triggerLeftArrowKey(editor);
  range = editor.range;

  assert.positionIsEqual(range.head, cardHead);
  assert.positionIsEqual(range.tail, cardHead);

  // On wrapper
  Helpers.dom.moveCursorTo(editor, editorElement.firstChild, 2);
  Helpers.dom.triggerLeftArrowKey(editor);
  range = editor.range;

  assert.positionIsEqual(range.head, cardHead);
  assert.positionIsEqual(range.tail, cardHead);
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
  Helpers.dom.moveCursorTo(editor, sectionElement.firstChild, 0);
  Helpers.dom.triggerLeftArrowKey(editor);
  let { range } = editor;

  assert.positionIsEqual(range.head, sectionTail);
  assert.positionIsEqual(range.tail, sectionTail);

  // After zwnj
  Helpers.dom.moveCursorTo(editor, sectionElement.firstChild, 1);
  Helpers.dom.triggerLeftArrowKey(editor);
  range = editor.range;

  assert.positionIsEqual(range.head, sectionTail);
  assert.positionIsEqual(range.tail, sectionTail);
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
  Helpers.dom.moveCursorTo(editor, sectionElement.firstChild, 0);
  Helpers.dom.triggerLeftArrowKey(editor);
  let { range } = editor;

  assert.positionIsEqual(range.head, itemTail);
  assert.positionIsEqual(range.tail, itemTail);

  // After zwnj
  sectionElement = editor.post.sections.tail.renderNode.element;
  Helpers.dom.moveCursorTo(editor, sectionElement.firstChild, 1);
  Helpers.dom.triggerLeftArrowKey(editor);
  range = editor.range;

  assert.positionIsEqual(range.head, itemTail);
  assert.positionIsEqual(range.tail, itemTail);
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
  Helpers.dom.moveCursorTo(editor, editorElement.firstChild.firstChild, 0);
  Helpers.dom.triggerRightArrowKey(editor);
  let { range } = editor;

  assert.positionIsEqual(range.head, cardTail);
  assert.positionIsEqual(range.tail, cardTail);

  // After zwnj
  Helpers.dom.moveCursorTo(editor, editorElement.firstChild.firstChild, 1);
  Helpers.dom.triggerRightArrowKey(editor);
  range = editor.range;

  assert.positionIsEqual(range.head, cardTail);
  assert.positionIsEqual(range.tail, cardTail);
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
  Helpers.dom.moveCursorTo(editor, sectionElement.lastChild, 0);
  Helpers.dom.triggerRightArrowKey(editor);
  let { range } = editor;

  assert.positionIsEqual(range.head, sectionHead);
  assert.positionIsEqual(range.tail, sectionHead);

  // After zwnj
  Helpers.dom.moveCursorTo(editor, sectionElement.lastChild, 1);
  Helpers.dom.triggerRightArrowKey(editor);
  range = editor.range;

  // On wrapper
  Helpers.dom.moveCursorTo(editor, editorElement.firstChild, 2);
  Helpers.dom.triggerRightArrowKey(editor);
  range = editor.range;

  assert.positionIsEqual(range.head, sectionHead);
  assert.positionIsEqual(range.tail, sectionHead);
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
  Helpers.dom.moveCursorTo(editor, sectionElement.lastChild, 0);
  Helpers.dom.triggerRightArrowKey(editor);
  let { range } = editor;

  assert.positionIsEqual(range.head, itemHead);
  assert.positionIsEqual(range.tail, itemHead);

  // After zwnj
  Helpers.dom.moveCursorTo(editor, sectionElement.lastChild, 1);
  Helpers.dom.triggerRightArrowKey(editor);
  range = editor.range;

  assert.positionIsEqual(range.head, itemHead);
  assert.positionIsEqual(range.tail, itemHead);
});

test('left arrow when at the head of an atom moves the cursor left off the atom', assert => {
  let mobiledoc = Helpers.mobiledoc.build(({post, markupSection, marker, atom}) => {
    return post([
      markupSection('p', [
        marker('aa'),
        atom('my-atom'),
        marker('cc')
      ])
    ]);
  // TODO just make 0.3.1 default
  }, '0.3.1');
  editor = new Editor({mobiledoc, atoms});
  editor.render(editorElement);

  let atomWrapper = editor.post.sections.head.markers.objectAt(1).renderNode.element;

  // Before zwnj, assert moving left
  Helpers.dom.moveCursorTo(editor, atomWrapper.lastChild, 0);
  Helpers.dom.triggerLeftArrowKey(editor);
  let range = editor.range;

  assert.ok(range.head.section === editor.post.sections.head,
            'Cursor is positioned on first section');
  assert.equal(range.head.offset, 2,
               'Cursor is positioned at offset 2');

  // After zwnj, assert moving left
  Helpers.dom.moveCursorTo(editor, atomWrapper.lastChild, 1);
  Helpers.dom.triggerLeftArrowKey(editor);
  range = editor.range;

  assert.ok(range.head.section === editor.post.sections.head,
            'Cursor is positioned on first section');
  assert.equal(range.head.offset, 2,
               'Cursor is positioned at offset 2');

  // On wrapper, assert moving left
  Helpers.dom.moveCursorTo(editor, atomWrapper, 3);
  Helpers.dom.triggerLeftArrowKey(editor);
  range = editor.range;

  assert.ok(range.head.section === editor.post.sections.head,
            'Cursor is positioned on first section');
  assert.equal(range.head.offset, 2,
               'Cursor is positioned at offset 2');

  // After wrapper, asseat moving left
  Helpers.dom.moveCursorTo(editor, atomWrapper.nextSibling, 0);
  Helpers.dom.triggerLeftArrowKey(editor);
  range = editor.range;

  assert.ok(range.head.section === editor.post.sections.head,
            'Cursor is positioned on first section');
  assert.equal(range.head.offset, 2,
               'Cursor is positioned at offset 2');
});

test('right arrow when at the head of an atom moves the cursor across the atom', assert => {
  let mobiledoc = Helpers.mobiledoc.build(({post, markupSection, marker, atom}) => {
    return post([
      markupSection('p', [
        marker('aa'),
        atom('my-atom'),
        marker('cc')
      ])
    ]);
  // TODO just make 0.3.1 default
  }, '0.3.1');
  editor = new Editor({mobiledoc, atoms});
  editor.render(editorElement);

  let atomWrapper = editor.post.sections.head.markers.objectAt(1).renderNode.element;

  // Before zwnj, assert moving right
  Helpers.dom.moveCursorTo(editor, atomWrapper.firstChild, 0);
  Helpers.dom.triggerRightArrowKey(editor);
  let range = editor.range;

  assert.ok(range.head.section === editor.post.sections.head,
            'Cursor is positioned on first section');
  assert.equal(range.head.offset, 3,
               'Cursor is positioned at offset 3');

  // After zwnj, assert moving right
  Helpers.dom.moveCursorTo(editor, atomWrapper.firstChild, 1);
  Helpers.dom.triggerRightArrowKey(editor);
  range = editor.range;

  assert.ok(range.head.section === editor.post.sections.head,
            'Cursor is positioned on first section');
  assert.equal(range.head.offset, 3,
               'Cursor is positioned at offset 3');

  // On wrapper, assert moving right
  Helpers.dom.moveCursorTo(editor, atomWrapper, 1);
  Helpers.dom.triggerRightArrowKey(editor);
  range = editor.range;

  assert.ok(range.head.section === editor.post.sections.head,
            'Cursor is positioned on first section');
  assert.equal(range.head.offset, 3,
               'Cursor is positioned at offset 3');

  // After wrapper, assert moving right
  Helpers.dom.moveCursorTo(editor, atomWrapper.previousSibling, 2);
  Helpers.dom.triggerRightArrowKey(editor);
  range = editor.range;

  assert.ok(range.head.section === editor.post.sections.head,
            'Cursor is positioned on first section');
  assert.equal(range.head.offset, 3,
               'Cursor is positioned at offset 3');
});

test('left/right arrows moves cursor l-to-r and r-to-l across atom', (assert) => {
  editor = Helpers.mobiledoc.renderInto(editorElement, ({post, markupSection, marker, atom}) => {
    return post([markupSection('p', [atom('my-atom', 'first')])]);
  }, editorOptions);

  editor.selectRange(editor.post.tailPosition());
  Helpers.dom.triggerLeftArrowKey(editor);
  assert.positionIsEqual(editor.range.head, editor.post.headPosition());
  assert.positionIsEqual(editor.range.tail, editor.post.headPosition());

  editor.selectRange(editor.post.headPosition());
  Helpers.dom.triggerRightArrowKey(editor);
  assert.positionIsEqual(editor.range.head, editor.post.tailPosition());
  assert.positionIsEqual(editor.range.tail, editor.post.tailPosition());
});

test('left arrow at start atom moves to end of prev section', (assert) => {
  editor = Helpers.mobiledoc.renderInto(editorElement, ({post, markupSection, marker, atom}) => {
    return post([
      markupSection('p', [marker('abc')]),
      markupSection('p', [atom('my-atom', 'first')])
    ]);
  }, editorOptions);

  editor.selectRange(editor.post.sections.tail.headPosition());
  Helpers.dom.triggerLeftArrowKey(editor);
  assert.positionIsEqual(editor.range.head, editor.post.sections.head.tailPosition());
});

test('right arrow at end of end atom moves to start of next section', (assert) => {
  editor = Helpers.mobiledoc.renderInto(editorElement, ({post, markupSection, marker, atom}) => {
    return post([
      markupSection('p', [atom('my-atom', 'first')]),
      markupSection('p', [marker('abc')])
    ]);
  }, editorOptions);

  editor.selectRange(editor.post.sections.head.tailPosition());
  Helpers.dom.triggerRightArrowKey(editor);
  assert.positionIsEqual(editor.range.head, editor.post.sections.tail.headPosition());
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
    Helpers.dom.moveCursorTo(editor, editorElement.firstChild.lastChild, 0);
    Helpers.dom.triggerLeftArrowKey(editor, MODIFIERS.SHIFT);
    let { range } = editor;

    assert.positionIsEqual(range.head, cardHead);
    assert.positionIsEqual(range.tail, cardTail);

    // After zwnj
    Helpers.dom.moveCursorTo(editor, editorElement.firstChild.lastChild, 1);
    Helpers.dom.triggerLeftArrowKey(editor, MODIFIERS.SHIFT);
    range = editor.range;

    assert.positionIsEqual(range.head, cardHead);
    assert.positionIsEqual(range.tail, cardTail);

    // On wrapper
    Helpers.dom.moveCursorTo(editor, editorElement.firstChild, 2);
    Helpers.dom.triggerLeftArrowKey(editor, MODIFIERS.SHIFT);
    range = editor.range;

    assert.positionIsEqual(range.head, cardHead);
    assert.positionIsEqual(range.tail, cardTail);
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
    Helpers.dom.moveCursorTo(editor, editorElement.lastChild.firstChild, 0);
    Helpers.dom.triggerLeftArrowKey(editor, MODIFIERS.SHIFT);
    let { range } = editor;

    assert.positionIsEqual(range.head, sectionTail);
    assert.positionIsEqual(range.tail, cardHead);

    // After zwnj
    Helpers.dom.moveCursorTo(editor, editorElement.lastChild.firstChild, 1);
    Helpers.dom.triggerLeftArrowKey(editor, MODIFIERS.SHIFT);
    range = editor.range;

    assert.positionIsEqual(range.head, sectionTail);
    assert.positionIsEqual(range.tail, cardHead);
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
    Helpers.dom.moveCursorTo(editor, editorElement.lastChild.firstChild, 0);
    Helpers.dom.triggerLeftArrowKey(editor, MODIFIERS.SHIFT);
    let { range } = editor;

    assert.positionIsEqual(range.head, sectionTail);
    assert.positionIsEqual(range.tail, cardHead);

    // After zwnj
    Helpers.dom.moveCursorTo(editor, editorElement.lastChild.firstChild, 1);
    Helpers.dom.triggerLeftArrowKey(editor, MODIFIERS.SHIFT);
    range = editor.range;

    assert.positionIsEqual(range.head, sectionTail);
    assert.positionIsEqual(range.tail, cardHead);
  });

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
    Helpers.dom.moveCursorTo(editor, editorElement.firstChild.firstChild, 0);
    Helpers.dom.triggerRightArrowKey(editor, MODIFIERS.SHIFT);
    let { range } = editor;

    assert.positionIsEqual(range.head, cardHead);
    assert.positionIsEqual(range.tail, cardTail);

    // After zwnj
    Helpers.dom.moveCursorTo(editor, editorElement.firstChild.firstChild, 1);
    Helpers.dom.triggerRightArrowKey(editor, MODIFIERS.SHIFT);
    range = editor.range;

    assert.positionIsEqual(range.head, cardHead);
    assert.positionIsEqual(range.tail, cardTail);
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
    Helpers.dom.moveCursorTo(editor, editorElement.firstChild.lastChild, 0);
    Helpers.dom.triggerRightArrowKey(editor, MODIFIERS.SHIFT);
    let { range } = editor;

    assert.positionIsEqual(range.head, cardTail);
    assert.positionIsEqual(range.tail, sectionHead);

    // After zwnj
    Helpers.dom.moveCursorTo(editor, editorElement.firstChild.lastChild, 1);
    Helpers.dom.triggerRightArrowKey(editor, MODIFIERS.SHIFT);
    range = editor.range;

    assert.positionIsEqual(range.head, cardTail);
    assert.positionIsEqual(range.tail, sectionHead);
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
    Helpers.dom.moveCursorTo(editor, editorElement.firstChild.lastChild, 0);
    Helpers.dom.triggerRightArrowKey(editor, MODIFIERS.SHIFT);
    let { range } = editor;

    assert.positionIsEqual(range.head, cardTail);
    assert.positionIsEqual(range.tail, itemHead);

    // After zwnj
    Helpers.dom.moveCursorTo(editor, editorElement.firstChild.lastChild, 1);
    Helpers.dom.triggerRightArrowKey(editor, MODIFIERS.SHIFT);
    range = editor.range;

    assert.positionIsEqual(range.head, cardTail);
    assert.positionIsEqual(range.tail, itemHead);
  });

  test('left/right arrows move selection l-to-r and r-to-l across atom', (assert) => {
    editor = Helpers.mobiledoc.renderInto(editorElement, ({post, markupSection, marker, atom}) => {
      return post([markupSection('p', [atom('my-atom', 'first')])]);
    }, editorOptions);

    editor.selectRange(editor.post.tailPosition());
    Helpers.dom.triggerLeftArrowKey(editor, MODIFIERS.SHIFT);
    assert.positionIsEqual(editor.range.head, editor.post.headPosition());
    assert.positionIsEqual(editor.range.tail, editor.post.tailPosition());

    editor.selectRange(editor.post.headPosition());
    Helpers.dom.triggerRightArrowKey(editor, MODIFIERS.SHIFT);
    assert.positionIsEqual(editor.range.head, editor.post.headPosition());
    assert.positionIsEqual(editor.range.tail, editor.post.tailPosition());
  });
}
