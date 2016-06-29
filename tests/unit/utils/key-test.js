import Helpers from '../../test-helpers';
import Key from 'mobiledoc-kit/utils/key';
import { MODIFIERS } from 'mobiledoc-kit/utils/key';
import Keycodes from 'mobiledoc-kit/utils/keycodes';

const {module, test} = Helpers;

module('Unit: Utils: Key');

test('#hasModifier with no modifier', (assert) => {
  const event = Helpers.dom.createMockEvent('keydown', null, { keyCode: 42 });
  const key = Key.fromEvent(event);

  assert.ok(!key.hasModifier(MODIFIERS.META), "META not pressed");
  assert.ok(!key.hasModifier(MODIFIERS.CTRL), "CTRL not pressed");
  assert.ok(!key.hasModifier(MODIFIERS.SHIFT), "SHIFT not pressed");
});

test('#hasModifier with META', (assert) => {
  const event = Helpers.dom.createMockEvent('keyup', null, { metaKey: true });
  const key = Key.fromEvent(event);

  assert.ok(key.hasModifier(MODIFIERS.META), "META pressed");
  assert.ok(!key.hasModifier(MODIFIERS.CTRL), "CTRL not pressed");
  assert.ok(!key.hasModifier(MODIFIERS.SHIFT), "SHIFT not pressed");
});

test('#hasModifier with CTRL', (assert) => {
  const event = Helpers.dom.createMockEvent('keypress', null, { ctrlKey: true });
  const key = Key.fromEvent(event);

  assert.ok(!key.hasModifier(MODIFIERS.META), "META not pressed");
  assert.ok(key.hasModifier(MODIFIERS.CTRL), "CTRL pressed");
  assert.ok(!key.hasModifier(MODIFIERS.SHIFT), "SHIFT not pressed");
});

test('#hasModifier with SHIFT', (assert) => {
  const event = Helpers.dom.createMockEvent('keydown', null, { shiftKey: true });
  const key = Key.fromEvent(event);

  assert.ok(!key.hasModifier(MODIFIERS.META), "META not pressed");
  assert.ok(!key.hasModifier(MODIFIERS.CTRL), "CTRL not pressed");
  assert.ok(key.hasModifier(MODIFIERS.SHIFT), "SHIFT pressed");
});

// Firefox will fire keypress events for up/down arrow keys,
// they should not be considered printable
test('firefox arrow keypress is not printable', (assert) => {
  let element = $('#qunit-fixture')[0];
  let event = Helpers.dom.createMockEvent('keypress', element, {
    keyCode: Keycodes.DOWN,
    charCode: 0
  });
  let key = Key.fromEvent(event);
  assert.ok(!key.isPrintable());
});
