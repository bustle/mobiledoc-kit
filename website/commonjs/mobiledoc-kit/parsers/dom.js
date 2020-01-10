'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.transformHTMLText = transformHTMLText;
exports.trimSectionText = trimSectionText;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _renderersEditorDom = require('../renderers/editor-dom');

var _modelsTypes = require('../models/types');

var _utilsDomUtils = require('../utils/dom-utils');

var _utilsArrayUtils = require('../utils/array-utils');

var _utilsCharacters = require('../utils/characters');

var _parsersSection = require('../parsers/section');

var _modelsMarkup = require('../models/markup');

var GOOGLE_DOCS_CONTAINER_ID_REGEX = /^docs\-internal\-guid/;

var NO_BREAK_SPACE_REGEX = new RegExp(_renderersEditorDom.NO_BREAK_SPACE, 'g');
var TAB_CHARACTER_REGEX = new RegExp(_renderersEditorDom.TAB_CHARACTER, 'g');

function transformHTMLText(textContent) {
  var text = textContent;
  text = text.replace(NO_BREAK_SPACE_REGEX, ' ');
  text = text.replace(TAB_CHARACTER_REGEX, _utilsCharacters.TAB);
  return text;
}

function trimSectionText(section) {
  if (section.isMarkerable && section.markers.length) {
    var _section$markers = section.markers;
    var head = _section$markers.head;
    var tail = _section$markers.tail;

    head.value = head.value.replace(/^\s+/, '');
    tail.value = tail.value.replace(/\s+$/, '');
  }
}

function isGoogleDocsContainer(element) {
  return !(0, _utilsDomUtils.isTextNode)(element) && !(0, _utilsDomUtils.isCommentNode)(element) && (0, _utilsDomUtils.normalizeTagName)(element.tagName) === (0, _utilsDomUtils.normalizeTagName)('b') && GOOGLE_DOCS_CONTAINER_ID_REGEX.test(element.id);
}

function detectRootElement(element) {
  var childNodes = element.childNodes || [];
  var googleDocsContainer = (0, _utilsArrayUtils.detect)(childNodes, isGoogleDocsContainer);

  if (googleDocsContainer) {
    return googleDocsContainer;
  } else {
    return element;
  }
}

var TAG_REMAPPING = {
  'b': 'strong',
  'i': 'em'
};

function remapTagName(tagName) {
  var normalized = (0, _utilsDomUtils.normalizeTagName)(tagName);
  var remapped = TAG_REMAPPING[normalized];
  return remapped || normalized;
}

function trim(str) {
  return str.replace(/^\s+/, '').replace(/\s+$/, '');
}

function walkMarkerableNodes(parent, callback) {
  var currentNode = parent;

  if ((0, _utilsDomUtils.isTextNode)(currentNode) || (0, _utilsDomUtils.isElementNode)(currentNode) && currentNode.classList.contains(_renderersEditorDom.ATOM_CLASS_NAME)) {
    callback(currentNode);
  } else {
    currentNode = currentNode.firstChild;
    while (currentNode) {
      walkMarkerableNodes(currentNode, callback);
      currentNode = currentNode.nextSibling;
    }
  }
}

/**
 * Parses DOM element -> Post
 * @private
 */

var DOMParser = (function () {
  function DOMParser(builder) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, DOMParser);

    this.builder = builder;
    this.sectionParser = new _parsersSection['default'](this.builder, options);
  }

  _createClass(DOMParser, [{
    key: 'parse',
    value: function parse(element) {
      var _this = this;

      var post = this.builder.createPost();
      var rootElement = detectRootElement(element);

      this._eachChildNode(rootElement, function (child) {
        var sections = _this.parseSections(child);
        _this.appendSections(post, sections);
      });

      // trim leading/trailing whitespace of markerable sections to avoid
      // unnessary whitespace from indented HTML input
      (0, _utilsArrayUtils.forEach)(post.sections, function (section) {
        return trimSectionText(section);
      });

      return post;
    }
  }, {
    key: 'appendSections',
    value: function appendSections(post, sections) {
      var _this2 = this;

      (0, _utilsArrayUtils.forEach)(sections, function (section) {
        return _this2.appendSection(post, section);
      });
    }
  }, {
    key: 'appendSection',
    value: function appendSection(post, section) {
      if (section.isBlank || section.isMarkerable && trim(section.text) === "" && !(0, _utilsArrayUtils.any)(section.markers, function (marker) {
        return marker.isAtom;
      })) {
        return;
      }

      var lastSection = post.sections.tail;
      if (lastSection && lastSection._inferredTagName && section._inferredTagName && lastSection.tagName === section.tagName) {
        lastSection.join(section);
      } else {
        post.sections.append(section);
      }
    }
  }, {
    key: '_eachChildNode',
    value: function _eachChildNode(element, callback) {
      var nodes = (0, _utilsDomUtils.isTextNode)(element) ? [element] : element.childNodes;
      (0, _utilsArrayUtils.forEach)(nodes, function (node) {
        return callback(node);
      });
    }
  }, {
    key: 'parseSections',
    value: function parseSections(element) {
      return this.sectionParser.parse(element);
    }

    // walk up from the textNode until the rootNode, converting each
    // parentNode into a markup
  }, {
    key: 'collectMarkups',
    value: function collectMarkups(textNode, rootNode) {
      var markups = [];
      var currentNode = textNode.parentNode;
      while (currentNode && currentNode !== rootNode) {
        var markup = this.markupFromNode(currentNode);
        if (markup) {
          markups.push(markup);
        }

        currentNode = currentNode.parentNode;
      }
      return markups;
    }

    // Turn an element node into a markup
  }, {
    key: 'markupFromNode',
    value: function markupFromNode(node) {
      if (_modelsMarkup['default'].isValidElement(node)) {
        var tagName = remapTagName(node.tagName);
        var attributes = (0, _utilsDomUtils.getAttributes)(node);
        return this.builder.createMarkup(tagName, attributes);
      }
    }

    // FIXME should move to the section parser?
    // FIXME the `collectMarkups` logic could simplify the section parser?
  }, {
    key: 'reparseSection',
    value: function reparseSection(section, renderTree) {
      switch (section.type) {
        case _modelsTypes.LIST_SECTION_TYPE:
          return this.reparseListSection(section, renderTree);
        case _modelsTypes.LIST_ITEM_TYPE:
          return this.reparseListItem(section, renderTree);
        case _modelsTypes.MARKUP_SECTION_TYPE:
          return this.reparseMarkupSection(section, renderTree);
        default:
          return; // can only parse the above types
      }
    }
  }, {
    key: 'reparseMarkupSection',
    value: function reparseMarkupSection(section, renderTree) {
      return this._reparseSectionContainingMarkers(section, renderTree);
    }
  }, {
    key: 'reparseListItem',
    value: function reparseListItem(listItem, renderTree) {
      return this._reparseSectionContainingMarkers(listItem, renderTree);
    }
  }, {
    key: 'reparseListSection',
    value: function reparseListSection(listSection, renderTree) {
      var _this3 = this;

      listSection.items.forEach(function (li) {
        return _this3.reparseListItem(li, renderTree);
      });
    }
  }, {
    key: '_reparseSectionContainingMarkers',
    value: function _reparseSectionContainingMarkers(section, renderTree) {
      var _this4 = this;

      var element = section.renderNode.element;
      var seenRenderNodes = [];
      var previousMarker = undefined;

      walkMarkerableNodes(element, function (node) {
        var marker = undefined;
        var renderNode = renderTree.getElementRenderNode(node);
        if (renderNode) {
          if (renderNode.postNode.isMarker) {
            var text = transformHTMLText(node.textContent);
            var markups = _this4.collectMarkups(node, element);
            if (text.length) {
              marker = renderNode.postNode;
              marker.value = text;
              marker.markups = markups;
            } else {
              renderNode.scheduleForRemoval();
            }
          } else if (renderNode.postNode.isAtom) {
            var _renderNode = renderNode;
            var headTextNode = _renderNode.headTextNode;
            var tailTextNode = _renderNode.tailTextNode;

            if (headTextNode.textContent !== _renderersEditorDom.ZWNJ) {
              var value = headTextNode.textContent.replace(new RegExp(_renderersEditorDom.ZWNJ, 'g'), '');
              headTextNode.textContent = _renderersEditorDom.ZWNJ;
              if (previousMarker && previousMarker.isMarker) {
                previousMarker.value += value;
                if (previousMarker.renderNode) {
                  previousMarker.renderNode.markDirty();
                }
              } else {
                var postNode = renderNode.postNode;
                var newMarkups = postNode.markups.slice();
                var newPreviousMarker = _this4.builder.createMarker(value, newMarkups);
                section.markers.insertBefore(newPreviousMarker, postNode);

                var newPreviousRenderNode = renderTree.buildRenderNode(newPreviousMarker);
                newPreviousRenderNode.markDirty();
                section.renderNode.markDirty();

                seenRenderNodes.push(newPreviousRenderNode);
                section.renderNode.childNodes.insertBefore(newPreviousRenderNode, renderNode);
              }
            }
            if (tailTextNode.textContent !== _renderersEditorDom.ZWNJ) {
              var value = tailTextNode.textContent.replace(new RegExp(_renderersEditorDom.ZWNJ, 'g'), '');
              tailTextNode.textContent = _renderersEditorDom.ZWNJ;

              if (renderNode.postNode.next && renderNode.postNode.next.isMarker) {
                var nextMarker = renderNode.postNode.next;

                if (nextMarker.renderNode) {
                  var nextValue = nextMarker.renderNode.element.textContent;
                  nextMarker.renderNode.element.textContent = value + nextValue;
                } else {
                  var nextValue = value + nextMarker.value;
                  nextMarker.value = nextValue;
                }
              } else {
                var postNode = renderNode.postNode;
                var newMarkups = postNode.markups.slice();
                var newMarker = _this4.builder.createMarker(value, newMarkups);

                section.markers.insertAfter(newMarker, postNode);

                var newRenderNode = renderTree.buildRenderNode(newMarker);
                seenRenderNodes.push(newRenderNode);

                newRenderNode.markDirty();
                section.renderNode.markDirty();

                section.renderNode.childNodes.insertAfter(newRenderNode, renderNode);
              }
            }
            if (renderNode) {
              marker = renderNode.postNode;
            }
          }
        } else if ((0, _utilsDomUtils.isTextNode)(node)) {
          var text = transformHTMLText(node.textContent);
          var markups = _this4.collectMarkups(node, element);
          marker = _this4.builder.createMarker(text, markups);

          renderNode = renderTree.buildRenderNode(marker);
          renderNode.element = node;
          renderNode.markClean();
          section.renderNode.markDirty();

          var previousRenderNode = previousMarker && previousMarker.renderNode;
          section.markers.insertAfter(marker, previousMarker);
          section.renderNode.childNodes.insertAfter(renderNode, previousRenderNode);
        }

        if (renderNode) {
          seenRenderNodes.push(renderNode);
        }
        previousMarker = marker;
      });

      var renderNode = section.renderNode.childNodes.head;
      while (renderNode) {
        if (seenRenderNodes.indexOf(renderNode) === -1) {
          renderNode.scheduleForRemoval();
        }
        renderNode = renderNode.next;
      }
    }
  }]);

  return DOMParser;
})();

exports['default'] = DOMParser;