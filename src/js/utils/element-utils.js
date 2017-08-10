import { dasherize } from 'mobiledoc-kit/utils/string-utils';
import {
  normalizeTagName
} from 'mobiledoc-kit/utils/dom-utils';

function getEventTargetMatchingTag(tagName, target, container) {
  tagName = normalizeTagName(tagName);
  // Traverses up DOM from an event target to find the node matching specifed tag
  while (target && target !== container) {
    if (normalizeTagName(target.tagName) === tagName) {
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
    offset.top  = offsetParentRect.top;
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
  top  = round(rect.top  - relativeOffset.top  - topOffset);
  style.left = left + 'px';
  style.top  = top + 'px';
  return { left: left, top: top };
}

function positionElementHorizontallyCenteredToRect(element, rect, topOffset) {
  var horizontalCenter = (element.offsetWidth / 2) - (rect.width / 2);
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
    const dataName = dasherize(name);
    return element.setAttribute(dataName, value);
  }
}

function whenElementIsNotInDOM(element, callback) {
  let isCanceled = false;
  const observerFn = () => {
    if (isCanceled) { return; }
    if (!element.parentNode) {
      callback();
    } else {
      window.requestAnimationFrame(observerFn);
    }
  };
  observerFn();
  return { cancel: () => isCanceled = true };
}

export {
  setData,
  getEventTargetMatchingTag,
  getElementRelativeOffset,
  getElementComputedStyleNumericProp,
  positionElementToRect,
  positionElementHorizontallyCenteredToRect,
  positionElementCenteredBelow,
  whenElementIsNotInDOM
};
