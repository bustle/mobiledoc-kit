const {module, test} = QUnit;

import SectionParser from 'content-kit-editor/parsers/section';
import Helpers from '../../test-helpers';

module('Unit: Parser: SectionParser');

test('#parse parses simple dom', (assert) => {
  let element = Helpers.dom.makeDOM(
    'p', {}, [
      ['text', {value:'hello there'}],
      ['b', {}, [
        ['text', {value: 'i am bold'}]
      ]]
    ]
  );

  const section = SectionParser.parse(element);
  assert.equal(section.type, 'p');
  assert.equal(section.markers.length, 2, 'has 2 markers');
  const [m1, m2] = section.markers;

  assert.equal(m1.value, 'hello there');
  assert.equal(m2.value, 'i am bold');
  assert.ok(m2.hasMarkup('b'), 'm2 is bold');
});

test('#parse parses nested markups', (assert) => {
  let element = Helpers.dom.makeDOM(
    'p', {}, [
      ['b', {}, [
        ['text', {value: 'i am bold'}],
        ['i', {}, [
          ['text', {value: 'i am bold and italic'}]
        ]],
        ['text', {value: 'i am bold again'}]
      ]]
    ]
  );

  const section = SectionParser.parse(element);
  assert.equal(section.markers.length, 3, 'has 3 markers');
  const [m1, m2, m3] = section.markers;

  assert.equal(m1.value, 'i am bold');
  assert.equal(m2.value, 'i am bold and italic');
  assert.equal(m3.value, 'i am bold again');
  assert.ok(m1.hasMarkup('b'), 'm1 is bold');
  assert.ok(m2.hasMarkup('b') && m2.hasMarkup('i'), 'm2 is bold and i');
  assert.ok(m3.hasMarkup('b'), 'm3 is bold');
  assert.ok(!m1.hasMarkup('i') && !m3.hasMarkup('i'), 'm1 and m3 are not i');
});

test('#parse ignores non-markup elements like spans', (assert) => {
  let element = Helpers.dom.makeDOM(
    'p', {}, [
      ['span', {}, [
        ['text', {value: 'i was in span'}]
      ]]
    ]
  );

  const section = SectionParser.parse(element);
  assert.equal(section.type, 'p');
  assert.equal(section.markers.length, 1, 'has 1 markers');
  const [m1] = section.markers;

  assert.equal(m1.value, 'i was in span');
});

test('#parse reads attributes', (assert) => {
  let element = Helpers.dom.makeDOM(
    'p', {}, [
      ['a', {href: 'google.com'}, [
        ['text', {value: 'i am a link'}]
      ]]
    ]
  );
  const section = SectionParser.parse(element);
  assert.equal(section.markers.length, 1, 'has 1 markers');
  const [m1] = section.markers;
  assert.equal(m1.value, 'i am a link');
  assert.ok(m1.hasMarkup('a'), 'has "a" markup');
  assert.equal(m1.getMarkup('a').attributes.href, 'google.com');
});

test('#parse joins contiguous text nodes separated by non-markup elements', (assert) => {
  let element = Helpers.dom.makeDOM(
    'p', {}, [
      ['span', {}, [
        ['text', {value: 'span 1'}]
      ]],
      ['span', {}, [
        ['text', {value: 'span 2'}]
      ]]
    ]
  );

  const section = SectionParser.parse(element);
  assert.equal(section.type, 'p');
  assert.equal(section.markers.length, 1, 'has 1 markers');
  const [m1] = section.markers;

  assert.equal(m1.value, 'span 1span 2');
});

test('#parse parses a single text node', (assert) => {
  let element = Helpers.dom.makeDOM(
    'text', {value: 'raw text'}
  );
  const section = SectionParser.parse(element);
  assert.equal(section.type, 'p');
  assert.equal(section.markers.length, 1, 'has 1 marker');
  assert.equal(section.markers[0].value, 'raw text');
});

// test: a section can parse dom

// test: a section can clear a range:
//   * truncating the markers on the boundaries
//   * removing the intermediate markers
//   * connecting (but not joining) the truncated boundary markers
