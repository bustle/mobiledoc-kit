import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('mobiledoc-dom-renderer', 'Integration | Component | mobiledoc dom renderer', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`{{mobiledoc-dom-renderer}}`);
  assert.equal(this.$().text().trim(), '');
});
