import Helpers from '../../test-helpers';
import LifecycleCallbacks from 'mobiledoc-kit/models/lifecycle-callbacks';

const {module, test} = Helpers;

module('Unit: Models: LifecycleCallbacksMixin');

test('#addCallback permanently adds the callback', (assert) => {
  let item = new LifecycleCallbacks(['test']);
  let queueName = 'test';
  let called = 0;
  let callback = () => called++;
  item.addCallback(queueName, callback);

  item.runCallbacks(queueName);
  assert.equal(called, 1);

  item.runCallbacks(queueName);
  assert.equal(called, 2, 'callback is run a second time');
});

test('#addCallback callback only runs in its queue', (assert) => {
  let item = new LifecycleCallbacks(['test', 'other']);
  let queueName = 'test';
  let called = 0;
  let callback = () => called++;
  item.addCallback(queueName, callback);

  let otherQueueName = 'other';
  item.runCallbacks(otherQueueName);

  assert.equal(called, 0);
});

test('callbacks run with arguments', (assert) => {
  let item = new LifecycleCallbacks(['test']);
  let queueName = 'test';
  let arg1, arg2;
  let foo = {}, bar = {};
  let callback = (_arg1, _arg2) => {
    arg1 = _arg1;
    arg2 = _arg2;
  };
  item.addCallback(queueName, callback);
  item.runCallbacks(queueName, [foo, bar]);

  assert.deepEqual(arg1, foo);
  assert.deepEqual(arg2, bar);
});

test('#addCallbackOnce only runs the callback one time', (assert) => {
  let item = new LifecycleCallbacks(['test']);
  let queueName = 'test';
  let called = 0;
  let callback = () => called++;
  item.addCallbackOnce(queueName, callback);

  item.runCallbacks(queueName);
  assert.equal(called, 1, 'runs once');

  item.runCallbacks(queueName);
  assert.equal(called, 1, 'does not run twice');
});

test('#addCallback and #addCallbackOnce work correctly together', (assert) => {
  let item = new LifecycleCallbacks(['test']);
  let queueName = 'test';
  let calledOnce = 0;
  let callbackOnce = () => calledOnce++;
  let called = 0;
  let callback = () => called++;

  item.addCallbackOnce(queueName, callbackOnce);
  item.addCallback(queueName, callback);

  item.runCallbacks(queueName);
  assert.equal(called, 1, 'runs callback');
  assert.equal(calledOnce, 1, 'runs one-time callback once');

  item.runCallbacks(queueName);
  assert.equal(called, 2, 'runs callback again');
  assert.equal(calledOnce, 1, 'runs one-time callback only once');
});
