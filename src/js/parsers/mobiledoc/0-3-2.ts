import {
  MobiledocMarkerType,
  MobiledocCard,
  MobiledocAtom,
  MobiledocMarker,
  MobiledocCardSection,
  MobiledocImageSection,
  MobiledocMarkupSection,
  MobiledocListSection,
} from '../../renderers/mobiledoc/0-3'

import { kvArrayToObject, filter, ForEachable } from '../../utils/array-utils'
import assert from '../../utils/assert'
import { entries } from '../../utils/object-utils'
import Markup from '../../models/markup'
import PostNodeBuilder from '../../models/post-node-builder'
import {
  MobiledocV0_3_2,
  MobiledocAttributedMarkupSection,
  MobiledocAttributedListSection,
  MobiledocAttributedSection,
} from '../../renderers/mobiledoc/0-3-2'
import Post from '../../models/post'
import { MobiledocSectionKind, MobiledocMarkerKind } from '../../renderers/mobiledoc/constants'
import ListSection from '../../models/list-section'
import Markerable from '../../models/_markerable'

/*
 * Parses from mobiledoc -> post
 */
export default class MobiledocParser {
  builder: PostNodeBuilder
  markups!: Markup[]
  markerTypes!: Markup[]
  cardTypes!: MobiledocCard[]
  atomTypes!: MobiledocAtom[]

  constructor(builder: PostNodeBuilder) {
    this.builder = builder
  }

  /**
   * @param {Mobiledoc}
   * @return {Post}
   */
  parse({ sections, markups: markerTypes, cards: cardTypes, atoms: atomTypes }: MobiledocV0_3_2): Post {
    try {
      const post = this.builder.createPost()

      this.markups = []
      this.markerTypes = this.parseMarkerTypes(markerTypes)
      this.cardTypes = this.parseCardTypes(cardTypes)
      this.atomTypes = this.parseAtomTypes(atomTypes)
      this.parseSections(sections, post)

      return post
    } catch (e) {
      assert(`Unable to parse mobiledoc: ${e instanceof Error ? e.message : ''}`, false)
    }
  }

  parseMarkerTypes(markerTypes: MobiledocMarkerType[]) {
    return markerTypes.map(markerType => this.parseMarkerType(markerType))
  }

  parseMarkerType([tagName, attributesArray]: MobiledocMarkerType) {
    const attributesObject = kvArrayToObject(attributesArray || [])
    return this.builder.createMarkup(tagName, attributesObject)
  }

  parseCardTypes(cardTypes: MobiledocCard[]) {
    return cardTypes.map(cardType => this.parseCardType(cardType))
  }

  parseCardType([cardName, cardPayload]: MobiledocCard): MobiledocCard {
    return [cardName, cardPayload]
  }

  parseAtomTypes(atomTypes: MobiledocAtom[]) {
    return atomTypes.map(atomType => this.parseAtomType(atomType))
  }

  parseAtomType([atomName, atomValue, atomPayload]: MobiledocAtom): MobiledocAtom {
    return [atomName, atomValue, atomPayload]
  }

  parseSections(sections: ForEachable<MobiledocAttributedSection>, post: Post) {
    sections.forEach(section => this.parseSection(section, post))
  }

  parseSection(section: MobiledocAttributedSection, post: Post) {
    switch (section[0]) {
      case MobiledocSectionKind.MARKUP:
        this.parseMarkupSection(section, post)
        break
      case MobiledocSectionKind.IMAGE:
        this.parseImageSection(section, post)
        break
      case MobiledocSectionKind.CARD:
        this.parseCardSection(section, post)
        break
      case MobiledocSectionKind.LIST:
        this.parseListSection(section, post)
        break
      default:
        assert(`Unexpected section type ${section[0]}`, false)
    }
  }

  getAtomTypeFromIndex(index: number) {
    const atomType = this.atomTypes[index]
    assert(`No atom definition found at index ${index}`, !!atomType)
    return atomType
  }

  getCardTypeFromIndex(index: number) {
    const cardType = this.cardTypes[index]
    assert(`No card definition found at index ${index}`, !!cardType)
    return cardType
  }

  parseCardSection([, cardIndex]: MobiledocCardSection, post: Post) {
    const [name, payload] = this.getCardTypeFromIndex(cardIndex)
    const section = this.builder.createCardSection(name, payload)
    post.sections.append(section)
  }

  parseImageSection([, src]: MobiledocImageSection, post: Post) {
    const section = this.builder.createImageSection(src)
    post.sections.append(section)
  }

  parseMarkupSection(
    [, tagName, markers, attributesArray]: MobiledocMarkupSection | MobiledocAttributedMarkupSection,
    post: Post
  ) {
    const section = this.builder.createMarkupSection(tagName)
    post.sections.append(section)
    if (attributesArray) {
      entries(kvArrayToObject(attributesArray)).forEach(([key, value]) => {
        section.setAttribute(key, value)
      })
    }
    this.parseMarkers(markers, section)
    // Strip blank markers after they have been created. This ensures any
    // markup they include has been correctly populated.
    filter(section.markers, m => m.isBlank).forEach(m => {
      section.markers.remove(m)
    })
  }

  parseListSection(
    [, tagName, items, attributesArray]: MobiledocListSection | MobiledocAttributedListSection,
    post: Post
  ) {
    const section = this.builder.createListSection(tagName)
    post.sections.append(section)
    if (attributesArray) {
      entries(kvArrayToObject(attributesArray)).forEach(([key, value]) => {
        section.setAttribute(key, value)
      })
    }
    this.parseListItems(items, section)
  }

  parseListItems(items: MobiledocMarker[][], section: ListSection) {
    items.forEach(i => this.parseListItem(i, section))
  }

  parseListItem(markers: MobiledocMarker[], section: ListSection) {
    const item = this.builder.createListItem()
    this.parseMarkers(markers, item)
    section.items.append(item)
  }

  parseMarkers(markers: MobiledocMarker[], parent: Markerable) {
    markers.forEach(m => this.parseMarker(m, parent))
  }

  parseMarker([type, markerTypeIndexes, closeCount, value]: MobiledocMarker, parent: Markerable) {
    markerTypeIndexes.forEach(index => {
      this.markups.push(this.markerTypes[index])
    })

    const marker = this.buildMarkerType(type, value)
    parent.markers.append(marker)

    this.markups = this.markups.slice(0, this.markups.length - closeCount)
  }

  buildMarkerType(type: MobiledocMarkerKind, value: string | number) {
    switch (type) {
      case MobiledocMarkerKind.MARKUP:
        return this.builder.createMarker(value as string, this.markups.slice())
      case MobiledocMarkerKind.ATOM: {
        const [atomName, atomValue, atomPayload] = this.getAtomTypeFromIndex(value as number)
        return this.builder.createAtom(atomName, atomValue, atomPayload, this.markups.slice())
      }
      default:
        assert(`Unexpected marker type ${type}`, false)
    }
  }
}
