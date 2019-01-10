import mobiledocRenderers, { MOBILEDOC_VERSION } from 'mobiledoc-kit/renderers/mobiledoc/index';
import Helpers from '../../test-helpers';

const { module, test } = Helpers;

function render(post) {
  return mobiledocRenderers.render(post);
}

module('Unit: Mobiledoc Renderer');

test('renders a blank post', (assert) => {
  let post = Helpers.postAbstract.build(({post}) => post());
  let mobiledoc = render(post);
  assert.deepEqual(mobiledoc, {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [],
    markups: [],
    sections: []
  });
});
