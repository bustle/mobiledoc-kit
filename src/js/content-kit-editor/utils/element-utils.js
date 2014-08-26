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

  topOffset = topOffset || 0;
  leftOffset = leftOffset || 0;
  style.left = round(rect.left - relativeOffset.left - leftOffset) + 'px';
  style.top  = round(rect.top  - relativeOffset.top  - topOffset) + 'px';
}

function positionElementHorizontallyCenteredToRect(element, rect, topOffset) {
  var horizontalCenter = (element.offsetWidth / 2) - (rect.width / 2);
  positionElementToRect(element, rect, topOffset, horizontalCenter);
}

function positionElementCenteredAbove(element, aboveElement) {
  var elementMargin = getElementComputedStyleNumericProp(element, 'marginBottom');
  positionElementHorizontallyCenteredToRect(element, aboveElement.getBoundingClientRect(), element.offsetHeight + elementMargin);
}

function positionElementCenteredBelow(element, belowElement) {
  var elementMargin = getElementComputedStyleNumericProp(element, 'marginTop');
  positionElementHorizontallyCenteredToRect(element, belowElement.getBoundingClientRect(), -element.offsetHeight - elementMargin);
}

function positionElementCenteredIn(element, inElement) {
  var verticalCenter = (inElement.offsetHeight / 2) - (element.offsetHeight / 2);
  positionElementHorizontallyCenteredToRect(element, inElement.getBoundingClientRect(), -verticalCenter);
}

function positionElementToLeftOf(element, leftOfElement) {
  var verticalCenter = (leftOfElement.offsetHeight / 2) - (element.offsetHeight / 2);
  var elementMargin = getElementComputedStyleNumericProp(element, 'marginRight');
  positionElementToRect(element, leftOfElement.getBoundingClientRect(), -verticalCenter, element.offsetWidth + elementMargin);
}

function positionElementToRightOf(element, rightOfElement) {
  var verticalCenter = (rightOfElement.offsetHeight / 2) - (element.offsetHeight / 2);
  var elementMargin = getElementComputedStyleNumericProp(element, 'marginLeft');
  var rightOfElementRect = rightOfElement.getBoundingClientRect();
  positionElementToRect(element, rightOfElementRect, -verticalCenter, -rightOfElement.offsetWidth - elementMargin);
}

export { createDiv, hideElement, showElement, swapElements, getEventTargetMatchingTag, nodeIsDescendantOfElement,
getElementRelativeOffset, getElementComputedStyleNumericProp, positionElementToRect,
positionElementHorizontallyCenteredToRect, positionElementCenteredAbove, positionElementCenteredBelow,
positionElementCenteredIn, positionElementToLeftOf, positionElementToRightOf };
