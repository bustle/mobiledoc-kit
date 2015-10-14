import Helpers from '../../test-helpers';
import Key from 'content-kit-editor/utils/key';
import { MODIFIERS } from 'content-kit-editor/utils/key';

const {module, test} = Helpers;

module('Unit: Utils: Key');

test('#hasModifier with no modifier', (assert) => {
  const key = Key.fromEvent({ keyCode: 42 });

  assert.ok(!key.hasModifier(MODIFIERS.META), "META not pressed");
  assert.ok(!key.hasModifier(MODIFIERS.CTRL), "CTRL not pressed");
  assert.ok(!key.hasModifier(MODIFIERS.SHIFT), "SHIFT not pressed");
});

test('#hasModifier with META', (assert) => {
  const key = Key.fromEvent({ metaKey: true });

  assert.ok(key.hasModifier(MODIFIERS.META), "META pressed");
  assert.ok(!key.hasModifier(MODIFIERS.CTRL), "CTRL not pressed");
  assert.ok(!key.hasModifier(MODIFIERS.SHIFT), "SHIFT not pressed");
});

test('#hasModifier with CTRL', (assert) => {
  const key = Key.fromEvent({ ctrlKey: true });

  assert.ok(!key.hasModifier(MODIFIERS.META), "META not pressed");
  assert.ok(key.hasModifier(MODIFIERS.CTRL), "CTRL pressed");
  assert.ok(!key.hasModifier(MODIFIERS.SHIFT), "SHIFT not pressed");
});

test('#hasModifier with SHIFT', (assert) => {
  const key = Key.fromEvent({ shiftKey: true });

  assert.ok(!key.hasModifier(MODIFIERS.META), "META not pressed");
  assert.ok(!key.hasModifier(MODIFIERS.CTRL), "CTRL not pressed");
  assert.ok(key.hasModifier(MODIFIERS.SHIFT), "SHIFT pressed");
});
