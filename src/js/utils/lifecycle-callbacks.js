import assert from './assert';

export default class LifecycleCallbacksMixin {
  get callbackQueues() {
    this._callbackQueues = this._callbackQueues || {};
    return this._callbackQueues;
  }
  runCallbacks(queueName, args=[]) {
    this._getQueue(queueName).forEach(cb => cb(...args));
  }
  addCallback(queueName, callback) {
    this._getQueue(queueName).push(callback);
  }
  addCallbackOnce(queueName, callback) {
    let queue = this._getQueue(queueName);
    if (queue.indexOf(callback) === -1) {
      queue.push(callback);
    }
  }
  _getQueue(queueName) {
    assert('Must pass queue name to runCallbacks', !!queueName);
    this.callbackQueues[queueName] = this.callbackQueues[queueName] || [];
    return this.callbackQueues[queueName];
  }
}
