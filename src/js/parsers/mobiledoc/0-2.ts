import {
  MobiledocMarkerType,
  MobiledocV0_2,
  MobiledocSection,
  MobiledocMarker,
  MobiledocCardSection,
  MobiledocImageSection,
  MobiledocMarkupSection,
  MobiledocListSection,
} from '../../renderers/mobiledoc/0-2'
import { MobiledocSectionKind } from '../../renderers/mobiledoc/constants'
import { kvArrayToObject, filter, ForEachable } from '../../utils/array-utils'
import assert from '../../utils/assert'
import PostNodeBuilder from '../../models/post-node-builder'
import Post from '../../models/post'
import Markup from '../../models/markup'
import ListSection from '../../models/list-section'
import Markerable from '../../models/_markerable'

/*
 * Parses from mobiledoc -> post
 */
export default class MobiledocParser {
  builder: PostNodeBuilder
  markups!: Markup[]
  markerTypes!: Markup[]

  constructor(builder: PostNodeBuilder) {
    this.builder = builder
  }

  /**
   * @param {Mobiledoc}
   * @return {Post}
   */
  parse({ sections: sectionData }: MobiledocV0_2): Post {
    try {
      const markerTypes = sectionData[0]
      const sections = sectionData[1]

      const post = this.builder.createPost()

      this.markups = []
      this.markerTypes = this.parseMarkerTypes(markerTypes)
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

  parseSections(sections: ForEachable<MobiledocSection>, post: Post) {
    sections.forEach(section => this.parseSection(section, post))
  }

  parseSection(section: MobiledocSection, post: Post) {
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

  parseCardSection([, name, payload]: MobiledocCardSection, post: Post) {
    const section = this.builder.createCardSection(name, payload)
    post.sections.append(section)
  }

  parseImageSection([, src]: MobiledocImageSection, post: Post) {
    const section = this.builder.createImageSection(src)
    post.sections.append(section)
  }

  parseMarkupSection([, tagName, markers]: MobiledocMarkupSection, post: Post) {
    const section = this.builder.createMarkupSection(tagName.toLowerCase() === 'pull-quote' ? 'aside' : tagName)
    post.sections.append(section)
    this.parseMarkers(markers, section)
    // Strip blank markers after they have been created. This ensures any
    // markup they include has been correctly populated.
    filter(section.markers, m => m.isBlank).forEach(m => {
      section.markers.remove(m)
    })
  }

  parseListSection([, tagName, items]: MobiledocListSection, post: Post) {
    const section = this.builder.createListSection(tagName)
    post.sections.append(section)
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

  parseMarker([markerTypeIndexes, closeCount, value]: [number[], number, string], parent: Markerable) {
    markerTypeIndexes.forEach(index => {
      this.markups.push(this.markerTypes[index])
    })
    const marker = this.builder.createMarker(value, this.markups.slice())
    parent.markers.append(marker)
    this.markups = this.markups.slice(0, this.markups.length - closeCount)
  }
}
