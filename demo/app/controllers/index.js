import Ember from 'ember';

import * as mobiledocs from '../mobiledocs/index';

let { $, computed } = Ember;

export default Ember.Controller.extend({
  mobiledocName: 'simple',
  mobiledoc: computed('mobiledocName', function() {
    return mobiledocs[this.get('mobiledocName')];
  }),
  actions: {
    changeMobiledoc() {
      let selectElement = $('#select-mobiledoc');
      this.set('mobiledocName', selectElement.val());
    },
    didEdit(value) {
      this.set('editedMobiledoc', value);
    }
  }
});
