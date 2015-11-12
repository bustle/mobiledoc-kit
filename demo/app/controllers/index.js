import Ember from 'ember';

import mobiledocs from '../mobiledocs/index';

let { $ } = Ember;

export default Ember.Controller.extend({
  init() {
    this._super.apply(this, arguments);
    let mobiledoc = mobiledocs['simple'];
    this.set('mobiledoc', mobiledoc);
    this.set('editedMobiledoc', mobiledoc);
    this.set('rendererName', 'dom');
  },

  actions: {
    changeMobiledoc() {
      let selectElement = $('#select-mobiledoc');
      let name = selectElement.val();
      let mobiledoc = mobiledocs[name];

      this.set('mobiledoc', mobiledoc);
      this.set('editedMobiledoc', mobiledoc);
    },

    setRenderer(rendererName) {
      this.set('rendererName', rendererName);
    },

    didEdit(value) {
      this.set('editedMobiledoc', value);
    }
  }
});
