/* global QUnit, $ */

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
}
