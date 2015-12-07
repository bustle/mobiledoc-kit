import EditorDomRenderer from 'mobiledoc-kit/renderers/editor-dom';
import RenderTree from 'mobiledoc-kit/models/render-tree';
import PostEditor from 'mobiledoc-kit/editor/post';
import { Editor } from 'mobiledoc-kit';
import Helpers from '../../test-helpers';
import { DIRECTION } from 'mobiledoc-kit/utils/key';
import PostNodeBuilder from 'mobiledoc-kit/models/post-node-builder';
import Range from 'mobiledoc-kit/utils/cursor/range';
import Position from 'mobiledoc-kit/utils/cursor/position';

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

let renderedRange;
function buildEditorWithMobiledoc(builderFn) {
  let mobiledoc = Helpers.mobiledoc.build(builderFn);
  let unknownCardHandler = () => {};
  editor = new Editor({mobiledoc, unknownCardHandler});
  editor.render(editorElement);
  editor.renderRange = function() {
    renderedRange = this.range;
  };
  return editor;
}

module('Unit: PostEditor with mobiledoc', {
  beforeEach() {
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


let selectedRange;
module('Unit: PostEditor', {
  beforeEach() {
    editorElement = $('#editor')[0];
    builder = new PostNodeBuilder();
    mockEditor = {
      rerender() {},
      didUpdate() {},
      renderRange() {
        selectedRange = this.range;
      },
      builder
    };
    postEditor = new PostEditor(mockEditor);
  },

  afterEach() {
    selectedRange = null;
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

test('#deleteRange when range head and tail is same card section', (assert) => {
  let post = Helpers.postAbstract.build(({cardSection, post}) => {
    return post([
      cardSection('my-card')
    ]);
  });

  renderBuiltAbstract(post);

  const range = Range.create(post.sections.head, 0, post.sections.tail, 1);
  let position = postEditor.deleteRange(range);

  postEditor.complete();

  assert.equal(post.sections.length, 1, 'only 1 section');
  assert.ok(!post.sections.head.isCardSection, 'not card section');
  assert.ok(position.section === post.sections.head, 'correct position section');
  assert.equal(position.offset, 0, 'correct position offset');
});

test('#deleteRange when range head and tail are diff card sections', (assert) => {
  let post = Helpers.postAbstract.build(({cardSection, post}) => {
    return post([
      cardSection('my-card'),
      cardSection('my-card')
    ]);
  });

  renderBuiltAbstract(post);

  const range = Range.create(post.sections.head, 0, post.sections.tail, 1);
  let position = postEditor.deleteRange(range);

  postEditor.complete();

  assert.equal(post.sections.length, 1, 'only 1 section');
  assert.ok(!post.sections.head.isCardSection, 'not card section');
  assert.ok(position.section === post.sections.head, 'correct position section');
  assert.equal(position.offset, 0, 'correct position offset');
});

test('#deleteRange when range head is card section', (assert) => {
  let post = Helpers.postAbstract.build(({cardSection, marker, markupSection, post}) => {
    return post([
      cardSection('my-card'),
      markupSection('p', [marker('abc')])
    ]);
  });

  renderBuiltAbstract(post);

  const range = Range.create(post.sections.head, 0, post.sections.tail, 1);
  let position = postEditor.deleteRange(range);

  postEditor.complete();

  assert.equal(post.sections.length, 1, 'only 1 section');
  assert.ok(!post.sections.head.isCardSection, 'not card section');
  assert.ok(position.section === post.sections.head, 'correct position section');
  assert.equal(position.offset, 0, 'correct position offset');
  assert.equal(position.section.text, 'bc', 'correct text in section');
});

test('#deleteRange when range tail is start of card section', (assert) => {
  let post = Helpers.postAbstract.build(({marker, markupSection, cardSection, post}) => {
    return post([
      markupSection('p', [marker('abc')]),
      cardSection('my-card')
    ]);
  });

  renderBuiltAbstract(post);

  const range = Range.create(post.sections.head, 1, post.sections.tail, 0);
  let position = postEditor.deleteRange(range);

  postEditor.complete();

  assert.equal(post.sections.length, 2, '2 sections remain');
  assert.ok(!post.sections.head.isCardSection, 'not card section');
  assert.equal(post.sections.head.text, 'a', 'correct text in markup section');
  assert.ok(post.sections.tail.isCardSection, 'tail is card section');

  assert.ok(position.section === post.sections.head, 'correct position section');
  assert.equal(position.offset, 1, 'correct position offset');
});

test('#deleteRange when range tail is end of card section', (assert) => {
  let post = Helpers.postAbstract.build(({marker, markupSection, cardSection, post}) => {
    return post([
      markupSection('p', [marker('abc')]),
      cardSection('my-card')
    ]);
  });

  renderBuiltAbstract(post);

  const range = Range.create(post.sections.head, 1, post.sections.tail, 1);
  let position = postEditor.deleteRange(range);

  postEditor.complete();

  assert.equal(post.sections.length, 1, '1 section remains');
  assert.ok(!post.sections.head.isCardSection, 'not card section');
  assert.equal(post.sections.head.text, 'a', 'correct text in markup section');

  assert.ok(position.section === post.sections.head, 'correct position section');
  assert.equal(position.offset, 1, 'correct position offset');
});

test('#deleteRange when range head is end of card section', (assert) => {
  let post = Helpers.postAbstract.build(({marker, markupSection, cardSection, post}) => {
    return post([
      cardSection('my-card'),
      markupSection('p', [marker('abc')])
    ]);
  });

  renderBuiltAbstract(post);

  const range = Range.create(post.sections.head, 1, post.sections.tail, 1);
  let position = postEditor.deleteRange(range);

  postEditor.complete();

  assert.equal(post.sections.length, 2, '2 sections remain');
  assert.ok(post.sections.head.isCardSection, 'head is card section');
  assert.ok(!post.sections.tail.isCardSection, 'tail is not card section');
  assert.equal(post.sections.tail.text, 'bc', 'correct text in markup section');

  assert.ok(position.section === post.sections.head, 'correct position section');
  assert.equal(position.offset, 1, 'correct position offset');
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

// see https://github.com/bustlelabs/mobiledoc-kit/issues/121
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
  let mockEditor = renderBuiltAbstract(post);

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

test('#toggleSection changes single section to and from tag name', (assert) => {
  let post = Helpers.postAbstract.build(({post, markupSection}) => {
    return post([markupSection('p')]);
  });

  const mockEditor = renderBuiltAbstract(post);
  const range = Range.create(post.sections.head, 0);

  postEditor = new PostEditor(mockEditor);
  postEditor.toggleSection('blockquote', range);
  postEditor.complete();

  assert.equal(post.sections.head.tagName, 'blockquote');

  postEditor = new PostEditor(mockEditor);
  postEditor.toggleSection('blockquote', range);
  postEditor.complete();

  assert.equal(post.sections.head.tagName, 'p');
  assert.ok(selectedRange.head.section === post.sections.head, 'selected head correct');
  assert.equal(selectedRange.head.offset, 0);
});

test('#toggleSection changes multiples sections to and from tag name', (assert) => {
  let post = Helpers.postAbstract.build(({post, markupSection, marker}) => {
    return post([
      markupSection('p', [marker('abc')]),
      markupSection('p', [marker('123')])
    ]);
  });

  const mockEditor = renderBuiltAbstract(post);
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

  assert.ok(selectedRange.head.section === post.sections.head, 'selected head correct');
  assert.equal(selectedRange.head.offset, 0);
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

  const mockEditor = renderBuiltAbstract(post);
  const range = Range.create(post.sections.head, 0,
                             post.sections.tail, 2);

  postEditor = new PostEditor(mockEditor);
  postEditor.toggleSection('blockquote', range);
  postEditor.complete();

  assert.equal(post.sections.head.tagName, 'blockquote');
  assert.ok(post.sections.objectAt(1).isCardSection);
  assert.equal(post.sections.tail.tagName, 'blockquote');

  assert.ok(selectedRange.head.section === post.sections.head, 'selected head correct');
  assert.equal(selectedRange.head.offset, 0);
});

test('#toggleSection toggle single p -> list item', (assert) => {
  let post = Helpers.postAbstract.build(
    ({post, markupSection, marker, markup}) => {
    return post([
      markupSection('p', [marker('a'), marker('b', [markup('b')]), marker('c')])
    ]);
  });

  let mockEditor = renderBuiltAbstract(post);
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

  let mockEditor = renderBuiltAbstract(post);
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

  assert.ok(selectedRange.head.section === post.sections.head, 'selected head correct');
  assert.equal(selectedRange.head.offset, 0);
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

  range = Range.create(listSection.items.head, 0, listSection.items.tail, 0);
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
  let mockEditor = renderBuiltAbstract(post);
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

  assert.ok(selectedRange.head.section === post.sections.head, 'selected head correct');
  assert.equal(selectedRange.head.offset, 0);
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
  let mockEditor = renderBuiltAbstract(post);
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
  assert.ok(selectedRange.head.section === section, 'selected head correct');
  assert.equal(selectedRange.head.offset, 0);

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
  let mockEditor = renderBuiltAbstract(post);
  let range = Range.create(post.sections.head.items.objectAt(1), 0,
                           post.sections.head.items.tail, 0);

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

  assert.ok(selectedRange.head.section === post.sections.objectAt(1), 'selected head correct');
  assert.equal(selectedRange.head.offset, 0);
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
  let mockEditor = renderBuiltAbstract(post);
  let range = Range.create(post.sections.head.items.head, 0,
                           post.sections.head.items.objectAt(1), 0);

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

  assert.ok(selectedRange.head.section === post.sections.head, 'selected head correct');
  assert.equal(selectedRange.head.offset, 0);
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
                           post.sections.tail, 0);

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
  let mockEditor = renderBuiltAbstract(post);
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

  assert.ok(selectedRange.head.section === post.sections.tail, 'selected head correct');
  assert.equal(selectedRange.head.offset, 0);
});

test('#toggleSection toggle list item to different type of list item', (assert) => {
  let post = Helpers.postAbstract.build(
    ({post, listSection, listItem, marker}) => {
    return post([listSection('ul', [listItem([marker('abc')])])]);
  });

  let range = Range.create(post.sections.head.items.head, 0);

  let mockEditor = renderBuiltAbstract(post);
  postEditor = new PostEditor(mockEditor);
  postEditor.toggleSection('ol', range);
  postEditor.complete();

  assert.equal(post.sections.length, 1, '1 section');
  assert.ok(post.sections.head.isListSection, 'section is list');
  assert.equal(post.sections.head.tagName, 'ol', 'section is ol list');
  assert.equal(post.sections.head.items.length, 1, '1 item');
  assert.equal(post.sections.head.items.head.text, 'abc');

  assert.ok(selectedRange.head.section === post.sections.head.items.head, 'selected head correct');
  assert.equal(selectedRange.head.offset, 0);
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

  let mockEditor = renderBuiltAbstract(post);
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

  assert.ok(selectedRange.head.section === post.sections.tail.items.head, 'selected head correct');
  assert.equal(selectedRange.head.offset, 0);
});

test('#toggleSection toggle when cursor on card section is no-op', (assert) => {
  let post = Helpers.postAbstract.build(
    ({post, cardSection}) => {
    return post([cardSection('my-card')]);
  });

  let range = Range.create(post.sections.head, 0);

  let mockEditor = renderBuiltAbstract(post);
  postEditor = new PostEditor(mockEditor);
  postEditor.toggleSection('ol', range);
  postEditor.complete();

  assert.equal(post.sections.length, 1, '1 section');
  assert.ok(post.sections.head.isCardSection, 'still card section');

  assert.ok(!selectedRange, 'cursor position not changed');
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
  let position = new Position(editor.post.sections.head, 'abc'.length);
  postEditor = new PostEditor(editor);
  postEditor.insertMarkers(position, toInsert);
  postEditor.complete();

  assert.postIsSimilar(editor.post, expected);
  assert.renderTreeIsEqual(editor._renderTree, expected);
  assert.positionIsEqual(
    renderedRange.head,
    new Position(editor.post.sections.head, 'abc123456'.length)
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
    renderedRange.head,
    new Position(editor.post.sections.head, '123456'.length)
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
    renderedRange.head,
    new Position(editor.post.sections.head, '123456'.length)
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
    renderedRange.head,
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
  let position = new Position(item, 'abcbo'.length);
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
