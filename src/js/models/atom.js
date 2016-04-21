import { ATOM_TYPE } from './types';
import mixin from '../utils/mixin';
import MarkuperableMixin from '../utils/markuperable';
import LinkedItem from '../utils/linked-item';
import assert from '../utils/assert';

const ATOM_LENGTH = 1;

class Atom extends LinkedItem {
  constructor(name, value, payload, markups=[]) {
    super();
    this.name = name;
    this.value = value;
    this.text = ''; // An atom never has text, but it does have a value
    assert('Atom must have value', value !== undefined && value !== null);
    this.payload = payload;
    this.type = ATOM_TYPE;
    this.isMarker = false;
    this.isAtom = true;

    this.markups = [];
    markups.forEach(m => this.addMarkup(m));
  }

  clone() {
    let clonedMarkups = this.markups.slice();
    return this.builder.createAtom(
      this.name, this.value, this.payload, clonedMarkups
    );
  }

  get isBlank() {
    return false;
  }

  get length() {
    return ATOM_LENGTH;
  }

  canJoin(/* other */) {
    return false;
  }

  textUntil(/* offset */) {
    return '';
  }

  split(offset=0, endOffset=offset) {
    let markers = [];

    if (endOffset === 0) {
      markers.push(this.builder.createMarker('', this.markups.slice()));
    }

    markers.push(this.clone());

    if (offset === ATOM_LENGTH) {
      markers.push(this.builder.createMarker('', this.markups.slice()));
    }

    return markers;
  }

  splitAtOffset(offset) {
    assert('Cannot split a marker at an offset > its length',
           offset <= this.length);

    let { builder } = this;
    let clone = this.clone();
    let blankMarker = builder.createMarker('');
    let pre, post;

    if (offset === 0) {
      ([pre, post] = [blankMarker, clone]);
    } else if (offset === ATOM_LENGTH) {
      ([pre, post] = [clone, blankMarker]);
    } else {
      assert(`Invalid offset given to Atom#splitAtOffset: "${offset}"`, false);
    }

    this.markups.forEach(markup => {
      pre.addMarkup(markup);
      post.addMarkup(markup);
    });
    return [pre, post];
  }
}

mixin(Atom, MarkuperableMixin);

export default Atom;
