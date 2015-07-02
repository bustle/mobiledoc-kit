function renderHeadline(doc, text) {
  var element = doc.createElement('h2');
  element.textContent = text;
  return element;
}

function renderParagraph(doc, types, markers) {
  var element = doc.createElement('p');
  var elements = [element];
  var currentElement = element;
  var i, l, j, m, marker, openTypes, closeTypes, text;
  var markerType, markerTypeAttrs;
  var openedElement, openedTagName;
  for (i=0, l=markers.length;i<l;i++) {
    marker = markers[i];
    openTypes = marker[0];
    closeTypes = marker[1];
    text = marker[2];

    for (j=0, m=openTypes.length;j<m;j++) {
      markerType = openTypes[j];
      openedElement = createElementFromMarkerType(doc, markerType);
      currentElement.appendChild(openedElement);
      elements.push(openedElement);
      currentElement = openedElement;
    }

    currentElement.appendChild(doc.createTextNode(text));

    for (j=0, m=closeTypes;j<m;j++) {
      elements.pop();
      currentElement = elements[elements.length-1];
    }

  }

  return element;
}

function createElementFromMarkerType(doc, markerType) {
  var element = doc.createElement(markerType.tagName);
  if (markerType.attributes) {
    for (var i=0, l=markerType.attributes.length;i<l;i=i+2) {
      element.setAttribute(markerType.attributes[i], markerType.attributes[i+1]);
    }
  }
  return element;
}

function NewDOMRenderer(doc, cards) {
  if (!doc) {
    throw new Error('renderer must be created with a document');
  }
  this.document = doc;
  if (!cards) {
    throw new Error('renderer must be created with cards');
  }
  this.cards = cards;
};

NewDOMRenderer.prototype.render = function NewDOMRenderer_render(data, target) {
  var sections = data.sections;
  var i, l, section, node;
  for (i=0, l=sections.length;i<l;i++) {
    node = this.document.createElement('section');
    section = sections[i];
    switch (section[0]) {
    case 2:
      node.appendChild(renderHeadline(this.document, section[1]));
      break;
    case 1:
      node.appendChild(renderParagraph(this.document, section[1]));
      break;
    case 5:
      var componentFn = this.cards[section[1]];
      node.appendChild(componentFn(this.document, section[2]));
      break;
    }
    target.appendChild(node);
  }
};

export default NewDOMRenderer;
