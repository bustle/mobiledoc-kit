import { MARKUP_SECTION_TYPE } from '../models/markup-section';
import SectionParser from 'content-kit-editor/parsers/section';
import { forEach } from 'content-kit-editor/utils/array-utils';
import { getAttributesArray, walkTextNodes } from '../utils/dom-utils';
import { UNPRINTABLE_CHARACTER } from 'content-kit-editor/renderers/editor-dom';
import Markup from 'content-kit-editor/models/markup';

const sanitizeTextRegex = new RegExp(UNPRINTABLE_CHARACTER, 'g');

function sanitizeText(text) {
  return text.replace(sanitizeTextRegex, '');
}

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

  // FIXME should move to the section parser?
  // FIXME the `collectMarkups` logic could simplify the section parser?
  reparseSection(section, renderTree) {
    if (section.type !== MARKUP_SECTION_TYPE) {
      // can only reparse markup sections
      return;
    }
    const sectionElement = section.renderNode.element;

    // Turn an element node into a markup
    const markupFromNode = (node) => {
      if (Markup.isValidElement(node)) {
        let tagName = node.tagName;
        let attributes = getAttributesArray(node);

        return this.builder.createMarkup(tagName, attributes);
      }
    };

    // walk up from the textNode until the rootNode, converting each
    // parentNode into a markup
    const  collectMarkups = (textNode, rootNode) =>{
      let markups = [];
      let currentNode = textNode.parentNode;
      while (currentNode && currentNode !== rootNode) {
        let markup = markupFromNode(currentNode);
        if (markup) {
          markups.push(markup);
        }

        currentNode = currentNode.parentNode;
      }
      return markups;
    };

    let seenRenderNodes = [];
    let previousMarker;

    walkTextNodes(sectionElement, (textNode) => {
      const text = sanitizeText(textNode.textContent);
      let markups = collectMarkups(textNode, sectionElement);

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

        // create a cleaned render node to account for the fact that this
        // render node comes from already-displayed DOM
        // FIXME this should be cleaner
        renderNode = renderTree.buildRenderNode(marker);
        renderNode.element = textNode;
        renderNode.markClean();

        if (previousMarker) {
          // insert this marker after the previous one
          section.markers.insertAfter(marker, previousMarker);
          section.renderNode.childNodes.insertAfter(renderNode, previousMarker.renderNode);
        } else {
          // insert marker at the beginning of the section
          section.markers.prepend(marker);
          section.renderNode.childNodes.insertAfter(renderNode, null);
        }

        // find the nextMarkerElement, set it on the render node
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

    // remove any nodes that were not marked as seen
    section.renderNode.childNodes.forEach(childRenderNode => {
      if (seenRenderNodes.indexOf(childRenderNode) === -1) {
        childRenderNode.scheduleForRemoval();
      }
    });

    /** FIXME that we are reparsing and there are no markers should never
     * happen. We manage the delete key on our own. */
    if (section.markers.isEmpty) {
      let marker = this.builder.createBlankMarker();
      section.markers.append(marker);
    }
  }
}
