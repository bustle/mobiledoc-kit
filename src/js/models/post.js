export const POST_TYPE = 'post';
import LinkedList from "content-kit-editor/utils/linked-list";

export default class Post {
  constructor() {
    this.type = POST_TYPE;
    this.sections = new LinkedList({
      adoptItem: s => s.post = this,
      freeItem: s => s.post = null
    });
  }

  markersInRange({headMarker, headOffset, tailMarker, tailOffset}) {
    let offset = 0;
    let foundMarkers = [];
    let toEnd = tailOffset === undefined;
    if (toEnd) { tailOffset = 0; }

    this.markersFrom(headMarker, tailMarker, marker => {
      if (toEnd) {
        tailOffset += marker.length;
      }

      if (offset >= headOffset && offset < tailOffset) {
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
        changedSections = [];
    if (firstSection) {
      changedSections.push(firstSection);
    }
    if (lastSection) {
      changedSections.push(lastSection);
    }
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

      // add a blank marker to any sections that are now empty
      changedSections.forEach(section => {
        if (section.markers.isEmpty) {
          section.markers.append(this.builder.createBlankMarker());
        }
      });

      if (firstSection !== lastSection) {
        firstSection.join(lastSection);
        removedSections.push(lastSection);
      }
    }

    return {changedSections, removedSections};
  }
  /**
   * Invoke `callbackFn` for all markers between the startMarker and endMarker (inclusive),
   * across sections
   */
  markersFrom(startMarker, endMarker, callbackFn) {
    let currentMarker = startMarker;
    while (currentMarker) {
      callbackFn(currentMarker);

      if (currentMarker === endMarker) {
        currentMarker = null;
      } else if (currentMarker.next) {
        currentMarker = currentMarker.next;
      } else {
        let nextSection = currentMarker.section.next;
        currentMarker = nextSection && nextSection.markers.head;
      }
    }
  }
}
