import {
  normalizeTagName
} from '../utils/dom-utils';

import {
  forEach,
  filter
} from '../utils/array-utils';

export const DEFAULT_TAG_NAME = normalizeTagName('p');
export const VALID_MARKUP_SECTION_TAGNAMES = [
  'p', 'h3', 'h2', 'h1', 'blockquote', 'ul', 'ol'
].map(normalizeTagName);
export const MARKUP_SECTION_TYPE = 'markup-section';
import LinkedList from "content-kit-editor/utils/linked-list";
import LinkedItem from "content-kit-editor/utils/linked-item";

export default class Section extends LinkedItem {
  constructor(tagName, markers=[]) {
    super();
    this.markers = new LinkedList({
      adoptItem: m => m.section = m.parent = this,
      freeItem: m => m.section = m.parent = null
    });
    this.tagName = tagName || DEFAULT_TAG_NAME;
    this.type = MARKUP_SECTION_TYPE;

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

  setTagName(newTagName) {
    newTagName = normalizeTagName(newTagName);
    if (VALID_MARKUP_SECTION_TAGNAMES.indexOf(newTagName) === -1) {
      throw new Error(`Cannot change section tagName to "${newTagName}`);
    }
    this.tagName = newTagName;
  }

  resetTagName() {
    this.tagName = DEFAULT_TAG_NAME;
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
    if (this.markers.length === 0) {
      let blankMarker = this.builder.createBlankMarker();
      this.markers.append(blankMarker);
      newMarkers.push(blankMarker);
    }
    return newMarkers;
  }

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

  splitAtMarker(marker, offset=0) {
    let [beforeSection, afterSection] = [
      this.builder.createMarkupSection(this.tagName, []),
      this.builder.createMarkupSection(this.tagName, [])
    ];

    return this._redistributeMarkers(beforeSection, afterSection, marker, offset);
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

  get text() {
    let text = '';
    this.markers.forEach(m => text += m.value);
    return text;
  }

  markersFor(headOffset, tailOffset) {
    let markers = [];
    let adjustedHead = 0, adjustedTail = 0;
    this.markers.forEach(m => {
      adjustedTail += m.length;

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
}
