/*!
 * @overview ContentKit-Compiler: Parses HTML to ContentKit's JSON schema and renders back to HTML.
 * @version  0.1.0
 * @author   Garth Poitras <garth22@gmail.com> (http://garthpoitras.com/)
 * @license  MIT
 * Last modified: Jul 10, 2014
 */

(function(exports, document, undefined) {

'use strict';

/**
 * @namespace ContentKit
 */
var ContentKit = exports.ContentKit || {};
exports.ContentKit = ContentKit;

/**
 * @class Type
 * @private
 * @constructor
 * Base class that contains info about an allowed node type (type id, tag, etc).
 * Only to be subclassed (BlockType, MarkupType)
 */
function Type(options, meta) {
  if (options) {
    this.id = options.id === undefined ? meta.autoId++ : options.id;
    meta.idLookup[this.id] = this;
    this.name = options.name || options.tag;
    if (options.tag) {
      this.tag = options.tag;
      this.selfClosing = /^(br|img|hr|meta|link|embed)$/i.test(this.tag);
      meta.tagLookup[this.tag] = this;
    }
  }
}

/**
 * Type static meta properties
 */
function TypeMeta() {
  this.autoId    = 1;  // Auto-increment id counter
  this.idLookup  = {}; // Hash cache for finding by id
  this.tagLookup = {}; // Hash cache for finding by tag
}

/**
 * Returns type info for a given Node
 */
Type.findByNode = function(node) {
  return this.meta.tagLookup[node.tagName.toLowerCase()];
};

/**
 * Returns type info for a given id
 */
Type.findById = function(id) {
  return this.meta.idLookup[id];
};

/**
 * @class BlockType
 * @private
 * @constructor
 * @extends Type
 */
function BlockType(options) {
  Type.call(this, options, BlockType.meta);
}
BlockType.meta = new TypeMeta();
inherit(BlockType, Type);

/**
 * Default supported block node type dictionary
 */
var DefaultBlockTypes = {
  TEXT         : new BlockType({ tag: 'p', name: 'text' }),
  HEADING      : new BlockType({ tag: 'h2', name: 'heading' }),
  SUBHEADING   : new BlockType({ tag: 'h3', name: 'subheading' }),
  IMAGE        : new BlockType({ tag: 'img', name: 'image' }),
  QUOTE        : new BlockType({ tag: 'blockquote', name: 'quote' }),
  LIST         : new BlockType({ tag: 'ul', name: 'list' }),
  ORDERED_LIST : new BlockType({ tag: 'ol', name: 'ordered list' }),
  EMBED        : new BlockType({ name: 'embed' }),
  GROUP        : new BlockType({ name: 'group' })
};

/**
 * @class MarkupType
 * @private
 * @constructor
 * @extends Type
 */
function MarkupType(options) {
  Type.call(this, options, MarkupType.meta);
}
MarkupType.meta = new TypeMeta();
inherit(MarkupType, Type);

/**
 * Default supported markup type dictionary
 */
var DefaultMarkupTypes = {
  BOLD        : new MarkupType({ tag: 'b', name: 'bold' }),
  ITALIC      : new MarkupType({ tag: 'i', name: 'italic' }),
  UNDERLINE   : new MarkupType({ tag: 'u', name: 'underline' }),
  LINK        : new MarkupType({ tag: 'a', name: 'link' }),
  BREAK       : new MarkupType({ tag: 'br', name: 'break' }),
  LIST_ITEM   : new MarkupType({ tag: 'li', name: 'list item' }),
  SUBSCRIPT   : new MarkupType({ tag: 'sub', name: 'subscript' }),
  SUPERSCRIPT : new MarkupType({ tag: 'sup', name: 'superscript' })
};

/**
 * Converts an array-like object (i.e. NodeList) to Array
 */
function toArray(obj) {
  var array = [],
      i = obj.length >>> 0; // cast to Uint32
  while (i--) {
    array[i] = obj[i];
  }
  return array;
}

/**
 * Computes the sum of values in an array
 */
function sumArray(array) {
  var sum = 0, i, num;
  for (i in array) { // 'for in' best for sparse arrays
    sum += array[i];
  }
  return sum;
}

/**
 * A document instance separate from the page's document. (if browser supports it)
 * Prevents images, scripts, and styles from executing while parsing nodes.
 */
var doc = (function() {
  var implementation = document.implementation,
      createHTMLDocument = implementation.createHTMLDocument;
  if (createHTMLDocument) {
    return createHTMLDocument.call(implementation, '');
  }
  return document;
})();

/**
 * A reusable DOM Node for parsing html content.
 */
var parserNode = doc.createElement('div');

/**
 * Returns plain-text of a `Node`
 */
function textOfNode(node) {
  var text = node.textContent || node.innerText;
  return text ? sanitizeWhitespace(text) : '';
}

/**
 * Replaces a `Node` with it with its children
 */
function unwrapNode(node) {
  var children = toArray(node.childNodes),
      len = children.length,
      parent = node.parentNode, i;
  for (i = 0; i < len; i++) {
    parent.insertBefore(children[i], node);
  }
}

/**
 * Extracts attributes of a `Node` to a hash of key/value pairs
 */
function attributesForNode(node /*,blacklist*/) {
  var attrs = node.attributes,
      len = attrs && attrs.length,
      i, attr, name, hash;
  for (i = 0; i < len; i++) {
    attr = attrs[i];
    name = attr.name;
    if (attr.specified) {
      //if (blacklist && name in blacklist)) { continue; }
      hash = hash || {};
      hash[name] = attr.value;
    }
  }
  return hash;
}

/**
 * Merges set of properties on a object
 * Useful for constructor defaults/options
 */
function merge(object, defaults, updates) {
  updates = updates || {};
  for(var o in defaults) {
    if (defaults.hasOwnProperty(o)) {
      object[o] = updates[o] || defaults[o];
    }
  }
}

/**
 * Prototype inheritance helper
 */
function inherit(Sub, Super) {
  for (var key in Super) {
    if (Super.hasOwnProperty(key)) {
      Sub[key] = Super[key];
    }
  }
  Sub.prototype = new Super();
  Sub.constructor = Sub;
}

var RegExpTrim     = /^\s+|\s+$/g,
    RegExpTrimLeft = /^\s+/,
    RegExpWSChars  = /(\r\n|\n|\r|\t|\u00A0)/gm,
    RegExpMultiWS  = / +/g;

/**
 * String.prototype.trim polyfill
 * Removes whitespace at beginning and end of string
 */
function trim(string) {
  return string ? string.replace(RegExpTrim, '') : '';
}

/**
 * String.prototype.trimLeft polyfill
 * Removes whitespace at beginning of string
 */
function trimLeft(string) {
  return string ? string.replace(RegExpTrimLeft, '') : '';
}

/**
 * Cleans line breaks, tabs, non-breaking spaces, then multiple occuring whitespaces.
 */
function sanitizeWhitespace(string) {
  return string.replace(RegExpWSChars, '').replace(RegExpMultiWS, ' ');
}

/**
 * Injects a string into another string at the index specified
 */
function injectIntoString(string, injection, index) {
  return string.substr(0, index) + injection + string.substr(index);
}

/**
 * @class Compiler
 * @constructor
 * @param options
 */
function Compiler(options) {
  var defaults = {
    parser        : new HTMLParser(),
    renderer      : new HTMLRenderer(),
    blockTypes    : DefaultBlockTypes,
    markupTypes   : DefaultMarkupTypes
  };
  merge(this, defaults, options);
}

/**
 * @method parse
 * @param input
 * @return Object
 */
Compiler.prototype.parse = function(input) {
  return this.parser.parse(input);
};

/**
 * @method render
 * @param data
 * @return Object
 */
Compiler.prototype.render = function(data) {
  return this.renderer.render(data);
};

ContentKit.Compiler = Compiler;

/**
 * @class HTMLParser
 * @constructor
 */
function HTMLParser(options) {
  var defaults = {
    includeTypeNames : false
  };
  merge(this, defaults, options);
}

/**
 * @method parse
 * @param html String of HTML content
 * @return Array Parsed JSON content array
 */
HTMLParser.prototype.parse = function(html) {
  parserNode.innerHTML = sanitizeWhitespace(html);

  var children = toArray(parserNode.childNodes),
      len = children.length,
      blocks = [],
      i, currentNode, block, text;

  for (i = 0; i < len; i++) {
    currentNode = children[i];
    // All top level nodes *should be* `Element` nodes and supported block types.
    // We'll handle some cases if it isn't so we don't lose any content when parsing.
    // Parser assumes sane input (such as from the ContentKit Editor) and is not intended to be a full html sanitizer.
    if (currentNode.nodeType === 1) {
      block = parseBlock(currentNode, this.includeTypeNames);
      if (block) {
        blocks.push(block);
      } else {
        handleNonBlockElementAtRoot(currentNode, blocks);
      }
    } else if (currentNode.nodeType === 3) {
      text = textOfNode(currentNode);
      if (trim(text)) {
        block = getLastBlockOrCreate(blocks);
        block.value += text;
      }
    }
  }

  return blocks;
};

ContentKit.HTMLParser = HTMLParser;


/**
 * Parses a single block type node into json
 */
function parseBlock(node, includeTypeNames) {
  var meta = BlockType.findByNode(node), parsed, attributes;
  if (meta) {
    parsed = { type : meta.id };
    if (includeTypeNames && meta.name) {
      parsed.type_name = meta.name;
    }
    parsed.value = trim(textOfNode(node));
    attributes = attributesForNode(node);
    if (attributes) {
      parsed.attributes = attributes;
    }
    parsed.markup = parseBlockMarkup(node, includeTypeNames);
    return parsed;
  }
}

/**
 * Parses all of the markup in a block type node
 */
function parseBlockMarkup(node, includeTypeNames) {
  var processedText = '',
      markups = [],
      index = 0,
      currentNode, markup;

  while (node.hasChildNodes()) {
    currentNode = node.firstChild;
    if (currentNode.nodeType === 1) {
      markup = parseElementMarkup(currentNode, processedText.length, includeTypeNames);
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
}

/**
 * Parses markup of a single html element node
 */
function parseElementMarkup(node, startIndex, includeTypeNames) {
  var meta = MarkupType.findByNode(node),
      selfClosing, endIndex, markup, attributes;

  if (meta) {
    selfClosing = meta.selfClosing;
    if (!selfClosing && !node.hasChildNodes()) { return; } // check for empty nodes

    endIndex = startIndex + (selfClosing ? 0 : textOfNode(node).length);
    if (endIndex > startIndex || (selfClosing && endIndex === startIndex)) { // check for empty nodes
      markup = { type : meta.id };
      if (includeTypeNames && meta.name) {
        markup.type_name = meta.name;
      }
      markup.start = startIndex;
      markup.end = endIndex;
      attributes = attributesForNode(node);
      if (attributes) {
        markup.attributes = attributes;
      }
      return markup;
    }
  }
}

/**
 * Helper to retain stray elements at the root of the html that aren't blocks
 */
function handleNonBlockElementAtRoot(elementNode, blocks) {
  var block = getLastBlockOrCreate(blocks),
      markup = parseElementMarkup(elementNode, block.value.length);
  if (markup) {
    block.markup = block.markup || [];
    block.markup.push(markup);
  }
  block.value += textOfNode(elementNode);
}

/**
 * Gets the last block in the set or creates and return a default block if none exist yet.
 */
function getLastBlockOrCreate(blocks) {
  var block;
  if (blocks.length) {
    block = blocks[blocks.length - 1];
  } else {
    block = parseBlock(doc.createElement('p'));
    blocks.push(block);
  }
  return block;
}

/**
 * @class HTMLRenderer
 * @constructor
 */
function HTMLRenderer(options) {
  var defaults = {
    typeRenderers : {}
  };
  merge(this, defaults, options);
}

/**
 * @method render
 * @param data
 * @return String html
 */
HTMLRenderer.prototype.render = function(data) {
  var html = '',
      len = data && data.length,
      i, block, typeRenderer, blockHtml;

  for (i = 0; i < len; i++) {
    block = data[i];
    typeRenderer = this.typeRenderers[block.type] || renderBlock;
    blockHtml = typeRenderer(block);
    if (blockHtml) { html += blockHtml; }
  }
  return html;
};

/**
 * @method willRenderType
 * @param type type id
 * @param renderer the rendering function that returns a string of html
 * Registers custom rendering for a type
 */
HTMLRenderer.prototype.willRenderType = function(type, renderer) {
  this.typeRenderers[type] = renderer;
};

ContentKit.HTMLRenderer = HTMLRenderer;


/**
 * Builds an opening html tag. i.e. '<a href="http://link.com/" rel="author">'
 */
function createOpeningTag(tagName, attributes, selfClosing /*,blacklist*/) {
  var tag = '<' + tagName;
  for (var attr in attributes) {
    if (attributes.hasOwnProperty(attr)) {
      //if (blacklist && attr in blacklist) { continue; }
      tag += ' ' + attr + '="' + attributes[attr] + '"';
    }
  }
  if (selfClosing) { tag += '/'; }
  tag += '>';
  return tag;
}

/**
 * Builds a closing html tag. i.e. '</p>'
 */
function createCloseTag(tagName) {
  return '</' + tagName + '>';
}

/**
 * Renders a block's json into a HTML string.
 */
function renderBlock(block) {
  var blockMeta = BlockType.findById(block.type),
      html = '', tagName, selfClosing;

  if (blockMeta) {
    tagName = blockMeta.tag;
    selfClosing = blockMeta.selfClosing;
    html += createOpeningTag(tagName, block.attributes, selfClosing);
    if (!selfClosing) {
      html += renderMarkup(block.value, block.markup);
      html += createCloseTag(tagName);
    }
  }
  return html;
}

/**
 * Renders markup json into a HTML string.
 */
function renderMarkup(text, markups) {
  var parsedTagsIndexes = [],
      len = markups && markups.length, i;

  for (i = 0; i < len; i++) {
    var markup = markups[i],
        markupMeta = MarkupType.findById(markup.type),
        tagName = markupMeta.tag,
        selfClosing = markupMeta.selfClosing,
        start = markup.start,
        end = markup.end,
        openTag = createOpeningTag(tagName, markup.attributes, selfClosing),
        parsedTagLengthAtIndex = parsedTagsIndexes[start] || 0,
        parsedTagLengthBeforeIndex = sumArray(parsedTagsIndexes.slice(0, start + 1));

    text = injectIntoString(text, openTag, start + parsedTagLengthBeforeIndex);
    parsedTagsIndexes[start] = parsedTagLengthAtIndex + openTag.length;

    if (!selfClosing) {
      var closeTag = createCloseTag(tagName);
      parsedTagLengthAtIndex = parsedTagsIndexes[end] || 0;
      parsedTagLengthBeforeIndex = sumArray(parsedTagsIndexes.slice(0, end));
      text = injectIntoString(text, closeTag, end + parsedTagLengthBeforeIndex);
      parsedTagsIndexes[end]  = parsedTagLengthAtIndex + closeTag.length;
    }
  }

  return text;
}

}(this, document));
