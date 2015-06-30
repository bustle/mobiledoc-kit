import { doc } from 'content-kit-compiler';
import win from '../utils/win';

function createDiv(className) {
  var div = doc.createElement('div');
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

function getEventTargetMatchingTag(tag, target, container) {
  // Traverses up DOM from an event target to find the node matching specifed tag
  while (target && target !== container) {
    if (target.tagName.toLowerCase() === tag) {
      return target;
    }
    target = target.parentNode;
  }
}

function nodeIsDescendantOfElement(node, element) {
  var parentNode = node.parentNode;
  while(parentNode) {
    if (parentNode === element) {
      return true;
    }
    parentNode = parentNode.parentNode;
  }
  return false;
}

function elementContentIsEmpty(element) {
  var content = element && element.innerHTML;
  if (content) {
    return content === '' || content === '<br>';
  }
  return false;
}

function getElementRelativeOffset(element) {
  var offset = { left: 0, top: -win.pageYOffset };
  var offsetParent = element.offsetParent;
  var offsetParentPosition = win.getComputedStyle(offsetParent).position;
  var offsetParentRect;

  if (offsetParentPosition === 'relative') {
    offsetParentRect = offsetParent.getBoundingClientRect();
    offset.left = offsetParentRect.left;
    offset.top  = offsetParentRect.top;
  }
  return offset;
}

function getElementComputedStyleNumericProp(element, prop) {
  return parseFloat(win.getComputedStyle(element)[prop]);
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

export {
  createDiv,
  hideElement,
  showElement,
  swapElements,
  getEventTargetMatchingTag,
  nodeIsDescendantOfElement,
  elementContentIsEmpty,
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
