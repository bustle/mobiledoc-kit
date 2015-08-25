import EditorDomRenderer from 'content-kit-editor/renderers/editor-dom';
import RenderTree from 'content-kit-editor/models/render-tree';
import PostEditor from 'content-kit-editor/editor/post';
import { Editor } from 'content-kit-editor';
import Helpers from '../../test-helpers';
import { DIRECTION } from 'content-kit-editor/utils/key';
import PostNodeBuilder from 'content-kit-editor/models/post-node-builder';

const { FORWARD } = DIRECTION;

const { module, test } = window.QUnit;

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
  editor = new Editor(editorElement, {mobiledoc});
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

  const nextPosition = postEditor.deleteFrom({marker: getMarker(0,0), offset:4});
  postEditor.complete();

  assert.equal(getMarker(0, 0).value, 'abcdef');
  assert.deepEqual(nextPosition, {currentMarker: getMarker(0, 0), currentOffset: 3});
});


test('#deleteFrom (forward) in middle of marker deletes char after offset', (assert) => {
  const postEditor = postEditorWithMobiledoc(({post, markupSection, marker}) =>
    post([
      markupSection('p', [marker('abc def')])
    ])
  );

  const nextPosition = postEditor.deleteFrom({marker: getMarker(0,0), offset:3}, FORWARD);
  postEditor.complete();

  assert.equal(getMarker(0, 0).value, 'abcdef');
  assert.deepEqual(nextPosition, {currentMarker: getMarker(0, 0), currentOffset: 3});
});

test('#deleteFrom offset 0 joins section with previous if first marker', (assert) => {
  const postEditor = postEditorWithMobiledoc(({post, markupSection, marker}) =>
    post([
      markupSection('P', [marker('abc')]),
      markupSection('P', [marker('def')])
    ])
  );

  const nextPosition = postEditor.deleteFrom({marker: getMarker(1,0), offset:0});
  postEditor.complete();

  assert.equal(editor.post.sections.length, 1,
               'sections joined');
  assert.equal(getSection(0).markers.length, 2,
               'joined section has 2 markers');

  let newMarkers = getSection(0).markers.toArray();
  let newValues = newMarkers.map(m => m.value);

  assert.deepEqual(newValues, ['abc','def'], 'new markers have correct values');

  assert.deepEqual(nextPosition,
                   {currentMarker: getMarker(0, 0), currentOffset: newValues[0].length});
});

test('#deleteFrom (FORWARD) end of marker joins section with next if last marker', (assert) => {
  const postEditor = postEditorWithMobiledoc(({post, markupSection, marker}) =>
    post([
      markupSection('P', [marker('abc')]),
      markupSection('P', [marker('def')])
    ])
  );

  let marker = getMarker(0,0);
  const nextPosition = postEditor.deleteFrom({marker, offset:marker.length},
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
                   {currentMarker: getMarker(0, 0), currentOffset: newValues[0].length});
});

test('#deleteFrom offset 0 deletes last character of previous marker when there is one', (assert) => {
  const postEditor = postEditorWithMobiledoc(({post, markupSection, marker}) =>
    post([
      markupSection('P', [marker('abc'), marker('def')])
    ])
  );

  const nextPosition = postEditor.deleteFrom({marker: getMarker(0, 1), offset:0});
  postEditor.complete();

  let markers = getSection(0).markers.toArray();
  let values = markers.map(m => m.value);

  assert.deepEqual(values, ['ab', 'def'], 'markers have correct values');

  assert.deepEqual(nextPosition,
                   {currentMarker: getMarker(0, 0), currentOffset: values[0].length});
});

test('#deleteFrom (FORWARD) end of marker deletes first character of next marker when there is one', (assert) => {
  const postEditor = postEditorWithMobiledoc(({post, markupSection, marker}) =>
    post([
      markupSection('P', [marker('abc'), marker('def')])
    ])
  );

  let marker = getMarker(0, 0);
  const nextPosition = postEditor.deleteFrom({marker, offset:marker.length},
                                            FORWARD);
  postEditor.complete();

  let markers = getSection(0).markers.toArray();
  let values = markers.map(m => m.value);

  assert.deepEqual(values, ['abc', 'ef'], 'markers have correct values');

  assert.deepEqual(nextPosition,
                   {currentMarker: getMarker(0, 0), currentOffset: values[0].length});
});


module('Unit: PostEditor', {
  beforeEach() {
    builder = new PostNodeBuilder();
    mockEditor = {
      rerender() {},
      didUpdate() {}
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
    return post;
  });

  renderBuiltAbstract(post);

  postEditor.deleteRange({
    headSection: section,
    headSectionOffset: 3,
    tailSection: section,
    tailSectionOffset: 4
  });

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
    return post;
  });

  renderBuiltAbstract(post);

  postEditor.deleteRange({
    headSection: section,
    headSectionOffset: 3,
    tailSection: section,
    tailSectionOffset: 4
  });

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
    return post;
  });

  renderBuiltAbstract(post);

  postEditor.deleteRange({
    headSection: section,
    headSectionOffset: 3,
    tailSection: section,
    tailSectionOffset: 4
  });

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
    return post;
  });

  renderBuiltAbstract(post);

  postEditor.deleteRange({
    headSection: s1,
    headSectionOffset: 3,
    tailSection: s2,
    tailSectionOffset: 1
  });

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
    return post;
  });

  renderBuiltAbstract(post);

  postEditor.deleteRange({
    headSection: s1,
    headSectionOffset: 3,
    tailSection: s3,
    tailSectionOffset: 0
  });

  postEditor.complete();

  assert.equal(post.sections.head.text, 'abcdef');
  assert.equal(post.sections.length, 1, 'only 1 section remains');
});
