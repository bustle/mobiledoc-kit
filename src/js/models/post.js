export const POST_TYPE = 'post';
import LinkedList from 'content-kit-editor/utils/linked-list';
import { compact } from 'content-kit-editor/utils/array-utils';

export default class Post {
  constructor() {
    this.type = POST_TYPE;
    this.sections = new LinkedList({
      adoptItem: s => s.post = s.parent = this,
      freeItem: s => s.post = s.parent = null
    });
  }

  markersInRange({headMarker, headMarkerOffset, tailMarker, tailMarkerOffset}) {
    let offset = 0;
    let foundMarkers = [];
    let toEnd = tailMarkerOffset === undefined;
    if (toEnd) { tailMarkerOffset = 0; }

    this.markersFrom(headMarker, tailMarker, marker => {
      if (toEnd) {
        tailMarkerOffset += marker.length;
      }

      if (offset >= headMarkerOffset && offset < tailMarkerOffset) {
        foundMarkers.push(marker);
      }

      offset += marker.length;
    });

    return foundMarkers;
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

  // return the next section that has markers afer this one
  _nextMarkerableSection(section) {
    if (section.next) {
      let next = section.next;
      if (next.markers) {
        return next;
      } else if (next.items) {
        next = next.items.head;
        return next;
      }
    } else if (section.parent && section.parent.next) {
      // FIXME the parent isn't guaranteed to be markerable
      return section.parent.next;
    }
  }
}
