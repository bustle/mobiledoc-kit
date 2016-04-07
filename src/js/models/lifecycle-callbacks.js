import assert from 'mobiledoc-kit/utils/assert';

export default class LifecycleCallbacks {
  constructor(queueNames=[]) {
    this.callbackQueues = {};
    this.removalQueues = {};

    queueNames.forEach(name => {
      this.callbackQueues[name] = [];
      this.removalQueues[name] = [];
    });
  }

  runCallbacks(queueName, args=[]) {
    let queue = this._getQueue(queueName);
    queue.forEach(cb => cb(...args));

    let toRemove = this.removalQueues[queueName];
    toRemove.forEach(cb => {
      let index = queue.indexOf(cb);
      if (index !== -1) {
        queue.splice(index, 1);
      }
    });

    this.removalQueues[queueName] = [];
  }

  addCallback(queueName, callback) {
    this._getQueue(queueName).push(callback);
  }

  _scheduleCallbackForRemoval(queueName, callback) {
    this.removalQueues[queueName].push(callback);
  }

  addCallbackOnce(queueName, callback) {
    let queue = this._getQueue(queueName);
    if (queue.indexOf(callback) === -1) {
      queue.push(callback);
      this._scheduleCallbackForRemoval(queueName, callback);
    }
  }

  _getQueue(queueName) {
    let queue = this.callbackQueues[queueName];
    assert(`No queue found for "${queueName}"`, !!queue);
    return queue;
  }
}
