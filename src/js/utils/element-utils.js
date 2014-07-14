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
    if (target.tagName === tag) {
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

function positionElementToRect(element, rect, verticalOffset) {
  var horizontalCenter = (rect.left + rect.right) / 2;
  var relativeOffset = getElementRelativeOffset(element);
  var style = element.style;
  var round = Math.round;

  verticalOffset = verticalOffset || 0;
  style.left = round(horizontalCenter - relativeOffset.left - (element.offsetWidth / 2)) + 'px';
  style.top  = round(rect.top - relativeOffset.top - verticalOffset) + 'px';
}

function positionElementAbove(element, aboveElement) {
  var elementMargin = getElementComputedStyleNumericProp(element, 'marginBottom');
  positionElementToRect(element, aboveElement.getBoundingClientRect(), element.offsetHeight + elementMargin);
}

function positionElementBelow(element, belowElement) {
  var elementMargin = getElementComputedStyleNumericProp(element, 'marginTop');
  positionElementToRect(element, belowElement.getBoundingClientRect(), -element.offsetHeight - elementMargin);
}
