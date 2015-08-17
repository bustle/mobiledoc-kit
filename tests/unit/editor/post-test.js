import PostEditor from 'content-kit-editor/editor/post';
import { Editor } from 'content-kit-editor';
import Helpers from '../../test-helpers';
import { DIRECTION } from 'content-kit-editor/utils/key';

const { FORWARD } = DIRECTION;

const { module, test } = window.QUnit;

let editor, editorElement;

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

module('Unit: PostEditor', {
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
