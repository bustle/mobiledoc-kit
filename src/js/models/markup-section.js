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
      adoptItem: (marker) => {
        marker.section = this;
      },
      freeItem: (marker) => {
        marker.section = null;
      }
    });
    this.tagName = tagName || DEFAULT_TAG_NAME;
    this.type = MARKUP_SECTION_TYPE;
    this.element = null;

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
    return newMarkers;
  }

  splitAtMarker(marker, offset=0) {
    let [beforeSection, afterSection] = [
      this.builder.createMarkupSection(this.tagName, []),
      this.builder.createMarkupSection(this.tagName, [])
    ];

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

    beforeSection.coalesceMarkers();
    afterSection.coalesceMarkers();

    return [beforeSection, afterSection];
  }

  /**
   * Remove extranous empty markers, adding one at the end if there
   * are no longer any markers
   *
   * Mutates this section's markers
   */
  coalesceMarkers() {
    forEach(
      filter(this.markers, m => m.isEmpty),
      m => this.markers.remove(m)
    );
    if (this.markers.isEmpty) {
      this.markers.append(this.builder.createBlankMarker());
    }
  }

  // mutates this by appending the other section's (cloned) markers to it
  join(otherSection) {
    otherSection.markers.forEach(m => {
      this.markers.append(m.clone());
    });
  }
}
