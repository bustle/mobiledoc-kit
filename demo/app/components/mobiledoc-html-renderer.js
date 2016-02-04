import Ember from 'ember';
import cards from '../mobiledoc-cards/html';
import atoms from '../mobiledoc-atoms/html';
import Renderer from 'ember-mobiledoc-html-renderer';

let renderer = new Renderer({cards, atoms});

export default Ember.Component.extend({
  didRender() {
    let mobiledoc = this.get('mobiledoc');
    if (!mobiledoc) {
      return;
    }

    let target = this.$();
    target.empty();
    try {
      let { result: html } = renderer.render(mobiledoc);
      target.text(html);
    } catch (e) {
      console.error(e);
      let result = document.createTextNode(e.message);
      target.append(result);
    }
  }
});
