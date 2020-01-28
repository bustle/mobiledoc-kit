import MobiledocRenderer, { MOBILEDOC_VERSION } from 'mobiledoc-kit/renderers/mobiledoc/0-3-2';
import PostNodeBuilder from 'mobiledoc-kit/models/post-node-builder';
import { normalizeTagName } from 'mobiledoc-kit/utils/dom-utils';
import Helpers from '../../../test-helpers';

const { module, test } = Helpers;
function render(post) {
  return MobiledocRenderer.render(post);
}
let builder;

module('Unit: Mobiledoc Renderer 0.3.2', {
  beforeEach() {
    builder = new PostNodeBuilder();
  }
});

test('renders a blank post', (assert) => {
  let post = builder.createPost();
  let mobiledoc = render(post);
  assert.deepEqual(mobiledoc, {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [],
    markups: [],
    sections: []
  });
});

test('renders a post with marker', (assert) => {
  const post = Helpers.postAbstract.build(({post, markupSection, marker, markup}) => {
    return post([
      markupSection('p', [marker('Hi', [markup('strong')])])
    ]);
  });
  const mobiledoc = render(post);
  assert.deepEqual(mobiledoc, {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [],
    markups: [['strong']],
    sections: [
      [1, normalizeTagName('P'), [[0, [0], 1, 'Hi']]]
    ]
  });
});

test('renders a post section with markers sharing a markup', (assert) => {
  const post = Helpers.postAbstract.build(({post, markupSection, marker, markup}) => {
    const strong = markup('strong');
    return post([
      markupSection('p', [marker('Hi', [strong]), marker(' Guy', [strong])])
    ]);
  });
  let mobiledoc = render(post);
  assert.deepEqual(mobiledoc, {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [],
    markups: [['strong']],
    sections: [
      [
        1,
        normalizeTagName('P'),
        [
          [0, [0], 0, 'Hi'],
          [0, [], 1, ' Guy']
        ]
      ]
    ]
  });
});

test('renders a post with markers with markers with complex attributes', (assert) => {
  let link1,link2;
  const post = Helpers.postAbstract.build(({post, markupSection, marker, markup}) => {
    link1 = markup('a', {href:'bustle.com'});
    link2 = markup('a', {href:'other.com'});
    return post([
      markupSection('p', [
        marker('Hi', [link1]),
        marker(' Guy', [link2]),
        marker(' other guy', [link1])
      ])
    ]);
  });
  let mobiledoc = render(post);
  assert.deepEqual(mobiledoc, {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [],
    markups: [
      ['a', ['href', 'bustle.com']],
      ['a', ['href', 'other.com']]
    ],
    sections: [
      [
        1,
        normalizeTagName('P'),
        [
          [0, [0], 1, 'Hi'],
          [0, [1], 1, ' Guy'],
          [0, [0], 1, ' other guy']
        ]
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
    atoms: [],
    cards: [],
    markups: [],
    sections: [
      [2, url]
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
    atoms: [],
    cards: [],
    markups: [],
    sections: [
      [2, null]
    ]
  });
});

test('renders a post with atom', (assert) => {
  const post = Helpers.postAbstract.build(({post, markupSection, marker, atom}) => {
    return post([
      markupSection('p', [
        marker('Hi'),
        atom('mention', '@bob', { id: 42 })
      ])
    ]);
  });

  let mobiledoc = render(post);
  assert.deepEqual(mobiledoc, {
    version: MOBILEDOC_VERSION,
    atoms: [
      ['mention', '@bob', { id: 42 }]
    ],
    cards: [],
    markups: [],
    sections: [
      [
        1,
        normalizeTagName('P'),
        [
          [0, [], 0, 'Hi'],
          [1, [], 0, 0]
        ]
      ]
    ]
  });
});

test('renders a post with atom and markup', (assert) => {
  const post = Helpers.postAbstract.build(({post, markupSection, marker, markup, atom}) => {
    const strong = markup('strong');
    return post([
      markupSection('p', [
        atom('mention', '@bob', { id: 42 }, [strong])
      ])
    ]);
  });

  let mobiledoc = render(post);
  assert.deepEqual(mobiledoc, {
    version: MOBILEDOC_VERSION,
    atoms: [
      ['mention', '@bob', { id: 42 }]
    ],
    cards: [],
    markups: [['strong']],
    sections: [
      [
        1,
        normalizeTagName('P'),
        [
          [1, [0], 1, 0]
        ]
      ]
    ]
  });
});

test('renders a post with atom inside markup', (assert) => {
  const post = Helpers.postAbstract.build(({post, markupSection, marker, markup, atom}) => {
    const strong = markup('strong');
    return post([
      markupSection('p', [
        marker('Hi ', [strong]),
        atom('mention', '@bob', { id: 42 }, [strong]),
        marker(' Bye', [strong])
      ])
    ]);
  });

  let mobiledoc = render(post);
  assert.deepEqual(mobiledoc, {
    version: MOBILEDOC_VERSION,
    atoms: [
      ['mention', '@bob', { id: 42 }]
    ],
    cards: [],
    markups: [['strong']],
    sections: [
      [
        1,
        normalizeTagName('P'),
        [
          [0, [0], 0, 'Hi '],
          [1, [], 0, 0],
          [0, [], 1, ' Bye']
        ]
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
    atoms: [],
    cards: [
      [cardName, payload]
    ],
    markups: [],
    sections: [
      [10, 0]
    ]
  });
});

test('renders a post with multiple cards with identical payloads', (assert) => {
  let cardName = 'super-card';
  let payload1 = { bar: 'baz' };
  let payload2 = { bar: 'baz' };
  let post = builder.createPost();

  let section1 = builder.createCardSection(cardName, payload1);
  post.sections.append(section1);

  let section2 = builder.createCardSection(cardName, payload2);
  post.sections.append(section2);

  let mobiledoc = render(post);
  assert.deepEqual(mobiledoc, {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [
      [cardName, payload1],
      [cardName, payload2]
    ],
    markups: [],
    sections: [
      [10, 0],
      [10, 1]
    ]
  });
});

test('renders a post with cards with differing payloads', (assert) => {
  let cardName = 'super-card';
  let payload1 = { bar: 'baz1' };
  let payload2 = { bar: 'baz2' };
  let post = builder.createPost();

  let section1 = builder.createCardSection(cardName, payload1);
  post.sections.append(section1);

  let section2 = builder.createCardSection(cardName, payload2);
  post.sections.append(section2);

  let mobiledoc = render(post);
  assert.deepEqual(mobiledoc, {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [
      [cardName, payload1],
      [cardName, payload2]
    ],
    markups: [],
    sections: [
      [10, 0],
      [10, 1]
    ]
  });
});

test('renders a post with a list', (assert) => {
  const items = [
    builder.createListItem([builder.createMarker('first item')]),
    builder.createListItem([builder.createMarker('second item')])
  ];
  const section = builder.createListSection('ul', items);
  const post = builder.createPost([section]);

  const mobiledoc = render(post);
  assert.deepEqual(mobiledoc, {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [],
    markups: [],
    sections: [
      [
        3,
        'ul',
        [
          [[0, [], 0, 'first item']],
          [[0, [], 0, 'second item']]
        ]
      ]
    ]
  });
});

test('renders an aside as markup section', (assert) => {
  const post = Helpers.postAbstract.build(({post, markupSection, marker}) => {
    return post([markupSection('aside', [marker('abc')])]);
  });
  const mobiledoc = render(post);
  assert.deepEqual(mobiledoc, {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [],
    markups: [],
    sections: [
      [
        1,
        'aside',
        [[0, [], 0, 'abc']]
      ]
    ]
  });
});

test('renders a post with a paragraph with attribute', (assert) => {
  const post = Helpers.postAbstract.build(({post, markupSection, marker, markup}) => {
    return post([
      markupSection('p', [], true, { 'data-md-text-align': 'center' })
    ]);
  });
  const mobiledoc = render(post);
  assert.deepEqual(mobiledoc, {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [],
    markups: [],
    sections: [
      [
        1,
        normalizeTagName('P'),
        [],
        ['data-md-text-align', 'center']
      ]
    ]
  });
});

test('renders a post with a list with attribute', (assert) => {
  const section = builder.createListSection('ul', [], { 'data-md-text-align': 'center' });
  const post = builder.createPost([section]);
  const mobiledoc = render(post);

  assert.deepEqual(mobiledoc, {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [],
    markups: [],
    sections: [
      [
        3,
        normalizeTagName('UL'),
        [],
        ['data-md-text-align', 'center']
      ]
    ]
  });
});
