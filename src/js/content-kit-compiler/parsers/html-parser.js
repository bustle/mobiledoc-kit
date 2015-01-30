import BlockModel from '../models/block';
import MarkupModel from '../models/markup';
import Type from '../types/type';
import { DefaultBlockTypeSet, DefaultMarkupTypeSet } from '../types/default-types';
import { mergeWithOptions } from 'node_modules/content-kit-utils/src/object-utils';
import { toArray } from 'node_modules/content-kit-utils/src/array-utils';
import { trim, trimLeft, sanitizeWhitespace } from 'node_modules/content-kit-utils/src/string-utils';
import { DOMParsingNode, textOfNode, unwrapNode, attributesForNode } from 'node_modules/content-kit-utils/src/node-utils';

var ELEMENT_NODE = window.Node && Node.ELEMENT_NODE || 1;
var TEXT_NODE    = window.Node && Node.TEXT_NODE    || 3;
var defaultAttributeBlacklist = { 'style' : 1, 'class' : 1 };

/**
 * Returns the last block in the set or creates a default block if none exist yet.
 */
function getLastBlockOrCreate(blocks) {
  var blockCount = blocks.length, block;
  if (blockCount) {
    block = blocks[blockCount - 1];
  } else {
    block = BlockModel.createWithType(Type.PARAGRAPH);
    blocks.push(block);
  }
  return block;
}

/**
 * Helper to parse elements at the root that aren't blocks
 */
function handleNonBlockAtRoot(parser, elementNode, blocks) {
  var block = getLastBlockOrCreate(blocks);
  var markup = parser.parseMarkupForElement(elementNode, block.value.length);
  if (markup) {
    block.markup = block.markup.concat(markup);
  }
  block.value += textOfNode(elementNode);
}

/**
 * @class HTMLParser
 * @constructor
 */
function HTMLParser(options) {
  var defaults = {
    blockTypes         : DefaultBlockTypeSet,
    markupTypes        : DefaultMarkupTypeSet,
    attributeBlacklist : defaultAttributeBlacklist,
    includeTypeNames   : false
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

  var nodes = toArray(DOMParsingNode.childNodes);
  var nodeCount = nodes.length;
  var blocks = [];
  var i, node, nodeType, block, text;

  for (i = 0; i < nodeCount; i++) {
    node = nodes[i];
    nodeType = node.nodeType;

    if (nodeType === ELEMENT_NODE) {
      block = this.serializeBlockNode(node);
      if (block) {
        blocks.push(block);
      } else {
        handleNonBlockAtRoot(this, node, blocks);
      }
    } else if (nodeType === TEXT_NODE) {
      text = node.nodeValue;
      if (trim(text)) {
        block = getLastBlockOrCreate(blocks);
        block.value += text;
      }
    }
  }

  return blocks;
};

/**
 * @method parseMarkupForElement
 * @param node element node to parse
 * @return {Array} parsed markups
 */
HTMLParser.prototype.parseMarkupForElement = function(node, startOffset) {
  var index = 0;
  var markups = [];
  var currentNode, nodeType, markup;

  startOffset = startOffset || 0;
  node = node.cloneNode(true);
  markup = this.serializeMarkupNode(node, startOffset);
  if (markup) { markups.push(markup); }

  while (node.hasChildNodes()) {
    currentNode = node.firstChild;
    nodeType = currentNode.nodeType;

    if (nodeType === ELEMENT_NODE) {
      markup = this.serializeMarkupNode(currentNode, startOffset);
      if (markup) { markups.push(markup); }
      unwrapNode(currentNode);
    } else if (nodeType === TEXT_NODE) {
      var text = sanitizeWhitespace(currentNode.nodeValue);
      if (index === 0) { text = trimLeft(text); }
      if (text) { startOffset += text.length; }
    }

    currentNode.parentNode.removeChild(currentNode);
    index++;
  }

  return markups;
};

/**
 * @method serializeBlockNode
 * @param node element node to parse
 * @return {BlockModel} parsed block model
 * Serializes a single block type node into a model
 */
HTMLParser.prototype.serializeBlockNode = function(node) {
  var type = this.blockTypes.findByNode(node);
  if (type) {
    return new BlockModel({
      type       : type.id,
      type_name  : this.includeTypeNames && type.name,
      value      : trim(textOfNode(node)),
      attributes : attributesForNode(node, this.attributeBlacklist),
      markup     : this.parseMarkupForElement(node)
    });
  }
};

/**
 * @method serializeMarkupNode
 * @param node element node to parse
 * @param startIndex 
 * @return {MarkupModel} markup model
 * Serializes markup of a single html element node (no child elements)
 */
HTMLParser.prototype.serializeMarkupNode = function(node, startIndex) {
  var type = this.markupTypes.findByNode(node);
  var selfClosing, endIndex;

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
        attributes : attributesForNode(node, this.attributeBlacklist)
      });
    }
  }
};

export default HTMLParser;
