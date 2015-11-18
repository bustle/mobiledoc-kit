import Ember from 'ember';
import cards from '../mobiledoc-cards/dom';

export function mobiledocCardsList() {
  return cards;
}

export default Ember.Helper.helper(mobiledocCardsList);
