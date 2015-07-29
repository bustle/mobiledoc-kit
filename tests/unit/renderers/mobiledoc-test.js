import MobiledocRenderer, { MOBILEDOC_VERSION } from 'content-kit-editor/renderers/mobiledoc';
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
  assert.deepEqual(mobiledoc, {
    version: MOBILEDOC_VERSION,
    sections: [[], []]
  });
});

test('renders a post with marker', (assert) => {
  let post = builder.generatePost();
  let section = builder.generateMarkupSection('P');
  post.appendSection(section);
  section.appendMarker(
    builder.generateMarker([
      builder.generateMarkup('STRONG')
    ], 'Hi')
  );
  let mobiledoc = render(post);
  assert.deepEqual(mobiledoc, {
    version: MOBILEDOC_VERSION,
    sections: [
      [
        ['strong']
      ],
      [
        [1, 'P', [
          [[0], 1, 'Hi']
        ]]
      ]
    ]
  });
});

test('renders a post section with markers sharing a markup', (assert) => {
  let post = builder.generatePost();
  let section = builder.generateMarkupSection('P');
  post.appendSection(section);
  let markup = builder.generateMarkup('STRONG');
  section.appendMarker(
    builder.generateMarker([
      markup
    ], 'Hi')
  );
  section.appendMarker(
    builder.generateMarker([
      markup
    ], ' Guy')
  );
  let mobiledoc = render(post);
  assert.deepEqual(mobiledoc, {
    version: MOBILEDOC_VERSION,
    sections: [
      [
        ['strong']
      ],
      [
        [1, 'P', [
          [[0], 0, 'Hi'],
          [[], 1, ' Guy']
        ]]
      ]
    ]
  });
});

test('renders a post with image', (assert) => {
  let url = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=";
  let post = builder.generatePost();
  let section = builder.generateImageSection(url);
  post.appendSection(section);

  let mobiledoc = render(post);
  assert.deepEqual(mobiledoc, {
    version: MOBILEDOC_VERSION,
    sections: [
      [],
      [
        [2, url]
      ]
    ]
  });
});

test('renders a post with image and null src', (assert) => {
  let post = builder.generatePost();
  let section = builder.generateImageSection();
  post.appendSection(section);

  let mobiledoc = render(post);
  assert.deepEqual(mobiledoc, {
    version: MOBILEDOC_VERSION,
    sections: [
      [],
      [
        [2, null]
      ]
    ]
  });
});

test('renders a post with card', (assert) => {
  let cardName = 'super-card';
  let payload = { bar: 'baz' };
  let post = builder.generatePost();
  let section = builder.generateCardSection(cardName, payload);
  post.appendSection(section);

  let mobiledoc = render(post);
  assert.deepEqual(mobiledoc, {
    version: MOBILEDOC_VERSION,
    sections: [
      [],
      [
        [10, cardName, payload]
      ]
    ]
  });
});
