import MobiledocParser from 'content-kit-editor/parsers/mobiledoc';
import { generateBuilder } from 'content-kit-editor/utils/post-builder';

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

  let section = builder.generateSection('P', [], false);
  let marker  = builder.generateMarker([], 0, 'hello world');
  section.markers.push(marker);
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

  let section = builder.generateSection('P', [], false);
  let aMarkerType = builder.generateMarkerType('A', ['href', 'google.com']);
  let bMarkerType = builder.generateMarkerType('B');

  let markers  = [
    builder.generateMarker([aMarkerType], 0, 'hello'),
    builder.generateMarker([bMarkerType], 1, 'brave new'),
    builder.generateMarker([], 1, 'world')
  ];
  section.markers = markers;
  post.appendSection(section);

  assert.deepEqual(
    parsed,
    post
  );
});

