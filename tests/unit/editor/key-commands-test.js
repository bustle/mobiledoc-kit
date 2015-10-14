import { buildKeyCommand } from 'content-kit-editor/editor/key-commands';
import { MODIFIERS, SPECIAL_KEYS } from 'content-kit-editor/utils/key';
import Keycodes from 'content-kit-editor/utils/keycodes';

import Helpers from '../../test-helpers';

const { module, test } = Helpers;

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

test('translates MODIFIER+CHARACTER string to modifier and code', (assert) => {

  const { modifier, code } = buildKeyCommand({ str: 'meta+k' });

  assert.equal(modifier, MODIFIERS.META, 'translates string to modifier');
  assert.equal(code, 75, 'translates string to code');
});

test('translates modifier+character string to modifier and code', (assert) => {

  const { modifier, code } = buildKeyCommand({ str: 'META+K' });

  assert.equal(modifier, MODIFIERS.META, 'translates string to modifier');
  assert.equal(code, 75, 'translates string to code');
});

test('translates uppercase character string to code', (assert) => {

  const { modifier, code } = buildKeyCommand({ str: 'K' });

  assert.equal(modifier, undefined, 'no modifier given');
  assert.equal(code, 75, 'translates string to code');
});

test('translates lowercase character string to code', (assert) => {

  const { modifier, code } = buildKeyCommand({ str: 'k' });

  assert.equal(modifier, undefined, 'no modifier given');
  assert.equal(code, 75, 'translates string to code');

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