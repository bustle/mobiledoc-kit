import { LIST_ITEM_TYPE } from './types';
import { normalizeTagName } from '../utils/dom-utils';
import LinkedItem from '../utils/linked-item';

export function isMarkerable(section) {
  return !!section.markers;
}

function getParentSection(section) {
  return section.parent;
}

function hasSubsections(section) {
  return !!section.sections;
}

function isSubsection(section) {
  return section.type === LIST_ITEM_TYPE;
}

function firstMarkerableChild(section) {
  return section.items.head;
}

function lastMarkerableChild(section) {
  return section.items.tail;
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

  get isBlank() {
    throw new Error('`isBlank` must be implemented by subclass');
  }

  clone() {
    throw new Error('`clone()` must be implemented by subclass');
  }

  immediatelyNextMarkerableSection() {
    const next = this.next;
    if (next) {
      if (isMarkerable(next)) {
        return next;
      } else if (hasSubsections(next)) {
        const firstChild = firstMarkerableChild(next);
        return firstChild;
      }
    } else if (isSubsection(this)) {
      const parentSection = getParentSection(this);
      return parentSection.immediatelyNextMarkerableSection();
    }
  }

  immediatelyPreviousMarkerableSection() {
    const prev = this.prev;
    if (!prev) { return null; }
    if (isMarkerable(prev)) {
      return prev;
    } else if (hasSubsections(prev)) {
      const lastChild = lastMarkerableChild(prev);
      return lastChild;
    }
  }
}
