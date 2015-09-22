import { forEach } from './array-utils';

export default class LifecycleCallbacksMixin {
  get callbackQueues() {
    if (!this._callbackQueues) { this._callbackQueues = {}; }
    return this._callbackQueues;
  }
  runCallbacks(queueName, args=[]) {
    if (!queueName) { throw new Error('Must pass queue name to runCallbacks'); }
    const callbacks = this.callbackQueues[queueName] || [];
    forEach(callbacks, cb => cb(...args));
  }
  addCallback(queueName, callback) {
    if (!queueName) { throw new Error('Must pass queue name to addCallback'); }
    if (!this.callbackQueues[queueName]) {
      this.callbackQueues[queueName] = [];
    }
    this.callbackQueues[queueName].push(callback);
  }
}
