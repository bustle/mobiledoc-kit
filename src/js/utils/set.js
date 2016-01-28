export default class Set {
  constructor(items=[]) {
    this.items = [];
    items.forEach(i => this.add(i));
  }

  add(item) {
    if (!this.has(item)) {
      this.items.push(item);
    }
  }

  get length() {
    return this.items.length;
  }

  has(item) {
    return this.items.indexOf(item) !== -1;
  }

  toArray() {
    return this.items;
  }
}
