import ElementMap from "../utils/element-map";

// FIXME: making sections a linked-list would greatly improve this
export default class Post {
  constructor() {
    this.type = 'post';
    this.sections = [];
    this.sectionElementMap = new ElementMap();
  }
  appendSection(section) {
    this.sections.push(section);
  }
  prependSection(section) {
    this.sections.unshift(section);
  }
  replaceSection(section, newSection) {
    this.insertSectionAfter(newSection, section);
    this.removeSection(section);
  }
  insertSectionAfter(section, previousSection) {
    var i, l;
    for (i=0,l=this.sections.length;i<l;i++) {
      if (this.sections[i] === previousSection) {
        this.sections.splice(i+1, 0, section);
        return;
      }
    }
    throw new Error('Previous section was not found in post.sections');
  }
  setSectionElement(section, element) {
    section.element = element;
    this.sectionElementMap.set(element, section);
  }
  getSectionElement(section) {
    return section && section.element;
  }
  getElementSection(element) {
    return this.sectionElementMap.get(element);
  }
  removeSection(section) {
    this.sectionElementMap.remove(section.element);
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
