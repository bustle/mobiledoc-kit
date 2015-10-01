import Ember from 'ember';

export function formatObject([object]) {
  return JSON.stringify(object, null, '  ');
}

export default Ember.Helper.helper(formatObject);
