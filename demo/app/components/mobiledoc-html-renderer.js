import Ember from 'ember';
import { cardsHash } from '../mobiledoc-cards/index';
import Renderer from 'ember-mobiledoc-html-renderer';

let { computed, run } = Ember;

export default Ember.Component.extend({
  htmlRenderer: computed(function(){
    return new Renderer();
  }),
  didRender() {
    let renderer = this.get('htmlRenderer');
    let mobiledoc = this.get('mobiledoc');
    run(() => {
      let target = this.$();
      target.empty();
      if (mobiledoc) {
        let html = renderer.render(mobiledoc, cardsHash);
        target.text(html);
      }
    });
  }
});
