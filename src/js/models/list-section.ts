import { LIST_SECTION_TYPE } from './types'
import Section from './_section'
import { attributable } from './_attributable'
import LinkedList from '../utils/linked-list'
import { forEach, contains } from '../utils/array-utils'
import { normalizeTagName } from '../utils/dom-utils'
import assert from '../utils/assert'
import { entries } from '../utils/object-utils'
import ListItem from './list-item'
import { tagNameable } from './_tag-nameable'
import HasChildSections from './_has-child-sections'
import { PostNode } from './post-node-builder'

export const VALID_LIST_SECTION_TAGNAMES = ['ul', 'ol'].map(normalizeTagName)

export const DEFAULT_TAG_NAME = VALID_LIST_SECTION_TAGNAMES[0]

export default class ListSection extends attributable(tagNameable(Section)) implements HasChildSections<ListItem> {
  isListSection = true
  isLeafSection = false

  items: LinkedList<ListItem>
  sections: LinkedList<ListItem>

  constructor(tagName = DEFAULT_TAG_NAME, items: ListItem[] = [], attributes = {}) {
    super(LIST_SECTION_TYPE)
    this.tagName = tagName

    entries(attributes).forEach(([k, v]) => this.setAttribute(k, v))

    this.items = new LinkedList<ListItem>({
      adoptItem: i => {
        assert(`Cannot insert non-list-item to list (is: ${i.type})`, i.isListItem)
        i.section = i._parent = this
      },
      freeItem: i => (i.section = i._parent = null),
    })
    this.sections = this.items

    items.forEach(i => this.items.append(i))
  }

  canJoin() {
    return false
  }

  isValidTagName(normalizedTagName: string) {
    return contains(VALID_LIST_SECTION_TAGNAMES, normalizedTagName)
  }

  headPosition() {
    return this.items.head!.headPosition()
  }

  tailPosition() {
    return this.items.tail!.tailPosition()
  }

  get isBlank() {
    return this.items.isEmpty
  }

  clone() {
    let newSection = this.builder.createListSection(this.tagName)
    forEach(this.items, i => newSection.items.append(i.clone()))
    return newSection
  }

  /**
   * Mutates this list
   * @param {ListSection|Markerable}
   * @return null
   */
  join(other) {
    if (other.isListSection) {
      other.items.forEach(i => this.join(i))
    } else if (other.isMarkerable) {
      let item = this.builder.createListItem()
      item.join(other)
      this.items.append(item)
    }
  }
}

export function isListSection(section: PostNode): section is ListSection {
  return (section as Section).isListSection
}
