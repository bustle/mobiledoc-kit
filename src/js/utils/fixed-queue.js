export default class FixedQueue {
  constructor(length=0) {
    this._maxLength = length;
    this._items = [];
  }

  get length() {
    return this._items.length;
  }

  pop() {
    return this._items.pop();
  }

  push(item) {
    this._items.push(item);
    if (this.length > this._maxLength) {
      this._items.shift();
    }
  }

  clear() {
    this._items = [];
  }

  toArray() {
    return this._items;
  }
}
