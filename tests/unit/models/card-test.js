import Helpers from '../../test-helpers';
const {module, test} = Helpers;

import PostNodeBuilder from 'mobiledoc-kit/models/post-node-builder';

let builder;
module('Unit: Card', {
  beforeEach() {
    builder = new PostNodeBuilder();
  },
  afterEach() {
    builder = null;
  }
});

test('can create a card with payload', (assert) => {
  const payload = {};
  const card = builder.createCardSection('card-name', payload);
  assert.ok(!!card, 'creates card');
  assert.ok(card.payload === payload, 'has payload');
});

test('cloning a card copies payload', (assert) => {
  const payload = {foo:'bar'};

  const card = builder.createCardSection('card-name', payload);
  const card2 = card.clone();

  assert.ok(card !== card2, 'card !== cloned');
  assert.ok(card.payload !== card2.payload, 'payload is copied');

  card.payload.foo = 'other foo';
  assert.equal(card2.payload.foo, 'bar', 'card2 payload not updated');
});

test('card cannot have attributes', (assert) => {
  const card = builder.createCardSection('card-name');

  assert.equal(card.attributes, undefined);
});
