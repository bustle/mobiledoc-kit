import LinkedList from '../utils/linked-list';
import { forEach, contains } from '../utils/array-utils';
import { LIST_SECTION_TYPE } from './types';
import Section from './_section';
import { normalizeTagName } from '../utils/dom-utils';
import assert from '../utils/assert';

export const VALID_LIST_SECTION_TAGNAMES = [
  'ul', 'ol'
].map(normalizeTagName);

export const DEFAULT_TAG_NAME = VALID_LIST_SECTION_TAGNAMES[0];

export default class ListSection extends Section {
  constructor(tagName=DEFAULT_TAG_NAME, items=[]) {
    super(LIST_SECTION_TYPE);
    this.tagName = tagName;
    this.isListSection = true;
    this.isLeafSection = false;

    this.items = new LinkedList({
      adoptItem: i => {
        assert(`Cannot insert non-list-item to list (is: ${i.type})`,
               i.isListItem);
        i.section = i.parent = this;
      },
      freeItem:  i => i.section = i.parent = null
    });
    this.sections = this.items;

    items.forEach(i => this.items.append(i));
  }

  canJoin() {
    return false;
  }

  isValidTagName(normalizedTagName) {
    return contains(VALID_LIST_SECTION_TAGNAMES, normalizedTagName);
  }

  headPosition() {
    return this.items.head.headPosition();
  }

  tailPosition() {
    return this.items.tail.tailPosition();
  }

  get isBlank() {
    return this.items.isEmpty;
  }

  clone() {
    let newSection = this.builder.createListSection(this.tagName);
    forEach(this.items, i => newSection.items.append(i.clone()));
    return newSection;
  }

  /**
   * Mutates this list
   * @param {ListSection|Markerable}
   * @return null
   */
  join(other) {
    if (other.isListSection) {
      other.items.forEach(i => this.join(i));
    } else if (other.isMarkerable) {
      let item = this.builder.createListItem();
      item.join(other);
      this.items.append(item);
    }
  }
}
