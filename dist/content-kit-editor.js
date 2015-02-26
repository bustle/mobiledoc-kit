/**
 * @overview content-kit-editor: A modern, minimalist WYSIWYG editor.
 * @version  0.1.2
 * @author   Garth Poitras <garth22@gmail.com> (http://garthpoitras.com/)
 * @license  MIT
 * Last modified: Feb 26, 2015
 */

(function(window, document, undefined) {

    "use strict";
    var node_modules$content$kit$utils$src$string$utils$$RegExpTrim        = /^\s+|\s+$/g;
    var node_modules$content$kit$utils$src$string$utils$$RegExpTrimLeft    = /^\s+/;
    var node_modules$content$kit$utils$src$string$utils$$RegExpWSChars     = /(\r\n|\n|\r|\t)/gm;
    var node_modules$content$kit$utils$src$string$utils$$RegExpMultiWS     = /\s+/g;
    var node_modules$content$kit$utils$src$string$utils$$RegExpNonAlphaNum = /[^a-zA-Z\d]/g;

    /**
     * String.prototype.trim polyfill
     * Removes whitespace at beginning and end of string
     */
    function node_modules$content$kit$utils$src$string$utils$$trim(string) {
      return string ? (string + '').replace(node_modules$content$kit$utils$src$string$utils$$RegExpTrim, '') : '';
    }

    /**
     * String.prototype.trimLeft polyfill
     * Removes whitespace at beginning of string
     */
    function node_modules$content$kit$utils$src$string$utils$$trimLeft(string) {
      return string ? (string + '').replace(node_modules$content$kit$utils$src$string$utils$$RegExpTrimLeft, '') : '';
    }

    /**
     * Replaces non-alphanumeric chars with underscores
     */
    function node_modules$content$kit$utils$src$string$utils$$underscore(string) {
      return string ? node_modules$content$kit$utils$src$string$utils$$trim(string + '').replace(node_modules$content$kit$utils$src$string$utils$$RegExpNonAlphaNum, '_') : '';
    }

    /**
     * Cleans line breaks, tabs, then multiple occuring whitespaces.
     */
    function node_modules$content$kit$utils$src$string$utils$$sanitizeWhitespace(string) {
      return string ? (string + '').replace(node_modules$content$kit$utils$src$string$utils$$RegExpWSChars, '').replace(node_modules$content$kit$utils$src$string$utils$$RegExpMultiWS, ' ') : '';
    }

    /**
     * Injects a string into another string at the index specified
     */
    function node_modules$content$kit$utils$src$string$utils$$injectIntoString(string, injection, index) {
      return string.substr(0, index) + injection + string.substr(index);
    }

    /**
     * @class Type
     * @constructor
     * Contains meta info about a node type (id, name, tag, etc).
     */
    function node_modules$content$kit$compiler$src$types$type$$Type(options) {
      if (options) {
        this.name = node_modules$content$kit$utils$src$string$utils$$underscore(options.name || options.tag).toUpperCase();
        this.isTextType = options.isTextType !== undefined ? options.isTextType : true;

        if (options.id !== undefined) {
          this.id = options.id;
        }
        if (options.tag) {
          this.tag = options.tag.toLowerCase();
          this.selfClosing = /^(br|img|hr|meta|link|embed)$/i.test(this.tag);
          if (options.mappedTags) {
            this.mappedTags = options.mappedTags;
          }
        }

        // Register the type as constant
        node_modules$content$kit$compiler$src$types$type$$Type[this.name] = this;
      }
    }

    var node_modules$content$kit$compiler$src$types$type$$default = node_modules$content$kit$compiler$src$types$type$$Type;
    /**
     * @class Model
     * @constructor
     * @private
     */
    function $$model$$Model(options) {
      options = options || {};
      var type_name = options.type_name;
      var attributes = options.attributes;

      this.type = options.type || null;
      if (type_name) {
        this.type_name = type_name;
      }
      if (attributes) {
        this.attributes = attributes;
      }
    }

    /**
     * @method createWithType
     * @static
     * @param type Type
     * @param options Object
     */
    $$model$$Model.createWithType = function(type, options) {
      options = options || {};
      options.type = type.id;
      options.type_name = type.name;
      return new this(options);
    };

    var $$model$$default = $$model$$Model;
    /**
     * Merges defaults/options into an Object
     * Useful for constructors
     */
    function node_modules$content$kit$utils$src$object$utils$$mergeWithOptions(original, updates, options) {
      options = options || {};
      for(var prop in updates) {
        if (options.hasOwnProperty(prop)) {
          original[prop] = options[prop];
        } else if (updates.hasOwnProperty(prop)) {
          original[prop] = updates[prop];
        }
      }
      return original;
    }

    /**
     * Merges properties of one object into another
     */
    function node_modules$content$kit$utils$src$object$utils$$merge(original, updates) {
      return node_modules$content$kit$utils$src$object$utils$$mergeWithOptions(original, updates);
    }

    /**
     * Prototype inheritance helper
     */
    function node_modules$content$kit$utils$src$object$utils$$inherit(Subclass, Superclass) {
      for (var key in Superclass) {
        if (Superclass.hasOwnProperty(key)) {
          Subclass[key] = Superclass[key];
        }
      }
      Subclass.prototype = new Superclass();
      Subclass.constructor = Subclass;
      Subclass._super = Superclass;
    }

    /**
     * Ensures block markups at the same index are always in a specific order.
     * For example, so all bold links are consistently marked up 
     * as <a><b>text</b></a> instead of <b><a>text</a></b>
     */
    function node_modules$content$kit$compiler$src$models$block$$sortBlockMarkups(markups) {
      return markups.sort(function(a, b) {
        if (a.start === b.start && a.end === b.end) {
          return b.type - a.type;
        }
        return 0;
      });
    }

    /**
     * @class BlockModel
     * @constructor
     * @extends Model
     */
    function node_modules$content$kit$compiler$src$models$block$$BlockModel(options) {
      options = options || {};
      $$model$$default.call(this, options);
      this.value = options.value || '';
      this.markup = node_modules$content$kit$compiler$src$models$block$$sortBlockMarkups(options.markup || []);
    }

    node_modules$content$kit$utils$src$object$utils$$inherit(node_modules$content$kit$compiler$src$models$block$$BlockModel, $$model$$default);

    var node_modules$content$kit$compiler$src$models$block$$default = node_modules$content$kit$compiler$src$models$block$$BlockModel;

    /**
     * @class EmbedModel
     * @constructor
     * @extends Model
     * Massages data from an oEmbed response into an EmbedModel
     */
    function node_modules$content$kit$compiler$src$models$embed$$EmbedModel(options) {
      if (!options) { return null; }

      $$model$$default.call(this, {
        type: node_modules$content$kit$compiler$src$types$type$$default.EMBED.id,
        type_name: node_modules$content$kit$compiler$src$types$type$$default.EMBED.name,
        attributes: {}
      });

      // Massage the oEmbed data
      var attributes = this.attributes;
      var embedType = options.type;
      var providerName = options.provider_name;
      var embedUrl = options.url;
      var embedTitle = options.title;
      var embedThumbnail = options.thumbnail_url;
      var embedHtml = options.html;

      if (embedType)    { attributes.embed_type = embedType; }
      if (providerName) { attributes.provider_name = providerName; }
      if (embedUrl)     { attributes.url = embedUrl; }
      if (embedTitle)   { attributes.title = embedTitle; }

      if (embedType === 'photo') {
        attributes.thumbnail = options.media_url || embedUrl;
      } else if (embedThumbnail) {
        attributes.thumbnail = embedThumbnail;
      }

      if (embedHtml && (embedType === 'rich' || embedType === 'video')) {
        attributes.html = embedHtml;
      }
    }

    var node_modules$content$kit$compiler$src$models$embed$$default = node_modules$content$kit$compiler$src$models$embed$$EmbedModel;

    /**
     * @class MarkupModel
     * @constructor
     * @extends Model
     */
    function $$$models$markup$$MarkupModel(options) {
      options = options || {};
      $$model$$default.call(this, options);
      this.start = options.start || 0;
      this.end = options.end || 0;
    }

    node_modules$content$kit$utils$src$object$utils$$inherit($$$models$markup$$MarkupModel, $$model$$default);

    var $$$models$markup$$default = $$$models$markup$$MarkupModel;

    /**
     * @class TypeSet
     * @private
     * @constructor
     * A Set of Types
     */
    function $$type$set$$TypeSet(types) {
      var len = types && types.length, i;

      this._autoId    = 1;  // Auto-increment id counter
      this.idLookup   = {}; // Hash cache for finding by id
      this.tagLookup  = {}; // Hash cache for finding by tag

      for (i = 0; i < len; i++) {
        this.addType(types[i]);
      }
    }

    $$type$set$$TypeSet.prototype = {
      /**
       * Adds a type to the set
       */
      addType: function(type) {
        if (type instanceof node_modules$content$kit$compiler$src$types$type$$default) {
          this[type.name] = type;
          if (type.id === undefined) {
            type.id = this._autoId++;
          }
          this.idLookup[type.id] = type;
          if (type.tag) {
            this.tagLookup[type.tag] = type;
            if (type.mappedTags) {
              for (var i = 0, len = type.mappedTags.length; i < len; i++) {
                this.tagLookup[type.mappedTags[i]] = type;
              }
            }
          }
          return type;
        }
      },

      /**
       * Returns type info for a given Node
       */
      findByNode: function(node) {
        if (node) {
          return this.findByTag(node.tagName);
        }
      },
      /**
       * Returns type info for a given tag
       */
      findByTag: function(tag) {
        if (tag) {
          return this.tagLookup[tag.toLowerCase()];
        }
      },
      /**
       * Returns type info for a given id
       */
      findById: function(id) {
        return this.idLookup[id];
      }
    };

    var $$type$set$$default = $$type$set$$TypeSet;

    /**
     * Default supported block types
     */
    var $$types$default$types$$DefaultBlockTypeSet = new $$type$set$$default([
      new node_modules$content$kit$compiler$src$types$type$$default({ tag: 'p', name: 'paragraph' }),
      new node_modules$content$kit$compiler$src$types$type$$default({ tag: 'h2', name: 'heading' }),
      new node_modules$content$kit$compiler$src$types$type$$default({ tag: 'h3', name: 'subheading' }),
      new node_modules$content$kit$compiler$src$types$type$$default({ tag: 'img', name: 'image', isTextType: false }),
      new node_modules$content$kit$compiler$src$types$type$$default({ tag: 'blockquote', name: 'quote' }),
      new node_modules$content$kit$compiler$src$types$type$$default({ tag: 'ul', name: 'list' }),
      new node_modules$content$kit$compiler$src$types$type$$default({ tag: 'ol', name: 'ordered list' }),
      new node_modules$content$kit$compiler$src$types$type$$default({ name: 'embed', isTextType: false })
    ]);

    /**
     * Default supported markup types
     */
    var $$types$default$types$$DefaultMarkupTypeSet = new $$type$set$$default([
      new node_modules$content$kit$compiler$src$types$type$$default({ tag: 'strong', name: 'bold', mappedTags: ['b'] }),
      new node_modules$content$kit$compiler$src$types$type$$default({ tag: 'em', name: 'italic', mappedTags: ['i'] }),
      new node_modules$content$kit$compiler$src$types$type$$default({ tag: 'u', name: 'underline' }),
      new node_modules$content$kit$compiler$src$types$type$$default({ tag: 'a', name: 'link' }),
      new node_modules$content$kit$compiler$src$types$type$$default({ tag: 'br', name: 'break' }),
      new node_modules$content$kit$compiler$src$types$type$$default({ tag: 'li', name: 'list item' }),
      new node_modules$content$kit$compiler$src$types$type$$default({ tag: 'sub', name: 'subscript' }),
      new node_modules$content$kit$compiler$src$types$type$$default({ tag: 'sup', name: 'superscript' })
    ]);

    /**
     * Converts an array-like object (i.e. NodeList) to Array
     * Note: could just use Array.prototype.slice but does not work in IE <= 8
     */
    function node_modules$content$kit$utils$src$array$utils$$toArray(obj) {
      var array = [];
      var i = obj && obj.length >>> 0; // cast to Uint32
      while (i--) {
        array[i] = obj[i];
      }
      return array;
    }

    /**
     * Computes the sum of values in a (sparse) array
     */
    function node_modules$content$kit$utils$src$array$utils$$sumSparseArray(array) {
      var sum = 0, i;
      for (i in array) { // 'for in' is better for sparse arrays
        if (array.hasOwnProperty(i)) {
          sum += array[i];
        }
      }
      return sum;
    }

    /**
     * A document instance separate from the page's document. (if browser supports it)
     * Prevents images, scripts, and styles from executing while parsing nodes.
     */
    var node_modules$content$kit$utils$src$node$utils$$standaloneDocument = (function() {
      var implementation = document.implementation;
      var createHTMLDocument = implementation.createHTMLDocument;

      if (createHTMLDocument) {
        return createHTMLDocument.call(implementation, '');
      }
      return document;
    })();

    /**
     * document.createElement with our lean, standalone document
     */
    function node_modules$content$kit$utils$src$node$utils$$createElement(type) {
      return node_modules$content$kit$utils$src$node$utils$$standaloneDocument.createElement(type);
    }

    /**
     * A reusable DOM Node for parsing html content.
     */
    var node_modules$content$kit$utils$src$node$utils$$DOMParsingNode = node_modules$content$kit$utils$src$node$utils$$createElement('div');

    /**
     * Returns plain-text of a `Node`
     */
    function node_modules$content$kit$utils$src$node$utils$$textOfNode(node) {
      var text = node.textContent || node.innerText;
      return text ? node_modules$content$kit$utils$src$string$utils$$sanitizeWhitespace(text) : '';
    }

    /**
     * Replaces a `Node` with its children
     */
    function node_modules$content$kit$utils$src$node$utils$$unwrapNode(node) {
      if (node.hasChildNodes()) {
        var children = node_modules$content$kit$utils$src$array$utils$$toArray(node.childNodes);
        var len = children.length;
        var parent = node.parentNode, i;
        for (i = 0; i < len; i++) {
          parent.insertBefore(children[i], node);
        }
      }
    }

    /**
     * Extracts attributes of a `Node` to a hash of key/value pairs
     */
    function node_modules$content$kit$utils$src$node$utils$$attributesForNode(node, blacklist) {
      var attrs = node.attributes;
      var len = attrs && attrs.length;
      var i, attr, name, hash;
      
      for (i = 0; i < len; i++) {
        attr = attrs[i];
        name = attr.name;
        if (attr.specified && attr.value) {
          if (blacklist && (name in blacklist)) { continue; }
          hash = hash || {};
          hash[name] = attr.value;
        }
      }
      return hash;
    }

    var node_modules$content$kit$compiler$src$parsers$html$parser$$ELEMENT_NODE = window.Node && Node.ELEMENT_NODE || 1;
    var node_modules$content$kit$compiler$src$parsers$html$parser$$TEXT_NODE    = window.Node && Node.TEXT_NODE    || 3;
    var node_modules$content$kit$compiler$src$parsers$html$parser$$defaultAttributeBlacklist = { 'style' : 1, 'class' : 1 };

    /**
     * Returns the last block in the set or creates a default block if none exist yet.
     */
    function node_modules$content$kit$compiler$src$parsers$html$parser$$getLastBlockOrCreate(blocks) {
      var blockCount = blocks.length, block;
      if (blockCount) {
        block = blocks[blockCount - 1];
      } else {
        block = node_modules$content$kit$compiler$src$models$block$$default.createWithType(node_modules$content$kit$compiler$src$types$type$$default.PARAGRAPH);
        blocks.push(block);
      }
      return block;
    }

    /**
     * Helper to parse elements at the root that aren't blocks
     */
    function node_modules$content$kit$compiler$src$parsers$html$parser$$handleNonBlockAtRoot(parser, elementNode, blocks) {
      var block = node_modules$content$kit$compiler$src$parsers$html$parser$$getLastBlockOrCreate(blocks);
      var markup = parser.parseMarkupForElement(elementNode, block.value.length);
      if (markup) {
        block.markup = block.markup.concat(markup);
      }
      block.value += node_modules$content$kit$utils$src$node$utils$$textOfNode(elementNode);
    }

    /**
     * @class HTMLParser
     * @constructor
     */
    function node_modules$content$kit$compiler$src$parsers$html$parser$$HTMLParser(options) {
      var defaults = {
        blockTypes         : $$types$default$types$$DefaultBlockTypeSet,
        markupTypes        : $$types$default$types$$DefaultMarkupTypeSet,
        attributeBlacklist : node_modules$content$kit$compiler$src$parsers$html$parser$$defaultAttributeBlacklist,
        includeTypeNames   : false
      };
      node_modules$content$kit$utils$src$object$utils$$mergeWithOptions(this, defaults, options);
    }

    /**
     * @method parse
     * @param html String of HTML content
     * @return Array Parsed JSON content array
     */
    node_modules$content$kit$compiler$src$parsers$html$parser$$HTMLParser.prototype.parse = function(html) {
      node_modules$content$kit$utils$src$node$utils$$DOMParsingNode.innerHTML = node_modules$content$kit$utils$src$string$utils$$sanitizeWhitespace(html);

      var nodes = node_modules$content$kit$utils$src$array$utils$$toArray(node_modules$content$kit$utils$src$node$utils$$DOMParsingNode.childNodes);
      var nodeCount = nodes.length;
      var blocks = [];
      var i, node, nodeType, block, text;

      for (i = 0; i < nodeCount; i++) {
        node = nodes[i];
        nodeType = node.nodeType;

        if (nodeType === node_modules$content$kit$compiler$src$parsers$html$parser$$ELEMENT_NODE) {
          block = this.serializeBlockNode(node);
          if (block) {
            blocks.push(block);
          } else {
            node_modules$content$kit$compiler$src$parsers$html$parser$$handleNonBlockAtRoot(this, node, blocks);
          }
        } else if (nodeType === node_modules$content$kit$compiler$src$parsers$html$parser$$TEXT_NODE) {
          text = node.nodeValue;
          if (node_modules$content$kit$utils$src$string$utils$$trim(text)) {
            block = node_modules$content$kit$compiler$src$parsers$html$parser$$getLastBlockOrCreate(blocks);
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
    node_modules$content$kit$compiler$src$parsers$html$parser$$HTMLParser.prototype.parseMarkupForElement = function(node, startOffset) {
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

        if (nodeType === node_modules$content$kit$compiler$src$parsers$html$parser$$ELEMENT_NODE) {
          markup = this.serializeMarkupNode(currentNode, startOffset);
          if (markup) { markups.push(markup); }
          node_modules$content$kit$utils$src$node$utils$$unwrapNode(currentNode);
        } else if (nodeType === node_modules$content$kit$compiler$src$parsers$html$parser$$TEXT_NODE) {
          var text = node_modules$content$kit$utils$src$string$utils$$sanitizeWhitespace(currentNode.nodeValue);
          if (index === 0) { text = node_modules$content$kit$utils$src$string$utils$$trimLeft(text); }
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
    node_modules$content$kit$compiler$src$parsers$html$parser$$HTMLParser.prototype.serializeBlockNode = function(node) {
      var type = this.blockTypes.findByNode(node);
      if (type) {
        return new node_modules$content$kit$compiler$src$models$block$$default({
          type       : type.id,
          type_name  : this.includeTypeNames && type.name,
          value      : node_modules$content$kit$utils$src$string$utils$$trim(node_modules$content$kit$utils$src$node$utils$$textOfNode(node)),
          attributes : node_modules$content$kit$utils$src$node$utils$$attributesForNode(node, this.attributeBlacklist),
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
    node_modules$content$kit$compiler$src$parsers$html$parser$$HTMLParser.prototype.serializeMarkupNode = function(node, startIndex) {
      var type = this.markupTypes.findByNode(node);
      var selfClosing, endIndex;

      if (type) {
        selfClosing = type.selfClosing;
        if (!selfClosing && !node.hasChildNodes()) { return; } // check for empty nodes

        endIndex = startIndex + (selfClosing ? 0 : node_modules$content$kit$utils$src$node$utils$$textOfNode(node).length);
        if (endIndex > startIndex || (selfClosing && endIndex === startIndex)) { // check for empty nodes
          return new $$$models$markup$$default({
            type       : type.id,
            type_name  : this.includeTypeNames && type.name,
            start      : startIndex,
            end        : endIndex,
            attributes : node_modules$content$kit$utils$src$node$utils$$attributesForNode(node, this.attributeBlacklist)
          });
        }
      }
    };

    var node_modules$content$kit$compiler$src$parsers$html$parser$$default = node_modules$content$kit$compiler$src$parsers$html$parser$$HTMLParser;

    /**
     * Builds an opening html tag. i.e. '<a href="http://link.com/" rel="author">'
     */
    function $$html$element$renderer$$createOpeningTag(tagName, attributes, selfClosing) {
      var tag = '<' + tagName;
      for (var attr in attributes) {
        if (attributes.hasOwnProperty(attr)) {
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
    function $$html$element$renderer$$createCloseTag(tagName) {
      return '</' + tagName + '>';
    }

    /**
     * @class HTMLElementRenderer
     * @constructor
     */
    function $$html$element$renderer$$HTMLElementRenderer(options) {
      options = options || {};
      this.type = options.type;
      this.markupTypes = options.markupTypes;
    }

    /**
     * @method render
     * @param model a block model
     * @return String html
     * Renders a block model into a HTML string.
     */
    $$html$element$renderer$$HTMLElementRenderer.prototype.render = function(model) {
      var html = '';
      var type = this.type;
      var tagName = type.tag;
      var selfClosing = type.selfClosing;

      if (tagName) {
        html += $$html$element$renderer$$createOpeningTag(tagName, model.attributes, selfClosing);
      }
      if (!selfClosing) {
        html += this.renderMarkup(model.value, model.markup);
        if (tagName) {
          html += $$html$element$renderer$$createCloseTag(tagName);
        }
      }
      return html;
    };

    /**
     * @method renderMarkup
     * @param text plain text to apply markup to
     * @param markup an array of markup models
     * @return String html
     * Renders a markup model into a HTML string.
     */
    $$html$element$renderer$$HTMLElementRenderer.prototype.renderMarkup = function(text, markups) {
      var parsedTagsIndexes = [];
      var len = markups && markups.length, i;

      for (i = 0; i < len; i++) {
        var markup = markups[i],
            markupMeta = this.markupTypes.findById(markup.type),
            tagName = markupMeta.tag,
            selfClosing = markupMeta.selfClosing,
            start = markup.start,
            end = markup.end,
            openTag = $$html$element$renderer$$createOpeningTag(tagName, markup.attributes, selfClosing),
            parsedTagLengthAtIndex = parsedTagsIndexes[start] || 0,
            parsedTagLengthBeforeIndex = node_modules$content$kit$utils$src$array$utils$$sumSparseArray(parsedTagsIndexes.slice(0, start + 1));

        text = node_modules$content$kit$utils$src$string$utils$$injectIntoString(text, openTag, start + parsedTagLengthBeforeIndex);
        parsedTagsIndexes[start] = parsedTagLengthAtIndex + openTag.length;

        if (!selfClosing) {
          var closeTag = $$html$element$renderer$$createCloseTag(tagName);
          parsedTagLengthAtIndex = parsedTagsIndexes[end] || 0;
          parsedTagLengthBeforeIndex = node_modules$content$kit$utils$src$array$utils$$sumSparseArray(parsedTagsIndexes.slice(0, end));
          text = node_modules$content$kit$utils$src$string$utils$$injectIntoString(text, closeTag, end + parsedTagLengthBeforeIndex);
          parsedTagsIndexes[end]  = parsedTagLengthAtIndex + closeTag.length;
        }
      }

      return text;
    };

    var $$html$element$renderer$$default = $$html$element$renderer$$HTMLElementRenderer;
    /**
     * @class HTMLEmbedRenderer
     * @constructor
     */
    function $$html$embed$renderer$$HTMLEmbedRenderer() {}

    /**
     * @method render
     * @param model a block model
     * @return String html
     */
    $$html$embed$renderer$$HTMLEmbedRenderer.prototype.render = function(model) {
      var attrs = model.attributes;
      return attrs && attrs.html || '';
    };

    var $$html$embed$renderer$$default = $$html$embed$renderer$$HTMLEmbedRenderer;

    /**
     * @class HTMLRenderer
     * @constructor
     */
    function node_modules$content$kit$compiler$src$renderers$html$renderer$$HTMLRenderer(options) {
      var defaults = {
        blockTypes    : $$types$default$types$$DefaultBlockTypeSet,
        markupTypes   : $$types$default$types$$DefaultMarkupTypeSet,
        typeRenderers : {}
      };
      node_modules$content$kit$utils$src$object$utils$$mergeWithOptions(this, defaults, options);
    }

    /**
     * @method rendererFor
     * @param block
     * @returns renderer
     * Returns an instance of a renderer for supplied block model
     */
    node_modules$content$kit$compiler$src$renderers$html$renderer$$HTMLRenderer.prototype.rendererFor = function(block) {
      var type = this.blockTypes.findById(block.type);
      if (type === node_modules$content$kit$compiler$src$types$type$$default.EMBED) {
        return new $$html$embed$renderer$$default();
      }
      return new $$html$element$renderer$$default({ type: type, markupTypes: this.markupTypes });
    };

    /**
     * @method render
     * @param model
     * @return String html
     */
    node_modules$content$kit$compiler$src$renderers$html$renderer$$HTMLRenderer.prototype.render = function(model) {
      var html = '';
      var len = model && model.length;
      var i, block, renderer, renderHook, blockHtml;

      for (i = 0; i < len; i++) {
        block = model[i];
        renderer = this.rendererFor(block);
        renderHook = this.typeRenderers[block.type];
        blockHtml = renderHook ? renderHook.call(renderer, block) : renderer.render(block);
        if (blockHtml) { 
          html += blockHtml;
        }
      }
      return html;
    };

    var node_modules$content$kit$compiler$src$renderers$html$renderer$$default = node_modules$content$kit$compiler$src$renderers$html$renderer$$HTMLRenderer;

    /**
     * @class Compiler
     * @constructor
     * @param options
     */
    function node_modules$content$kit$compiler$src$compiler$$Compiler(options) {
      var parser = new node_modules$content$kit$compiler$src$parsers$html$parser$$default();
      var renderer = new node_modules$content$kit$compiler$src$renderers$html$renderer$$default();
      var defaults = {
        parser           : parser,
        renderer         : renderer,
        blockTypes       : $$types$default$types$$DefaultBlockTypeSet,
        markupTypes      : $$types$default$types$$DefaultMarkupTypeSet,
        includeTypeNames : false // Outputs `type_name:'HEADING'` etc. when parsing. Good for debugging.
      };
      node_modules$content$kit$utils$src$object$utils$$mergeWithOptions(this, defaults, options);

      // Reference the compiler settings
      this.parser.blockTypes  = this.renderer.blockTypes  = this.blockTypes;
      this.parser.markupTypes = this.renderer.markupTypes = this.markupTypes;
      this.parser.includeTypeNames = this.includeTypeNames;
    }

    /**
     * @method parse
     * @param input
     * @return Array
     */
    node_modules$content$kit$compiler$src$compiler$$Compiler.prototype.parse = function(input) {
      return this.parser.parse(input);
    };

    /**
     * @method render
     * @param model
     * @return String
     */
    node_modules$content$kit$compiler$src$compiler$$Compiler.prototype.render = function(model) {
      return this.renderer.render(model);
    };

    /**
     * @method rerender
     * @param input
     * @return String
     */
    node_modules$content$kit$compiler$src$compiler$$Compiler.prototype.rerender = function(input) {
      return this.render(this.parse(input));
    };

    /**
     * @method reparse
     * @param model
     * @return String
     */
    node_modules$content$kit$compiler$src$compiler$$Compiler.prototype.reparse = function(model) {
      return this.parse(this.render(model));
    };

    /**
     * @method registerBlockType
     * @param {Type} type
     */
    node_modules$content$kit$compiler$src$compiler$$Compiler.prototype.registerBlockType = function(type) {
      return this.blockTypes.addType(type);
    };

    /**
     * @method registerMarkupType
     * @param {Type} type
     */
    node_modules$content$kit$compiler$src$compiler$$Compiler.prototype.registerMarkupType = function(type) {
      return this.markupTypes.addType(type);
    };

    var node_modules$content$kit$compiler$src$compiler$$default = node_modules$content$kit$compiler$src$compiler$$Compiler;
    var $$youtube$$RegExVideoId = /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;

    function $$youtube$$getVideoIdFromUrl(url) {
      var match = url && url.match($$youtube$$RegExVideoId);
      if (match && match[1].length === 11){
        return match[1];
      }
      return null;
    }

    function $$youtube$$YouTubeRenderer() {}
    $$youtube$$YouTubeRenderer.prototype.render = function(model) {
      var videoId = $$youtube$$getVideoIdFromUrl(model.attributes.url);
      var embedUrl = 'http://www.youtube.com/embed/' + videoId + '?controls=2&showinfo=0&color=white&theme=light';
      return '<iframe width="100%" height="400" frameborder="0" allowfullscreen src="' + embedUrl + '"></iframe>';
    };

    var $$youtube$$default = $$youtube$$YouTubeRenderer;
    function $$twitter$$TwitterRenderer() {}
    $$twitter$$TwitterRenderer.prototype.render = function(model) {
      return '<blockquote class="twitter-tweet"><a href="' + model.attributes.url + '"></a></blockquote>';
    };

    var $$twitter$$default = $$twitter$$TwitterRenderer;
    function $$instagram$$InstagramRenderer() {}
    $$instagram$$InstagramRenderer.prototype.render = function(model) {
      return '<img src="' + model.attributes.url + '"/>';
    };

    var $$instagram$$default = $$instagram$$InstagramRenderer;
    function $$link$image$renderer$$LinkImageRenderer() {}
    $$link$image$renderer$$LinkImageRenderer.prototype.render = function(model) {
      return '<a href="' + model.attributes.url + '" target="_blank"><img src="' + model.attributes.thumbnail + '"/></a>';
    };

    var $$link$image$renderer$$default = $$link$image$renderer$$LinkImageRenderer;

    /**
     * A dictionary of supported embeds types that we'll custom render
     * for the editor, instead of the default oembed html.
     */
    var $$$renderers$editor$html$renderer$$embedRenderers = {
      YOUTUBE    : new $$youtube$$default(),
      TWITTER    : new $$twitter$$default(),
      INSTAGRAM  : new $$instagram$$default(),
      LINK_IMAGE : new $$link$image$renderer$$default()
    };

    function $$$renderers$editor$html$renderer$$embedRenderer(model) {
      var embedAttrs = model.attributes;
      var embedType = embedAttrs.embed_type;
      var isVideo = embedType === 'video';
      var providerName = embedAttrs.provider_name;
      var customRendererId = providerName && providerName.toUpperCase();
      var customRenderer = $$$renderers$editor$html$renderer$$embedRenderers[customRendererId];
      if (!customRenderer && embedType === 'link' && embedAttrs.thumbnail) {
        customRenderer = $$$renderers$editor$html$renderer$$embedRenderers.LINK_IMAGE;
      }
      var renderer = customRenderer ? customRenderer : this;

      return '<div class="ck-embed" data-embed=1 contenteditable="false">' +
                '<figure>' +
                  (isVideo ? '<div class="ck-video-container">' : '') + renderer.render(model) + (isVideo ? '</div>' : '') +
                  '<figcaption>' +
                    '<a target="_blank" href="' + embedAttrs.url + '">' + embedAttrs.title + '</a>' +
                  '</figcaption>' +
                '</figure>' +
              '</div>';
    }

    function $$$renderers$editor$html$renderer$$imageRenderer(model) {
      return '<div class="ck-embed ck-image-embed" data-embed=1 contenteditable="false">' +
                '<figure>' + this.render(model) + '</figure>' +
              '</div>';
    }

    var $$$renderers$editor$html$renderer$$typeRenderers = {};
    $$$renderers$editor$html$renderer$$typeRenderers[node_modules$content$kit$compiler$src$types$type$$default.EMBED.id] = $$$renderers$editor$html$renderer$$embedRenderer;
    $$$renderers$editor$html$renderer$$typeRenderers[node_modules$content$kit$compiler$src$types$type$$default.IMAGE.id] = $$$renderers$editor$html$renderer$$imageRenderer;

    /**
     * @class EditorHTMLRenderer
     * @constructor
     * Subclass of HTMLRenderer specifically for the Editor
     * Wraps interactive elements to add functionality
     */
    function $$$renderers$editor$html$renderer$$EditorHTMLRenderer() {
      node_modules$content$kit$compiler$src$renderers$html$renderer$$default.call(this, {
        typeRenderers: $$$renderers$editor$html$renderer$$typeRenderers
      });
    }
    node_modules$content$kit$utils$src$object$utils$$inherit($$$renderers$editor$html$renderer$$EditorHTMLRenderer, node_modules$content$kit$compiler$src$renderers$html$renderer$$default);

    var $$$renderers$editor$html$renderer$$default = $$$renderers$editor$html$renderer$$EditorHTMLRenderer;
    function $$view$$renderClasses(view) {
      var classNames = view.classNames;
      if (classNames && classNames.length) {
        view.element.className = classNames.join(' ');
      } else if(view.element.className) {
        view.element.removeAttribute('className');
      }
    }

    function $$view$$View(options) {
      options = options || {};
      this.tagName = options.tagName || 'div';
      this.classNames = options.classNames || [];
      this.element = document.createElement(this.tagName);
      this.container = options.container || document.body;
      this.isShowing = false;
      $$view$$renderClasses(this);
    }

    $$view$$View.prototype = {
      show: function() {
        var view = this;
        if(!view.isShowing) {
          view.container.appendChild(view.element);
          view.isShowing = true;
          return true;
        }
      },
      hide: function() {
        var view = this;
        if(view.isShowing) {
          view.container.removeChild(view.element);
          view.isShowing = false;
          return true;
        }
      },
      addClass: function(className) {
        var index = this.classNames && this.classNames.indexOf(className);
        if (index === -1) {
          this.classNames.push(className);
          $$view$$renderClasses(this);
        }
      },
      removeClass: function(className) {
        var index = this.classNames && this.classNames.indexOf(className);
        if (index > -1) {
          this.classNames.splice(index, 1);
          $$view$$renderClasses(this);
        }
      },
      setClasses: function(classNameArr) {
        this.classNames = classNameArr;
        $$view$$renderClasses(this);
      }
    };

    var $$view$$default = $$view$$View;
    var $$toolbar$button$$buttonClassName = 'ck-toolbar-btn';

    function $$toolbar$button$$ToolbarButton(options) {
      var button = this;
      var toolbar = options.toolbar;
      var command = options.command;
      var prompt = command.prompt;
      var element = document.createElement('button');

      button.element = element;
      button.command = command;
      button.isActive = false;

      element.title = command.name;
      element.className = $$toolbar$button$$buttonClassName;
      element.innerHTML = command.button;
      element.addEventListener('mouseup', function(e) {
        if (!button.isActive && prompt) {
          toolbar.displayPrompt(prompt);
        } else {
          command.exec();
          toolbar.updateForSelection();
        }
        e.stopPropagation();
      });
    }

    $$toolbar$button$$ToolbarButton.prototype = {
      setActive: function() {
        var button = this;
        if (!button.isActive) {
          button.element.className = $$toolbar$button$$buttonClassName + ' active';
          button.isActive = true;
        }
      },
      setInactive: function() {
        var button = this;
        if (button.isActive) {
          button.element.className = $$toolbar$button$$buttonClassName;
          button.isActive = false;
        }
      }
    };

    var $$toolbar$button$$default = $$toolbar$button$$ToolbarButton;
    function $$$utils$element$utils$$createDiv(className) {
      var div = document.createElement('div');
      if (className) {
        div.className = className;
      }
      return div;
    }

    function $$$utils$element$utils$$hideElement(element) {
      element.style.display = 'none';
    }

    function $$$utils$element$utils$$showElement(element) {
      element.style.display = 'block';
    }

    function $$$utils$element$utils$$swapElements(elementToShow, elementToHide) {
      $$$utils$element$utils$$hideElement(elementToHide);
      $$$utils$element$utils$$showElement(elementToShow);
    }

    function $$$utils$element$utils$$getEventTargetMatchingTag(tag, target, container) {
      // Traverses up DOM from an event target to find the node matching specifed tag
      while (target && target !== container) {
        if (target.tagName.toLowerCase() === tag) {
          return target;
        }
        target = target.parentNode;
      }
    }

    function $$$utils$element$utils$$nodeIsDescendantOfElement(node, element) {
      var parentNode = node.parentNode;
      while(parentNode) {
        if (parentNode === element) {
          return true;
        }
        parentNode = parentNode.parentNode;
      }
      return false;
    }

    function $$$utils$element$utils$$elementContentIsEmpty(element) {
      var content = element && element.innerHTML;
      if (content) {
        return content === '' || content === '<br>';
      }
      return false;
    }

    function $$$utils$element$utils$$getElementRelativeOffset(element) {
      var offset = { left: 0, top: -window.pageYOffset };
      var offsetParent = element.offsetParent;
      var offsetParentPosition = window.getComputedStyle(offsetParent).position;
      var offsetParentRect;

      if (offsetParentPosition === 'relative') {
        offsetParentRect = offsetParent.getBoundingClientRect();
        offset.left = offsetParentRect.left;
        offset.top  = offsetParentRect.top;
      }
      return offset;
    }

    function $$$utils$element$utils$$getElementComputedStyleNumericProp(element, prop) {
      return parseFloat(window.getComputedStyle(element)[prop]);
    }

    function $$$utils$element$utils$$positionElementToRect(element, rect, topOffset, leftOffset) {
      var relativeOffset = $$$utils$element$utils$$getElementRelativeOffset(element);
      var style = element.style;
      var round = Math.round;
      var left, top;

      topOffset = topOffset || 0;
      leftOffset = leftOffset || 0;
      left = round(rect.left - relativeOffset.left - leftOffset);
      top  = round(rect.top  - relativeOffset.top  - topOffset);
      style.left = left + 'px';
      style.top  = top + 'px';
      return { left: left, top: top };
    }

    function $$$utils$element$utils$$positionElementHorizontallyCenteredToRect(element, rect, topOffset) {
      var horizontalCenter = (element.offsetWidth / 2) - (rect.width / 2);
      return $$$utils$element$utils$$positionElementToRect(element, rect, topOffset, horizontalCenter);
    }

    function $$$utils$element$utils$$positionElementCenteredAbove(element, aboveElement) {
      var elementMargin = $$$utils$element$utils$$getElementComputedStyleNumericProp(element, 'marginBottom');
      return $$$utils$element$utils$$positionElementHorizontallyCenteredToRect(element, aboveElement.getBoundingClientRect(), element.offsetHeight + elementMargin);
    }

    function $$$utils$element$utils$$positionElementCenteredBelow(element, belowElement) {
      var elementMargin = $$$utils$element$utils$$getElementComputedStyleNumericProp(element, 'marginTop');
      return $$$utils$element$utils$$positionElementHorizontallyCenteredToRect(element, belowElement.getBoundingClientRect(), -element.offsetHeight - elementMargin);
    }

    function $$$utils$element$utils$$positionElementCenteredIn(element, inElement) {
      var verticalCenter = (inElement.offsetHeight / 2) - (element.offsetHeight / 2);
      return $$$utils$element$utils$$positionElementHorizontallyCenteredToRect(element, inElement.getBoundingClientRect(), -verticalCenter);
    }

    function $$$utils$element$utils$$positionElementToLeftOf(element, leftOfElement) {
      var verticalCenter = (leftOfElement.offsetHeight / 2) - (element.offsetHeight / 2);
      var elementMargin = $$$utils$element$utils$$getElementComputedStyleNumericProp(element, 'marginRight');
      return $$$utils$element$utils$$positionElementToRect(element, leftOfElement.getBoundingClientRect(), -verticalCenter, element.offsetWidth + elementMargin);
    }

    function $$$utils$element$utils$$positionElementToRightOf(element, rightOfElement) {
      var verticalCenter = (rightOfElement.offsetHeight / 2) - (element.offsetHeight / 2);
      var elementMargin = $$$utils$element$utils$$getElementComputedStyleNumericProp(element, 'marginLeft');
      var rightOfElementRect = rightOfElement.getBoundingClientRect();
      return $$$utils$element$utils$$positionElementToRect(element, rightOfElementRect, -verticalCenter, -rightOfElement.offsetWidth - elementMargin);
    }

    // TODO: remove, pass in Editor's current block set
    var $$$utils$selection$utils$$RootTags = [
      node_modules$content$kit$compiler$src$types$type$$default.PARAGRAPH.tag,
      node_modules$content$kit$compiler$src$types$type$$default.HEADING.tag,
      node_modules$content$kit$compiler$src$types$type$$default.SUBHEADING.tag,
      node_modules$content$kit$compiler$src$types$type$$default.QUOTE.tag,
      node_modules$content$kit$compiler$src$types$type$$default.LIST.tag,
      node_modules$content$kit$compiler$src$types$type$$default.ORDERED_LIST.tag
    ];

    var $$$utils$selection$utils$$SelectionDirection = {
      LEFT_TO_RIGHT : 1,
      RIGHT_TO_LEFT : 2,
      SAME_NODE     : 3
    };

    function $$$utils$selection$utils$$getDirectionOfSelection(selection) {
      var node = selection.anchorNode;
      var position = node && node.compareDocumentPosition(selection.focusNode);
      if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
        return $$$utils$selection$utils$$SelectionDirection.LEFT_TO_RIGHT;
      } else if (position & Node.DOCUMENT_POSITION_PRECEDING) {
        return $$$utils$selection$utils$$SelectionDirection.RIGHT_TO_LEFT;
      }
      return $$$utils$selection$utils$$SelectionDirection.SAME_NODE;
    }

    function $$$utils$selection$utils$$getSelectionElement(selection) {
      selection = selection || window.getSelection();
      var node = $$$utils$selection$utils$$getDirectionOfSelection(selection) === $$$utils$selection$utils$$SelectionDirection.LEFT_TO_RIGHT ? selection.anchorNode : selection.focusNode;
      return node && (node.nodeType === 3 ? node.parentNode : node);
    }

    function $$$utils$selection$utils$$getSelectionBlockElement(selection) {
      selection = selection || window.getSelection();
      var element = $$$utils$selection$utils$$getSelectionElement();
      var tag = element && element.tagName.toLowerCase();
      while (tag && $$$utils$selection$utils$$RootTags.indexOf(tag) === -1) {
        if (element.contentEditable === 'true') {
          return null; // Stop traversing up dom when hitting an editor element
        }
        element = element.parentNode;
        tag = element.tagName && element.tagName.toLowerCase();
      }
      return element;
    }

    function $$$utils$selection$utils$$getSelectionTagName() {
      var element = $$$utils$selection$utils$$getSelectionElement();
      return element ? element.tagName.toLowerCase() : null;
    }

    function $$$utils$selection$utils$$getSelectionBlockTagName() {
      var element = $$$utils$selection$utils$$getSelectionBlockElement();
      return element ? element.tagName && element.tagName.toLowerCase() : null;
    }

    function $$$utils$selection$utils$$tagsInSelection(selection) {
      var element = $$$utils$selection$utils$$getSelectionElement(selection);
      var tags = [];
      while(element) {
        if (element.contentEditable === 'true') { break; } // Stop traversing up dom when hitting an editor element
        if (element.tagName) {
          tags.push(element.tagName.toLowerCase());
        }
        element = element.parentNode;
      }
      return tags;
    }

    function $$$utils$selection$utils$$selectionIsInElement(selection, element) {
      var node = selection.anchorNode;
      return node && $$$utils$element$utils$$nodeIsDescendantOfElement(node, element);
    }

    function $$$utils$selection$utils$$selectionIsEditable(selection) {
      var el = $$$utils$selection$utils$$getSelectionBlockElement(selection);
      return el && el.isContentEditable;
    }

    function $$$utils$selection$utils$$restoreRange(range) {
      var selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }

    function $$$utils$selection$utils$$selectNode(node) {
      var range = document.createRange();
      var selection = window.getSelection();
      range.setStart(node, 0);
      range.setEnd(node, node.length);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    function $$$utils$selection$utils$$setCursorIndexInElement(element, index) {
      var range = document.createRange();
      var selection = window.getSelection();
      range.setStart(element, index);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    function $$$utils$selection$utils$$setCursorToStartOfElement(element) {
      $$$utils$selection$utils$$setCursorIndexInElement(element, 0);
    }

    function $$$utils$selection$utils$$getCursorOffsetInElement(element) {
      // http://stackoverflow.com/questions/4811822/get-a-ranges-start-and-end-offsets-relative-to-its-parent-container/4812022#4812022
      var caretOffset = 0;
      var selection = window.getSelection();
      if (selection.rangeCount > 0) {
        var range = selection.getRangeAt(0);
        var preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(element);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        caretOffset = preCaretRange.toString().length;
      }
      return caretOffset;
    }

    var $$toolbar$$ToolbarDirection = {
      TOP   : 1,
      RIGHT : 2
    };

    function $$toolbar$$selectionContainsButtonsTag(selectedTags, buttonsTags) {
      return selectedTags.filter(function(tag) {
        return buttonsTags.indexOf(tag) > -1;
      }).length;
    }

    function $$toolbar$$updateButtonsForSelection(buttons, selection) {
      var selectedTags = $$$utils$selection$utils$$tagsInSelection(selection);
      var len = buttons.length;
      var i, button;

      for (i = 0; i < len; i++) {
        button = buttons[i];
        if ($$toolbar$$selectionContainsButtonsTag(selectedTags, button.command.mappedTags)) {
          button.setActive();
        } else {
          button.setInactive();
        }
      }
    }

    function $$toolbar$$Toolbar(options) {
      options = options || {};
      var toolbar = this;
      var commands = options.commands;
      var commandCount = commands && commands.length, i;
      options.classNames = ['ck-toolbar'];
      $$view$$default.call(toolbar, options);

      toolbar.setSticky(options.sticky || false);
      toolbar.setDirection(options.direction || $$toolbar$$ToolbarDirection.TOP);
      toolbar.editor = options.editor || null;
      toolbar.embedIntent = options.embedIntent || null;
      toolbar.activePrompt = null;
      toolbar.buttons = [];

      toolbar.contentElement = $$$utils$element$utils$$createDiv('ck-toolbar-content');
      toolbar.promptContainerElement = $$$utils$element$utils$$createDiv('ck-toolbar-prompt');
      toolbar.buttonContainerElement = $$$utils$element$utils$$createDiv('ck-toolbar-buttons');
      toolbar.contentElement.appendChild(toolbar.promptContainerElement);
      toolbar.contentElement.appendChild(toolbar.buttonContainerElement);
      toolbar.element.appendChild(toolbar.contentElement);

      for(i = 0; i < commandCount; i++) {
        this.addCommand(commands[i]);
      }

      // Closes prompt if displayed when changing selection
      document.addEventListener('mouseup', function() {
        toolbar.dismissPrompt();
      });
    }
    node_modules$content$kit$utils$src$object$utils$$inherit($$toolbar$$Toolbar, $$view$$default);

    $$toolbar$$Toolbar.prototype.hide = function() {
      if ($$toolbar$$Toolbar._super.prototype.hide.call(this)) {
        var style = this.element.style;
        style.left = '';
        style.top = '';
        this.dismissPrompt();
      }
    };

    $$toolbar$$Toolbar.prototype.addCommand = function(command) {
      command.editorContext = this.editor;
      command.embedIntent = this.embedIntent;
      var button = new $$toolbar$button$$default({ command: command, toolbar: this });
      this.buttons.push(button);
      this.buttonContainerElement.appendChild(button.element);
    };

    $$toolbar$$Toolbar.prototype.displayPrompt = function(prompt) {
      var toolbar = this;
      $$$utils$element$utils$$swapElements(toolbar.promptContainerElement, toolbar.buttonContainerElement);
      toolbar.promptContainerElement.appendChild(prompt.element);
      prompt.show(function() {
        toolbar.dismissPrompt();
        toolbar.updateForSelection();
      });
      toolbar.activePrompt = prompt;
    };

    $$toolbar$$Toolbar.prototype.dismissPrompt = function() {
      var toolbar = this;
      var activePrompt = toolbar.activePrompt;
      if (activePrompt) {
        activePrompt.hide();
        $$$utils$element$utils$$swapElements(toolbar.buttonContainerElement, toolbar.promptContainerElement);
        toolbar.activePrompt = null;
      }
    };

    $$toolbar$$Toolbar.prototype.updateForSelection = function(selection) {
      var toolbar = this;
      selection = selection || window.getSelection();
      if (toolbar.sticky) {
        $$toolbar$$updateButtonsForSelection(toolbar.buttons, selection);
      } else if (!selection.isCollapsed) {
        toolbar.positionToContent(selection.getRangeAt(0));
        $$toolbar$$updateButtonsForSelection(toolbar.buttons, selection);
      }
    };

    $$toolbar$$Toolbar.prototype.positionToContent = function(content) {
      var directions = $$toolbar$$ToolbarDirection;
      var positioningMethod, position, sideEdgeOffset;
      switch(this.direction) {
        case directions.RIGHT:
          positioningMethod = $$$utils$element$utils$$positionElementToRightOf;
          break;
        default:
          positioningMethod = $$$utils$element$utils$$positionElementCenteredAbove;
      }
      position = positioningMethod(this.element, content);
      sideEdgeOffset = Math.min(Math.max(10, position.left), document.body.clientWidth - this.element.offsetWidth - 10);
      this.contentElement.style.transform = 'translateX(' + (sideEdgeOffset - position.left) + 'px)';
    };

    $$toolbar$$Toolbar.prototype.setDirection = function(direction) {
      this.direction = direction;
      if (direction === $$toolbar$$ToolbarDirection.RIGHT) {
        this.addClass('right');
      } else {
        this.removeClass('right');
      }
    };

    $$toolbar$$Toolbar.prototype.setSticky = function(sticky) {
      this.sticky = sticky;
      if (sticky) {
        this.addClass('sticky');
        this.element.removeAttribute('style'); // clears any prior positioning
        this.show();
      } else {
        this.removeClass('sticky');
        this.hide();
      }
    };

    $$toolbar$$Toolbar.prototype.toggleSticky = function() {
      this.setSticky(!this.sticky);
    };

    $$toolbar$$Toolbar.Direction = $$toolbar$$ToolbarDirection;

    var $$toolbar$$default = $$toolbar$$Toolbar;

    var $$$utils$keycodes$$default = {
      BKSP  : 8,
      ENTER : 13,
      ESC   : 27,
      DEL   : 46,
      M     : 77
    };

    function $$$views$text$format$toolbar$$selectionIsEditableByToolbar(selection, toolbar) {
      return $$$utils$selection$utils$$selectionIsEditable(selection) && $$$utils$selection$utils$$selectionIsInElement(selection, toolbar.rootElement);
    }

    function $$$views$text$format$toolbar$$handleTextSelection(toolbar) {
      var selection = window.getSelection();
      if (toolbar.sticky) {
        toolbar.updateForSelection($$$views$text$format$toolbar$$selectionIsEditableByToolbar(selection, toolbar) ? selection : null);
      } else {
        if (selection.isCollapsed || selection.toString().trim() === '' || !$$$views$text$format$toolbar$$selectionIsEditableByToolbar(selection, toolbar)) {
          toolbar.hide();
        } else {
          toolbar.show();
          toolbar.updateForSelection(selection);
        }
      }
    }

    function $$$views$text$format$toolbar$$TextFormatToolbar(options) {
      var toolbar = this;
      $$toolbar$$default.call(this, options);
      toolbar.rootElement = options.rootElement;
      toolbar.rootElement.addEventListener('keyup', function() { $$$views$text$format$toolbar$$handleTextSelection(toolbar); });

      document.addEventListener('mouseup', function() {
        setTimeout(function() {
          $$$views$text$format$toolbar$$handleTextSelection(toolbar);
        });
      });

      document.addEventListener('keyup', function(e) {
        var key = e.keyCode;
        if (key === 116) { //F5
          toolbar.toggleSticky();
          $$$views$text$format$toolbar$$handleTextSelection(toolbar);
        } else if (!toolbar.sticky && key === $$$utils$keycodes$$default.ESC) {
          toolbar.hide();
        }
      });

      window.addEventListener('resize', function() {
        if(!toolbar.sticky && toolbar.isShowing) {
          var activePromptRange = toolbar.activePrompt && toolbar.activePrompt.range;
          toolbar.positionToContent(activePromptRange ? activePromptRange : window.getSelection().getRangeAt(0));
        }
      });
    }
    node_modules$content$kit$utils$src$object$utils$$inherit($$$views$text$format$toolbar$$TextFormatToolbar, $$toolbar$$default);

    var $$$views$text$format$toolbar$$default = $$$views$text$format$toolbar$$TextFormatToolbar;

    function $$$views$tooltip$$Tooltip(options) {
      var tooltip = this;
      var rootElement = options.rootElement;
      var delay = options.delay || 200;
      var timeout;
      options.classNames = ['ck-tooltip'];
      $$view$$default.call(tooltip, options);

      rootElement.addEventListener('mouseover', function(e) {
        var target = $$$utils$element$utils$$getEventTargetMatchingTag(options.showForTag, e.target, rootElement);
        if (target && target.isContentEditable) {
          timeout = setTimeout(function() {
            tooltip.showLink(target.href, target);
          }, delay);
        }
      });
      
      rootElement.addEventListener('mouseout', function(e) {
        clearTimeout(timeout);
        var toElement = e.toElement || e.relatedTarget;
        if (toElement && toElement.className !== tooltip.element.className) {
          tooltip.hide();
        }
      });
    }
    node_modules$content$kit$utils$src$object$utils$$inherit($$$views$tooltip$$Tooltip, $$view$$default);

    $$$views$tooltip$$Tooltip.prototype.showMessage = function(message, element) {
      var tooltip = this;
      var tooltipElement = tooltip.element;
      tooltipElement.innerHTML = message;
      tooltip.show();
      $$$utils$element$utils$$positionElementCenteredBelow(tooltipElement, element);
    };

    $$$views$tooltip$$Tooltip.prototype.showLink = function(link, element) {
      var message = '<a href="' + link + '" target="_blank">' + link + '</a>';
      this.showMessage(message, element);
    };

    var $$$views$tooltip$$default = $$$views$tooltip$$Tooltip;

    var $$$views$embed$intent$$LayoutStyle = {
      GUTTER   : 1,
      CENTERED : 2
    };

    function $$$views$embed$intent$$computeLayoutStyle(rootElement) {
      if (rootElement.getBoundingClientRect().left > 100) {
        return $$$views$embed$intent$$LayoutStyle.GUTTER;
      }
      return $$$views$embed$intent$$LayoutStyle.CENTERED;
    }

    function $$$views$embed$intent$$EmbedIntent(options) {
      var embedIntent = this;
      var rootElement = embedIntent.rootElement = options.rootElement;
      options.classNames = ['ck-embed-intent'];
      $$view$$default.call(embedIntent, options);

      embedIntent.isActive = false;
      embedIntent.editorContext = options.editorContext;
      embedIntent.loadingIndicator = $$$utils$element$utils$$createDiv('ck-embed-loading');
      embedIntent.button = document.createElement('button');
      embedIntent.button.className = 'ck-embed-intent-btn';
      embedIntent.button.title = 'Insert image or embed...';
      embedIntent.element.appendChild(embedIntent.button);
      embedIntent.button.addEventListener('mouseup', function(e) {
        if (embedIntent.isActive) {
          embedIntent.deactivate();
        } else {
          embedIntent.activate();
        }
        e.stopPropagation();
      });

      embedIntent.toolbar = new $$toolbar$$default({
        container: embedIntent.element,
        embedIntent: embedIntent,
        editor: embedIntent.editorContext,
        commands: options.commands,
        direction: $$toolbar$$default.Direction.RIGHT
      });

      function embedIntentHandler() {
        var blockElement = $$$utils$selection$utils$$getSelectionBlockElement();
        if (blockElement && $$$utils$element$utils$$elementContentIsEmpty(blockElement)) {
          embedIntent.showAt(blockElement);
        } else {
          embedIntent.hide();
        }
      }

      rootElement.addEventListener('keyup', embedIntentHandler);
      document.addEventListener('mouseup', function() {
        setTimeout(function() { embedIntentHandler(); });
      });

      document.addEventListener('keyup', function(e) {
        if (e.keyCode === $$$utils$keycodes$$default.ESC) {
          embedIntent.hide();
        }
      });

      window.addEventListener('resize', function() {
        if(embedIntent.isShowing) {
          embedIntent.reposition();
        }
      });
    }
    node_modules$content$kit$utils$src$object$utils$$inherit($$$views$embed$intent$$EmbedIntent, $$view$$default);

    $$$views$embed$intent$$EmbedIntent.prototype.hide = function() {
      if ($$$views$embed$intent$$EmbedIntent._super.prototype.hide.call(this)) {
        this.deactivate();
      }
    };

    $$$views$embed$intent$$EmbedIntent.prototype.showAt = function(node) {
      this.atNode = node;
      this.show();
      this.deactivate();
      this.reposition();
    };

    $$$views$embed$intent$$EmbedIntent.prototype.reposition = function() {
      if ($$$views$embed$intent$$computeLayoutStyle(this.rootElement) === $$$views$embed$intent$$LayoutStyle.GUTTER) {
        $$$utils$element$utils$$positionElementToLeftOf(this.element, this.atNode);
      } else {
        $$$utils$element$utils$$positionElementCenteredIn(this.element, this.atNode);
      }
    };

    $$$views$embed$intent$$EmbedIntent.prototype.activate = function() {
      if (!this.isActive) {
        this.addClass('activated');
        this.toolbar.show();
        this.isActive = true;
      }
    };

    $$$views$embed$intent$$EmbedIntent.prototype.deactivate = function() {
      if (this.isActive) {
        this.removeClass('activated');
        this.toolbar.hide();
        this.isActive = false;
      }
    };

    $$$views$embed$intent$$EmbedIntent.prototype.showLoading = function() {
      var embedIntent = this;
      var loadingIndicator = embedIntent.loadingIndicator;
      embedIntent.hide();
      embedIntent.atNode.appendChild(loadingIndicator);
    };

    $$$views$embed$intent$$EmbedIntent.prototype.hideLoading = function() {
      this.atNode.removeChild(this.loadingIndicator);
    };

    var $$$views$embed$intent$$default = $$$views$embed$intent$$EmbedIntent;
    function $$base$$Command(options) {
      options = options || {};
      var command = this;
      var name = options.name;
      var prompt = options.prompt;
      command.name = name;
      command.button = options.button || name;
      if (prompt) { command.prompt = prompt; }
    }

    $$base$$Command.prototype.exec = function() {};

    var $$base$$default = $$base$$Command;

    function $$text$format$$TextFormatCommand(options) {
      options = options || {};
      $$base$$default.call(this, options);
      this.tag = options.tag;
      this.mappedTags = options.mappedTags || [];
      this.mappedTags.push(this.tag);
      this.action = options.action || this.name;
      this.removeAction = options.removeAction || this.action;
    }
    node_modules$content$kit$utils$src$object$utils$$inherit($$text$format$$TextFormatCommand, $$base$$default);

    $$text$format$$TextFormatCommand.prototype = {
      exec: function(value) {
        document.execCommand(this.action, false, value || null);
      },
      unexec: function(value) {
        document.execCommand(this.removeAction, false, value || null);
      }
    };

    var $$text$format$$default = $$text$format$$TextFormatCommand;

    var $$$commands$bold$$RegExpHeadingTag = /^(h1|h2|h3|h4|h5|h6)$/i;

    function $$$commands$bold$$BoldCommand() {
      $$text$format$$default.call(this, {
        name: 'bold',
        tag: node_modules$content$kit$compiler$src$types$type$$default.BOLD.tag,
        mappedTags: node_modules$content$kit$compiler$src$types$type$$default.BOLD.mappedTags,
        button: '<i class="ck-icon-bold"></i>'
      });
    }
    node_modules$content$kit$utils$src$object$utils$$inherit($$$commands$bold$$BoldCommand, $$text$format$$default);

    $$$commands$bold$$BoldCommand.prototype.exec = function() {
      // Don't allow executing bold command on heading tags
      if (!$$$commands$bold$$RegExpHeadingTag.test($$$utils$selection$utils$$getSelectionBlockTagName())) {
        $$$commands$bold$$BoldCommand._super.prototype.exec.call(this);
      }
    };

    var $$$commands$bold$$default = $$$commands$bold$$BoldCommand;

    function $$$commands$italic$$ItalicCommand() {
      $$text$format$$default.call(this, {
        name: 'italic',
        tag: node_modules$content$kit$compiler$src$types$type$$default.ITALIC.tag,
        mappedTags: node_modules$content$kit$compiler$src$types$type$$default.ITALIC.mappedTags,
        button: '<i class="ck-icon-italic"></i>'
      });
    }
    node_modules$content$kit$utils$src$object$utils$$inherit($$$commands$italic$$ItalicCommand, $$text$format$$default);

    var $$$commands$italic$$default = $$$commands$italic$$ItalicCommand;

    var $$$views$prompt$$container = document.body;
    var $$$views$prompt$$hiliter = $$$utils$element$utils$$createDiv('ck-editor-hilite');

    function $$$views$prompt$$positionHiliteRange(range) {
      var rect = range.getBoundingClientRect();
      var style = $$$views$prompt$$hiliter.style;
      style.width  = rect.width  + 'px';
      style.height = rect.height + 'px';
      $$$utils$element$utils$$positionElementToRect($$$views$prompt$$hiliter, rect);
    }

    function $$$views$prompt$$Prompt(options) {
      var prompt = this;
      options.tagName = 'input';
      $$view$$default.call(prompt, options);

      prompt.command = options.command;
      prompt.element.placeholder = options.placeholder || '';
      prompt.element.addEventListener('mouseup', function(e) { e.stopPropagation(); }); // prevents closing prompt when clicking input 
      prompt.element.addEventListener('keyup', function(e) {
        var entry = this.value;
        if(entry && prompt.range && !e.shiftKey && e.which === $$$utils$keycodes$$default.ENTER) {
          $$$utils$selection$utils$$restoreRange(prompt.range);
          prompt.command.exec(entry);
          if (prompt.onComplete) { prompt.onComplete(); }
        }
      });

      window.addEventListener('resize', function() {
        var activeHilite = $$$views$prompt$$hiliter.parentNode;
        var range = prompt.range;
        if(activeHilite && range) {
          $$$views$prompt$$positionHiliteRange(range);
        }
      });
    }
    node_modules$content$kit$utils$src$object$utils$$inherit($$$views$prompt$$Prompt, $$view$$default);

    $$$views$prompt$$Prompt.prototype.show = function(callback) {
      var prompt = this;
      var element = prompt.element;
      var selection = window.getSelection();
      var range = selection && selection.rangeCount && selection.getRangeAt(0);
      element.value = null;
      prompt.range = range || null;
      if (range) {
        $$$views$prompt$$container.appendChild($$$views$prompt$$hiliter);
        $$$views$prompt$$positionHiliteRange(prompt.range);
        setTimeout(function(){ element.focus(); }); // defer focus (disrupts mouseup events)
        if (callback) { prompt.onComplete = callback; }
      }
    };

    $$$views$prompt$$Prompt.prototype.hide = function() {
      if ($$$views$prompt$$hiliter.parentNode) {
        $$$views$prompt$$container.removeChild($$$views$prompt$$hiliter);
      }
    };

    var $$$views$prompt$$default = $$$views$prompt$$Prompt;

    var $$$commands$link$$RegExpHttp = /^https?:\/\//i;

    function $$$commands$link$$LinkCommand() {
      $$text$format$$default.call(this, {
        name: 'link',
        tag: node_modules$content$kit$compiler$src$types$type$$default.LINK.tag,
        action: 'createLink',
        removeAction: 'unlink',
        button: '<i class="ck-icon-link"></i>',
        prompt: new $$$views$prompt$$default({
          command: this,
          placeholder: 'Enter a url, press return...'
        })
      });
    }
    node_modules$content$kit$utils$src$object$utils$$inherit($$$commands$link$$LinkCommand, $$text$format$$default);

    $$$commands$link$$LinkCommand.prototype.exec = function(url) {
      if (!url) {
        return $$$commands$link$$LinkCommand._super.prototype.unexec.call(this);
      }

      if(this.tag === $$$utils$selection$utils$$getSelectionTagName()) {
        this.unexec();
      } else {
        if (!$$$commands$link$$RegExpHttp.test(url)) {
          url = 'http://' + url;
        }
        $$$commands$link$$LinkCommand._super.prototype.exec.call(this, url);
      }
    };

    var $$$commands$link$$default = $$$commands$link$$LinkCommand;

    function $$format$block$$FormatBlockCommand(options) {
      options = options || {};
      options.action = 'formatBlock';
      $$text$format$$default.call(this, options);
    }
    node_modules$content$kit$utils$src$object$utils$$inherit($$format$block$$FormatBlockCommand, $$text$format$$default);

    $$format$block$$FormatBlockCommand.prototype.exec = function() {
      var tag = this.tag;
      // Brackets neccessary for certain browsers
      var value =  '<' + tag + '>';
      var blockElement = $$$utils$selection$utils$$getSelectionBlockElement();
      // Allow block commands to be toggled back to a text block
      if(tag === blockElement.tagName.toLowerCase()) {
        value = node_modules$content$kit$compiler$src$types$type$$default.PARAGRAPH.tag;
      } else {
        // Flattens the selection before applying the block format.
        // Otherwise, undesirable nested blocks can occur.
        // TODO: would love to be able to remove this
        var flatNode = document.createTextNode(blockElement.textContent);
        blockElement.parentNode.insertBefore(flatNode, blockElement);
        blockElement.parentNode.removeChild(blockElement);
        $$$utils$selection$utils$$selectNode(flatNode);
      }
      
      $$format$block$$FormatBlockCommand._super.prototype.exec.call(this, value);
    };

    var $$format$block$$default = $$format$block$$FormatBlockCommand;

    function $$$commands$quote$$QuoteCommand() {
      $$format$block$$default.call(this, {
        name: 'quote',
        tag: node_modules$content$kit$compiler$src$types$type$$default.QUOTE.tag,
        button: '<i class="ck-icon-quote"></i>'
      });
    }
    node_modules$content$kit$utils$src$object$utils$$inherit($$$commands$quote$$QuoteCommand, $$format$block$$default);

    var $$$commands$quote$$default = $$$commands$quote$$QuoteCommand;

    function $$$commands$heading$$HeadingCommand() {
      $$format$block$$default.call(this, {
        name: 'heading',
        tag: node_modules$content$kit$compiler$src$types$type$$default.HEADING.tag,
        button: '<i class="ck-icon-heading"></i>1'
      });
    }
    node_modules$content$kit$utils$src$object$utils$$inherit($$$commands$heading$$HeadingCommand, $$format$block$$default);

    var $$$commands$heading$$default = $$$commands$heading$$HeadingCommand;

    function $$$commands$subheading$$SubheadingCommand() {
      $$format$block$$default.call(this, {
        name: 'subheading',
        tag: node_modules$content$kit$compiler$src$types$type$$default.SUBHEADING.tag,
        button: '<i class="ck-icon-heading"></i>2'
      });
    }
    node_modules$content$kit$utils$src$object$utils$$inherit($$$commands$subheading$$SubheadingCommand, $$format$block$$default);

    var $$$commands$subheading$$default = $$$commands$subheading$$SubheadingCommand;

    function $$list$$ListCommand(options) {
      $$text$format$$default.call(this, options);
    }
    node_modules$content$kit$utils$src$object$utils$$inherit($$list$$ListCommand, $$text$format$$default);

    $$list$$ListCommand.prototype.exec = function() {
      $$list$$ListCommand._super.prototype.exec.call(this);
      
      // After creation, lists need to be unwrapped
      // TODO: eventually can remove this when direct model manipulation is ready
      var listElement = $$$utils$selection$utils$$getSelectionBlockElement();
      var wrapperNode = listElement.parentNode;
      if (wrapperNode.firstChild === listElement) {
        var editorNode = wrapperNode.parentNode;
        editorNode.insertBefore(listElement, wrapperNode);
        editorNode.removeChild(wrapperNode);
        $$$utils$selection$utils$$selectNode(listElement);
      }
    };

    $$list$$ListCommand.prototype.checkAutoFormat = function(node) {
      // Creates unordered lists when node starts with '- '
      // or ordered list if node starts with '1. '
      var regex = this.autoFormatRegex, text;
      if (node && regex) {
        text = node.textContent;
        if (node_modules$content$kit$compiler$src$types$type$$default.LIST_ITEM.tag !== $$$utils$selection$utils$$getSelectionTagName() && regex.test(text)) {
          this.exec();
          window.getSelection().anchorNode.textContent = text.replace(regex, '');
          return true;
        }
      }
      return false;
    };

    var $$list$$default = $$list$$ListCommand;

    function $$$commands$unordered$list$$UnorderedListCommand() {
      $$list$$default.call(this, {
        name: 'list',
        tag: node_modules$content$kit$compiler$src$types$type$$default.LIST.tag,
        action: 'insertUnorderedList'
      });
    }
    node_modules$content$kit$utils$src$object$utils$$inherit($$$commands$unordered$list$$UnorderedListCommand, $$list$$default);

    $$$commands$unordered$list$$UnorderedListCommand.prototype.autoFormatRegex =  /^[-*]\s/;

    var $$$commands$unordered$list$$default = $$$commands$unordered$list$$UnorderedListCommand;

    function $$$commands$ordered$list$$OrderedListCommand() {
      $$list$$default.call(this, {
        name: 'ordered list',
        tag: node_modules$content$kit$compiler$src$types$type$$default.ORDERED_LIST.tag,
        action: 'insertOrderedList'
      });
    }
    node_modules$content$kit$utils$src$object$utils$$inherit($$$commands$ordered$list$$OrderedListCommand, $$list$$default);

    $$$commands$ordered$list$$OrderedListCommand.prototype.autoFormatRegex = /^1\.\s/;

    var $$$commands$ordered$list$$default = $$$commands$ordered$list$$OrderedListCommand;

    var $$$views$message$$defaultClassNames = ['ck-message'];

    function $$$views$message$$Message(options) {
      options = options || {};
      options.classNames = $$$views$message$$defaultClassNames;
      $$view$$default.call(this, options);
    }
    node_modules$content$kit$utils$src$object$utils$$inherit($$$views$message$$Message, $$view$$default);

    function $$$views$message$$show(view, message) {
      view.element.innerHTML = message;
      $$$views$message$$Message._super.prototype.show.call(view);
      setTimeout(function() {
        view.hide();
      }, 3200);
    }

    $$$views$message$$Message.prototype.showInfo = function(message) {
      this.setClasses($$$views$message$$defaultClassNames);
      $$$views$message$$show(this, message);
    };

    $$$views$message$$Message.prototype.showError = function(message) {
      this.addClass('ck-message-error');
      $$$views$message$$show(this, message);
    };

    var $$$views$message$$default = $$$views$message$$Message;
    function $$$utils$http$utils$$createXHR(options) {
      var xhr = new XMLHttpRequest();
      xhr.open(options.method, options.url);
      xhr.onload = function () {
        var response = xhr.responseText;
        if (xhr.status === 200) {
          return options.success.call(this, response);
        }
        options.error.call(this, response);
      };
      xhr.onerror = function (error) {
        options.error.call(this, error);
      };
      return xhr;
    }

    function $$$utils$http$utils$$xhrGet(options) {
      options.method = 'GET';
      var xhr = $$$utils$http$utils$$createXHR(options);
      try {
        xhr.send();
      } catch(error) {}
    }

    function $$$utils$http$utils$$xhrPost(options) {
      options.method = 'POST';
      var xhr = $$$utils$http$utils$$createXHR(options);
      var formData = new FormData();
      formData.append('file', options.data);
      try {
        xhr.send(formData);
      } catch(error) {}
    }

    function $$$utils$http$utils$$responseJSON(jsonString) {
      if (!jsonString) { return null; }
      try {
        return JSON.parse(jsonString);
      } catch(e) {
        return jsonString;
      }
    }

    // --------------------------------------------

    function $$$utils$http$utils$$FileUploader(options) {
      options = options || {};
      var url = options.url;
      var maxFileSize = options.maxFileSize;
      if (url) {
        this.url = url;
      } else {
        throw new Error('FileUploader: setting the `url` to an upload service is required');
      }
      if (maxFileSize) {
        this.maxFileSize = maxFileSize;
      }
    }

    $$$utils$http$utils$$FileUploader.prototype.upload = function(options) {
      if (!options) { return; }

      var fileInput = options.fileInput;
      var file = options.file || (fileInput && fileInput.files && fileInput.files[0]);
      var callback = options.complete;
      var maxFileSize = this.maxFileSize;
      if (!file || !(file instanceof window.File)) { return; }

      if (maxFileSize && file.size > maxFileSize) {
        if (callback) { callback.call(this, null, { message: 'max file size is ' + maxFileSize + ' bytes' }); }
        return;
      }

      $$$utils$http$utils$$xhrPost({
        url: this.url,
        data: file,
        success: function(response) {
          if (callback) { callback.call(this, $$$utils$http$utils$$responseJSON(response)); }
        },
        error: function(error) {
          if (callback) { callback.call(this, null, $$$utils$http$utils$$responseJSON(error)); }
        }
      });
    };

    function $$$utils$http$utils$$OEmbedder(options) {
      options = options || {};
      var url = options.url;
      if (url) {
        this.url = url;
      } else {
        throw new Error('OEmbedder: setting the `url` to an embed service is required');
      }
    }

    $$$utils$http$utils$$OEmbedder.prototype.fetch = function(options) {
      var callback = options.complete;
      $$$utils$http$utils$$xhrGet({
        url: this.url + "?url=" + encodeURI(options.url),
        success: function(response) {
          if (callback) { callback.call(this, $$$utils$http$utils$$responseJSON(response)); }
        },
        error: function(error) {
          if (callback) { callback.call(this, null, $$$utils$http$utils$$responseJSON(error)); }
        }
      });
    };

    function $$$commands$image$$createFileInput(command) {
      var fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.className = 'ck-file-input';
      fileInput.addEventListener('change', function(e) {
        command.handleFile(e);
      });
      return fileInput;
    }

    function $$$commands$image$$injectImageBlock(src, editor, index) {
      var imageModel = node_modules$content$kit$compiler$src$models$block$$default.createWithType(node_modules$content$kit$compiler$src$types$type$$default.IMAGE, { attributes: { src: src } });
      editor.replaceBlock(imageModel, index);
    }

    function $$$commands$image$$renderFromFile(file, editor, index) {
      if (file && window.FileReader) {
        var reader = new FileReader();
        reader.onload = function(e) {
          var base64Src = e.target.result;
          $$$commands$image$$injectImageBlock(base64Src, editor, index);
          editor.renderBlockAt(index, true);
        };
        reader.readAsDataURL(file);
      }
    }

    function $$$commands$image$$ImageCommand(options) {
      $$base$$default.call(this, {
        name: 'image',
        button: '<i class="ck-icon-image"></i>'
      });
      this.uploader = new $$$utils$http$utils$$FileUploader({ url: options.serviceUrl, maxFileSize: 5000000 });
    }
    node_modules$content$kit$utils$src$object$utils$$inherit($$$commands$image$$ImageCommand, $$base$$default);

    $$$commands$image$$ImageCommand.prototype = {
      exec: function() {
        $$$commands$image$$ImageCommand._super.prototype.exec.call(this);
        var fileInput = this.fileInput;
        if (!fileInput) {
          fileInput = this.fileInput = $$$commands$image$$createFileInput(this);
          document.body.appendChild(fileInput);
        }
        fileInput.dispatchEvent(new MouseEvent('click', { bubbles: false }));
      },
      handleFile: function(e) {
        var fileInput = e.target;
        var file = fileInput.files && fileInput.files[0];
        var editor = this.editorContext;
        var embedIntent = this.embedIntent;
        var currentEditingIndex = editor.getCurrentBlockIndex();

        embedIntent.showLoading();
        $$$commands$image$$renderFromFile(file, editor, currentEditingIndex); // render image immediately client-side
        this.uploader.upload({
          fileInput: fileInput,
          complete: function(response, error) {
            embedIntent.hideLoading();
            if (error || !response || !response.url) {
              setTimeout(function() {
                editor.removeBlockAt(currentEditingIndex);
                editor.syncVisual();
              }, 1000);
              return new $$$views$message$$default().showError(error.message || 'Error uploading image');
            }
            $$$commands$image$$injectImageBlock(response.url, editor, currentEditingIndex);
          }
        });
        fileInput.value = null; // reset file input
      }
    };

    var $$$commands$image$$default = $$$commands$image$$ImageCommand;

    function $$$commands$oembed$$loadTwitterWidgets(element) {
      if (window.twttr) {
        window.twttr.widgets.load(element);
      } else {
        var script = document.createElement('script');
        script.async = true;
        script.src = 'http://platform.twitter.com/widgets.js';
        document.head.appendChild(script);
      }
    }

    function $$$commands$oembed$$OEmbedCommand(options) {
      $$base$$default.call(this, {
        name: 'embed',
        button: '<i class="ck-icon-embed"></i>',
        prompt: new $$$views$prompt$$default({
          command: this,
          placeholder: 'Paste a YouTube or Twitter url...'
        })
      });

      this.embedService = new $$$utils$http$utils$$OEmbedder({ url: options.serviceUrl });
    }
    node_modules$content$kit$utils$src$object$utils$$inherit($$$commands$oembed$$OEmbedCommand, $$base$$default);

    $$$commands$oembed$$OEmbedCommand.prototype.exec = function(url) {
      var command = this;
      var editorContext = command.editorContext;
      var embedIntent = command.embedIntent;
      var index = editorContext.getCurrentBlockIndex();
      
      embedIntent.showLoading();
      this.embedService.fetch({
        url: url,
        complete: function(response, error) {
          embedIntent.hideLoading();
          if (error) {
            var errorMsg = error;
            if (error.target && error.target.status === 0) {
              errorMsg = 'Error: could not connect to embed service.';
            } else if (typeof error !== 'string') {
              errorMsg = 'Error: unexpected embed error.';
            }
            new $$$views$message$$default().showError(errorMsg);
            embedIntent.show();
          } else if (response.error_message) {
            new $$$views$message$$default().showError(response.error_message);
            embedIntent.show();
          } else {
            var embedModel = new node_modules$content$kit$compiler$src$models$embed$$default(response);
            editorContext.insertBlock(embedModel, index);
            editorContext.renderBlockAt(index);
            if (embedModel.attributes.provider_name.toLowerCase() === 'twitter') {
              $$$commands$oembed$$loadTwitterWidgets(editorContext.element);
            }
          }
        }
      });
    };

    var $$$commands$oembed$$default = $$$commands$oembed$$OEmbedCommand;
    // Based on https://github.com/jeromeetienne/microevent.js/blob/master/microevent.js
    // See also: https://github.com/allouis/minivents/blob/master/minivents.js

    var $$$utils$event$emitter$$EventEmitter = {
      on : function(type, handler){
        var events = this.__events = this.__events || {};
        events[type] = events[type] || [];
        events[type].push(handler);
      },
      off : function(type, handler){
        var events = this.__events = this.__events || {};
        if (type in events) {
          events[type].splice(events[type].indexOf(handler), 1);
        }
      },
      trigger : function(type) {
        var events = this.__events = this.__events || {};
        var eventForTypeCount, i;
        if (type in events) {
          eventForTypeCount = events[type].length;
          for(i = 0; i < eventForTypeCount; i++) {
            events[type][i].apply(this, Array.prototype.slice.call(arguments, 1));
          }
        }
      }
    };

    var $$$utils$event$emitter$$default = $$$utils$event$emitter$$EventEmitter;

    var $$editor$$defaults = {
      placeholder: 'Write here...',
      spellcheck: true,
      autofocus: true,
      model: null,
      serverHost: '',
      stickyToolbar: !!('ontouchstart' in window),
      textFormatCommands: [
        new $$$commands$bold$$default(),
        new $$$commands$italic$$default(),
        new $$$commands$link$$default(),
        new $$$commands$quote$$default(),
        new $$$commands$heading$$default(),
        new $$$commands$subheading$$default()
      ],
      embedCommands: [
        new $$$commands$image$$default({  serviceUrl: '/upload' }),
        new $$$commands$oembed$$default({ serviceUrl: '/embed'  })
      ],
      autoTypingCommands: [
        new $$$commands$unordered$list$$default(),
        new $$$commands$ordered$list$$default()
      ],
      compiler: new node_modules$content$kit$compiler$src$compiler$$default({
        includeTypeNames: true, // outputs models with type names, i.e. 'BOLD', for easier debugging
        renderer: new $$$renderers$editor$html$renderer$$default() // subclassed HTML renderer that adds dom structure for additional editor interactivity
      })
    };

    function $$editor$$bindContentEditableTypingListeners(editor) {


      editor.element.addEventListener('keyup', function(e) {
        // Assure there is always a supported block tag, and not empty text nodes or divs.
        // On a carrage return, make sure to always generate a 'p' tag
        if (!$$$utils$selection$utils$$getSelectionBlockElement() ||
            !editor.element.textContent ||
           (!e.shiftKey && e.which === $$$utils$keycodes$$default.ENTER) || (e.ctrlKey && e.which === $$$utils$keycodes$$default.M)) {
          document.execCommand('formatBlock', false, node_modules$content$kit$compiler$src$types$type$$default.PARAGRAPH.tag);
        } //else if (e.which === Keycodes.BKSP) {
          // TODO: Need to rerender when backspacing 2 blocks together
          //var cursorIndex = editor.getCursorIndexInCurrentBlock();
          //var currentBlockElement = getSelectionBlockElement();
          //editor.renderBlockAt(editor.getCurrentBlockIndex(), true);
          //setCursorIndexInElement(currentBlockElement, cursorIndex);
        //}
      });

      // On 'PASTE' sanitize and insert
      editor.element.addEventListener('paste', function(e) {
        var data = e.clipboardData;
        var pastedHTML = data && data.getData && data.getData('text/html');
        var sanitizedHTML = pastedHTML && editor.compiler.rerender(pastedHTML);
        if (sanitizedHTML) {
          document.execCommand('insertHTML', false, sanitizedHTML);
          editor.syncVisual();
        }
        e.preventDefault();
        return false;
      });
    }

    function $$editor$$bindLiveUpdate(editor) {
      editor.element.addEventListener('input', function() {
        editor.syncContentEditableBlocks();
      });
    }

    function $$editor$$bindAutoTypingListeners(editor) {
      // Watch typing patterns for auto format commands (e.g. lists '- ', '1. ')
      editor.element.addEventListener('keyup', function(e) {
        var commands = editor.autoTypingCommands;
        var count = commands && commands.length;
        var selection, i;

        if (count) {
          selection = window.getSelection();
          for (i = 0; i < count; i++) {
            if (commands[i].checkAutoFormat(selection.anchorNode)) {
              e.stopPropagation();
              return;
            }
          }
        }
      });
    }

    function $$editor$$bindDragAndDrop() {
      // TODO. For now, just prevent redirect when dropping something on the page
      window.addEventListener('dragover', function(e) {
        e.preventDefault(); // prevents showing cursor where to drop
      });
      window.addEventListener('drop', function(e) {
        e.preventDefault(); // prevent page from redirecting
      });
    }

    function $$editor$$initEmbedCommands(editor) {
      var commands = editor.embedCommands;
      if(commands) {
        return new $$$views$embed$intent$$default({
          editorContext: editor,
          commands: commands,
          rootElement: editor.element
        });
      }
    }

    function $$editor$$applyClassName(editorElement) {
      var editorClassName = 'ck-editor';
      var editorClassNameRegExp = new RegExp(editorClassName);
      var existingClassName = editorElement.className;

      if (!editorClassNameRegExp.test(existingClassName)) {
        existingClassName += (existingClassName ? ' ' : '') + editorClassName;
      }
      editorElement.className = existingClassName;
    }

    function $$editor$$applyPlaceholder(editorElement, placeholder) {
      var dataset = editorElement.dataset;
      if (placeholder && !dataset.placeholder) {
        dataset.placeholder = placeholder;
      }
    }

    function $$editor$$getNonTextBlocks(blockTypeSet, model) {
      var blocks = [];
      var len = model.length;
      var i, block, type;
      for (i = 0; i < len; i++) {
        block = model[i];
        type = blockTypeSet.findById(block && block.type);
        if (type && !type.isTextType) {
          blocks.push(block);
        }
      }
      return blocks;
    }

    /**
     * @class Editor
     * An individual Editor
     * @param element `Element` node
     * @param options hash of options
     */
    function $$editor$$Editor(element, options) {
      var editor = this;
      node_modules$content$kit$utils$src$object$utils$$mergeWithOptions(editor, $$editor$$defaults, options);

      // Update embed commands by prepending the serverHost
      editor.embedCommands = [
        new $$$commands$image$$default({  serviceUrl: editor.serverHost + '/upload' }),
        new $$$commands$oembed$$default({ serviceUrl: editor.serverHost + '/embed'  })
      ];

      if (element) {
        $$editor$$applyClassName(element);
        $$editor$$applyPlaceholder(element, editor.placeholder);
        element.spellcheck = editor.spellcheck;
        element.setAttribute('contentEditable', true);
        editor.element = element;

        if (editor.model) {
          editor.loadModel(editor.model);
        } else {
          editor.sync();
        }

        $$editor$$bindContentEditableTypingListeners(editor);
        $$editor$$bindAutoTypingListeners(editor);
        $$editor$$bindDragAndDrop(editor);
        $$editor$$bindLiveUpdate(editor);
        $$editor$$initEmbedCommands(editor);

        editor.textFormatToolbar = new $$$views$text$format$toolbar$$default({ rootElement: element, commands: editor.textFormatCommands, sticky: editor.stickyToolbar });
        editor.linkTooltips = new $$$views$tooltip$$default({ rootElement: element, showForTag: node_modules$content$kit$compiler$src$types$type$$default.LINK.tag });

        if(editor.autofocus) { element.focus(); }
      }
    }

    // Add event emitter pub/sub functionality
    node_modules$content$kit$utils$src$object$utils$$merge($$editor$$Editor.prototype, $$$utils$event$emitter$$default);

    $$editor$$Editor.prototype.loadModel = function(model) {
      this.model = model;
      this.syncVisual();
      this.trigger('update');
    };

    $$editor$$Editor.prototype.syncModel = function() {
      this.model = this.compiler.parse(this.element.innerHTML);
      this.trigger('update');
    };

    $$editor$$Editor.prototype.syncVisual = function() {
      this.element.innerHTML = this.compiler.render(this.model);
    };

    $$editor$$Editor.prototype.sync = function() {
      this.syncModel();
      this.syncVisual();
    };

    $$editor$$Editor.prototype.getCurrentBlockIndex = function(element) {
      var selectionEl = element || $$$utils$selection$utils$$getSelectionBlockElement();
      var blockElements = node_modules$content$kit$utils$src$array$utils$$toArray(this.element.children);
      return blockElements.indexOf(selectionEl);
    };

    $$editor$$Editor.prototype.getCursorIndexInCurrentBlock = function() {
      var currentBlock = $$$utils$selection$utils$$getSelectionBlockElement();
      if (currentBlock) {
        return $$$utils$selection$utils$$getCursorOffsetInElement(currentBlock);
      }
      return -1;
    };

    $$editor$$Editor.prototype.insertBlock = function(block, index) {
      this.model.splice(index, 0, block);
      this.trigger('update');
    };

    $$editor$$Editor.prototype.removeBlockAt = function(index) {
      this.model.splice(index, 1);
      this.trigger('update');
    };

    $$editor$$Editor.prototype.replaceBlock = function(block, index) {
      this.model[index] = block;
      this.trigger('update');
    };

    $$editor$$Editor.prototype.renderBlockAt = function(index, replace) {
      var modelAtIndex = this.model[index];
      var html = this.compiler.render([modelAtIndex]);
      var dom = document.createElement('div');
      dom.innerHTML = html;
      var newEl = dom.firstChild;
      var sibling = this.element.children[index];
      if (replace) {
        this.element.replaceChild(newEl, sibling);
      } else {
        this.element.insertBefore(newEl, sibling);
      }
    };

    $$editor$$Editor.prototype.syncContentEditableBlocks = function() {
      var nonTextBlocks = $$editor$$getNonTextBlocks(this.compiler.blockTypes, this.model);
      var blockElements = node_modules$content$kit$utils$src$array$utils$$toArray(this.element.children);
      var len = blockElements.length;
      var updatedModel = [];
      var i, blockEl;
      for (i = 0; i < len; i++) {
        blockEl = blockElements[i];
        if(blockEl.isContentEditable) {
          updatedModel.push(this.compiler.parser.serializeBlockNode(blockEl));
        } else {
          updatedModel.push(nonTextBlocks.shift());
        }
      }
      this.model = updatedModel;
      this.trigger('update');
    };


    var $$editor$$default = $$editor$$Editor;

    /**
     * @class EditorFactory
     * @private
     * `EditorFactory` is publically exposed as `Editor`
     * It takes an `element` param which can be a css selector, Node, or NodeList
     * and sets up indiviual `Editor` instances
     */
    function $$editor$editor$factory$$EditorFactory(element, options) {
      var editors = [];
      var elements, elementsLen, i;

      if (!element) {
        return new $$editor$$default(element, options);
      }

      if (typeof element === 'string') {
        elements = document.querySelectorAll(element);
      } else if (element && element.length) {
        elements = element;
      } else if (element) {
        elements = [element];
      }

      if (elements) {
        elementsLen = elements.length;
        for (i = 0; i < elementsLen; i++) {
          editors.push(new $$editor$$default(elements[i], options));
        }
      }

      return editors.length > 1 ? editors : editors[0];
    }

    $$editor$editor$factory$$EditorFactory.prototype = $$editor$$default.prototype;

    var $$editor$editor$factory$$default = $$editor$editor$factory$$EditorFactory;

    // Create a namespace and selectivly expose public modules
    var src$js$index$$ContentKit = {};
    src$js$index$$ContentKit.Type = node_modules$content$kit$compiler$src$types$type$$default;
    src$js$index$$ContentKit.BlockModel = node_modules$content$kit$compiler$src$models$block$$default;
    src$js$index$$ContentKit.EmbedModel = node_modules$content$kit$compiler$src$models$embed$$default;
    src$js$index$$ContentKit.Compiler = node_modules$content$kit$compiler$src$compiler$$default;
    src$js$index$$ContentKit.HTMLParser = node_modules$content$kit$compiler$src$parsers$html$parser$$default;
    src$js$index$$ContentKit.HTMLRenderer = node_modules$content$kit$compiler$src$renderers$html$renderer$$default;
    src$js$index$$ContentKit.Editor = $$editor$editor$factory$$default;

    window.ContentKit = src$js$index$$ContentKit;

}(this, document));
