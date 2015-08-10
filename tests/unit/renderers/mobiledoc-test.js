import MobiledocRenderer from 'content-kit-editor/renderers/mobiledoc';
import {
  MOBILEDOC_VERSION
} from 'content-kit-editor/renderers/mobiledoc';
import PostNodeBuilder from 'content-kit-editor/models/post-node-builder';
import { normalizeTagName } from 'content-kit-editor/utils/dom-utils';

const { module, test } = window.QUnit;
const render = MobiledocRenderer.render;
let builder;

module('Unit: Mobiledoc Renderer', {
  beforeEach() {
    builder = new PostNodeBuilder();
  }
});

test('renders a blank post', (assert) => {
  let post = builder.createPost();
  let mobiledoc = render(post);
  assert.deepEqual(mobiledoc, {
    version: MOBILEDOC_VERSION,
    sections: [[], []]
  });
});

test('renders a post with marker', (assert) => {
  let post = builder.createPost();
  let section = builder.createMarkupSection('P');
  post.sections.append(section);
  section.markers.append(
    builder.createMarker('Hi', [
      builder.createMarkup('STRONG')
    ])
  );
  let mobiledoc = render(post);
  assert.deepEqual(mobiledoc, {
    version: MOBILEDOC_VERSION,
    sections: [
      [
        ['strong']
      ],
      [
        [1, normalizeTagName('P'), [
          [[0], 1, 'Hi']
        ]]
      ]
    ]
  });
});

test('renders a post section with markers sharing a markup', (assert) => {
  let post = builder.createPost();
  let section = builder.createMarkupSection('P');
  post.sections.append(section);
  let markup = builder.createMarkup('STRONG');
  section.markers.append(
    builder.createMarker('Hi', [
      markup
    ])
  );
  section.markers.append(
    builder.createMarker(' Guy', [
      markup
    ])
  );
  let mobiledoc = render(post);
  assert.deepEqual(mobiledoc, {
    version: MOBILEDOC_VERSION,
    sections: [
      [
        ['strong']
      ],
      [
        [1, normalizeTagName('P'), [
          [[0], 0, 'Hi'],
          [[], 1, ' Guy']
        ]]
      ]
    ]
  });
});

test('renders a post with image', (assert) => {
  let url = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=";
  let post = builder.createPost();
  let section = builder.createImageSection(url);
  post.sections.append(section);

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
  let post = builder.createPost();
  let section = builder.createImageSection();
  post.sections.append(section);

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
  let post = builder.createPost();
  let section = builder.createCardSection(cardName, payload);
  post.sections.append(section);

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
