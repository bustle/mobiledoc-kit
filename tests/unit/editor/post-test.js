import PostEditor from 'mobiledoc-kit/editor/post';
import { Editor } from 'mobiledoc-kit';
import Helpers from '../../test-helpers';
import PostNodeBuilder from 'mobiledoc-kit/models/post-node-builder';
import Range from 'mobiledoc-kit/utils/cursor/range';

const { module, test } = Helpers;

let editor, editorElement;

let builder, postEditor, mockEditor;

let { postEditor: { MockEditor, renderBuiltAbstract } } = Helpers;

function buildEditorWithMobiledoc(builderFn, autofocus=true) {
  let mobiledoc = Helpers.mobiledoc.build(builderFn);
  let unknownCardHandler = () => {};
  let unknownAtomHandler = () => {};
  editor = new Editor({mobiledoc, unknownCardHandler, unknownAtomHandler, autofocus});
  editor.render(editorElement);
  let selectRange = editor.selectRange;
  editor.selectRange = function(range) {
    selectRange.call(editor, range);
    // Store the rendered range so the test can make assertions with it
    editor._renderedRange = range;
  };
  return editor;
}

module('Unit: PostEditor', {
  beforeEach() {
    editorElement = $('#editor')[0];
    builder = new PostNodeBuilder();
    mockEditor = new MockEditor(builder);
    postEditor = new PostEditor(mockEditor);
  },

  afterEach() {
    if (editor) {
      editor.destroy();
      editor = null;
    }
  }
});

test('#splitMarkers when headMarker = tailMarker', (assert) => {
  let post, section;
  Helpers.postAbstract.build(({marker, markupSection, post: buildPost}) => {
    section = markupSection('p', [
      marker('abcd')
    ]);
    post = buildPost([ section ]);
  });

  mockEditor = renderBuiltAbstract(post, mockEditor);

  const postEditor = new PostEditor(mockEditor);
  const range = Range.create(section, 1, section, 3);
  const markers = postEditor.splitMarkers(range);
  postEditor.complete();

  assert.equal(markers.length, 1, 'markers');
  assert.equal(markers[0].value, 'bc', 'marker 0');
});

test('#splitMarkers when head section = tail section, but different markers', (assert) => {
  const post = Helpers.postAbstract.build(({marker, markupSection, post}) =>
    post([
      markupSection('p', [marker('abc'), marker('def')])
    ])
  );

  mockEditor = renderBuiltAbstract(post, mockEditor);

  const section = post.sections.head;
  const range = Range.create(section, 2, section, 5);
  const postEditor = new PostEditor(mockEditor);
  const markers = postEditor.splitMarkers(range);
  postEditor.complete();

  assert.equal(markers.length, 2, 'markers');
  assert.equal(markers[0].value, 'c', 'marker 0');
  assert.equal(markers[1].value, 'de', 'marker 1');
});

// see https://github.com/bustle/mobiledoc-kit/issues/121
test('#splitMarkers when single-character marker at start', (assert) => {
  let post, section;
  Helpers.postAbstract.build(({marker, markupSection, post: buildPost}) => {
    section = markupSection('p', [
      marker('a'),
      marker('b'),
      marker('c')
    ]);
    post = buildPost([ section ]);
  });

  renderBuiltAbstract(post, mockEditor);

  const range = Range.create(section, 1, section, 3);
  const markers = postEditor.splitMarkers(range);
  postEditor.complete();

  assert.equal(markers.length, 2, 'markers');
  assert.equal(markers[0].value, 'b', 'marker 0');
  assert.equal(markers[1].value, 'c', 'marker 1');
});

test('#replaceSection one markup section with another', (assert) => {
  let _section1, _section2;
  const post = Helpers.postAbstract.build(({post, markupSection, marker}) => {
    _section1 = markupSection('p', [marker('abc')]);
    _section2 = markupSection('p', [marker('123')]);
    return post([_section1]);
  });
  renderBuiltAbstract(post, mockEditor);

  assert.equal(post.sections.head.text, 'abc', 'precond - section text');
  assert.equal(post.sections.length, 1, 'precond - only 1 section');
  postEditor.replaceSection(_section1, _section2);
  postEditor.complete();

  assert.equal(post.sections.head.text, '123', 'section replaced');
  assert.equal(post.sections.length, 1, 'only 1 section');
});

test('#replaceSection markup section with list section', (assert) => {
  let _section1, _section2;
  const post = Helpers.postAbstract.build(
    ({post, markupSection, listSection, listItem, marker}) => {
    _section1 = markupSection('p', [marker('abc')]);
    _section2 = listSection('ul', [listItem([marker('123')])]);
    return post([_section1]);
  });
  renderBuiltAbstract(post, mockEditor);

  assert.equal(post.sections.head.text, 'abc', 'precond - section text');
  assert.equal(post.sections.length, 1, 'precond - only 1 section');
  postEditor.replaceSection(_section1, _section2);
  postEditor.complete();

  assert.equal(post.sections.head.items.head.text, '123', 'section replaced');
  assert.equal(post.sections.length, 1, 'only 1 section');
});

test('#replaceSection solo list item with markup section removes list section', (assert) => {
  let _section1, _section2;
  const post = Helpers.postAbstract.build(
    ({post, markupSection, listSection, listItem, marker}) => {
    _section1 = listItem([marker('abc')]);
    _section2 = markupSection('p', [marker('123')]);
    return post([listSection('ul', [_section1])]);
  });
  renderBuiltAbstract(post, mockEditor);

  assert.equal(post.sections.head.items.head.text, 'abc', 'precond - list item text');
  assert.equal(post.sections.length, 1, 'precond - only 1 section');
  postEditor.replaceSection(_section1, _section2);
  postEditor.complete();

  assert.equal(post.sections.head.text, '123', 'section replaced');
  assert.equal(post.sections.length, 1, 'only 1 section');
});

/*
 * FIXME, this test should be made to pass, but it is not a situation that we
 * run into in the actual life of the editor right now.

test('#replaceSection middle list item with markup section cuts list into two', (assert) => {
  let _section1, _section2;
  const post = Helpers.postAbstract.build(
    ({post, markupSection, listSection, listItem, marker}) => {
    _section1 = listItem([marker('li 2')]);
    _section2 = markupSection('p', [marker('123')]);
    return post([listSection('ul', [
      listItem([marker('li 1')]),
      _section1,
      listItem([marker('li 3')])
    ])]);
  });
  renderBuiltAbstract(post, mockEditor);

  assert.equal(post.sections.head.items.length, 3, 'precond - 3 lis');
  assert.equal(post.sections.head.items.objectAt(1).text, 'li 2', 'precond - list item text');
  assert.equal(post.sections.length, 1, 'precond - only 1 section');
  postEditor.replaceSection(_section1, _section2);
  postEditor.complete();

  assert.equal(post.sections.length, 3, '3 sections');
  assert.equal(post.sections.head.items.length, 1, '1 li in 1st ul');
  assert.equal(post.sections.objectAt(1).text, '123', 'new section text is there');
  assert.equal(post.sections.tail.items.length, 1, '1 li in last ul');
});

*/

test('#replaceSection last list item with markup section when multiple list items appends after list section', (assert) => {
  let _section1, _section2;
  const post = Helpers.postAbstract.build(
    ({post, markupSection, listSection, listItem, marker}) => {
    _section1 = listItem([marker('abc')]);
    _section2 = markupSection('p', [marker('123')]);
    return post([listSection('ul', [
      listItem([marker('before li')]),
      _section1
    ])]);
  });
  renderBuiltAbstract(post, mockEditor);

  assert.equal(post.sections.head.items.length, 2, 'precond - 2 lis');
  assert.equal(post.sections.head.items.tail.text, 'abc', 'precond - list item text');
  assert.equal(post.sections.length, 1, 'precond - only 1 section');
  postEditor.replaceSection(_section1, _section2);
  postEditor.complete();

  assert.equal(post.sections.head.items.length, 1, 'only 1 li');
  assert.equal(post.sections.head.items.head.text, 'before li', 'first li remains');
  assert.equal(post.sections.length, 2, '2 sections');
  assert.equal(post.sections.tail.text, '123', 'new section text is there');
});

test('#replaceSection when section is null appends new section', (assert) => {
  let newEmptySection;
  const post = Helpers.postAbstract.build(
    ({post, markupSection}) => {
    newEmptySection = markupSection('p');
    return post();
  });
  renderBuiltAbstract(post, mockEditor);

  assert.equal(post.sections.length, 0, 'precond - no sections');
  postEditor.replaceSection(null, newEmptySection);
  postEditor.complete();

  assert.equal(post.sections.length, 1, 'has 1 section');
  assert.equal(post.sections.head.text, '', 'no text in new section');
});

test('#insertSectionAtEnd inserts the section at the end of the mobiledoc', (assert) => {
  let newSection;
  const post = Helpers.postAbstract.build(({post, markupSection, marker}) => {
    newSection = markupSection('p', [marker('123')]);
    return post([markupSection('p', [marker('abc')])]);
  });
  renderBuiltAbstract(post, mockEditor);

  postEditor.insertSectionAtEnd(newSection);
  postEditor.complete();

  assert.equal(post.sections.length, 2, 'new section added');
  assert.equal(post.sections.tail.text, '123', 'new section added at end');
});

test('markers with identical non-attribute markups get coalesced after applying or removing markup', (assert) => {
  let strong, section;
  const post = Helpers.postAbstract.build(({post, markupSection, marker, markup}) => {
    strong = markup('strong');
    section = markupSection('p', [marker('a'), marker('b',[strong]), marker('c')]);
    return post([section]);
  });
  renderBuiltAbstract(post, mockEditor);

  // removing the strong from the "b"
  let range = Range.create(section, 1, section, 2);
  postEditor = new PostEditor(mockEditor);
  postEditor.removeMarkupFromRange(range, strong);
  postEditor.complete();

  assert.equal(section.markers.length, 1, 'similar markers are coalesced');
  assert.equal(section.markers.head.value, 'abc', 'marker value is correct');
  assert.ok(!section.markers.head.hasMarkup(strong), 'marker has no bold');

  // adding strong to each of the characters individually
  postEditor = new PostEditor(mockEditor);
  for (let i=0; i < section.length; i++) {
    range = Range.create(section, i, section, i+1);
    postEditor.addMarkupToRange(range, strong);
  }
  postEditor.complete();

  assert.equal(section.markers.length, 1, 'bold markers coalesced');
  assert.equal(section.markers.head.value, 'abc', 'bold marker value is correct');
  assert.ok(section.markers.head.hasMarkup(strong), 'bold marker has bold');
});

test('markers do not get coalesced with atoms', (assert) => {
  let strong, section;
  let post = Helpers.postAbstract.build(({post, markupSection, marker, atom, markup}) => {
    strong = markup('strong');
    section = markupSection('p', [atom('the-atom', 'A'), marker('b',[strong])]);
    return post([section]);
  });
  renderBuiltAbstract(post, mockEditor);

  // removing the strong from the "b"
  let range = Range.create(section, 0, section, 2);
  postEditor = new PostEditor(mockEditor);
  postEditor.removeMarkupFromRange(range, strong);
  postEditor.complete();

  assert.equal(section.markers.length, 2, 'still 2 markers');
  assert.equal(section.markers.head.value, 'A', 'head marker value is correct');
  assert.ok(section.markers.head.isAtom, 'head marker is atom');
  assert.equal(section.markers.tail.value, 'b', 'tail marker value is correct');
  assert.ok(section.markers.tail.isMarker, 'tail marker is marker');

  assert.ok(!section.markers.head.hasMarkup(strong), 'head marker has no bold');
  assert.ok(!section.markers.tail.hasMarkup(strong), 'tail marker has no bold');
});

test('neighboring atoms do not get coalesced', (assert) => {
  let strong, section;
  let post = Helpers.postAbstract.build(({post, markupSection, marker, atom, markup}) => {
    strong = markup('strong');
    section = markupSection('p', [
      atom('the-atom', 'A', {}, [strong]),
      atom('the-atom', 'A', {}, [strong])
    ]);
    return post([section]);
  });
  renderBuiltAbstract(post, mockEditor);

  let range = Range.create(section, 0, section, 2);
  postEditor = new PostEditor(mockEditor);
  postEditor.removeMarkupFromRange(range, strong);
  postEditor.complete();

  assert.equal(section.markers.length, 2, 'atoms not coalesced');
  assert.ok(!section.markers.head.hasMarkup(strong));
  assert.ok(!section.markers.tail.hasMarkup(strong));
});

test('#removeMarkupFromRange is no-op with collapsed range', (assert) => {
  let section, markup;
  const post = Helpers.postAbstract.build(({
    post, markupSection, marker, markup: buildMarkup
  }) => {
    markup = buildMarkup('strong');
    section = markupSection('p', [
      marker('abc')
    ]);
    return post([section]);
  });
  renderBuiltAbstract(post, mockEditor);

  let range = Range.create(section, 1, section, 1);
  postEditor.removeMarkupFromRange(range, markup);
  postEditor.complete();

  assert.equal(section.markers.length, 1, 'similar markers are coalesced');
  assert.equal(section.markers.head.value, 'abc', 'marker value is correct');
  assert.ok(!section.markers.head.hasMarkup(markup), 'marker has no markup');
});

test('#removeMarkupFromRange splits markers when necessary', (assert) => {
  let bold, section;
  let post = Helpers.postAbstract.build(
    ({post, marker, markup, markupSection}) => {
    bold = markup('b');
    section = markupSection('p', [
      marker('abc', [bold]),
      marker('def')
    ]);
    return post([section]);
  });

  renderBuiltAbstract(post, mockEditor);

  let range = Range.create(section, 'a'.length,
                           section, 'abcd'.length);

  postEditor.removeMarkupFromRange(range, bold);
  postEditor.complete();

  assert.equal(section.text, 'abcdef', 'text still correct');
  assert.equal(section.markers.length, 2, '2 markers');

  let [head, tail] = section.markers.toArray();
  assert.equal(head.value, 'a', 'head marker value');
  assert.ok(head.hasMarkup(bold), 'head has bold');
  assert.equal(tail.value, 'bcdef', 'tail marker value');
  assert.ok(!tail.hasMarkup(bold), 'tail has no bold');
});

test('#removeMarkupFromRange handles atoms correctly', (assert) => {
  let bold, section;
  let post = Helpers.postAbstract.build(
    ({post, marker, markup, atom, markupSection}) => {
    bold = markup('b');
    section = markupSection('p', [
      atom('the-atom', 'n/a', {}, [bold]),
      marker('X')
    ]);
    return post([section]);
  });

  renderBuiltAbstract(post, mockEditor);

  let range = Range.create(section, 0, section, 2);

  postEditor.removeMarkupFromRange(range, bold);
  postEditor.complete();

  assert.equal(section.markers.length, 2, '2 markers');

  let [head, tail] = section.markers.toArray();
  assert.ok(head.isAtom, 'head is atom');
  assert.ok(!head.hasMarkup(bold), 'head has no bold');

  assert.equal(tail.value, 'X', 'tail marker value');
  assert.ok(!tail.hasMarkup(bold), 'tail has no bold');
});

test('#addMarkupToRange is no-op with collapsed range', (assert) => {
  let section, markup;
  const post = Helpers.postAbstract.build(({
    post, markupSection, marker, markup: buildMarkup
  }) => {
    markup = buildMarkup('strong');
    section = markupSection('p', [
      marker('abc')
    ]);
    return post([section]);
  });
  renderBuiltAbstract(post, mockEditor);

  let range = Range.create(section, 1, section, 1);
  postEditor.addMarkupToRange(range, markup);
  postEditor.complete();

  assert.equal(section.markers.length, 1, 'similar markers are coalesced');
  assert.equal(section.markers.head.value, 'abc', 'marker value is correct');
  assert.ok(!section.markers.head.hasMarkup(markup), 'marker has no markup');
});

test("#addMarkupToRange around a markup pushes the new markup below existing ones", (assert) => {
  let em;
  const editor = buildEditorWithMobiledoc(({post, markupSection, marker, markup}) => {
    em = markup('em');
    return post([
        markupSection('p', [
          marker('one '),
          marker('BOLD', [markup('b')]),
          marker(' two')
      ])
    ]);
  });

  let section = editor.post.sections.head;

  let range = Range.create(section, 0, section, 'one BOLD two'.length);
  editor.run(function(postEditor) {
    postEditor.addMarkupToRange(range, em);
  });

  let markers = section.markers.toArray();
  assert.equal(markers[0].closedMarkups.length, 0,
      'Existing markup is not closed');

  assert.equal(editor.element.innerHTML,
      '<p><em>one <b>BOLD</b> two</em></p>');
});


test("#addMarkupToRange within a markup puts the new markup on top of the stack", (assert) => {
  let b;
  const editor = buildEditorWithMobiledoc(({post, markupSection, marker, markup}) => {
    b = markup('b');
    return post([
        markupSection('p', [
          marker('one BOLD two', [markup('em')]),
      ])
    ]);
  });

  let section = editor.post.sections.head;

  let range = Range.create(section, 'one '.length, section, 'one BOLD'.length);
  editor.run(function(postEditor) {
    postEditor.addMarkupToRange(range, b);
  });

  let markers = section.markers.toArray();
  assert.equal(markers[0].closedMarkups.length, 0,
      'Existing markup is not closed');

  assert.equal(editor.element.innerHTML,
      '<p><em>one <b>BOLD</b> two</em></p>');
});

test("#addMarkupToRange straddling the open tag of an existing markup, closes and reopens the existing markup", (assert) => {
  let em;
  const editor = buildEditorWithMobiledoc(({post, markupSection, marker, markup}) => {
    em = markup('em');
    return post([
        markupSection('p', [
          marker('_one '),
          marker('TWO_ THREE', [markup('b')])
      ])
    ]);
  });

  let section = editor.post.sections.head;
  let range = Range.create(section, 0, section, '_one TWO_'.length);

  editor.run(function(postEditor) {
    postEditor.addMarkupToRange(range, em);
  });

  assert.equal(editor.element.innerHTML,
      '<p><em>_one <b>TWO_</b></em><b> THREE</b></p>');
});

test("#addMarkupToRange straddling the closing tag of an existing markup, closes and reopens the existing markup", (assert) => {
  let em;
  const editor = buildEditorWithMobiledoc(({post, markupSection, marker, markup}) => {
    em = markup('em');
    return post([
        markupSection('p', [
          marker('ONE _TWO', [markup('b')]),
          marker(' three_')
      ])
    ]);
  });

  let section = editor.post.sections.head;
  let range = Range.create(section, 'ONE '.length, section, 'ONE _TWO three_'.length);

  editor.run(function(postEditor) {
    postEditor.addMarkupToRange(range, em);
  });

  assert.equal(editor.element.innerHTML,
      '<p><b>ONE </b><em><b>_TWO</b> three_</em></p>');
});

test('markers with identical markups get coalesced after deletion', (assert) => {
  let strong, section;
  const post = Helpers.postAbstract.build(({post, markupSection, marker, markup}) => {
    strong = markup('strong');
    section = markupSection('p', [marker('a'), marker('b',[strong]), marker('c')]);
    return post([section]);
  });
  mockEditor = renderBuiltAbstract(post, mockEditor);

  let range = Range.create(section, 1, section, 2);
  postEditor = new PostEditor(mockEditor);
  postEditor.deleteRange(range);
  postEditor.complete();

  assert.equal(section.markers.length, 1, 'similar markers are coalesced');
  assert.equal(section.markers.head.value, 'ac', 'marker value is correct');
});

test('#moveSectionBefore moves the section as expected', (assert) => {
  const post = Helpers.postAbstract.build(({post, markupSection, marker}) => {
    return post([
      markupSection('p', [marker('abc')]),
      markupSection('p', [marker('123')])
    ]);
  });
  mockEditor = renderBuiltAbstract(post, mockEditor);

  const [headSection, tailSection] = post.sections.toArray();
  const collection = post.sections;
  postEditor = new PostEditor(mockEditor);
  let movedSection = postEditor.moveSectionBefore(collection, tailSection, headSection);
  postEditor.complete();

  assert.equal(post.sections.head, movedSection, 'movedSection is returned');
  assert.equal(post.sections.head.text, '123', 'tail section is now head');
  assert.equal(post.sections.tail.text, 'abc', 'head section is now tail');
});

test('#moveSectionBefore moves card sections', (assert) => {
  const listiclePayload = {some:'thing'};
  const otherPayload = {some:'other thing'};
  const post = Helpers.postAbstract.build(({post, cardSection}) => {
    return post([
      cardSection('listicle-card', listiclePayload),
      cardSection('other-card', otherPayload)
    ]);
  });
  mockEditor = renderBuiltAbstract(post, mockEditor);

  const collection = post.sections;
  let [headSection, tailSection] = post.sections.toArray();
  postEditor = new PostEditor(mockEditor);
  postEditor.moveSectionBefore(collection, tailSection, headSection);
  postEditor.complete();

  ([headSection, tailSection] = post.sections.toArray());
  assert.equal(headSection.name, 'other-card', 'other-card moved to first spot');
  assert.equal(tailSection.name, 'listicle-card', 'listicle-card moved to last spot');
  assert.deepEqual(headSection.payload, otherPayload, 'payload is correct for other-card');
  assert.deepEqual(tailSection.payload, listiclePayload, 'payload is correct for listicle-card');
});

test('#moveSectionUp moves it up', (assert) => {
  const post = Helpers.postAbstract.build(({post, cardSection}) => {
    return post([
      cardSection('listicle-card'),
      cardSection('other-card')
    ]);
  });
  mockEditor = renderBuiltAbstract(post, mockEditor);

  let [headSection, tailSection] = post.sections.toArray();
  postEditor = new PostEditor(mockEditor);
  postEditor.moveSectionUp(tailSection);
  postEditor.complete();

  ([headSection, tailSection] = post.sections.toArray());
  assert.equal(headSection.name, 'other-card', 'other-card moved to first spot');
  assert.equal(tailSection.name, 'listicle-card', 'listicle-card moved to last spot');

  postEditor = new PostEditor(mockEditor);
  let movedSection = postEditor.moveSectionUp(headSection);
  postEditor.complete();

  ([headSection, tailSection] = post.sections.toArray());
  assert.equal(post.sections.head, movedSection, 'movedSection is returned');
  assert.equal(headSection.name, 'other-card', 'moveSectionUp is no-op when card is at top');
});

test('moveSectionDown moves it down', (assert) => {
  const post = Helpers.postAbstract.build(({post, cardSection}) => {
    return post([
      cardSection('listicle-card'),
      cardSection('other-card')
    ]);
  });
  mockEditor = renderBuiltAbstract(post, mockEditor);

  let [headSection, tailSection] = post.sections.toArray();
  postEditor = new PostEditor(mockEditor);
  postEditor.moveSectionDown(headSection);
  postEditor.complete();

  ([headSection, tailSection] = post.sections.toArray());
  assert.equal(headSection.name, 'other-card', 'other-card moved to first spot');
  assert.equal(tailSection.name, 'listicle-card', 'listicle-card moved to last spot');

  postEditor = new PostEditor(mockEditor);
  let movedSection = postEditor.moveSectionDown(tailSection);
  postEditor.complete();

  ([headSection, tailSection] = post.sections.toArray());
  assert.equal(post.sections.tail, movedSection, 'movedSection is returned');
  assert.equal(tailSection.name, 'listicle-card',
               'moveSectionDown is no-op when card is at bottom');
});

test('#setAttribute on empty Mobiledoc does nothing', (assert) => {
  let post = Helpers.postAbstract.build(({post, markupSection}) => {
    return post([]);
  });

  mockEditor = renderBuiltAbstract(post, mockEditor);
  const range = Range.blankRange();

  postEditor = new PostEditor(mockEditor);
  postEditor.setAttribute('text-align', 'center', range);
  postEditor.complete();

  assert.postIsSimilar(postEditor.editor.post, post);
});

test('#setAttribute sets attribute of a single section', (assert) => {
  let post = Helpers.postAbstract.build(({post, markupSection}) => {
    return post([markupSection('p')]);
  });

  mockEditor = renderBuiltAbstract(post, mockEditor);
  const range = Range.create(post.sections.head, 0);

  assert.deepEqual(
    post.sections.head.attributes,
    {}
  );

  postEditor = new PostEditor(mockEditor);
  postEditor.setAttribute('text-align', 'center', range);
  postEditor.complete();

  assert.deepEqual(
    post.sections.head.attributes,
    {
      'data-md-text-align': 'center'
    }
  );
});

test('#removeAttribute removes attribute of a single section', (assert) => {
  let post = Helpers.postAbstract.build(({post, markupSection}) => {
    return post([markupSection('p', [], false, { 'data-md-text-align': 'center' })]);
  });

  mockEditor = renderBuiltAbstract(post, mockEditor);
  const range = Range.create(post.sections.head, 0);

  assert.deepEqual(
    post.sections.head.attributes,
    {
      'data-md-text-align': 'center'
    }
  );

  postEditor = new PostEditor(mockEditor);
  postEditor.removeAttribute('text-align', range);
  postEditor.complete();

  assert.deepEqual(
    post.sections.head.attributes,
    {}
  );
});

test('#setAttribute sets attribute of multiple sections', (assert) => {
  let post = Helpers.postAbstract.build(
    ({post, markupSection, marker, cardSection}) => {
    return post([
      markupSection('p', [marker('abc')]),
      cardSection('my-card'),
      markupSection('p', [marker('123')])
    ]);
  });

  mockEditor = renderBuiltAbstract(post, mockEditor);
  const range = Range.create(post.sections.head, 0,
                             post.sections.tail, 2);

  postEditor = new PostEditor(mockEditor);
  postEditor.setAttribute('text-align', 'center', range);
  postEditor.complete();

  assert.deepEqual(
    post.sections.head.attributes,
    {
      'data-md-text-align': 'center'
    }
  );
  assert.ok(post.sections.objectAt(1).isCardSection);
  assert.deepEqual(
    post.sections.tail.attributes,
    {
      'data-md-text-align': 'center'
    }
  );
});

test('#removeAttribute removes attribute of multiple sections', (assert) => {
  let post = Helpers.postAbstract.build(
    ({post, markupSection, marker, cardSection}) => {
    return post([
      markupSection('p', [marker('abc')], false, { 'data-md-text-align': 'center' }),
      cardSection('my-card'),
      markupSection('p', [marker('123')], { 'data-md-text-align': 'left' })
    ]);
  });

  mockEditor = renderBuiltAbstract(post, mockEditor);
  const range = Range.create(post.sections.head, 0,
                             post.sections.tail, 2);

  postEditor = new PostEditor(mockEditor);
  postEditor.removeAttribute('text-align', range);
  postEditor.complete();

  assert.deepEqual(
    post.sections.head.attributes,
    {}
  );
  assert.ok(post.sections.objectAt(1).isCardSection);
  assert.deepEqual(
    post.sections.tail.attributes,
    {}
  );
});

test('#setAttribute sets attribute of a single list', (assert) => {
  let post = Helpers.postAbstract.build(
    ({post, listSection, listItem, marker, markup}) => {
    return post([listSection('ul', [
      listItem([marker('a')]),
      listItem([marker('def')]),
    ])]);
  });

  mockEditor = renderBuiltAbstract(post, mockEditor);
  let range = Range.create(post.sections.head.items.head, 0);

  postEditor = new PostEditor(mockEditor);
  postEditor.setAttribute('text-align', 'center', range);
  postEditor.complete();

  assert.deepEqual(
    post.sections.head.attributes,
    {
      'data-md-text-align': 'center'
    }
  );
});

test('#setAttribute when cursor is in non-markerable section changes nothing', (assert) => {
  let post = Helpers.postAbstract.build(
    ({post, markupSection, marker, cardSection}) => {
    return post([
      cardSection('my-card')
    ]);
  });

  mockEditor = renderBuiltAbstract(post, mockEditor);
  const range = post.sections.head.headPosition().toRange();

  postEditor = new PostEditor(mockEditor);
  postEditor.setAttribute('text-align', 'center', range);
  postEditor.complete();

  assert.ok(post.sections.head.isCardSection, 'card section not changed');
  assert.positionIsEqual(mockEditor._renderedRange.head, post.sections.head.headPosition());
});

test('#toggleSection changes single section to and from tag name', (assert) => {
  let post = Helpers.postAbstract.build(({post, markupSection}) => {
    return post([markupSection('p')]);
  });

  mockEditor = renderBuiltAbstract(post, mockEditor);
  const range = Range.create(post.sections.head, 0);

  postEditor = new PostEditor(mockEditor);
  postEditor.toggleSection('blockquote', range);
  postEditor.complete();

  assert.equal(post.sections.head.tagName, 'blockquote');

  postEditor = new PostEditor(mockEditor);
  postEditor.toggleSection('blockquote', range);
  postEditor.complete();

  assert.equal(post.sections.head.tagName, 'p');
  assert.positionIsEqual(mockEditor._renderedRange.head, post.sections.head.headPosition());
});

test('#toggleSection changes multiple sections to and from tag name', (assert) => {
  let post = Helpers.postAbstract.build(({post, markupSection, marker}) => {
    return post([
      markupSection('p', [marker('abc')]),
      markupSection('p', [marker('123')])
    ]);
  });

  mockEditor = renderBuiltAbstract(post, mockEditor);
  const range = Range.create(post.sections.head, 2,
                             post.sections.tail, 2);

  postEditor = new PostEditor(mockEditor);
  postEditor.toggleSection('blockquote', range);
  postEditor.complete();

  assert.equal(post.sections.head.tagName, 'blockquote');
  assert.equal(post.sections.tail.tagName, 'blockquote');

  postEditor = new PostEditor(mockEditor);
  postEditor.toggleSection('blockquote', range);
  postEditor.complete();

  assert.equal(post.sections.head.tagName, 'p');
  assert.equal(post.sections.tail.tagName, 'p');

  assert.positionIsEqual(
    mockEditor._renderedRange.head,
    post.sections.head.toPosition(2),
    'Maintains the selection'
  );
  assert.positionIsEqual(
    mockEditor._renderedRange.tail,
    post.sections.tail.toPosition(2),
    'Maintains the selection'
  );
});

test('#toggleSection does not update tail markup if tail offset is 0', assert => {
  let post = Helpers.postAbstract.build(({ post, markupSection, marker }) => {
    return post([
      markupSection('p', [marker('abc')]),
      markupSection('p', [marker('123')])
    ]);
  });

  mockEditor = renderBuiltAbstract(post, mockEditor);
  const range = Range.create(post.sections.head, 2, post.sections.tail, 0);

  postEditor = new PostEditor(mockEditor);
  postEditor.toggleSection('blockquote', range);
  postEditor.complete();

  assert.equal(post.sections.head.tagName, 'blockquote');
  assert.equal(post.sections.tail.tagName, 'p');

  postEditor = new PostEditor(mockEditor);
  postEditor.toggleSection('blockquote', range);
  postEditor.complete();

  assert.equal(post.sections.head.tagName, 'p');
  assert.equal(post.sections.tail.tagName, 'p');

  assert.positionIsEqual(
      mockEditor._renderedRange.head,
      post.sections.head.toPosition(2),
      'Maintains the selection'
  );
  assert.positionIsEqual(
      mockEditor._renderedRange.tail,
      post.sections.head.toPosition(3),
      'Maintains the selection'
  );
});

test('#toggleSection skips over non-markerable sections', (assert) => {
  let post = Helpers.postAbstract.build(
    ({post, markupSection, marker, cardSection}) => {
    return post([
      markupSection('p', [marker('abc')]),
      cardSection('my-card'),
      markupSection('p', [marker('123')])
    ]);
  });

  mockEditor = renderBuiltAbstract(post, mockEditor);
  const range = Range.create(post.sections.head, 0,
                             post.sections.tail, 2);

  postEditor = new PostEditor(mockEditor);
  postEditor.toggleSection('blockquote', range);
  postEditor.complete();

  assert.equal(post.sections.head.tagName, 'blockquote');
  assert.ok(post.sections.objectAt(1).isCardSection);
  assert.equal(post.sections.tail.tagName, 'blockquote');

  assert.positionIsEqual(mockEditor._renderedRange.head, post.sections.head.headPosition());
});

test('#toggleSection when cursor is in non-markerable section changes nothing', (assert) => {
  let post = Helpers.postAbstract.build(
    ({post, markupSection, marker, cardSection}) => {
    return post([
      cardSection('my-card')
    ]);
  });

  mockEditor = renderBuiltAbstract(post, mockEditor);
  const range = post.sections.head.headPosition().toRange();

  postEditor = new PostEditor(mockEditor);
  postEditor.toggleSection('blockquote', range);
  postEditor.complete();

  assert.ok(post.sections.head.isCardSection, 'card section not changed');
  assert.positionIsEqual(mockEditor._renderedRange.head, post.sections.head.headPosition());
});

test('#toggleSection when editor has no cursor does nothing', (assert) => {
  assert.expect(6);
  let done = assert.async();

  editor = buildEditorWithMobiledoc(
    ({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abc')])]);
  }, false);
  let expected = Helpers.postAbstract.build(
    ({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abc')])]);
  });

  assert.ok(!editor.hasCursor(), 'editor has no cursor');
  assert.ok(editor.range.isBlank, 'editor has blank range');

  editor.run(postEditor => postEditor.toggleSection('blockquote'));

  Helpers.wait(() => {
    assert.postIsSimilar(editor.post, expected);
    assert.ok(document.activeElement !== editorElement,
              'editor element is not active');
    assert.ok(editor.range.isBlank, 'rendered range is blank');
    assert.equal(window.getSelection().rangeCount, 0, 'nothing selected');

    done();
  });
});

test('#toggleSection toggle single p -> list item', (assert) => {
  let post = Helpers.postAbstract.build(
    ({post, markupSection, marker, markup}) => {
    return post([
      markupSection('p', [marker('a'), marker('b', [markup('b')]), marker('c')])
    ]);
  });

  mockEditor = renderBuiltAbstract(post, mockEditor);
  let range = Range.create(post.sections.head, 0);

  postEditor = new PostEditor(mockEditor);
  postEditor.toggleSection('ul', range);
  postEditor.complete();

  assert.equal(post.sections.length, 1);
  let listSection = post.sections.head;
  assert.ok(listSection.isListSection);
  assert.equal(listSection.tagName, 'ul');
  assert.equal(listSection.items.length, 1);
  assert.equal(listSection.items.head.text, 'abc');
  let item = listSection.items.head;
  assert.equal(item.markers.length, 3);
  assert.equal(item.markers.objectAt(0).value, 'a');
  assert.equal(item.markers.objectAt(1).value, 'b');
  assert.ok(item.markers.objectAt(1).hasMarkup('b'), 'b has b markup');
  assert.equal(item.markers.objectAt(2).value, 'c');
});

test('#toggleSection toggle single list item -> p', (assert) => {
  let post = Helpers.postAbstract.build(
    ({post, listSection, listItem, marker, markup}) => {
    return post([listSection('ul', [
      listItem([marker('a'), marker('b', [markup('b')]), marker('c')])
    ])]);
  });

  mockEditor = renderBuiltAbstract(post, mockEditor);
  let range = Range.create(post.sections.head.items.head, 0);

  postEditor = new PostEditor(mockEditor);
  postEditor.toggleSection('ul', range);
  postEditor.complete();

  assert.equal(post.sections.length, 1);
  assert.equal(post.sections.head.tagName, 'p');
  assert.equal(post.sections.head.text, 'abc');
  assert.equal(post.sections.head.markers.length, 3);
  assert.equal(post.sections.head.markers.objectAt(0).value, 'a');
  assert.equal(post.sections.head.markers.objectAt(1).value, 'b');
  assert.ok(post.sections.head.markers.objectAt(1).hasMarkup('b'), 'b has b markup');
  assert.equal(post.sections.head.markers.objectAt(2).value, 'c');

  assert.positionIsEqual(mockEditor._renderedRange.head, post.sections.head.headPosition());
});

test('#toggleSection toggle multiple ps -> list and list -> multiple ps', (assert) => {
  let mobiledoc = Helpers.mobiledoc.build(
    ({post, markupSection, marker}) => {
    return post([
      markupSection('p', [marker('abc')]),
      markupSection('p', [marker('123')])
    ]);
  });

  editor = new Editor({mobiledoc});
  let { post } = editor;
  editor.render(editorElement);
  let range = Range.create(post.sections.head, 0, post.sections.tail, 2);

  postEditor = new PostEditor(editor);
  postEditor.toggleSection('ul', range);
  postEditor.complete();

  let listSection = post.sections.head;
  assert.equal(post.sections.length, 1, 'post has 1 list section after toggle');
  assert.ok(listSection.isListSection);
  assert.equal(listSection.tagName, 'ul');
  assert.equal(listSection.items.length, 2, '2 list items');
  assert.equal(listSection.items.head.text, 'abc');
  assert.equal(listSection.items.tail.text, '123');

  range = Range.create(listSection.items.head, 0, listSection.items.tail, 1);
  postEditor = new PostEditor(editor);
  postEditor.toggleSection('ul', range);
  postEditor.complete();

  assert.equal(post.sections.length, 2, 'post has 2 sections after toggle');
  assert.equal(post.sections.head.tagName, 'p');
  assert.equal(post.sections.tail.tagName, 'p');
  assert.equal(post.sections.head.text, 'abc');
  assert.equal(post.sections.tail.text, '123');

  assert.ok(editor.range.head.section === post.sections.head,
            'selected head correct');
  assert.equal(editor.range.head.offset, 0);
});

test('#toggleSection untoggle first list item changes it to markup section, retains markup', (assert) => {
  let post = Helpers.postAbstract.build(
    ({post, listSection, listItem, marker, markup}) => {
    return post([listSection('ul', [
      listItem([marker('a'), marker('b', [markup('b')]), marker('c')]),
      listItem([marker('def')]),
      listItem([marker('ghi')])
    ])]);
  });
  mockEditor = renderBuiltAbstract(post, mockEditor);
  let range = Range.create(post.sections.head.items.head, 0);

  postEditor = new PostEditor(mockEditor);
  postEditor.toggleSection('ul', range);
  postEditor.complete();

  assert.equal(post.sections.length, 2, '2 sections');
  assert.equal(post.sections.head.tagName, 'p', 'head section is p');
  assert.equal(post.sections.head.text, 'abc');
  let section = post.sections.head;
  assert.equal(section.markers.length, 3);
  assert.equal(section.markers.objectAt(0).value, 'a');
  assert.ok(section.markers.objectAt(1).hasMarkup('b'), 'b has b markup');
  assert.equal(section.markers.objectAt(2).value, 'c');
  assert.ok(post.sections.tail.isListSection, 'tail is list section');
  assert.equal(post.sections.tail.items.length, 2, '2 items in list');
  assert.equal(post.sections.tail.items.head.text, 'def');
  assert.equal(post.sections.tail.items.tail.text, 'ghi');

  assert.positionIsEqual(mockEditor._renderedRange.head, post.sections.head.headPosition());
});

test('#toggleSection untoggle middle list item changes it to markup section, retaining markup', (assert) => {
  let post = Helpers.postAbstract.build(
    ({post, listSection, listItem, marker, markup}) => {
    return post([listSection('ul', [
      listItem([marker('abc')]),
      listItem([marker('d'), marker('e', [markup('b')]), marker('f')]),
      listItem([marker('ghi')])
    ])]);
  });
  mockEditor = renderBuiltAbstract(post, mockEditor);
  let range = Range.create(post.sections.head.items.objectAt(1), 0);

  postEditor = new PostEditor(mockEditor);
  postEditor.toggleSection('ul', range);
  postEditor.complete();

  assert.equal(post.sections.length, 3, '3 sections');
  let section = post.sections.objectAt(1);
  assert.equal(section.tagName, 'p', 'middle section is p');
  assert.equal(section.text, 'def');
  assert.equal(section.markers.length, 3);
  assert.equal(section.markers.objectAt(0).value, 'd');
  assert.equal(section.markers.objectAt(1).value, 'e');
  assert.ok(section.markers.objectAt(1).hasMarkup('b'), 'e has b markup');
  assert.equal(section.markers.objectAt(2).value, 'f');
  assert.positionIsEqual(mockEditor._renderedRange.head, section.headPosition());

  assert.ok(post.sections.head.isListSection, 'head section is list');
  assert.ok(post.sections.tail.isListSection, 'tail section is list');
  assert.equal(post.sections.head.items.length, 1, '1 item in first list');
  assert.equal(post.sections.tail.items.length, 1, '1 item in last list');
  assert.equal(post.sections.head.items.head.text, 'abc');
  assert.equal(post.sections.tail.items.head.text, 'ghi');
});

test('#toggleSection toggle markup section -> ul between lists joins the lists', (assert) => {
  let mobiledoc = Helpers.mobiledoc.build(
    ({post, listSection, listItem, marker, markupSection}) => {
    return post([
      listSection('ul', [listItem([marker('abc')])]),
      markupSection('p', [marker('123')]),
      listSection('ul', [listItem([marker('def')])])
    ]);
  });
  editor = new Editor({mobiledoc});
  let { post } = editor;
  editor.render(editorElement);
  let range = Range.create(post.sections.objectAt(1), 0);

  postEditor = new PostEditor(editor);
  postEditor.toggleSection('ul', range);
  postEditor.complete();

  assert.equal(post.sections.length, 1, '1 sections');
  let section = post.sections.head;
  assert.ok(section.isListSection, 'list section');
  assert.equal(section.items.length, 3, '3 items');
  assert.deepEqual(section.items.map(i => i.text), ['abc', '123', 'def']);

  let listItem = section.items.objectAt(1);
  assert.ok(editor.range.head.section === listItem, 'correct head selection');
  assert.equal(editor.range.head.offset, 0);
});

test('#toggleSection untoggle multiple items at end of list changes them to markup sections', (assert) => {
  let post = Helpers.postAbstract.build(
    ({post, listSection, listItem, marker}) => {
    return post([listSection('ul', [
      listItem([marker('abc')]),
      listItem([marker('def')]),
      listItem([marker('ghi')])
    ])]);
  });
  mockEditor = renderBuiltAbstract(post, mockEditor);
  let range = Range.create(post.sections.head.items.objectAt(1), 0,
                           post.sections.head.items.tail, 1);

  postEditor = new PostEditor(mockEditor);
  postEditor.toggleSection('ul', range);
  postEditor.complete();

  assert.equal(post.sections.length, 3, '3 sections');
  assert.ok(post.sections.head.isListSection, 'head section is list');
  assert.equal(post.sections.head.items.length, 1, 'head section has 1 item');
  assert.equal(post.sections.head.items.head.text, 'abc');

  assert.equal(post.sections.objectAt(1).tagName, 'p', 'middle is p');
  assert.equal(post.sections.objectAt(1).text, 'def');
  assert.equal(post.sections.tail.tagName, 'p', 'tail is p');
  assert.equal(post.sections.tail.text, 'ghi');

  assert.positionIsEqual(mockEditor._renderedRange.head, post.sections.objectAt(1).headPosition());
});

test('#toggleSection untoggle multiple items at start of list changes them to markup sections', (assert) => {
  let post = Helpers.postAbstract.build(
    ({post, listSection, listItem, marker}) => {
    return post([listSection('ul', [
      listItem([marker('abc')]),
      listItem([marker('def')]),
      listItem([marker('ghi')])
    ])]);
  });
  mockEditor = renderBuiltAbstract(post, mockEditor);
  let range = Range.create(post.sections.head.items.head, 0,
                           post.sections.head.items.objectAt(1), 1);

  postEditor = new PostEditor(mockEditor);
  postEditor.toggleSection('ul', range);
  postEditor.complete();

  assert.equal(post.sections.length, 3, '3 sections');
  assert.equal(post.sections.head.tagName, 'p', 'head section is p');
  assert.equal(post.sections.head.text, 'abc');

  assert.equal(post.sections.objectAt(1).tagName, 'p', '2nd section is p');
  assert.equal(post.sections.objectAt(1).text, 'def');

  assert.ok(post.sections.objectAt(2).isListSection, '3rd section is list');
  assert.equal(post.sections.objectAt(2).items.length, 1, 'list has 1 item');
  assert.equal(post.sections.objectAt(2).items.head.text, 'ghi');

  assert.positionIsEqual(mockEditor._renderedRange.head, post.sections.head.headPosition());
});

test('#toggleSection untoggle items and overflowing markup sections changes the overflow to items', (assert) => {
  let mobiledoc = Helpers.mobiledoc.build(
    ({post, listSection, listItem, markupSection, marker}) => {
    return post([
      listSection('ul', [
        listItem([marker('abc')]),
        listItem([marker('def')]),
        listItem([marker('ghi')])
      ]),
      markupSection('p', [marker('123')])
    ]);
  });
  editor = new Editor({mobiledoc});
  editor.render(editorElement);
  let { post } = editor;
  let range = Range.create(post.sections.head.items.objectAt(1), 0,
                           post.sections.tail, 1);

  postEditor = new PostEditor(editor);
  postEditor.toggleSection('ul', range);
  postEditor.complete();

  assert.equal(post.sections.length, 1, '1 section');
  assert.ok(post.sections.head.isListSection, 'head section is list');
  assert.equal(post.sections.head.items.length, 4, 'list has 4 items');

  let text = post.sections.head.items.toArray().map(i => i.text);
  assert.deepEqual(text, ['abc', 'def', 'ghi', '123']);

  assert.ok(editor.range.head.section === post.sections.head.items.objectAt(1), 'selected head correct');
  assert.equal(editor.range.head.offset, 0);
});

test('#toggleSection untoggle last list item changes it to markup section', (assert) => {
  let post = Helpers.postAbstract.build(
    ({post, listSection, listItem, marker}) => {
    return post([listSection('ul', [
      listItem([marker('abc')]),
      listItem([marker('def')]),
      listItem([marker('ghi')])
    ])]);
  });
  mockEditor = renderBuiltAbstract(post, mockEditor);
  let range = Range.create(post.sections.head.items.tail, 0);

  postEditor = new PostEditor(mockEditor);
  postEditor.toggleSection('ul', range);
  postEditor.complete();

  assert.equal(post.sections.length, 2, '2 sections');
  assert.ok(post.sections.head.isListSection, 'head section is list');
  assert.equal(post.sections.tail.tagName, 'p', 'tail is p');
  assert.equal(post.sections.tail.text, 'ghi');

  assert.equal(post.sections.head.items.length, 2, '2 items in list');
  assert.equal(post.sections.head.items.head.text, 'abc');
  assert.equal(post.sections.head.items.tail.text, 'def');

  assert.positionIsEqual(mockEditor._renderedRange.head, post.sections.tail.headPosition());
});

test('#toggleSection toggle list item to different type of list item', (assert) => {
  let post = Helpers.postAbstract.build(
    ({post, listSection, listItem, marker}) => {
    return post([listSection('ul', [listItem([marker('abc')])])]);
  });

  let range = Range.create(post.sections.head.items.head, 0);

  mockEditor = renderBuiltAbstract(post, mockEditor);
  postEditor = new PostEditor(mockEditor);
  postEditor.toggleSection('ol', range);
  postEditor.complete();

  assert.equal(post.sections.length, 1, '1 section');
  assert.ok(post.sections.head.isListSection, 'section is list');
  assert.equal(post.sections.head.tagName, 'ol', 'section is ol list');
  assert.equal(post.sections.head.items.length, 1, '1 item');
  assert.equal(post.sections.head.items.head.text, 'abc');

  assert.positionIsEqual(mockEditor._renderedRange.head, post.sections.head.items.head.headPosition());
});

test('#toggleSection toggle list item to different type of list item when other sections precede it', (assert) => {
  let post = Helpers.postAbstract.build(
    ({post, listSection, listItem, marker, markupSection}) => {
    return post([
      markupSection('p', [marker('123')]),
      listSection('ul', [listItem([marker('abc')])])
    ]);
  });

  let range = Range.create(post.sections.tail.items.head, 0);

  mockEditor = renderBuiltAbstract(post, mockEditor);
  postEditor = new PostEditor(mockEditor);
  postEditor.toggleSection('ol', range);
  postEditor.complete();

  assert.equal(post.sections.length, 2, '2 section');
  assert.equal(post.sections.head.tagName, 'p', '1st section is p');
  assert.equal(post.sections.head.text, '123');
  assert.ok(post.sections.tail.isListSection, 'section is list');
  assert.equal(post.sections.tail.tagName, 'ol', 'section is ol list');
  assert.equal(post.sections.tail.items.length, 1, '1 item');
  assert.equal(post.sections.tail.items.head.text, 'abc');

  assert.positionIsEqual(mockEditor._renderedRange.head, post.sections.tail.items.head.headPosition());
});

test('#toggleSection toggle when cursor on card section is no-op', (assert) => {
  let post = Helpers.postAbstract.build(
    ({post, cardSection}) => {
    return post([cardSection('my-card')]);
  });

  let range = Range.create(post.sections.head, 0);

  mockEditor = renderBuiltAbstract(post, mockEditor);
  postEditor = new PostEditor(mockEditor);
  postEditor.toggleSection('ol', range);
  postEditor.complete();

  assert.equal(post.sections.length, 1, '1 section');
  assert.ok(post.sections.head.isCardSection, 'still card section');

  assert.positionIsEqual(mockEditor._renderedRange.head, range.head, 'range head is set to same');
  assert.positionIsEqual(mockEditor._renderedRange.tail, range.tail, 'range tail is set to same');
});

test('#toggleSection joins contiguous list items', (assert) => {
  let mobiledoc = Helpers.mobiledoc.build(
    ({post, listSection, listItem, marker}) => {
    return post([
      listSection('ul', [listItem([marker('abc')])]),
      listSection('ol', [listItem([marker('123')])]),
      listSection('ul', [listItem([marker('def')])])
    ]);
  });

  editor = new Editor({mobiledoc});
  editor.render(editorElement);
  let { post } = editor;
  let range = Range.create(post.sections.objectAt(1).items.head, 0);
  postEditor = new PostEditor(editor);
  postEditor.toggleSection('ul', range);
  postEditor.complete();

  assert.equal(post.sections.length, 1, '1 section');
  assert.ok(post.sections.head.isListSection, 'is list');
  assert.equal(post.sections.head.items.length, 3, '3 items');
  assert.deepEqual(post.sections.head.items.map(i => i.text),
                   ['abc', '123', 'def']);
});

test('#toggleSection maintains the selection when the sections in the selected range are still there', (assert) => {
  let post = Helpers.postAbstract.build(({post, markupSection, marker}) => {
    return post([
      markupSection('p', [marker('abc')])
    ]);
  });

  mockEditor = renderBuiltAbstract(post, mockEditor);
  const range = Range.create(post.sections.head, 1,
                             post.sections.head, 2);

  postEditor = new PostEditor(mockEditor);
  postEditor.toggleSection('h1', range);
  postEditor.complete();

  assert.positionIsEqual(
    mockEditor._renderedRange.head,
    post.sections.head.toPosition(1),
    'Maintains the selection'
  );
  assert.positionIsEqual(
    mockEditor._renderedRange.tail,
    post.sections.tail.toPosition(2),
    'Maintains the selection'
  );
});

test('#toggleMarkup when cursor is in non-markerable does nothing', (assert) => {
  editor = buildEditorWithMobiledoc(
    ({post, markupSection, marker, cardSection}) => {
    return post([
      cardSection('my-card')
    ]);
  });

  const range = editor.post.sections.head.headPosition().toRange();
  postEditor = new PostEditor(editor);
  postEditor.toggleMarkup('b', range);
  postEditor.complete();

  assert.ok(editor.post.sections.head.isCardSection);
  assert.positionIsEqual(editor._renderedRange.head,
                         editor.post.sections.head.headPosition());
});

test('#toggleMarkup when cursor surrounds non-markerable does nothing', (assert) => {
  editor = buildEditorWithMobiledoc(
    ({post, markupSection, marker, cardSection}) => {
    return post([
      cardSection('my-card')
    ]);
  });

  const range = editor.post.sections.head.toRange();
  postEditor = new PostEditor(editor);
  postEditor.toggleMarkup('b', range);
  postEditor.complete();

  assert.ok(editor.post.sections.head.isCardSection);
  assert.positionIsEqual(editor._renderedRange.head,
                         editor.post.sections.head.headPosition());
});

test('#toggleMarkup when range has the markup removes it', (assert) => {
  editor = buildEditorWithMobiledoc(
    ({post, markupSection, marker, markup}) => {
    return post([markupSection('p', [marker('abc', [markup('b')])])]);
  });
  let expected = Helpers.postAbstract.build(
    ({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abc')])]);
  });

  const range = editor.post.sections.head.toRange();
  postEditor = new PostEditor(editor);
  postEditor.toggleMarkup('b', range);
  postEditor.complete();

  assert.positionIsEqual(editor._renderedRange.head, editor.post.headPosition());
  assert.positionIsEqual(editor._renderedRange.tail, editor.post.tailPosition());
  assert.postIsSimilar(editor.post, expected);
});

test('#toggleMarkup when only some of the range has it removes it', (assert) => {
  editor = buildEditorWithMobiledoc(
    ({post, markupSection, marker, markup}) => {
    return post([markupSection('p', [
      marker('a'),
      marker('b', [markup('b')]),
      marker('c')
    ])]);
  });
  let expected = Helpers.postAbstract.build(
    ({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abc')])]);
  });

  const range = editor.post.sections.head.toRange();
  postEditor = new PostEditor(editor);
  postEditor.toggleMarkup('b', range);
  postEditor.complete();

  assert.positionIsEqual(editor._renderedRange.head,
                         editor.post.sections.head.headPosition());
  assert.positionIsEqual(editor._renderedRange.tail,
                         editor.post.sections.head.tailPosition());
  assert.postIsSimilar(editor.post, expected);
});

test('#toggleMarkup when range does not have the markup adds it', (assert) => {
  editor = buildEditorWithMobiledoc(
    ({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abc')])]);
  });
  let expected = Helpers.postAbstract.build(
    ({post, markupSection, marker, markup}) => {
    return post([markupSection('p', [marker('abc', [markup('b')])])]);
  });

  const range = editor.post.sections.head.toRange();
  postEditor = new PostEditor(editor);
  postEditor.toggleMarkup('b', range);
  postEditor.complete();

  assert.positionIsEqual(editor._renderedRange.head,
                         editor.post.sections.head.headPosition());
  assert.positionIsEqual(editor._renderedRange.tail,
                         editor.post.sections.head.tailPosition());
  assert.postIsSimilar(editor.post, expected);
});

test('#toggleMarkup when the editor has no cursor', (assert) => {
  let done = assert.async();

  editor = buildEditorWithMobiledoc(
    ({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abc')])]);
  }, false);
  let expected = Helpers.postAbstract.build(
    ({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abc')])]);
  });

  editor._renderedRange = null;
  editor.run(postEditor => postEditor.toggleMarkup('b'));

  Helpers.wait(() => {
    assert.postIsSimilar(editor.post, expected);
    assert.equal(window.getSelection().rangeCount, 0,
                 'nothing is selected');
    assert.ok(document.activeElement !== editorElement,
              'active element is not editor element');
    assert.ok(editor._renderedRange && editor._renderedRange.isBlank, 'rendered range is blank');

    done();
  });
});

test('#insertMarkers inserts an atom', (assert) => {
  let toInsert, expected;
  Helpers.postAbstract.build(({post, markupSection, marker, markup, atom}) => {
    toInsert = [
      atom('simple-atom', '123', [markup('b')])
    ];
    expected = post([
      markupSection('p', [
        marker('abc'),
        atom('simple-atom', '123', [markup('b')]),
        marker('def')
    ])]);
  });

  editor = buildEditorWithMobiledoc(({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abcdef')])]);
  });
  let position = editor.post.sections.head.toPosition('abc'.length);
  postEditor = new PostEditor(editor);
  postEditor.insertMarkers(position, toInsert);
  postEditor.complete();

  assert.postIsSimilar(editor.post, expected);
  assert.renderTreeIsEqual(editor._renderTree, expected);
  assert.positionIsEqual(
    editor._renderedRange.head,
    editor.post.sections.head.toPosition(4)
  );
});

test('#insertMarkers inserts the markers in middle, merging markups', (assert) => {
  let toInsert, expected;
  Helpers.postAbstract.build(({post, markupSection, marker, markup}) => {
    toInsert = [
      marker('123', [markup('b')]), marker('456')
    ];
    expected = post([
      markupSection('p', [
        marker('abc'),
        marker('123', [markup('b')]),
        marker('456def')
    ])]);
  });

  editor = buildEditorWithMobiledoc(({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abcdef')])]);
  });
  let position = editor.post.sections.head.toPosition('abc'.length);
  postEditor = new PostEditor(editor);
  postEditor.insertMarkers(position, toInsert);
  postEditor.complete();

  assert.postIsSimilar(editor.post, expected);
  assert.renderTreeIsEqual(editor._renderTree, expected);
  assert.positionIsEqual(
    editor._renderedRange.head,
    editor.post.sections.head.toPosition('abc123456'.length)
  );
});

test('#insertMarkers inserts the markers when the markerable has no markers', (assert) => {
  let toInsert, expected;
  Helpers.postAbstract.build(({post, markupSection, marker, markup}) => {
    toInsert = [
      marker('123', [markup('b')]), marker('456')
    ];
    expected = post([
      markupSection('p', [
        marker('123', [markup('b')]),
        marker('456')
    ])]);
  });

  editor = buildEditorWithMobiledoc(({post, markupSection}) => {
    return post([markupSection()]);
  });
  let position = editor.post.sections.head.headPosition();
  postEditor = new PostEditor(editor);
  postEditor.insertMarkers(position, toInsert);
  postEditor.complete();

  assert.postIsSimilar(editor.post, expected);
  assert.renderTreeIsEqual(editor._renderTree, expected);
  assert.positionIsEqual(
    editor._renderedRange.head,
    editor.post.sections.head.toPosition('123456'.length)
  );
});

test('#insertMarkers inserts the markers at start', (assert) => {
  let toInsert, expected;
  Helpers.postAbstract.build(({post, markupSection, marker, markup}) => {
    toInsert = [
      marker('123', [markup('b')]), marker('456')
    ];
    expected = post([
      markupSection('p', [
        marker('123', [markup('b')]),
        marker('456abc')
    ])]);
  });

  editor = buildEditorWithMobiledoc(({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abc')])]);
  });
  let position = editor.post.sections.head.headPosition();
  postEditor = new PostEditor(editor);
  postEditor.insertMarkers(position, toInsert);
  postEditor.complete();

  assert.postIsSimilar(editor.post, expected);
  assert.renderTreeIsEqual(editor._renderTree, expected);
  assert.positionIsEqual(
    editor._renderedRange.head,
    editor.post.sections.head.toPosition('123456'.length)
  );
});

test('#insertMarkers inserts the markers at end', (assert) => {
  let toInsert, expected;
  Helpers.postAbstract.build(({post, markupSection, marker, markup}) => {
    toInsert = [
      marker('123', [markup('b')]), marker('456')
    ];
    expected = post([
      markupSection('p', [
        marker('abc'),
        marker('123', [markup('b')]),
        marker('456')
    ])]);
  });

  editor = buildEditorWithMobiledoc(({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abc')])]);
  });
  let position = editor.post.sections.head.tailPosition();
  postEditor = new PostEditor(editor);
  postEditor.insertMarkers(position, toInsert);
  postEditor.complete();

  assert.postIsSimilar(editor.post, expected);
  assert.renderTreeIsEqual(editor._renderTree, expected);
  assert.positionIsEqual(
    editor._renderedRange.head,
    editor.post.sections.head.tailPosition()
  );
});

test('#insertMarkers throws if the position is not markerable', (assert) => {
  let toInsert;
  Helpers.postAbstract.build(({post, markupSection, marker, markup}) => {
    toInsert = [marker('123', [markup('b')]), marker('456')];
  });

  editor = buildEditorWithMobiledoc(({post, cardSection}) => {
    return post([cardSection('some-card')]);
  });
  let position = editor.post.sections.head.tailPosition();
  postEditor = new PostEditor(editor);

  assert.throws(() => {
    postEditor.insertMarkers(position, toInsert);
  }, /cannot insert.*non-markerable/i);
});

test('#insertText is no-op if the position section is not markerable', (assert) => {
  let toInsert = '123';
  let expected = Helpers.postAbstract.build(({post, cardSection}) => {
    return post([cardSection('test-card')]);
  });
  editor = buildEditorWithMobiledoc(({post, cardSection}) => {
    return post([cardSection('test-card')]);
  });
  let position = editor.post.sections.head.headPosition();
  postEditor = new PostEditor(editor);
  postEditor.insertText(position, toInsert);
  postEditor.complete();

  assert.postIsSimilar(editor.post, expected);
  assert.renderTreeIsEqual(editor._renderTree, expected);
  assert.ok(!editor._renderedRange, 'no range is rendered since nothing happened');
});

test('#insertText inserts the text at start', (assert) => {
  let toInsert, expected;
  Helpers.postAbstract.build(({post, markupSection, marker, markup}) => {
    toInsert = '123';
    expected = post([
      markupSection('p', [
        marker('123abc', [markup('b')])
    ])]);
  });

  editor = buildEditorWithMobiledoc(({post, markupSection, marker, markup}) => {
    return post([markupSection('p', [marker('abc', [markup('b')])])]);
  });
  let position = editor.post.sections.head.headPosition();
  postEditor = new PostEditor(editor);
  postEditor.insertText(position, toInsert);
  postEditor.complete();

  assert.postIsSimilar(editor.post, expected);
  assert.renderTreeIsEqual(editor._renderTree, expected);
  assert.positionIsEqual(
    editor._renderedRange.head,
    editor.post.sections.head.toPosition('123'.length)
  );
});

test('#insertText inserts text in the middle', (assert) => {
  let toInsert, expected;
  Helpers.postAbstract.build(({post, markupSection, marker, markup}) => {
    toInsert = '123';
    expected = post([
      markupSection('p', [
        marker('ab123c', [markup('b')])
    ])]);
  });

  editor = buildEditorWithMobiledoc(({post, markupSection, marker, markup}) => {
    return post([markupSection('p', [marker('abc', [markup('b')])])]);
  });
  let position = editor.post.sections.head.toPosition('ab'.length);
  postEditor = new PostEditor(editor);
  postEditor.insertText(position, toInsert);
  postEditor.complete();

  assert.postIsSimilar(editor.post, expected);
  assert.renderTreeIsEqual(editor._renderTree, expected);
  assert.positionIsEqual(
    editor._renderedRange.head,
    editor.post.sections.head.toPosition('ab123'.length)
  );
});

test('#insertText inserts text at the end', (assert) => {
  let toInsert, expected;
  Helpers.postAbstract.build(({post, markupSection, marker, markup}) => {
    toInsert = '123';
    expected = post([
      markupSection('p', [
        marker('abc123', [markup('b')])
    ])]);
  });

  editor = buildEditorWithMobiledoc(({post, markupSection, marker, markup}) => {
    return post([markupSection('p', [marker('abc', [markup('b')])])]);
  });
  let position = editor.post.sections.head.tailPosition();
  postEditor = new PostEditor(editor);
  postEditor.insertText(position, toInsert);
  postEditor.complete();

  assert.postIsSimilar(editor.post, expected);
  assert.renderTreeIsEqual(editor._renderTree, expected);
  assert.positionIsEqual(
    editor._renderedRange.head,
    editor.post.sections.head.tailPosition()
  );
});

test('#_splitListItem creates two list items', (assert) => {
  let expected = Helpers.postAbstract.build(
    ({post, listSection, listItem, marker, markup}) => {
    return post([listSection('ul', [
      listItem([marker('abc'), marker('bo', [markup('b')])]),
      listItem([marker('ld', [markup('b')])])
    ])]);
  });
  editor = buildEditorWithMobiledoc(
    ({post, listSection, listItem, marker, markup}) => {
    return post([listSection('ul', [
      listItem([marker('abc'), marker('bold', [markup('b')])])
    ])]);
  });

  let item = editor.post.sections.head.items.head;
  let position = item.toPosition('abcbo'.length);
  postEditor = new PostEditor(editor);
  postEditor._splitListItem(item, position);
  postEditor.complete();

  assert.postIsSimilar(editor.post, expected);
  assert.renderTreeIsEqual(editor._renderTree, expected);
});

test('#_splitListItem when position is start creates blank list item', (assert) => {
  let expected = Helpers.postAbstract.build(
    ({post, listSection, listItem, marker}) => {
    return post([listSection('ul', [
      listItem([marker('')]),
      listItem([marker('abc')])
    ])]);
  });
  editor = buildEditorWithMobiledoc(
    ({post, listSection, listItem, marker}) => {
    return post([listSection('ul', [listItem([marker('abc')])])]);
  });

  let item = editor.post.sections.head.items.head;
  let position = item.headPosition();
  postEditor = new PostEditor(editor);
  postEditor._splitListItem(item, position);
  postEditor.complete();

  assert.postIsSimilar(editor.post, expected);
});
