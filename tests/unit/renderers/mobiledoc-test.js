import MobiledocRenderer from 'content-kit-editor/renderers/mobiledoc';
import { generateBuilder } from 'content-kit-editor/utils/post-builder';

const { module, test } = window.QUnit;
const render = MobiledocRenderer.render;
let builder;


module('Unit: Mobiledoc Renderer', {
  beforeEach() {
    builder = generateBuilder();
  }
});

test('renders a blank post', (assert) => {
  let post = builder.generatePost();
  let mobiledoc = render(post);
  assert.deepEqual(mobiledoc, [[], []]);
});

test('renders a post with marker', (assert) => {
  let post = builder.generatePost();
  let section = builder.generateSection('P');
  post.appendSection(section);
  section.markers.push(
    builder.generateMarker([
      builder.generateMarkerType('STRONG')
    ], 1, 'Hi')
  );
  let mobiledoc = render(post);
  assert.deepEqual(mobiledoc, [
    [
      ['STRONG']
    ],
    [
      [1, 'P', [
        [[0], 1, 'Hi']
      ]]
    ]
  ]);
});
