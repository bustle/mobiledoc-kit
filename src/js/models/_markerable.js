import { normalizeTagName } from '../utils/dom-utils';
import { forEach, filter, reduce } from '../utils/array-utils';

import LinkedItem from '../utils/linked-item';
import LinkedList from '../utils/linked-list';

export default class Markerable extends LinkedItem {
  constructor(tagName, markers=[]) {
    super();
    this.tagName = tagName;
    this.markers = new LinkedList({
      adoptItem: m => m.section = m.parent = this,
      freeItem: m => m.section = m.parent = null
    });

    markers.forEach(m => this.markers.append(m));
  }

  set tagName(val) {
    this._tagName = normalizeTagName(val);
  }

  get tagName() {
    return this._tagName;
  }

  get isBlank() {
    if (!this.markers.length) {
      return true;
    }
    let markerWithLength = this.markers.detect((marker) => {
      return !!marker.length;
    });
    return !markerWithLength;
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

  splitAtPosition(position) {
    const {marker, offsetInMarker} = position;
    return this.splitAtMarker(marker, offsetInMarker);
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

  get text() {
    return reduce(this.markers, (prev, m) => prev + m.value, '');
  }

  markersFor(headOffset, tailOffset) {
    let markers = [];
    let adjustedHead = 0, adjustedTail = 0;
    this.markers.forEach(m => {
      adjustedTail += m.length;

      // if current 'window' of [adjustedHead..adjustedTail] is within
      // [headOffset..tailOffset] range
      if (adjustedTail > headOffset && adjustedHead < tailOffset) {
        let head = Math.max(headOffset - adjustedHead, 0);
        let tail = m.length - Math.max(adjustedTail - tailOffset, 0);
        let cloned = m.clone();

        cloned.value = m.value.slice(head, tail);
        markers.push(cloned);
      }
      adjustedHead += m.length;
    });
    return markers;
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
