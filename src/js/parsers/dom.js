import {
  NO_BREAK_SPACE,
  TAB_CHARACTER,
  ATOM_CLASS_NAME
} from '../renderers/editor-dom';
import {
  MARKUP_SECTION_TYPE,
  LIST_SECTION_TYPE,
  LIST_ITEM_TYPE
} from '../models/types';
import {
  isTextNode,
  isCommentNode,
  isElementNode,
  getAttributes,
  normalizeTagName
} from '../utils/dom-utils';
import {
  any,
  detect,
  forEach
} from '../utils/array-utils';
import { TAB } from 'mobiledoc-kit/utils/characters';
import { ZWNJ } from 'mobiledoc-kit/renderers/editor-dom';

import SectionParser from 'mobiledoc-kit/parsers/section';
import Markup from 'mobiledoc-kit/models/markup';

const GOOGLE_DOCS_CONTAINER_ID_REGEX = /^docs\-internal\-guid/;

const NO_BREAK_SPACE_REGEX = new RegExp(NO_BREAK_SPACE, 'g');
const TAB_CHARACTER_REGEX = new RegExp(TAB_CHARACTER, 'g');
export function transformHTMLText(textContent) {
  let text = textContent;
  text = text.replace(NO_BREAK_SPACE_REGEX, ' ');
  text = text.replace(TAB_CHARACTER_REGEX, TAB);
  return text;
}

export function trimSectionText(section) {
  if (section.isMarkerable && section.markers.length) {
    let { head, tail } = section.markers;
    head.value = head.value.replace(/^\s+/, '');
    tail.value = tail.value.replace(/\s+$/, '');
  }
}

function isGoogleDocsContainer(element) {
  return !isTextNode(element) &&
         !isCommentNode(element) &&
         normalizeTagName(element.tagName) === normalizeTagName('b') &&
         GOOGLE_DOCS_CONTAINER_ID_REGEX.test(element.id);
}

function detectRootElement(element) {
  let childNodes = element.childNodes || [];
  let googleDocsContainer = detect(childNodes, isGoogleDocsContainer);

  if (googleDocsContainer) {
    return googleDocsContainer;
  } else {
    return element;
  }
}

const TAG_REMAPPING = {
  'b': 'strong',
  'i': 'em'
};

function remapTagName(tagName) {
  let normalized = normalizeTagName(tagName);
  let remapped = TAG_REMAPPING[normalized];
  return remapped || normalized;
}

function trim(str) {
  return str.replace(/^\s+/, '').replace(/\s+$/, '');
}

function walkMarkerableNodes(parent, callback) {
  let currentNode = parent;

  if (
    isTextNode(currentNode) ||
    (
      isElementNode(currentNode) &&
      currentNode.classList.contains(ATOM_CLASS_NAME)
    )
  ) {
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
class DOMParser {
  constructor(builder, options={}) {
    this.builder = builder;
    this.sectionParser = new SectionParser(this.builder, options);
  }

  parse(element) {
    const post = this.builder.createPost();
    let rootElement = detectRootElement(element);

    this._eachChildNode(rootElement, child => {
      let sections = this.parseSections(child);
      this.appendSections(post, sections);
    });

    // trim leading/trailing whitespace of markerable sections to avoid
    // unnessary whitespace from indented HTML input
    forEach(post.sections, section => trimSectionText(section));

    return post;
  }

  appendSections(post, sections) {
    forEach(sections, section => this.appendSection(post, section));
  }

  appendSection(post, section) {
    if (
      section.isBlank ||
      (section.isMarkerable &&
        trim(section.text) === "" &&
        !any(section.markers, marker => marker.isAtom))
    ) {
      return;
    }

    let lastSection = post.sections.tail;
    if (lastSection &&
        lastSection._inferredTagName &&
        section._inferredTagName &&
        lastSection.tagName === section.tagName) {
      lastSection.join(section);
    } else {
      post.sections.append(section);
    }
  }

  _eachChildNode(element, callback) {
    let nodes = isTextNode(element) ? [element] : element.childNodes;
    forEach(nodes, node => callback(node));
  }

  parseSections(element) {
    return this.sectionParser.parse(element);
  }

  // walk up from the textNode until the rootNode, converting each
  // parentNode into a markup
  collectMarkups(textNode, rootNode) {
    let markups = [];
    let currentNode = textNode.parentNode;
    while (currentNode && currentNode !== rootNode) {
      let markup = this.markupFromNode(currentNode);
      if (markup) {
        markups.push(markup);
      }

      currentNode = currentNode.parentNode;
    }
    return markups;
  }

  // Turn an element node into a markup
  markupFromNode(node) {
    if (Markup.isValidElement(node)) {
      let tagName = remapTagName(node.tagName);
      let attributes = getAttributes(node);
      return this.builder.createMarkup(tagName, attributes);
    }
  }

  // FIXME should move to the section parser?
  // FIXME the `collectMarkups` logic could simplify the section parser?
  reparseSection(section, renderTree) {
    switch (section.type) {
      case LIST_SECTION_TYPE:
        return this.reparseListSection(section, renderTree);
      case LIST_ITEM_TYPE:
        return this.reparseListItem(section, renderTree);
      case MARKUP_SECTION_TYPE:
        return this.reparseMarkupSection(section, renderTree);
      default:
        return; // can only parse the above types
    }
  }

  reparseMarkupSection(section, renderTree) {
    return this._reparseSectionContainingMarkers(section, renderTree);
  }

  reparseListItem(listItem, renderTree) {
    return this._reparseSectionContainingMarkers(listItem, renderTree);
  }

  reparseListSection(listSection, renderTree) {
    listSection.items.forEach(li => this.reparseListItem(li, renderTree));
  }

  _reparseSectionContainingMarkers(section, renderTree) {
    let element = section.renderNode.element;
    let seenRenderNodes = [];
    let previousMarker;

    walkMarkerableNodes(element, (node) => {
      let marker;
      let renderNode = renderTree.getElementRenderNode(node);
      if (renderNode) {
        if (renderNode.postNode.isMarker) {
          let text = transformHTMLText(node.textContent);
          let markups = this.collectMarkups(node, element);
          if (text.length) {
            marker = renderNode.postNode;
            marker.value = text;
            marker.markups = markups;
          } else {
            renderNode.scheduleForRemoval();
          }
        } else if (renderNode.postNode.isAtom) {
          let { headTextNode, tailTextNode } = renderNode;
          if (headTextNode.textContent !== ZWNJ) {
            let value = headTextNode.textContent.replace(new RegExp(ZWNJ, 'g'), '');
            headTextNode.textContent = ZWNJ;
            if (previousMarker && previousMarker.isMarker) {
              previousMarker.value += value;
              if (previousMarker.renderNode) {
                previousMarker.renderNode.markDirty();
              }
            } else {
              let postNode = renderNode.postNode;
              let newMarkups = postNode.markups.slice();
              let newPreviousMarker = this.builder.createMarker(value, newMarkups);
              section.markers.insertBefore(newPreviousMarker, postNode);

              let newPreviousRenderNode = renderTree.buildRenderNode(newPreviousMarker);
              newPreviousRenderNode.markDirty();
              section.renderNode.markDirty();

              seenRenderNodes.push(newPreviousRenderNode);
              section.renderNode.childNodes.insertBefore(newPreviousRenderNode,
                                                         renderNode);
            }
          }
          if (tailTextNode.textContent !== ZWNJ) {
            let value = tailTextNode.textContent.replace(new RegExp(ZWNJ, 'g'), '');
            tailTextNode.textContent = ZWNJ;

            if (renderNode.postNode.next && renderNode.postNode.next.isMarker) {
              let nextMarker = renderNode.postNode.next;

              if (nextMarker.renderNode) {
                let nextValue = nextMarker.renderNode.element.textContent;
                nextMarker.renderNode.element.textContent = value + nextValue;
              } else {
                let nextValue = value + nextMarker.value;
                nextMarker.value = nextValue;
              }
            } else {
              let postNode = renderNode.postNode;
              let newMarkups = postNode.markups.slice();
              let newMarker = this.builder.createMarker(value, newMarkups);

              section.markers.insertAfter(newMarker, postNode);

              let newRenderNode = renderTree.buildRenderNode(newMarker);
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
      } else if (isTextNode(node)) {
        let text = transformHTMLText(node.textContent);
        let markups = this.collectMarkups(node, element);
        marker = this.builder.createMarker(text, markups);

        renderNode = renderTree.buildRenderNode(marker);
        renderNode.element = node;
        renderNode.markClean();
        section.renderNode.markDirty();

        let previousRenderNode = previousMarker && previousMarker.renderNode;
        section.markers.insertAfter(marker, previousMarker);
        section.renderNode.childNodes.insertAfter(renderNode, previousRenderNode);
      }

      if (renderNode) {
        seenRenderNodes.push(renderNode);
      }
      previousMarker = marker;
    });

    let renderNode = section.renderNode.childNodes.head;
    while (renderNode) {
      if (seenRenderNodes.indexOf(renderNode) === -1) {
        renderNode.scheduleForRemoval();
      }
      renderNode = renderNode.next;
    }
  }
}

export default DOMParser;
