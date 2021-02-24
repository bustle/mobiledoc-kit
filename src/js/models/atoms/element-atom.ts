import { Type } from '../types'
import Markuperable from '../../utils/markuperable'
import assert from '../../utils/assert'
import Markup from '../markup'
import PostNodeBuilder from '../post-node-builder'
import AtomType from './atom-type'

const ATOM_LENGTH = 1

export default class ElementAtom extends Markuperable {
  type: Type = Type.ATOM
  atomType = AtomType.ELEMENT

  isMarker = false
  isAtom = true

  name: string
  value: string = ''
  text: string = ''

  markups: Markup[]
  builder!: PostNodeBuilder

  constructor(tagName: string, markups: Markup[] = []) {
    super()
    this.name = tagName

    this.markups = []
    markups.forEach(m => this.addMarkup(m))
  }

  clone() {
    let clonedMarkups = this.markups.slice()
    return this.builder.createElementAtom(this.name, clonedMarkups)
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
