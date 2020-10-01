import LinkedItem from '../utils/linked-item'
import assert, { expect } from '../utils/assert'
import { Option, Dict } from '../utils/types'
import Position from '../utils/cursor/position'
import Range from '../utils/cursor/range'
import RenderNode from './render-node'
import Post from './post'
import PostNodeBuilder from './post-node-builder'
import { Type } from './types'
import Markuperable from '../utils/markuperable'
import { isListSection } from './is-list-section'
import HasChildSections from './_has-child-sections'

export interface WithParent<T> {
  parent: Option<T>
}

type ParentSection = Post | (Section & HasChildSections<any>)

export default class Section extends LinkedItem {
  type: Type

  isSection = true
  isMarkerable = false
  isNested = false
  isListItem = false
  isListSection = false
  isLeafSection = true
  isCardSection = false

  attributes?: Dict<string>

  post?: Option<Post>
  renderNode!: RenderNode

  _parent: Option<ParentSection> = null
  builder!: PostNodeBuilder

  get parent() {
    return expect(this._parent, 'expected section parent to be assigned')
  }

  constructor(type: Type) {
    super()
    assert('Cannot create section without type', !!type)
    this.type = type
  }

  get isBlank() {
    return false
  }

  get length() {
    return 0
  }

  /**
   * @return {Position} The position at the start of this section
   * @public
   */
  headPosition(): Position {
    return this.toPosition(0)
  }

  /**
   * @return {Position} The position at the end of this section
   * @public
   */
  tailPosition(): Position {
    return this.toPosition(this.length)
  }

  /**
   * @param {Number} offset
   * @return {Position} The position in this section at the given offset
   * @public
   */
  toPosition(offset: number): Position {
    assert('Must pass number to `toPosition`', typeof offset === 'number')
    assert('Cannot call `toPosition` with offset > length', offset <= this.length)

    return new Position(this, offset)
  }

  /**
   * @return {Range} A range from this section's head to tail positions
   * @public
   */
  toRange(): Range {
    return this.headPosition().toRange(this.tailPosition())
  }

  /**
   * Markerable sections should override this method
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  splitMarkerAtOffset(_offset: number) {
    let blankEdit: { added: Markuperable[]; removed: Markuperable[] } = { added: [], removed: [] }
    return blankEdit
  }

  nextLeafSection(): Section | null {
    const next = this.next
    if (next) {
      if (isListSection(next)) {
        return next.items.head
      } else {
        return next
      }
    } else {
      if (isNested(this)) {
        return this.parent.nextLeafSection()
      }
    }
    return null
  }

  immediatelyNextMarkerableSection() {
    let next = this.nextLeafSection()
    while (next && !next.isMarkerable) {
      next = next.nextLeafSection()
    }
    return next
  }

  previousLeafSection(): Section | null {
    const prev = this.prev

    if (prev) {
      if (isListSection(prev)) {
        return prev.items.tail
      } else {
        return prev
      }
    } else {
      if (isNested(this)) {
        return this.parent.previousLeafSection()
      }
    }

    return null
  }
}

export interface NestedSection {
  parent: Section
}

export function isNested<T extends Section>(section: T): section is T & NestedSection {
  return section.isNested
}
