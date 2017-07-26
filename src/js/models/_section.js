import { normalizeTagName } from '../utils/dom-utils';
import LinkedItem from '../utils/linked-item';
import assert from '../utils/assert';
import Position from '../utils/cursor/position';

function unimplementedMethod(methodName, me) {
  assert(`\`${methodName}()\` must be implemented by ${me.constructor.name}`,
         false);
}

export default class Section extends LinkedItem {
  constructor(type) {
    super();
    assert('Cannot create section without type', !!type);
    this.type = type;
    this.isSection = true;
    this.isMarkerable = false;
    this.isNested = false;
    this.isSection = true;
    this.isLeafSection = true;
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

  get length() {
    return 0;
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

  /**
   * @return {Position} The position at the start of this section
   * @public
   */
  headPosition() {
    return this.toPosition(0);
  }

  /**
   * @return {Position} The position at the end of this section
   * @public
   */
  tailPosition() {
    return this.toPosition(this.length);
  }

  /**
   * @param {Number} offset
   * @return {Position} The position in this section at the given offset
   * @public
   */
  toPosition(offset) {
    assert("Must pass number to `toPosition`", typeof offset === 'number');
    assert("Cannot call `toPosition` with offset > length", offset <= this.length);

    return new Position(this, offset);
  }

  /**
   * @return {Range} A range from this section's head to tail positions
   * @public
   */
  toRange() {
    return this.headPosition().toRange(this.tailPosition());
  }

  join() {
    unimplementedMethod('join', this);
  }

  textUntil(/* position */) {
    return '';
  }

  /**
   * Markerable sections should override this method
   */
  splitMarkerAtOffset() {
    let blankEdit = { added: [], removed: [] };
    return blankEdit;
  }

  nextLeafSection() {
    const next = this.next;
    if (next) {
      if (next.items) {
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
      if (prev.items) {
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
