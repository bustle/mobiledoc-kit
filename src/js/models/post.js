import { POST_TYPE } from './types';
import LinkedList from 'content-kit-editor/utils/linked-list';
import { forEach, compact } from 'content-kit-editor/utils/array-utils';
import Set from 'content-kit-editor/utils/set';

export default class Post {
  constructor() {
    this.type = POST_TYPE;
    this.sections = new LinkedList({
      adoptItem: s => s.post = s.parent = this,
      freeItem: s => s.post = s.parent = null
    });
  }

  /**
   * @param {Range} range
   * @return {Array} markers that are completely contained by the range
   */
  markersContainedByRange(range) {
    const markers = [];

    this.walkMarkerableSections(range, section => {
      section._markersInRange(
        range.trimTo(section),
        (m, {isContained}) => { if (isContained) { markers.push(m); } }
      );
    });

    return markers;
  }

  cutMarkers(markers) {
    let firstSection = markers.length && markers[0].section,
        lastSection  = markers.length && markers[markers.length - 1].section;

    let currentSection = firstSection;
    let removedSections = [],
        changedSections = compact([firstSection, lastSection]);

    if (markers.length !== 0) {
      markers.forEach(marker => {
        if (marker.section !== currentSection) { // this marker is in a section we haven't seen yet
          if (marker.section !== firstSection &&
              marker.section !== lastSection) {
            // section is wholly contained by markers, and can be removed
            removedSections.push(marker.section);
          }
        }

        currentSection = marker.section;
        currentSection.markers.remove(marker);
      });

      if (firstSection !== lastSection) {
        firstSection.join(lastSection);
        removedSections.push(lastSection);
      }
    }

    return {changedSections, removedSections};
  }

  /**
   * Invoke `callbackFn` for all markers between the headMarker and tailMarker (inclusive),
   * across sections
   */
  markersFrom(headMarker, tailMarker, callbackFn) {
    let currentMarker = headMarker;
    while (currentMarker) {
      callbackFn(currentMarker);

      if (currentMarker === tailMarker) {
        currentMarker = null;
      } else if (currentMarker.next) {
        currentMarker = currentMarker.next;
      } else {
        let nextSection = this._nextMarkerableSection(currentMarker.section);
        // FIXME: This will fail across cards
        currentMarker = nextSection && nextSection.markers.head;
      }
    }
  }

  markupsInRange(range) {
    const markups = new Set();

    this.walkMarkerableSections(range, (section) => {
      forEach(
        section.markupsInRange(range.trimTo(section)),
        m => markups.add(m)
      );
    });

    return markups.toArray();
  }

  walkMarkerableSections(range, callback) {
    const {head, tail} = range;

    let currentSection = head.section;
    while (currentSection) {
      callback(currentSection);

      if (currentSection === tail.section) {
        break;
      } else {
        currentSection = this._nextMarkerableSection(currentSection);
      }
    }
  }

  // return an array of all top-level sections (direct children of `post`)
  // that are wholly contained by the range.
  sectionsContainedBy(range) {
    const {head, tail} = range;
    let containedSections = [];

    const findParent = (child, conditionFn) => {
      while (child) {
        if (conditionFn(child)) { return child; }
        child = child.parent;
      }
    };

    let headTopLevelSection = findParent(head.section, s => !!s.post);
    let tailTopLevelSection = findParent(tail.section, s => !!s.post);

    let currentSection = headTopLevelSection.next;
    while (currentSection && currentSection !== tailTopLevelSection) {
      containedSections.push(currentSection);
      currentSection = currentSection.next;
    }

    return containedSections;
  }

  // return the next section that has markers after this one
  _nextMarkerableSection(section) {
    if (!section) { return null; }
    const isMarkerable = s => !!s.markers;
    const hasChildren  = s => !!s.items;
    const firstChild   = s => s.items.head;
    const isChild      = s => s.parent && !s.post;
    const parent       = s => s.parent;

    const next = section.next;
    if (next) {
      if (isMarkerable(next)) {
        return next;
      } else if (hasChildren(next)) { // e.g. a ListSection
        return firstChild(next);
      } else {
        // e.g. a cardSection that has no children or parent but
        // may have a markerable after it in the AT
        return this._nextMarkerableSection(next);
      }
    } else {
      if (isChild(section)) {
        // if there is no section after this, but this section is a child
        // (e.g. a ListItem inside a ListSection), check for a markerable
        // section after its parent
        return this._nextMarkerableSection(parent(section));
      }
    }
  }
}
