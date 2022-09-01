import Position from './position'
import { Direction } from '../key'
import assert, { assertNotNull, unwrap } from '../assert'
import Markerable from '../../models/_markerable'
import MobiledocError from '../mobiledoc-error'
import Section from '../../models/_section'
import Markuperable from '../markuperable'
import { Option } from '../types'

/**
 * A logical range of a {@link Post}.
 * Usually an instance of Range will be read from the {@link Editor#range} property,
 * but it may be useful to instantiate a range directly when programmatically modifying a Post.
 */
export default class Range {
  head: Position
  tail: Position
  direction: Option<Direction>

  /**
   * @param {Position} head
   * @param {Position} [tail=head]
   * @param {Direction} [direction=null]
   * @private
   */
  constructor(head: Position, tail: Position = head, direction: Option<Direction> = null) {
    /** @property {Position} head */
    this.head = head

    /** @property {Position} tail */
    this.tail = tail

    /** @property {Direction} direction */
    this.direction = direction
  }

  /**
   * Shorthand to create a new range from a section(s) and offset(s).
   * When given only a head section and offset, creates a collapsed range.
   * @param {Section} headSection
   * @param {number} headOffset
   * @param {Section} [tailSection=headSection]
   * @param {number} [tailOffset=headOffset]
   * @param {Direction} [direction=null]
   * @return {Range}
   */
  static create(
    headSection: Markerable,
    headOffset: number,
    tailSection: Markerable = headSection,
    tailOffset = headOffset,
    direction: Option<Direction> = null
  ): Range {
    return new Range(new Position(headSection, headOffset), new Position(tailSection, tailOffset), direction)
  }

  static blankRange(): Range {
    return new Range(Position.blankPosition(), Position.blankPosition())
  }

  /**
   * @param {Markerable} section
   * @return {Range} A range that is constrained to only the part that
   * includes the section.
   * FIXME -- if the section isn't the head or tail, it's assumed to be
   * wholly contained. It's possible to call `trimTo` with a selection that is
   * outside of the range, though, which would invalidate that assumption.
   * There's no efficient way to determine if a section is within a range, yet.
   * @private
   */
  trimTo(section: Markerable) {
    const length = section.length

    let headOffset = section === this.head.section ? Math.min(this.head.offset, length) : 0
    let tailOffset = section === this.tail.section ? Math.min(this.tail.offset, length) : length

    return Range.create(section, headOffset, section, tailOffset)
  }

  /**
   * Expands the range 1 unit in the given direction
   * If the range is expandable in the given direction, always returns a
   * non-collapsed range.
   * @param {Number} units If units is > 0, the range is extended to the right,
   *                 otherwise range is extended to the left.
   * @return {Range}
   * @public
   */
  extend(units: number): Range {
    assert(`Must pass integer to Range#extend`, typeof units === 'number')

    if (units === 0) {
      return this
    }

    let { head, tail, direction: currentDirection } = this
    switch (currentDirection) {
      case Direction.FORWARD:
        return new Range(head, tail.move(units), currentDirection)
      case Direction.BACKWARD:
        return new Range(head.move(units), tail, currentDirection)
      default: {
        let newDirection = units > 0 ? Direction.FORWARD : Direction.BACKWARD
        return new Range(head, tail, newDirection).extend(units)
      }
    }
  }

  /**
   * Moves this range 1 unit in the given direction.
   * If the range is collapsed, returns a collapsed range shifted by 1 unit,
   * otherwise collapses this range to the position at the `direction` end of the range.
   * Always returns a collapsed range.
   * @param {Direction} direction
   * @return {Range}
   * @public
   */
  move(direction: Direction) {
    assert(
      `Must pass DIRECTION.FORWARD (${Direction.FORWARD}) or DIRECTION.BACKWARD (${Direction.BACKWARD}) to Range#move`,
      direction === Direction.FORWARD || direction === Direction.BACKWARD
    )

    let { focusedPosition, isCollapsed } = this

    if (isCollapsed) {
      return new Range(focusedPosition.move(direction))
    } else {
      return this._collapse(direction)
    }
  }

  /**
   * expand a range to all markers matching a given check
   *
   * @param {Function} detectMarker
   * @return {Range} The expanded range
   *
   * @public
   */
  expandByMarker(detectMarker: (marker: Markuperable) => boolean) {
    let { head, tail, direction } = this
    let { section: headSection } = head

    assertNotNull('expected range section to not be null', headSection)
    assertMarkerable(headSection)

    if (headSection !== tail.section) {
      throw new Error(
        '#expandByMarker does not work across sections. Perhaps you should confirm the range is collapsed'
      )
    }

    let firstNotMatchingDetect = (i: Markuperable) => {
      return !detectMarker(i)
    }

    let headMarker: Markuperable | null | undefined = headSection.markers.detect(
      firstNotMatchingDetect,
      head.marker,
      true
    )
    if (!headMarker && detectMarker(headSection.markers.head!)) {
      headMarker = headSection.markers.head
    } else {
      headMarker = unwrap(headMarker).next || head.marker
    }
    let headPosition = new Position(headSection, headSection.offsetOfMarker(unwrap(headMarker)))

    assertMarkerable(tail.section)
    let tailMarker = tail.section.markers.detect(firstNotMatchingDetect, tail.marker)
    if (!tailMarker && detectMarker(unwrap(headSection.markers.tail))) {
      tailMarker = unwrap(headSection.markers.tail)
    } else {
      tailMarker = unwrap(tailMarker).prev || unwrap(tail.marker)
    }
    let tailPosition = new Position(tail.section, tail.section.offsetOfMarker(tailMarker) + tailMarker.length)

    return headPosition.toRange(tailPosition, direction)
  }

  private _collapse(direction: Direction) {
    return new Range(direction === Direction.BACKWARD ? this.head : this.tail)
  }

  get focusedPosition() {
    return this.direction === Direction.BACKWARD ? this.head : this.tail
  }

  isEqual(other: Range) {
    return other && this.head.isEqual(other.head) && this.tail.isEqual(other.tail)
  }

  get isBlank() {
    return this.head.isBlank && this.tail.isBlank
  }

  // "legacy" APIs
  get headSection() {
    return this.head.section
  }
  get tailSection() {
    return this.tail.section
  }
  get headSectionOffset() {
    return this.head.offset
  }
  get tailSectionOffset() {
    return this.tail.offset
  }
  get isCollapsed() {
    return this.head.isEqual(this.tail)
  }
  get headMarker() {
    return this.head.marker
  }
  get tailMarker() {
    return this.tail.marker
  }
  get headMarkerOffset() {
    return this.head.offsetInMarker
  }
  get tailMarkerOffset() {
    return this.tail.offsetInMarker
  }
}

function assertMarkerable(section: Section): asserts section is Markerable {
  if (!('markers' in section)) {
    throw new MobiledocError('Expected position section to be markerable')
  }
}
