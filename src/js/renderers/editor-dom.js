import RenderNode from "content-kit-editor/models/render-node";
import CardNode from "content-kit-editor/models/card-node";
import { detect } from 'content-kit-editor/utils/array-utils';
import { POST_TYPE } from "../models/post";
import { MARKUP_SECTION_TYPE } from "../models/markup-section";
import { MARKER_TYPE } from "../models/marker";
import { IMAGE_SECTION_TYPE } from "../models/image";
import { CARD_TYPE } from "../models/card";
import { clearChildNodes } from '../utils/dom-utils';
import { startsWith, endsWith } from '../utils/string-utils';

export const UNPRINTABLE_CHARACTER = "\u200C";
export const NO_BREAK_SPACE = "\u00A0";
const SPACE = ' ';

function createElementFromMarkup(doc, markup) {
  var element = doc.createElement(markup.tagName);
  if (markup.attributes) {
    for (var i=0, l=markup.attributes.length;i<l;i=i+2) {
      element.setAttribute(markup.attributes[i], markup.attributes[i+1]);
    }
  }
  return element;
}

// ascends from element upward, returning the last parent node that is not
// parentElement
function penultimateParentOf(element, parentElement) {
  while (parentElement &&
         element.parentNode !== parentElement &&
         element.parentElement !== document.body // ensure the while loop stops
        ) {
    element = element.parentNode;
  }
  return element;
}

function renderMarkupSection(section) {
  var element = document.createElement(section.tagName);
  section.element = element;
  return element;
}

function getNextMarkerElement(renderNode) {
  let element = renderNode._teardownElement.parentNode;
  let marker = renderNode.postNode;
  let closedCount = marker.closedMarkups.length;

  while (closedCount--) {
    element = element.parentNode;
  }
  return element;
}

function renderBlankMarker(marker, element, previousRenderNode) {
  let blankElement = document.createElement('br');

  if (previousRenderNode) {
    // FIXME there should never be a previousRenderNode for a blank marker
    let previousSibling = previousRenderNode.element;
    let previousSiblingPenultimate = penultimateParentOf(previousSibling, element);
    element.insertBefore(blankElement, previousSiblingPenultimate.nextSibling);
  } else {
    element.insertBefore(blankElement, element.firstChild);
  }

  return blankElement;
}

function renderMarker(marker, element, previousRenderNode) {
  let text = marker.value;

  // If the first marker has a leading space or the last marker has a
  // trailing space, the browser will collapse the space when we position
  // the cursor.
  // See https://github.com/bustlelabs/content-kit-editor/issues/68
  //   and https://github.com/bustlelabs/content-kit-editor/issues/75
  if (!marker.next && endsWith(text, SPACE)) {
    text = text.substr(0, text.length - 1) + NO_BREAK_SPACE;
  } else if (!marker.prev && startsWith(text, SPACE)) {
    text = NO_BREAK_SPACE + text.substr(1);
  }

  let textNode = document.createTextNode(text);
  let currentElement = textNode;
  let markup;

  const openTypes = marker.openedMarkups;
  for (let j=openTypes.length-1;j>=0;j--) {
    markup = openTypes[j];
    let openedElement = createElementFromMarkup(document, markup);
    openedElement.appendChild(currentElement);
    currentElement = openedElement;
  }

  if (previousRenderNode) {
    let previousSibling = previousRenderNode.element;
    let previousSiblingPenultimate = penultimateParentOf(previousSibling, element);
    element.insertBefore(currentElement, previousSiblingPenultimate.nextSibling);
  } else {
    element.insertBefore(currentElement, element.firstChild);
  }

  return textNode;
}

class Visitor {
  constructor(editor, cards, unknownCardHandler, options) {
    this.editor = editor;
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

  [MARKUP_SECTION_TYPE](renderNode, section, visit) {
    let originalElement = renderNode.element;
    const hasRendered = !!originalElement;

    // Always rerender the section -- its tag name or attributes may have changed.
    // TODO make this smarter, only rerendering and replacing the element when necessary
    let element = renderMarkupSection(section);
    renderNode.element = element;

    if (!hasRendered) {
      let element = renderNode.element;

      if (renderNode.prev) {
        let previousElement = renderNode.prev.element;
        let parentNode = previousElement.parentNode;
        parentNode.insertBefore(element, previousElement.nextSibling);
      } else {
        let parentElement = renderNode.parent.element;
        parentElement.insertBefore(element, parentElement.firstChild);
      }
    } else {
      renderNode.parent.element.replaceChild(element, originalElement);
    }

    // remove all elements so that we can rerender
    clearChildNodes(renderNode.element);

    const visitAll = true;
    visit(renderNode, section.markers, visitAll);
  }

  [MARKER_TYPE](renderNode, marker) {
    let parentElement;

    if (renderNode.prev) {
      parentElement = getNextMarkerElement(renderNode.prev);
    } else {
      parentElement = renderNode.parent.element;
    }
    let markerNode, focusableNode;
    if (marker.isEmpty) {
      markerNode    = renderBlankMarker(marker, parentElement, renderNode.prev);
      focusableNode = markerNode.parentNode;
    } else {
      markerNode = focusableNode = renderMarker(marker, parentElement, renderNode.prev);
    }

    renderNode.renderTree.elements.set(focusableNode, renderNode);
    renderNode.element = focusableNode;
    renderNode._teardownElement = markerNode;
  }

  [IMAGE_SECTION_TYPE](renderNode, section) {
    if (renderNode.element) {
      if (renderNode.element.src !== section.src) {
        renderNode.element.src = section.src;
      }
    } else {
      let element = document.createElement('img');
      element.src = section.src;
      if (renderNode.prev) {
        let previousElement = renderNode.prev.element;
        let nextElement = previousElement.nextSibling;
        if (nextElement) {
          nextElement.parentNode.insertBefore(element, nextElement);
        }
      }
      if (!element.parentNode) {
        renderNode.parent.element.appendChild(element);
      }
      renderNode.element = element;
    }
  }

  [CARD_TYPE](renderNode, section) {
    const {editor, options} = this;
    const card = detect(this.cards, card => card.name === section.name);

    const env = { name: section.name };
    const element = document.createElement('div');
    element.contentEditable = 'false';
    renderNode.element = element;
    if (renderNode.prev) {
      let previousElement = renderNode.prev.element;
      let nextElement = previousElement.nextSibling;
      if (nextElement) {
        nextElement.parentNode.insertBefore(element, nextElement);
      }
    }
    if (!element.parentNode) {
      renderNode.parent.element.appendChild(element);
    }

    if (card) {
      let cardNode = new CardNode(editor, card, section, renderNode.element, options);
      renderNode.cardNode = cardNode;
      cardNode.display();
    } else {
      this.unknownCardHandler(renderNode.element, options, env, section.payload);
    }
  }
}

let destroyHooks = {
  [POST_TYPE](/*renderNode, post*/) {
    throw new Error('post destruction is not supported by the renderer');
  },
  [MARKUP_SECTION_TYPE](renderNode, section) {
    let post = renderNode.parent.postNode;
    post.sections.remove(section);
    // Some formatting commands remove the element from the DOM during
    // formatting. Do not error if this is the case.
    if (renderNode.element.parentNode) {
      renderNode.element.parentNode.removeChild(renderNode.element);
    }
  },

  [MARKER_TYPE](renderNode, marker) {
    // FIXME before we render marker, should delete previous renderNode's element
    // and up until the next marker element

    let element = renderNode._teardownElement;
    let nextMarkerElement = getNextMarkerElement(renderNode);
    while (element.parentNode && element.parentNode !== nextMarkerElement) {
      element = element.parentNode;
    }

    if (marker.section) {
      marker.section.markers.remove(marker);
    }

    if (element.parentNode) {
      // if no parentNode, the browser already removed this element
      element.parentNode.removeChild(element);
    }
  },

  [IMAGE_SECTION_TYPE](renderNode, section) {
    let post = renderNode.parent.postNode;
    post.sections.remove(section);
    renderNode.element.parentNode.removeChild(renderNode.element);
  },

  [CARD_TYPE](renderNode, section) {
    if (renderNode.cardNode) {
      renderNode.cardNode.teardown();
    }
    let post = renderNode.parent.postNode;
    post.sections.remove(section);
    renderNode.element.parentNode.removeChild(renderNode.element);
  }
};

// removes children from parentNode that are scheduled for removal
function removeChildren(parentNode) {
  let child = parentNode.childNodes.head;
  while (child) {
    let nextChild = child.next;
    if (child.isRemoved) {
      destroyHooks[child.postNode.type](child, child.postNode);
      parentNode.childNodes.remove(child);
    }
    child = nextChild;
  }
}

// Find an existing render node for the given postNode, or
// create one, insert it into the tree, and return it
function lookupNode(renderTree, parentNode, postNode, previousNode) {
  if (postNode.renderNode) {
    return postNode.renderNode;
  } else {
    let renderNode = new RenderNode(postNode);
    parentNode.childNodes.insertAfter(renderNode, previousNode);
    postNode.renderNode = renderNode;
    return renderNode;
  }
}

export default class Renderer {
  constructor(editor, cards, unknownCardHandler, options) {
    this.editor = editor;
    this.visitor = new Visitor(editor, cards, unknownCardHandler, options);
    this.nodes = [];
  }

  visit(renderTree, parentNode, postNodes, visitAll=false) {
    let previousNode;
    postNodes.forEach(postNode => {
      let node = lookupNode(renderTree, parentNode, postNode, previousNode);
      if (node.isDirty || visitAll) {
        this.nodes.push(node);
      }
      previousNode = node;
    });
  }

  render(renderTree) {
    let node = renderTree.node;
    while (node) {
      removeChildren(node);
      this.visitor[node.postNode.type](node, node.postNode, (...args) => this.visit(renderTree, ...args));
      node.markClean();
      node = this.nodes.shift();
    }
  }
}
