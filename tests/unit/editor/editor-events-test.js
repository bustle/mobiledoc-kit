import Helpers from '../../test-helpers';
import { Editor } from 'mobiledoc-kit';
import Range from 'mobiledoc-kit/utils/cursor/range';

const { module, test } = Helpers;

let editor, editorElement;

const mobiledoc = Helpers.mobiledoc.build(({post, markupSection, marker}) => {
  return post([markupSection('p', [marker('this is the editor')])]);
});

module('Unit: Editor: events and lifecycle callbacks', {
  beforeEach() {
    editorElement = $('#editor')[0];
    editor = new Editor({mobiledoc});
    editor.render(editorElement);

    // Tests in FF can fail if the window is not front-most and
    // we don't explicitly render the range
    editor.selectRange(new Range(editor.post.tailPosition()));
  },

  afterEach() {
    if (editor && !editor.isDestroyed) {
      editor.destroy();
      editor = null;
    }
  }
});

test('cursorDidChange callback does not fire when selection is set to the same value', (assert) => {
  assert.expect(1);
  let done = assert.async();

  let cursorChanged = 0;
  editor.cursorDidChange(() => cursorChanged++);

  let node = Helpers.dom.findTextNode(editorElement, 'this is the editor');
  Helpers.dom.selectRange(node, 0, node, 0);

  Helpers.wait(() => {
    cursorChanged = 0;

    Helpers.dom.selectRange(node, 0, node, 0);

    Helpers.wait(() => {
      assert.equal(cursorChanged, 0, 'cursor did not change when selection is set to same value');

      done();
    });
  });
});

test('cursorDidChange callback fires when editor loses focus', (assert) => {
  assert.expect(1);
  let done = assert.async();

  Helpers.wait(() => {
    // Tests in FF can fail if the window is not front-most and
    // we don't explicitly render the range
    let node = Helpers.dom.findTextNode(editor.element, 'this is the editor');
    Helpers.dom.selectRange(node, 0, node, 0);

    Helpers.wait(() => {
      let cursorChanged = 0;
      editor.cursorDidChange(() => cursorChanged++);

      Helpers.dom.clearSelection();

      Helpers.wait(() => {
        assert.equal(cursorChanged, 1, 'cursor changed after clearing selection');

        done();
      });
    });
  });
});

test('cursorDidChange callback not fired if editor is destroyed', (assert) => {
  assert.expect(2);
  let done = assert.async();

  let cursorChanged = 0;
  editor.cursorDidChange(() => cursorChanged++);

  Helpers.dom.clearSelection();

  Helpers.wait(() => {
    cursorChanged = 0;
    let node = Helpers.dom.findTextNode(editor.element, 'this is the editor');
    Helpers.dom.selectRange(node, 0, node, 0);

    Helpers.wait(() => {
      assert.equal(cursorChanged, 1, 'precond - cursor change fires');

      cursorChanged = 0;
      editor.destroy();
      Helpers.dom.clearSelection();

      Helpers.wait(() => {
        assert.equal(cursorChanged, 0, 'callback not fired');

        done();
      });
    });
  });
});

test('cursorChanged callback fired after editor.run sets range', (assert) => {
  assert.expect(2);
  let done = assert.async();

  let cursorChanged = 0;
  editor.cursorDidChange(() => cursorChanged++);

  Helpers.wait(() => {
    assert.equal(cursorChanged, 0, 'precond - no cursor change');

    editor.run(postEditor => {
      let position = editor.post.headPosition();
      postEditor.insertText(position, 'blah');
      postEditor.setRange(new Range(editor.post.tailPosition()));
    });

    Helpers.wait(() => {
      assert.equal(cursorChanged, 1, 'cursor changes after editor.run sets position');

      done();
    });
  });
});

test('postDidChange callback fired when post is programmatically modified', (assert) => {
  assert.expect(1);

  let postChanged = 0;
  editor.postDidChange(() => postChanged++);
  editor.run(postEditor => {
    let position = editor.post.headPosition();
    postEditor.insertText(position, 'blah');
  });

  assert.equal(postChanged, 1, 'postDidChange fired once');
});

test('postDidChange callback fired when post is modified via user input', (assert) => {
  assert.expect(1);

  let postChanged = 0;
  editor.postDidChange(() => postChanged++);

  Helpers.dom.selectText(editor, "this is the editor", editorElement);
  Helpers.dom.triggerDelete(editor);

  assert.equal(postChanged, 1, 'postDidChange fired once');
});

test('postDidChange callback fired when card payload changes', (assert) => {
  let env;
  let cards = [{
    name: 'simple-card',
    type: 'dom',
    render({env: _env}) {
      env = _env;
      return $('<div id="my-simple-card">simple-card (display)</div>')[0];
    },
    edit({env: _env}) {
      env = _env;
      return $('<div id="my-simple-card">simple-card (edit)</div>')[0];
    }
  }];
  let editor = Helpers.mobiledoc.renderInto(editorElement, ({post, cardSection}) => {
    return post([cardSection('simple-card')]);
  }, { cards });

  let postDidChange = 0;
  editor.postDidChange(() => postDidChange++);

  env.save({});
  assert.equal(postDidChange, 1, 'postDidChange called after save');

  postDidChange = 0;
  env.edit();
  assert.equal(postDidChange, 0, 'postDidChange not called after edit');

  postDidChange = 0;
  env.cancel();
  assert.equal(postDidChange, 0, 'postDidChange not called after cancel');

  postDidChange = 0;
  env.remove();
  assert.equal(postDidChange, 1, 'postDidChange called after remove');

  editor.destroy();
});

test('inputModeDidChange callback fired when markup is toggled and there is a selection', (assert) => {
  let done = assert.async();
  assert.expect(1);

  Helpers.dom.selectText(editor, "this is the editor", editorElement);

  Helpers.wait(() => {
    let inputChanged = 0;
    editor.inputModeDidChange(() => inputChanged++);

    editor.toggleMarkup('b');

    Helpers.wait(() => {
      assert.equal(inputChanged, 1, 'inputModeDidChange fired once');
      done();
    });
  });
});

test('inputModeDidChange callback fired when markup is toggled and selection is collapsed', (assert) => {
  let done = assert.async();
  assert.expect(2);

  editor.selectRange(new Range(editor.post.headPosition()));

  assert.ok(editor.range.isCollapsed, 'precond - range is collapsed');

  Helpers.wait(() => {
    let inputChanged = 0;
    editor.inputModeDidChange(() => inputChanged++);

    editor.toggleMarkup('b');

    Helpers.wait(() => {
      assert.equal(inputChanged, 1, 'inputModeDidChange fired once');
      done();
    });
  });
});

test('inputModeDidChange callback fired when moving cursor into markup', (assert) => {
  let done = assert.async();
  assert.expect(1);

  // setup - turn text bold
  Helpers.dom.selectText(editor, 'this is', editorElement);
  editor.toggleMarkup('b');
  editor.selectRange(Range.create(editor.post.sections.head, 'this is'.length));

  Helpers.wait(() => {
    let inputChanged = 0;
    editor.inputModeDidChange(() => inputChanged++);

    editor.selectRange(editor.range.move(1));

    Helpers.wait(() => {
      assert.equal(inputChanged, 1, 'inputModeDidChange fired once');
      done();
    });
  });
});

test('after #toggleMarkup, editor refocuses if it had selection', (assert) => {
  let done = assert.async();
  assert.expect(3);

  let button =
    $('<button>BOLD</button>')
      .appendTo('#qunit-fixture')
      .click(() => {
        Helpers.dom.selectText(editor, 'this', editorElement); // necessary for Safari to detect a selection in the editor
        button.focus();

        assert.ok(document.activeElement !== editor.element, 'precond - editor element is not focused');
        editor.toggleMarkup('b');
      });

  editor.selectRange(new Range(editor.post.headPosition()));

  Helpers.wait(() => {
    let inputChanged = 0;
    editor.inputModeDidChange(() => inputChanged++);

    button.click();

    Helpers.wait(() => {
      assert.equal(inputChanged, 1, 'inputModeDidChange fired once');
      assert.ok(document.activeElement === editor.element, 'editor element is focused');

      done();
    });
  });
});

test('inputModeDidChange callback fired when toggling section', (assert) => {
  let done = assert.async();
  assert.expect(1);

  Helpers.dom.selectText(editor, 'this is', editorElement);

  let inputChanged = 0;
  editor.inputModeDidChange(() => inputChanged++);

  editor.toggleSection('h2');

  Helpers.wait(() => {
    assert.equal(inputChanged, 1, 'inputModeDidChange fired once');
    done();
  });
});

test('inputModeDidChange callback not fired when toggle is no-op', (assert) => {
  let done = assert.async();
  assert.expect(1);

  Helpers.dom.selectText(editor, 'this is', editorElement);

  let inputChanged = 0;
  editor.inputModeDidChange(() => inputChanged++);

  editor.toggleSection('p'); // toggling to same section is no-op

  Helpers.wait(() => {
    assert.equal(inputChanged, 0, 'inputModeDidChange not fired');
    done();
  });
});

test('inputModeDidChange callback fired when moving cursor into section', (assert) => {
  let done = assert.async();
  assert.expect(2);

  editor.run(postEditor => {
    let marker = postEditor.builder.createMarker('abc');
    let newSection = postEditor.builder.createMarkupSection('h2', [marker]);
    postEditor.insertSectionAtEnd(newSection);
  });

  let inputChanged = 0;
  editor.inputModeDidChange(() => {
    inputChanged++;
  });

  assert.hasElement('h2:contains(abc)', 'precond - inserted h2');
  editor.selectRange(new Range(editor.post.sections.tail.headPosition()));

  Helpers.wait(() => {
    inputChanged = 0;

    editor.selectRange(new Range(editor.post.sections.head.tailPosition()));

    Helpers.wait(() => {
      assert.equal(inputChanged, 1, 'inputModeDidChange fired once');
      done();
    });
  });
});

test('inputModeDidChange callback not fired when moving cursor into same section', (assert) => {
  let done = assert.async();
  assert.expect(2);

  editor.run(postEditor => {
    let marker = postEditor.builder.createMarker('abc');
    let newSection = postEditor.builder.createMarkupSection('p', [marker]);
    postEditor.insertSectionAtEnd(newSection);
  });

  assert.hasElement('p:contains(abc)', 'precond - inserted p');
  editor.selectRange(new Range(editor.post.sections.tail.headPosition()));

  let inputChanged = 0;
  editor.inputModeDidChange(() => inputChanged++);

  Helpers.dom.triggerLeftArrowKey(editor);

  Helpers.wait(() => {
    assert.equal(inputChanged, 0, 'inputModeDidChange not fired');
    done();
  });
});

test('inputModeDidChange called when changing from ul to ol', (assert) => {
  assert.expect(4);

  editor.selectRange(new Range(editor.post.headPosition(), editor.post.tailPosition()));

  let inputChanged = 0;
  editor.inputModeDidChange(() => inputChanged++);

  editor.toggleSection('ul');

  assert.hasElement('#editor ul li', 'created ul');
  assert.equal(inputChanged, 1, 'precond - changed to ul');

  editor.toggleSection('ol');

  assert.hasElement('#editor ol li', 'created ol');
  assert.equal(inputChanged, 2, 'inputModeDidChange fired after ul->ol');
});
