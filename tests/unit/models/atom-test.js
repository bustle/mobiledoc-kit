import Helpers from '../../test-helpers';
const {module, test} = Helpers;

import PostNodeBuilder from 'mobiledoc-kit/models/post-node-builder';

let builder;
module('Unit: Atom', {
  beforeEach() {
    builder = new PostNodeBuilder();
  },
  afterEach() {
    builder = null;
  }
});

test('can create an atom with value and payload', (assert) => {
  let payload = {};
  let value = 'atom-value';
  let name = 'atom-name';
  let atom = builder.createAtom(name, value, payload);
  assert.ok(!!atom, 'creates atom');
  assert.ok(atom.name === name, 'has name');
  assert.ok(atom.value === value, 'has value');
  assert.ok(atom.payload === payload, 'has payload');
  assert.ok(atom.length === 1, 'has length of 1');
});
