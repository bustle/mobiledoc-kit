import Helpers from '../../test-helpers';
import Key from 'mobiledoc-kit/utils/key';
import { MODIFIERS } from 'mobiledoc-kit/utils/key';
import Keys from 'mobiledoc-kit/utils/keys';
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

// Firefox will fire keypress events for some keys that should not be printable
test('firefox: non-printable are treated as not printable', (assert) => {
  const KEYS = [
    Keys.DOWN,
    Keys.HOME,
    Keys.END,
    Keys.PAGEUP,
    Keys.PAGEDOWN,
    Keys.INS,
    Keys.CLEAR,
    Keys.PAUSE,
    Keys.ESC
  ];

  KEYS.forEach((key) => {
    let element = $('#qunit-fixture')[0];
    let event = Helpers.dom.createMockEvent('keypress', element, {
      key,
    });
    let keyInstance = Key.fromEvent(event);

    assert.ok(!keyInstance.isPrintable(), `key ${key} is not printable`);
  });
});

test('uses keyCode as a fallback if key is not supported', (assert) => {
  let element = $('#qunit-fixture')[0];

  let event = Helpers.dom.createMockEvent('keypress', element, {
    key: Keys.ESC,
    keyCode: Keycodes.SPACE
  });
  let keyInstance = Key.fromEvent(event);
  assert.ok(
    keyInstance.isEscape(),
    'key is preferred over keyCode if supported'
  );

  event = Helpers.dom.createMockEvent('keypress', element, {
    keyCode: Keycodes.SPACE
  });
  keyInstance = Key.fromEvent(event);
  assert.ok(
    keyInstance.isSpace(),
    'keyCode is used if key is not supported'
  );
});
