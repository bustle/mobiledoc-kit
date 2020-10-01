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
import Atom from '../../models/atom'
import { Dict } from '../../utils/types'
import { MobiledocSectionKind, MobiledocMarkerKind } from './constants'

export const MOBILEDOC_VERSION = '0.3.0'

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
  [Type.ATOM](node: Atom, opcodes: Opcodes) {
    opcodes.push(['openAtom', node.closedMarkups.length, node.name, node.value, node.payload])
    visitArray(visitor, node.openedMarkups, opcodes)
  },
}

export type MobiledocMarkupMarker = [MobiledocMarkerKind.MARKUP, number[], number, string]
export type MobiledocAtomMarker = [MobiledocMarkerKind.ATOM, number[], number, number]

export type MobiledocMarker = MobiledocMarkupMarker | MobiledocAtomMarker

export type MobiledocMarkupSection = [MobiledocSectionKind.MARKUP, string, MobiledocMarker[]]
export type MobiledocListSection = [MobiledocSectionKind.LIST, string, MobiledocMarker[][]]
export type MobiledocImageSection = [MobiledocSectionKind.IMAGE, string]
export type MobiledocCardSection = [MobiledocSectionKind.CARD, number]

export type MobiledocSection =
  | MobiledocMarkupSection
  | MobiledocListSection
  | MobiledocImageSection
  | MobiledocCardSection

export type MobiledocAtom = [string, string, {}]
export type MobiledocCard = [string, {}]
export type MobiledocMarkerType = [string, string[]?]

class PostOpcodeCompiler {
  markupMarkerIds!: number[]
  markers!: MobiledocMarker[]
  sections!: MobiledocSection[]
  items!: MobiledocMarker[][]
  markerTypes!: MobiledocMarkerType[]
  atomTypes!: MobiledocAtom[]
  cardTypes!: MobiledocCard[]
  result!: MobiledocV0_3

  _markerTypeCache!: Dict<number>

  openMarker(closeCount: number, value: string) {
    this.markupMarkerIds = []
    this.markers.push([MobiledocMarkerKind.MARKUP, this.markupMarkerIds, closeCount, value || ''])
  }

  openAtom(closeCount: number, name: string, value: string, payload: {}) {
    const index = this._addAtomTypeIndex(name, value, payload)
    this.markupMarkerIds = []
    this.markers.push([MobiledocMarkerKind.ATOM, this.markupMarkerIds, closeCount, index])
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
    const index = this._addCardTypeIndex(name, payload)
    this.sections.push([MobiledocSectionKind.CARD, index])
  }

  openPost() {
    this.atomTypes = []
    this.cardTypes = []
    this.markerTypes = []
    this.sections = []
    this.result = {
      version: MOBILEDOC_VERSION,
      atoms: this.atomTypes,
      cards: this.cardTypes,
      markups: this.markerTypes,
      sections: this.sections,
    }
  }

  openMarkup(tagName: string, attributes: string[]) {
    const index = this._findOrAddMarkerTypeIndex(tagName, attributes)
    this.markupMarkerIds.push(index)
  }

  _addCardTypeIndex(cardName: string, payload: {}) {
    let cardType: MobiledocCard = [cardName, payload]
    this.cardTypes.push(cardType)
    return this.cardTypes.length - 1
  }

  _addAtomTypeIndex(atomName: string, atomValue: string, payload: {}) {
    let atomType: MobiledocAtom = [atomName, atomValue, payload]
    this.atomTypes.push(atomType)
    return this.atomTypes.length - 1
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

export interface MobiledocV0_3 {
  version: typeof MOBILEDOC_VERSION
  atoms: MobiledocAtom[]
  cards: MobiledocCard[]
  markups: MobiledocMarkerType[]
  sections: MobiledocSection[]
}

/**
 * Render from post -> mobiledoc
 */
export default {
  /**
   * @param {Post}
   * @return {Mobiledoc}
   */
  render(post: Post): MobiledocV0_3 {
    let opcodes: Opcodes = []
    visit(visitor, post, opcodes)
    let compiler = new PostOpcodeCompiler()
    compile(compiler, opcodes)
    return compiler.result
  },
}
