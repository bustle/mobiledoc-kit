import { buildKeyCommand, findKeyCommands } from 'mobiledoc-kit/editor/key-commands';
import { MODIFIERS, modifierMask as createModifierMask } from 'mobiledoc-kit/utils/key';
import Keycodes from 'mobiledoc-kit/utils/keycodes';

import Helpers from '../../test-helpers';

const { module, test } = Helpers;

const SPECIAL_KEYS = {
  BACKSPACE: Keycodes.BACKSPACE,
  TAB:       Keycodes.TAB,
  ENTER:     Keycodes.ENTER,
  ESC:       Keycodes.ESC,
  SPACE:     Keycodes.SPACE,
  PAGEUP:    Keycodes.PAGEUP,
  PAGEDOWN:  Keycodes.PAGEDOWN,
  END:       Keycodes.END,
  HOME:      Keycodes.HOME,
  LEFT:      Keycodes.LEFT,
  UP:        Keycodes.UP,
  RIGHT:     Keycodes.RIGHT,
  DOWN:      Keycodes.DOWN,
  INS:       Keycodes.INS,
  DEL:       Keycodes.DELETE
};

module('Unit: Editor key commands');

test('leaves modifier, code and run in place if they exist', (assert) => {
  const fn = function() {};

  const {
    modifier, code, run
  } = buildKeyCommand({
    code: Keycodes.ENTER,
    modifier: MODIFIERS.META,
    run: fn
  });

  assert.equal(modifier, MODIFIERS.META, 'keeps modifier');
  assert.equal(code, Keycodes.ENTER, 'keeps code');
  assert.equal(run, fn, 'keeps run');
});

test('translates MODIFIER+CHARACTER string to modifierMask and code', (assert) => {

  const { modifierMask, code } = buildKeyCommand({ str: 'meta+k' });

  assert.equal(modifierMask, createModifierMask({metaKey: true}),
               'calculates correct modifierMask');
  assert.equal(code, 75, 'translates string to code');
});

test('translates modifier+character string to modifierMask and code', (assert) => {

  const { modifierMask, code } = buildKeyCommand({ str: 'META+K' });

  assert.equal(modifierMask, createModifierMask({metaKey: true}),
               'calculates correct modifierMask');
  assert.equal(code, 75, 'translates string to code');
});

test('translates multiple modifiers to modifierMask', (assert) => {
  const { modifierMask, code } = buildKeyCommand({ str: 'META+SHIFT+K' });
  assert.equal(modifierMask, createModifierMask({metaKey: true, shiftKey: true}),
               'calculates correct modifierMask');
  assert.equal(code, 75, 'translates string to code');
});

test('translates uppercase character string to code', (assert) => {

  const { modifierMask, code } = buildKeyCommand({ str: 'K' });

  assert.equal(modifierMask, 0, 'no modifier given');
  assert.equal(code, 75, 'translates string to code');
});

test('translates lowercase character string to code', (assert) => {

  const { modifier, code } = buildKeyCommand({ str: 'k' });

  assert.equal(modifier, undefined, 'no modifier given');
  assert.equal(code, 75, 'translates string to code');

});

test('throws when given invalid modifier', (assert) => {
  assert.throws(() => {
    buildKeyCommand({str: 'MEAT+K'});
  }, /No modifier named.*MEAT.*/);
});

test('throws when given `modifier` property (deprecation)', (assert) => {
  assert.throws(() => {
    buildKeyCommand({str: 'K', modifier: MODIFIERS.META});
  }, /Key commands no longer use.*modifier.* property/);
});

test('throws when given str with too many characters', (assert) => {
  assert.throws(() => {
    buildKeyCommand({str: 'abc'});
  }, /Only 1 character/);
});

test('translates uppercase special key names to codes', (assert) => {
  Object.keys(SPECIAL_KEYS).forEach(name => {
    const { code } = buildKeyCommand({ str: name.toUpperCase() });
    assert.equal(code, SPECIAL_KEYS[name], `translates ${name} string to code`);
  });
});

test('translates lowercase special key names to codes', (assert) => {
  Object.keys(SPECIAL_KEYS).forEach(name => {
    const { code } = buildKeyCommand({ str: name.toLowerCase() });
    assert.equal(code, SPECIAL_KEYS[name], `translates ${name} string to code`);
  });
});

test('`findKeyCommands` matches modifiers exactly', (assert) => {
  let cmdK = buildKeyCommand({
    str: 'META+K'
  });
  let cmdShiftK = buildKeyCommand({
    str: 'META+SHIFT+K'
  });
  let commands = [cmdK, cmdShiftK];

  let element = null;
  let cmdKEvent = Helpers.dom.createMockEvent('keydown', element, {
    keyCode: 75,
    metaKey: true
  });
  let cmdShiftKEvent = Helpers.dom.createMockEvent('keydown', element, {
    keyCode: 75,
    metaKey: true,
    shiftKey: true
  });

  let found = findKeyCommands(commands, cmdKEvent);
  assert.ok(found.length && found[0] === cmdK,
                   'finds cmd-K command from cmd-k event');

  found = findKeyCommands(commands, cmdShiftKEvent);
  assert.ok(found.length && found[0] === cmdShiftK,
                   'finds cmd-shift-K command from cmd-shift-k event');
});
