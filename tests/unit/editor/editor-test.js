import Editor from 'mobiledoc-kit/editor/editor';
import { EDITOR_ELEMENT_CLASS_NAME, EDITOR_HAS_NO_CONTENT_CLASS_NAME } from 'mobiledoc-kit/renderers/editor-dom';
import { normalizeTagName } from 'mobiledoc-kit/utils/dom-utils';
import { MOBILEDOC_VERSION } from 'mobiledoc-kit/renderers/mobiledoc/0-2';
import Range from 'mobiledoc-kit/utils/cursor/range';
import Helpers from '../../test-helpers';

const { module, test } = Helpers;

let editorElement, editor;

module('Unit: Editor', {
  beforeEach() {
    editorElement = $('#editor')[0];
  },

  afterEach() {
    if (editor && !editor.isDestroyed) {
      editor.destroy();
      editor = null;
    }
  }
});

test('can render an editor via dom node reference', (assert) => {
  editor = new Editor();
  editor.render(editorElement);
  assert.equal(editor.element, editorElement);
  assert.ok(editor.post);
});

test('autofocused editor hasCursor and has non-blank range after rendering', (assert) => {
  let done = assert.async();
  let mobiledoc = Helpers.mobiledoc.build(({post, markupSection}) => {
    return post([markupSection('p')]);
  });
  editor = new Editor({autofocus: true, mobiledoc});
  assert.ok(!editor.hasCursor(), 'precond - editor has no cursor');
  assert.ok(editor.range.isBlank, 'precond - editor has blank range');

  editor.render(editorElement);

  Helpers.wait(() => {
    assert.ok(editor.hasCursor(), 'editor has cursor');
    assert.ok(!editor.range.isBlank, 'editor has non-blank range');
    done();
  });
});

test('creating an editor with DOM node throws', (assert) => {
  assert.throws(function() {
    editor = new Editor(document.createElement('div'));
  }, /accepts an options object/);
});

test('rendering an editor without a class name adds appropriate class', (assert) => {
  editorElement.className = '';

  editor = new Editor();
  editor.render(editorElement);
  assert.hasClass(editor.element, EDITOR_ELEMENT_CLASS_NAME);
});

test('rendering an editor adds EDITOR_ELEMENT_CLASS_NAME if not there', (assert) => {
  editorElement.className = 'abc def';

  editor = new Editor();
  editor.render(editorElement);

  assert.hasClass(editor.element, EDITOR_ELEMENT_CLASS_NAME, `adds ${EDITOR_ELEMENT_CLASS_NAME}`);
  assert.hasClass(editor.element, 'abc', 'preserves existing classnames');
  assert.hasClass(editor.element, 'def', 'preserves existing classnames');
});

test('rendering an editor adds EDITOR_HAS_NO_CONTENT_CLASS_NAME if post has no content', (assert) => {
  editor = new Editor();
  assert.ok(!editor.post.hasContent, 'precond - post has no content');
  editor.render(editorElement);

  assert.hasClass(editorElement, EDITOR_HAS_NO_CONTENT_CLASS_NAME);

  // Firefox requires that the cursor be placed explicitly for this test to pass,
  // `editor.focus()` won't work when running this test on CI in Firefox
  Helpers.dom.moveCursorTo(editor, editor.element, 0);

  editor.insertText('abc');
  assert.ok(editor.post.hasContent, 'editor has content');
  assert.notHasClass(editorElement, EDITOR_HAS_NO_CONTENT_CLASS_NAME, `removes "${EDITOR_HAS_NO_CONTENT_CLASS_NAME}" when editor has content`);

  editor.deleteRange(editor.post.toRange());
  assert.hasClass(editorElement, EDITOR_HAS_NO_CONTENT_CLASS_NAME, `adds "${EDITOR_HAS_NO_CONTENT_CLASS_NAME}" after editor content is all deleted`);
});

test('editor fires lifecycle hooks', (assert) => {
  assert.expect(4);
  let didCallUpdatePost, didCallWillRender, didCallDidRender;
  editor = new Editor();
  editor.didUpdatePost(postEditor => {
    assert.ok(postEditor, 'Post editor provided');
    assert.ok(!didCallWillRender && !didCallDidRender,
              'didUpdatePost called before render hooks');
    didCallUpdatePost = true;
  });
  editor.willRender(() => {
    assert.ok(didCallUpdatePost && !didCallDidRender,
              'willRender called between didUpdatePost, didRender');
    didCallWillRender = true;
  });
  editor.didRender(() => {
    assert.ok(didCallUpdatePost && didCallWillRender,
              'didRender called last');
    didCallDidRender = true;
  });
  editor.render(editorElement);
});

test('editor fires lifecycle hooks for edit', (assert) => {
  assert.expect(4);
  const mobiledoc = Helpers.mobiledoc.build(({post, markupSection}) => {
    return post([markupSection()]);
  });
  editor = new Editor({mobiledoc});
  editor.render(editorElement);

  let didCallUpdatePost, didCallWillRender, didCallDidRender;
  editor.didUpdatePost(postEditor => {
    assert.ok(postEditor, 'Post editor provided');
    assert.ok(!didCallWillRender && !didCallDidRender,
              'didUpdatePost called before render hooks');
    didCallUpdatePost = true;
  });
  editor.willRender(() => {
    assert.ok(didCallUpdatePost && !didCallDidRender,
              'willRender called between didUpdatePost, didRender');
    didCallWillRender = true;
  });
  editor.didRender(() => {
    assert.ok(didCallUpdatePost && didCallWillRender,
              'didRender called last');
    didCallDidRender = true;
  });

  editor.run(postEditor => {
    postEditor.removeSection(editor.post.sections.head);
  });
});

test('editor fires lifecycle hooks for noop edit', (assert) => {
  assert.expect(1);
  editor = new Editor();
  editor.render(editorElement);

  editor.didUpdatePost(postEditor => {
    assert.ok(postEditor, 'Post editor provided');
  });
  editor.willRender(() => {
    assert.ok(false, 'willRender should not be called');
  });
  editor.didRender(() => {
    assert.ok(false, 'didRender should not be called');
  });

  editor.run(() => {});
});

test('editor parses and renders mobiledoc format', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('hello world')])]);
  });
  editorElement.innerHTML = '<p>something here</p>';
  editor = new Editor({mobiledoc});
  editor.render(editorElement);

  assert.ok(editor.mobiledoc, 'editor has mobiledoc');
  assert.equal(editorElement.innerHTML,
               `<p>hello world</p>`);

  assert.deepEqual(editor.serialize(), mobiledoc,
                   'serialized editor === mobiledoc');
});

test('#serialize serializes to MOBILEDOC_VERSION by default', (assert) => {
  let mobiledoc2 = Helpers.mobiledoc.build(({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abc')])]);
  }, '0.2.0');
  let mobiledoc3 = Helpers.mobiledoc.build(({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abc')])]);
  }, '0.3.0');
  let mobiledoc3_1 = Helpers.mobiledoc.build(({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abc')])]);
  }, '0.3.1');
  let mobiledoc3_2 = Helpers.mobiledoc.build(({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abc')])]);
  }, '0.3.2');

  editor = Helpers.mobiledoc.renderInto(editorElement, ({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abc')])]);
  });

  assert.deepEqual(editor.serialize('0.2.0'), mobiledoc2, 'serializes 0.2.0');
  assert.deepEqual(editor.serialize('0.3.0'), mobiledoc3, 'serializes 0.3.0');
  assert.deepEqual(editor.serialize('0.3.1'), mobiledoc3_1, 'serializes 0.3.1');
  assert.deepEqual(editor.serialize('0.3.2'), mobiledoc3_2, 'serializes 0.3.2');
  assert.deepEqual(editor.serialize(), mobiledoc3_2, 'serializes 0.3.2 by default');

  assert.throws(
    () => editor.serialize('unknown'),
    /Unknown version/
  );
});

test('editor parses and renders html', (assert) => {
  editorElement.innerHTML = '<p>something here</p>';
  editor = new Editor({html: '<p>hello world</p>'});
  editor.render(editorElement);

  assert.equal(editorElement.innerHTML,
               `<p>hello world</p>`);
});

test('editor parses and renders DOM', (assert) => {
  editorElement.innerHTML = '<p>something here</p>';
  editor = new Editor({html: $('<p>hello world</p>')[0]});
  editor.render(editorElement);

  assert.equal(editorElement.innerHTML,
               `<p>hello world</p>`);
});

test('#detectMarkupInRange not found', (assert) => {
  const mobiledoc = {
    version: MOBILEDOC_VERSION,
    sections: [
      [],
      [
        [1, normalizeTagName('p'), [
          [[], 0, 'hello world']
        ]]
      ]
    ]
  };
  editor = new Editor({mobiledoc});
  editor.render(editorElement);

  let section = editor.post.sections.head;
  let range = Range.create(section, 0, section, section.text.length);
  let markup = editor.detectMarkupInRange(range, 'strong');
  assert.ok(!markup, 'selection is not strong');
});

test('#detectMarkupInRange matching bounds of marker', (assert) => {
  const mobiledoc = {
    version: MOBILEDOC_VERSION,
    sections: [
      [
        ['strong']
      ],
      [
        [1, normalizeTagName('p'), [
          [[0], 1, 'hello world']
        ]]
      ]
    ]
  };
  editor = new Editor({mobiledoc});
  editor.render(editorElement);

  let section = editor.post.sections.head;
  let range = Range.create(section, 0, section, section.text.length);
  let markup = editor.detectMarkupInRange(range, 'strong');
  assert.ok(markup, 'selection has markup');
  assert.equal(markup.tagName, 'strong', 'detected markup is strong');
});

test('useful error message when given invalid mobiledoc', (assert) => {
  let badMobiledoc = {
    version: MOBILEDOC_VERSION,
    sections: [
      [],
      ["incorrect"]
    ]
  };
  assert.throws(() => {
    new Editor({mobiledoc: badMobiledoc});
  }, /unable to parse.*mobiledoc/i);
});

test('useful error message when given bad version of mobiledoc', (assert) => {
  let verybadMobiledoc = "not mobiledoc";
  assert.throws(() => {
    new Editor({mobiledoc: verybadMobiledoc});
  }, /Unknown version of mobiledoc parser requested/i);
});

test('activeSections of a rendered blank mobiledoc is an empty array', (assert) => {
  editor = Helpers.mobiledoc.renderInto(editorElement, ({post}) => {
    return post();
  });

  assert.ok(editor.hasRendered, 'editor has rendered');
  assert.equal(editor.activeSections.length, 0, 'empty activeSections');
});

test('activeSections is empty when the editor has no cursor', (assert) => {
  editor = Helpers.mobiledoc.renderInto(editorElement, ({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abc')])]);
  }, {autofocus: false});

  assert.ok(!editor.hasCursor(), 'precond - no cursor');
  assert.equal(editor.activeSections.length, 0, 'empty activeSections');
});

test('activeSectionAttributes of a rendered blank mobiledoc is an empty array', (assert) => {
  editor = Helpers.mobiledoc.renderInto(editorElement, ({post}) => {
    return post();
  });

  assert.ok(editor.hasRendered, 'editor has rendered');
  assert.deepEqual(editor.activeSectionAttributes, {}, 'empty activeSectionAttributes');
});

test('activeSectionAttributes is updated based on the selection', (assert) => {
  editor = Helpers.mobiledoc.renderInto(editorElement, ({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abc')], false, { 'data-md-text-align': 'center' })]);
  }, {autofocus: false});

  assert.ok(!editor.hasCursor(), 'precond - no cursor');
  assert.deepEqual(editor.activeSectionAttributes, {}, 'empty activeSectionAttributes');

  let head = editor.post.sections.head;
  editor.selectRange(Range.create(head, 'abc'.length));
  assert.deepEqual(editor.activeSectionAttributes['text-align'], ['center'], 'active section attributes captured');
});

test('editor.cursor.hasCursor() is false before rendering', (assert) => {
  let mobiledoc = Helpers.mobiledoc.build(({post}) => post());
  editor = new Editor({mobiledoc});

  assert.ok(!editor.cursor.hasCursor(), 'no cursor before rendering');

  Helpers.dom.moveCursorTo(editor, editorElement, 0);

  assert.ok(!editor.cursor.hasCursor(),
            'no cursor before rendering, even when selection exists');
});

test('#destroy clears selection if it has one', (assert) => {
  let mobiledoc = Helpers.mobiledoc.build(({post}) => post());
  editor = new Editor({mobiledoc});
  editor.render(editorElement);

  Helpers.dom.moveCursorTo(editor, editorElement, 0);
  assert.ok(editor.cursor.hasCursor(), 'precond - has cursor');

  editor.destroy();

  assert.equal(window.getSelection().rangeCount, 0, 'selection is cleared');
});

test('#destroy does not clear selection if it is outside the editor element', (assert) => {
  let mobiledoc = Helpers.mobiledoc.build(({post}) => post());
  editor = new Editor({mobiledoc});
  editor.render(editorElement);

  Helpers.dom.moveCursorTo(editor, $('#qunit-fixture')[0], 0);
  assert.ok(!editor.cursor.hasCursor(), 'precond - has no cursor');
  assert.equal(window.getSelection().rangeCount, 1, 'precond - has selection');

  editor.destroy();

  assert.equal(window.getSelection().rangeCount, 1, 'selection is not cleared');
});

test('editor parses HTML post using parser plugins', (assert) => {
  let seenTagNames = [];
  let parserPlugin = function(element) {
    seenTagNames.push(element.tagName);
  };
  let html = '<p><textarea></textarea><img></p>';
  editor = new Editor({html, parserPlugins: [parserPlugin]});
  assert.ok(!!editor.post, 'editor loads post');

  assert.deepEqual(seenTagNames, ['P', 'TEXTAREA', 'IMG']);
});

test('#activeMarkups returns the markups at cursor when range is collapsed', (assert) => {
  editor = Helpers.mobiledoc.renderInto(editorElement, ({post, markupSection, marker, markup}) => {
    return post([markupSection('p', [
      marker('abc'),
      marker('def', [markup('b')]),
      marker('ghi')
    ])]);
  });

  let head = editor.post.sections.head;
  editor.selectRange(Range.create(head, 'abc'.length));
  assert.equal(editor.activeMarkups.length, 0, 'no active markups at left of bold text');

  editor.selectRange(Range.create(head, 'abcd'.length));
  assert.equal(editor.activeMarkups.length, 1, 'active markups in bold text');
  assert.ok(editor.hasActiveMarkup('b'), 'has bold active markup');

  editor.selectRange(Range.create(head, 'abcdef'.length));
  assert.equal(editor.activeMarkups.length, 1, 'active markups at end of bold text');
  assert.ok(editor.hasActiveMarkup('b'), 'has bold active markup');

  editor.selectRange(Range.create(head, 'abcdefg'.length));
  assert.equal(editor.activeMarkups.length, 0, 'no active markups after end of bold text');
});

test('#hasActiveMarkup returns true for complex markups', (assert) => {
  editor = Helpers.mobiledoc.renderInto(editorElement, ({post, markupSection, marker, markup}) => {
    return post([markupSection('p', [
      marker('abc '),
      marker('def', [markup('a', {href: 'http://bustle.com'})]),
      marker(' ghi')
    ])]);
  });

  let head = editor.post.sections.head;
  editor.selectRange(Range.create(head, 'abc '.length));
  assert.equal(editor.activeMarkups.length, 0, 'no active markups at left of linked text');

  editor.selectRange(Range.create(head, 'abc d'.length));
  assert.equal(editor.activeMarkups.length, 1, 'active markups in linked text');
  assert.ok(editor.hasActiveMarkup('a'), 'has A active markup');

  editor.selectRange(Range.create(head, 'abc def'.length));
  assert.equal(editor.activeMarkups.length, 0, 'active markups at end of linked text');

  editor.selectRange(Range.create(head, 'abc def '.length));
  assert.equal(editor.activeMarkups.length, 0, 'no active markups after end of linked text');
});

test('#insertText inserts text at cursor position, replacing existing range if non-collapsed', (assert) => {
  editor = Helpers.mobiledoc.renderInto(editorElement, ({post, markupSection, marker}) => {
    return post([markupSection('p', [ marker('b') ])]);
  });

  editor.selectRange(new Range(editor.post.tailPosition()));
  editor.insertText('Z');
  assert.equal(editor.post.sections.head.text, 'bZ');

  editor.selectRange(new Range(editor.post.headPosition()));
  editor.insertText('A');
  assert.equal(editor.post.sections.head.text, 'AbZ');

  editor.selectRange(Range.create(editor.post.sections.head, 'A'.length));
  editor.insertText('B');
  assert.equal(editor.post.sections.head.text, 'ABbZ');

  editor.selectRange(new Range(editor.post.headPosition(), editor.post.tailPosition()));
  editor.insertText('new stuff');
  assert.equal(editor.post.sections.head.text, 'new stuff');
});

test('#insertText inserts text at cursor position, inheriting active markups', (assert) => {
  editor = Helpers.mobiledoc.renderInto(editorElement, ({post, markupSection, marker, markup}) => {
    return post([markupSection('p', [
      marker('a'),
      marker('b', [markup('b')])
    ])]);
  });

  editor.selectRange(new Range(editor.post.tailPosition()));
  assert.equal(editor.activeMarkups.length, 1, 'precond - 1 active markup');
  editor.insertText('Z');
  assert.hasElement('#editor b:contains(bZ)');

  editor.selectRange(new Range(editor.post.headPosition()));
  assert.equal(editor.activeMarkups.length, 0, 'precond - 0 active markups at start');
  editor.toggleMarkup('b');
  editor.insertText('A');

  assert.hasElement('#editor b:contains(A)');
});

test('#insertText is no-op when editor does not have cursor', (assert) => {
  let expected;
  editor = Helpers.mobiledoc.renderInto(editorElement, ({post, markupSection, marker}) => {
    expected = post([markupSection('p', [marker('abc')])]);
    return post([markupSection('p', [marker('abc')])]);
  }, {autofocus: false});

  assert.ok(!editor.hasCursor(), 'precond - editor has no cursor');
  editor.insertText('blah blah blah');

  assert.postIsSimilar(editor.post, expected, 'post is not changed');
});

test('#insertText when post is blank', (assert) => {
  let expected;
  editor = Helpers.mobiledoc.renderInto(editorElement, ({post, markupSection, marker}) => {
    expected = post([markupSection('p', [marker('blah blah')])]);
    return post();
  });

  // Necessary to ensure tests pass on FF when the window is not active
  Helpers.dom.selectRange(editorElement, 0, editorElement, 0);

  assert.ok(editor.hasCursor(), 'precond - editor has cursor');
  assert.ok(editor.post.isBlank, 'precond - editor has blank post');
  editor.insertText('blah blah');

  assert.postIsSimilar(editor.post, expected, 'text is added to post');
});

test('#insertAtom inserts atom at cursor position, replacing range if non-collapsed', (assert) => {
  let atom = {
    name: 'the-atom',
    type: 'dom',
    render() {
    }
  };

  editor = Helpers.mobiledoc.renderInto(editorElement, ({post, markupSection, marker}) => {
    return post([markupSection('p', [ marker('b') ])]);
  }, {atoms: [atom]});

  editor.selectRange(new Range(editor.post.tailPosition()));
  editor.insertAtom('the-atom', 'END');

  assert.equal(editor.post.sections.head.text, 'bEND');

  editor.selectRange(new Range(editor.post.headPosition()));
  editor.insertAtom('the-atom', 'START');
  assert.equal(editor.post.sections.head.text, 'STARTbEND');

  editor.selectRange(new Range(editor.post.headPosition(), editor.post.tailPosition()));
  editor.insertAtom('the-atom', 'REPLACE-ALL');
  assert.equal(editor.post.sections.head.text, 'REPLACE-ALL');
});

test('#insertAtom is no-op when editor does not have cursor', (assert) => {
  let atom = {
    name: 'the-atom',
    type: 'dom',
    render() {
    }
  };

  let expected;
  editor = Helpers.mobiledoc.renderInto(editorElement, ({post, markupSection, marker}) => {
    expected = post([markupSection('p', [marker('abc')])]);
    return post([markupSection('p', [marker('abc')])]);
  }, {atoms: [atom], autofocus: false});

  assert.ok(!editor.hasCursor(), 'precond - editor has no cursor');
  editor.insertAtom('the-atom');

  assert.postIsSimilar(editor.post, expected, 'post is not changed');
});

test('#insertAtom when post is blank', (assert) => {
  let atom = {
    name: 'the-atom',
    type: 'dom',
    render() {
    }
  };

  let expected;
  editor = Helpers.mobiledoc.renderInto(editorElement, ({post, atom, markupSection}) => {
    expected = post([markupSection('p', [atom('the-atom', 'THEATOMTEXT')])]);
    return post();
  }, {atoms: [atom]});

  Helpers.dom.selectRange(editorElement, 0, editorElement, 0);

  assert.ok(editor.hasCursor(), 'precond - editor has cursor');
  assert.ok(editor.post.isBlank, 'precond - post is blank');
  editor.insertAtom('the-atom', 'THEATOMTEXT');

  assert.postIsSimilar(editor.post, expected);
});

test('#insertAtom returns the inserted atom', (assert) => {
  let atom = {
    name: 'the-atom',
    type: 'dom',
    render() {
    }
  };

  editor = Helpers.mobiledoc.renderInto(editorElement, ({post}) => {
    return post();
  }, {atoms: [atom]});

  // Force the selection -- this is necessary for tests in Firefox at
  // SauceLabs.
  Helpers.dom.selectRange(editorElement, 0, editorElement, 0);

  assert.ok(editor.hasCursor(), 'precond - editor has cursor');

  const insertedAtom = editor.insertAtom('the-atom', 'THEATOMTEXT');

  assert.equal(insertedAtom.value, 'THEATOMTEXT', 'return value is the inserted atom');
});

test('#insertCard inserts card at section after cursor position, replacing range if non-collapsed', (assert) => {
  let card = {
    name: 'the-card',
    type: 'dom',
    render() {
    }
  };

  editor = Helpers.mobiledoc.renderInto(editorElement, ({post, markupSection, marker}) => {
    return post([markupSection('p', [ marker('b') ])]);
  }, {cards: [card]});

  editor.selectRange(new Range(editor.post.tailPosition()));
  editor.insertCard('the-card');

  assert.equal(editor.post.sections.length, 2, 'adds a section at end');
  assert.ok(editor.post.sections.tail.isCardSection, 'added section is card section');

  editor.run(postEditor => {
    let blankSection = postEditor.builder.createMarkupSection();

    let firstSection = editor.post.sections.head;
    let collection = editor.post.sections;
    postEditor.insertSectionBefore(collection, blankSection, firstSection);
  });

  assert.equal(editor.post.sections.length, 3, 'precond - adds blank section at start');
  assert.ok(!editor.post.sections.head.isCardSection, 'precond - initial section is not card section');

  editor.selectRange(new Range(editor.post.headPosition()));
  editor.insertCard('the-card');

  assert.equal(editor.post.sections.length, 3, 'replaced initial blank section with card');
  assert.ok(editor.post.sections.head.isCardSection, 'initial section is card section');

  editor.selectRange(new Range(editor.post.headPosition(), editor.post.tailPosition()));
  editor.insertCard('the-card');
  assert.equal(editor.post.sections.length, 1, 'replaces range with card section');
  assert.ok(editor.post.sections.head.isCardSection, 'initial section is card section');
});

test('#insertCard when cursor is in list item', (assert) => {
  let card = {
    name: 'the-card',
    type: 'dom',
    render() {
    }
  };

  editor = Helpers.mobiledoc.renderInto(editorElement, ({post, markupSection, marker, listItem, listSection}) => {
    return post([listSection('ul', [
      listItem([marker('abc')]),
      listItem([marker('def')])
    ])]);
  }, {cards: [card]});

  editor.selectRange(Range.create(editor.post.sections.head.items.head, 'ab'.length));
  editor.insertCard('the-card');

  assert.equal(editor.post.sections.length, 2, 'adds a second section');
  assert.ok(editor.post.sections.tail.isCardSection, 'tail section is card section');
});

test('#insertCard is no-op when editor does not have cursor', (assert) => {
  let card = {
    name: 'the-card',
    type: 'dom',
    render() {
    }
  };

  let expected;
  editor = Helpers.mobiledoc.renderInto(editorElement, ({post, markupSection, marker}) => {
    expected = post([markupSection('p', [marker('abc')])]);
    return post([markupSection('p', [marker('abc')])]);
  }, {cards: [card], autofocus: false});

  assert.ok(!editor.hasCursor(), 'precond - editor has no cursor');
  editor.insertCard('the-card');

  assert.postIsSimilar(editor.post, expected, 'post is not changed');
});

test('#insertCard when post is blank', (assert) => {
  let card = {
    name: 'the-card',
    type: 'dom',
    render() {
    }
  };

  let expected;
  editor = Helpers.mobiledoc.renderInto(editorElement, ({post, cardSection}) => {
    expected = post([cardSection('the-card')]);
    return post();
  }, {cards: [card]});

  Helpers.dom.selectRange(editorElement, 0, editorElement, 0);

  assert.ok(editor.hasCursor(), 'precond - editor has cursor');
  assert.ok(editor.post.isBlank, 'precond - post is blank');

  editor.insertCard('the-card');

  assert.postIsSimilar(editor.post, expected, 'adds card section');
});

test('#insertCard returns card object', (assert) => {
  let card = {
    name: 'the-card',
    type: 'dom',
    render() {
    }
  };

  editor = Helpers.mobiledoc.renderInto(editorElement, ({post}) => {
    return post();
  }, {cards: [card]});

  Helpers.dom.selectRange(editorElement, 0, editorElement, 0);

  assert.ok(editor.hasCursor(), 'precond - editor has cursor');
  assert.ok(editor.post.isBlank, 'precond - post is blank');

  const insertedCard = editor.insertCard('the-card');

  assert.ok(!!insertedCard, 'insertedCard is present');
  assert.equal(editor.post.sections.tail, insertedCard, 'returned card is the inserted card');
});

test('#insertCard focuses the cursor at the end of the card', (assert) => {
  let card = {
    name: 'the-card',
    type: 'dom',
    render() {
    }
  };

  editor = Helpers.mobiledoc.renderInto(editorElement, ({post}) => {
    return post();
  }, {cards: [card]});

  Helpers.dom.selectRange(editorElement, 0, editorElement, 0);

  let insertedCard = editor.insertCard('the-card');

  let range = editor.range;
  assert.positionIsEqual(range.head, insertedCard.tailPosition(), 'range head on card tail');
  assert.positionIsEqual(range.tail, insertedCard.tailPosition(), 'range tail on card tail');
  assert.ok(document.activeElement === editorElement, 'editor element retains focus');
});

test('#toggleMarkup removes A tag when no attributes given', function(assert) {
  editor = Helpers.mobiledoc.renderInto(editorElement,
    ({post, markupSection, marker, markup}) => {
    return post([markupSection('p', [
      marker('^'), marker('link', [markup('a', {href: 'google.com'})]), marker('$')
    ])]);
  });
  Helpers.dom.selectText(editor, 'link');
  editor.toggleMarkup('a');

  assert.selectedText('link', 'text "link" still selected');
  assert.ok(editor.hasCursor(), 'editor has cursor');
  assert.hasElement('#editor p:contains(^link$)');
  assert.hasNoElement('#editor a', 'a tag is removed');
});

test('#toggleMarkup adds A tag with attributes', function(assert) {
  editor = Helpers.mobiledoc.renderInto(editorElement,
    ({post, markupSection, marker, markup}) => {
    return post([markupSection('p', [marker('^link$')])]);
  });
  Helpers.dom.selectText(editor, 'link');
  editor.toggleMarkup('a', {href: 'google.com'});

  assert.selectedText('link', 'text "link" still selected');
  assert.ok(editor.hasCursor(), 'editor has cursor');
  assert.hasElement('#editor a:contains(link)');
  assert.hasElement('#editor a[href="google.com"]:contains(link)');
});

test('#toggleMarkup calls #beforeToggleMarkup hooks', function(assert) {
  assert.expect(5*3 + 2);

  let callbackCount = 0;
  editor = Helpers.mobiledoc.renderInto(editorElement,
    ({post, markupSection, marker, markup}) => {
    return post([markupSection('p', [marker('^link$')])]);
  });
  Helpers.dom.selectText(editor, 'link');
  let callback = ({markup, range, willAdd}) => {
    assert.ok(true, 'calls #beforeToggleMarkup');
    assert.equal(markup.tagName, 'a', 'passes markup');
    assert.equal(markup.getAttribute('href'), 'google.com',
      'passes markup with attrs');
    assert.ok(!!range, 'passes a range');
    assert.ok(willAdd, 'correct value for willAdd');
    callbackCount++;
  };

  // 3 times
  editor.beforeToggleMarkup(callback);
  editor.beforeToggleMarkup(callback);
  editor.beforeToggleMarkup(callback);

  editor.toggleMarkup('a', {href: 'google.com'});
  assert.equal(callbackCount, 3, 'calls once for each callback');
  assert.hasElement('#editor a[href="google.com"]:contains(link)',
    'adds link');
});

test('#toggleMarkup is canceled if #beforeToggleMarkup hook returns false', function(assert) {
  assert.expect(2);
  editor = Helpers.mobiledoc.renderInto(editorElement,
    ({post, markupSection, marker, markup}) => {
    return post([markupSection('p', [marker('^link$')])]);
  });
  Helpers.dom.selectText(editor, 'link');
  let callback = ({markup, range, willAdd}) => {
    assert.ok(true, 'calls #beforeToggleMarkup');
    return false;
  };

  editor.beforeToggleMarkup(callback);

  editor.toggleMarkup('a', {href: 'google.com'});
  assert.hasNoElement('#editor a', 'not adds link');
});
