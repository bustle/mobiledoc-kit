import { visit, visitArray, compile, Opcodes } from '../../utils/compiler'
import { objectToSortedKVArray } from '../../utils/array-utils'
import { Type } from '../../models/types'
import Post from '../../models/post'
import MarkupSection from '../../models/markup-section'
import ListSection from '../../models/list-section'
import ListItem from '../../models/list-item'
import Image from '../../models/image'
import Card from '../../models/card'
import Marker from '../../models/marker'
import Markup from '../../models/markup'
import { MobiledocSectionKind } from './constants'

export const MOBILEDOC_VERSION = '0.2.0'

const visitor = {
  [Type.POST](node: Post, opcodes: Opcodes) {
    opcodes.push(['openPost'])
    visitArray(visitor, node.sections, opcodes)
  },
  [Type.MARKUP_SECTION](node: MarkupSection, opcodes: Opcodes) {
    opcodes.push(['openMarkupSection', node.tagName])
    visitArray(visitor, node.markers, opcodes)
  },
  [Type.LIST_SECTION](node: ListSection, opcodes: Opcodes) {
    opcodes.push(['openListSection', node.tagName])
    visitArray(visitor, node.items, opcodes)
  },
  [Type.LIST_ITEM](node: ListItem, opcodes: Opcodes) {
    opcodes.push(['openListItem'])
    visitArray(visitor, node.markers, opcodes)
  },
  [Type.IMAGE_SECTION](node: Image, opcodes: Opcodes) {
    opcodes.push(['openImageSection', node.src])
  },
  [Type.CARD](node: Card, opcodes: Opcodes) {
    opcodes.push(['openCardSection', node.name, node.payload])
  },
  [Type.MARKER](node: Marker, opcodes: Opcodes) {
    opcodes.push(['openMarker', node.closedMarkups.length, node.value])
    visitArray(visitor, node.openedMarkups, opcodes)
  },
  [Type.MARKUP](node: Markup, opcodes: Opcodes) {
    opcodes.push(['openMarkup', node.tagName, objectToSortedKVArray(node.attributes)])
  },
}

export type MobiledocMarker = [number[], number, string]
export type MobiledocMarkerType = [string, string[]?]

export type MobiledocMarkupSection = [MobiledocSectionKind.MARKUP, string, MobiledocMarker[]]
export type MobiledocListSection = [MobiledocSectionKind.LIST, string, MobiledocMarker[][]]
export type MobiledocImageSection = [MobiledocSectionKind.IMAGE, string]
export type MobiledocCardSection = [MobiledocSectionKind.CARD, string, {}]

export type MobiledocSection =
  | MobiledocMarkupSection
  | MobiledocListSection
  | MobiledocImageSection
  | MobiledocCardSection

class PostOpcodeCompiler {
  markupMarkerIds!: number[]
  markers!: MobiledocMarker[]
  sections!: MobiledocSection[]
  items!: MobiledocMarker[][]
  markerTypes!: MobiledocMarkerType[]
  result!: MobiledocV0_2

  _markerTypeCache!: { [key: string]: number }

  openMarker(closeCount: number, value: string) {
    this.markupMarkerIds = []
    this.markers.push([this.markupMarkerIds, closeCount, value || ''])
  }

  openMarkupSection(tagName: string) {
    this.markers = []
    this.sections.push([MobiledocSectionKind.MARKUP, tagName, this.markers])
  }

  openListSection(tagName: string) {
    this.items = []
    this.sections.push([MobiledocSectionKind.LIST, tagName, this.items])
  }

  openListItem() {
    this.markers = []
    this.items.push(this.markers)
  }

  openImageSection(url: string) {
    this.sections.push([MobiledocSectionKind.IMAGE, url])
  }

  openCardSection(name: string, payload: {}) {
    this.sections.push([MobiledocSectionKind.CARD, name, payload])
  }

  openPost() {
    this.markerTypes = []
    this.sections = []
    this.result = {
      version: MOBILEDOC_VERSION,
      sections: [this.markerTypes, this.sections],
    }
  }

  openMarkup(tagName: string, attributes: string[]) {
    const index = this._findOrAddMarkerTypeIndex(tagName, attributes)
    this.markupMarkerIds.push(index)
  }

  _findOrAddMarkerTypeIndex(tagName: string, attributesArray: string[]) {
    if (!this._markerTypeCache) {
      this._markerTypeCache = {}
    }
    const key = `${tagName}-${attributesArray.join('-')}`

    let index = this._markerTypeCache[key]
    if (index === undefined) {
      let markerType: MobiledocMarkerType = [tagName]
      if (attributesArray.length) {
        markerType.push(attributesArray)
      }
      this.markerTypes.push(markerType)

      index = this.markerTypes.length - 1
      this._markerTypeCache[key] = index
    }

    return index
  }
}

export interface MobiledocV0_2 {
  version: typeof MOBILEDOC_VERSION
  sections: [MobiledocMarkerType[], MobiledocSection[]]
}

/**
 * Render from post -> mobiledoc
 */
const MobiledocRenderer = {
  /**
   * @param {Post}
   * @return {Mobiledoc}
   */
  render(post: Post): MobiledocV0_2 {
    let opcodes: Opcodes = []
    visit(visitor, post, opcodes)
    let compiler = new PostOpcodeCompiler()
    compile(compiler, opcodes)
    return compiler.result
  },
}

export default MobiledocRenderer
