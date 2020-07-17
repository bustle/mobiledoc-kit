import assert from '../utils/assert'

interface Queue {
  [name: string]: LifecycleCallback[]
}

export type LifecycleCallback = (...args: any[]) => void

export default class LifecycleCallbacks {
  callbackQueues: Queue = {}
  removalQueues: Queue = {}

  constructor(queueNames = []) {
    queueNames.forEach(name => {
      this.callbackQueues[name] = []
      this.removalQueues[name] = []
    })
  }

  runCallbacks(queueName: string, args: unknown[] = []) {
    let queue = this._getQueue(queueName)
    queue.forEach(cb => cb(...args))

    let toRemove = this.removalQueues[queueName]
    toRemove.forEach(cb => {
      let index = queue.indexOf(cb)
      if (index !== -1) {
        queue.splice(index, 1)
      }
    })

    this.removalQueues[queueName] = []
  }

  addCallback(queueName: string, callback: LifecycleCallback) {
    this._getQueue(queueName).push(callback)
  }

  _scheduleCallbackForRemoval(queueName: string, callback: LifecycleCallback) {
    this.removalQueues[queueName].push(callback)
  }

  addCallbackOnce(queueName: string, callback: LifecycleCallback) {
    let queue = this._getQueue(queueName)
    if (queue.indexOf(callback) === -1) {
      queue.push(callback)
      this._scheduleCallbackForRemoval(queueName, callback)
    }
  }

  _getQueue(queueName: string) {
    let queue = this.callbackQueues[queueName]
    assert(`No queue found for "${queueName}"`, !!queue)
    return queue
  }
}
