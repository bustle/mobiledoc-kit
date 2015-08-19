import { dasherize } from 'content-kit-editor/utils/string-utils';
import {
  normalizeTagName
} from 'content-kit-editor/utils/dom-utils';

function createDiv(className) {
  var div = document.createElement('div');
  if (className) {
    div.className = className;
  }
  return div;
}

function hideElement(element) {
  element.style.display = 'none';
}

function showElement(element) {
  element.style.display = 'block';
}

function swapElements(elementToShow, elementToHide) {
  hideElement(elementToHide);
  showElement(elementToShow);
}

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

function positionElementCenteredAbove(element, aboveElement) {
  var elementMargin = getElementComputedStyleNumericProp(element, 'marginBottom');
  return positionElementHorizontallyCenteredToRect(element, aboveElement.getBoundingClientRect(), element.offsetHeight + elementMargin);
}

function positionElementCenteredBelow(element, belowElement) {
  var elementMargin = getElementComputedStyleNumericProp(element, 'marginTop');
  return positionElementHorizontallyCenteredToRect(element, belowElement.getBoundingClientRect(), -element.offsetHeight - elementMargin);
}

function positionElementCenteredIn(element, inElement) {
  var verticalCenter = (inElement.offsetHeight / 2) - (element.offsetHeight / 2);
  return positionElementHorizontallyCenteredToRect(element, inElement.getBoundingClientRect(), -verticalCenter);
}

function positionElementToLeftOf(element, leftOfElement) {
  var verticalCenter = (leftOfElement.offsetHeight / 2) - (element.offsetHeight / 2);
  var elementMargin = getElementComputedStyleNumericProp(element, 'marginRight');
  return positionElementToRect(element, leftOfElement.getBoundingClientRect(), -verticalCenter, element.offsetWidth + elementMargin);
}

function positionElementToRightOf(element, rightOfElement) {
  var verticalCenter = (rightOfElement.offsetHeight / 2) - (element.offsetHeight / 2);
  var elementMargin = getElementComputedStyleNumericProp(element, 'marginLeft');
  var rightOfElementRect = rightOfElement.getBoundingClientRect();
  return positionElementToRect(element, rightOfElementRect, -verticalCenter, -rightOfElement.offsetWidth - elementMargin);
}

function getData(element, name) {
  if (element.dataset) {
    return element.dataset[name];
  } else {
    const dataName = dasherize(name);
    return element.getAttribute(dataName);
  }
}

function setData(element, name, value) {
  if (element.dataset) {
    element.dataset[name] = value;
  } else {
    const dataName = dasherize(name);
    return element.setAttribute(dataName, value);
  }
}

export {
  getData,
  setData,
  createDiv,
  hideElement,
  showElement,
  swapElements,
  getEventTargetMatchingTag,
  getElementRelativeOffset,
  getElementComputedStyleNumericProp,
  positionElementToRect,
  positionElementHorizontallyCenteredToRect,
  positionElementCenteredAbove,
  positionElementCenteredBelow,
  positionElementCenteredIn,
  positionElementToLeftOf,
  positionElementToRightOf
};
