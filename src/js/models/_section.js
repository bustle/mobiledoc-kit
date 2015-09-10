import { LIST_ITEM_TYPE, LIST_SECTION_TYPE } from './types';
import { normalizeTagName } from '../utils/dom-utils';
import LinkedItem from '../utils/linked-item';

function isMarkerable(section) {
  return !!section.markers;
}

function isListSection(section) {
  return section.type === LIST_SECTION_TYPE;
}

function isListItem(section) {
  return section.type === LIST_ITEM_TYPE;
}

export default class Section extends LinkedItem {
  constructor(type) {
    super();
    if (!type) { throw new Error('Cannot create section without type'); }
    this.type = type;
  }

  set tagName(val) {
    this._tagName = normalizeTagName(val);
  }

  get tagName() {
    return this._tagName;
  }

  immediatelyNextMarkerableSection() {
    const next = this.next;
    if (next) {
      if (isMarkerable(next)) {
        return next;
      } else if (isListSection(next)) {
        const firstListItem = next.items.head;
        return firstListItem;
      }
    } else if (isListItem(this)) {
      const listSection = this.parent;
      return listSection.immediatelyNextMarkerableSection();
    }
  }

  immediatelyPreviousMarkerableSection() {
    const prev = this.prev;
    if (!prev) { return null; }
    if (isMarkerable(prev)) {
      return prev;
    } else if (isListSection(prev)) {
      const lastListItem = prev.items.tail;
      return lastListItem;
    }
  }
}
