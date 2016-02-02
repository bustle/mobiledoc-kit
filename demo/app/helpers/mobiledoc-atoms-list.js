import Ember from 'ember';
import atoms from '../mobiledoc-atoms/dom';

export function mobiledocAtomsList() {
  return atoms;
}

export default Ember.Helper.helper(mobiledocAtomsList);
