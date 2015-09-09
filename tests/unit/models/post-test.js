import Helpers from '../../test-helpers';
import { Position, Range } from 'content-kit-editor/utils/cursor';

const {module, test} = Helpers;

module('Unit: Post', {
  beforeEach() {
  },
  afterEach() {
  }
});

function makeRange(s1, o1, s2, o2) {
  return new Range(new Position(s1, o1), new Position(s2, o2));
}

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

test('#markupsInRange returns all markups', (assert) => {
  let b, i, a1, a2, found;
  const post = Helpers.postAbstract.build(builder => {
    const {post, markupSection, cardSection, marker, markup} = builder;

    b  = markup('strong');
    i  = markup('em');
    a1 = markup('a', ['href', 'example.com']);
    a2 = markup('a', ['href', 'other-example.com']);

    return post([
      markupSection('p', [
        marker('plain text'),
        marker('bold text', [b]),
        marker('i text', [i]),
        marker('bold+i text', [b, i])
      ]),
      markupSection('p', [
        marker('link 1', [a1])
      ]),
      cardSection('simple-card'),
      markupSection('p', [
        marker('link 2', [a2])
      ])
    ]);
  });

  const [s1, s2,, s3] = post.sections.toArray();

  assert.equal(s1.text, 'plain textbold texti textbold+i text', 'precond s1');
  assert.equal(s2.text, 'link 1', 'precond s2');
  assert.equal(s3.text, 'link 2', 'precond s3');

  const collapsedRange = makeRange(s1, 0, s1, 0);
  assert.equal(post.markupsInRange(collapsedRange).length, 0,
               'no markups in collapsed range');

  const simpleRange = makeRange(s1, 0, s1, 'plain text'.length);
  assert.equal(post.markupsInRange(simpleRange).length, 0,
               'no markups in simple range');

  const singleMarkerRange = makeRange(s1, 'plain textb'.length,
                                      s1, 'plain textbold'.length);
  found = post.markupsInRange(singleMarkerRange);
  assert.equal(found.length, 1, 'finds markup in marker');
  assert.inArray(b, found, 'finds b');

  const singleSectionRange = makeRange(s1, 0, s1, s1.text.length);
  found = post.markupsInRange(singleSectionRange);
  assert.equal(found.length, 2, 'finds both markups in section');
  assert.inArray(b, found, 'finds b');
  assert.inArray(i, found, 'finds i');

  const multiSectionRange = makeRange(s1, 'plain textbold te'.length,
                                      s2, 'link'.length);
  found = post.markupsInRange(multiSectionRange);
  assert.equal(found.length, 3, 'finds all markups in multi-section range');
  assert.inArray(b, found, 'finds b');
  assert.inArray(i, found, 'finds i');
  assert.inArray(a1, found, 'finds a1');

  const rangeSpanningCard = makeRange(s1, 0, s3, 'link'.length);
  found = post.markupsInRange(rangeSpanningCard);
  assert.equal(found.length, 4, 'finds all markups in spanning section range');
  assert.inArray(b, found, 'finds b');
  assert.inArray(i, found, 'finds i');
  assert.inArray(a1, found, 'finds a1');
  assert.inArray(a2, found, 'finds a2');
});
