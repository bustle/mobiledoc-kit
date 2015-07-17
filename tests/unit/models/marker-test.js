const {module, test} = QUnit;

import Marker from 'content-kit-editor/models/marker';

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
  m1.addMarkup('b');

  assert.ok(m1.hasMarkup('b'));
});

test('a marker cannot have the same markup type applied twice', (assert) => {
  const m1 = new Marker('hi there!');
  m1.addMarkup('b');
  m1.addMarkup('b');

  assert.equal(m1.markups.length, 1, 'markup only applied once');
});

test('a marker can have a complex markup applied to it', (assert) => {
  const m1 = new Marker('hi there!');
  const markup = {type: 'a', attributes:{href:'blah'}};
  m1.addMarkup(markup);

  assert.ok(m1.hasMarkup('a'));
  assert.equal(m1.getMarkup('a').attributes.href, 'blah');
});

test('a marker cannot have the same complex markup type applied twice, even with different attributes', (assert) => {
  const m1 = new Marker('hi there!');
  const markup1 = {type: 'a', attributes:{href:'blah'}};
  const markup2 = {type: 'a', attributes:{href:'blah2'}};
  m1.addMarkup(markup1);
  m1.addMarkup(markup2);

  assert.equal(m1.markups.length, 1, 'only one markup');
  assert.equal(m1.getMarkup('a').attributes.href, 'blah',
               'first markup is applied');
});

test('a marker can be joined to another', (assert) => {
  const m1 = new Marker('hi');
  m1.addMarkup('b');
  const m2 = new Marker(' there!');
  m2.addMarkup('i');

  const m3 = m1.join(m2);
  assert.equal(m3.value, 'hi there!');
  assert.ok(m3.hasMarkup('b'));
  assert.ok(m3.hasMarkup('i'));
});

test('a marker can be split into two', (assert) => {
  const m1 = new Marker('hi there!');
  m1.addMarkup('b');

  const [_m1, m2] = m1.split(5);
  assert.ok(_m1.hasMarkup('b') && m2.hasMarkup('b'),
            'both markers get the markup');

  assert.equal(_m1.value, 'hi th');
  assert.equal(m2.value, 'ere!');
});
