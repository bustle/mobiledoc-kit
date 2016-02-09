import Helpers from '../../test-helpers';
import FixedQueue from 'mobiledoc-kit/utils/fixed-queue';

const {module, test} = Helpers;

module('Unit: Utils: FixedQueue');

test('basic implementation', (assert) => {
  let queue = new FixedQueue(3);
  for (let i=0; i < 3; i++) {
    queue.push(i);
  }

  assert.equal(queue.length, 3);

  let popped = [];
  while (queue.length) {
    popped.push(queue.pop());
  }

  assert.deepEqual(popped, [2,1,0]);
});

test('empty queue', (assert) => {
  let queue = new FixedQueue(0);
  assert.equal(queue.length, 0);
  assert.equal(queue.pop(), undefined);
  queue.push(1);

  assert.equal(queue.length, 0);
  assert.deepEqual(queue.toArray(), []);
});

test('push onto full queue ejects first item', (assert) => {
  let queue = new FixedQueue(1);
  queue.push(0);
  queue.push(1);

  assert.deepEqual(queue.toArray(), [1]);
});
