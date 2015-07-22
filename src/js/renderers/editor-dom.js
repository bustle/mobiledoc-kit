import RenderNode from "content-kit-editor/models/render-node";
import CardNode from "content-kit-editor/models/card-node";
import { detect } from 'content-kit-editor/utils/array-utils';
import { POST_TYPE } from "../models/post";
import { MARKUP_SECTION_TYPE } from "../models/section";

function createElementFromMarkerType(doc, markerType) {
  var element = doc.createElement(markerType.tagName);
  if (markerType.attributes) {
    for (var i=0, l=markerType.attributes.length;i<l;i=i+2) {
      element.setAttribute(markerType.attributes[i], markerType.attributes[i+1]);
    }
  }
  return element;
}

function renderMarkupSection(doc, section, markers) {
  var element = doc.createElement(section.tagName);
  var elements = [element];
  var currentElement = element;
  var i, l, j, m, marker, openTypes, closeTypes, text;
  var markerType;
  var openedElement;
  for (i=0, l=markers.length;i<l;i++) {
    marker = markers[i];
    openTypes = marker.open;
    closeTypes = marker.close;
    text = marker.value;

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

class Visitor {
  constructor(cards, unknownCardHandler, options) {
    this.cards = cards;
    this.unknownCardHandler = unknownCardHandler;
    this.options = options;
  }

  [POST_TYPE](renderNode, post, visit) {
    if (!renderNode.element) {
      let element = document.createElement('div');
      renderNode.element = element;
    }
    visit(renderNode, post.sections);
  }

  [MARKUP_SECTION_TYPE](renderNode, section) {
    if (!renderNode.element) {
      let element = renderMarkupSection(window.document, section, section.markers);
      if (renderNode.previousSibling) {
        let previousElement = renderNode.previousSibling.element;
        let nextElement = previousElement.nextSibling;
        if (nextElement) {
          nextElement.parentNode.insertBefore(element, nextElement);
        }
      }
      if (!element.parentNode) {
        renderNode.parentNode.element.appendChild(element);
      }
      renderNode.element = element;
    }
  } 

  section(renderNode, section) {
    this.markupSection(renderNode, section);
  }

  imageSection(renderNode, section) {
    if (renderNode.element) {
      if (renderNode.element.src !== section.src) {
        renderNode.element.src = section.src;
      }
    } else {
      let element = document.createElement('img');
      element.src = section.src;
      if (renderNode.previousSibling) {
        let previousElement = renderNode.previousSibling.element;
        let nextElement = previousElement.nextSibling;
        if (nextElement) {
          nextElement.parentNode.insertBefore(element, nextElement);
        }
      }
      if (!element.parentNode) {
        renderNode.parentNode.element.appendChild(element);
      }
      renderNode.element = element;
    }
  }

  card(renderNode, section) {
    const card = detect(this.cards, card => card.name === section.name);

    const env = { name: section.name };
    const element = document.createElement('div');
    element.contentEditable = 'false';
    renderNode.element = element;
    renderNode.parentNode.element.appendChild(renderNode.element);

    if (card) {
      let cardNode = new CardNode(card, section, renderNode.element, this.options);
      renderNode.cardNode = cardNode;
      cardNode.display();
    } else {
      this.unknownCardHandler(renderNode.element, this.options, env, section.payload);
    }
  }
}

let destroyHooks = {
  [POST_TYPE](/*renderNode, post*/) {
    throw new Error('post destruction is not supported by the renderer');
  },
  [MARKUP_SECTION_TYPE](renderNode, section) {
    let post = renderNode.parentNode.postNode;
    post.removeSection(section);
    // Some formatting commands remove the element from the DOM during
    // formatting. Do not error if this is the case.
    if (renderNode.element.parentNode) {
      renderNode.element.parentNode.removeChild(renderNode.element);
    }
  },
  imageSection(renderNode, section) {
    let post = renderNode.parentNode.postNode;
    post.removeSection(section);
    renderNode.element.parentNode.removeChild(renderNode.element);
  },
  card(renderNode, section) {
    if (renderNode.cardNode) {
      renderNode.cardNode.teardown();
    }
    let post = renderNode.parentNode.postNode;
    post.removeSection(section);
    renderNode.element.parentNode.removeChild(renderNode.element);
  }
};

function removeChildren(parentNode) {
  let child = parentNode.firstChild;
  while (child) {
    let nextChild = child.nextSibling;
    if (child.isRemoved) {
      destroyHooks[child.postNode.type](child, child.postNode);
      parentNode.removeChild(child);
    }
    child = nextChild;
  }
}

function lookupNode(renderTree, parentNode, section, previousNode) {
  if (section.renderNode) {
    return section.renderNode;
  } else {
    let renderNode = new RenderNode(section);
    renderNode.renderTree = renderTree;
    parentNode.insertAfter(renderNode, previousNode);
    section.renderNode = renderNode;
    return renderNode;
  }
}

function renderInternal(renderTree, visitor) {
  let nodes = [renderTree.node];
  function visit(parentNode, sections) {
    let previousNode;
    sections.forEach(section => {
      let node = lookupNode(renderTree, parentNode, section, previousNode);
      if (node.isDirty) {
        nodes.push(node);
      }
      previousNode = node;
    });
  }
  let node = nodes.shift();
  while (node) {
    removeChildren(node);
    visitor[node.postNode.type](node, node.postNode, visit);
    node.markClean();
    node = nodes.shift();
  }
}

export default class Renderer {
  constructor(cards, unknownCardHandler, options) {
    this.visitor = new Visitor(cards, unknownCardHandler, options);
  }

  render(renderTree) {
    renderInternal(renderTree, this.visitor);
  }
}
