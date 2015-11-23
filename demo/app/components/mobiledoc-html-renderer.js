import Ember from 'ember';
import cards from '../mobiledoc-cards/html';
import Renderer from 'ember-mobiledoc-html-renderer';

let { run } = Ember;

let renderer = new Renderer({cards});

export default Ember.Component.extend({
  didRender() {
    let mobiledoc = this.get('mobiledoc');
    if (!mobiledoc) {
      return;
    }

    run(() => {
      let target = this.$();
      let { result: html } = renderer.render(mobiledoc);
      target.text(html);
    });
  }
});
