import Helpers from '../../test-helpers';
const {module, test} = Helpers;

import { comparePosition } from 'mobiledoc-kit/utils/selection-utils';
import { DIRECTION } from 'mobiledoc-kit/utils/key';

module('Unit: Utils: Selection Utils');

test('#comparePosition returns the forward direction of selection', (assert) => {
  let div = document.createElement('div');
  div.innerHTML = 'Howdy';
  let selection = {
    anchorNode: div,
    anchorOffset: 0,
    focusNode: div,
    focusOffset: 1
  };
  let result = comparePosition(selection);
  assert.equal(DIRECTION.FORWARD, result.direction);
});

test('#comparePosition returns the backward direction of selection', (assert) => {
  let div = document.createElement('div');
  div.innerHTML = 'Howdy';
  let selection = {
    anchorNode: div,
    anchorOffset: 1,
    focusNode: div,
    focusOffset: 0
  };
  let result = comparePosition(selection);
  assert.equal(DIRECTION.BACKWARD, result.direction);
});

test('#comparePosition returns the direction of selection across nodes', (assert) => {
  let div = document.createElement('div');
  div.innerHTML = '<span>Howdy</span> <span>Friend</span>';
  let selection = {
    anchorNode: div.childNodes[0],
    anchorOffset: 1,
    focusNode: div.childNodes[2],
    focusOffset: 0
  };
  let result = comparePosition(selection);
  assert.equal(DIRECTION.FORWARD, result.direction);
});

test('#comparePosition returns the backward direction of selection across nodes', (assert) => {
  let div = document.createElement('div');
  div.innerHTML = '<span>Howdy</span> <span>Friend</span>';
  let selection = {
    anchorNode: div.childNodes[2],
    anchorOffset: 1,
    focusNode: div.childNodes[1],
    focusOffset: 0
  };
  let result = comparePosition(selection);
  assert.equal(DIRECTION.BACKWARD, result.direction);
});

test('#comparePosition returns the direction of selection with nested nodes', (assert) => {
  let div = document.createElement('div');
  div.innerHTML = '<span>Howdy</span> <span>Friend</span>';
  let selection = {
    anchorNode: div,
    anchorOffset: 1,
    focusNode: div.childNodes[1],
    focusOffset: 1
  };
  let result = comparePosition(selection);
  assert.equal(DIRECTION.FORWARD, result.direction);
});

test('#comparePosition returns the backward direction of selection with nested nodes', (assert) => {
  let div = document.createElement('div');
  div.innerHTML = '<span>Howdy</span> <span>Friend</span>';
  let selection = {
    anchorNode: div.childNodes[2],
    anchorOffset: 1,
    focusNode: div,
    focusOffset: 2
  };
  let result = comparePosition(selection);
  assert.equal(DIRECTION.BACKWARD, result.direction);
});
