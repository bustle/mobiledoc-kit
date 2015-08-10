import LinkedItem from "content-kit-editor/utils/linked-item";

export const CARD_TYPE = 'card-section';

export default class Card extends LinkedItem {
  constructor(name, payload) {
    super();
    this.name = name;
    this.payload = payload;
    this.type = CARD_TYPE;
  }
}
