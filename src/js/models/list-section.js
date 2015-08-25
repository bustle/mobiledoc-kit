import Section from './markup-section';
import LinkedList from '../utils/linked-list';

export const LIST_SECTION_TYPE = 'list-section';

export default class ListSection extends Section {
  constructor(tagName, items=[]) {
    super(tagName);
    this.type = LIST_SECTION_TYPE;

    // remove the inherited `markers` because they do nothing on a ListSection but confuse
    this.markers = undefined;

    this.items = new LinkedList({
      adoptItem: i => i.section = i.parent = this,
      freeItem: i => i.section = i.parent = null
    });
    this.sections = this.items;

    items.forEach(i => this.items.append(i));
  }

  // returns [prevListSection, newMarkupSection, nextListSection]
  // prevListSection and nextListSection may be undefined
  splitAtListItem(listItem) {
    if (listItem.parent !== this) {
      throw new Error('Cannot split list section at item that is not a child');
    }
    const prevItem = listItem.prev,
          nextItem = listItem.next;
    const listSection = this;

    let prevListSection, nextListSection, newSection;

    newSection = this.builder.createMarkupSection('p');
    listItem.markers.forEach(m => newSection.markers.append(m.clone()));

    // If there were previous list items, add them to a new list section `prevListSection`
    if (prevItem) {
      prevListSection = this.builder.createListSection(this.tagName);
      let currentItem = listSection.items.head;
      while (currentItem !== listItem) {
        prevListSection.items.append(currentItem.clone());
        currentItem = currentItem.next;
      }
    }

    // if there is a next item, add it and all after it to the `nextListSection`
    if (nextItem) {
      nextListSection = this.builder.createListSection(this.tagName);
      let currentItem = nextItem;
      while (currentItem) {
        nextListSection.items.append(currentItem.clone());
        currentItem = currentItem.next;
      }
    }

    return [prevListSection, newSection, nextListSection];
  }
}
