export const CARD_TYPE = 'card-section';

export default class Card {
  constructor(name, payload) {
    this.name = name;
    this.payload = payload;
    this.type = CARD_TYPE;
  }
}
