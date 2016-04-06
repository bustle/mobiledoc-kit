import assert from './assert';

export default class LifecycleCallbacksMixin {
  get callbackQueues() {
    this._callbackQueues = this._callbackQueues || {};
    return this._callbackQueues;
  }
  runCallbacks(queueName, args=[]) {
    this._callbacksForRemoval = [];
    let queue = this._getQueue(queueName);
    queue.forEach(cb => cb(...args));

    let toRemove = this._removalQueues[queueName] || [];
    toRemove.forEach(cb => {
      let index = queue.indexOf(cb);
      if (index !== -1) {
        queue.splice(index, 1);
      }
    });

    this._removalQueues[queueName] = [];
  }
  addCallback(queueName, callback) {
    this._getQueue(queueName).push(callback);
  }
  _scheduleCallbackForRemoval(queueName, callback) {
    if (!this._removalQueues[queueName]) {
      this._removalQueues[queueName] = [];
    }
    this._removalQueues[queueName].push(callback);
  }
  get _removalQueues() {
    if (!this.__removalQueues) {
      this.__removalQueues = {};
    }
    return this.__removalQueues;
  }
  addCallbackOnce(queueName, callback) {
    let queue = this._getQueue(queueName);
    if (queue.indexOf(callback) === -1) {
      queue.push(callback);
      this._scheduleCallbackForRemoval(queueName, callback);
    }
  }
  _getQueue(queueName) {
    assert('Must pass queue name to runCallbacks', !!queueName);
    this.callbackQueues[queueName] = this.callbackQueues[queueName] || [];
    return this.callbackQueues[queueName];
  }
}
