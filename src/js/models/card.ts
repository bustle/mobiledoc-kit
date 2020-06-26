import Section from './_section'
import { CARD_TYPE } from './types'
import { shallowCopyObject } from '../utils/copy'

export enum CARD_MODES {
  DISPLAY = 'display',
  EDIT = 'edit',
}

const CARD_LENGTH = 1

export function isCardSection(section: Section | Card): section is Card {
  return (section as Card).isCardSection
}

export default class Card<T = {}> extends Section {
  name: string
  payload: T
  isCardSection: true
  builder: any
  _initialMode: CARD_MODES = CARD_MODES.DISPLAY

  constructor(name: string, payload: T) {
    super(CARD_TYPE)
    this.name = name
    this.payload = payload
    this.isCardSection = true
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isValidTagName(_normalizedTagName: string): boolean {
    throw new Error('Method not implemented.')
  }

  textUntil(): string {
    return ''
  }

  get isBlank() {
    return false
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
  setInitialMode(initialMode: CARD_MODES) {
    // TODO validate initialMode
    this._initialMode = initialMode
  }
}
