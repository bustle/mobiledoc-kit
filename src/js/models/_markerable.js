import { forEach, filter, reduce } from '../utils/array-utils';
import Set from '../utils/set';

import LinkedList from '../utils/linked-list';
import Section from './_section';
import Position from '../utils/cursor/position';
import assert from '../utils/assert';

export default class Markerable extends Section {
  constructor(type, tagName, markers=[]) {
    super(type);
    this.isMarkerable = true;
    this.tagName = tagName;
    this.markers = new LinkedList({
      adoptItem: m => {
        assert(`Cannot insert non-marker into markerable (was: ${m.type})`,
               m.isMarker);
        m.section = m.parent = this;
      },
      freeItem: m => m.section = m.parent = null
    });

    markers.forEach(m => this.markers.append(m));
  }

  canJoin(other) {
    return other.isMarkerable &&
      other.type === this.type &&
      other.tagName === this.tagName;
  }

  clone() {
    const newMarkers = this.markers.map(m => m.clone());
    return this.builder.createMarkerableSection(
      this.type, this.tagName, newMarkers);
  }

  headPosition() {
    return new Position(this, 0);
  }

  tailPosition() {
    return new Position(this, this.length);
  }

  get isBlank() {
    if (!this.markers.length) {
      return true;
    }
    return this.markers.every(m => m.isBlank);
  }

  /**
   * @param {Marker}
   * @param {Number} markerOffset The offset relative to the start of the marker
   *
   * @return {Number} The offset relative to the start of this section
   */
  offsetOfMarker(marker, markerOffset) {
    if (marker.section !== this) {
      throw new Error(`Cannot get offsetOfMarker for marker that is not child of this`);
    }
    // FIXME it is possible, when we get a cursor position before having finished reparsing,
    // for markerOffset to be > marker.length. We shouldn't rely on this functionality.

    let offset = 0;
    let currentMarker = this.markers.head;
    while (currentMarker && currentMarker !== marker.next) {
      let length = currentMarker === marker ? markerOffset :
                                              currentMarker.length;
      offset += length;
      currentMarker = currentMarker.next;
    }

    return offset;
  }

  /**
   * Splits the marker at the offset, filters empty markers from the result,
   * and replaces this marker with the new non-empty ones
   * @param {Marker} marker the marker to split
   * @return {Array} the new markers that replaced `marker`
   */
  splitMarker(marker, offset, endOffset=marker.length) {
    const newMarkers = filter(marker.split(offset, endOffset), m => !m.isEmpty);
    this.markers.splice(marker, 1, newMarkers);
    return newMarkers;
  }

  // puts clones of this.markers into beforeSection and afterSection,
  // all markers before the marker/offset split go in beforeSection, and all
  // after the marker/offset split go in afterSection
  // @return {Array} [beforeSection, afterSection], two new sections
  _redistributeMarkers(beforeSection, afterSection, marker, offset=0) {
    let currentSection = beforeSection;
    forEach(this.markers, m => {
      if (m === marker) {
        const [beforeMarker, ...afterMarkers] = marker.split(offset);
        beforeSection.markers.append(beforeMarker);
        forEach(afterMarkers, _m => afterSection.markers.append(_m));
        currentSection = afterSection;
      } else {
        currentSection.markers.append(m.clone());
      }
    });

    return [beforeSection, afterSection];
  }

  splitAtMarker(/*marker, offset=0*/) {
    throw new Error('splitAtMarker must be implemented by sub-class');
  }

  /**
   * Split this section's marker (if any) at the given offset, so that
   * there is now a marker boundary at that offset (useful for later applying
   * a markup to a range)
   * @param {Number} sectionOffset The offset relative to start of this section
   * @return {EditObject} An edit object with 'removed' and 'added' keys with arrays of Markers. The added markers may be blank.
   * After calling `splitMarkerAtOffset(offset)`, there will always be a valid
   * result returned from `markerBeforeOffset(offset)`.
   */
  splitMarkerAtOffset(sectionOffset) {
    assert('Cannot splitMarkerAtOffset when offset is > length',
           sectionOffset <= this.length);
    let markerOffset;
    let len = 0;
    let currentMarker = this.markers.head;
    let edit = {added: [], removed: []};

    if (!currentMarker) {
      let blankMarker = this.builder.createMarker();
      this.markers.prepend(blankMarker);
      edit.added.push(blankMarker);
    } else {
      while (currentMarker) {
        len += currentMarker.length;
        if (len === sectionOffset) {
          // nothing to do, there is a gap at the requested offset
          break;
        } else if (len > sectionOffset) {
          markerOffset = currentMarker.length - (len - sectionOffset);
          let newMarkers = currentMarker.splitAtOffset(markerOffset);
          edit.added.push(...newMarkers);
          edit.removed.push(currentMarker);
          this.markers.splice(currentMarker, 1, newMarkers);
          break;
        } else {
          currentMarker = currentMarker.next;
        }
      }
    }

    return edit;
  }

  splitAtPosition(position) {
    const {marker, offsetInMarker} = position;
    return this.splitAtMarker(marker, offsetInMarker);
  }

  // returns the marker just before this offset.
  // It is an error to call this method with an offset that is in the middle
  // of a marker.
  markerBeforeOffset(sectionOffset) {
    let len = 0;
    let currentMarker = this.markers.head;

    while (currentMarker) {
      len += currentMarker.length;
      if (len === sectionOffset) {
        return currentMarker;
      } else {
        assert('markerBeforeOffset called with sectionOffset not between markers',
               len < sectionOffset);
        currentMarker = currentMarker.next;
      }
    }
  }

  markerPositionAtOffset(offset) {
    let currentOffset = 0;
    let currentMarker;
    let remaining = offset;
    this.markers.detect((marker) => {
      currentOffset = Math.min(remaining, marker.length);
      remaining -= currentOffset;
      if (remaining === 0) {
        currentMarker = marker;
        return true; // break out of detect
      }
    });

    return {marker:currentMarker, offset:currentOffset};
  }

  textUntil(offset) {
    return this.text.slice(0, offset);
  }

  get text() {
    return reduce(this.markers, (prev, m) => prev + m.value, '');
  }

  get length() {
    return this.text.length;
  }

  /**
   * @return {Array} New markers that match the boundaries of the
   * range. Does not change the existing markers in this section.
   */
  markersFor(headOffset, tailOffset) {
    const range = {head: {section:this, offset:headOffset},
                   tail: {section:this, offset:tailOffset}};

    let markers = [];
    this._markersInRange(range, (marker, {markerHead, markerTail}) => {
      const cloned = marker.clone();
      cloned.value = marker.value.slice(markerHead, markerTail);
      markers.push(cloned);
    });
    return markers;
  }

  markupsInRange(range) {
    const markups = new Set();
    this._markersInRange(range, marker => {
      marker.markups.forEach(m => markups.add(m));
    });
    return markups.toArray();
  }

  // calls the callback with (marker, {markerHead, markerTail, isContained})
  // for each marker that is wholly or partially contained in the range.
  _markersInRange(range, callback) {
    const { head, tail } = range;
    assert('Cannot call #_markersInRange if range expands beyond this section',
           head.section === this && tail.section === this);
    const {offset:headOffset} = head, {offset:tailOffset} = tail;

    let currentHead = 0, currentTail = 0, currentMarker = this.markers.head;

    while (currentMarker) {
      currentTail += currentMarker.length;

      if (currentTail > headOffset && currentHead < tailOffset) {
        let markerHead = Math.max(headOffset - currentHead, 0);
        let markerTail = currentMarker.length -
          Math.max(currentTail - tailOffset, 0);
        let isContained = markerHead === 0 && markerTail === currentMarker.length;

        callback(currentMarker, {markerHead, markerTail, isContained});
      }

      currentHead += currentMarker.length;
      currentMarker = currentMarker.next;

      if (currentHead > tailOffset) { break; }
    }
  }

  // mutates this by appending the other section's (cloned) markers to it
  join(otherSection) {
    let beforeMarker = this.markers.tail;
    let afterMarker = null;

    otherSection.markers.forEach(m => {
      if (!m.isEmpty) {
        m = m.clone();
        this.markers.append(m);
        if (!afterMarker) {
          afterMarker = m;
        }
      }
    });

    return { beforeMarker, afterMarker };
  }
}
