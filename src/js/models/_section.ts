import { normalizeTagName } from '../utils/dom-utils'
import LinkedItem from '../utils/linked-item'
import assert from '../utils/assert'
import Position from '../utils/cursor/position'
import LinkedList from '../utils/linked-list'
import Marker from './marker'
import RenderNode from './render-node'
import Post from './post'

export default abstract class Section extends LinkedItem<Section> {
  type: string
  isSection: boolean
  isMarkerable: boolean
  isNested: boolean
  isLeafSection: boolean

  post?: Post | null
  parent: Section | null = null
  renderNode: RenderNode | null = null
  _tagName: string | null = null

  constructor(type: string) {
    super()
    assert('Cannot create section without type', !!type)
    this.type = type
    this.isSection = true
    this.isMarkerable = false
    this.isNested = false
    this.isLeafSection = true
  }

  set tagName(val: string) {
    let normalizedTagName = normalizeTagName(val)
    assert(`Cannot set section tagName to ${val}`, this.isValidTagName(normalizedTagName))
    this._tagName = normalizedTagName
  }

  get tagName() {
    return this._tagName as string
  }

  get length() {
    return 0
  }

  abstract get isBlank(): boolean
  abstract isValidTagName(_normalizedTagName: string): boolean
  abstract clone(): Section
  abstract canJoin(otherSection: Section): boolean
  abstract textUntil(position: Position): string

  /**
   * @return {Position} The position at the start of this section
   * @public
   */
  headPosition() {
    return this.toPosition(0)
  }

  /**
   * @return {Position} The position at the end of this section
   * @public
   */
  tailPosition() {
    return this.toPosition(this.length)
  }

  /**
   * @param {Number} offset
   * @return {Position} The position in this section at the given offset
   * @public
   */
  toPosition(offset: number) {
    assert('Must pass number to `toPosition`', typeof offset === 'number')
    assert('Cannot call `toPosition` with offset > length', offset <= this.length)

    return new Position(this, offset)
  }

  /**
   * @return {Range} A range from this section's head to tail positions
   * @public
   */
  toRange() {
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

interface ListSection {
  items: LinkedList<Section>
}

function isListSection(item: any): item is ListSection {
  return 'items' in item && item.items
}
