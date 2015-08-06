const {module, test} = QUnit;

import PostParser from 'content-kit-editor/parsers/post';
import PostNodeBuilder from 'content-kit-editor/models/post-node-builder';
import Helpers from '../../test-helpers';

let builder, parser;

module('Unit: Parser: PostParser', {
  beforeEach() {
    builder = new PostNodeBuilder();
    parser = new PostParser(builder);
  },
  afterEach() {
    builder = null;
    parser = null;
  }
});

test('#parse can parse a section element', (assert) => {
  let element = Helpers.dom.makeDOM(t =>
    t('div', {}, [
      t('p', {}, [
        t.text('some text')
      ])
    ])
  );

  const post = parser.parse(element);
  assert.ok(post, 'gets post');
  assert.equal(post.sections.length, 1, 'has 1 section');

  const s1 = post.sections[0];
  assert.equal(s1.markers.length, 1, 's1 has 1 marker');
  assert.equal(s1.markers[0].value, 'some text', 'has text');
});

test('#parse can parse multiple elements', (assert) => {
  let element = Helpers.dom.makeDOM(t =>
    t('div', {}, [
      t('p', {}, [
        t.text('some text')
      ]),
      t('p', {}, [
        t.text('some other text')
      ])
    ])
  );

  const post = parser.parse(element);
  assert.ok(post, 'gets post');
  assert.equal(post.sections.length, 2, 'has 2 sections');

  const [s1, s2] = post.sections;
  assert.equal(s1.markers.length, 1, 's1 has 1 marker');
  assert.equal(s1.markers[0].value, 'some text');

  assert.equal(s2.markers.length, 1, 's2 has 1 marker');
  assert.equal(s2.markers[0].value, 'some other text');
});

