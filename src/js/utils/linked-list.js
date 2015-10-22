export default class LinkedList {
  constructor(options) {
    this.head = null;
    this.tail = null;
    this.length = 0;

    if (options) {
      const {adoptItem, freeItem} = options;
      this._adoptItem = adoptItem;
      this._freeItem = freeItem;
    }
  }
  adoptItem(item) {
    if (this._adoptItem) { this._adoptItem(item); }
  }
  freeItem(item) {
    if (this._freeItem) { this._freeItem(item); }
  }
  get isEmpty() {
    return this.length === 0;
  }
  prepend(item) {
    this.insertBefore(item, this.head);
  }
  append(item) {
    this.insertBefore(item, null);
  }
  insertAfter(item, prevItem) {
    let nextItem = null;
    if (prevItem) {
      nextItem = prevItem.next;
    } else {
      nextItem = this.head;
    }
    this.insertBefore(item, nextItem);
  }
  insertBefore(item, nextItem) {
    if (item.next || item.prev || this.head === item) {
      throw new Error('Cannot insert an item into a list if it is already in a list');
    }
    this.adoptItem(item);

    if (nextItem && nextItem.prev) {
      // middle of the items
      let prevItem = nextItem.prev;
      item.next = nextItem;
      nextItem.prev = item;
      item.prev = prevItem;
      prevItem.next = item;
    } else if (nextItem) {
      // first item
      if (this.head === nextItem) {
        item.next = nextItem;
        nextItem.prev = item;
      } else {
        this.tail = item;
      }
      this.head = item;
    } else {
      // last item
      if (this.tail) {
        item.prev = this.tail;
        this.tail.next = item;
      }
      if (!this.head) {
        this.head = item;
      }
      this.tail = item;
    }
    this.length++;
  }
  remove(item) {
    this.freeItem(item);

    let didRemove = false;
    if (item.next && item.prev) {
      // Middle of the list
      item.next.prev = item.prev;
      item.prev.next = item.next;
      didRemove = true;
    } else {
      if (item === this.head) {
        // Head of the list
        if (item.next) {
          item.next.prev = null;
        }
        this.head = item.next;
        didRemove = true;
      }
      if (item === this.tail) {
        // Tail of the list
        if (item.prev) {
          item.prev.next = null;
        }
        this.tail = item.prev;
        didRemove = true;
      }
    }
    if (didRemove) {
      this.length--;
    }
    item.prev = null;
    item.next = null;
  }
  forEach(callback) {
    let item = this.head;
    let index = 0;
    while (item) {
      callback(item, index);
      index++;
      item = item.next;
    }
  }
  map(callback) {
    let result = [];
    this.forEach(i => result.push(callback(i)));
    return result;
  }
  walk(startItem, endItem, callback) {
    let item = startItem || this.head;
    while (item) {
      callback(item);
      if (item === endItem) {
        break;
      }
      item = item.next;
    }
  }
  readRange(startItem, endItem) {
    let items = [];
    this.walk(startItem, endItem, (item) => {
      items.push(item);
    });
    return items;
  }
  toArray() {
    return this.readRange();
  }
  detect(callback, item=this.head) {
    while (item) {
      if (callback(item)) {
        return item;
      }
      item = item.next;
    }
  }
  any(callback) {
    return !!this.detect(callback);
  }
  every(callback) {
    let item = this.head;
    while (item) {
      if (!callback(item)) {
        return false;
      }
      item = item.next;
    }
    return true;
  }
  objectAt(targetIndex) {
    let index = -1;
    return this.detect(() => {
      index++;
      return (targetIndex === index);
    });
  }
  splice(targetItem, removalCount, newItems) {
    let item = targetItem;
    let nextItem = item.next;
    let count = 0;
    while (item && count < removalCount) {
      count++;
      nextItem = item.next;
      this.remove(item);
      item = nextItem;
    }
    newItems.forEach((newItem) => {
      this.insertBefore(newItem, nextItem);
    });
  }
  removeBy(conditionFn) {
    let item = this.head;
    while (item) {
      let nextItem = item.next;

      if (conditionFn(item)) {
        this.remove(item);
      }

      item = nextItem;
    }
  }
}
