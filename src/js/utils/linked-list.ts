import assert from './assert'
import { Maybe } from './types'

const PARENT_PROP = '__parent'

interface LinkedListOptions<T> {
  adoptItem?: AdoptItemCallback<T>
  freeItem?: FreeItemCallback<T>
}

export interface LinkedListItem<T extends LinkedListItem<T>> {
  next: T | null
  prev: T | null
}

type ItemCallback<T, U = void> = (item: T) => U
type AdoptItemCallback<T> = ItemCallback<T>
type FreeItemCallback<T> = ItemCallback<T>

export default class LinkedList<T extends LinkedListItem<T>> {
  head: T | null
  tail: T | null
  length: number

  _adoptItem?: AdoptItemCallback<T>
  _freeItem?: FreeItemCallback<T>

  constructor(options: LinkedListOptions<T>) {
    this.head = null
    this.tail = null
    this.length = 0

    if (options) {
      const { adoptItem, freeItem } = options
      this._adoptItem = adoptItem
      this._freeItem = freeItem
    }
  }

  adoptItem(item: T) {
    ;(item as any)[PARENT_PROP] = this
    this.length++
    if (this._adoptItem) {
      this._adoptItem(item)
    }
  }

  freeItem(item: T) {
    ;(item as any)[PARENT_PROP] = null
    this.length--
    if (this._freeItem) {
      this._freeItem(item)
    }
  }

  get isEmpty() {
    return this.length === 0
  }

  prepend(item: T) {
    this.insertBefore(item, this.head)
  }

  append(item: T) {
    this.insertBefore(item, null)
  }

  insertAfter(item: T, prevItem: T) {
    let nextItem = prevItem ? prevItem.next : this.head
    this.insertBefore(item, nextItem)
  }

  _ensureItemIsNotAlreadyInList(item: T) {
    assert(
      'Cannot insert an item into a list if it is already in a list',
      !item.next && !item.prev && this.head !== item
    )
  }

  insertBefore(item: T, nextItem?: T | null) {
    this._ensureItemIsNotInList(item)
    this.adoptItem(item)

    let insertPos: 'middle' | 'start' | 'end'
    if (nextItem && nextItem.prev) {
      insertPos = 'middle'
    } else if (nextItem) {
      insertPos = 'start'
    } else {
      insertPos = 'end'
    }

    switch (insertPos) {
      case 'start':
        if (this.head) {
          item.next = this.head
          this.head.prev = item
        }
        this.head = item

        break
      case 'middle': {
        let prevItem = nextItem!.prev
        item.next = nextItem!
        item.prev = prevItem
        nextItem!.prev = item
        prevItem!.next = item

        break
      }
      case 'end': {
        let tail = this.tail
        item.prev = tail

        if (tail) {
          tail.next = item
        } else {
          this.head = item
        }
        this.tail = item

        break
      }
    }
  }

  remove(item: T) {
    if (!getParent(item)) {
      return
    }
    this._ensureItemIsInThisList(item)
    this.freeItem(item)

    let [prev, next] = [item.prev, item.next]
    item.prev = null
    item.next = null

    if (prev) {
      prev.next = next
    } else {
      this.head = next
    }

    if (next) {
      next.prev = prev
    } else {
      this.tail = prev
    }
  }

  forEach(callback: (item: T, idx: number) => void) {
    let item = this.head
    let index = 0
    while (item) {
      callback(item, index++)
      item = item.next
    }
  }

  map<U>(callback: (item: T) => U): U[] {
    let result: U[] = []
    this.forEach(i => result.push(callback(i)))
    return result
  }

  walk(startItem: Maybe<T>, endItem: Maybe<T>, callback: ItemCallback<T>) {
    let item: T | null = startItem || this.head
    while (item) {
      callback(item)
      if (item === endItem) {
        break
      }
      item = item.next
    }
  }

  readRange(startItem?: Maybe<T>, endItem?: Maybe<T>) {
    let items: T[] = []
    this.walk(startItem, endItem, item => {
      items.push(item)
    })
    return items
  }

  toArray() {
    return this.readRange()
  }

  detect(callback: ItemCallback<T, boolean>, item = this.head, reverse = false) {
    while (item) {
      if (callback(item)) {
        return item
      }
      item = reverse ? item.prev : item.next
    }
  }

  any(callback: ItemCallback<T, boolean>) {
    return !!this.detect(callback)
  }

  every(callback: ItemCallback<T, boolean>) {
    let item = this.head
    while (item) {
      if (!callback(item)) {
        return false
      }
      item = item.next
    }
    return true
  }

  objectAt(targetIndex: number) {
    let index = -1
    return this.detect(() => {
      index++
      return targetIndex === index
    })
  }

  splice(targetItem: T, removalCount: number, newItems: T[]) {
    let item: T | null = targetItem
    let nextItem = item.next
    let count = 0
    while (item && count < removalCount) {
      count++
      nextItem = item.next
      this.remove(item)
      item = nextItem
    }
    newItems.forEach(newItem => {
      this.insertBefore(newItem, nextItem)
    })
  }

  removeBy(conditionFn: ItemCallback<T, boolean>) {
    let item = this.head
    while (item) {
      let nextItem = item.next

      if (conditionFn(item)) {
        this.remove(item)
      }

      item = nextItem
    }
  }

  _ensureItemIsNotInList(item: T) {
    assert('Cannot insert an item into a list if it is already in a list', !(item as any)[PARENT_PROP])
  }

  _ensureItemIsInThisList(item: T) {
    assert('Cannot remove item that is in another list', getParent(item) === this)
  }
}

function getParent<T extends LinkedListItem<T>>(item: {}): LinkedList<T> | null {
  return (item as any)[PARENT_PROP] || null
}
