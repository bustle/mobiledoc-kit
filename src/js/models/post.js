import Marker from './marker';
export const POST_TYPE = 'post';

// FIXME: making sections a linked-list would greatly improve this
export default class Post {
  constructor() {
    this.type = POST_TYPE;
    this.sections = [];
  }
  appendSection(section) {
    section.post = this;
    this.sections.push(section);
  }
  prependSection(section) {
    section.post = this;
    this.sections.unshift(section);
  }
  replaceSection(section, newSection) {
    section.post = this;
    this.insertSectionAfter(newSection, section);
    this.removeSection(section);
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
        section.appendMarker(Marker.createBlank());
      }
    });

    let currentMarker, currentOffset;

    if (previousMarker) {
      currentMarker = previousMarker;
      currentOffset = currentMarker.length;
    } else {
      currentMarker = firstSection.markers[0];
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
      } else if (currentMarker.nextSibling) {
        currentMarker = currentMarker.nextSibling;
      } else {
        let nextSection = currentMarker.section.nextSibling;
        currentMarker = nextSection && nextSection.markers[0];
      }
    }
  }

  insertSectionAfter(section, previousSection) {
    section.post = this;
    let foundIndex = -1;

    for (let i=0; i<this.sections.length; i++) {
      if (this.sections[i] === previousSection) {
        foundIndex = i;
        break;
      }
    }

    this.sections.splice(foundIndex+1, 0, section);
  }
  removeSection(section) {
    var i, l;
    for (i=0,l=this.sections.length;i<l;i++) {
      if (this.sections[i] === section) {
        this.sections.splice(i, 1);
        return;
      }
    }
  }
  getPreviousSection(section) {
    var i, l;
    if (this.sections[0] !== section) {
      for (i=1,l=this.sections.length;i<l;i++) {
        if (this.sections[i] === section) {
          return this.sections[i-1];
        }
      }
    }
  }
}
