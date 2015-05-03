/**
 * @overview content-kit-editor: A modern, minimalist WYSIWYG editor.
 * @version  0.1.3
 * @author   Garth Poitras <garth22@gmail.com> (http://garthpoitras.com/)
 * @license  MIT
 */

(function(window, document, undefined) {

  var RegExpTrim        = /^\s+|\s+$/g;
  var RegExpTrimLeft    = /^\s+/;
  var RegExpWSChars     = /(\r\n|\n|\r|\t)/gm;
  var RegExpMultiWS     = /\s+/g;
  var RegExpNonAlphaNum = /[^a-zA-Z\d]/g;

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
    return string ? trim(string + '').replace(RegExpNonAlphaNum, '_') : '';
  }

  /**
   * Cleans line breaks, tabs, then multiple occuring whitespaces.
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

  function Type(options) {
    if (options) {
      this.name = underscore(options.name || options.tag).toUpperCase();
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
      Type[this.name] = this;
    }
  }

  var types_type = Type;

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

  /**
   * @method createWithType
   * @static
   * @param type Type
   * @param options Object
   */
  Model.createWithType = function(type, options) {
    options = options || {};
    options.type = type.id;
    options.type_name = type.name;
    return new this(options);
  };

  var models_model = Model;

  /**
   * Merges defaults/options into an Object
   * Useful for constructors
   */
  function mergeWithOptions(original, updates, options) {
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
  function merge(original, updates) {
    return mergeWithOptions(original, updates);
  }

  /**
   * Prototype inheritance helper
   */
  function inherit(Subclass, Superclass) {
    for (var key in Superclass) {
      if (Superclass.hasOwnProperty(key)) {
        Subclass[key] = Superclass[key];
      }
    }
    Subclass.prototype = new Superclass();
    Subclass.constructor = Subclass;
    Subclass._super = Superclass;
  }

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
    models_model.call(this, options);
    this.value = options.value || '';
    this.markup = sortBlockMarkups(options.markup || []);
  }

  inherit(BlockModel, models_model);

  var models_block = BlockModel;

  function EmbedModel(options) {
    if (!options) { return null; }

    models_model.call(this, {
      type: types_type.EMBED.id,
      type_name: types_type.EMBED.name,
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

  var embed = EmbedModel;

  /**
   * Abstracted `document` between node.js and browser
  */

  var doc;

  if (typeof exports === 'object') {
    var jsdom = require('jsdom').jsdom;
    doc = jsdom();
  } else {
    // A document instance separate from the html page document. (if browser supports it)
    // Prevents images, scripts, and styles from executing while parsing
    var implementation = document.implementation;
    var createHTMLDocument = implementation.createHTMLDocument;
    if (createHTMLDocument) {
      doc = createHTMLDocument.call(implementation, '');
    } else {
      doc = document;
    }
  }

  var parserDocument = doc;

  function MarkupModel(options) {
    options = options || {};
    models_model.call(this, options);
    this.start = options.start || 0;
    this.end = options.end || 0;
  }

  inherit(MarkupModel, models_model);

  var models_markup = MarkupModel;

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
      if (type instanceof types_type) {
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

  var type_set = TypeSet;

  var DefaultBlockTypeSet = new type_set([
    new types_type({ tag: 'p', name: 'paragraph' }),
    new types_type({ tag: 'h2', name: 'heading' }),
    new types_type({ tag: 'h3', name: 'subheading' }),
    new types_type({ tag: 'img', name: 'image', isTextType: false }),
    new types_type({ tag: 'blockquote', name: 'quote' }),
    new types_type({ tag: 'ul', name: 'list' }),
    new types_type({ tag: 'ol', name: 'ordered list' }),
    new types_type({ name: 'embed', isTextType: false })
  ]);

  /**
   * Default supported markup types
   */
  var DefaultMarkupTypeSet = new type_set([
    new types_type({ tag: 'strong', name: 'bold', mappedTags: ['b'] }),
    new types_type({ tag: 'em', name: 'italic', mappedTags: ['i'] }),
    new types_type({ tag: 'u', name: 'underline' }),
    new types_type({ tag: 'a', name: 'link' }),
    new types_type({ tag: 'br', name: 'break' }),
    new types_type({ tag: 'li', name: 'list item' }),
    new types_type({ tag: 'sub', name: 'subscript' }),
    new types_type({ tag: 'sup', name: 'superscript' })
  ]);

  /**
   * Converts an array-like object (i.e. NodeList) to Array
   * Note: could just use Array.prototype.slice but does not work in IE <= 8
   */
  function toArray(obj) {
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
  function sumSparseArray(array) {
    var sum = 0, i;
    for (i in array) { // 'for in' is better for sparse arrays
      if (array.hasOwnProperty(i)) {
        sum += array[i];
      }
    }
    return sum;
  }

  function textOfNode(node) {
    var text = node.textContent || node.innerText;
    return text ? sanitizeWhitespace(text) : '';
  }

  /**
   * Replaces a `Node` with its children
   */
  function unwrapNode(node) {
    if (node.hasChildNodes()) {
      var children = toArray(node.childNodes);
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
  function attributesForNode(node, blacklist) {
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

  var ELEMENT_NODE = 1;
  var TEXT_NODE    = 3;
  var defaultAttributeBlacklist = { 'style' : 1, 'class' : 1 };

  /**
   * Returns the last block in the set or creates a default block if none exist yet.
   */
  function getLastBlockOrCreate(blocks) {
    var blockCount = blocks.length, block;
    if (blockCount) {
      block = blocks[blockCount - 1];
    } else {
      block = models_block.createWithType(types_type.PARAGRAPH);
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
    var parsingNode = parserDocument.createElement('div');
    parsingNode.innerHTML = sanitizeWhitespace(html);

    var nodes = toArray(parsingNode.childNodes);
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
      return new models_block({
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
        return new models_markup({
          type       : type.id,
          type_name  : this.includeTypeNames && type.name,
          start      : startIndex,
          end        : endIndex,
          attributes : attributesForNode(node, this.attributeBlacklist)
        });
      }
    }
  };

  var html_parser = HTMLParser;

  function createOpeningTag(tagName, attributes, selfClosing) {
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
  function createCloseTag(tagName) {
    return '</' + tagName + '>';
  }

  /**
   * @class HTMLElementRenderer
   * @constructor
   */
  function HTMLElementRenderer(options) {
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
  HTMLElementRenderer.prototype.render = function(model) {
    var html = '';
    var type = this.type;
    var tagName = type.tag;
    var selfClosing = type.selfClosing;

    if (tagName) {
      html += createOpeningTag(tagName, model.attributes, selfClosing);
    }
    if (!selfClosing) {
      html += this.renderMarkup(model.value, model.markup);
      if (tagName) {
        html += createCloseTag(tagName);
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
  HTMLElementRenderer.prototype.renderMarkup = function(text, markups) {
    var parsedTagsIndexes = [];
    var len = markups && markups.length, i;

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

  var html_element_renderer = HTMLElementRenderer;

  /**
   * @class HTMLEmbedRenderer
   * @constructor
   */
  function HTMLEmbedRenderer() {}

  /**
   * @method render
   * @param model a block model
   * @return String html
   */
  HTMLEmbedRenderer.prototype.render = function(model) {
    var attrs = model.attributes;
    return attrs && attrs.html || '';
  };

  var html_embed_renderer = HTMLEmbedRenderer;

  function HTMLRenderer(options) {
    var defaults = {
      blockTypes    : DefaultBlockTypeSet,
      markupTypes   : DefaultMarkupTypeSet,
      typeRenderers : {}
    };
    mergeWithOptions(this, defaults, options);
  }

  /**
   * @method rendererFor
   * @param block
   * @returns renderer
   * Returns an instance of a renderer for supplied block model
   */
  HTMLRenderer.prototype.rendererFor = function(block) {
    var type = this.blockTypes.findById(block.type);
    if (type === types_type.EMBED) {
      return new html_embed_renderer();
    }
    return new html_element_renderer({ type: type, markupTypes: this.markupTypes });
  };

  /**
   * @method render
   * @param model
   * @return String html
   */
  HTMLRenderer.prototype.render = function(model) {
    var html = '';
    var len = model && model.length;
    var i, blockHtml;

    for (i = 0; i < len; i++) {
      blockHtml = this.renderBlock(model[i]);
      if (blockHtml) { 
        html += blockHtml;
      }
    }

    return html;
  };

  /**
   * @method renderBlock
   * @param block
   * @return String html
   */
  HTMLRenderer.prototype.renderBlock = function(block) {
    var renderer = this.rendererFor(block);
    var renderHook = this.typeRenderers[block.type];
    return renderHook ? renderHook.call(renderer, block) : renderer.render(block);
  };

  var html_renderer = HTMLRenderer;

  function Compiler(options) {
    var parser = new html_parser();
    var renderer = new html_renderer();
    var defaults = {
      parser           : parser,
      renderer         : renderer,
      blockTypes       : DefaultBlockTypeSet,
      markupTypes      : DefaultMarkupTypeSet,
      includeTypeNames : false // Outputs `type_name:'HEADING'` etc. when parsing. Good for debugging.
    };
    mergeWithOptions(this, defaults, options);

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
  Compiler.prototype.parse = function(input) {
    return this.parser.parse(input);
  };

  /**
   * @method render
   * @param model
   * @return String
   */
  Compiler.prototype.render = function(model) {
    return this.renderer.render(model);
  };

  /**
   * @method rerender
   * @param input
   * @return String
   */
  Compiler.prototype.rerender = function(input) {
    return this.render(this.parse(input));
  };

  /**
   * @method reparse
   * @param model
   * @return String
   */
  Compiler.prototype.reparse = function(model) {
    return this.parse(this.render(model));
  };

  /**
   * @method registerBlockType
   * @param {Type} type
   */
  Compiler.prototype.registerBlockType = function(type) {
    return this.blockTypes.addType(type);
  };

  /**
   * @method registerMarkupType
   * @param {Type} type
   */
  Compiler.prototype.registerMarkupType = function(type) {
    return this.markupTypes.addType(type);
  };

  var compiler = Compiler;

  var RegExVideoId = /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;

  function getVideoIdFromUrl(url) {
    var match = url && url.match(RegExVideoId);
    if (match && match[1].length === 11){
      return match[1];
    }
    return null;
  }

  function YouTubeRenderer() {}
  YouTubeRenderer.prototype.render = function(model) {
    var videoId = getVideoIdFromUrl(model.attributes.url);
    var embedUrl = 'http://www.youtube.com/embed/' + videoId + '?controls=2&showinfo=0&color=white&theme=light';
    return '<iframe width="100%" height="400" frameborder="0" allowfullscreen src="' + embedUrl + '"></iframe>';
  };

  var youtube = YouTubeRenderer;

  function TwitterRenderer() {}
  TwitterRenderer.prototype.render = function(model) {
    return '<blockquote class="twitter-tweet"><a href="' + model.attributes.url + '"></a></blockquote>';
  };

  var twitter = TwitterRenderer;

  function InstagramRenderer() {}
  InstagramRenderer.prototype.render = function(model) {
    return '<img src="' + model.attributes.url + '"/>';
  };

  var instagram = InstagramRenderer;

  function LinkImageRenderer() {}
  LinkImageRenderer.prototype.render = function(model) {
    return '<a href="' + model.attributes.url + '" target="_blank"><img src="' + model.attributes.thumbnail + '"/></a>';
  };

  var link_image_renderer = LinkImageRenderer;

  var embedRenderers = {
    YOUTUBE    : new youtube(),
    TWITTER    : new twitter(),
    INSTAGRAM  : new instagram(),
    LINK_IMAGE : new link_image_renderer()
  };

  function embedRenderer(model) {
    var embedAttrs = model.attributes;
    var embedType = embedAttrs.embed_type;
    var isVideo = embedType === 'video';
    var providerName = embedAttrs.provider_name;
    var customRendererId = providerName && providerName.toUpperCase();
    var customRenderer = embedRenderers[customRendererId];
    if (!customRenderer && embedType === 'link' && embedAttrs.thumbnail) {
      customRenderer = embedRenderers.LINK_IMAGE;
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

  function imageRenderer(model) {
    return '<div class="ck-embed ck-image-embed" data-embed=1 contenteditable="false">' +
              '<figure>' + this.render(model) + '</figure>' +
            '</div>';
  }

  var typeRenderers = {};
  typeRenderers[types_type.EMBED.id] = embedRenderer;
  typeRenderers[types_type.IMAGE.id] = imageRenderer;

  /**
   * @class EditorHTMLRenderer
   * @constructor
   * Subclass of HTMLRenderer specifically for the Editor
   * Wraps interactive elements to add functionality
   */
  function EditorHTMLRenderer() {
    html_renderer.call(this, {
      typeRenderers: typeRenderers
    });
  }
  inherit(EditorHTMLRenderer, html_renderer);

  var editor_html_renderer = EditorHTMLRenderer;

  function renderClasses(view) {
    var classNames = view.classNames;
    if (classNames && classNames.length) {
      view.element.className = classNames.join(' ');
    } else if(view.element.className) {
      view.element.removeAttribute('className');
    }
  }

  function View(options) {
    options = options || {};
    this.tagName = options.tagName || 'div';
    this.classNames = options.classNames || [];
    this.element = document.createElement(this.tagName);
    this.container = options.container || document.body;
    this.isShowing = false;
    renderClasses(this);
  }

  View.prototype = {
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
        renderClasses(this);
      }
    },
    removeClass: function(className) {
      var index = this.classNames && this.classNames.indexOf(className);
      if (index > -1) {
        this.classNames.splice(index, 1);
        renderClasses(this);
      }
    },
    setClasses: function(classNameArr) {
      this.classNames = classNameArr;
      renderClasses(this);
    }
  };

  var views_view = View;

  var buttonClassName = 'ck-toolbar-btn';

  function ToolbarButton(options) {
    var button = this;
    var toolbar = options.toolbar;
    var command = options.command;
    var prompt = command.prompt;
    var element = document.createElement('button');

    button.element = element;
    button.command = command;
    button.isActive = false;

    element.title = command.name;
    element.className = buttonClassName;
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

  ToolbarButton.prototype = {
    setActive: function() {
      var button = this;
      if (!button.isActive) {
        button.element.className = buttonClassName + ' active';
        button.isActive = true;
      }
    },
    setInactive: function() {
      var button = this;
      if (button.isActive) {
        button.element.className = buttonClassName;
        button.isActive = false;
      }
    }
  };

  var toolbar_button = ToolbarButton;

  function createDiv(className) {
    var div = document.createElement('div');
    if (className) {
      div.className = className;
    }
    return div;
  }

  function hideElement(element) {
    element.style.display = 'none';
  }

  function showElement(element) {
    element.style.display = 'block';
  }

  function swapElements(elementToShow, elementToHide) {
    hideElement(elementToHide);
    showElement(elementToShow);
  }

  function getEventTargetMatchingTag(tag, target, container) {
    // Traverses up DOM from an event target to find the node matching specifed tag
    while (target && target !== container) {
      if (target.tagName.toLowerCase() === tag) {
        return target;
      }
      target = target.parentNode;
    }
  }

  function nodeIsDescendantOfElement(node, element) {
    var parentNode = node.parentNode;
    while(parentNode) {
      if (parentNode === element) {
        return true;
      }
      parentNode = parentNode.parentNode;
    }
    return false;
  }

  function elementContentIsEmpty(element) {
    var content = element && element.innerHTML;
    if (content) {
      return content === '' || content === '<br>';
    }
    return false;
  }

  function getElementRelativeOffset(element) {
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

  function getElementComputedStyleNumericProp(element, prop) {
    return parseFloat(window.getComputedStyle(element)[prop]);
  }

  function positionElementToRect(element, rect, topOffset, leftOffset) {
    var relativeOffset = getElementRelativeOffset(element);
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

  function positionElementHorizontallyCenteredToRect(element, rect, topOffset) {
    var horizontalCenter = (element.offsetWidth / 2) - (rect.width / 2);
    return positionElementToRect(element, rect, topOffset, horizontalCenter);
  }

  function positionElementCenteredAbove(element, aboveElement) {
    var elementMargin = getElementComputedStyleNumericProp(element, 'marginBottom');
    return positionElementHorizontallyCenteredToRect(element, aboveElement.getBoundingClientRect(), element.offsetHeight + elementMargin);
  }

  function positionElementCenteredBelow(element, belowElement) {
    var elementMargin = getElementComputedStyleNumericProp(element, 'marginTop');
    return positionElementHorizontallyCenteredToRect(element, belowElement.getBoundingClientRect(), -element.offsetHeight - elementMargin);
  }

  function positionElementCenteredIn(element, inElement) {
    var verticalCenter = (inElement.offsetHeight / 2) - (element.offsetHeight / 2);
    return positionElementHorizontallyCenteredToRect(element, inElement.getBoundingClientRect(), -verticalCenter);
  }

  function positionElementToLeftOf(element, leftOfElement) {
    var verticalCenter = (leftOfElement.offsetHeight / 2) - (element.offsetHeight / 2);
    var elementMargin = getElementComputedStyleNumericProp(element, 'marginRight');
    return positionElementToRect(element, leftOfElement.getBoundingClientRect(), -verticalCenter, element.offsetWidth + elementMargin);
  }

  function positionElementToRightOf(element, rightOfElement) {
    var verticalCenter = (rightOfElement.offsetHeight / 2) - (element.offsetHeight / 2);
    var elementMargin = getElementComputedStyleNumericProp(element, 'marginLeft');
    var rightOfElementRect = rightOfElement.getBoundingClientRect();
    return positionElementToRect(element, rightOfElementRect, -verticalCenter, -rightOfElement.offsetWidth - elementMargin);
  }

  var RootTags = [
    types_type.PARAGRAPH.tag,
    types_type.HEADING.tag,
    types_type.SUBHEADING.tag,
    types_type.QUOTE.tag,
    types_type.LIST.tag,
    types_type.ORDERED_LIST.tag
  ];

  var SelectionDirection = {
    LEFT_TO_RIGHT : 1,
    RIGHT_TO_LEFT : 2,
    SAME_NODE     : 3
  };

  function getDirectionOfSelection(selection) {
    var node = selection.anchorNode;
    var position = node && node.compareDocumentPosition(selection.focusNode);
    if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
      return SelectionDirection.LEFT_TO_RIGHT;
    } else if (position & Node.DOCUMENT_POSITION_PRECEDING) {
      return SelectionDirection.RIGHT_TO_LEFT;
    }
    return SelectionDirection.SAME_NODE;
  }

  function getSelectionElement(selection) {
    selection = selection || window.getSelection();
    var node = getDirectionOfSelection(selection) === SelectionDirection.LEFT_TO_RIGHT ? selection.anchorNode : selection.focusNode;
    return node && (node.nodeType === 3 ? node.parentNode : node);
  }

  function getSelectionBlockElement(selection) {
    selection = selection || window.getSelection();
    var element = getSelectionElement();
    var tag = element && element.tagName.toLowerCase();
    while (tag && RootTags.indexOf(tag) === -1) {
      if (element.contentEditable === 'true') {
        return null; // Stop traversing up dom when hitting an editor element
      }
      element = element.parentNode;
      tag = element.tagName && element.tagName.toLowerCase();
    }
    return element;
  }

  function getSelectionTagName() {
    var element = getSelectionElement();
    return element ? element.tagName.toLowerCase() : null;
  }

  function getSelectionBlockTagName() {
    var element = getSelectionBlockElement();
    return element ? element.tagName && element.tagName.toLowerCase() : null;
  }

  function tagsInSelection(selection) {
    var element = getSelectionElement(selection);
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

  function selectionIsInElement(selection, element) {
    var node = selection.anchorNode;
    return node && nodeIsDescendantOfElement(node, element);
  }

  function selectionIsEditable(selection) {
    var el = getSelectionBlockElement(selection);
    return el && el.isContentEditable;
  }

  function restoreRange(range) {
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function selectNode(node) {
    var range = document.createRange();
    var selection = window.getSelection();
    range.setStart(node, 0);
    range.setEnd(node, node.length);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function setCursorIndexInElement(element, index) {
    var range = document.createRange();
    var selection = window.getSelection();
    range.setStart(element, index);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function setCursorToStartOfElement(element) {
    setCursorIndexInElement(element, 0);
  }

  function getCursorOffsetInElement(element) {
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

  var ToolbarDirection = {
    TOP   : 1,
    RIGHT : 2
  };

  function selectionContainsButtonsTag(selectedTags, buttonsTags) {
    return selectedTags.filter(function(tag) {
      return buttonsTags.indexOf(tag) > -1;
    }).length;
  }

  function updateButtonsForSelection(buttons, selection) {
    var selectedTags = tagsInSelection(selection);
    var len = buttons.length;
    var i, button;

    for (i = 0; i < len; i++) {
      button = buttons[i];
      if (selectionContainsButtonsTag(selectedTags, button.command.mappedTags)) {
        button.setActive();
      } else {
        button.setInactive();
      }
    }
  }

  function Toolbar(options) {
    options = options || {};
    var toolbar = this;
    var commands = options.commands;
    var commandCount = commands && commands.length, i;
    options.classNames = ['ck-toolbar'];
    views_view.call(toolbar, options);

    toolbar.setSticky(options.sticky || false);
    toolbar.setDirection(options.direction || ToolbarDirection.TOP);
    toolbar.editor = options.editor || null;
    toolbar.embedIntent = options.embedIntent || null;
    toolbar.activePrompt = null;
    toolbar.buttons = [];

    toolbar.contentElement = createDiv('ck-toolbar-content');
    toolbar.promptContainerElement = createDiv('ck-toolbar-prompt');
    toolbar.buttonContainerElement = createDiv('ck-toolbar-buttons');
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
  inherit(Toolbar, views_view);

  Toolbar.prototype.hide = function() {
    if (Toolbar._super.prototype.hide.call(this)) {
      var style = this.element.style;
      style.left = '';
      style.top = '';
      this.dismissPrompt();
    }
  };

  Toolbar.prototype.addCommand = function(command) {
    command.editorContext = this.editor;
    command.embedIntent = this.embedIntent;
    var button = new toolbar_button({ command: command, toolbar: this });
    this.buttons.push(button);
    this.buttonContainerElement.appendChild(button.element);
  };

  Toolbar.prototype.displayPrompt = function(prompt) {
    var toolbar = this;
    swapElements(toolbar.promptContainerElement, toolbar.buttonContainerElement);
    toolbar.promptContainerElement.appendChild(prompt.element);
    prompt.show(function() {
      toolbar.dismissPrompt();
      toolbar.updateForSelection();
    });
    toolbar.activePrompt = prompt;
  };

  Toolbar.prototype.dismissPrompt = function() {
    var toolbar = this;
    var activePrompt = toolbar.activePrompt;
    if (activePrompt) {
      activePrompt.hide();
      swapElements(toolbar.buttonContainerElement, toolbar.promptContainerElement);
      toolbar.activePrompt = null;
    }
  };

  Toolbar.prototype.updateForSelection = function(selection) {
    var toolbar = this;
    selection = selection || window.getSelection();
    if (toolbar.sticky) {
      updateButtonsForSelection(toolbar.buttons, selection);
    } else if (!selection.isCollapsed) {
      toolbar.positionToContent(selection.getRangeAt(0));
      updateButtonsForSelection(toolbar.buttons, selection);
    }
  };

  Toolbar.prototype.positionToContent = function(content) {
    var directions = ToolbarDirection;
    var positioningMethod, position, sideEdgeOffset;
    switch(this.direction) {
      case directions.RIGHT:
        positioningMethod = positionElementToRightOf;
        break;
      default:
        positioningMethod = positionElementCenteredAbove;
    }
    position = positioningMethod(this.element, content);
    sideEdgeOffset = Math.min(Math.max(10, position.left), document.body.clientWidth - this.element.offsetWidth - 10);
    this.contentElement.style.transform = 'translateX(' + (sideEdgeOffset - position.left) + 'px)';
  };

  Toolbar.prototype.setDirection = function(direction) {
    this.direction = direction;
    if (direction === ToolbarDirection.RIGHT) {
      this.addClass('right');
    } else {
      this.removeClass('right');
    }
  };

  Toolbar.prototype.setSticky = function(sticky) {
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

  Toolbar.prototype.toggleSticky = function() {
    this.setSticky(!this.sticky);
  };

  Toolbar.Direction = ToolbarDirection;

  var views_toolbar = Toolbar;

  var Keycodes = {
    BKSP  : 8,
    ENTER : 13,
    ESC   : 27,
    DEL   : 46,
    M     : 77
  };

  function selectionIsEditableByToolbar(selection, toolbar) {
    return selectionIsEditable(selection) && selectionIsInElement(selection, toolbar.rootElement);
  }

  function handleTextSelection(toolbar) {
    var selection = window.getSelection();
    if (toolbar.sticky) {
      toolbar.updateForSelection(selectionIsEditableByToolbar(selection, toolbar) ? selection : null);
    } else {
      if (selection.isCollapsed || selection.toString().trim() === '' || !selectionIsEditableByToolbar(selection, toolbar)) {
        toolbar.hide();
      } else {
        toolbar.show();
        toolbar.updateForSelection(selection);
      }
    }
  }

  function TextFormatToolbar(options) {
    var toolbar = this;
    views_toolbar.call(this, options);
    toolbar.rootElement = options.rootElement;
    toolbar.rootElement.addEventListener('keyup', function() { handleTextSelection(toolbar); });

    document.addEventListener('mouseup', function() {
      setTimeout(function() {
        handleTextSelection(toolbar);
      });
    });

    document.addEventListener('keyup', function(e) {
      var key = e.keyCode;
      if (key === 116) { //F5
        toolbar.toggleSticky();
        handleTextSelection(toolbar);
      } else if (!toolbar.sticky && key === Keycodes.ESC) {
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
  inherit(TextFormatToolbar, views_toolbar);

  var text_format_toolbar = TextFormatToolbar;

  function Tooltip(options) {
    var tooltip = this;
    var rootElement = options.rootElement;
    var delay = options.delay || 200;
    var timeout;
    options.classNames = ['ck-tooltip'];
    views_view.call(tooltip, options);

    rootElement.addEventListener('mouseover', function(e) {
      var target = getEventTargetMatchingTag(options.showForTag, e.target, rootElement);
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
  inherit(Tooltip, views_view);

  Tooltip.prototype.showMessage = function(message, element) {
    var tooltip = this;
    var tooltipElement = tooltip.element;
    tooltipElement.innerHTML = message;
    tooltip.show();
    positionElementCenteredBelow(tooltipElement, element);
  };

  Tooltip.prototype.showLink = function(link, element) {
    var message = '<a href="' + link + '" target="_blank">' + link + '</a>';
    this.showMessage(message, element);
  };

  var views_tooltip = Tooltip;

  var LayoutStyle = {
    GUTTER   : 1,
    CENTERED : 2
  };

  function computeLayoutStyle(rootElement) {
    if (rootElement.getBoundingClientRect().left > 100) {
      return LayoutStyle.GUTTER;
    }
    return LayoutStyle.CENTERED;
  }

  function EmbedIntent(options) {
    var embedIntent = this;
    var rootElement = embedIntent.rootElement = options.rootElement;
    options.classNames = ['ck-embed-intent'];
    views_view.call(embedIntent, options);

    embedIntent.isActive = false;
    embedIntent.editorContext = options.editorContext;
    embedIntent.loadingIndicator = createDiv('ck-embed-loading');
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

    embedIntent.toolbar = new views_toolbar({
      container: embedIntent.element,
      embedIntent: embedIntent,
      editor: embedIntent.editorContext,
      commands: options.commands,
      direction: views_toolbar.Direction.RIGHT
    });

    function embedIntentHandler() {
      var blockElement = getSelectionBlockElement();
      if (blockElement && elementContentIsEmpty(blockElement)) {
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
      if (e.keyCode === Keycodes.ESC) {
        embedIntent.hide();
      }
    });

    window.addEventListener('resize', function() {
      if(embedIntent.isShowing) {
        embedIntent.reposition();
      }
    });
  }
  inherit(EmbedIntent, views_view);

  EmbedIntent.prototype.hide = function() {
    if (EmbedIntent._super.prototype.hide.call(this)) {
      this.deactivate();
    }
  };

  EmbedIntent.prototype.showAt = function(node) {
    this.atNode = node;
    this.show();
    this.deactivate();
    this.reposition();
  };

  EmbedIntent.prototype.reposition = function() {
    if (computeLayoutStyle(this.rootElement) === LayoutStyle.GUTTER) {
      positionElementToLeftOf(this.element, this.atNode);
    } else {
      positionElementCenteredIn(this.element, this.atNode);
    }
  };

  EmbedIntent.prototype.activate = function() {
    if (!this.isActive) {
      this.addClass('activated');
      this.toolbar.show();
      this.isActive = true;
    }
  };

  EmbedIntent.prototype.deactivate = function() {
    if (this.isActive) {
      this.removeClass('activated');
      this.toolbar.hide();
      this.isActive = false;
    }
  };

  EmbedIntent.prototype.showLoading = function() {
    var embedIntent = this;
    var loadingIndicator = embedIntent.loadingIndicator;
    embedIntent.hide();
    embedIntent.atNode.appendChild(loadingIndicator);
  };

  EmbedIntent.prototype.hideLoading = function() {
    this.atNode.removeChild(this.loadingIndicator);
  };

  var embed_intent = EmbedIntent;

  function Command(options) {
    options = options || {};
    var command = this;
    var name = options.name;
    var prompt = options.prompt;
    command.name = name;
    command.button = options.button || name;
    if (prompt) { command.prompt = prompt; }
  }

  Command.prototype.exec = function() {};

  var base = Command;

  function TextFormatCommand(options) {
    options = options || {};
    base.call(this, options);
    this.tag = options.tag;
    this.mappedTags = options.mappedTags || [];
    this.mappedTags.push(this.tag);
    this.action = options.action || this.name;
    this.removeAction = options.removeAction || this.action;
  }
  inherit(TextFormatCommand, base);

  TextFormatCommand.prototype = {
    exec: function(value) {
      document.execCommand(this.action, false, value || null);
    },
    unexec: function(value) {
      document.execCommand(this.removeAction, false, value || null);
    }
  };

  var text_format = TextFormatCommand;

  var RegExpHeadingTag = /^(h1|h2|h3|h4|h5|h6)$/i;

  function BoldCommand() {
    text_format.call(this, {
      name: 'bold',
      tag: types_type.BOLD.tag,
      mappedTags: types_type.BOLD.mappedTags,
      button: '<i class="ck-icon-bold"></i>'
    });
  }
  inherit(BoldCommand, text_format);

  BoldCommand.prototype.exec = function() {
    // Don't allow executing bold command on heading tags
    if (!RegExpHeadingTag.test(getSelectionBlockTagName())) {
      BoldCommand._super.prototype.exec.call(this);
    }
  };

  var bold = BoldCommand;

  function ItalicCommand() {
    text_format.call(this, {
      name: 'italic',
      tag: types_type.ITALIC.tag,
      mappedTags: types_type.ITALIC.mappedTags,
      button: '<i class="ck-icon-italic"></i>'
    });
  }
  inherit(ItalicCommand, text_format);

  var italic = ItalicCommand;

  var container = document.body;
  var hiliter = createDiv('ck-editor-hilite');

  function positionHiliteRange(range) {
    var rect = range.getBoundingClientRect();
    var style = hiliter.style;
    style.width  = rect.width  + 'px';
    style.height = rect.height + 'px';
    positionElementToRect(hiliter, rect);
  }

  function Prompt(options) {
    var prompt = this;
    options.tagName = 'input';
    views_view.call(prompt, options);

    prompt.command = options.command;
    prompt.element.placeholder = options.placeholder || '';
    prompt.element.addEventListener('mouseup', function(e) { e.stopPropagation(); }); // prevents closing prompt when clicking input 
    prompt.element.addEventListener('keyup', function(e) {
      var entry = this.value;
      if(entry && prompt.range && !e.shiftKey && e.which === Keycodes.ENTER) {
        restoreRange(prompt.range);
        prompt.command.exec(entry);
        if (prompt.onComplete) { prompt.onComplete(); }
      }
    });

    window.addEventListener('resize', function() {
      var activeHilite = hiliter.parentNode;
      var range = prompt.range;
      if(activeHilite && range) {
        positionHiliteRange(range);
      }
    });
  }
  inherit(Prompt, views_view);

  Prompt.prototype.show = function(callback) {
    var prompt = this;
    var element = prompt.element;
    var selection = window.getSelection();
    var range = selection && selection.rangeCount && selection.getRangeAt(0);
    element.value = null;
    prompt.range = range || null;
    if (range) {
      container.appendChild(hiliter);
      positionHiliteRange(prompt.range);
      setTimeout(function(){ element.focus(); }); // defer focus (disrupts mouseup events)
      if (callback) { prompt.onComplete = callback; }
    }
  };

  Prompt.prototype.hide = function() {
    if (hiliter.parentNode) {
      container.removeChild(hiliter);
    }
  };

  var views_prompt = Prompt;

  var RegExpHttp = /^https?:\/\//i;

  function LinkCommand() {
    text_format.call(this, {
      name: 'link',
      tag: types_type.LINK.tag,
      action: 'createLink',
      removeAction: 'unlink',
      button: '<i class="ck-icon-link"></i>',
      prompt: new views_prompt({
        command: this,
        placeholder: 'Enter a url, press return...'
      })
    });
  }
  inherit(LinkCommand, text_format);

  LinkCommand.prototype.exec = function(url) {
    if (!url) {
      return LinkCommand._super.prototype.unexec.call(this);
    }

    if(this.tag === getSelectionTagName()) {
      this.unexec();
    } else {
      if (!RegExpHttp.test(url)) {
        url = 'http://' + url;
      }
      LinkCommand._super.prototype.exec.call(this, url);
    }
  };

  var commands_link = LinkCommand;

  function FormatBlockCommand(options) {
    options = options || {};
    options.action = 'formatBlock';
    text_format.call(this, options);
  }
  inherit(FormatBlockCommand, text_format);

  FormatBlockCommand.prototype.exec = function() {
    var tag = this.tag;
    // Brackets neccessary for certain browsers
    var value =  '<' + tag + '>';
    var blockElement = getSelectionBlockElement();
    // Allow block commands to be toggled back to a text block
    if(tag === blockElement.tagName.toLowerCase()) {
      value = types_type.PARAGRAPH.tag;
    } else {
      // Flattens the selection before applying the block format.
      // Otherwise, undesirable nested blocks can occur.
      // TODO: would love to be able to remove this
      var flatNode = document.createTextNode(blockElement.textContent);
      blockElement.parentNode.insertBefore(flatNode, blockElement);
      blockElement.parentNode.removeChild(blockElement);
      selectNode(flatNode);
    }
    
    FormatBlockCommand._super.prototype.exec.call(this, value);
  };

  var format_block = FormatBlockCommand;

  function QuoteCommand() {
    format_block.call(this, {
      name: 'quote',
      tag: types_type.QUOTE.tag,
      button: '<i class="ck-icon-quote"></i>'
    });
  }
  inherit(QuoteCommand, format_block);

  var quote = QuoteCommand;

  function HeadingCommand() {
    format_block.call(this, {
      name: 'heading',
      tag: types_type.HEADING.tag,
      button: '<i class="ck-icon-heading"></i>1'
    });
  }
  inherit(HeadingCommand, format_block);

  var heading = HeadingCommand;

  function SubheadingCommand() {
    format_block.call(this, {
      name: 'subheading',
      tag: types_type.SUBHEADING.tag,
      button: '<i class="ck-icon-heading"></i>2'
    });
  }
  inherit(SubheadingCommand, format_block);

  var subheading = SubheadingCommand;

  function ListCommand(options) {
    text_format.call(this, options);
  }
  inherit(ListCommand, text_format);

  ListCommand.prototype.exec = function() {
    ListCommand._super.prototype.exec.call(this);
    
    // After creation, lists need to be unwrapped
    // TODO: eventually can remove this when direct model manipulation is ready
    var listElement = getSelectionBlockElement();
    var wrapperNode = listElement.parentNode;
    if (wrapperNode.firstChild === listElement) {
      var editorNode = wrapperNode.parentNode;
      editorNode.insertBefore(listElement, wrapperNode);
      editorNode.removeChild(wrapperNode);
      selectNode(listElement);
    }
  };

  ListCommand.prototype.checkAutoFormat = function(node) {
    // Creates unordered lists when node starts with '- '
    // or ordered list if node starts with '1. '
    var regex = this.autoFormatRegex, text;
    if (node && regex) {
      text = node.textContent;
      if (types_type.LIST_ITEM.tag !== getSelectionTagName() && regex.test(text)) {
        this.exec();
        window.getSelection().anchorNode.textContent = text.replace(regex, '');
        return true;
      }
    }
    return false;
  };

  var list = ListCommand;

  function UnorderedListCommand() {
    list.call(this, {
      name: 'list',
      tag: types_type.LIST.tag,
      action: 'insertUnorderedList'
    });
  }
  inherit(UnorderedListCommand, list);

  UnorderedListCommand.prototype.autoFormatRegex =  /^[-*]\s/;

  var unordered_list = UnorderedListCommand;

  function OrderedListCommand() {
    list.call(this, {
      name: 'ordered list',
      tag: types_type.ORDERED_LIST.tag,
      action: 'insertOrderedList'
    });
  }
  inherit(OrderedListCommand, list);

  OrderedListCommand.prototype.autoFormatRegex = /^1\.\s/;

  var ordered_list = OrderedListCommand;

  var defaultClassNames = ['ck-message'];

  function Message(options) {
    options = options || {};
    options.classNames = defaultClassNames;
    views_view.call(this, options);
  }
  inherit(Message, views_view);

  function show(view, message) {
    view.element.innerHTML = message;
    Message._super.prototype.show.call(view);
    setTimeout(function() {
      view.hide();
    }, 3200);
  }

  Message.prototype.showInfo = function(message) {
    this.setClasses(defaultClassNames);
    show(this, message);
  };

  Message.prototype.showError = function(message) {
    this.addClass('ck-message-error');
    show(this, message);
  };

  var views_message = Message;

  function createXHR(options) {
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

  function xhrGet(options) {
    options.method = 'GET';
    var xhr = createXHR(options);
    try {
      xhr.send();
    } catch(error) {}
  }

  function xhrPost(options) {
    options.method = 'POST';
    var xhr = createXHR(options);
    var formData = new FormData();
    formData.append('file', options.data);
    try {
      xhr.send(formData);
    } catch(error) {}
  }

  function responseJSON(jsonString) {
    if (!jsonString) { return null; }
    try {
      return JSON.parse(jsonString);
    } catch(e) {
      return jsonString;
    }
  }

  // --------------------------------------------

  function FileUploader(options) {
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

  FileUploader.prototype.upload = function(options) {
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

    xhrPost({
      url: this.url,
      data: file,
      success: function(response) {
        if (callback) { callback.call(this, responseJSON(response)); }
      },
      error: function(error) {
        if (callback) { callback.call(this, null, responseJSON(error)); }
      }
    });
  };

  function OEmbedder(options) {
    options = options || {};
    var url = options.url;
    if (url) {
      this.url = url;
    } else {
      throw new Error('OEmbedder: setting the `url` to an embed service is required');
    }
  }

  OEmbedder.prototype.fetch = function(options) {
    var callback = options.complete;
    xhrGet({
      url: this.url + "?url=" + encodeURI(options.url),
      success: function(response) {
        if (callback) { callback.call(this, responseJSON(response)); }
      },
      error: function(error) {
        if (callback) { callback.call(this, null, responseJSON(error)); }
      }
    });
  };

  function createFileInput(command) {
    var fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.className = 'ck-file-input';
    fileInput.addEventListener('change', function(e) {
      command.handleFile(e);
    });
    return fileInput;
  }

  function injectImageBlock(src, editor, index) {
    var imageModel = models_block.createWithType(types_type.IMAGE, { attributes: { src: src } });
    editor.replaceBlock(imageModel, index);
  }

  function renderFromFile(file, editor, index) {
    if (file && window.FileReader) {
      var reader = new FileReader();
      reader.onload = function(e) {
        var base64Src = e.target.result;
        injectImageBlock(base64Src, editor, index);
        editor.renderBlockAt(index, true);
      };
      reader.readAsDataURL(file);
    }
  }

  function ImageCommand(options) {
    base.call(this, {
      name: 'image',
      button: '<i class="ck-icon-image"></i>'
    });
    this.uploader = new FileUploader({ url: options.serviceUrl, maxFileSize: 5000000 });
  }
  inherit(ImageCommand, base);

  ImageCommand.prototype = {
    exec: function() {
      ImageCommand._super.prototype.exec.call(this);
      var fileInput = this.fileInput;
      if (!fileInput) {
        fileInput = this.fileInput = createFileInput(this);
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
      renderFromFile(file, editor, currentEditingIndex); // render image immediately client-side
      this.uploader.upload({
        fileInput: fileInput,
        complete: function(response, error) {
          embedIntent.hideLoading();
          if (error || !response || !response.url) {
            setTimeout(function() {
              editor.removeBlockAt(currentEditingIndex);
              editor.syncVisual();
            }, 1000);
            return new views_message().showError(error.message || 'Error uploading image');
          }
          injectImageBlock(response.url, editor, currentEditingIndex);
        }
      });
      fileInput.value = null; // reset file input
    }
  };

  var image = ImageCommand;

  function loadTwitterWidgets(element) {
    if (window.twttr) {
      window.twttr.widgets.load(element);
    } else {
      var script = document.createElement('script');
      script.async = true;
      script.src = 'http://platform.twitter.com/widgets.js';
      document.head.appendChild(script);
    }
  }

  function OEmbedCommand(options) {
    base.call(this, {
      name: 'embed',
      button: '<i class="ck-icon-embed"></i>',
      prompt: new views_prompt({
        command: this,
        placeholder: 'Paste a YouTube or Twitter url...'
      })
    });

    this.embedService = new OEmbedder({ url: options.serviceUrl });
  }
  inherit(OEmbedCommand, base);

  OEmbedCommand.prototype.exec = function(url) {
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
          new views_message().showError(errorMsg);
          embedIntent.show();
        } else if (response.error_message) {
          new views_message().showError(response.error_message);
          embedIntent.show();
        } else {
          var embedModel = new embed(response);
          editorContext.insertBlock(embedModel, index);
          editorContext.renderBlockAt(index);
          if (embedModel.attributes.provider_name.toLowerCase() === 'twitter') {
            loadTwitterWidgets(editorContext.element);
          }
        }
      }
    });
  };

  var oembed = OEmbedCommand;

  // Based on https://github.com/jeromeetienne/microevent.js/blob/master/microevent.js
  // See also: https://github.com/allouis/minivents/blob/master/minivents.js

  var EventEmitter = {
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

  var event_emitter = EventEmitter;

  var defaults = {
    placeholder: 'Write here...',
    spellcheck: true,
    autofocus: true,
    model: null,
    serverHost: '',
    stickyToolbar: !!('ontouchstart' in window),
    textFormatCommands: [
      new bold(),
      new italic(),
      new commands_link(),
      new quote(),
      new heading(),
      new subheading()
    ],
    embedCommands: [
      new image({  serviceUrl: '/upload' }),
      new oembed({ serviceUrl: '/embed'  })
    ],
    autoTypingCommands: [
      new unordered_list(),
      new ordered_list()
    ],
    compiler: new compiler({
      includeTypeNames: true, // outputs models with type names, i.e. 'BOLD', for easier debugging
      renderer: new editor_html_renderer() // subclassed HTML renderer that adds dom structure for additional editor interactivity
    })
  };

  function bindContentEditableTypingListeners(editor) {


    editor.element.addEventListener('keyup', function(e) {
      // Assure there is always a supported block tag, and not empty text nodes or divs.
      // On a carrage return, make sure to always generate a 'p' tag
      if (!getSelectionBlockElement() ||
          !editor.element.textContent ||
         (!e.shiftKey && e.which === Keycodes.ENTER) || (e.ctrlKey && e.which === Keycodes.M)) {
        document.execCommand('formatBlock', false, types_type.PARAGRAPH.tag);
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

  function bindLiveUpdate(editor) {
    editor.element.addEventListener('input', function() {
      editor.syncContentEditableBlocks();
    });
  }

  function bindAutoTypingListeners(editor) {
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

  function bindDragAndDrop() {
    // TODO. For now, just prevent redirect when dropping something on the page
    window.addEventListener('dragover', function(e) {
      e.preventDefault(); // prevents showing cursor where to drop
    });
    window.addEventListener('drop', function(e) {
      e.preventDefault(); // prevent page from redirecting
    });
  }

  function initEmbedCommands(editor) {
    var commands = editor.embedCommands;
    if(commands) {
      return new embed_intent({
        editorContext: editor,
        commands: commands,
        rootElement: editor.element
      });
    }
  }

  function applyClassName(editorElement) {
    var editorClassName = 'ck-editor';
    var editorClassNameRegExp = new RegExp(editorClassName);
    var existingClassName = editorElement.className;

    if (!editorClassNameRegExp.test(existingClassName)) {
      existingClassName += (existingClassName ? ' ' : '') + editorClassName;
    }
    editorElement.className = existingClassName;
  }

  function applyPlaceholder(editorElement, placeholder) {
    var dataset = editorElement.dataset;
    if (placeholder && !dataset.placeholder) {
      dataset.placeholder = placeholder;
    }
  }

  function getNonTextBlocks(blockTypeSet, model) {
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
  function Editor(element, options) {
    var editor = this;
    mergeWithOptions(editor, defaults, options);

    // Update embed commands by prepending the serverHost
    editor.embedCommands = [
      new image({  serviceUrl: editor.serverHost + '/upload' }),
      new oembed({ serviceUrl: editor.serverHost + '/embed'  })
    ];

    if (element) {
      applyClassName(element);
      applyPlaceholder(element, editor.placeholder);
      element.spellcheck = editor.spellcheck;
      element.setAttribute('contentEditable', true);
      editor.element = element;

      if (editor.model) {
        editor.loadModel(editor.model);
      } else {
        editor.sync();
      }

      bindContentEditableTypingListeners(editor);
      bindAutoTypingListeners(editor);
      bindDragAndDrop(editor);
      bindLiveUpdate(editor);
      initEmbedCommands(editor);

      editor.textFormatToolbar = new text_format_toolbar({ rootElement: element, commands: editor.textFormatCommands, sticky: editor.stickyToolbar });
      editor.linkTooltips = new views_tooltip({ rootElement: element, showForTag: types_type.LINK.tag });

      if(editor.autofocus) { element.focus(); }
    }
  }

  // Add event emitter pub/sub functionality
  merge(Editor.prototype, event_emitter);

  Editor.prototype.loadModel = function(model) {
    this.model = model;
    this.syncVisual();
    this.trigger('update');
  };

  Editor.prototype.syncModel = function() {
    this.model = this.compiler.parse(this.element.innerHTML);
    this.trigger('update');
  };

  Editor.prototype.syncVisual = function() {
    this.element.innerHTML = this.compiler.render(this.model);
  };

  Editor.prototype.sync = function() {
    this.syncModel();
    this.syncVisual();
  };

  Editor.prototype.getCurrentBlockIndex = function(element) {
    var selectionEl = element || getSelectionBlockElement();
    var blockElements = toArray(this.element.children);
    return blockElements.indexOf(selectionEl);
  };

  Editor.prototype.getCursorIndexInCurrentBlock = function() {
    var currentBlock = getSelectionBlockElement();
    if (currentBlock) {
      return getCursorOffsetInElement(currentBlock);
    }
    return -1;
  };

  Editor.prototype.insertBlock = function(block, index) {
    this.model.splice(index, 0, block);
    this.trigger('update');
  };

  Editor.prototype.removeBlockAt = function(index) {
    this.model.splice(index, 1);
    this.trigger('update');
  };

  Editor.prototype.replaceBlock = function(block, index) {
    this.model[index] = block;
    this.trigger('update');
  };

  Editor.prototype.renderBlockAt = function(index, replace) {
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

  Editor.prototype.syncContentEditableBlocks = function() {
    var nonTextBlocks = getNonTextBlocks(this.compiler.blockTypes, this.model);
    var blockElements = toArray(this.element.children);
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


  var editor_editor = Editor;

  function EditorFactory(element, options) {
    var editors = [];
    var elements, elementsLen, i;

    if (!element) {
      return new editor_editor(element, options);
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
        editors.push(new editor_editor(elements[i], options));
      }
    }

    return editors.length > 1 ? editors : editors[0];
  }

  EditorFactory.prototype = editor_editor.prototype;

  var editor_factory = EditorFactory;

  var ContentKit = {};
  ContentKit.Type = types_type;
  ContentKit.BlockModel = models_block;
  ContentKit.EmbedModel = embed;
  ContentKit.Compiler = compiler;
  ContentKit.HTMLParser = html_parser;
  ContentKit.HTMLRenderer = html_renderer;
  ContentKit.Editor = editor_factory;

  window.ContentKit = ContentKit;
}(this, document));
