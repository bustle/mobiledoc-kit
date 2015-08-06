export default class LinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
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
    }
    this.insertBefore(item, nextItem);
  }
  insertBefore(item, nextItem) {
    this.remove(item);
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
  }
  remove(item) {
    if (item.next && item.prev) {
      // Middle of the list
      item.next.prev = item.prev;
      item.prev.next = item.next;
    } else {
      if (item === this.head) {
        // Head of the list
        if (item.next) {
          item.next.prev = null;
        }
        this.head = item.next;
      }
      if (item === this.tail) {
        // Tail of the list
        if (item.prev) {
          item.prev.next = null;
        }
        this.tail = item.prev;
      }
    }
    item.prev = null;
    item.next = null;
  }
}
