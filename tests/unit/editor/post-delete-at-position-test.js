import Helpers from '../../test-helpers';

import { DIRECTION } from 'mobiledoc-kit/utils/key';
const { FORWARD, BACKWARD } = DIRECTION;

const { module, test } = Helpers;

let { postEditor: { run } } = Helpers;
let { postAbstract: { buildFromText } } = Helpers;

module('Unit: PostEditor: #deleteAtPosition');

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
    let { post, range: { head: position } } = buildFromText(before);
    let { post: expectedPost, range: { head: expectedPosition } } = buildFromText(after);

    position = run(post, postEditor => postEditor.deleteAtPosition(position, BACKWARD));

    expectedPosition = post.sections.head.toPosition(expectedPosition.offset);

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
    let { post, range: { head: position } } = buildFromText(before);
    let { post: expectedPost, range: { head: expectedPosition } } = buildFromText(after);

    position = run(post, postEditor => postEditor.deleteAtPosition(position, FORWARD));

    expectedPosition = post.sections.head.toPosition(expectedPosition.offset);

    assert.postIsSimilar(post, expectedPost, `post ${msg}`);
    assert.positionIsEqual(position, expectedPosition, `position ${msg}`);
  });
});

test('across section boundary (backward)', (assert) => {
  let examples = [
    [['abc','|def'], 'abc|def', 'markup sections'],
    [['*abc*','|def'], '*abc*|def', 'markup sections with markup'],
    [['[abc]','|def'], ['[abc]|','def'], 'prev section is card'],
    [['abc','|[def]'], ['abc|','[def]'], 'cur section is card'],
    [['', '|abc'], ['|abc'], 'prev section is blank']
  ];

  examples.forEach(([before, after, msg]) => {
    let { post, range: { head: position } } = buildFromText(before);
    let { post: expectedPost, range: { head: expectedPosition } } = buildFromText(after);

    position = run(post, postEditor => postEditor.deleteAtPosition(position, BACKWARD));

    expectedPosition = post.sections.head.toPosition(expectedPosition.offset);

    assert.postIsSimilar(post, expectedPost, `post ${msg}`);
    assert.positionIsEqual(position, expectedPosition, `position ${msg}`);
  });
});

test('across section boundary (forward)', (assert) => {
  let examples = [
    [['abc|','def'], 'abc|def', 'markup sections'],
    [['*abc*|','def'], '*abc*|def', 'markup sections with markup'],
    [['[abc]|','def'], ['[abc]|','def'], 'cur section is card'],
    [['abc|','[def]'], ['abc|','[def]'], 'next section is card'],
    [['abc|', ''], ['abc|'], 'next section is blank']
  ];

  examples.forEach(([before, after, msg]) => {
    let { post, range: { head: position } } = buildFromText(before);
    let { post: expectedPost, range: { head: expectedPosition } } = buildFromText(after);

    position = run(post, postEditor => postEditor.deleteAtPosition(position, FORWARD));

    expectedPosition = post.sections.head.toPosition(expectedPosition.offset);

    assert.postIsSimilar(post, expectedPost, `post ${msg}`);
    assert.positionIsEqual(position, expectedPosition, `position ${msg}`);
  });
});

test('across list item boundary (backward)', (assert) => {
  let examples = [
    [['* abc','* |def'], ['* abc', '|def'], 'start of list item'],
    [['* abc','|def'], ['* abc|def'], 'into list item'],
    [['', '* |abc'], ['', '|abc'], 'prev blank section'],
  ];

  examples.forEach(([before, after, msg]) => {
    let { post, range: { head: position } } = buildFromText(before);
    let { post: expectedPost, range: { head: expectedPosition } } = buildFromText(after);

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
    expectedPosition = section.toPosition(expectedPosition.offset);

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
    let { post, range: { head: position } } = buildFromText(before);
    let { post: expectedPost, range: { head: expectedPosition } } = buildFromText(after);

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
    expectedPosition = section.toPosition(expectedPosition.offset);

    assert.postIsSimilar(post, expectedPost, `post ${msg}`);
    assert.positionIsEqual(position, expectedPosition, `position ${msg}`);
  });
});
