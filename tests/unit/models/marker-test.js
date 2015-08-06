const {module, test} = QUnit;

import Marker from 'content-kit-editor/models/marker';
import Markup from 'content-kit-editor/models/markup';

module('Unit: Marker');

test('Marker exists', (assert) => {
  assert.ok(Marker);
});

test('a marker can truncated from an offset', (assert) => {
  const m1 = new Marker('hi there!');

  const offset = 5;
  m1.truncateFrom(offset);

  assert.equal(m1.value, 'hi th');
});

test('a marker can truncated to an offset', (assert) => {
  const m1 = new Marker('hi there!');

  const offset = 5;
  m1.truncateTo(offset);

  assert.equal(m1.value, 'ere!');
});

test('a marker can have a markup applied to it', (assert) => {
  const m1 = new Marker('hi there!');
  m1.addMarkup(new Markup('b'));

  assert.ok(m1.hasMarkup('b'));
});

test('a marker can have the same markup tagName applied twice', (assert) => {
  const m1 = new Marker('hi there!');
  m1.addMarkup(new Markup('b'));
  m1.addMarkup(new Markup('b'));

  assert.equal(m1.markups.length, 2, 'markup only applied once');
});

test('a marker can have a complex markup applied to it', (assert) => {
  const m1 = new Marker('hi there!');
  const markup = new Markup('a', {href:'blah'});
  m1.addMarkup(markup);

  assert.ok(m1.hasMarkup('a'));
  assert.equal(m1.getMarkup('a').attributes.href, 'blah');
});

test('a marker can have the same complex markup tagName applied twice, even with different attributes', (assert) => {
  const m1 = new Marker('hi there!');
  const markup1 = new Markup('a', {href:'blah'});
  const markup2 = new Markup('a', {href:'blah2'});
  m1.addMarkup(markup1);
  m1.addMarkup(markup2);

  assert.equal(m1.markups.length, 2, 'only one markup');
  assert.equal(m1.getMarkup('a').attributes.href, 'blah',
               'first markup is applied');
});

test('a marker can be joined to another', (assert) => {
  const m1 = new Marker('hi');
  m1.addMarkup(new Markup('b'));
  const m2 = new Marker(' there!');
  m2.addMarkup(new Markup('i'));

  const m3 = m1.join(m2);
  assert.equal(m3.value, 'hi there!');
  assert.ok(m3.hasMarkup('b'));
  assert.ok(m3.hasMarkup('i'));
});

test('#split splits a marker in 2 when no endOffset is passed', (assert) => {
  const m1 = new Marker('hi there!');
  m1.addMarkup(new Markup('b'));

  const [_m1, m2] = m1.split(5);
  assert.ok(_m1.hasMarkup('b') && m2.hasMarkup('b'),
            'both markers get the markup');

  assert.equal(_m1.value, 'hi th');
  assert.equal(m2.value, 'ere!');
});

test('#split splits a marker in 3 when endOffset is passed', (assert) => {
  const m = new Marker('hi there!');
  m.addMarkup(new Markup('b'));

  const newMarkers = m.split(2, 4);

  assert.equal(newMarkers.length, 3, 'creates 3 new markers');
  newMarkers.forEach(m => assert.ok(m.hasMarkup('b'), 'marker has markup'));

  assert.equal(newMarkers[0].value, 'hi');
  assert.equal(newMarkers[1].value, ' t');
  assert.equal(newMarkers[2].value, 'here!');
});

test('#split does not create an empty marker if the offset is 0', (assert) => {
  const m = new Marker('hi there!');
  const newMarkers = m.split(0);
  assert.equal(newMarkers.length, 1);
  assert.equal(newMarkers[0].value, 'hi there!');
});
