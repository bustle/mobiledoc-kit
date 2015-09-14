import Section from './_section';
import { CARD_TYPE } from './types';

export default class Card extends Section {
  constructor(name, payload) {
    super(CARD_TYPE);
    this.name = name;
    this.payload = payload;
  }
}
