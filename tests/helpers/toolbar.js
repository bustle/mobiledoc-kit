import { triggerEvent } from './dom';

function _getToolbarButton(name) {
  const btnSelector = `.ck-toolbar-btn[title="${name}"]`;
  return $(btnSelector);
}

function getToolbarButton(assert, name) {
  const btnSelector = `.ck-toolbar-btn[title="${name}"]`;
  return assert.hasElement(btnSelector);
}

function assertVisible(assert) {
  return assert.hasElement(`.ck-toolbar`);
}

function assertHidden(assert) {
  return assert.hasNoElement(`.ck-toolbar`);
}

function clickButton(assert, name) {
  const button = getToolbarButton(assert, name);
  triggerEvent(button[0], 'click');
}

function assertActiveButton(assert, buttonTitle) {
  const button = getToolbarButton(assert, buttonTitle);
  assert.ok(button.is('.active'), `button ${buttonTitle} is active`);
}

function assertInactiveButton(assert, buttonTitle) {
  const button = getToolbarButton(assert, buttonTitle);
  assert.ok(!button.is('.active'), `button ${buttonTitle} is not active`);
}

const ToolbarHelpers = {
  getToolbarButton,
  _getToolbarButton,
  assertVisible,
  assertHidden,
  assertActiveButton,
  assertInactiveButton,
  clickButton
};

export default ToolbarHelpers;
