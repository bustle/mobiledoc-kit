import Ember from 'ember';
import cards from '../mobiledoc-cards/text';
import Renderer from 'ember-mobiledoc-text-renderer';

let renderer = new Renderer({cards});

let addHTMLEntitites = (str) => {
  return str.replace(/</g,  '&lt;')
            .replace(/>/g,  '&gt;')
            .replace(/\n/g, '<br>');
};

export default Ember.Component.extend({
  didRender() {
    let mobiledoc = this.get('mobiledoc');
    if (!mobiledoc) {
      return;
    }
    if (this._teardownRender) {
      this._teardownRender();
      this._teardownRender = null;
    }

    let target = this.$();
    target.empty();
    try {
      let {result: text, teardown} = renderer.render(mobiledoc);

      text = addHTMLEntitites(text);
      target.html(text);

      this._teardownRender = teardown;
    } catch(e) {
      console.error(e);
      let result = document.createTextNode(e.message);
      target.append(result);
    }
  }
});
