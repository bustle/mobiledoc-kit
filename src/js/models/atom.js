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

  clone() {
    let clonedMarkups = this.markups.slice();
    return this.builder.createAtom(
      this.name, this.value, this.payload, clonedMarkups
    );
  }

  split(offset=0, endOffset=1) {
    let markers = [];

    if (endOffset === 0) {
      markers.push(
        this.builder.createMarker('', this.markups.slice())
      );
    }

    markers.push(
      this.clone()
    );

    if (offset === 1) {
      markers.push(
        this.builder.createMarker('', this.markups.slice())
      );
    }

    return markers;
  }

}

mixin(Atom, MarkuperableMixin);
