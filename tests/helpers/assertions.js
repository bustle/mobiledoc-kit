/* global QUnit, $ */

import DOMHelper from './dom';

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

  QUnit.assert.inArray = function(element, array, message=`has "${element}" in "${array}"`) {
    QUnit.assert.ok(array.indexOf(element) !== -1, message);
  };
}
