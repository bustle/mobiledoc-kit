import { LIST_ITEM_TYPE } from './types';
import { normalizeTagName } from '../utils/dom-utils';
import LinkedItem from '../utils/linked-item';

function isChild(section) {
  return section.type === LIST_ITEM_TYPE;
}

export default class Section extends LinkedItem {
  constructor(type) {
    super();
    if (!type) { throw new Error('Cannot create section without type'); }
    this.type = type;
    this.isMarkerable = false;
  }

  set tagName(val) {
    let normalizedTagName = normalizeTagName(val);
    if (!this.isValidTagName(normalizedTagName)) {
      throw new Error(`Cannot set section tagName to ${val}`);
    }
    this._tagName = normalizedTagName;
  }

  get tagName() {
    return this._tagName;
  }

  isValidTagName(/* normalizedTagName */) {
    throw new Error('`isValidTagName` must be implemented by subclass');
  }

  get isBlank() {
    throw new Error('`isBlank` must be implemented by subclass');
  }

  clone() {
    throw new Error('`clone()` must be implemented by subclass');
  }

  nextLeafSection() {
    const next = this.next;
    if (next) {
      if (!!next.items) {
        return next.items.head;
      } else {
        return next;
      }
    } else {
      if (isChild(this)) {
        return this.parent.nextLeafSection();
      }
    }
  }

  immediatelyNextMarkerableSection() {
    let next = this.nextLeafSection();
    while (next && !next.isMarkerable) {
      next = next.nextLeafSection();
    }
    return next;
  }

  previousLeafSection() {
    const prev = this.prev;

    if (prev) {
      if (!!prev.items) {
        return prev.items.tail;
      } else {
        return prev;
      }
    } else {
      if (isChild(this)) {
        return this.parent.previousLeafSection();
      }
    }
  }
}
