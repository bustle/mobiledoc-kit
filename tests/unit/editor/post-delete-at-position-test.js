import Helpers from '../../test-helpers';

import { DIRECTION } from 'mobiledoc-kit/utils/key';
const { FORWARD, BACKWARD } = DIRECTION;

const { module, test } = Helpers;

let { postEditor: { run } } = Helpers;
let { postAbstract: { buildFromText } } = Helpers;
const { editor: { retargetPosition } } = Helpers;

module('Unit: PostEditor: #deleteAtPosition');

let expectationGroups = [{
  name: 'single markup section',
  direction: BACKWARD,
  expectations: [
    ['abc|def', 'ab|def', 'middle'],
    ['abcdef|', 'abcde|', 'end'],
    ['|abcdef', '|abcdef', 'start'],

    ['ab *cd*| ef', 'ab *c*| ef', 'markup (right side)'],
    ['ab |*cd* ef', 'ab|*cd* ef', 'markup (left side)'],

    ['ab @| ef', 'ab | ef', 'atom (right side)'],
    ['ab |@ ef', 'ab|@ ef', 'atom (left side)']
  ]
}, {
  name: 'single markup section',
  direction: FORWARD,
  expectations: [
    ['abc|def', 'abc|ef', 'middle'],
    ['abcdef|', 'abcdef|', 'end'],
    ['|abcdef', '|bcdef', 'start'],

    ['ab *cd*| ef', 'ab *cd*|ef', 'markup (right side)'],
    ['ab |*cd* ef', 'ab |*d* ef', 'markup (left side)'],

    ['ab @| ef', 'ab @|ef', 'atom (right side)'],
    ['ab |@ ef', 'ab | ef', 'atom (left side)']
  ]
}, {
  name: 'across section boundary',
  direction: BACKWARD,
  expectations: [
    [['abc','|def'], 'abc|def', 'markup sections'],
    [['*abc*','|def'], '*abc*|def', 'markup sections with markup'],
    [['[abc]','|def'], ['[abc]|','def'], 'prev section is card'],
    [['abc','|[def]'], ['abc|','[def]'], 'cur section is card'],
    [['', '|abc'], ['|abc'], 'prev section is blank']
  ]
}, {
  name: 'across section boundary',
  direction: FORWARD,
  expectations: [
    [['abc|','def'], 'abc|def', 'markup sections'],
    [['*abc*|','def'], '*abc*|def', 'markup sections with markup'],
    [['[abc]|','def'], ['[abc]|','def'], 'cur section is card'],
    [['abc|','[def]'], ['abc|','[def]'], 'next section is card'],
    [['abc|', ''], ['abc|'], 'next section is blank']
  ]
}, {
  name: 'across list item boundary',
  direction: BACKWARD,
  expectations: [
    [['* abc','* |def'], ['* abc', '|def'], 'start of list item'],
    [['* abc','|def'], ['* abc|def'], 'into list item'],
    [['', '* |abc'], ['', '|abc'], 'prev blank section'],
  ]
}, {
  name: 'across list item boundary',
  direction: FORWARD,
  expectations: [
    [['* abc|','* def'], ['* abc|def'], 'item into item'],
    [['* abc|','def'], ['* abc|def'], 'item into markup'],
    [['abc|','* def'], ['abc|def'], 'markup into markup'],
  ]
}];

expectationGroups.forEach(({name, expectations, direction}) => {
  expectations.forEach(([before, after, msg]) => {
    let dir = direction === FORWARD ? 'forward' : 'backward';
    test(`${dir}: ${name}, "${before}" -> "${after}" (${msg})`, (assert) => {
      let { post, range: { head: position } } = buildFromText(before);
      let { post: expectedPost, range: { head: expectedPosition } } = buildFromText(after);

      position = run(post, postEditor => postEditor.deleteAtPosition(position, direction));
      expectedPosition = retargetPosition(expectedPosition, post);

      assert.postIsSimilar(post, expectedPost);
      assert.positionIsEqual(position, expectedPosition);
    });
  });
});
