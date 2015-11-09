import Helpers from '../../test-helpers';
import PostNodeBuilder from 'mobiledoc-kit/models/post-node-builder';

const {module, test} = Helpers;

module('Unit: PostNodeBuilder');

test('#createMarkup returns singleton markup', (assert) => {
  const builder = new PostNodeBuilder();
  const m1 = builder.createMarkup('strong');
  const m2 = builder.createMarkup('strong');

  assert.ok(m1 === m2, 'markups are singletons');
});

test('#createMarkup returns singleton markup when has equal attributes', (assert) => {
  const builder = new PostNodeBuilder();
  const m1 = builder.createMarkup('a', {href:'bustle.com'});
  const m2 = builder.createMarkup('a', {href:'bustle.com'});

  assert.ok(m1 === m2, 'markups with attributes are singletons');
});

test('#createMarkup returns differents markups when has different attributes', (assert) => {
  const builder = new PostNodeBuilder();
  const m1 = builder.createMarkup('a', {href:'bustle.com'});
  const m2 = builder.createMarkup('a', {href:'other.com'});

  assert.ok(m1 !== m2, 'markups with different attributes are different');
});

test('#createMarkup normalizes tagName', (assert) => {
  const builder = new PostNodeBuilder();
  const m1 = builder.createMarkup('b');
  const m2 = builder.createMarkup('B');
  const m3 = builder.createMarkup('b', {});
  const m4 = builder.createMarkup('B', {});

  assert.ok(m1 === m2 &&
            m2 === m3 &&
            m3 === m4, 'all markups are the same');
});

test('#createCardSection creates card with builder', (assert) => {
  const builder = new PostNodeBuilder();
  const cardSection = builder.createCardSection('test-card');
  assert.ok(cardSection.builder === builder, 'card section has builder');
});
