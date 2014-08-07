/*!
 * @overview ContentKit-Compiler: Parses HTML to ContentKit's JSON schema and renders back to HTML.
 * @version  0.1.0
 * @author   Garth Poitras <garth22@gmail.com> (http://garthpoitras.com/)
 * @license  MIT
 * Last modified: Aug 7, 2014
 */

(function(window, document, define, undefined) {

define("content-kit",
  ["./types/type","./models/block","./models/text","./models/embed","./compiler","./parsers/html-parser","./renderers/html-renderer","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __dependency7__, __exports__) {
    "use strict";
    var Type = __dependency1__["default"];
    var BlockModel = __dependency2__["default"];
    var TextModel = __dependency3__["default"];
    var EmbedModel = __dependency4__["default"];
    var Compiler = __dependency5__["default"];
    var HTMLParser = __dependency6__["default"];
    var HTMLRenderer = __dependency7__["default"];

    /**
     * @namespace ContentKit
     * Merge public modules into the common ContentKit namespace.
     * Handy for working in the browser with globals.
     */
    var ContentKit = window.ContentKit || {};
    ContentKit.Type = Type;
    ContentKit.BlockModel = BlockModel;
    ContentKit.TextModel = TextModel;
    ContentKit.EmbedModel = EmbedModel;
    ContentKit.Compiler = Compiler;
    ContentKit.HTMLParser = HTMLParser;
    ContentKit.HTMLRenderer = HTMLRenderer;

    __exports__["default"] = ContentKit;
  });
define("compiler",
  ["./parsers/html-parser","./renderers/html-renderer","./types/type","./types/default-types","../utils/object-utils","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __exports__) {
    "use strict";
    var HTMLParser = __dependency1__["default"];
    var HTMLRenderer = __dependency2__["default"];
    var Type = __dependency3__["default"];
    var DefaultBlockTypeSet = __dependency4__.DefaultBlockTypeSet;
    var DefaultMarkupTypeSet = __dependency4__.DefaultMarkupTypeSet;
    var merge = __dependency5__.merge;

    /**
     * @class Compiler
     * @constructor
     * @param options
     */
    function Compiler(options) {
      var parser = new HTMLParser();
      var renderer = new HTMLRenderer();
      var defaults = {
        parser           : parser,
        renderer         : renderer,
        blockTypes       : DefaultBlockTypeSet,
        markupTypes      : DefaultMarkupTypeSet,
        includeTypeNames : false // true will output type_name: 'TEXT' etc. when parsing for easier debugging
      };
      merge(this, defaults, options);

      // Reference the compiler settings
      parser.blockTypes  = renderer.blockTypes  = this.blockTypes;
      parser.markupTypes = renderer.markupTypes = this.markupTypes;
      parser.includeTypeNames = this.includeTypeNames;
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

    /**
     * @method registerBlockType
     * @param {Type} type
     */
    Compiler.prototype.registerBlockType = function(type) {
      if (type instanceof Type) {
        return this.blockTypes.addType(type);
      }
    };

    /**
     * @method registerMarkupType
     * @param {Type} type
     */
    Compiler.prototype.registerMarkupType = function(type) {
      if (type instanceof Type) {
        return this.markupTypes.addType(type);
      }
    };

    __exports__["default"] = Compiler;
  });
define("models/block",
  ["./model","../utils/object-utils","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var Model = __dependency1__["default"];
    var inherit = __dependency2__.inherit;

    /**
     * Ensures block markups at the same index are always in a specific order.
     * For example, so all bold links are consistently marked up 
     * as <a><b>text</b></a> instead of <b><a>text</a></b>
     */
    function sortBlockMarkups(markups) {
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
    function BlockModel(options) {
      options = options || {};
      Model.call(this, options);
      this.value = options.value || '';
      this.markup = sortBlockMarkups(options.markup || []);
    }
    inherit(BlockModel, Model);

    __exports__["default"] = BlockModel;
  });
define("models/embed",
  ["../utils/object-utils","./model","../types/type","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    "use strict";
    var inherit = __dependency1__.inherit;
    var Model = __dependency2__["default"];
    var Type = __dependency3__["default"];

    /**
     * Whitelist of supported services by provider name
     */
    var supportedServices = {
      YOUTUBE   : 1,
      TWITTER   : 2,
      INSTAGRAM : 3
    };

    /**
     * Returns the id of a supported service from a provider name
     */
    function serviceFor(provider) {
      provider = provider && provider.toUpperCase();
      return provider && supportedServices[provider] || null;
    }

    /**
     * @class EmbedModel
     * @constructor
     * @extends Model
     * Massages data from an oEmbed response into an EmbedModel
     */
    function EmbedModel(options) {
      if (!options) { return null; }

      Model.call(this, {
        type: Type.EMBED.id,
        type_name: Type.EMBED.name,
        attributes: {}
      });

      var attributes = this.attributes;
      var embedType = options.type;
      var providerName = options.provider_name;
      var providerId = serviceFor(providerName);
      var embedUrl = options.url;
      var embedTitle = options.title;
      var embedThumbnail = options.thumbnail_url;

      if (embedType)    { attributes.embed_type = embedType; }
      if (providerName) { attributes.provider_name = providerName; }
      if (providerId)   { attributes.provider_id = providerId; }
      if (embedUrl)     { attributes.url = embedUrl; }
      if (embedTitle)   { attributes.title = embedTitle; }

      if (embedType === 'photo') {
        attributes.thumbnail = options.media_url || embedUrl;
      } else if (embedThumbnail) {
        attributes.thumbnail = embedThumbnail;
      }
    }
    inherit(Model, EmbedModel);

    __exports__["default"] = EmbedModel;
  });
define("models/markup",
  ["./model","../utils/object-utils","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var Model = __dependency1__["default"];
    var inherit = __dependency2__.inherit;

    /**
     * @class MarkupModel
     * @constructor
     * @extends Model
     */
    function MarkupModel(options) {
      options = options || {};
      Model.call(this, options);
      this.start = options.start || 0;
      this.end = options.end || 0;
    }
    inherit(MarkupModel, Model);

    __exports__["default"] = MarkupModel;
  });
define("models/model",
  ["exports"],
  function(__exports__) {
    "use strict";
    /**
     * @class Model
     * @constructor
     * @private
     */
    function Model(options) {
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

    __exports__["default"] = Model;
  });
define("models/text",
  ["./block","../types/type","../utils/object-utils","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    "use strict";
    var BlockModel = __dependency1__["default"];
    var Type = __dependency2__.Type;
    var inherit = __dependency3__.inherit;

    /**
     * @class TextModel
     * @constructor
     * @extends BlockModel
     * A simple BlockModel subclass representing a paragraph of text
     */
    function TextModel(options) {
      options = options || {};
      options.type = Type.TEXT.id;
      options.type_name = Type.TEXT.name;
      BlockModel.call(this, options);
    }
    inherit(TextModel, BlockModel);

    __exports__["default"] = TextModel;
  });
define("renderers/embed-renderer",
  ["exports"],
  function(__exports__) {
    "use strict";
    /**
     * Embed Service Adapters
     */
    var RegExVideoId = /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
    function getVideoIdFromUrl(url) {
      var match = url.match(RegExVideoId);
      if (match && match[1].length === 11){
        return match[1];
      }
      return null;
    }

    function YoutubeAdapter() {}
    YoutubeAdapter.prototype.render = function(model) {
      var videoId = getVideoIdFromUrl(model.attributes.url);
      var embedUrl = 'http://www.youtube.com/embed/' + videoId + '?controls=2&color=white&theme=light';
      return '<iframe width="100%" height="400" frameborder="0" allowfullscreen src="' + embedUrl + '"></iframe>';
    };


    /**
     * @class EmbedRenderer
     * @constructor
     */
    function EmbedRenderer() {}

    /**
     * @method render
     * @param model
     * @return String html
     */
    EmbedRenderer.prototype.render = function(model) {
      var adapter = this.adatperFor(model);
      if (adapter) {
        return adapter.render(model);
      }

      return model.attributes.provider_name + ': ' + model.attributes.title + '<img src="' + model.attributes.thumbnail + '"/>';
    };

    EmbedRenderer.prototype.adatperFor = function(model) {
      var providerId = model.attributes.provider_id;
      switch(providerId) {
        case 1:
          return new YoutubeAdapter();
      }
    };

    __exports__["default"] = EmbedRenderer;
  });
define("renderers/html-renderer",
  ["../types/default-types","../utils/object-utils","../utils/string-utils","../utils/array-utils","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
    "use strict";
    var DefaultBlockTypeSet = __dependency1__.DefaultBlockTypeSet;
    var DefaultMarkupTypeSet = __dependency1__.DefaultMarkupTypeSet;
    var merge = __dependency2__.merge;
    var injectIntoString = __dependency3__.injectIntoString;
    var sumSparseArray = __dependency4__.sumSparseArray;

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
     * @class HTMLRenderer
     * @constructor
     */
    function HTMLRenderer(options) {
      var defaults = {
        blockTypes    : DefaultBlockTypeSet,
        markupTypes   : DefaultMarkupTypeSet
      };
      merge(this, defaults, options);
    }

    /**
     * @method willRenderType
     * @param type instance of Type
     * @param renderer the rendering function that returns a string of html
     * Registers custom rendering hooks for a type
     */
    var renderHooks = {};
    HTMLRenderer.prototype.willRenderType = function(type, renderer) {
      renderHooks[type.id] = renderer;
    };

    /**
     * @method render
     * @param data
     * @return String html
     */
    HTMLRenderer.prototype.render = function(data) {
      var html = '',
          len = data && data.length,
          i, block, type, blockHtml;

      for (i = 0; i < len; i++) {
        block = data[i];
        type = this.blockTypes.findById(block.type);
        blockHtml = this.renderBlock(block);
        if (blockHtml) { html += blockHtml; }
      }
      return html;
    };

    /**
     * @method renderBlock
     * @param block a block model
     * @return String html
     * Renders a block model into a HTML string.
     */
    HTMLRenderer.prototype.renderBlock = function(block) {
      var typeId = block.type;
      var type = this.blockTypes.findById(typeId);
      var hook = renderHooks[typeId];

      if (hook) {
        return hook.call(type, block);
      }

      var html = '', tagName, selfClosing;

      if (type) {
        tagName = type.tag;
        selfClosing = type.selfClosing;
        if (tagName) {
          html += createOpeningTag(tagName, block.attributes, selfClosing);
        }
        if (!selfClosing) {
          html += this.renderMarkup(block.value, block.markup);
          if (tagName) {
            html += createCloseTag(tagName);
          }
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
    HTMLRenderer.prototype.renderMarkup = function(text, markups) {
      var parsedTagsIndexes = [],
          len = markups && markups.length, i;

      for (i = 0; i < len; i++) {
        var markup = markups[i],
            markupMeta = this.markupTypes.findById(markup.type),
            tagName = markupMeta.tag,
            selfClosing = markupMeta.selfClosing,
            start = markup.start,
            end = markup.end,
            openTag = createOpeningTag(tagName, markup.attributes, selfClosing),
            parsedTagLengthAtIndex = parsedTagsIndexes[start] || 0,
            parsedTagLengthBeforeIndex = sumSparseArray(parsedTagsIndexes.slice(0, start + 1));

        text = injectIntoString(text, openTag, start + parsedTagLengthBeforeIndex);
        parsedTagsIndexes[start] = parsedTagLengthAtIndex + openTag.length;

        if (!selfClosing) {
          var closeTag = createCloseTag(tagName);
          parsedTagLengthAtIndex = parsedTagsIndexes[end] || 0;
          parsedTagLengthBeforeIndex = sumSparseArray(parsedTagsIndexes.slice(0, end));
          text = injectIntoString(text, closeTag, end + parsedTagLengthBeforeIndex);
          parsedTagsIndexes[end]  = parsedTagLengthAtIndex + closeTag.length;
        }
      }

      return text;
    };

    __exports__["default"] = HTMLRenderer;
  });
define("types/default-types",
  ["./type-set","./type","../renderers/embed-renderer","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    "use strict";
    var TypeSet = __dependency1__["default"];
    var Type = __dependency2__["default"];
    var EmbedRenderer = __dependency3__["default"];

    /**
     * Default supported block types
     */
    var DefaultBlockTypeSet = new TypeSet([
      new Type({ tag: 'p', name: 'text' }),
      new Type({ tag: 'h2', name: 'heading' }),
      new Type({ tag: 'h3', name: 'subheading' }),
      new Type({ tag: 'img', name: 'image' }),
      new Type({ tag: 'blockquote', name: 'quote' }),
      new Type({ tag: 'ul', name: 'list' }),
      new Type({ tag: 'ol', name: 'ordered list' }),
      new Type({ name: 'embed', renderer: new EmbedRenderer() }),
      new Type({ name: 'group', renderer: null })
    ]);

    /**
     * Default supported markup types
     */
    var DefaultMarkupTypeSet = new TypeSet([
      new Type({ tag: 'b', name: 'bold' }),
      new Type({ tag: 'i', name: 'italic' }),
      new Type({ tag: 'u', name: 'underline' }),
      new Type({ tag: 'a', name: 'link' }),
      new Type({ tag: 'br', name: 'break' }),
      new Type({ tag: 'li', name: 'list item' }),
      new Type({ tag: 'sub', name: 'subscript' }),
      new Type({ tag: 'sup', name: 'superscript' })
    ]);

    /**
     * Registers public static constants for 
     * default types on the `Type` class
     */
    function registerTypeConstants(typeset) {
      var typeDict = typeset.idLookup, type, i;
      for (i in typeDict) {
        if (typeDict.hasOwnProperty(i)) {
          type = typeDict[i];
          Type[type.name] = type;
        }
      }
    }

    registerTypeConstants(DefaultBlockTypeSet);
    registerTypeConstants(DefaultMarkupTypeSet);

    __exports__.DefaultBlockTypeSet = DefaultBlockTypeSet;
    __exports__.DefaultMarkupTypeSet = DefaultMarkupTypeSet;
  });
define("types/type-set",
  ["exports"],
  function(__exports__) {
    "use strict";
    /**
     * @class TypeSet
     * @private
     * @constructor
     * A Set of Types
     */
    function TypeSet(types) {
      var len = types && types.length, i;

      this._autoId    = 1;  // Auto-increment id counter
      this.idLookup   = {}; // Hash cache for finding by id
      this.tagLookup  = {}; // Hash cache for finding by tag

      for (i = 0; i < len; i++) {
        this.addType(types[i]);
      }
    }

    TypeSet.prototype = {
      /**
       * Adds a type to the set
       */
      addType: function(type) {
        this[type.name] = type;
        if (type.id === undefined) {
          type.id = this._autoId++;
        }
        this.idLookup[type.id] = type;
        if (type.tag) {
          this.tagLookup[type.tag] = type;
        }
        return type;
      },

      /**
       * Returns type info for a given Node
       */
      findByNode: function(node) {
        return this.findByTag(node.tagName);
      },
      /**
       * Returns type info for a given tag
       */
      findByTag: function(tag) {
        return this.tagLookup[tag.toLowerCase()];
      },
      /**
       * Returns type info for a given id
       */
      findById: function(id) {
        return this.idLookup[id];
      }
    };

    __exports__["default"] = TypeSet;
  });
define("types/type",
  ["../utils/string-utils","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var underscore = __dependency1__.underscore;

    /**
     * @class Type
     * @constructor
     * Contains meta info about a node type (id, name, tag, etc).
     */
    function Type(options) {
      if (options) {
        this.name = underscore(options.name || options.tag).toUpperCase();
        if (options.id !== undefined) {
          this.id = options.id;
        }
        if (options.tag) {
          this.tag = options.tag.toLowerCase();
          this.selfClosing = /^(br|img|hr|meta|link|embed)$/i.test(this.tag);
        }
        if (options.renderer) {
          this.renderer = options.renderer;
        }
      }
    }

    __exports__["default"] = Type;
  });
define("parsers/html-parser",
  ["../models/block","../models/markup","../types/default-types","../utils/object-utils","../utils/array-utils","../utils/string-utils","../utils/node-utils","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __dependency7__, __exports__) {
    "use strict";
    var BlockModel = __dependency1__["default"];
    var MarkupModel = __dependency2__["default"];
    var DefaultBlockTypeSet = __dependency3__.DefaultBlockTypeSet;
    var DefaultMarkupTypeSet = __dependency3__.DefaultMarkupTypeSet;
    var merge = __dependency4__.merge;
    var toArray = __dependency5__.toArray;
    var trim = __dependency6__.trim;
    var trimLeft = __dependency6__.trimLeft;
    var sanitizeWhitespace = __dependency6__.sanitizeWhitespace;
    var createElement = __dependency7__.createElement;
    var DOMParsingNode = __dependency7__.DOMParsingNode;
    var textOfNode = __dependency7__.textOfNode;
    var unwrapNode = __dependency7__.unwrapNode;
    var attributesForNode = __dependency7__.attributesForNode;

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
      merge(this, defaults, options);
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

      // Clone the node since iteration is recursive
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
            attributes : attributesForNode(node)
          });
        }
      }
    };

    __exports__["default"] = HTMLParser;
  });
define("utils/array-utils",
  ["exports"],
  function(__exports__) {
    "use strict";
    /**
     * Converts an array-like object (i.e. NodeList) to Array
     * Note: could just use Array.prototype.slice but does not work in IE <= 8
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
     * Computes the sum of values in a (sparse) array
     */
    function sumSparseArray(array) {
      var sum = 0, i;
      for (i in array) { // 'for in' best for sparse arrays
        if (array.hasOwnProperty(i)) {
          sum += array[i];
        }
      }
      return sum;
    }

    __exports__.toArray = toArray;
    __exports__.sumSparseArray = sumSparseArray;
  });
define("utils/node-utils",
  ["./string-utils","./array-utils","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var sanitizeWhitespace = __dependency1__.sanitizeWhitespace;
    var toArray = __dependency2__.toArray;

    /**
     * A document instance separate from the page's document. (if browser supports it)
     * Prevents images, scripts, and styles from executing while parsing nodes.
     */
    var standaloneDocument = (function() {
      var implementation = document.implementation,
          createHTMLDocument = implementation.createHTMLDocument;
      if (createHTMLDocument) {
        return createHTMLDocument.call(implementation, '');
      }
      return document;
    })();

    /**
     * document.createElement with our lean, standalone document
     */
    function createElement(type) {
      return standaloneDocument.createElement(type);
    }

    /**
     * A reusable DOM Node for parsing html content.
     */
    var DOMParsingNode = createElement('div');

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

    __exports__.createElement = createElement;
    __exports__.DOMParsingNode = DOMParsingNode;
    __exports__.textOfNode = textOfNode;
    __exports__.unwrapNode = unwrapNode;
    __exports__.attributesForNode = attributesForNode;
  });
define("utils/object-utils",
  ["exports"],
  function(__exports__) {
    "use strict";
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

    __exports__.merge = merge;
    __exports__.inherit = inherit;
  });
define("utils/string-utils",
  ["exports"],
  function(__exports__) {
    "use strict";
    var RegExpTrim        = /^\s+|\s+$/g;
    var RegExpTrimLeft    = /^\s+/;
    var RegExpWSChars     = /(\r\n|\n|\r|\t|\u00A0)/gm;
    var RegExpMultiWS     = /\s+/g;

    /**
     * String.prototype.trim polyfill
     * Removes whitespace at beginning and end of string
     */
    function trim(string) {
      return string ? (string + '').replace(RegExpTrim, '') : '';
    }

    /**
     * String.prototype.trimLeft polyfill
     * Removes whitespace at beginning of string
     */
    function trimLeft(string) {
      return string ? (string + '').replace(RegExpTrimLeft, '') : '';
    }

    /**
     * Replaces non-alphanumeric chars with underscores
     */
    function underscore(string) {
      return string ? (string + '').replace(/ /g, '_') : '';
    }

    /**
     * Cleans line breaks, tabs, non-breaking spaces, then multiple occuring whitespaces.
     */
    function sanitizeWhitespace(string) {
      return string ? (string + '').replace(RegExpWSChars, '').replace(RegExpMultiWS, ' ') : '';
    }

    /**
     * Injects a string into another string at the index specified
     */
    function injectIntoString(string, injection, index) {
      return string.substr(0, index) + injection + string.substr(index);
    }

    __exports__.trim = trim;
    __exports__.trimLeft = trimLeft;
    __exports__.underscore = underscore;
    __exports__.sanitizeWhitespace = sanitizeWhitespace;
    __exports__.injectIntoString = injectIntoString;
  });
}(this, document, define));
