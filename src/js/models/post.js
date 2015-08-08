export const POST_TYPE = 'post';
import LinkedList from "content-kit-editor/utils/linked-list";

export default class Post {
  constructor() {
    this.type = POST_TYPE;
    this.sections = new LinkedList({
      adoptItem(section) {
        section.post = this;
      },
      freeItem(section) {
        section.post = null;
      }
    });
  }
  appendSection(section) {
    this.sections.append(section);
  }
  prependSection(section) {
    this.sections.prepend(section);
  }
  replaceSection(section, newSection) {
    this.sections.insertAfter(newSection, section);
    this.sections.remove(section);
  }
  cutMarkers(markers) {
    let firstSection = markers[0].section,
        lastSection  = markers[markers.length - 1].section;

    let currentSection = firstSection;
    let removedSections = [],
        changedSections = [firstSection, lastSection];

    let previousMarker = markers[0].previousSibling;

    markers.forEach(marker => {
      if (marker.section !== currentSection) { // this marker is in a section we haven't seen yet
        if (marker.section !== firstSection &&
            marker.section !== lastSection) {
          // section is wholly contained by markers, and can be removed
          removedSections.push(marker.section);
        }
      }

      currentSection = marker.section;
      currentSection.removeMarker(marker);
    });

    // add a blank marker to any sections that are now empty
    changedSections.forEach(section => {
      if (section.isEmpty()) {
        section.appendMarker(this.builder.createBlankMarker());
      }
    });

    let currentMarker, currentOffset;

    if (previousMarker) {
      currentMarker = previousMarker;
      currentOffset = currentMarker.length;
    } else {
      currentMarker = firstSection.markers.head;
      currentOffset = 0;
    }

    if (firstSection !== lastSection) {
      firstSection.join(lastSection);
      removedSections.push(lastSection);
    }

    return {changedSections, removedSections, currentMarker, currentOffset};
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
        currentMarker = nextSection.markers.head;
      }
    }
  }

  insertSectionAfter(section, nextSection) {
    this.sections.insertAfter(section, nextSection);
  }

  removeSection(section) {
    this.sections.remove(section);
  }

  getPreviousSection(section) {
    return section.prev;
  }
}
