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

export const MOBILEDOC_VERSION = '0.3.1'
export const MOBILEDOC_MARKUP_SECTION_TYPE = 1
export const MOBILEDOC_IMAGE_SECTION_TYPE = 2
export const MOBILEDOC_LIST_SECTION_TYPE = 3
export const MOBILEDOC_CARD_SECTION_TYPE = 10

export const MOBILEDOC_MARKUP_MARKER_TYPE = 0
export const MOBILEDOC_ATOM_MARKER_TYPE = 1

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

type OpcodeCompilerMarker = [number, number[], number, unknown]
type OpcodeCompilerSection =
  | [typeof MOBILEDOC_MARKUP_SECTION_TYPE, string, OpcodeCompilerMarker[]]
  | [typeof MOBILEDOC_LIST_SECTION_TYPE, string, OpcodeCompilerMarker[][]]
  | [typeof MOBILEDOC_IMAGE_SECTION_TYPE, string]
  | [typeof MOBILEDOC_CARD_SECTION_TYPE, number]

type OpcodeCompilerAtom = [string, unknown, {}]
type OpcodeCompilerCard = [string, {}]
type OpcodeCompilerMarkerType = [string, string[]?]

export interface Mobiledoc0_3_1 {
  version: typeof MOBILEDOC_VERSION
  atoms: OpcodeCompilerAtom[]
  cards: OpcodeCompilerCard[]
  markups: OpcodeCompilerMarkerType[]
  sections: OpcodeCompilerSection[]
}

class PostOpcodeCompiler {
  markupMarkerIds!: number[]
  markers!: OpcodeCompilerMarker[]
  sections!: OpcodeCompilerSection[]
  items!: OpcodeCompilerMarker[][]
  markerTypes!: OpcodeCompilerMarkerType[]
  atomTypes!: OpcodeCompilerAtom[]
  cardTypes!: OpcodeCompilerCard[]
  result!: Mobiledoc0_3_1

  _markerTypeCache!: Dict<number>

  openMarker(closeCount: number, value: unknown) {
    this.markupMarkerIds = []
    this.markers.push([MOBILEDOC_MARKUP_MARKER_TYPE, this.markupMarkerIds, closeCount, value || ''])
  }

  openMarkupSection(tagName: string) {
    this.markers = []
    this.sections.push([MOBILEDOC_MARKUP_SECTION_TYPE, tagName, this.markers])
  }

  openListSection(tagName: string) {
    this.items = []
    this.sections.push([MOBILEDOC_LIST_SECTION_TYPE, tagName, this.items])
  }

  openListItem() {
    this.markers = []
    this.items.push(this.markers)
  }

  openImageSection(url: string) {
    this.sections.push([MOBILEDOC_IMAGE_SECTION_TYPE, url])
  }

  openCardSection(name: string, payload: {}) {
    const index = this._addCardTypeIndex(name, payload)
    this.sections.push([MOBILEDOC_CARD_SECTION_TYPE, index])
  }

  openAtom(closeCount: number, name: string, value: unknown, payload: {}) {
    const index = this._addAtomTypeIndex(name, value, payload)
    this.markupMarkerIds = []
    this.markers.push([MOBILEDOC_ATOM_MARKER_TYPE, this.markupMarkerIds, closeCount, index])
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
    let cardType: OpcodeCompilerCard = [cardName, payload]
    this.cardTypes.push(cardType)
    return this.cardTypes.length - 1
  }

  _addAtomTypeIndex(atomName: string, atomValue: unknown, payload: {}) {
    let atomType: OpcodeCompilerAtom = [atomName, atomValue, payload]
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
      let markerType: OpcodeCompilerMarkerType = [tagName]
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

const postOpcodeCompiler = new PostOpcodeCompiler()

/**
 * Render from post -> mobiledoc
 */
export default {
  /**
   * @param {Post}
   * @return {Mobiledoc}
   */
  render(post: Post): Mobiledoc0_3_1 {
    let opcodes = []
    visit(visitor, post, opcodes)
    let compiler = Object.create(postOpcodeCompiler)
    compile(compiler, opcodes)
    return compiler.result
  },
}
