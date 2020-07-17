import LinkedItem from '../utils/linked-item'
import assert from '../utils/assert'
import Position from '../utils/cursor/position'
import Range from '../utils/cursor/range'
import Marker from './marker'
import RenderNode from './render-node'
import Post from './post'
import { isListSection } from './is-list-section'
import PostNodeBuilder from './post-node-builder'
import { Type } from './types'

export default class Section extends LinkedItem {
  type: Type

  isSection = true
  isMarkerable = false
  isNested = false
  isListItem = false
  isListSection = false
  isLeafSection = true

  post?: Post | null
  renderNode: RenderNode | null = null

  parent: Section | null = null
  builder!: PostNodeBuilder

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
    let blankEdit: { added: Marker[]; removed: Marker[] } = { added: [], removed: [] }
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
      if (this.isNested) {
        return this.parent!.nextLeafSection()
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
      if (this.isNested) {
        return this.parent!.previousLeafSection()
      }
    }

    return null
  }
}
