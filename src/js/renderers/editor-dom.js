import CardNode from 'mobiledoc-kit/models/card-node';
import { detect, forEach } from 'mobiledoc-kit/utils/array-utils';
import AtomNode from 'mobiledoc-kit/models/atom-node';
import {
  POST_TYPE,
  MARKUP_SECTION_TYPE,
  LIST_SECTION_TYPE,
  LIST_ITEM_TYPE,
  MARKER_TYPE,
  IMAGE_SECTION_TYPE,
  CARD_TYPE,
  ATOM_TYPE
} from '../models/types';
import { startsWith, endsWith } from '../utils/string-utils';
import { addClassName, removeClassName } from '../utils/dom-utils';
import { MARKUP_SECTION_ELEMENT_NAMES } from '../models/markup-section';
import assert from '../utils/assert';
import { TAB } from 'mobiledoc-kit/utils/characters';

export const CARD_ELEMENT_CLASS_NAME = '__mobiledoc-card';
export const NO_BREAK_SPACE = '\u00A0';
export const TAB_CHARACTER = '\u2003';
export const SPACE = ' ';
export const ZWNJ = '\u200c';
export const ATOM_CLASS_NAME = '-mobiledoc-kit__atom';
export const EDITOR_HAS_NO_CONTENT_CLASS_NAME = '__has-no-content';
export const EDITOR_ELEMENT_CLASS_NAME = '__mobiledoc-editor';

function createElementFromMarkup(doc, markup) {
  let element = doc.createElement(markup.tagName);
  Object.keys(markup.attributes).forEach(k => {
    element.setAttribute(k, markup.attributes[k]);
  });
  return element;
}

const TWO_SPACES         = `${SPACE}${SPACE}`;
const SPACE_AND_NO_BREAK = `${SPACE}${NO_BREAK_SPACE}`;
const SPACES_REGEX       = new RegExp(TWO_SPACES, 'g');
const TAB_REGEX          = new RegExp(TAB, 'g');
const endsWithSpace = function(text) {
  return endsWith(text, SPACE);
};
const startsWithSpace = function(text) {
  return startsWith(text, SPACE);
};

// FIXME: This can be done more efficiently with a single pass
// building a correct string based on the original.
function renderHTMLText(marker) {
  let text = marker.value;
  text = text.replace(SPACES_REGEX, SPACE_AND_NO_BREAK)
             .replace(TAB_REGEX,    TAB_CHARACTER);

  // If the first marker has a leading space or the last marker has a
  // trailing space, the browser will collapse the space when we position
  // the cursor.
  // See https://github.com/bustle/mobiledoc-kit/issues/68
  //   and https://github.com/bustle/mobiledoc-kit/issues/75
  if (marker.isMarker && endsWithSpace(text) && !marker.next) {
    text = text.substr(0, text.length - 1) + NO_BREAK_SPACE;
  }
  if (marker.isMarker && startsWithSpace(text) &&
      (!marker.prev || (marker.prev.isMarker && endsWithSpace(marker.prev.value)))) {
    text = NO_BREAK_SPACE + text.substr(1);
  }
  return text;
}

// ascends from element upward, returning the last parent node that is not
// parentElement
function penultimateParentOf(element, parentElement) {
  while (parentElement &&
         element.parentNode !== parentElement &&
         element.parentNode !== document.body // ensure the while loop stops
        ) {
    element = element.parentNode;
  }
  return element;
}

function renderMarkupSection(section) {
  let element;
  if (MARKUP_SECTION_ELEMENT_NAMES.indexOf(section.tagName) !== -1) {
    element = document.createElement(section.tagName);
  } else {
    element = document.createElement('div');
    addClassName(element, section.tagName);
  }

  return element;
}

function renderListSection(section) {
  return document.createElement(section.tagName);
}

function renderListItem() {
  return document.createElement('li');
}

function renderCursorPlaceholder() {
  return document.createElement('br');
}

function renderInlineCursorPlaceholder() {
  return document.createTextNode(ZWNJ);
}

function renderCard() {
  let wrapper = document.createElement('div');
  let cardElement = document.createElement('div');
  cardElement.contentEditable = false;
  addClassName(cardElement, CARD_ELEMENT_CLASS_NAME);
  wrapper.appendChild(renderInlineCursorPlaceholder());
  wrapper.appendChild(cardElement);
  wrapper.appendChild(renderInlineCursorPlaceholder());
  return { wrapper, cardElement };
}

/**
 * Wrap the element in all of the opened markups
 * @return {DOMElement} the wrapped element
 * @private
 */
function wrapElement(element, openedMarkups) {
  let wrappedElement = element;

  for (let i=openedMarkups.length - 1; i>=0; i--) {
    let markup = openedMarkups[i];
    let openedElement = createElementFromMarkup(document, markup);
    openedElement.appendChild(wrappedElement);
    wrappedElement = openedElement;
  }

  return wrappedElement;
}

// Attach the element to its parent element at the correct position based on the
// previousRenderNode
function attachElementToParent(element, parentElement, previousRenderNode=null) {
  if (previousRenderNode) {
    let previousSibling = previousRenderNode.element;
    let previousSiblingPenultimate = penultimateParentOf(previousSibling,
                                                         parentElement);
    parentElement.insertBefore(element, previousSiblingPenultimate.nextSibling);
  } else {
    parentElement.insertBefore(element, parentElement.firstChild);
  }
}

function renderAtom(atom, element, previousRenderNode) {
  let atomElement = document.createElement('span');
  atomElement.contentEditable = false;

  let wrapper = document.createElement('span');
  addClassName(wrapper, ATOM_CLASS_NAME);
  let headTextNode = renderInlineCursorPlaceholder();
  let tailTextNode = renderInlineCursorPlaceholder();

  wrapper.appendChild(headTextNode);
  wrapper.appendChild(atomElement);
  wrapper.appendChild(tailTextNode);

  let wrappedElement = wrapElement(wrapper, atom.openedMarkups);
  attachElementToParent(wrappedElement, element, previousRenderNode);

  return {
    markupElement: wrappedElement,
    wrapper,
    atomElement,
    headTextNode,
    tailTextNode
  };
}

function getNextMarkerElement(renderNode) {
  let element = renderNode.element.parentNode;
  let marker = renderNode.postNode;
  let closedCount = marker.closedMarkups.length;

  while (closedCount--) {
    element = element.parentNode;
  }
  return element;
}

/**
 * Render the marker
 * @param {Marker} marker the marker to render
 * @param {DOMNode} element the element to attach the rendered marker to
 * @param {RenderNode} [previousRenderNode] The render node before this one, which
 *        affects the determination of where to insert this rendered marker.
 * @return {Object} With properties `element` and `markupElement`.
 *         The element (textNode) that has the text for
 *         this marker, and the outermost rendered element. If the marker has no
 *         markups, element and markupElement will be the same textNode
 * @private
 */
function renderMarker(marker, parentElement, previousRenderNode) {
  let text = renderHTMLText(marker);

  let element = document.createTextNode(text);
  let markupElement = wrapElement(element, marker.openedMarkups);
  attachElementToParent(markupElement, parentElement, previousRenderNode);

  return { element, markupElement };
}

// Attach the render node's element to the DOM,
// replacing the originalElement if it exists
function attachRenderNodeElementToDOM(renderNode, originalElement=null) {
  const element = renderNode.element;
  const hasRendered = !!originalElement;

  if (hasRendered) {
    let parentElement = renderNode.parent.element;
    parentElement.replaceChild(element, originalElement);
  } else {
    let parentElement, nextSiblingElement;
    if (renderNode.prev) {
      let previousElement = renderNode.prev.element;
      parentElement = previousElement.parentNode;
      nextSiblingElement = previousElement.nextSibling;
    } else {
      parentElement = renderNode.parent.element;
      nextSiblingElement = parentElement.firstChild;
    }
    parentElement.insertBefore(element, nextSiblingElement);
  }
}

function removeRenderNodeSectionFromParent(renderNode, section) {
  const parent = renderNode.parent.postNode;
  parent.sections.remove(section);
}

function removeRenderNodeElementFromParent(renderNode) {
  if (renderNode.element && renderNode.element.parentNode) {
    renderNode.element.parentNode.removeChild(renderNode.element);
  }
}

function validateCards(cards=[]) {
  forEach(cards, card => {
    assert(
      `Card "${card.name}" must define type "dom", has: "${card.type}"`,
      card.type === 'dom'
    );
    assert(
      `Card "${card.name}" must define \`render\` method`,
      !!card.render
    );
  });
  return cards;
}

function validateAtoms(atoms=[]) {
  forEach(atoms, atom => {
    assert(
      `Atom "${atom.name}" must define type "dom", has: "${atom.type}"`,
      atom.type === 'dom'
    );
    assert(
      `Atom "${atom.name}" must define \`render\` method`,
      !!atom.render
    );
  });
  return atoms;
}

class Visitor {
  constructor(editor, cards, atoms, unknownCardHandler, unknownAtomHandler, options) {
    this.editor = editor;
    this.cards = validateCards(cards);
    this.atoms = validateAtoms(atoms);
    this.unknownCardHandler = unknownCardHandler;
    this.unknownAtomHandler = unknownAtomHandler;
    this.options = options;
  }

  _findCard(cardName) {
    let card = detect(this.cards, card => card.name === cardName);
    return card || this._createUnknownCard(cardName);
  }

  _createUnknownCard(cardName) {
    assert(
      `Unknown card "${cardName}" found, but no unknownCardHandler is defined`,
      !!this.unknownCardHandler
    );

    return {
      name: cardName,
      type: 'dom',
      render: this.unknownCardHandler,
      edit:   this.unknownCardHandler
    };
  }

  _findAtom(atomName) {
    let atom = detect(this.atoms, atom => atom.name === atomName);
    return atom || this._createUnknownAtom(atomName);
  }

  _createUnknownAtom(atomName) {
    assert(
      `Unknown atom "${atomName}" found, but no unknownAtomHandler is defined`,
      !!this.unknownAtomHandler
    );

    return {
      name: atomName,
      type: 'dom',
      render: this.unknownAtomHandler
    };
  }

  [POST_TYPE](renderNode, post, visit) {
    if (!renderNode.element) {
      renderNode.element = document.createElement('div');
    }
    addClassName(renderNode.element, EDITOR_ELEMENT_CLASS_NAME);
    if (post.hasContent) {
      removeClassName(renderNode.element, EDITOR_HAS_NO_CONTENT_CLASS_NAME);
    } else {
      addClassName(renderNode.element, EDITOR_HAS_NO_CONTENT_CLASS_NAME);
    }
    visit(renderNode, post.sections);
  }

  [MARKUP_SECTION_TYPE](renderNode, section, visit) {
    const originalElement = renderNode.element;

    // Always rerender the section -- its tag name or attributes may have changed.
    // TODO make this smarter, only rerendering and replacing the element when necessary
    renderNode.element = renderMarkupSection(section);
    renderNode.cursorElement = null;
    attachRenderNodeElementToDOM(renderNode, originalElement);

    if (section.isBlank) {
      let cursorPlaceholder = renderCursorPlaceholder();
      renderNode.element.appendChild(cursorPlaceholder);
      renderNode.cursorElement = cursorPlaceholder;
    } else {
      const visitAll = true;
      visit(renderNode, section.markers, visitAll);
    }
  }

  [LIST_SECTION_TYPE](renderNode, section, visit) {
    const originalElement = renderNode.element;

    renderNode.element = renderListSection(section);
    attachRenderNodeElementToDOM(renderNode, originalElement);

    const visitAll = true;
    visit(renderNode, section.items, visitAll);
  }

  [LIST_ITEM_TYPE](renderNode, item, visit) {
    // FIXME do we need to do anything special for rerenders?
    renderNode.element = renderListItem();
    renderNode.cursorElement = null;
    attachRenderNodeElementToDOM(renderNode, null);

    if (item.isBlank) {
      let cursorPlaceholder = renderCursorPlaceholder();
      renderNode.element.appendChild(cursorPlaceholder);
      renderNode.cursorElement = cursorPlaceholder;
    } else {
      const visitAll = true;
      visit(renderNode, item.markers, visitAll);
    }
  }

  [MARKER_TYPE](renderNode, marker) {
    let parentElement;

    if (renderNode.prev) {
      parentElement = getNextMarkerElement(renderNode.prev);
    } else {
      parentElement = renderNode.parent.element;
    }

    let { element, markupElement } =
      renderMarker(marker, parentElement, renderNode.prev);

    renderNode.element = element;
    renderNode.markupElement = markupElement;
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
    const originalElement = renderNode.element;
    const {editor, options} = this;

    const card = this._findCard(section.name);

    let { wrapper, cardElement } = renderCard();
    renderNode.element = wrapper;
    attachRenderNodeElementToDOM(renderNode, originalElement);

    const cardNode = new CardNode(
      editor, card, section, cardElement, options);
    renderNode.cardNode = cardNode;

    const initialMode = section._initialMode;
    cardNode[initialMode]();
  }

  [ATOM_TYPE](renderNode, atomModel) {
    let parentElement;

    if (renderNode.prev) {
      parentElement = getNextMarkerElement(renderNode.prev);
    } else {
      parentElement = renderNode.parent.element;
    }

    const { editor, options } = this;
    const {
      wrapper,
      markupElement,
      atomElement,
      headTextNode,
      tailTextNode
    } = renderAtom(atomModel, parentElement, renderNode.prev);
    const atom = this._findAtom(atomModel.name);

    let atomNode = renderNode.atomNode;
    if (!atomNode) {
      // create new AtomNode
      atomNode = new AtomNode(editor, atom, atomModel, atomElement, options);
    } else {
      // retarget atomNode to new atom element
      atomNode.element = atomElement;
    }

    atomNode.render();

    renderNode.atomNode = atomNode;
    renderNode.element = wrapper;
    renderNode.headTextNode = headTextNode;
    renderNode.tailTextNode = tailTextNode;
    renderNode.markupElement = markupElement;
  }
}

let destroyHooks = {
  [POST_TYPE](/*renderNode, post*/) {
    assert('post destruction is not supported by the renderer', false);
  },

  [MARKUP_SECTION_TYPE](renderNode, section) {
    removeRenderNodeSectionFromParent(renderNode, section);
    removeRenderNodeElementFromParent(renderNode);
  },

  [LIST_SECTION_TYPE](renderNode, section) {
    removeRenderNodeSectionFromParent(renderNode, section);
    removeRenderNodeElementFromParent(renderNode);
  },

  [LIST_ITEM_TYPE](renderNode, li) {
    removeRenderNodeSectionFromParent(renderNode, li);
    removeRenderNodeElementFromParent(renderNode);
  },

  [MARKER_TYPE](renderNode, marker) {
    // FIXME before we render marker, should delete previous renderNode's element
    // and up until the next marker element

    // If an atom throws during render we may end up later destroying a renderNode
    // that has not rendered yet, so exit early here if so.
    if (!renderNode.isRendered) {
      return;
    }
    let { markupElement } = renderNode;

    if (marker.section) {
      marker.section.markers.remove(marker);
    }

    if (markupElement.parentNode) {
      // if no parentNode, the browser already removed this element
      markupElement.parentNode.removeChild(markupElement);
    }
  },

  [IMAGE_SECTION_TYPE](renderNode, section) {
    removeRenderNodeSectionFromParent(renderNode, section);
    removeRenderNodeElementFromParent(renderNode);
  },

  [CARD_TYPE](renderNode, section) {
    if (renderNode.cardNode) {
      renderNode.cardNode.teardown();
    }
    removeRenderNodeSectionFromParent(renderNode, section);
    removeRenderNodeElementFromParent(renderNode);
  },

  [ATOM_TYPE](renderNode, atom) {
    if (renderNode.atomNode) {
      renderNode.atomNode.teardown();
    }

    // an atom is a kind of marker so just call its destroy hook vs copying here
    destroyHooks[MARKER_TYPE](renderNode, atom);
  }
};

// removes children from parentNode (a RenderNode) that are scheduled for removal
function removeDestroyedChildren(parentNode, forceRemoval=false) {
  let child = parentNode.childNodes.head;
  let nextChild, method;
  while (child) {
    nextChild = child.next;
    if (child.isRemoved || forceRemoval) {
      removeDestroyedChildren(child, true);
      method = child.postNode.type;
      assert(`editor-dom cannot destroy "${method}"`, !!destroyHooks[method]);
      destroyHooks[method](child, child.postNode);
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
    const renderNode = renderTree.buildRenderNode(postNode);
    parentNode.childNodes.insertAfter(renderNode, previousNode);
    return renderNode;
  }
}

export default class Renderer {
  constructor(editor, cards, atoms, unknownCardHandler, unknownAtomHandler, options) {
    this.editor = editor;
    this.visitor = new Visitor(editor, cards, atoms, unknownCardHandler, unknownAtomHandler, options);
    this.nodes = [];
    this.hasRendered = false;
  }

  destroy() {
    if (!this.hasRendered) {
      return;
    }
    let renderNode = this.renderTree.rootNode;
    let force = true;
    removeDestroyedChildren(renderNode, force);
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
    this.hasRendered = true;
    this.renderTree = renderTree;
    let renderNode = renderTree.rootNode;
    let method, postNode;

    while (renderNode) {
      removeDestroyedChildren(renderNode);
      postNode = renderNode.postNode;

      method = postNode.type;
      assert(`EditorDom visitor cannot handle type ${method}`, !!this.visitor[method]);
      this.visitor[method](renderNode, postNode,
                           (...args) => this.visit(renderTree, ...args));
      renderNode.markClean();
      renderNode = this.nodes.shift();
    }
  }
}
