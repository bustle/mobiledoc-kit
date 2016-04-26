import Ember from 'ember';

import mobiledocs from '../mobiledocs/index';

const INITIAL_MOBILEDOC = 'simple';

let { $ } = Ember;

export default Ember.Controller.extend({
  init() {
    this._super.apply(this, arguments);
    let mobiledoc = mobiledocs[INITIAL_MOBILEDOC];
    this.set('mobiledoc', mobiledoc);
    this.set('editedMobiledoc', mobiledoc);
    this.set('rendererName', 'dom');
  },

  actions: {
    didCreateEditor(editor) {
      this.enableLogging(editor);
    },

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
  },

  enableLogging(editor) {
    editor.enableLogging();
  }
});
