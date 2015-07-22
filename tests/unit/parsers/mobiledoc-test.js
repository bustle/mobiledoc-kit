import MobiledocParser from 'content-kit-editor/parsers/mobiledoc';
import { generateBuilder } from 'content-kit-editor/utils/post-builder';

const DATA_URL = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=";
const { module, test } = window.QUnit;

let parser, builder, post;

module('Unit: Parsers: Mobiledoc', {
  beforeEach() {
    parser = new MobiledocParser();
    builder = generateBuilder();
    post = builder.generatePost();
  },
  afterEach() {
    parser = null;
    builder = null;
    post = null;
  }
});

test('#parse empty doc returns an empty post', (assert) => {
  assert.deepEqual(parser.parse([[], []]),
                   post);
});

test('#parse doc without marker types', (assert) => {
  const mobiledoc = [
    [],
    [[
      1,'P', [[[], 0, 'hello world']]
    ]]
  ];
  const parsed = parser.parse(mobiledoc);

  let section = builder.generateMarkupSection('P', [], false);
  let marker  = builder.generateMarker([], 'hello world');
  section.appendMarker(marker);
  post.appendSection(section);

  assert.deepEqual(
    parsed,
    post
  );
});

test('#parse doc with marker type', (assert) => {
  const mobiledoc = [
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
  ];
  const parsed = parser.parse(mobiledoc);

  let section = builder.generateMarkupSection('P', [], false);
  let aMarkerType = builder.generateMarkup('A', ['href', 'google.com']);
  let bMarkerType = builder.generateMarkup('B');

  let markers  = [
    builder.generateMarker([aMarkerType], 'hello'),
    builder.generateMarker([aMarkerType, bMarkerType], 'brave new'),
    builder.generateMarker([aMarkerType], 'world')
  ];
  markers.forEach(marker => section.appendMarker(marker));
  post.appendSection(section);

  assert.deepEqual(
    parsed,
    post
  );
});

test('#parse doc with image section', (assert) => {
  const mobiledoc = [
    [],
    [
      [2, DATA_URL]
    ]
  ];

  const parsed = parser.parse(mobiledoc);

  let section = builder.generateImageSection(DATA_URL);
  post.appendSection(section);
  assert.deepEqual(
    parsed,
    post
  );
});

test('#parse doc with custom card type', (assert) => {
  const mobiledoc = [
    [],
    [
      [10, 'custom-card', {}]
    ]
  ];

  const parsed = parser.parse(mobiledoc);

  let section = builder.generateCardSection('custom-card');
  post.appendSection(section);
  assert.deepEqual(
    parsed,
    post
  );
});
