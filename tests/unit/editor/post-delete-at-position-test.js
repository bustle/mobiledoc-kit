import EditorDomRenderer from 'mobiledoc-kit/renderers/editor-dom';
import RenderTree from 'mobiledoc-kit/models/render-tree';
import PostEditor from 'mobiledoc-kit/editor/post';
import Helpers from '../../test-helpers';
import PostNodeBuilder from 'mobiledoc-kit/models/post-node-builder';
import Range from 'mobiledoc-kit/utils/cursor/range';
import Position from 'mobiledoc-kit/utils/cursor/position';

import { DIRECTION } from 'mobiledoc-kit/utils/key';
const { FORWARD, BACKWARD } = DIRECTION;

const { module, test } = Helpers;

let editor, editorElement;

function renderBuiltAbstract(post, editor) {
  editor.post = post;
  let unknownCardHandler = () => {};
  let unknownAtomHandler = () => {};
  let renderer = new EditorDomRenderer(
    editor, [], [], unknownCardHandler, unknownAtomHandler);
  let renderTree = new RenderTree(post);
  renderer.render(renderTree);
  return editor;
}

let renderedRange;

class MockEditor {
  constructor(builder) {
    this.builder = builder;
    this.range = Range.blankRange();
  }
  run(callback) {
    let postEditor = new PostEditor(this);
    postEditor.begin();
    let result = callback(postEditor);
    postEditor.end();
    return result;
  }
  rerender() {}
  _postDidChange() {}
  selectRange(range) {
    renderedRange = range;
  }
  _readRangeFromDOM() {}
}

let run = (post, callback) => {
  let builder = new PostNodeBuilder();
  let editor = new MockEditor(builder);

  renderBuiltAbstract(post, editor);

  let postEditor = new PostEditor(editor);
  postEditor.begin();
  let result = callback(postEditor);
  postEditor.complete();
  return result;
};

module('Unit: PostEditor: #deleteAtPosition', {
  beforeEach() {
    renderedRange = null;
    editorElement = $('#editor')[0];
  },

  afterEach() {
    renderedRange = null;
    if (editor) {
      editor.destroy();
      editor = null;
    }
  }
});

test('single markup section (backward)', (assert) => {
  let examples = [
    ['abc|def', 'ab|def', 'middle'],
    ['abcdef|', 'abcde|', 'end'],
    ['|abcdef', '|abcdef', 'start'],

    ['ab *cd*| ef', 'ab *c*| ef', 'markup (right side)'],
    ['ab |*cd* ef', 'ab|*cd* ef', 'markup (left side)'],

    ['ab @| ef', 'ab | ef', 'atom (right side)'],
    ['ab |@ ef', 'ab|@ ef', 'atom (left side)']
  ];

  examples.forEach(([before, after, msg]) => {
    let { post, range: { head: position } } = Helpers.postAbstract.buildFromText(before);
    let { post: expectedPost, range: { head: expectedPosition } } = Helpers.postAbstract.buildFromText(after);

    position = run(post, postEditor => postEditor.deleteAtPosition(position, BACKWARD));

    expectedPosition = new Position(post.sections.head, expectedPosition.offset);

    assert.postIsSimilar(post, expectedPost, `post ${msg}`);
    assert.positionIsEqual(position, expectedPosition, `position ${msg}`);
  });
});

test('single markup section (forward)', (assert) => {
  let examples = [
    ['abc|def', 'abc|ef', 'middle'],
    ['abcdef|', 'abcdef|', 'end'],
    ['|abcdef', '|bcdef', 'start'],

    ['ab *cd*| ef', 'ab *cd*|ef', 'markup (right side)'],
    ['ab |*cd* ef', 'ab |*d* ef', 'markup (left side)'],

    ['ab @| ef', 'ab @|ef', 'atom (right side)'],
    ['ab |@ ef', 'ab | ef', 'atom (left side)']
  ];

  examples.forEach(([before, after, msg]) => {
    let { post, range: { head: position } } = Helpers.postAbstract.buildFromText(before);
    let { post: expectedPost, range: { head: expectedPosition } } = Helpers.postAbstract.buildFromText(after);

    position = run(post, postEditor => postEditor.deleteAtPosition(position, FORWARD));

    expectedPosition = new Position(post.sections.head, expectedPosition.offset);

    assert.postIsSimilar(post, expectedPost, `post ${msg}`);
    assert.positionIsEqual(position, expectedPosition, `position ${msg}`);
  });
});

test('across section boundary (backward)', (assert) => {
  let examples = [
    [['abc','|def'], 'abc|def', 'markup sections'],
    [['*abc*','|def'], '*abc*|def', 'markup sections with markup'],
    [['[abc]','|def'], ['[abc]|','def'], 'prev section is card'],
    [['abc','|[def]'], ['abc|','[def]'], 'cur section is card']
  ];

  examples.forEach(([before, after, msg]) => {
    let { post, range: { head: position } } = Helpers.postAbstract.buildFromText(before);
    let { post: expectedPost, range: { head: expectedPosition } } = Helpers.postAbstract.buildFromText(after);

    position = run(post, postEditor => postEditor.deleteAtPosition(position, BACKWARD));

    expectedPosition = new Position(post.sections.head, expectedPosition.offset);

    assert.postIsSimilar(post, expectedPost, `post ${msg}`);
    assert.positionIsEqual(position, expectedPosition, `position ${msg}`);
  });
});

test('across section boundary (forward)', (assert) => {
  let examples = [
    [['abc|','def'], 'abc|def', 'markup sections'],
    [['*abc*|','def'], '*abc*|def', 'markup sections with markup'],
    [['[abc]|','def'], ['[abc]|','def'], 'cur section is card'],
    [['abc|','[def]'], ['abc|','[def]'], 'next section is card']
  ];

  examples.forEach(([before, after, msg]) => {
    let { post, range: { head: position } } = Helpers.postAbstract.buildFromText(before);
    let { post: expectedPost, range: { head: expectedPosition } } = Helpers.postAbstract.buildFromText(after);

    position = run(post, postEditor => postEditor.deleteAtPosition(position, FORWARD));

    expectedPosition = new Position(post.sections.head, expectedPosition.offset);

    assert.postIsSimilar(post, expectedPost, `post ${msg}`);
    assert.positionIsEqual(position, expectedPosition, `position ${msg}`);
  });
});

test('across list item boundary (backward)', (assert) => {
  let examples = [
    [['* abc','* |def'], ['* abc', '|def'], 'start of list item'],
    [['* abc','|def'], ['* abc|def'], 'into list item'],
  ];

  examples.forEach(([before, after, msg]) => {
    let { post, range: { head: position } } = Helpers.postAbstract.buildFromText(before);
    let { post: expectedPost, range: { head: expectedPosition } } = Helpers.postAbstract.buildFromText(after);

    position = run(post, postEditor => postEditor.deleteAtPosition(position, BACKWARD));

    // FIXME need to figure out how to say which section to expect the range to include
    let sectionIndex;
    let index = 0;
    expectedPost.walkAllLeafSections(section => {
      if (section === expectedPosition.section) { sectionIndex = index; }
      index++;
    });

    let section;
    index = 0;
    post.walkAllLeafSections(_section => {
      if (index === sectionIndex) { section = _section; }
      index++;
    });
    expectedPosition = new Position(section, expectedPosition.offset);

    assert.postIsSimilar(post, expectedPost, `post ${msg}`);
    assert.positionIsEqual(position, expectedPosition, `position ${msg}`);
  });
});

test('across list item boundary (forward)', (assert) => {
  let examples = [
    [['* abc|','* def'], ['* abc|def'], 'item into item'],
    [['* abc|','def'], ['* abc|def'], 'item into markup'],
    [['abc|','* def'], ['abc|def'], 'markup into markup'],
  ];

  examples.forEach(([before, after, msg]) => {
    let { post, range: { head: position } } = Helpers.postAbstract.buildFromText(before);
    let { post: expectedPost, range: { head: expectedPosition } } = Helpers.postAbstract.buildFromText(after);

    position = run(post, postEditor => postEditor.deleteAtPosition(position, FORWARD));

    // FIXME need to figure out how to say which section to expect the range to include
    let sectionIndex;
    let index = 0;
    expectedPost.walkAllLeafSections(section => {
      if (section === expectedPosition.section) { sectionIndex = index; }
      index++;
    });

    let section;
    index = 0;
    post.walkAllLeafSections(_section => {
      if (index === sectionIndex) { section = _section; }
      index++;
    });
    expectedPosition = new Position(section, expectedPosition.offset);

    assert.postIsSimilar(post, expectedPost, `post ${msg}`);
    assert.positionIsEqual(position, expectedPosition, `position ${msg}`);
  });
});
