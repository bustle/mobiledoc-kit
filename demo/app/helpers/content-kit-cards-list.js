import Ember from 'ember';
import { cardsList } from '../mobiledoc-cards/index';

export function contentKitCardsList() {
  return cardsList;
}

export default Ember.Helper.helper(contentKitCardsList);
