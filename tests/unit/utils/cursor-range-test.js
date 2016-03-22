import Helpers from '../../test-helpers';
import Range from 'mobiledoc-kit/utils/cursor/range';
import { DIRECTION } from 'mobiledoc-kit/utils/key';

const { FORWARD, BACKWARD } = DIRECTION;
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

test('#move moves collapsed range 1 character in direction', (assert) => {
  let section = Helpers.postAbstract.build(({markupSection, marker}) => {
    return markupSection('p', [marker('abc')]);
  });
  let range = Range.create(section, 0);
  let nextRange = Range.create(section, 1);

  assert.ok(range.isCollapsed, 'precond - range.isCollapsed');
  assert.rangeIsEqual(range.move(DIRECTION.FORWARD), nextRange, 'move forward');

  assert.rangeIsEqual(nextRange.move(DIRECTION.BACKWARD), range, 'move backward');
});

test('#move collapses non-collapsd range in direction', (assert) => {
  let section = Helpers.postAbstract.build(({markupSection, marker}) => {
    return markupSection('p', [marker('abcd')]);
  });
  let range = Range.create(section, 1, section, 3);
  let collapseForward = Range.create(section, 3);
  let collapseBackward = Range.create(section, 1);

  assert.ok(!range.isCollapsed, 'precond - !range.isCollapsed');
  assert.rangeIsEqual(range.move(FORWARD), collapseForward,
                      'collapse forward');
  assert.rangeIsEqual(range.move(BACKWARD), collapseBackward,
                      'collapse forward');
});

test('#extend expands range in direction', (assert) => {
  let section = Helpers.postAbstract.build(({markupSection, marker}) => {
    return markupSection('p', [marker('abcd')]);
  });
  let collapsedRange = Range.create(section, 1);
  let collapsedRangeForward = Range.create(section, 1, section, 2, FORWARD);
  let collapsedRangeBackward = Range.create(section, 0, section, 1, BACKWARD);

  let nonCollapsedRange = Range.create(section, 1, section, 2);
  let nonCollapsedRangeForward = Range.create(section, 1, section, 3, FORWARD);
  let nonCollapsedRangeBackward = Range.create(section, 0, section, 2, BACKWARD);

  assert.ok(collapsedRange.isCollapsed, 'precond - collapsedRange.isCollapsed');
  assert.rangeIsEqual(collapsedRange.extend(FORWARD),
                      collapsedRangeForward,
                      'collapsedRange extend forward');
  assert.rangeIsEqual(collapsedRange.extend(BACKWARD),
                      collapsedRangeBackward,
                      'collapsedRange extend backward');

  assert.ok(!nonCollapsedRange.isCollapsed, 'precond -nonCollapsedRange.isCollapsed');
  assert.rangeIsEqual(nonCollapsedRange.extend(FORWARD),
                      nonCollapsedRangeForward,
                      'nonCollapsedRange extend forward');
  assert.rangeIsEqual(nonCollapsedRange.extend(BACKWARD),
                      nonCollapsedRangeBackward,
                      'nonCollapsedRange extend backward');
});
