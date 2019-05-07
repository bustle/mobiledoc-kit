import MobiledocParser from 'mobiledoc-kit/parsers/mobiledoc/0-3-2';
import { MOBILEDOC_VERSION } from 'mobiledoc-kit/renderers/mobiledoc/0-3-2';
import PostNodeBuilder from 'mobiledoc-kit/models/post-node-builder';

const DATA_URL = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=";
import Helpers from '../../../test-helpers';
const { module, test } = Helpers;

let parser, builder, post;

module('Unit: Parsers: Mobiledoc 0.3.2', {
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
  const mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [],
    markups: [],
    sections: []
  };

  const parsed = parser.parse(mobiledoc);
  assert.equal(parsed.sections.length, 0, '0 sections');
});

test('#parse empty markup section returns an empty post', (assert) => {
  const mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [],
    markups: [],
    sections: [
      [1, 'p', []]
    ]
  };

  const section = builder.createMarkupSection('p');
  post.sections.append(section);
  assert.deepEqual(parser.parse(mobiledoc), post);
});

test('#parse doc without marker types', (assert) => {
  const mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [],
    markups: [],
    sections: [
      [
        1,'P', [[0, [], 0, 'hello world']]
      ]
    ]
  };
  const parsed = parser.parse(mobiledoc);

  let section = builder.createMarkupSection('P', [], false);
  let marker  = builder.createMarker('hello world');
  section.markers.append(marker);
  post.sections.append(section);

  assert.deepEqual(
    parsed,
    post
  );
});

test('#parse doc with blank marker', (assert) => {
  const mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [],
    markups: [],
    sections: [
      [
        1,'P', [[0, [], 0, '']]
      ]
    ]
  };
  const parsed = parser.parse(mobiledoc);

  let section = builder.createMarkupSection('P', [], false);
  post.sections.append(section);

  assert.deepEqual(
    parsed,
    post
  );
});

test('#parse doc with marker type', (assert) => {
  const mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [],
    markups: [
      ['B'],
      ['A', ['href', 'google.com']]
    ],
    sections: [
      [
        1,'P', [
          [0, [1], 0, 'hello'],     // a tag open
          [0, [0], 1, 'brave new'], // b tag open/close
          [0, [], 1, 'world']       // a tag close
        ]
      ]
    ]
  };
  const parsed = parser.parse(mobiledoc);

  let section = builder.createMarkupSection('P', [], false);
  let aMarkerType = builder.createMarkup('A', {href:'google.com'});
  let bMarkerType = builder.createMarkup('B');

  let markers  = [
    builder.createMarker('hello', [aMarkerType]),
    builder.createMarker('brave new', [aMarkerType, bMarkerType]),
    builder.createMarker('world', [aMarkerType])
  ];
  markers.forEach(marker => section.markers.append(marker));
  post.sections.append(section);

  assert.deepEqual(
    parsed,
    post
  );
});

test('#parse doc with image section', (assert) => {
  const mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [],
    markups: [],
    sections: [
      [2, DATA_URL]
    ]
  };

  const parsed = parser.parse(mobiledoc);

  let section = builder.createImageSection(DATA_URL);
  post.sections.append(section);
  assert.deepEqual(
    parsed,
    post
  );
});

test('#parse doc with custom card type', (assert) => {
  const mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [
      ['custom-card', {}]
    ],
    markups: [],
    sections: [
      [10, 0]
    ]
  };

  const parsed = parser.parse(mobiledoc);

  let section = builder.createCardSection('custom-card');
  post.sections.append(section);
  assert.deepEqual(
    parsed,
    post
  );
});

test('#parse doc with custom atom type', (assert) => {
  const mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [
      ['mention', '@bob', { id: 42 }]
    ],
    cards: [],
    markups: [],
    sections: [
      [
        1,'P', [
          [1, [], 0, 0]
        ]
      ]
    ]
  };

  const parsed = parser.parse(mobiledoc);

  let section = builder.createMarkupSection('P', [], false);
  let atom = builder.createAtom('mention', '@bob', { id: 42 });
  section.markers.append(atom);
  post.sections.append(section);

  assert.deepEqual(
    parsed,
    post
  );
});

test('#parse a mobile doc with list-section and list-item', (assert) => {
  const mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [],
    markups: [],
    sections: [
      [3, 'ul', [
        [[0, [], 0, "first item"]],
        [[0, [], 0, "second item"]]
      ]]
    ]
  };

  const parsed = parser.parse(mobiledoc);

  const items = [
    builder.createListItem([builder.createMarker('first item')]),
    builder.createListItem([builder.createMarker('second item')])
  ];
  const section = builder.createListSection('ul', items);
  post.sections.append(section);
  assert.deepEqual(
    parsed,
    post
  );
});

test('#parse doc with paragraph with text alignment', (assert) => {
  const mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [],
    markups: [],
    sections: [
      [
        1,
        'P',
        [[0, [], 0, 'hello world']],
        ['data-md-text-align', 'center']
      ]
    ]
  };

  const parsed = parser.parse(mobiledoc);

  let section = builder.createMarkupSection(
    'P',
    [],
    false,
    { 'data-md-text-align': 'center' }
  );
  let marker  = builder.createMarker('hello world');
  section.markers.append(marker);
  post.sections.append(section);

  assert.deepEqual(
    parsed,
    post
  );
});

test('#parse a mobile doc with list-section with text align', (assert) => {
  const mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [],
    markups: [],
    sections: [
      [
        3,
        'ul',
        [
          [[0, [], 0, "first item"]],
          [[0, [], 0, "second item"]]
        ],
        ['data-md-text-align', 'center']
      ]
    ]
  };

  const parsed = parser.parse(mobiledoc);

  const items = [
    builder.createListItem([builder.createMarker('first item')]),
    builder.createListItem([builder.createMarker('second item')])
  ];
  const section = builder.createListSection(
    'ul',
    items,
    { 'data-md-text-align': 'center' }
  );
  post.sections.append(section);
  assert.deepEqual(
    parsed,
    post
  );
});
