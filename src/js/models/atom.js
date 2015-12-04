import { ATOM_TYPE } from './types';
import mixin from '../utils/mixin';
import MarkuperableMixin from '../utils/markuperable';
import LinkedItem from '../utils/linked-item';

export default class Atom extends LinkedItem {
  constructor(name, value, payload, markups=[]) {
    super();
    this.name = name;
    this.value = value;
    this.payload = payload;
    this.type = ATOM_TYPE;
    this.isAtom = true;
    this.length = 1;

    this.markups = [];
    markups.forEach(m => this.addMarkup(m));
  }
}

mixin(Atom, MarkuperableMixin);
