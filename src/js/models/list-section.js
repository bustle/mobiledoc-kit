import LinkedList from '../utils/linked-list';
import { forEach } from '../utils/array-utils';
import { LIST_SECTION_TYPE } from './types';
import Section from './_section';

export const DEFAULT_TAG_NAME = 'ul';

export default class ListSection extends Section {
  constructor(tagName=DEFAULT_TAG_NAME, items=[]) {
    super(LIST_SECTION_TYPE);

    this.tagName = tagName;

    this.items = new LinkedList({
      adoptItem: i => i.section = i.parent = this,
      freeItem: i => i.section = i.parent = null
    });
    this.sections = this.items;

    items.forEach(i => this.items.append(i));
  }

  get isBlank() {
    return this.items.isEmpty;
  }

  clone() {
    let newSection = this.builder.createListSection();
    forEach(this.items, i => newSection.items.append(i.clone()));
    return newSection;
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
