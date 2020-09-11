import { forEach, reduce } from '../utils/array-utils'
import { Range } from '../utils/cursor'
import Set from '../utils/set'
import LinkedList from '../utils/linked-list'
import assert from '../utils/assert'
import Position from '../utils/cursor/position'
import Section from './_section'
import Marker from './marker'
import { tagNameable } from './_tag-nameable'
import { Type } from './types'
import { Cloneable } from './_cloneable'
import Markuperable from '../utils/markuperable'
import Markup from './markup'

type MarkerableType = Type.LIST_ITEM | Type.MARKUP_SECTION

export default abstract class Markerable extends tagNameable(Section) implements Cloneable<Markerable> {
  type: MarkerableType
  markers: LinkedList<Markuperable>

  constructor(type: MarkerableType, tagName: string, markers: Markuperable[] = []) {
    super(type)
    this.type = type
    this.isMarkerable = true
    this.tagName = tagName
    this.markers = new LinkedList({
      adoptItem: m => {
        assert(`Can only insert markers and atoms into markerable (was: ${m.type})`, m.isMarker || m.isAtom)
        m.section = m.parent = this
      },
      freeItem: m => (m.section = m.parent = null),
    })

    markers.forEach(m => this.markers.append(m))
  }

  canJoin(other: Markerable) {
    return other.isMarkerable && other.type === this.type && other.tagName === this.tagName
  }

  clone(): this {
    const newMarkers = this.markers.map(m => m.clone())
    return (this.builder.createMarkerableSection(this.type, this.tagName, newMarkers) as any) as this
  }

  get isBlank() {
    if (!this.markers.length) {
      return true
    }
    return this.markers.every(m => m.isBlank)
  }

  textUntil(position: Position) {
    assert(`Cannot get textUntil for a position not in this section`, position.section === this)
    let { marker, offsetInMarker } = position
    let text = ''
    let currentMarker = this.markers.head
    while (currentMarker) {
      if (currentMarker === marker) {
        text += currentMarker.textUntil(offsetInMarker)
        break
      } else {
        text += currentMarker.text
        currentMarker = currentMarker.next
      }
    }
    return text
  }

  /**
   * @param {Marker}
   * @param {Number} markerOffset The offset relative to the start of the marker
   *
   * @return {Number} The offset relative to the start of this section
   */
  offsetOfMarker(marker: Markuperable, markerOffset = 0) {
    assert(`Cannot get offsetOfMarker for marker that is not child of this`, marker.section === this)

    // FIXME it is possible, when we get a cursor position before having finished reparsing,
    // for markerOffset to be > marker.length. We shouldn't rely on this functionality.

    let offset = 0
    let currentMarker = this.markers.head
    while (currentMarker && currentMarker !== marker.next) {
      let length = currentMarker === marker ? markerOffset : currentMarker.length
      offset += length
      currentMarker = currentMarker.next
    }

    return offset
  }

  // puts clones of this.markers into beforeSection and afterSection,
  // all markers before the marker/offset split go in beforeSection, and all
  // after the marker/offset split go in afterSection
  // @return {Array} [beforeSection, afterSection], two new sections
  _redistributeMarkers(
    beforeSection: Markerable,
    afterSection: Markerable,
    marker: Marker,
    offset = 0
  ): [Section, Section] {
    let currentSection = beforeSection
    forEach(this.markers, m => {
      if (m === marker) {
        const [beforeMarker, ...afterMarkers] = marker.split(offset)
        beforeSection.markers.append(beforeMarker)
        forEach(afterMarkers, _m => afterSection.markers.append(_m))
        currentSection = afterSection
      } else {
        currentSection.markers.append(m.clone())
      }
    })

    return [beforeSection, afterSection]
  }

  abstract splitAtMarker(marker: Markuperable, offset: number): [Section, Section]

  /**
   * Split this section's marker (if any) at the given offset, so that
   * there is now a marker boundary at that offset (useful for later applying
   * a markup to a range)
   * @param {Number} sectionOffset The offset relative to start of this section
   * @return {EditObject} An edit object with 'removed' and 'added' keys with arrays of Markers. The added markers may be blank.
   * After calling `splitMarkerAtOffset(offset)`, there will always be a valid
   * result returned from `markerBeforeOffset(offset)`.
   */
  splitMarkerAtOffset(sectionOffset: number) {
    assert('Cannot splitMarkerAtOffset when offset is > length', sectionOffset <= this.length)
    let markerOffset
    let len = 0
    let currentMarker = this.markers.head
    let edit: { added: Markuperable[]; removed: Markuperable[] } = { added: [], removed: [] }

    if (!currentMarker) {
      let blankMarker = this.builder.createMarker()
      this.markers.prepend(blankMarker)
      edit.added.push(blankMarker)
    } else {
      while (currentMarker) {
        len += currentMarker.length
        if (len === sectionOffset) {
          // nothing to do, there is a gap at the requested offset
          break
        } else if (len > sectionOffset) {
          markerOffset = currentMarker.length - (len - sectionOffset)
          let newMarkers = currentMarker.splitAtOffset(markerOffset)
          edit.added.push(...newMarkers)
          edit.removed.push(currentMarker)
          this.markers.splice(currentMarker, 1, newMarkers)
          break
        } else {
          currentMarker = currentMarker.next
        }
      }
    }

    return edit
  }

  splitAtPosition(position: Position) {
    const { marker, offsetInMarker } = position
    return this.splitAtMarker(marker!, offsetInMarker)
  }

  // returns the marker just before this offset.
  // It is an error to call this method with an offset that is in the middle
  // of a marker.
  markerBeforeOffset(sectionOffset: number) {
    let len = 0
    let currentMarker = this.markers.head

    while (currentMarker) {
      len += currentMarker.length
      if (len === sectionOffset) {
        return currentMarker
      } else {
        assert('markerBeforeOffset called with sectionOffset not between markers', len < sectionOffset)
        currentMarker = currentMarker.next
      }
    }
  }

  markerPositionAtOffset(offset: number) {
    let currentOffset = 0
    let currentMarker: Markuperable | null = null
    let remaining = offset
    this.markers.detect(marker => {
      currentOffset = Math.min(remaining, marker.length)
      remaining -= currentOffset
      if (remaining === 0) {
        currentMarker = marker
        return true // break out of detect
      }
      return false
    })

    return { marker: currentMarker!, offset: currentOffset }
  }

  get text() {
    return reduce(this.markers, (prev, m) => prev + m.value, '')
  }

  get length() {
    return reduce(this.markers, (prev, m) => prev + m.length, 0)
  }

  /**
   * @return {Array} New markers that match the boundaries of the
   * range. Does not change the existing markers in this section.
   */
  markersFor(headOffset: number, tailOffset: number) {
    const range = Range.create(this, headOffset, this, tailOffset)

    let markers: Markuperable[] = []
    this._markersInRange(range, (marker, { markerHead, markerTail, isContained }) => {
      const cloned = marker.clone()
      if (!isContained) {
        // cannot do marker.value.slice if the marker is an atom -- this breaks the atom's "atomic" value
        // If a marker is an atom `isContained` should always be true so
        // we shouldn't hit this code path. FIXME add tests
        cloned.value = marker.value.slice(markerHead, markerTail)
      }
      markers.push(cloned)
    })
    return markers
  }

  markupsInRange(range: Range) {
    const markups = new Set<Markup>()
    this._markersInRange(range, marker => {
      marker.markups.forEach(m => markups.add(m))
    })
    return markups.toArray()
  }

  // calls the callback with (marker, {markerHead, markerTail, isContained})
  // for each marker that is wholly or partially contained in the range.
  _markersInRange(
    range: Range,
    callback: (marker: Markuperable, info: { markerHead: number; markerTail: number; isContained: boolean }) => void
  ) {
    const { head, tail } = range
    assert(
      'Cannot call #_markersInRange if range expands beyond this section',
      head.section === this && tail.section === this
    )
    const { offset: headOffset } = head,
      { offset: tailOffset } = tail

    let currentHead = 0,
      currentTail = 0,
      currentMarker = this.markers.head

    while (currentMarker) {
      currentTail += currentMarker.length

      if (currentTail > headOffset && currentHead < tailOffset) {
        let markerHead = Math.max(headOffset - currentHead, 0)
        let markerTail = currentMarker.length - Math.max(currentTail - tailOffset, 0)
        let isContained = markerHead === 0 && markerTail === currentMarker.length

        callback(currentMarker, { markerHead, markerTail, isContained })
      }

      currentHead += currentMarker.length
      currentMarker = currentMarker.next

      if (currentHead > tailOffset) {
        break
      }
    }
  }

  // mutates this by appending the other section's (cloned) markers to it
  join(otherSection: Markerable) {
    let beforeMarker = this.markers.tail
    let afterMarker: Markuperable | null = null

    otherSection.markers.forEach(m => {
      if (!m.isBlank) {
        m = m.clone()
        this.markers.append(m)
        if (!afterMarker) {
          afterMarker = m
        }
      }
    })

    return { beforeMarker, afterMarker }
  }
}

export function isMarkerable(section: Section): section is Markerable {
  return section.isMarkerable
}
