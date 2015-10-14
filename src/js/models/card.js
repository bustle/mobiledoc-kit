import Section from './_section';
import { CARD_TYPE } from './types';
import { shallowCopyObject } from '../utils/copy';

export const CARD_MODES = {
  DISPLAY: 'display',
  EDIT: 'edit'
};

const DEFAULT_INITIAL_MODE = CARD_MODES.DISPLAY;

export default class Card extends Section {
  constructor(name, payload) {
    super(CARD_TYPE);
    this.name = name;
    this.payload = payload;
    this.setInitialMode(DEFAULT_INITIAL_MODE);
  }

  clone() {
    const payload = shallowCopyObject(this.payload);
    return this.builder.createCardSection(this.name, payload);
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
