export default class Set<T> {
  items: T[]

  constructor(items = []) {
    this.items = []
    items.forEach(i => this.add(i))
  }

  add(item: T) {
    if (!this.has(item)) {
      this.items.push(item)
    }
  }

  get length() {
    return this.items.length
  }

  has(item: T) {
    return this.items.indexOf(item) !== -1
  }

  toArray() {
    return this.items
  }
}
