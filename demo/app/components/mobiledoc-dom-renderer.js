import Ember from 'ember';
import { cardsHash } from '../mobiledoc-cards/index';

let { computed, run } = Ember;

export default Ember.Component.extend({
  domRenderer: computed(function(){
    return new window.MobiledocDOMRenderer();
  }),
  didRender() {
    let domRenderer = this.get('domRenderer');
    let mobiledoc = this.get('mobiledoc');
    run(() => {
      let target = this.$('.rendered-mobiledoc');
      target.empty();
      if (mobiledoc) {
        domRenderer.render(mobiledoc, target[0], cardsHash);
      }
    });
  }
});
