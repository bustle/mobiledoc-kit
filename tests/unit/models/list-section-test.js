import PostNodeBuilder from 'mobiledoc-kit/models/post-node-builder';
import TestHelpers from '../../test-helpers';
import { VALID_ATTRIBUTES, INVALID_ATTRIBUTES } from '../../helpers/sections';

const { module, test } = TestHelpers;

let builder;
module('Unit: List Section', {
  beforeEach() {
    builder = new PostNodeBuilder();
  },
  afterEach() {
    builder = null;
  }
});

VALID_ATTRIBUTES.forEach(attribute => {
  // eslint-disable-next-line no-loop-func
  test(`a section can have attribute "${attribute.key}" with value "${attribute.value}`, assert => {
    const attributes = {};
    attributes[attribute.key] = attribute.value;

    const s1 = builder.createListSection('ol', [], attributes);
    assert.deepEqual(
      s1.attributes,
      attributes,
      'Attribute set at instantiation'
    );
  });
});

INVALID_ATTRIBUTES.forEach(attribute => {
  // eslint-disable-next-line no-loop-func
  test(`a section throws when invalid attribute "${attribute.key}" is passed to a marker`, assert => {
    const attributes = {};
    attributes[attribute.key] = attribute.value;

    assert.throws(() => {
      builder.createListSection('ul', [], attributes);
    });
  });

  test('cloning a list section creates the same type of list section', assert => {
    let item = builder.createListItem([builder.createMarker('abc')]);
    let list = builder.createListSection('ol', [item]);
    let cloned = list.clone();

    assert.equal(list.tagName, cloned.tagName);
    assert.equal(list.items.length, cloned.items.length);
    assert.equal(list.items.head.text, cloned.items.head.text);
  });
});
