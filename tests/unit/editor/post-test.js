import EditorDomRenderer from 'content-kit-editor/renderers/editor-dom';
import RenderTree from 'content-kit-editor/models/render-tree';
import PostEditor from 'content-kit-editor/editor/post';
import { Editor } from 'content-kit-editor';
import Helpers from '../../test-helpers';
import { DIRECTION } from 'content-kit-editor/utils/key';
import PostNodeBuilder from 'content-kit-editor/models/post-node-builder';
import {Position, Range} from 'content-kit-editor/utils/cursor';

const { FORWARD } = DIRECTION;

const { module, test } = window.QUnit;

let editor, editorElement;

let builder, postEditor, mockEditor;

function makeRange(headSection, headOffset, tailSection, tailOffset) {
  return new Range(
    new Position(headSection, headOffset),
    new Position(tailSection, tailOffset)
  );
}

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

function prepareRenderTree(post) {
  let renderTree = new RenderTree();
  let node = renderTree.buildRenderNode(post);
  renderTree.node = node;
  return renderTree;
}

function renderBuiltAbstract(post) {
  mockEditor.post = post;
  let renderer = new EditorDomRenderer(mockEditor, [], () => {}, {});
  let renderTree = prepareRenderTree(post);
  renderer.render(renderTree);
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

  const nextPosition = postEditor.deleteFrom({section: getSection(0), offset:4});
  postEditor.complete();

  assert.equal(getMarker(0, 0).value, 'abcdef');
  assert.deepEqual(nextPosition, {currentSection: getSection(0), currentOffset: 3});
});


test('#deleteFrom (forward) in middle of marker deletes char after offset', (assert) => {
  const postEditor = postEditorWithMobiledoc(({post, markupSection, marker}) =>
    post([
      markupSection('p', [marker('abc def')])
    ])
  );

  const nextPosition = postEditor.deleteFrom({section: getSection(0), offset:3}, FORWARD);
  postEditor.complete();

  assert.equal(getMarker(0, 0).value, 'abcdef');
  assert.deepEqual(nextPosition, {currentSection: getSection(0), currentOffset: 3});
});

test('#deleteFrom offset 0 joins section with previous if first marker', (assert) => {
  const postEditor = postEditorWithMobiledoc(({post, markupSection, marker}) =>
    post([
      markupSection('P', [marker('abc')]),
      markupSection('P', [marker('def')])
    ])
  );

  const nextPosition = postEditor.deleteFrom({section: getSection(1), offset:0});
  postEditor.complete();

  assert.equal(editor.post.sections.length, 1,
               'sections joined');
  assert.equal(getSection(0).markers.length, 2,
               'joined section has 2 markers');

  let newMarkers = getSection(0).markers.toArray();
  let newValues = newMarkers.map(m => m.value);

  assert.deepEqual(newValues, ['abc','def'], 'new markers have correct values');

  assert.deepEqual(nextPosition,
                   {currentSection: getSection(0), currentOffset: newValues[0].length});
});

test('#deleteFrom (FORWARD) end of marker joins section with next if last marker', (assert) => {
  const postEditor = postEditorWithMobiledoc(({post, markupSection, marker}) =>
    post([
      markupSection('P', [marker('abc')]),
      markupSection('P', [marker('def')])
    ])
  );

  let section = getSection(0);
  const nextPosition = postEditor.deleteFrom({section, offset: 3},
                                             FORWARD);
  postEditor.complete();

  assert.equal(editor.post.sections.length, 1,
               'sections joined');
  assert.equal(getSection(0).markers.length, 2,
               'joined section has 2 markers');

  let newMarkers = getSection(0).markers.toArray();
  let newValues = newMarkers.map(m => m.value);

  assert.deepEqual(newValues, ['abc','def'], 'new markers have correct values');

  assert.deepEqual(nextPosition,
                   {currentSection: getSection(0), currentOffset: newValues[0].length});
});

test('#deleteFrom offset 0 deletes last character of previous marker when there is one', (assert) => {
  const postEditor = postEditorWithMobiledoc(({post, markupSection, marker}) =>
    post([
      markupSection('P', [marker('abc'), marker('def')])
    ])
  );

  const nextPosition = postEditor.deleteFrom({section: getSection(0), offset:3});
  postEditor.complete();

  let markers = getSection(0).markers.toArray();
  let values = markers.map(m => m.value);

  assert.deepEqual(values, ['ab', 'def'], 'markers have correct values');

  assert.deepEqual(nextPosition,
                   {currentSection: getSection(0), currentOffset: values[0].length});
});

test('#deleteFrom (FORWARD) end of marker deletes first character of next marker when there is one', (assert) => {
  const postEditor = postEditorWithMobiledoc(({post, markupSection, marker}) =>
    post([
      markupSection('P', [marker('abc'), marker('def')])
    ])
  );

  let section = getSection(0);
  const nextPosition = postEditor.deleteFrom({section, offset: 3},
                                            FORWARD);
  postEditor.complete();

  let markers = getSection(0).markers.toArray();
  let values = markers.map(m => m.value);

  assert.deepEqual(values, ['abc', 'ef'], 'markers have correct values');

  assert.deepEqual(nextPosition,
                   {currentSection: getSection(0), currentOffset: values[0].length});
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

  const range = makeRange(section, 3, section, 4);

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

  const range = makeRange(section, 3, section, 4);
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

  const range = makeRange(section, 3, section, 4);
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

  const range = makeRange(s1, 3, s2, 1);
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

  const range = makeRange(s1, 3, s3, 0);
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

  const range = makeRange(s1, 0, s2, 3);
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
  assert.equal(post.sections.head.markers.length, 2, 'two markers remain');
});

test('#cutSection at bounderies across markers', (assert) => {
  let post, section;
  Helpers.postAbstract.build(({marker, markupSection, post: buildPost}) => {
    section = markupSection('p', [
      marker('a'),
      marker('b'),
      marker('c'),
      marker('d')
    ]);
    post = buildPost([ section ]);
  });

  renderBuiltAbstract(post);

  postEditor.cutSection(section, 1, 3);

  postEditor.complete();

  assert.equal(post.sections.head.text, 'ad');
  assert.equal(post.sections.length, 1, 'only 1 section remains');
  assert.equal(post.sections.head.markers.length, 2, 'two markers remain');
});

test('#cutSection in head marker', (assert) => {
  let post, section;
  Helpers.postAbstract.build(({marker, markupSection, post: buildPost}) => {
    section = markupSection('p', [
      marker('a'),
      marker('bc')
    ]);
    post = buildPost([ section ]);
  });

  renderBuiltAbstract(post);

  postEditor.cutSection(section, 2, 3);

  postEditor.complete();

  assert.equal(post.sections.head.text, 'ab');
  assert.equal(post.sections.length, 1, 'only 1 section remains');
  assert.equal(post.sections.head.markers.length, 2, 'two markers remain');
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
