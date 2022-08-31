import Markerable from './_markerable'
import { Type } from './types'
import { normalizeTagName } from '../utils/dom-utils'
import { contains } from '../utils/array-utils'
import Section from './_section'
import { expect } from '../utils/assert'
import Marker from './marker'
import Markuperable from '../utils/markuperable'
import ListSection from './list-section'

export const VALID_LIST_ITEM_TAGNAMES = ['li'].map(normalizeTagName)

export default class ListItem extends Markerable {
  isListItem = true
  isNested = true
  section: Section | null = null
  // @ts-ignore: TODO: remove ignore
  parent!: ListSection

  constructor(tagName: string, markers: Markuperable[] = []) {
    super(Type.LIST_ITEM, tagName, markers)
  }

  isValidTagName(normalizedTagName: string) {
    return contains(VALID_LIST_ITEM_TAGNAMES, normalizedTagName)
  }

  splitAtMarker(marker: Marker, offset = 0): [Section, Section] {
    // FIXME need to check if we are going to split into two list items
    // or a list item and a new markup section:
    const isLastItem = !this.next
    const createNewSection = !marker && offset === 0 && isLastItem

    let [beforeSection, afterSection] = [
      this.builder.createListItem(),
      createNewSection ? this.builder.createMarkupSection() : this.builder.createListItem(),
    ]

    return this._redistributeMarkers(beforeSection, afterSection, marker, offset)
  }

  // @ts-ignore: TODO: remove ignore
  get post() {
    return expect(this.section, 'expected list item to have section').post
  }
}

export function isListItem(section: Section): section is ListItem {
  return section.isListItem
}
