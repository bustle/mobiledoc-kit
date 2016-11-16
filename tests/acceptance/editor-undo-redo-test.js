import { MODIFIERS } from 'mobiledoc-kit/utils/key';
import Helpers from '../test-helpers';

const { module, test } = Helpers;

const undoBlockTimeout = 2000;

let editor, editorElement, oldDateNow;

function undo(editor) {
  Helpers.dom.triggerKeyCommand(editor, 'Z', [MODIFIERS.META]);
}

function redo(editor) {
  Helpers.dom.triggerKeyCommand(editor, 'Z', [MODIFIERS.META, MODIFIERS.SHIFT]);
}

module('Acceptance: Editor: Undo/Redo', {
  beforeEach() {
    editorElement = $('#editor')[0];
    oldDateNow = Date.now;
  },
  afterEach() {
    Date.now = oldDateNow;
    if (editor) {
      editor.destroy();
      editor = null;
    }
  }
});

test('undo/redo the insertion of a character', (assert) => {
  let done = assert.async();
  let expectedBeforeUndo, expectedAfterUndo;
  editor = Helpers.mobiledoc.renderIntoAndFocusTail(editorElement, ({post, markupSection, marker}) => {
    expectedBeforeUndo = post([markupSection('p', [marker('abcD')])]);
    expectedAfterUndo = post([markupSection('p', [marker('abc')])]);
    return expectedAfterUndo;
  });

  let textNode = Helpers.dom.findTextNode(editorElement, 'abc');
  Helpers.dom.moveCursorTo(editor, textNode, 'abc'.length);

  Helpers.dom.insertText(editor, 'D');

  Helpers.wait(()  => {
    assert.postIsSimilar(editor.post, expectedBeforeUndo); // precond
    undo(editor);
    assert.postIsSimilar(editor.post, expectedAfterUndo);
    assert.renderTreeIsEqual(editor._renderTree, expectedAfterUndo);

    let position = editor.range.head;
    assert.positionIsEqual(position, editor.post.sections.head.tailPosition());

    redo(editor);

    assert.postIsSimilar(editor.post, expectedBeforeUndo);
    assert.renderTreeIsEqual(editor._renderTree, expectedBeforeUndo);

    position = editor.range.head;
    assert.positionIsEqual(position, editor.post.sections.head.tailPosition());

    done();
  });
});

// Test to ensure that we don't push empty snapshots on the undo stack
// when typing characters
test('undo/redo the insertion of multiple characters', (assert) => {
  let done = assert.async();
  let beforeUndo, afterUndo;
  editor = Helpers.mobiledoc.renderIntoAndFocusTail(editorElement, ({post, markupSection, marker}) => {
    beforeUndo = post([markupSection('p', [marker('abcDE')])]);
    afterUndo = post([markupSection('p', [marker('abc')])]);
    return afterUndo;
  });

  let textNode = Helpers.dom.findTextNode(editorElement, 'abc');
  Helpers.dom.moveCursorTo(editor, textNode, 'abc'.length);

  Helpers.dom.insertText(editor, 'D');

  Helpers.wait(()  => {
    Helpers.dom.insertText(editor, 'E');

    Helpers.wait(()  => {
      assert.postIsSimilar(
        editor.post, beforeUndo,
        'precond - post was updated with new characters'
      );

      undo(editor);
      assert.postIsSimilar(
        editor.post, afterUndo,
        'ensure undo grouped to include both characters'
      );

      redo(editor);
      assert.postIsSimilar(
        editor.post, beforeUndo,
        'ensure redo grouped to include both characters'
      );
      done();
    });
  });
});


// Test to ensure that undo events group after a timeout
test('make sure undo/redo events group when adding text', (assert) => {
  let done = assert.async();
  let beforeUndo, afterUndo1, afterUndo2;
  editor = Helpers.mobiledoc.renderIntoAndFocusTail(editorElement, ({post, markupSection, marker}) => {
    beforeUndo = post([markupSection('p', [marker('123456789')])]);
    afterUndo1 = post([markupSection('p', [marker('123456')])]);
    afterUndo2 = post([markupSection('p', [marker('123')])]);
    return afterUndo2;
  }, {undoBlockTimeout});

  let textNode = Helpers.dom.findTextNode(editorElement, '123');
  Helpers.dom.moveCursorTo(editor, textNode, '123'.length);

  Helpers.dom.insertText(editor, '4');

  Helpers.wait(()  => {
    Helpers.dom.insertText(editor, '5');
    Helpers.wait(()  => {
      Helpers.dom.insertText(editor, '6');
      Helpers.wait(()  => {
        Date.now = function() {
          return oldDateNow.call(Date) + undoBlockTimeout + 1;
        };
        Helpers.dom.insertText(editor, '7');
        Helpers.wait(()  => {
          Helpers.dom.insertText(editor, '8');
          Helpers.wait(()  => {
            Helpers.dom.insertText(editor, '9');
            assert.postIsSimilar(editor.post, beforeUndo);

            undo(editor);
            assert.postIsSimilar(editor.post, afterUndo1);

            undo(editor);
            assert.postIsSimilar(editor.post, afterUndo2);

            redo(editor);
            assert.postIsSimilar(editor.post, afterUndo1);
            done();
          });
        });
      });
    });
  });
});


test('make sure undo/redo events group when deleting text', (assert) => {
  let done = assert.async();
  let beforeUndo, afterUndo1, afterUndo2;
  editor = Helpers.mobiledoc.renderIntoAndFocusTail(editorElement, ({post, markupSection, marker}) => {
    beforeUndo = post([markupSection('p', [marker('123')])]);
    afterUndo1 = post([markupSection('p', [marker('123456')])]);
    afterUndo2 = post([markupSection('p', [marker('123456789')])]);
    return afterUndo2;
  }, {undoBlockTimeout});

  let textNode = Helpers.dom.findTextNode(editorElement, '123456789');
  Helpers.dom.moveCursorTo(editor, textNode, '123456789'.length);

    Helpers.dom.triggerDelete(editor);
    Helpers.dom.triggerDelete(editor);
    Helpers.dom.triggerDelete(editor);

    Helpers.wait(()  => {
      Date.now = function() {
        return oldDateNow.call(Date) + undoBlockTimeout + 1;
      };

      Helpers.dom.triggerDelete(editor);
      Helpers.dom.triggerDelete(editor);
      Helpers.dom.triggerDelete(editor);

      assert.postIsSimilar(editor.post, beforeUndo);

      undo(editor);
      assert.postIsSimilar(editor.post, afterUndo1);

      undo(editor);
      assert.postIsSimilar(editor.post, afterUndo2);

      redo(editor);
      assert.postIsSimilar(editor.post, afterUndo1);
      done();
    });
});


test('adding and deleting characters break the undo group/run', (assert) => {
  let beforeUndo, afterUndo1, afterUndo2;
  let done = assert.async();
  editor = Helpers.mobiledoc.renderIntoAndFocusTail(editorElement, ({post, markupSection, marker}) => {
    beforeUndo = post([markupSection('p', [marker('abcXY')])]);
    afterUndo1 = post([markupSection('p', [marker('abc')])]);
    afterUndo2 = post([markupSection('p', [marker('abcDE')])]);
    return afterUndo2;
  });

  let textNode = Helpers.dom.findTextNode(editorElement, 'abcDE');
  Helpers.dom.moveCursorTo(editor, textNode, 'abcDE'.length);

  Helpers.dom.triggerDelete(editor);
  Helpers.dom.triggerDelete(editor);

    Helpers.dom.insertText(editor, 'X');

    Helpers.wait(()  => {
      Helpers.dom.insertText(editor, 'Y');

      Helpers.wait(()  => {
        assert.postIsSimilar(editor.post, beforeUndo); // precond

        undo(editor);
        assert.postIsSimilar(editor.post, afterUndo1);

        undo(editor);
        assert.postIsSimilar(editor.post, afterUndo2);

        redo(editor);
        assert.postIsSimilar(editor.post, afterUndo1);

        redo(editor);
        assert.postIsSimilar(editor.post, beforeUndo);
        done();
      });
    });
});

test('undo the deletion of a character', (assert) => {
  let expectedBeforeUndo, expectedAfterUndo;
  editor = Helpers.mobiledoc.renderIntoAndFocusTail(editorElement, ({post, markupSection, marker}) => {
    expectedBeforeUndo = post([markupSection('p', [marker('abc')])]);
    expectedAfterUndo = post([markupSection('p', [marker('abcD')])]);
    return expectedAfterUndo;
  });

  let textNode = Helpers.dom.findTextNode(editorElement, 'abcD');
  Helpers.dom.moveCursorTo(editor, textNode, 'abcD'.length);

  Helpers.dom.triggerDelete(editor);

  assert.postIsSimilar(editor.post, expectedBeforeUndo); // precond

  undo(editor);
  assert.postIsSimilar(editor.post, expectedAfterUndo);
  assert.renderTreeIsEqual(editor._renderTree, expectedAfterUndo);
  let position = editor.range.head;
  assert.positionIsEqual(position, editor.post.sections.head.tailPosition());

  redo(editor);
  assert.postIsSimilar(editor.post, expectedBeforeUndo);
  assert.renderTreeIsEqual(editor._renderTree, expectedBeforeUndo);
  position = editor.range.head;
  assert.positionIsEqual(position, editor.post.sections.head.tailPosition());
});

test('undo the deletion of a range', (assert) => {
  let expectedBeforeUndo, expectedAfterUndo;
  editor = Helpers.mobiledoc.renderIntoAndFocusTail(editorElement, ({post, markupSection, marker}) => {
    expectedBeforeUndo = post([markupSection('p', [marker('ad')])]);
    expectedAfterUndo = post([markupSection('p', [marker('abcd')])]);
    return expectedAfterUndo;
  });

  Helpers.dom.selectText(editor ,'bc', editorElement);
  Helpers.dom.triggerDelete(editor);

  assert.postIsSimilar(editor.post, expectedBeforeUndo); // precond

  undo(editor);
  assert.postIsSimilar(editor.post, expectedAfterUndo);
  assert.renderTreeIsEqual(editor._renderTree, expectedAfterUndo);
  let { head, tail } = editor.range;
  let section = editor.post.sections.head;
  assert.positionIsEqual(head, section.toPosition('a'.length));
  assert.positionIsEqual(tail, section.toPosition('abc'.length));

  redo(editor);
  assert.postIsSimilar(editor.post, expectedBeforeUndo);
  assert.renderTreeIsEqual(editor._renderTree, expectedBeforeUndo);
  head = editor.range.head;
  tail = editor.range.tail;
  section = editor.post.sections.head;
  assert.positionIsEqual(head, section.toPosition('a'.length));
  assert.positionIsEqual(tail, section.toPosition('a'.length));
});

test('undo insertion of character to a list item', (assert) => {
  let done = assert.async();
  let expectedBeforeUndo, expectedAfterUndo;
  editor = Helpers.mobiledoc.renderIntoAndFocusTail(editorElement, ({post, listSection, listItem, marker}) => {
    expectedBeforeUndo = post([
      listSection('ul', [listItem([marker('abcD')])])
    ]);
    expectedAfterUndo = post([
      listSection('ul', [listItem([marker('abc')])])
    ]);
    return expectedAfterUndo;
  });

  let textNode = Helpers.dom.findTextNode(editorElement, 'abc');
  Helpers.dom.moveCursorTo(editor, textNode, 'abc'.length);
  Helpers.dom.insertText(editor, 'D');

  Helpers.wait(() => {
    assert.postIsSimilar(editor.post, expectedBeforeUndo); // precond

    undo(editor);
    assert.postIsSimilar(editor.post, expectedAfterUndo);
    assert.renderTreeIsEqual(editor._renderTree, expectedAfterUndo);
    let { head, tail } = editor.range;
    let section = editor.post.sections.head.items.head;
    assert.positionIsEqual(head, section.toPosition('abc'.length));
    assert.positionIsEqual(tail, section.toPosition('abc'.length));

    redo(editor);
    assert.postIsSimilar(editor.post, expectedBeforeUndo);
    assert.renderTreeIsEqual(editor._renderTree, expectedBeforeUndo);
    head = editor.range.head;
    tail = editor.range.tail;
    section = editor.post.sections.head.items.head;
    assert.positionIsEqual(head, section.toPosition('abcD'.length));
    assert.positionIsEqual(tail, section.toPosition('abcD'.length));

    done();
  });
});

test('undo stack length can be configured (depth 1)', (assert) => {
  let done = assert.async();
  let editorOptions = { undoDepth: 1 };

  let beforeUndo, afterUndo;
  editor = Helpers.mobiledoc.renderIntoAndFocusTail(editorElement, ({post, markupSection, marker}) => {
    beforeUndo = post([markupSection('p', [marker('abcDE')])]);
    afterUndo = post([markupSection('p', [marker('abc')])]);
    return post([markupSection('p', [marker('abc')])]);
  }, editorOptions);

  let textNode = Helpers.dom.findTextNode(editorElement, 'abc');
  Helpers.dom.moveCursorTo(editor, textNode, 'abc'.length);
  Helpers.dom.insertText(editor, 'D');

  Helpers.wait(() => {
    Helpers.dom.insertText(editor, 'E');

    Helpers.wait(() => {
      assert.postIsSimilar(editor.post, beforeUndo); // precond

      undo(editor);
      assert.postIsSimilar(editor.post, afterUndo);
      assert.renderTreeIsEqual(editor._renderTree, afterUndo);
      assert.positionIsEqual(editor.range.head, editor.post.sections.head.tailPosition());

      undo(editor);
      assert.postIsSimilar(editor.post, afterUndo, 'second undo does not change post');
      assert.renderTreeIsEqual(editor._renderTree, afterUndo);
      assert.positionIsEqual(editor.range.head, editor.post.sections.head.tailPosition());

      done();
    });
  });
});

test('undo stack length can be configured (depth 0)', (assert) => {
  let done = assert.async();
  let editorOptions = { undoDepth: 0 };

  let beforeUndo;
  editor = Helpers.mobiledoc.renderIntoAndFocusTail(editorElement, ({post, markupSection, marker}) => {
    beforeUndo = post([markupSection('p', [marker('abcDE')])]);
    return post([markupSection('p', [marker('abc')])]);
  }, editorOptions);

  let textNode = Helpers.dom.findTextNode(editorElement, 'abc');
  Helpers.dom.moveCursorTo(editor, textNode, 'abc'.length);
  Helpers.dom.insertText(editor, 'D');

  Helpers.wait(() => {
    Helpers.dom.insertText(editor, 'E');

    Helpers.wait(() => {
      assert.postIsSimilar(editor.post, beforeUndo); // precond

      undo(editor);
      assert.postIsSimilar(editor.post, beforeUndo, 'nothing is undone');
      assert.renderTreeIsEqual(editor._renderTree, beforeUndo);
      assert.positionIsEqual(editor.range.head, editor.post.sections.head.tailPosition());

      done();
    });
  });
});

test('taking and restoring a snapshot with no cursor', (assert) => {
  let beforeUndo, afterUndo;
  editor = Helpers.mobiledoc.renderInto(editorElement, ({post, markupSection, marker}) => {
     beforeUndo = post([markupSection('p', [marker('abc')])]);
     afterUndo = post([markupSection('p', [])]);
     return afterUndo;
  }, {autofocus: false});

  assert.ok(!editor.cursor.hasCursor(), 'precond - no cursor');
  editor.run(postEditor => {
    postEditor.insertText(editor.post.headPosition(), 'abc');
  });
  assert.postIsSimilar(editor.post, beforeUndo, 'precond - text is added');

  undo(editor);
  assert.postIsSimilar(editor.post, afterUndo, 'text is removed');
});

test('take and undo a snapshot based on drag/dropping of text', (assert) => {
  let done = assert.async();
  let text = 'abc';
  let beforeUndo, afterUndo;
  editor = Helpers.mobiledoc.renderIntoAndFocusTail(editorElement, ({post, markupSection, marker}) => {
     beforeUndo = post([markupSection('p', [marker(text)])]);
     afterUndo = post([markupSection('p', [marker('a')])]);
     return afterUndo;
  });

  let textNode = Helpers.dom.findTextNode(editorElement, 'a');
  textNode.textContent = text;

  // Allow the mutation observer to fire, then...
  Helpers.wait(function() {
    assert.postIsSimilar(editor.post, beforeUndo, 'precond - text is added');
    undo(editor);
    assert.postIsSimilar(editor.post, afterUndo, 'text is removed');
    done();
  });
});

test('take and undo a snapshot when adding a card', (assert) => {
  let text = 'abc';
  let myCard = {
    name: 'my-card',
    type: 'dom',
    render() {
      return document.createTextNode('card contents');
    }
  };

  let beforeUndo, afterUndo;
  editor = Helpers.mobiledoc.renderIntoAndFocusTail(editorElement, ({post, markupSection, marker, cardSection}) => {
     beforeUndo = post([
       markupSection('p', [marker(text)]),
       cardSection('my-card', {})
     ]);
     afterUndo = post([markupSection('p', [marker(text)])]);
     return afterUndo;
  }, {
    cards: [myCard]
  });

  editor.run(postEditor => {
    let card = editor.builder.createCardSection('my-card', {});
    postEditor.insertSectionBefore(editor.post.sections, card, null);
  });

  assert.postIsSimilar(editor.post, beforeUndo, 'precond - card is added');
  undo(editor);
  assert.postIsSimilar(editor.post, afterUndo, 'card is removed');
});

test('take and undo a snapshot when removing an atom', (assert) => {
  let text = 'abc';
  let myAtom = {
    name: 'my-atom',
    type: 'dom',
    render() {
      return document.createTextNode('atom contents');
    }
  };

  let beforeUndo, afterUndo;
  editor = Helpers.mobiledoc.renderIntoAndFocusTail(editorElement, ({post, markupSection, marker, atom}) => {
    beforeUndo = post([
      markupSection('p', [
        marker(text)
      ])
    ]);
    afterUndo = post([
      markupSection('p', [
        marker(text),
        atom('my-atom', 'content', {})
      ]),
    ]);
    return afterUndo;
  }, {
    atoms: [myAtom]
  });

  editor.run(postEditor => {
    postEditor.removeMarker(editor.post.sections.head.markers.tail);
  });

  assert.postIsSimilar(editor.post, beforeUndo, 'precond - atom is removed');
  undo(editor);
  assert.postIsSimilar(editor.post, afterUndo, 'atom is restored');
});
