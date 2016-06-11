import Ember from 'ember';
import formatMobiledoc from 'npm:mobiledoc-pretty-json-renderer';

export function formatObject([object]) {
  return formatMobiledoc(object);
}

export default Ember.Helper.helper(formatObject);
