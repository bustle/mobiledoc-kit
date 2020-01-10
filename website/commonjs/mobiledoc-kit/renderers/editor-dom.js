'use strict';

var _destroyHooks;

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _modelsCardNode = require('../models/card-node');

var _utilsArrayUtils = require('../utils/array-utils');

var _modelsAtomNode = require('../models/atom-node');

var _modelsTypes = require('../models/types');

var _utilsStringUtils = require('../utils/string-utils');

var _utilsDomUtils = require('../utils/dom-utils');

var _modelsMarkupSection = require('../models/markup-section');

var _utilsAssert = require('../utils/assert');

var _utilsCharacters = require('../utils/characters');

var CARD_ELEMENT_CLASS_NAME = '__mobiledoc-card';
exports.CARD_ELEMENT_CLASS_NAME = CARD_ELEMENT_CLASS_NAME;
var NO_BREAK_SPACE = ' ';
exports.NO_BREAK_SPACE = NO_BREAK_SPACE;
var TAB_CHARACTER = ' ';
exports.TAB_CHARACTER = TAB_CHARACTER;
var SPACE = ' ';
exports.SPACE = SPACE;
var ZWNJ = '‌';
exports.ZWNJ = ZWNJ;
var ATOM_CLASS_NAME = '-mobiledoc-kit__atom';
exports.ATOM_CLASS_NAME = ATOM_CLASS_NAME;
var EDITOR_HAS_NO_CONTENT_CLASS_NAME = '__has-no-content';
exports.EDITOR_HAS_NO_CONTENT_CLASS_NAME = EDITOR_HAS_NO_CONTENT_CLASS_NAME;
var EDITOR_ELEMENT_CLASS_NAME = '__mobiledoc-editor';

exports.EDITOR_ELEMENT_CLASS_NAME = EDITOR_ELEMENT_CLASS_NAME;
function createElementFromMarkup(doc, markup) {
  var element = doc.createElement(markup.tagName);
  Object.keys(markup.attributes).forEach(function (k) {
    element.setAttribute(k, markup.attributes[k]);
  });
  return element;
}

var TWO_SPACES = '' + SPACE + SPACE;
var SPACE_AND_NO_BREAK = '' + SPACE + NO_BREAK_SPACE;
var SPACES_REGEX = new RegExp(TWO_SPACES, 'g');
var TAB_REGEX = new RegExp(_utilsCharacters.TAB, 'g');
var endsWithSpace = function endsWithSpace(text) {
  return (0, _utilsStringUtils.endsWith)(text, SPACE);
};
var startsWithSpace = function startsWithSpace(text) {
  return (0, _utilsStringUtils.startsWith)(text, SPACE);
};

// FIXME: This can be done more efficiently with a single pass
// building a correct string based on the original.
function renderHTMLText(marker) {
  var text = marker.value;
  text = text.replace(SPACES_REGEX, SPACE_AND_NO_BREAK).replace(TAB_REGEX, TAB_CHARACTER);

  // If the first marker has a leading space or the last marker has a
  // trailing space, the browser will collapse the space when we position
  // the cursor.
  // See https://github.com/bustle/mobiledoc-kit/issues/68
  //   and https://github.com/bustle/mobiledoc-kit/issues/75
  if (marker.isMarker && endsWithSpace(text) && !marker.next) {
    text = text.substr(0, text.length - 1) + NO_BREAK_SPACE;
  }
  if (marker.isMarker && startsWithSpace(text) && (!marker.prev || marker.prev.isMarker && endsWithSpace(marker.prev.value))) {
    text = NO_BREAK_SPACE + text.substr(1);
  }
  return text;
}

// ascends from element upward, returning the last parent node that is not
// parentElement
function penultimateParentOf(element, parentElement) {
  while (parentElement && element.parentNode !== parentElement && element.parentNode !== document.body // ensure the while loop stops
  ) {
    element = element.parentNode;
  }
  return element;
}

function setSectionAttributesOnElement(section, element) {
  section.eachAttribute(function (key, value) {
    element.setAttribute(key, value);
  });
}

function renderMarkupSection(section) {
  var element = undefined;
  if (_modelsMarkupSection.MARKUP_SECTION_ELEMENT_NAMES.indexOf(section.tagName) !== -1) {
    element = document.createElement(section.tagName);
  } else {
    element = document.createElement('div');
    (0, _utilsDomUtils.addClassName)(element, section.tagName);
  }

  setSectionAttributesOnElement(section, element);

  return element;
}

function renderListSection(section) {
  var element = document.createElement(section.tagName);

  setSectionAttributesOnElement(section, element);

  return element;
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
  var wrapper = document.createElement('div');
  var cardElement = document.createElement('div');
  cardElement.contentEditable = false;
  (0, _utilsDomUtils.addClassName)(cardElement, CARD_ELEMENT_CLASS_NAME);
  wrapper.appendChild(renderInlineCursorPlaceholder());
  wrapper.appendChild(cardElement);
  wrapper.appendChild(renderInlineCursorPlaceholder());
  return { wrapper: wrapper, cardElement: cardElement };
}

/**
 * Wrap the element in all of the opened markups
 * @return {DOMElement} the wrapped element
 * @private
 */
function wrapElement(element, openedMarkups) {
  var wrappedElement = element;

  for (var i = openedMarkups.length - 1; i >= 0; i--) {
    var markup = openedMarkups[i];
    var openedElement = createElementFromMarkup(document, markup);
    openedElement.appendChild(wrappedElement);
    wrappedElement = openedElement;
  }

  return wrappedElement;
}

// Attach the element to its parent element at the correct position based on the
// previousRenderNode
function attachElementToParent(element, parentElement) {
  var previousRenderNode = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

  if (previousRenderNode) {
    var previousSibling = previousRenderNode.element;
    var previousSiblingPenultimate = penultimateParentOf(previousSibling, parentElement);
    parentElement.insertBefore(element, previousSiblingPenultimate.nextSibling);
  } else {
    parentElement.insertBefore(element, parentElement.firstChild);
  }
}

function renderAtom(atom, element, previousRenderNode) {
  var atomElement = document.createElement('span');
  atomElement.contentEditable = false;

  var wrapper = document.createElement('span');
  (0, _utilsDomUtils.addClassName)(wrapper, ATOM_CLASS_NAME);
  var headTextNode = renderInlineCursorPlaceholder();
  var tailTextNode = renderInlineCursorPlaceholder();

  wrapper.appendChild(headTextNode);
  wrapper.appendChild(atomElement);
  wrapper.appendChild(tailTextNode);

  var wrappedElement = wrapElement(wrapper, atom.openedMarkups);
  attachElementToParent(wrappedElement, element, previousRenderNode);

  return {
    markupElement: wrappedElement,
    wrapper: wrapper,
    atomElement: atomElement,
    headTextNode: headTextNode,
    tailTextNode: tailTextNode
  };
}

function getNextMarkerElement(renderNode) {
  var element = renderNode.element.parentNode;
  var marker = renderNode.postNode;
  var closedCount = marker.closedMarkups.length;

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
  var text = renderHTMLText(marker);

  var element = document.createTextNode(text);
  var markupElement = wrapElement(element, marker.openedMarkups);
  attachElementToParent(markupElement, parentElement, previousRenderNode);

  return { element: element, markupElement: markupElement };
}

// Attach the render node's element to the DOM,
// replacing the originalElement if it exists
function attachRenderNodeElementToDOM(renderNode) {
  var originalElement = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

  var element = renderNode.element;
  var hasRendered = !!originalElement;

  if (hasRendered) {
    var parentElement = renderNode.parent.element;
    parentElement.replaceChild(element, originalElement);
  } else {
    var parentElement = undefined,
        nextSiblingElement = undefined;
    if (renderNode.prev) {
      var previousElement = renderNode.prev.element;
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
  var parent = renderNode.parent.postNode;
  parent.sections.remove(section);
}

function removeRenderNodeElementFromParent(renderNode) {
  if (renderNode.element && renderNode.element.parentNode) {
    renderNode.element.parentNode.removeChild(renderNode.element);
  }
}

function validateCards() {
  var cards = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

  (0, _utilsArrayUtils.forEach)(cards, function (card) {
    (0, _utilsAssert['default'])('Card "' + card.name + '" must define type "dom", has: "' + card.type + '"', card.type === 'dom');
    (0, _utilsAssert['default'])('Card "' + card.name + '" must define `render` method', !!card.render);
  });
  return cards;
}

function validateAtoms() {
  var atoms = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

  (0, _utilsArrayUtils.forEach)(atoms, function (atom) {
    (0, _utilsAssert['default'])('Atom "' + atom.name + '" must define type "dom", has: "' + atom.type + '"', atom.type === 'dom');
    (0, _utilsAssert['default'])('Atom "' + atom.name + '" must define `render` method', !!atom.render);
  });
  return atoms;
}

var Visitor = (function () {
  function Visitor(editor, cards, atoms, unknownCardHandler, unknownAtomHandler, options) {
    _classCallCheck(this, Visitor);

    this.editor = editor;
    this.cards = validateCards(cards);
    this.atoms = validateAtoms(atoms);
    this.unknownCardHandler = unknownCardHandler;
    this.unknownAtomHandler = unknownAtomHandler;
    this.options = options;
  }

  _createClass(Visitor, [{
    key: '_findCard',
    value: function _findCard(cardName) {
      var card = (0, _utilsArrayUtils.detect)(this.cards, function (card) {
        return card.name === cardName;
      });
      return card || this._createUnknownCard(cardName);
    }
  }, {
    key: '_createUnknownCard',
    value: function _createUnknownCard(cardName) {
      (0, _utilsAssert['default'])('Unknown card "' + cardName + '" found, but no unknownCardHandler is defined', !!this.unknownCardHandler);

      return {
        name: cardName,
        type: 'dom',
        render: this.unknownCardHandler,
        edit: this.unknownCardHandler
      };
    }
  }, {
    key: '_findAtom',
    value: function _findAtom(atomName) {
      var atom = (0, _utilsArrayUtils.detect)(this.atoms, function (atom) {
        return atom.name === atomName;
      });
      return atom || this._createUnknownAtom(atomName);
    }
  }, {
    key: '_createUnknownAtom',
    value: function _createUnknownAtom(atomName) {
      (0, _utilsAssert['default'])('Unknown atom "' + atomName + '" found, but no unknownAtomHandler is defined', !!this.unknownAtomHandler);

      return {
        name: atomName,
        type: 'dom',
        render: this.unknownAtomHandler
      };
    }
  }, {
    key: _modelsTypes.POST_TYPE,
    value: function value(renderNode, post, visit) {
      if (!renderNode.element) {
        renderNode.element = document.createElement('div');
      }
      (0, _utilsDomUtils.addClassName)(renderNode.element, EDITOR_ELEMENT_CLASS_NAME);
      if (post.hasContent) {
        (0, _utilsDomUtils.removeClassName)(renderNode.element, EDITOR_HAS_NO_CONTENT_CLASS_NAME);
      } else {
        (0, _utilsDomUtils.addClassName)(renderNode.element, EDITOR_HAS_NO_CONTENT_CLASS_NAME);
      }
      visit(renderNode, post.sections);
    }
  }, {
    key: _modelsTypes.MARKUP_SECTION_TYPE,
    value: function value(renderNode, section, visit) {
      var originalElement = renderNode.element;

      // Always rerender the section -- its tag name or attributes may have changed.
      // TODO make this smarter, only rerendering and replacing the element when necessary
      renderNode.element = renderMarkupSection(section);
      renderNode.cursorElement = null;
      attachRenderNodeElementToDOM(renderNode, originalElement);

      if (section.isBlank) {
        var cursorPlaceholder = renderCursorPlaceholder();
        renderNode.element.appendChild(cursorPlaceholder);
        renderNode.cursorElement = cursorPlaceholder;
      } else {
        var visitAll = true;
        visit(renderNode, section.markers, visitAll);
      }
    }
  }, {
    key: _modelsTypes.LIST_SECTION_TYPE,
    value: function value(renderNode, section, visit) {
      var originalElement = renderNode.element;

      renderNode.element = renderListSection(section);
      attachRenderNodeElementToDOM(renderNode, originalElement);

      var visitAll = true;
      visit(renderNode, section.items, visitAll);
    }
  }, {
    key: _modelsTypes.LIST_ITEM_TYPE,
    value: function value(renderNode, item, visit) {
      // FIXME do we need to do anything special for rerenders?
      renderNode.element = renderListItem();
      renderNode.cursorElement = null;
      attachRenderNodeElementToDOM(renderNode, null);

      if (item.isBlank) {
        var cursorPlaceholder = renderCursorPlaceholder();
        renderNode.element.appendChild(cursorPlaceholder);
        renderNode.cursorElement = cursorPlaceholder;
      } else {
        var visitAll = true;
        visit(renderNode, item.markers, visitAll);
      }
    }
  }, {
    key: _modelsTypes.MARKER_TYPE,
    value: function value(renderNode, marker) {
      var parentElement = undefined;

      if (renderNode.prev) {
        parentElement = getNextMarkerElement(renderNode.prev);
      } else {
        parentElement = renderNode.parent.element;
      }

      var _renderMarker = renderMarker(marker, parentElement, renderNode.prev);

      var element = _renderMarker.element;
      var markupElement = _renderMarker.markupElement;

      renderNode.element = element;
      renderNode.markupElement = markupElement;
    }
  }, {
    key: _modelsTypes.IMAGE_SECTION_TYPE,
    value: function value(renderNode, section) {
      if (renderNode.element) {
        if (renderNode.element.src !== section.src) {
          renderNode.element.src = section.src;
        }
      } else {
        var element = document.createElement('img');
        element.src = section.src;
        if (renderNode.prev) {
          var previousElement = renderNode.prev.element;
          var nextElement = previousElement.nextSibling;
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
  }, {
    key: _modelsTypes.CARD_TYPE,
    value: function value(renderNode, section) {
      var originalElement = renderNode.element;
      var editor = this.editor;
      var options = this.options;

      var card = this._findCard(section.name);

      var _renderCard = renderCard();

      var wrapper = _renderCard.wrapper;
      var cardElement = _renderCard.cardElement;

      renderNode.element = wrapper;
      attachRenderNodeElementToDOM(renderNode, originalElement);

      var cardNode = new _modelsCardNode['default'](editor, card, section, cardElement, options);
      renderNode.cardNode = cardNode;

      var initialMode = section._initialMode;
      cardNode[initialMode]();
    }
  }, {
    key: _modelsTypes.ATOM_TYPE,
    value: function value(renderNode, atomModel) {
      var parentElement = undefined;

      if (renderNode.prev) {
        parentElement = getNextMarkerElement(renderNode.prev);
      } else {
        parentElement = renderNode.parent.element;
      }

      var editor = this.editor;
      var options = this.options;

      var _renderAtom = renderAtom(atomModel, parentElement, renderNode.prev);

      var wrapper = _renderAtom.wrapper;
      var markupElement = _renderAtom.markupElement;
      var atomElement = _renderAtom.atomElement;
      var headTextNode = _renderAtom.headTextNode;
      var tailTextNode = _renderAtom.tailTextNode;

      var atom = this._findAtom(atomModel.name);

      var atomNode = renderNode.atomNode;
      if (!atomNode) {
        // create new AtomNode
        atomNode = new _modelsAtomNode['default'](editor, atom, atomModel, atomElement, options);
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
  }]);

  return Visitor;
})();

var destroyHooks = (_destroyHooks = {}, _defineProperty(_destroyHooks, _modelsTypes.POST_TYPE, function () /*renderNode, post*/{
  (0, _utilsAssert['default'])('post destruction is not supported by the renderer', false);
}), _defineProperty(_destroyHooks, _modelsTypes.MARKUP_SECTION_TYPE, function (renderNode, section) {
  removeRenderNodeSectionFromParent(renderNode, section);
  removeRenderNodeElementFromParent(renderNode);
}), _defineProperty(_destroyHooks, _modelsTypes.LIST_SECTION_TYPE, function (renderNode, section) {
  removeRenderNodeSectionFromParent(renderNode, section);
  removeRenderNodeElementFromParent(renderNode);
}), _defineProperty(_destroyHooks, _modelsTypes.LIST_ITEM_TYPE, function (renderNode, li) {
  removeRenderNodeSectionFromParent(renderNode, li);
  removeRenderNodeElementFromParent(renderNode);
}), _defineProperty(_destroyHooks, _modelsTypes.MARKER_TYPE, function (renderNode, marker) {
  // FIXME before we render marker, should delete previous renderNode's element
  // and up until the next marker element

  // If an atom throws during render we may end up later destroying a renderNode
  // that has not rendered yet, so exit early here if so.
  if (!renderNode.isRendered) {
    return;
  }
  var markupElement = renderNode.markupElement;

  if (marker.section) {
    marker.section.markers.remove(marker);
  }

  if (markupElement.parentNode) {
    // if no parentNode, the browser already removed this element
    markupElement.parentNode.removeChild(markupElement);
  }
}), _defineProperty(_destroyHooks, _modelsTypes.IMAGE_SECTION_TYPE, function (renderNode, section) {
  removeRenderNodeSectionFromParent(renderNode, section);
  removeRenderNodeElementFromParent(renderNode);
}), _defineProperty(_destroyHooks, _modelsTypes.CARD_TYPE, function (renderNode, section) {
  if (renderNode.cardNode) {
    renderNode.cardNode.teardown();
  }
  removeRenderNodeSectionFromParent(renderNode, section);
  removeRenderNodeElementFromParent(renderNode);
}), _defineProperty(_destroyHooks, _modelsTypes.ATOM_TYPE, function (renderNode, atom) {
  if (renderNode.atomNode) {
    renderNode.atomNode.teardown();
  }

  // an atom is a kind of marker so just call its destroy hook vs copying here
  destroyHooks[_modelsTypes.MARKER_TYPE](renderNode, atom);
}), _destroyHooks);

// removes children from parentNode (a RenderNode) that are scheduled for removal
function removeDestroyedChildren(parentNode) {
  var forceRemoval = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

  var child = parentNode.childNodes.head;
  var nextChild = undefined,
      method = undefined;
  while (child) {
    nextChild = child.next;
    if (child.isRemoved || forceRemoval) {
      removeDestroyedChildren(child, true);
      method = child.postNode.type;
      (0, _utilsAssert['default'])('editor-dom cannot destroy "' + method + '"', !!destroyHooks[method]);
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
    var renderNode = renderTree.buildRenderNode(postNode);
    parentNode.childNodes.insertAfter(renderNode, previousNode);
    return renderNode;
  }
}

var Renderer = (function () {
  function Renderer(editor, cards, atoms, unknownCardHandler, unknownAtomHandler, options) {
    _classCallCheck(this, Renderer);

    this.editor = editor;
    this.visitor = new Visitor(editor, cards, atoms, unknownCardHandler, unknownAtomHandler, options);
    this.nodes = [];
    this.hasRendered = false;
  }

  _createClass(Renderer, [{
    key: 'destroy',
    value: function destroy() {
      if (!this.hasRendered) {
        return;
      }
      var renderNode = this.renderTree.rootNode;
      var force = true;
      removeDestroyedChildren(renderNode, force);
    }
  }, {
    key: 'visit',
    value: function visit(renderTree, parentNode, postNodes) {
      var _this = this;

      var visitAll = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

      var previousNode = undefined;
      postNodes.forEach(function (postNode) {
        var node = lookupNode(renderTree, parentNode, postNode, previousNode);
        if (node.isDirty || visitAll) {
          _this.nodes.push(node);
        }
        previousNode = node;
      });
    }
  }, {
    key: 'render',
    value: function render(renderTree) {
      var _this2 = this;

      this.hasRendered = true;
      this.renderTree = renderTree;
      var renderNode = renderTree.rootNode;
      var method = undefined,
          postNode = undefined;

      while (renderNode) {
        removeDestroyedChildren(renderNode);
        postNode = renderNode.postNode;

        method = postNode.type;
        (0, _utilsAssert['default'])('EditorDom visitor cannot handle type ' + method, !!this.visitor[method]);
        this.visitor[method](renderNode, postNode, function () {
          for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          return _this2.visit.apply(_this2, [renderTree].concat(args));
        });
        renderNode.markClean();
        renderNode = this.nodes.shift();
      }
    }
  }]);

  return Renderer;
})();

exports['default'] = Renderer;