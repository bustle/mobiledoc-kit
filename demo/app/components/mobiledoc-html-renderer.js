import Ember from 'ember';
import { cardsHash } from '../mobiledoc-cards/index';

let { computed, run } = Ember;

export default Ember.Component.extend({
  htmlRenderer: computed(function(){
    return new window.MobiledocHTMLRenderer();
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
