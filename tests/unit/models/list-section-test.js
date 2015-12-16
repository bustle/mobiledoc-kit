import PostNodeBuilder from 'mobiledoc-kit/models/post-node-builder';
import TestHelpers from '../../test-helpers';

const {module, test} = TestHelpers;

let builder;
module('Unit: List Section', {
  beforeEach() {
    builder = new PostNodeBuilder();
  },
  afterEach() {
    builder = null;
  }
});

test('cloning a list section creates the same type of list section', (assert) => {
  let item = builder.createListItem([builder.createMarker('abc')]);
  let list = builder.createListSection('ol', [item]);
  let cloned = list.clone();

  assert.equal(list.tagName, cloned.tagName);
  assert.equal(list.items.length, cloned.items.length);
  assert.equal(list.items.head.text, cloned.items.head.text);
});
