export default class FixedQueue<T> {
  _maxLength: number
  _items: T[]

  constructor(length = 0) {
    this._maxLength = length
    this._items = []
  }

  get length() {
    return this._items.length
  }

  pop() {
    return this._items.pop()
  }

  push(item: T) {
    this._items.push(item)
    if (this.length > this._maxLength) {
      this._items.shift()
    }
  }

  clear() {
    this._items = []
  }

  toArray() {
    return this._items
  }
}
