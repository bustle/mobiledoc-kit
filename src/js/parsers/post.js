import {
  MARKUP_SECTION_TYPE,
  LIST_SECTION_TYPE,
  LIST_ITEM_TYPE
} from '../models/types';

import SectionParser from 'content-kit-editor/parsers/section';
import { forEach } from 'content-kit-editor/utils/array-utils';
import { getAttributesArray, walkTextNodes } from '../utils/dom-utils';
import Markup from 'content-kit-editor/models/markup';

export default class PostParser {
  constructor(builder) {
    this.builder = builder;
    this.sectionParser = new SectionParser(this.builder);
  }

  parse(element) {
    const post = this.builder.createPost();

    forEach(element.childNodes, child => {
      post.sections.append(this.sectionParser.parse(child));
    });

    return post;
  }

  parseSection(element, otherArg) {
    if (!!otherArg) {
      element = otherArg; // hack to deal with passed previousSection
    }
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
      let tagName = node.tagName;
      let attributes = getAttributesArray(node);

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
    const element = section.renderNode.element;
    let seenRenderNodes = [];
    let previousMarker;

    walkTextNodes(element, (textNode) => {
      const text = textNode.textContent;
      let markups = this.collectMarkups(textNode, element);

      let marker;

      let renderNode = renderTree.getElementRenderNode(textNode);
      if (renderNode) {
        if (text.length) {
          marker = renderNode.postNode;
          marker.value = text;
          marker.markups = markups;
        } else {
          renderNode.scheduleForRemoval();
        }
      } else {
        marker = this.builder.createMarker(text, markups);

        renderNode = renderTree.buildRenderNode(marker);
        renderNode.element = textNode;
        renderNode.markClean();

        let previousRenderNode = previousMarker && previousMarker.renderNode;
        section.markers.insertAfter(marker, previousMarker);
        section.renderNode.childNodes.insertAfter(renderNode, previousRenderNode);

        let parentNodeCount = marker.closedMarkups.length;
        let nextMarkerElement = textNode.parentNode;
        while (parentNodeCount--) {
          nextMarkerElement = nextMarkerElement.parentNode;
        }
        renderNode.nextMarkerElement = nextMarkerElement;
      }

      seenRenderNodes.push(renderNode);
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
