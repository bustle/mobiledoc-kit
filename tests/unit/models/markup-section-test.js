const {module, test} = QUnit;

import PostNodeBuilder from 'content-kit-editor/models/post-node-builder';

let builder;
module('Unit: Markup Section', {
  beforeEach() {
    builder = new PostNodeBuilder();
  },
  afterEach() {
    builder = null;
  }
});

test('a section can append a marker', (assert) => {
  const s1 = builder.createMarkupSection('P');
  const m1 = builder.createMarker('hello');

  s1.markers.append(m1);
  assert.equal(s1.markers.length, 1);
});

test('#markerContaining finds the marker at the given offset when 1 marker', (assert) => {
  const m = builder.createMarker('hi there!');
  const s = builder.createMarkupSection('h2',[m]);

  for (let i=0; i<m.length; i++) {
    assert.equal(s.markerContaining(i), m, `finds marker at offset ${i}`);
  }
});

test('#markerContaining finds the marker at the given offset when 2 markers', (assert) => {
  const m1 = builder.createMarker('hi ');
  const m2 = builder.createMarker('there!');
  const s = builder.createMarkupSection('h2',[m1,m2]);

  assert.equal(s.markerContaining(0), m1,
               'first marker is always found at offset 0');
  assert.equal(s.markerContaining(m1.length + m2.length, false), m2,
               'last marker is found at offset === length when right-inclusive');
  assert.ok(!s.markerContaining(m1.length + m2.length + 1),
            'when offset > length && left-inclusive, no marker is found');
  assert.ok(!s.markerContaining(m1.length + m2.length + 1, false),
            'when offset > length && right-inclusive, no marker is found');

  for (let i=1; i<m1.length; i++) {
    assert.equal(s.markerContaining(i), m1, `finds marker 1 at offset ${i}`);
  }
  assert.equal(s.markerContaining(m1.length), m2, `finds marker m2 (left-inclusive)`);
  assert.equal(s.markerContaining(m1.length, false), m1, `finds marker m1 (right-inclusive)`);

  for (let i=m1.length+1; i<(m1.length+m2.length); i++) {
    assert.equal(s.markerContaining(i), m2, `finds marker 2 at offset ${i}`);
  }
});

test('#markerContaining finds the marker at the given offset when multiple markers', (assert) => {
  const m1 = builder.createMarker('hi ');
  const m2 = builder.createMarker('there!');
  const m3 = builder.createMarker(' and more');
  const markerLength = [m1,m2,m3].reduce((prev, cur) => prev + cur.length, 0);
  const s = builder.createMarkupSection('h2',[m1,m2,m3]);

  assert.equal(s.markerContaining(0), m1,
               'first marker is always found at offset 0');
  assert.ok(!s.markerContaining(markerLength),
            'last marker is undefined at offset === length (left-inclusive)');
  assert.equal(s.markerContaining(markerLength, false), m3,
               'last marker is found at offset === length (right-inclusive)');
  assert.ok(!s.markerContaining(markerLength + 1),
               'no marker is found at offset > length');

  for (let i=1; i<m1.length; i++) {
    assert.equal(s.markerContaining(i), m1, `finds marker 1 at offset ${i}`);
  }
  assert.equal(s.markerContaining(m1.length), m2, `finds m2 (left-inclusive)`);
  assert.equal(s.markerContaining(m1.length, false), m1, `finds m1 (right-inclusive)`);

  for (let i=m1.length+1; i<(m1.length+m2.length); i++) {
    assert.equal(s.markerContaining(i), m2, `finds marker 2 at offset ${i}`);
  }

  assert.equal(s.markerContaining(m1.length+m2.length), m3, `finds m3 (left-inclusive)`);
  assert.equal(s.markerContaining(m1.length+m2.length, false), m2, `finds m2 (right-inclusive)`);

  for (let i=m1.length+m2.length+1; i<markerLength; i++) {
    assert.equal(s.markerContaining(i), m3, `finds marker 3 at offset ${i}`);
  }
});

test('#splitMarker splits the marker at the offset', (assert) => {
  const m1 = builder.createMarker('hi ');
  const m2 = builder.createMarker('there!');
  const s = builder.createMarkupSection('h2', [m1,m2]);

  s.splitMarker(m2, 3);
  assert.equal(s.markers.length, 3, 'adds a 3rd marker');
  assert.equal(s.markers.objectAt(0).value, 'hi ', 'original marker unchanged');
  assert.equal(s.markers.objectAt(1).value, 'the', 'first half of split');
  assert.equal(s.markers.objectAt(2).value, 're!', 'second half of split');
});

test('#splitMarker splits the marker at the end offset if provided', (assert) => {
  const m1 = builder.createMarker('hi ');
  const m2 = builder.createMarker('there!');
  const s = builder.createMarkupSection('h2', [m1,m2]);

  s.splitMarker(m2, 1, 3);
  assert.equal(s.markers.length, 4, 'adds a marker for the split and has one on each side');
  assert.equal(s.markers.head.value, 'hi ', 'original marker unchanged');
  assert.equal(s.markers.objectAt(1).value, 't');
  assert.equal(s.markers.objectAt(2).value, 'he');
  assert.equal(s.markers.tail.value, 're!');
});

test('#splitMarker does not create an empty marker if offset=0', (assert) => {
  const m1 = builder.createMarker('hi ');
  const m2 = builder.createMarker('there!');
  const s = builder.createMarkupSection('h2', [m1,m2]);

  s.splitMarker(m2, 0);
  assert.equal(s.markers.length, 2, 'still 2 markers');
  assert.equal(s.markers.head.value, 'hi ', 'original 1st marker unchanged');
  assert.equal(s.markers.tail.value, 'there!', 'original 2nd marker unchanged');
});

test('#coalesceMarkers removes empty markers', (assert) => {
  const m1 = builder.createBlankMarker();
  const m2 = builder.createBlankMarker();
  const m3 = builder.createMarker('hello');
  const s = builder.createMarkupSection('p', [m1,m2,m3]);

  assert.equal(s.markers.length, 3, 'precond - correct # markers');

  s.coalesceMarkers();
  assert.equal(s.markers.length, 1, 'has 1 marker after coalescing');
  assert.equal(s.markers.head, m3, 'has correct remaining marker');
});

test('#coalesceMarkers appends a single blank marker if all the markers were blank', (assert) => {
  const m1 = builder.createBlankMarker();
  const m2 = builder.createBlankMarker();
  const s = builder.createMarkupSection('p', [m1,m2]);

  assert.equal(s.markers.length, 2, 'precond - correct # markers');

  s.coalesceMarkers();

  assert.equal(s.markers.length, 1, 'has 1 marker after coalescing');
  assert.ok(s.markers.head.isEmpty, 'remaining marker is empty');
});
