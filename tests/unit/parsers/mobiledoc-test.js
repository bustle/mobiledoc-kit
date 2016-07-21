import mobiledocParsers from 'mobiledoc-kit/parsers/mobiledoc';
import { MOBILEDOC_VERSION } from 'mobiledoc-kit/renderers/mobiledoc/0-2';
import PostNodeBuilder from 'mobiledoc-kit/models/post-node-builder';
import Helpers from '../../test-helpers';

const { module, test } = Helpers;

let builder, post;

function parse(mobiledoc) {
  return mobiledocParsers.parse(builder, mobiledoc);
}

module('Unit: Parsers: Mobiledoc', {
  beforeEach() {
    builder = new PostNodeBuilder();
    post = builder.createPost();
  },
  afterEach() {
    builder = null;
    post = null;
  }
});

test('#parse empty doc returns an empty post', (assert) => {
  const mobiledoc = {
    version: MOBILEDOC_VERSION,
    sections: [[], []]
  };

  const parsed = parse(mobiledoc);
  assert.equal(parsed.sections.length, 0, '0 sections');
});


test('#parse basic mobiledoc from renderer works', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(({post, markupSection, marker}) => {
    return post([markupSection('p', [
      marker('Howdy')
    ])]);
  });

  const parsed = parse(mobiledoc);
  assert.equal(parsed.sections.length, 1, '1 section');
});
