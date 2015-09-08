import Helpers from '../../test-helpers';
import Position from 'content-kit-editor/utils/cursor/position';
import Range from 'content-kit-editor/utils/cursor/range';

const {module, test} = Helpers;

function makeRange(s1, o1, s2, o2) {
  return new Range(new Position(s1, o1), new Position(s2, o2));
}

module('Unit: Utils: Range');

test('#trimTo(section) when range covers only one section', (assert) => {
  const section = Helpers.postAbstract.build(({markupSection}) => markupSection());
  const range = makeRange(section, 0, section, 5);

  const newRange = range.trimTo(section);
  assert.ok(newRange.head.section === section, 'head section is correct');
  assert.ok(newRange.tail.section === section, 'tail section is correct');
  assert.equal(newRange.head.offset, 0, 'head offset');
  assert.equal(newRange.tail.offset, 0, 'tail offset');
});

test('#trimTo head section', (assert) => {
  const text = 'abcdef';
  const section1 = Helpers.postAbstract.build(
    ({markupSection, marker}) => markupSection('p', [marker(text)]));
  const section2 = Helpers.postAbstract.build(
    ({markupSection, marker}) => markupSection('p', [marker(text)]));

  const range = makeRange(section1, 0, section2, 5);
  const newRange = range.trimTo(section1);

  assert.ok(newRange.head.section === section1, 'head section');
  assert.ok(newRange.tail.section === section1, 'tail section');
  assert.equal(newRange.head.offset, 0, 'head offset');
  assert.equal(newRange.tail.offset, text.length, 'tail offset');
});

test('#trimTo tail section', (assert) => {
  const text = 'abcdef';
  const section1 = Helpers.postAbstract.build(
    ({markupSection, marker}) => markupSection('p', [marker(text)]));
  const section2 = Helpers.postAbstract.build(
    ({markupSection, marker}) => markupSection('p', [marker(text)]));

  const range = makeRange(section1, 0, section2, 5);
  const newRange = range.trimTo(section2);

  assert.ok(newRange.head.section === section2, 'head section');
  assert.ok(newRange.tail.section === section2, 'tail section');
  assert.equal(newRange.head.offset, 0, 'head offset');
  assert.equal(newRange.tail.offset, 5, 'tail offset');
});

test('#trimTo middle section', (assert) => {
  const text = 'abcdef';
  const section1 = Helpers.postAbstract.build(
    ({markupSection, marker}) => markupSection('p', [marker(text)]));
  const section2 = Helpers.postAbstract.build(
    ({markupSection, marker}) => markupSection('p', [marker(text)]));
  const section3 = Helpers.postAbstract.build(
    ({markupSection, marker}) => markupSection('p', [marker(text)]));

  const range = makeRange(section1, 0, section3, 5);
  const newRange = range.trimTo(section2);

  assert.ok(newRange.head.section === section2, 'head section');
  assert.ok(newRange.tail.section === section2, 'tail section');
  assert.equal(newRange.head.offset, 0, 'head offset');
  assert.equal(newRange.tail.offset, section2.text.length, 'tail offset');
 
});
