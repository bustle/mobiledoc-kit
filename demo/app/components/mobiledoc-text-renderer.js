import Ember from 'ember';
import { cardsHash } from '../mobiledoc-cards/index';

let { computed, run } = Ember;

export default Ember.Component.extend({
  textRenderer: computed(function(){
    return new window.MobiledocTextRenderer();
  }),
  didRender() {
    let renderer = this.get('textRenderer');
    let mobiledoc = this.get('mobiledoc');
    run(() => {
      let target = this.$();
      target.empty();
      if (mobiledoc) {
        let text = renderer.render(mobiledoc, cardsHash);
        text = text.replace(/</g, '&lt;')
                   .replace(/>/g,'&gt;')
                   .replace(/\n/g, '<br>');
        target.html(text);
      }
    });
  }
});
