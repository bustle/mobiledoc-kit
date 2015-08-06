import MobiledocParser from 'content-kit-editor/parsers/mobiledoc';
import PostNodeBuilder from 'content-kit-editor/models/post-node-builder';
import { MOBILEDOC_VERSION } from 'content-kit-editor/renderers/mobiledoc';

const DATA_URL = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=";
const { module, test } = window.QUnit;

let parser, builder, post;

module('Unit: Parsers: Mobiledoc', {
  beforeEach() {
    builder = new PostNodeBuilder();
    parser = new MobiledocParser(builder);
    post = builder.createPost();
  },
  afterEach() {
    parser = null;
    builder = null;
    post = null;
  }
});

test('#parse empty doc returns an empty post', (assert) => {
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    sections: [[], []]
  };
  assert.deepEqual(parser.parse(mobiledoc),
                   post);
});

test('#parse doc without marker types', (assert) => {
  const mobiledoc = {
    version: MOBILEDOC_VERSION,
    sections: [
      [],
      [[
        1,'P', [[[], 0, 'hello world']]
      ]]
    ]
  };
  const parsed = parser.parse(mobiledoc);

  let section = builder.createMarkupSection('P', [], false);
  let marker  = builder.createMarker('hello world');
  section.appendMarker(marker);
  post.appendSection(section);

  assert.deepEqual(
    parsed,
    post
  );
});

test('#parse doc with marker type', (assert) => {
  const mobiledoc = {
    version: MOBILEDOC_VERSION,
    sections: [
      [
        ['B'],
        ['A', ['href', 'google.com']]
      ],
      [[
        1,'P', [
          [[1], 0, 'hello'],     // a tag open
          [[0], 1, 'brave new'], // b tag open/close
          [[], 1, 'world']       // a tag close
        ]
      ]]
    ]
  };
  const parsed = parser.parse(mobiledoc);

  let section = builder.createMarkupSection('P', [], false);
  let aMarkerType = builder.createMarkup('A', ['href', 'google.com']);
  let bMarkerType = builder.createMarkup('B');

  let markers  = [
    builder.createMarker('hello', [aMarkerType]),
    builder.createMarker('brave new', [aMarkerType, bMarkerType]),
    builder.createMarker('world', [aMarkerType])
  ];
  markers.forEach(marker => section.appendMarker(marker));
  post.appendSection(section);

  assert.deepEqual(
    parsed,
    post
  );
});

test('#parse doc with image section', (assert) => {
  const mobiledoc = {
    version: MOBILEDOC_VERSION,
    sections: [
      [],
      [
        [2, DATA_URL]
      ]
    ]
  };

  const parsed = parser.parse(mobiledoc);

  let section = builder.createImageSection(DATA_URL);
  post.appendSection(section);
  assert.deepEqual(
    parsed,
    post
  );
});

test('#parse doc with custom card type', (assert) => {
  const mobiledoc = {
    version: MOBILEDOC_VERSION,
    sections: [
      [],
      [
        [10, 'custom-card', {}]
      ]
    ]
  };

  const parsed = parser.parse(mobiledoc);

  let section = builder.createCardSection('custom-card');
  post.appendSection(section);
  assert.deepEqual(
    parsed,
    post
  );
});
