import Helpers from '../../test-helpers';
import { Position, Range } from 'content-kit-editor/utils/cursor';

const {module, test} = Helpers;

module('Unit: Post', {
  beforeEach() {
  },
  afterEach() {
  }
});

test('#markersFrom finds markers across markup sections', (assert) => {
  const post = Helpers.postAbstract.build(({post, markupSection, marker}) =>
    post([
      markupSection('p', ['s1m1', 's1m2', 's1m3'].map(t => marker(t))),
      markupSection('p', ['s2m1', 's2m2', 's2m3'].map(t => marker(t))),
      markupSection('p', ['s3m1', 's3m2', 's3m3'].map(t => marker(t)))
    ])
  );

  let foundMarkers = [];

  const s1m2 = post.sections.objectAt(0).markers.objectAt(1);
  const s3m2 = post.sections.objectAt(2).markers.objectAt(1);

  assert.equal(s1m2.value, 's1m2', 'precond - find s1m2');
  assert.equal(s3m2.value, 's3m2', 'precond - find s3m2');

  post.markersFrom(s1m2, s3m2, m => foundMarkers.push(m.value));

  assert.deepEqual(foundMarkers,
                   [        's1m2', 's1m3',
                    's2m1', 's2m2', 's2m3',
                    's3m1', 's3m2'         ],
                   'iterates correct markers');
});

test('#markersFrom finds markers across non-homogeneous sections', (assert) => {
  const post = Helpers.postAbstract.build(builder => {
    const {post, markupSection, marker, listSection, listItem} = builder;

    return post([
      markupSection('p', ['s1m1', 's1m2', 's1m3'].map(t => marker(t))),
      listSection('ul', [
        listItem(['l1m1', 'l1m2', 'l1m3'].map(t => marker(t))),
        listItem(['l2m1', 'l2m2', 'l2m3'].map(t => marker(t)))
      ]),
      // FIXME test with card section
      markupSection('p', ['s2m1', 's2m2', 's2m3'].map(t => marker(t))),
      markupSection('p', ['s3m1', 's3m2', 's3m3'].map(t => marker(t)))
    ]);
  });

  let foundMarkers = [];

  const s1m2 = post.sections.objectAt(0).markers.objectAt(1);
  const s3m2 = post.sections.objectAt(3).markers.objectAt(1);

  assert.equal(s1m2.value, 's1m2', 'precond - find s1m2');
  assert.equal(s3m2.value, 's3m2', 'precond - find s3m2');

  post.markersFrom(s1m2, s3m2, m => foundMarkers.push(m.value));

  assert.deepEqual(foundMarkers,
                   [        's1m2', 's1m3',
                    'l1m1', 'l1m2', 'l1m3',
                    'l2m1', 'l2m2', 'l2m3',
                    's2m1', 's2m2', 's2m3',
                    's3m1', 's3m2'         ],
                   'iterates correct markers');
});

test('#walkMarkerableSections skips non-markerable sections', (assert) => {
  const post = Helpers.postAbstract.build(builder => {
    const {post, markupSection, marker, cardSection} = builder;

    return post([
      markupSection('p', ['s1m1'].map(t => marker(t))),
      markupSection('p', ['s2m1'].map(t => marker(t))),
      cardSection('simple-card'),
      markupSection('p', ['s3m1'].map(t => marker(t))),
      markupSection('p', ['s4m1'].map(t => marker(t)))
    ]);
  });

  let foundSections = [];

  const s1 = post.sections.objectAt(0);
  const s4 = post.sections.objectAt(4);

  assert.equal(s1.text, 's1m1', 'precond - find s1');
  assert.equal(s4.text, 's4m1', 'precond - find s4');

  const range = new Range(new Position(s1, 0), new Position(s4, 0));

  post.walkMarkerableSections(range, s => foundSections.push(s));

  assert.deepEqual(foundSections.map(s => s.text),
                   ['s1m1', 's2m1', 's3m1', 's4m1'],
                   'iterates correct sections');

});
