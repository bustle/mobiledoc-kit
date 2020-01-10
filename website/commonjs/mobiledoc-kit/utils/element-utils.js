'use strict';

var _utilsStringUtils = require('../utils/string-utils');

var _utilsDomUtils = require('../utils/dom-utils');

function getEventTargetMatchingTag(tagName, target, container) {
  tagName = (0, _utilsDomUtils.normalizeTagName)(tagName);
  // Traverses up DOM from an event target to find the node matching specifed tag
  while (target && target !== container) {
    if ((0, _utilsDomUtils.normalizeTagName)(target.tagName) === tagName) {
      return target;
    }
    target = target.parentNode;
  }
}

function getElementRelativeOffset(element) {
  var offset = { left: 0, top: -window.pageYOffset };
  var offsetParent = element.offsetParent;
  var offsetParentPosition = window.getComputedStyle(offsetParent).position;
  var offsetParentRect;

  if (offsetParentPosition === 'relative') {
    offsetParentRect = offsetParent.getBoundingClientRect();
    offset.left = offsetParentRect.left;
    offset.top = offsetParentRect.top;
  }
  return offset;
}

function getElementComputedStyleNumericProp(element, prop) {
  return parseFloat(window.getComputedStyle(element)[prop]);
}

function positionElementToRect(element, rect, topOffset, leftOffset) {
  var relativeOffset = getElementRelativeOffset(element);
  var style = element.style;
  var round = Math.round;
  var left, top;

  topOffset = topOffset || 0;
  leftOffset = leftOffset || 0;
  left = round(rect.left - relativeOffset.left - leftOffset);
  top = round(rect.top - relativeOffset.top - topOffset);
  style.left = left + 'px';
  style.top = top + 'px';
  return { left: left, top: top };
}

function positionElementHorizontallyCenteredToRect(element, rect, topOffset) {
  var horizontalCenter = element.offsetWidth / 2 - rect.width / 2;
  return positionElementToRect(element, rect, topOffset, horizontalCenter);
}

function positionElementCenteredBelow(element, belowElement) {
  var elementMargin = getElementComputedStyleNumericProp(element, 'marginTop');
  return positionElementHorizontallyCenteredToRect(element, belowElement.getBoundingClientRect(), -element.offsetHeight - elementMargin);
}

function setData(element, name, value) {
  if (element.dataset) {
    element.dataset[name] = value;
  } else {
    var dataName = (0, _utilsStringUtils.dasherize)(name);
    return element.setAttribute(dataName, value);
  }
}

function whenElementIsNotInDOM(element, callback) {
  var isCanceled = false;
  var observerFn = function observerFn() {
    if (isCanceled) {
      return;
    }
    if (!element.parentNode) {
      callback();
    } else {
      window.requestAnimationFrame(observerFn);
    }
  };
  observerFn();
  return { cancel: function cancel() {
      return isCanceled = true;
    } };
}

exports.setData = setData;
exports.getEventTargetMatchingTag = getEventTargetMatchingTag;
exports.getElementRelativeOffset = getElementRelativeOffset;
exports.getElementComputedStyleNumericProp = getElementComputedStyleNumericProp;
exports.positionElementToRect = positionElementToRect;
exports.positionElementHorizontallyCenteredToRect = positionElementHorizontallyCenteredToRect;
exports.positionElementCenteredBelow = positionElementCenteredBelow;
exports.whenElementIsNotInDOM = whenElementIsNotInDOM;