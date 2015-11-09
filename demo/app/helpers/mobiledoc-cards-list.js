import Ember from 'ember';
import { cardsList } from '../mobiledoc-cards/index';

export function mobiledocCardsList() {
  return cardsList;
}

export default Ember.Helper.helper(mobiledocCardsList);
