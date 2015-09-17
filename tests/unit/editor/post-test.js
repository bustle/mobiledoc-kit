import EditorDomRenderer from 'content-kit-editor/renderers/editor-dom';
import RenderTree from 'content-kit-editor/models/render-tree';
import PostEditor from 'content-kit-editor/editor/post';
import { Editor } from 'content-kit-editor';
import Helpers from '../../test-helpers';
import { DIRECTION } from 'content-kit-editor/utils/key';
import PostNodeBuilder from 'content-kit-editor/models/post-node-builder';
import Range from 'content-kit-editor/utils/cursor/range';
import Position from 'content-kit-editor/utils/cursor/position';

const { FORWARD } = DIRECTION;

const { module, test } = Helpers;

let editor, editorElement;

let builder, postEditor, mockEditor;

function getSection(sectionIndex) {
  return editor.post.sections.objectAt(sectionIndex);
}

function getMarker(sectionIndex, markerIndex) {
  return getSection(sectionIndex).markers.objectAt(markerIndex);
}

function postEditorWithMobiledoc(treeFn) {
  const mobiledoc = Helpers.mobiledoc.build(treeFn);
  editor = new Editor({mobiledoc});
  editor.render(editorElement);
  return new PostEditor(editor);
}

function renderBuiltAbstract(post) {
  mockEditor.post = post;
  let renderer = new EditorDomRenderer(mockEditor, [], () => {}, {});
  let renderTree = new RenderTree(post);
  renderer.render(renderTree);
  return mockEditor;
}

module('Unit: PostEditor with mobiledoc', {
  beforeEach() {
    $('#qunit-fixture').append('<div id="editor"></div>');
    editorElement = $('#editor')[0];
  },

  afterEach() {
    if (editor) {
      editor.destroy();
      editor = null;
    }
  }
});

test('#deleteFrom in middle of marker deletes char before offset', (assert) => {
  const postEditor = postEditorWithMobiledoc(({post, markupSection, marker}) =>
    post([
      markupSection('P', [marker('abc def')])
    ])
  );

  const position = new Position(getSection(0), 4);
  const nextPosition = postEditor.deleteFrom(position);
  postEditor.complete();

  assert.equal(getMarker(0, 0).value, 'abcdef');
  assert.ok(nextPosition.section === getSection(0), 'correct position section');
  assert.equal(nextPosition.offset, 3, 'correct position offset');
});


test('#deleteFrom (forward) in middle of marker deletes char after offset', (assert) => {
  const postEditor = postEditorWithMobiledoc(({post, markupSection, marker}) =>
    post([
      markupSection('p', [marker('abc def')])
    ])
  );

  const position = new Position(getSection(0), 3);
  const nextPosition = postEditor.deleteFrom(position, FORWARD);
  postEditor.complete();

  assert.equal(getMarker(0, 0).value, 'abcdef');
  assert.ok(nextPosition.section === getSection(0), 'correct position section');
  assert.equal(nextPosition.offset, 3, 'correct position offset');
});

test('#deleteFrom offset 0 joins section with previous if first marker', (assert) => {
  const postEditor = postEditorWithMobiledoc(({post, markupSection, marker}) =>
    post([
      markupSection('P', [marker('abc')]),
      markupSection('P', [marker('def')])
    ])
  );

  const position = new Position(getSection(1), 0);
  const nextPosition = postEditor.deleteFrom(position);
  postEditor.complete();

  assert.equal(editor.post.sections.length, 1, 'sections joined');
  assert.equal(getSection(0).markers.length, 1, 'joined section has 1 marker');
  assert.equal(getSection(0).text, 'abcdef', 'text is joined');
  assert.ok(nextPosition.section === getSection(0), 'correct position section');
  assert.equal(nextPosition.offset, 'abc'.length, 'correct position offset');
});

test('#deleteFrom (FORWARD) end of marker joins section with next if last marker', (assert) => {
  const postEditor = postEditorWithMobiledoc(({post, markupSection, marker}) =>
    post([
      markupSection('P', [marker('abc')]),
      markupSection('P', [marker('def')])
    ])
  );

  let section = getSection(0);
  const position = new Position(section, 3);
  const nextPosition = postEditor.deleteFrom(position, FORWARD);
  postEditor.complete();

  assert.equal(editor.post.sections.length, 1, 'sections joined');
  assert.equal(getSection(0).markers.length, 1, 'joined section has 1 marker');
  assert.equal(getSection(0).text, 'abcdef', 'text is joined');
  assert.ok(nextPosition.section === getSection(0), 'correct position section');
  assert.equal(nextPosition.offset, 'abc'.length, 'correct position offset');
});

test('#deleteFrom offset 0 deletes last character of previous marker when there is one', (assert) => {
  const postEditor = postEditorWithMobiledoc(({post, markupSection, marker}) =>
    post([
      markupSection('P', [marker('abc'), marker('def')])
    ])
  );

  const position = new Position(getSection(0), 3);
  const nextPosition = postEditor.deleteFrom(position);
  postEditor.complete();

  assert.equal(getSection(0).text, 'abdef', 'text is deleted');
  assert.ok(nextPosition.section === getSection(0), 'correct position section');
  assert.equal(nextPosition.offset, 'ab'.length, 'correct position offset');
});

test('#deleteFrom (FORWARD) end of marker deletes first character of next marker when there is one', (assert) => {
  const postEditor = postEditorWithMobiledoc(({post, markupSection, marker}) =>
    post([
      markupSection('P', [marker('abc'), marker('def')])
    ])
  );

  let section = getSection(0);
  const position = new Position(section, 3);
  const nextPosition = postEditor.deleteFrom(position, FORWARD);
  postEditor.complete();

  assert.equal(getSection(0).text, 'abcef', 'text is correct');
  assert.ok(nextPosition.section === getSection(0), 'correct position section');
  assert.equal(nextPosition.offset, 'abc'.length, 'correct position offset');
});


module('Unit: PostEditor', {
  beforeEach() {
    builder = new PostNodeBuilder();
    mockEditor = {
      rerender() {},
      didUpdate() {},
      builder
    };
    postEditor = new PostEditor(mockEditor);
  },

  afterEach() {
    if (editor) {
      editor.destroy();
      editor = null;
    }
  }
});

test('#deleteRange when within the same marker', (assert) => {
  let post, section;
  Helpers.postAbstract.build(({marker, markupSection: buildMarkupSection, post: buildPost}) => {
    section = buildMarkupSection('p', [
      marker('abc def')
    ]);
    post = buildPost([
      section
    ]);
  });

  renderBuiltAbstract(post);

  const range = Range.create(section, 3, section, 4);
  postEditor.deleteRange(range);
  postEditor.complete();

  assert.equal(post.sections.head.text, 'abcdef');
});

test('#deleteRange when same section, different markers, same markups', (assert) => {
  let post, section;
  Helpers.postAbstract.build(({marker, markupSection: buildMarkupSection, post: buildPost}) => {
    section = buildMarkupSection('p', [
      marker('abc'),
      marker(' def')
    ]);
    post = buildPost([
      section
    ]);
  });

  renderBuiltAbstract(post);

  const range = Range.create(section, 3, section, 4);
  postEditor.deleteRange(range);
  postEditor.complete();

  assert.equal(post.sections.head.text, 'abcdef');
});

test('#deleteRange when same section, different markers, different markups', (assert) => {
  let post, section, markup;
  Helpers.postAbstract.build(({marker, markup:buildMarkup, markupSection: buildMarkupSection, post: buildPost}) => {
    markup = buildMarkup('b');
    section = buildMarkupSection('p', [
      marker('abc'),
      marker(' def', [markup])
    ]);
    post = buildPost([
      section
    ]);
  });

  renderBuiltAbstract(post);

  const range = Range.create(section, 3, section, 4);
  postEditor.deleteRange(range);
  postEditor.complete();

  assert.equal(post.sections.head.text, 'abcdef');
  const [m1, m2] = post.sections.head.markers.toArray();
  assert.ok(!m1.hasMarkup(markup),
            'head marker has no markup');
  assert.ok(m2.hasMarkup(markup),
            'tail marker has markup');
});

test('#deleteRange across contiguous sections', (assert) => {
  let post, s1, s2;
  Helpers.postAbstract.build(({marker, markupSection, post: buildPost}) => {
    s1 = markupSection('p', [ marker('abc') ]);
    s2 = markupSection('p', [ marker(' def') ]);
    post = buildPost([ s1, s2 ]);
  });

  renderBuiltAbstract(post);

  const range = Range.create(s1, 3, s2, 1);
  postEditor.deleteRange(range);
  postEditor.complete();

  assert.equal(post.sections.head.text, 'abcdef');
  assert.equal(post.sections.length, 1, 'only 1 section remains');
});

test('#deleteRange across entire sections', (assert) => {
  let post, s1, s2, s3;
  Helpers.postAbstract.build(({marker, markupSection, post: buildPost}) => {
    s1 = markupSection('p', [ marker('abc') ]);
    s2 = markupSection('p', [ marker('this space left blank') ]);
    s3 = markupSection('p', [ marker('def') ]);
    post = buildPost([ s1, s2, s3 ]);
  });

  renderBuiltAbstract(post);

  const range = Range.create(s1, 3, s3, 0);
  postEditor.deleteRange(range);
  postEditor.complete();

  assert.equal(post.sections.head.text, 'abcdef');
  assert.equal(post.sections.length, 1, 'only 1 section remains');
});

test('#deleteRange across all content', (assert) => {
  let post, s1, s2;
  Helpers.postAbstract.build(({marker, markupSection, post: buildPost}) => {
    s1 = markupSection('p', [ marker('abc') ]);
    s2 = markupSection('p', [ marker('def') ]);
    post = buildPost([ s1, s2 ]);
  });

  renderBuiltAbstract(post);

  const range = Range.create(s1, 0, s2, 3);
  postEditor.deleteRange(range);

  postEditor.complete();

  assert.equal(post.sections.head.text, '');
  assert.equal(post.sections.length, 1, 'only 1 section remains');
  assert.equal(post.sections.head.markers.length, 0, 'no markers remain');
});

test('#cutSection with one marker', (assert) => {
  let post, section;
  Helpers.postAbstract.build(({marker, markupSection, post: buildPost}) => {
    section = markupSection('p', [ marker('abc') ]);
    post = buildPost([ section ]);
  });

  renderBuiltAbstract(post);
  postEditor.cutSection(section, 1, 2);
  postEditor.complete();

  assert.equal(post.sections.head.text, 'ac');
  assert.equal(post.sections.length, 1, 'only 1 section remains');
  assert.equal(post.sections.head.markers.length, 1, 'markers are joined');
});

test('#cutSection at boundaries across markers', (assert) => {
  let post, section;
  Helpers.postAbstract.build(({marker, markupSection, post: buildPost}) => {
    const markers = "abcd".split('').map(l => marker(l));
    section = markupSection('p', markers);
    post = buildPost([section]);
  });

  renderBuiltAbstract(post);
  assert.equal(post.sections.head.text, 'abcd'); //precond
  assert.equal(post.sections.head.markers.length, 4); //precond
  postEditor.cutSection(section, 1, 3);
  postEditor.complete();

  assert.equal(post.sections.head.text, 'ad');
  assert.equal(post.sections.length, 1, 'only 1 section remains');
  assert.equal(post.sections.head.markers.length, 1, 'markers are joined');
});

test('#cutSection in head marker', (assert) => {
  let post, section;
  Helpers.postAbstract.build(({marker, markupSection, post: buildPost}) => {
    section = markupSection('p', [marker('a'), marker('bc')]);
    post = buildPost([ section ]);
  });

  renderBuiltAbstract(post);
  assert.equal(section.text, 'abc'); //precond
  assert.equal(section.markers.length, 2); //precond
  postEditor.cutSection(section, 2, 3);
  postEditor.complete();

  assert.equal(post.sections.head.text, 'ab');
  assert.equal(post.sections.length, 1, 'only 1 section remains');
  assert.equal(post.sections.head.markers.length, 1, 'markers are joined');
});

test('#cutSection in tail marker', (assert) => {
  let post, section;
  Helpers.postAbstract.build(({marker, markupSection, post: buildPost}) => {
    section = markupSection('p', [
      marker('a'),
      marker('bc')
    ]);
    post = buildPost([ section ]);
  });

  renderBuiltAbstract(post);

  postEditor.cutSection(section, 0, 2);

  postEditor.complete();

  assert.equal(post.sections.head.text, 'c');
  assert.equal(post.sections.length, 1, 'only 1 section remains');
  assert.equal(post.sections.head.markers.length, 1, 'two markers remain');
});

test('#splitMarkers when headMarker = tailMarker', (assert) => {
  let post, section;
  Helpers.postAbstract.build(({marker, markupSection, post: buildPost}) => {
    section = markupSection('p', [
      marker('abcd')
    ]);
    post = buildPost([ section ]);
  });

  let mockEditor = renderBuiltAbstract(post);

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

  let mockEditor = renderBuiltAbstract(post);

  const section = post.sections.head;
  const range = Range.create(section, 2, section, 5);
  const postEditor = new PostEditor(mockEditor);
  const markers = postEditor.splitMarkers(range);
  postEditor.complete();

  assert.equal(markers.length, 2, 'markers');
  assert.equal(markers[0].value, 'c', 'marker 0');
  assert.equal(markers[1].value, 'de', 'marker 1');
});

// see https://github.com/bustlelabs/content-kit-editor/issues/121
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

  renderBuiltAbstract(post);

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
  renderBuiltAbstract(post);

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
  renderBuiltAbstract(post);

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
  renderBuiltAbstract(post);

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
  renderBuiltAbstract(post);

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
  renderBuiltAbstract(post);

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
  renderBuiltAbstract(post);

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
  renderBuiltAbstract(post);

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
  renderBuiltAbstract(post);

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

test('#removeMarkup silently does nothing when invoked with an empty range', (assert) => {
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
  renderBuiltAbstract(post);

  let range = Range.create(section, 1, section, 1);
  postEditor.removeMarkupFromRange(range, markup);
  postEditor.complete();

  assert.equal(section.markers.length, 1, 'similar markers are coalesced');
  assert.equal(section.markers.head.value, 'abc', 'marker value is correct');
  assert.ok(!section.markers.head.hasMarkup(markup), 'marker has no markup');
});

test('#addMarkupToRange silently does nothing when invoked with an empty range', (assert) => {
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
  renderBuiltAbstract(post);

  let range = Range.create(section, 1, section, 1);
  postEditor.addMarkupToRange(range, markup);
  postEditor.complete();

  assert.equal(section.markers.length, 1, 'similar markers are coalesced');
  assert.equal(section.markers.head.value, 'abc', 'marker value is correct');
  assert.ok(!section.markers.head.hasMarkup(markup), 'marker has no markup');
});

test('markers with identical markups get coalesced after deletion', (assert) => {
  let strong, section;
  const post = Helpers.postAbstract.build(({post, markupSection, marker, markup}) => {
    strong = markup('strong');
    section = markupSection('p', [marker('a'), marker('b',[strong]), marker('c')]);
    return post([section]);
  });
  let mockEditor = renderBuiltAbstract(post);

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
  let mockEditor = renderBuiltAbstract(post);

  const [headSection, tailSection] = post.sections.toArray();
  const collection = post.sections;
  postEditor = new PostEditor(mockEditor);
  postEditor.moveSectionBefore(collection, tailSection, headSection);
  postEditor.complete();

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
  let mockEditor = renderBuiltAbstract(post);

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
  let mockEditor = renderBuiltAbstract(post);

  let [headSection, tailSection] = post.sections.toArray();
  postEditor = new PostEditor(mockEditor);
  postEditor.moveSectionUp(tailSection);
  postEditor.complete();

  ([headSection, tailSection] = post.sections.toArray());
  assert.equal(headSection.name, 'other-card', 'other-card moved to first spot');
  assert.equal(tailSection.name, 'listicle-card', 'listicle-card moved to last spot');

  postEditor = new PostEditor(mockEditor);
  postEditor.moveSectionUp(headSection);
  postEditor.complete();

  ([headSection, tailSection] = post.sections.toArray());
  assert.equal(headSection.name, 'other-card', 'moveSectionUp is no-op when card is at top');
});

test('moveSectionDown moves it down', (assert) => {
  const post = Helpers.postAbstract.build(({post, cardSection}) => {
    return post([
      cardSection('listicle-card'),
      cardSection('other-card')
    ]);
  });
  let mockEditor = renderBuiltAbstract(post);

  let [headSection, tailSection] = post.sections.toArray();
  postEditor = new PostEditor(mockEditor);
  postEditor.moveSectionDown(headSection);
  postEditor.complete();

  ([headSection, tailSection] = post.sections.toArray());
  assert.equal(headSection.name, 'other-card', 'other-card moved to first spot');
  assert.equal(tailSection.name, 'listicle-card', 'listicle-card moved to last spot');

  postEditor = new PostEditor(mockEditor);
  postEditor.moveSectionDown(tailSection);
  postEditor.complete();

  ([headSection, tailSection] = post.sections.toArray());
  assert.equal(tailSection.name, 'listicle-card',
               'moveSectionDown is no-op when card is at bottom');
 
});

test('#insertPost single section, insert at start', (assert) => {
  const build = Helpers.postAbstract.build;
  let post1, post2;
  build(({post, markupSection, marker}) => {
    post1 = post([markupSection('p', [marker('abc')])]);
    post2 = post([markupSection('p', [marker('def')])]);
  });

  const mockEditor = renderBuiltAbstract(post1);
  const position = new Position(post1.sections.head, 0);

  postEditor = new PostEditor(mockEditor);
  let nextPosition = postEditor.insertPost(position, post2);
  postEditor.complete();

  assert.equal(post1.sections.length, 1, '1 section');
  assert.equal(post1.sections.head.text, 'defabc', 'inserts text');

  assert.ok(nextPosition.section === post1.sections.head,
            'nextPosition.section is correct');
  assert.equal(nextPosition.offset, 3,
            'nextPosition.offset is correct');
});

test('#insertPost single section, insert at end', (assert) => {
  const build = Helpers.postAbstract.build;
  let post1, post2;
  build(({post, markupSection, marker}) => {
    post1 = post([markupSection('p', [marker('abc')])]);
    post2 = post([markupSection('p', [marker('def')])]);
  });

  const mockEditor = renderBuiltAbstract(post1);
  const position = new Position(post1.sections.head, post1.sections.head.length);

  postEditor = new PostEditor(mockEditor);
  let nextPosition = postEditor.insertPost(position, post2);
  postEditor.complete();

  assert.equal(post1.sections.length, 1, '1 section');
  assert.equal(post1.sections.head.text, 'abcdef', 'inserts text');

  assert.ok(nextPosition.section === post1.sections.head,
            'nextPosition.section is correct');
  assert.equal(nextPosition.offset, 6,
            'nextPosition.offset is correct');
});

test('#insertPost single section, insert at middle', (assert) => {
  const build = Helpers.postAbstract.build;
  let post1, post2;
  build(({post, markupSection, marker}) => {
    post1 = post([markupSection('p', [marker('abc')])]);
    post2 = post([markupSection('p', [marker('def')])]);
  });

  const mockEditor = renderBuiltAbstract(post1);
  const position = new Position(post1.sections.head, 1);

  postEditor = new PostEditor(mockEditor);
  let nextPosition = postEditor.insertPost(position, post2);
  postEditor.complete();

  assert.equal(post1.sections.length, 1, '1 section');
  assert.equal(post1.sections.head.text, 'adefbc', 'inserts text');

  assert.ok(nextPosition.section === post1.sections.head,
            'nextPosition.section is correct');
  assert.equal(nextPosition.offset, 4,
            'nextPosition.offset is correct');
});

test('#insertPost multiple sections, insert at start', (assert) => {
  const build = Helpers.postAbstract.build;
  let post1, post2;
  build(({post, markupSection, marker}) => {
    post1 = post([markupSection('p', [marker('abc')])]);
    post2 = post([
      markupSection('p', [marker('123')]),
      markupSection('p', [marker('456')])
    ]);
  });

  const mockEditor = renderBuiltAbstract(post1);
  const position = new Position(post1.sections.head, 0);

  postEditor = new PostEditor(mockEditor);
  let nextPosition = postEditor.insertPost(position, post2);
  postEditor.complete();

  assert.equal(post1.sections.length, 3, '3 sections');
  assert.equal(post1.sections.objectAt(0).text, '123',
               'inserts text in section 1');
  assert.equal(post1.sections.objectAt(1).text, '456',
               'inserts text in section 2');
  assert.equal(post1.sections.objectAt(2).text, 'abc',
               'inserts text in section 3');

  assert.ok(nextPosition.section === post1.sections.objectAt(1),
            'nextPosition section is correct');
  assert.equal(nextPosition.offset, post1.sections.objectAt(1).length,
            'nextPosition offset is correct');
});

test('#insertPost multiple sections, insert at end', (assert) => {
  const build = Helpers.postAbstract.build;
  let post1, post2;
  build(({post, markupSection, marker}) => {
    post1 = post([markupSection('p', [marker('abc')])]);
    post2 = post([
      markupSection('p', [marker('123')]),
      markupSection('p', [marker('456')])
    ]);
  });

  const mockEditor = renderBuiltAbstract(post1);
  const position = new Position(post1.sections.head, post1.sections.head.length);

  postEditor = new PostEditor(mockEditor);
  let nextPosition = postEditor.insertPost(position, post2);
  postEditor.complete();

  assert.equal(post1.sections.length, 2, '2 sections');
  assert.equal(post1.sections.head.text, 'abc123', 'inserts text in section 1');
  assert.equal(post1.sections.tail.text, '456', 'inserts text in section 2');

  assert.ok(nextPosition.section === post1.sections.tail,
            'nextPosition.section is correct');
  assert.equal(nextPosition.offset, post1.sections.tail.length,
            'nextPosition.offset is correct');
});

test('#insertPost multiple sections, insert at middle', (assert) => {
  const build = Helpers.postAbstract.build;
  let post1, post2;
  build(({post, markupSection, marker}) => {
    post1 = post([markupSection('p', [marker('abc')])]);
    post2 = post([
      markupSection('p', [marker('123')]),
      markupSection('p', [marker('456')])
    ]);
  });

  const mockEditor = renderBuiltAbstract(post1);
  const position = new Position(post1.sections.head, 1);

  postEditor = new PostEditor(mockEditor);
  let nextPosition = postEditor.insertPost(position, post2);
  postEditor.complete();

  assert.equal(post1.sections.length, 3, '3 sections');
  assert.equal(post1.sections.objectAt(0).text, 'a123',
               'inserts text in section 1');
  assert.equal(post1.sections.objectAt(1).text, '456',
               'inserts text in section 2');
  assert.equal(post1.sections.objectAt(2).text, 'bc',
               'inserts text in section 3');
  assert.ok(nextPosition.section === post1.sections.objectAt(1),
            'nextPosition.section is correct');
  assert.equal(nextPosition.offset, post1.sections.objectAt(1).length,
            'nextPosition.offset is correct');
});
