import { normalizeTagName } from '../utils/dom-utils';
import LinkedItem from '../utils/linked-item';
import assert from '../utils/assert';

function unimplementedMethod(methodName, me) {
  throw new Error(`\`${methodName}()\` must be implemented by ${me.constructor.name}`);
}

export default class Section extends LinkedItem {
  constructor(type) {
    super();
    assert('Cannot create section without type', !!type);
    this.type = type;
    this.isMarkerable = false;
    this.isNested = false;
  }

  set tagName(val) {
    let normalizedTagName = normalizeTagName(val);
    assert(`Cannot set section tagName to ${val}`,
           this.isValidTagName(normalizedTagName));
    this._tagName = normalizedTagName;
  }

  get tagName() {
    return this._tagName;
  }

  isValidTagName(/* normalizedTagName */) {
    unimplementedMethod('isValidTagName', this);
  }

  get isBlank() {
    unimplementedMethod('isBlank', this);
  }

  clone() {
    unimplementedMethod('clone', this);
  }

  canJoin(/* otherSection */) {
    unimplementedMethod('canJoin', this);
  }

  headPosition() {
    unimplementedMethod('headPosition', this);
  }

  tailPosition() {
    unimplementedMethod('tailPosition', this);
  }

  join() {
    unimplementedMethod('join', this);
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
      if (this.isNested) {
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
      if (this.isNested) {
        return this.parent.previousLeafSection();
      }
    }
  }
}
