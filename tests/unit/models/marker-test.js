import Helpers from '../../test-helpers';
const {module, test} = Helpers;

import PostNodeBuilder from 'mobiledoc-kit/models/post-node-builder';

let builder;
module('Unit: Marker', {
  beforeEach() {
    builder = new PostNodeBuilder();
  },
  afterEach() {
    builder = null;
  }
});

test('a marker can have a markup applied to it', (assert) => {
  const m1 = builder.createMarker('hi there!');
  m1.addMarkup(builder.createMarkup('b'));

  assert.ok(m1.hasMarkup('b'));
});

test('a marker can have the same markup tagName applied twice', (assert) => {
  const m1 = builder.createMarker('hi there!');
  m1.addMarkup(builder.createMarkup('b'));
  m1.addMarkup(builder.createMarkup('b'));

  assert.equal(m1.markups.length, 2, 'markup only applied once');
});

test('a marker can have a complex markup applied to it', (assert) => {
  const m1 = builder.createMarker('hi there!');
  const markup = builder.createMarkup('a', {href:'blah'});
  m1.addMarkup(markup);

  assert.ok(m1.hasMarkup('a'));
  assert.equal(m1.getMarkup('a').attributes.href, 'blah');
});

test('a marker can have the same complex markup tagName applied twice, even with different attributes', (assert) => {
  const m1 = builder.createMarker('hi there!');
  const markup1 = builder.createMarkup('a', {href:'blah'});
  const markup2 = builder.createMarkup('a', {href:'blah2'});
  m1.addMarkup(markup1);
  m1.addMarkup(markup2);

  assert.equal(m1.markups.length, 2, 'only one markup');
  assert.equal(m1.getMarkup('a').attributes.href, 'blah',
               'first markup is applied');
});

test('#split splits a marker in 3 with blank markers when no endOffset is passed', (assert) => {
  const m1 = builder.createMarker('hi there!');
  m1.addMarkup(builder.createMarkup('b'));

  const [beforeMarker, ...afterMarkers] = m1.split(5);

  assert.ok(beforeMarker.hasMarkup('b'));
  afterMarkers.forEach(m => assert.ok(m.hasMarkup('b')));

  assert.equal(beforeMarker.value, 'hi th');
  assert.equal(afterMarkers[0].value, 'ere!');
  assert.ok(afterMarkers[1].isBlank, 'final split marker is empty');
});

test('#split splits a marker in 3 when endOffset is passed', (assert) => {
  const m = builder.createMarker('hi there!');
  m.addMarkup(builder.createMarkup('b'));

  const [beforeMarker, ...afterMarkers] = m.split(2, 4);

  assert.equal(1 + afterMarkers.length, 3, 'creates 3 new markers');
  assert.ok(beforeMarker.hasMarkup('b'), 'beforeMarker has markup');
  afterMarkers.forEach(m => assert.ok(m.hasMarkup('b'), 'afterMarker has markup'));

  assert.equal(beforeMarker.value, 'hi');
  assert.equal(afterMarkers[0].value, ' t');
  assert.equal(afterMarkers[1].value, 'here!');
});

test('#split creates an initial empty marker if the offset is 0', (assert) => {
  const m = builder.createMarker('hi there!');
  const [beforeMarker, ...afterMarkers] = m.split(0);
  assert.equal(afterMarkers.length, 2, '2 after markers');
  assert.ok(beforeMarker.isBlank, 'beforeMarker is empty');
  assert.equal(afterMarkers[0].value, 'hi there!');
  assert.ok(afterMarkers[1].isBlank, 'final afterMarker is empty');
});

test('#clone a marker', (assert) => {
  const marker = builder.createMarker('hi there!');
  const cloned = marker.clone();
  assert.equal(marker.builder, cloned.builder, 'builder is present');
  assert.equal(marker.value, cloned.value, 'value is present');
  assert.equal(marker.markups.length, cloned.markups.length, 'markup length is the same');
});

// https://github.com/bustle/mobiledoc-kit/issues/274
test('#deleteValueAtOffset handles emoji', (assert) => {
  let str = 'monkey 🙈';
  assert.equal(str.length, 'monkey '.length + 2,
               'string length reports monkey emoji as length 2');
  let marker = builder.createMarker(str);
  marker.deleteValueAtOffset(str.length - 1);
  assert.equal(marker.value, 'monkey ', 'deletes correctly from low surrogate');

  marker = builder.createMarker(str);
  marker.deleteValueAtOffset(str.length - 2);
  assert.equal(marker.value, 'monkey ', 'deletes correctly from high surrogate');
});
