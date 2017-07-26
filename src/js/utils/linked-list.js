import assert from './assert';

const PARENT_PROP = '__parent';

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
    item[PARENT_PROP]= this;
    this.length++;
    if (this._adoptItem) { this._adoptItem(item); }
  }
  freeItem(item) {
    item[PARENT_PROP] = null;
    this.length--;
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
    let nextItem = prevItem ? prevItem.next : this.head;
    this.insertBefore(item, nextItem);
  }
  _ensureItemIsNotAlreadyInList(item){
    assert(
      'Cannot insert an item into a list if it is already in a list',
      !item.next && !item.prev && this.head !== item
    );
  }
  insertBefore(item, nextItem) {
    this._ensureItemIsNotInList(item);
    this.adoptItem(item);

    let insertPos;
    if (nextItem && nextItem.prev) {
      insertPos = 'middle';
    } else if (nextItem) {
      insertPos = 'start';
    } else {
      insertPos = 'end';
    }

    switch (insertPos) {
      case 'start':
        if (this.head) {
          item.next      = this.head;
          this.head.prev = item;
        }
        this.head = item;

        break;
      case 'middle': {
        let prevItem  = nextItem.prev;
        item.next     = nextItem;
        item.prev     = prevItem;
        nextItem.prev = item;
        prevItem.next = item;

        break;
      }
      case 'end': {
        let tail = this.tail;
        item.prev = tail;

        if (tail) {
          tail.next = item;
        } else {
          this.head = item;
        }
        this.tail = item;

        break;
      }
    }
  }
  remove(item) {
    if (!item[PARENT_PROP]) {
      return;
    }
    this._ensureItemIsInThisList(item);
    this.freeItem(item);

    let [prev, next] = [item.prev, item.next];
    item.prev = null;
    item.next = null;

    if (prev) {
      prev.next = next;
    } else {
      this.head = next;
    }

    if (next) {
      next.prev = prev;
    } else {
      this.tail = prev;
    }
  }
  forEach(callback) {
    let item = this.head;
    let index = 0;
    while (item) {
      callback(item, index++);
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
  detect(callback, item=this.head, reverse=false) {
    while (item) {
      if (callback(item)) {
        return item;
      }
      item = reverse ? item.prev : item.next;
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
  _ensureItemIsNotInList(item) {
    assert('Cannot insert an item into a list if it is already in a list',
           !item[PARENT_PROP]);
  }
  _ensureItemIsInThisList(item) {
    assert('Cannot remove item that is in another list',
           item[PARENT_PROP] === this);
  }
}
