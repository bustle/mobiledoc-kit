import Ember from 'ember';
import { cardsHash } from '../mobiledoc-cards/index';
import Renderer from 'ember-mobiledoc-dom-renderer';

let { computed, run } = Ember;

export default Ember.Component.extend({
  domRenderer: computed(function(){
    return new Renderer();
  }),
  didRender() {
    let domRenderer = this.get('domRenderer');
    let mobiledoc = this.get('mobiledoc');
    run(() => {
      let target = this.$();
      target.empty();
      if (mobiledoc) {
        domRenderer.render(mobiledoc, target[0], cardsHash);
      }
    });
  }
});
