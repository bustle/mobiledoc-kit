import MobiledocRenderer from 'mobiledoc-kit/renderers/mobiledoc';
import {
  MOBILEDOC_VERSION
} from 'mobiledoc-kit/renderers/mobiledoc';
import PostNodeBuilder from 'mobiledoc-kit/models/post-node-builder';
import { normalizeTagName } from 'mobiledoc-kit/utils/dom-utils';
import Helpers from '../../test-helpers';

const { module, test } = Helpers;
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
  const post = Helpers.postAbstract.build(({post, markupSection, marker, markup}) => {
    return post([
      markupSection('p', [marker('Hi', [markup('strong')])])
    ]);
  });
  const mobiledoc = render(post);
  assert.deepEqual(mobiledoc, {
    version: MOBILEDOC_VERSION,
    sections: [
      [['strong']],
      [
        [1, normalizeTagName('P'), [[[0], 1, 'Hi']]]
      ]
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
    sections: [
      [['strong']],
      [
        [1, normalizeTagName('P'), [
          [[0], 0, 'Hi'],
          [[], 1, ' Guy']
        ]]
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
    sections: [
      [
        ['a', ['href', 'bustle.com']],
        ['a', ['href', 'other.com']]
      ],
      [
        [1, normalizeTagName('P'), [
          [[0], 1, 'Hi'],
          [[1], 1, ' Guy'],
          [[0], 1, ' other guy']
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
    sections: [
      [],
      [
        [3, 'ul', [
          [[[], 0, 'first item']],
          [[[], 0, 'second item']]
        ]]
      ]
    ]
  });
});

test('renders a pull-quote as markup section', (assert) => {
  const post = Helpers.postAbstract.build(({post, markupSection, marker}) => {
    return post([markupSection('pull-quote', [marker('abc')])]);
  });
  const mobiledoc = render(post);
  assert.deepEqual(mobiledoc, {
    version: MOBILEDOC_VERSION,
    sections: [
      [],
      [
        [1, 'pull-quote', [[[], 0, 'abc']]]
      ]
    ]
  });
});
