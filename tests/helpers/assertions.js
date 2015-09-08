/* global QUnit, $ */

import DOMHelper from './dom';
import ToolbarHelper from './toolbar';
const { _getToolbarButton } = ToolbarHelper;

export default function registerAssertions() {
  QUnit.assert.hasElement = function(selector, message=`hasElement "${selector}"`) {
    let found = $(selector);
    this.push(found.length > 0, found.length, selector, message);
    return found;
  };

  QUnit.assert.hasNoElement = function(selector, message=`hasNoElement "${selector}"`) {
    let found = $(selector);
    this.push(found.length === 0, found.length, selector, message);
    return found;
  };

  QUnit.assert.selectedText = function(text, message=`selectedText "${text}"`) {
    const selected = DOMHelper.getSelectedText();
    this.push(selected === text,
              selected,
              text,
              message);
  };

  QUnit.assert.toolbarVisible = function(message=`toolbar is visible`) {
    QUnit.assert.hasElement('.ck-toolbar', message);
  };

  QUnit.assert.toolbarHidden = function(message=`toolbar is not visible`) {
    QUnit.assert.hasNoElement('.ck-toolbar', message);
  };

  QUnit.assert.inactiveButton = function(name, message=`button ${name} is inactive`) {
    const btn = _getToolbarButton(name);
    QUnit.assert.ok(!btn.is('.active'), message);
  };

  QUnit.assert.activeButton = function(name, message=`button ${name} is active`) {
    const btn = _getToolbarButton(name);
    QUnit.assert.ok(btn.is('.active'), message);
  };

  QUnit.assert.inArray = function(element, array, message=`has "${element}" in "${array}"`) {
    QUnit.assert.ok(array.indexOf(element) !== -1, message);
  };
}
