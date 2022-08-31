import Section from './_section'
import { Type } from './types'
import { shallowCopyObject } from '../utils/copy'
import PostNodeBuilder from './post-node-builder'

export enum CardMode {
  DISPLAY = 'display',
  EDIT = 'edit',
}

const CARD_LENGTH = 1

export function isCardSection(section: {}): section is Card {
  return (section as Card).isCardSection
}

export type CardPayload = {}

export default class Card<T extends {} = CardPayload> extends Section {
  name: string
  payload: T
  builder!: PostNodeBuilder
  _initialMode: CardMode = CardMode.DISPLAY

  isCardSection = true

  constructor(name: string, payload: T) {
    super(Type.CARD)
    this.name = name
    this.payload = payload
    this.isCardSection = true
  }

  textUntil(): string {
    return ''
  }

  canJoin() {
    return false
  }

  get length() {
    return CARD_LENGTH
  }

  clone() {
    let payload = shallowCopyObject(this.payload)
    let card = this.builder.createCardSection(this.name, payload)
    // If this card is currently rendered, clone the mode it is
    // currently in as the default mode of the new card.
    let mode = this._initialMode
    if (this.renderNode && this.renderNode.cardNode) {
      mode = this.renderNode.cardNode.mode
    }
    card.setInitialMode(mode)
    return card
  }

  /**
   * set the mode that this will be rendered into initially
   * @private
   */
  setInitialMode(initialMode: CardMode) {
    // TODO validate initialMode
    this._initialMode = initialMode
  }
}
