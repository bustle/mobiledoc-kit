import { trim } from 'content-kit-utils';
import { VALID_MARKUP_SECTION_TAGNAMES } from '../models/markup-section';
import { VALID_MARKUP_TAGNAMES } from '../models/markup';
import { getAttributes, normalizeTagName } from '../utils/dom-utils';

const ELEMENT_NODE = 1;
const TEXT_NODE = 3;

const ALLOWED_ATTRIBUTES = ['href', 'rel', 'src'];

function isEmptyTextNode(node) {
  return node.nodeType === TEXT_NODE && trim(node.textContent) === '';
}

function isValidMarkerElement(element) {
  let tagName = normalizeTagName(element.tagName);
  return VALID_MARKUP_TAGNAMES.indexOf(tagName) !== -1;
}

function parseMarkers(section, builder, topNode) {
  var markups = [];
  var text = null;
  var currentNode = topNode;
  while (currentNode) {
    switch(currentNode.nodeType) {
    case ELEMENT_NODE:
      if (isValidMarkerElement(currentNode)) {
        const attributes = getAttributes(currentNode, ALLOWED_ATTRIBUTES);
        markups.push(builder.createMarkup(currentNode.tagName, attributes));
      }
      break;
    case TEXT_NODE:
      text = (text || '') + currentNode.textContent;
      break;
    }

    if (currentNode.firstChild) {
      if (isValidMarkerElement(currentNode) && text !== null) {
        section.markers.append(builder.createMarker(text, markups.slice()));
        text = null;
      }
      currentNode = currentNode.firstChild;
    } else if (currentNode.nextSibling) {
      if (currentNode === topNode) {
        section.markers.append(builder.createMarker(text, markups.slice()));
        break;
      } else {
        currentNode = currentNode.nextSibling;
        if (currentNode.nodeType === ELEMENT_NODE && isValidMarkerElement(currentNode) && text !== null) {
          section.markers.append(builder.createMarker(text, markups.slice()));
          text = null;
        }
      }
    } else {
      section.markers.append(builder.createMarker(text, markups.slice()));

      while (currentNode && !currentNode.nextSibling && currentNode !== topNode) {
        currentNode = currentNode.parentNode;
        if (isValidMarkerElement(currentNode)) {
          markups.pop();
        }
      }

      text = null;

      if (currentNode === topNode) {
        break;
      } else {
        currentNode = currentNode.nextSibling;
        if (currentNode === topNode) {
          break;
        }
      }
    }
  }
}

function NewHTMLParser(builder) {
  this.builder = builder;
}

NewHTMLParser.prototype = {
  parseSection: function(previousSection, sectionElement) {
    var builder = this.builder;
    var section;
    switch(sectionElement.nodeType) {
    case ELEMENT_NODE:
      let tagName = normalizeTagName(sectionElement.tagName);
      // <p> <h2>, etc
      if (VALID_MARKUP_SECTION_TAGNAMES.indexOf(tagName) !== -1) {
        section = builder.createMarkupSection(tagName);
        var node = sectionElement.firstChild;
        while (node) {
          parseMarkers(section, builder, node);
          node = node.nextSibling;
        }
      // <strong> <b>, etc
      } else {
        if (previousSection && previousSection.isGenerated) {
          section = previousSection;
        } else {
          section = builder.createMarkupSection('P', [], true);
        }
        parseMarkers(section, builder, sectionElement);
      }
      break;
    case TEXT_NODE:
      if (previousSection && previousSection.isGenerated) {
        section = previousSection;
      } else {
        section = builder.createMarkupSection('P', [], true);
      }
      parseMarkers(section, builder, sectionElement);
      break;
    }
    return section;
  },
  parse: function(postElement) {
    var post = this.builder.createPost();
    var i, l, section, previousSection, sectionElement;
    // FIXME: Instead of storing isGenerated on sections, and passing
    // the previous section to the parser, we could instead do a two-pass
    // parse. The first pass identifies sections and gathers a list of
    // dom nodes that can be parsed for markers, the second pass parses
    // for markers.
    for (i=0, l=postElement.childNodes.length;i<l;i++) {
      sectionElement = postElement.childNodes[i];
      if (!isEmptyTextNode(sectionElement)) {
        section = this.parseSection(previousSection, sectionElement);
        if (section !== previousSection) {
          post.sections.append(section);
          previousSection = section;
        }
      }
    }

    if (post.sections.isEmpty) {
      section = this.builder.createMarkupSection('p');
      post.sections.append(section);
    }

    return post;
  }
};

export default NewHTMLParser;
