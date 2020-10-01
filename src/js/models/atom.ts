import { Type } from './types'
import Markuperable from '../utils/markuperable'
import assert from '../utils/assert'
import Markup from './markup'
import PostNodeBuilder, { PostNode } from './post-node-builder'

const ATOM_LENGTH = 1

export type AtomPayload = {}

export default class Atom extends Markuperable {
  type: Type = Type.ATOM
  isAtom = true

  name: string
  value: string
  text: string
  payload: {}

  markups: Markup[]
  builder!: PostNodeBuilder

  constructor(name: string, value: string, payload: AtomPayload, markups: Markup[] = []) {
    super()
    this.name = name
    this.value = value
    this.text = '' // An atom never has text, but it does have a value
    assert('Atom must have value', value !== undefined && value !== null)
    this.payload = payload
    this.type = Type.ATOM
    this.isMarker = false
    this.isAtom = true

    this.markups = []
    markups.forEach(m => this.addMarkup(m))
  }

  clone() {
    let clonedMarkups = this.markups.slice()
    return this.builder.createAtom(this.name, this.value, this.payload, clonedMarkups)
  }

  get isBlank() {
    return false
  }

  get length() {
    return ATOM_LENGTH
  }

  canJoin(/* other */) {
    return false
  }

  textUntil(/* offset */) {
    return ''
  }

  split(offset = 0, endOffset = offset) {
    let markers: Markuperable[] = []

    if (endOffset === 0) {
      markers.push(this.builder.createMarker('', this.markups.slice()))
    }

    markers.push(this.clone())

    if (offset === ATOM_LENGTH) {
      markers.push(this.builder.createMarker('', this.markups.slice()))
    }

    return markers
  }

  splitAtOffset(offset: number): [Markuperable, Markuperable] {
    assert('Cannot split a marker at an offset > its length', offset <= this.length)

    let { builder } = this
    let clone = this.clone()
    let blankMarker = builder.createMarker('')
    let pre: Markuperable, post: Markuperable

    if (offset === 0) {
      ;[pre, post] = [blankMarker, clone]
    } else if (offset === ATOM_LENGTH) {
      ;[pre, post] = [clone, blankMarker]
    } else {
      assert(`Invalid offset given to Atom#splitAtOffset: "${offset}"`, false)
    }

    this.markups.forEach(markup => {
      pre.addMarkup(markup)
      post.addMarkup(markup)
    })
    return [pre, post]
  }
}

export function isAtom(postNode: PostNode): postNode is Atom {
  return postNode.type === Type.ATOM
}
