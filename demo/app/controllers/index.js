import Ember from 'ember';

import * as mobiledocs from '../mobiledocs/index';

let { $, computed } = Ember;

export default Ember.Controller.extend({
  mobiledocName: 'simple',
  mobiledoc: computed('mobiledocName', function() {
    return mobiledocs[this.get('mobiledocName')];
  }),
  // This initial value for editedMobiledoc will be
  // stomped by actual changing values upon didEdit.
  editedMobiledoc: computed('mobiledoc', function() {
    return this.get('mobiledoc');
  }),
  actions: {
    changeMobiledoc() {
      let selectElement = $('#select-mobiledoc');
      let name = selectElement.val();
      this.set('mobiledocName', name);
      let mobiledoc = this.get('mobiledoc');
      this.set('editedMobiledoc', mobiledoc);
    },
    didEdit(value) {
      this.set('editedMobiledoc', value);
    }
  }
});
