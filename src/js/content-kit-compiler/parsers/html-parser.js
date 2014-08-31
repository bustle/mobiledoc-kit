import BlockModel from '../models/block';
import MarkupModel from '../models/markup';
import { DefaultBlockTypeSet, DefaultMarkupTypeSet } from '../types/default-types';
import { mergeWithOptions } from '../../content-kit-utils/object-utils';
import { toArray } from '../../content-kit-utils/array-utils';
import { trim, trimLeft, sanitizeWhitespace } from '../../content-kit-utils/string-utils';
import { createElement, DOMParsingNode, textOfNode, unwrapNode, attributesForNode } from '../../content-kit-utils/node-utils';

/**
 * Gets the last block in the set or creates and return a default block if none exist yet.
 */
function getLastBlockOrCreate(parser, blocks) {
  var block;
  if (blocks.length) {
    block = blocks[blocks.length - 1];
  } else {
    block = parser.parseBlock(createElement(DefaultBlockTypeSet.TEXT.tag));
    blocks.push(block);
  }
  return block;
}

/**
 * Helper to retain stray elements at the root of the html that aren't blocks
 */
function handleNonBlockElementAtRoot(parser, elementNode, blocks) {
  var block = getLastBlockOrCreate(parser, blocks),
      markup = parser.parseElementMarkup(elementNode, block.value.length);
  if (markup) {
    block.markup.push(markup);
  }
  block.value += textOfNode(elementNode);
}

/**
 * @class HTMLParser
 * @constructor
 */
function HTMLParser(options) {
  var defaults = {
    blockTypes       : DefaultBlockTypeSet,
    markupTypes      : DefaultMarkupTypeSet,
    includeTypeNames : false
  };
  mergeWithOptions(this, defaults, options);
}

/**
 * @method parse
 * @param html String of HTML content
 * @return Array Parsed JSON content array
 */
HTMLParser.prototype.parse = function(html) {
  DOMParsingNode.innerHTML = sanitizeWhitespace(html);

  var children = toArray(DOMParsingNode.childNodes),
      len = children.length,
      blocks = [],
      i, currentNode, block, text;

  for (i = 0; i < len; i++) {
    currentNode = children[i];
    // All top level nodes *should be* `Element` nodes and supported block types.
    // We'll handle some cases if it isn't so we don't lose any content when parsing.
    // Parser assumes sane input (such as from the ContentKit Editor) and is not intended to be a full html sanitizer.
    if (currentNode.nodeType === 1) {
      block = this.parseBlock(currentNode);
      if (block) {
        blocks.push(block);
      } else {
        handleNonBlockElementAtRoot(this, currentNode, blocks);
      }
    } else if (currentNode.nodeType === 3) {
      text = currentNode.nodeValue;
      if (trim(text)) {
        block = getLastBlockOrCreate(this, blocks);
        block.value += text;
      }
    }
  }

  return blocks;
};

/**
 * @method parseBlock
 * @param node DOM node to parse
 * @return {BlockModel} parsed block model
 * Parses a single block type node into a model
 */
HTMLParser.prototype.parseBlock = function(node) {
  var type = this.blockTypes.findByNode(node);
  if (type) {
    return new BlockModel({
      type       : type.id,
      type_name  : this.includeTypeNames && type.name,
      value      : trim(textOfNode(node)),
      attributes : attributesForNode(node),
      markup     : this.parseBlockMarkup(node)
    });
  }
};

/**
 * @method parseBlockMarkup
 * @param node DOM node to parse
 * @return {Array} parsed markups
 * Parses a single block type node's markup
 */
HTMLParser.prototype.parseBlockMarkup = function(node) {
  var processedText = '',
      markups = [],
      index = 0,
      currentNode, markup;

  // Clone the node since it will be recursively torn down
  node = node.cloneNode(true);

  while (node.hasChildNodes()) {
    currentNode = node.firstChild;
    if (currentNode.nodeType === 1) {
      markup = this.parseElementMarkup(currentNode, processedText.length);
      if (markup) {
        markups.push(markup);
      }
      // unwrap the element so we can process any children
      if (currentNode.hasChildNodes()) {
        unwrapNode(currentNode);
      }
    } else if (currentNode.nodeType === 3) {
      var text = sanitizeWhitespace(currentNode.nodeValue);
      if (index === 0) { text = trimLeft(text); }
      if (text) { processedText += text; }
    }

    // node has been processed, remove it
    currentNode.parentNode.removeChild(currentNode);
    index++;
  }

  return markups;
};

/**
 * @method parseElementMarkup
 * @param node DOM node to parse
 * @param startIndex DOM node to parse
 * @return {MarkupModel} parsed markup model
 * Parses markup of a single html element node
 */
HTMLParser.prototype.parseElementMarkup = function(node, startIndex) {
  var type = this.markupTypes.findByNode(node),
      selfClosing, endIndex;

  if (type) {
    selfClosing = type.selfClosing;
    if (!selfClosing && !node.hasChildNodes()) { return; } // check for empty nodes

    endIndex = startIndex + (selfClosing ? 0 : textOfNode(node).length);
    if (endIndex > startIndex || (selfClosing && endIndex === startIndex)) { // check for empty nodes
      return new MarkupModel({
        type       : type.id,
        type_name  : this.includeTypeNames && type.name,
        start      : startIndex,
        end        : endIndex,
        attributes : attributesForNode(node, { style: 1 }) // filter out inline styles
      });
    }
  }
};

export default HTMLParser;
