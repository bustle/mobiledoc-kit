import Section from './_section';
import { CARD_TYPE } from './types';
import { shallowCopyObject } from '../utils/copy';

export const CARD_MODES = {
  DISPLAY: 'display',
  EDIT: 'edit'
};

const CARD_LENGTH = 1;

const DEFAULT_INITIAL_MODE = CARD_MODES.DISPLAY;

export default class Card extends Section {
  constructor(name, payload) {
    super(CARD_TYPE);
    this.name = name;
    this.payload = payload;
    this.setInitialMode(DEFAULT_INITIAL_MODE);
    this.isCardSection = true;
  }

  get isBlank() {
    return false;
  }

  canJoin() {
    return false;
  }

  get length() {
    return CARD_LENGTH;
  }

  clone() {
    let payload = shallowCopyObject(this.payload);
    let card = this.builder.createCardSection(this.name, payload);
    // If this card is currently rendered, clone the mode it is
    // currently in as the default mode of the new card.
    let mode = this._initialMode;
    if (this.renderNode && this.renderNode.cardNode) {
      mode = this.renderNode.cardNode.mode;
    }
    card.setInitialMode(mode);
    return card;
  }

  /**
   * set the mode that this will be rendered into initially
   * @private
   */
  setInitialMode(initialMode) {
    // TODO validate initialMode
    this._initialMode = initialMode;
  }
}
