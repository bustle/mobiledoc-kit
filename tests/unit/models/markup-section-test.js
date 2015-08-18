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

test('#isBlank returns true if the text length is zero for two markers', (assert) => {
  const m1 = builder.createBlankMarker();
  const m2 = builder.createBlankMarker();
  const s = builder.createMarkupSection('p', [m1,m2]);
  assert.ok(s.isBlank, 'section with two blank markers is blank');
});

test('#isBlank returns true if there are no markers', (assert) => {
  const s = builder.createMarkupSection('p');
  assert.ok(s.isBlank, 'section with no markers is blank');
});

test('#isBlank returns false if there is a marker with length', (assert) => {
  const m = builder.createMarker('a');
  const s = builder.createMarkupSection('p', [m]);
  assert.ok(!s.isBlank, 'section with marker is not blank');
});
