import Helpers from '../../test-helpers';
import { kvArrayToObject, objectToSortedKVArray } from 'mobiledoc-kit/utils/array-utils';

const {module, test} = Helpers;

module('Unit: Utils: Array Utils');

test('#objectToSortedKVArray works', (assert) => {
  assert.deepEqual(objectToSortedKVArray({a: 1, b:2}), ['a', 1, 'b', 2]);
  assert.deepEqual(objectToSortedKVArray({b: 1, a:2}), ['a', 2, 'b', 1]);
  assert.deepEqual(objectToSortedKVArray({}), []);
});

test('#kvArrayToObject works', (assert) => {
  assert.deepEqual(kvArrayToObject(['a', 1, 'b', 2]), {a:1, b:2});
  assert.deepEqual(kvArrayToObject([]), {});
});
