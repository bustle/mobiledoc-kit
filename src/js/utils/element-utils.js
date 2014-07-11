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

function getElementOffset(element) {
  var offset = { left: 0, top: 0 };
  var elementStyle = window.getComputedStyle(element);

  if (elementStyle.position === 'relative') {
    offset.left = parseInt(elementStyle['margin-left'], 10);
    offset.top  = parseInt(elementStyle['margin-top'], 10);
  }
  return offset;
}
