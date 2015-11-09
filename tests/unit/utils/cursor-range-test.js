import Helpers from '../../test-helpers';
import Range from 'content-kit-editor/utils/cursor/range';

const {module, test} = Helpers;

module('Unit: Utils: Range');

test('#trimTo(section) when range covers only one section', (assert) => {
  const section = Helpers.postAbstract.build(({markupSection}) => markupSection());
  const range = Range.create(section, 0, section, 5);

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

  const range = Range.create(section1, 0, section2, 5);
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

  const range = Range.create(section1, 0, section2, 5);
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

  const range = Range.create(section1, 0, section3, 5);
  const newRange = range.trimTo(section2);

  assert.ok(newRange.head.section === section2, 'head section');
  assert.ok(newRange.tail.section === section2, 'tail section');
  assert.equal(newRange.head.offset, 0, 'head offset');
  assert.equal(newRange.tail.offset, section2.text.length, 'tail offset');
});
