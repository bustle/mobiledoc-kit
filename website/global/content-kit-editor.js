;(function() {

var define, requireModule, require, requirejs;

(function() {

  var _isArray;
  if (!Array.isArray) {
    _isArray = function (x) {
      return Object.prototype.toString.call(x) === "[object Array]";
    };
  } else {
    _isArray = Array.isArray;
  }

  var registry = {}, seen = {};
  var FAILED = false;

  var uuid = 0;

  function tryFinally(tryable, finalizer) {
    try {
      return tryable();
    } finally {
      finalizer();
    }
  }

  function unsupportedModule(length) {
    throw new Error("an unsupported module was defined, expected `define(name, deps, module)` instead got: `" + length + "` arguments to define`");
  }

  var defaultDeps = ['require', 'exports', 'module'];

  function Module(name, deps, callback, exports) {
    this.id       = uuid++;
    this.name     = name;
    this.deps     = !deps.length && callback.length ? defaultDeps : deps;
    this.exports  = exports || { };
    this.callback = callback;
    this.state    = undefined;
    this._require  = undefined;
  }


  Module.prototype.makeRequire = function() {
    var name = this.name;

    return this._require || (this._require = function(dep) {
      return require(resolve(dep, name));
    });
  }

  define = function(name, deps, callback) {
    if (arguments.length < 2) {
      unsupportedModule(arguments.length);
    }

    if (!_isArray(deps)) {
      callback = deps;
      deps     =  [];
    }

    registry[name] = new Module(name, deps, callback);
  };

  // we don't support all of AMD
  // define.amd = {};
  // we will support petals...
  define.petal = { };

  function Alias(path) {
    this.name = path;
  }

  define.alias = function(path) {
    return new Alias(path);
  };

  function reify(mod, name, seen) {
    var deps = mod.deps;
    var length = deps.length;
    var reified = new Array(length);
    var dep;
    // TODO: new Module
    // TODO: seen refactor
    var module = { };

    for (var i = 0, l = length; i < l; i++) {
      dep = deps[i];
      if (dep === 'exports') {
        module.exports = reified[i] = seen;
      } else if (dep === 'require') {
        reified[i] = mod.makeRequire();
      } else if (dep === 'module') {
        mod.exports = seen;
        module = reified[i] = mod;
      } else {
        reified[i] = requireFrom(resolve(dep, name), name);
      }
    }

    return {
      deps: reified,
      module: module
    };
  }

  function requireFrom(name, origin) {
    var mod = registry[name];
    if (!mod) {
      throw new Error('Could not find module `' + name + '` imported from `' + origin + '`');
    }
    return require(name);
  }

  function missingModule(name) {
    throw new Error('Could not find module ' + name);
  }
  requirejs = require = requireModule = function(name) {
    var mod = registry[name];


    if (mod && mod.callback instanceof Alias) {
      mod = registry[mod.callback.name];
    }

    if (!mod) { missingModule(name); }

    if (mod.state !== FAILED &&
        seen.hasOwnProperty(name)) {
      return seen[name];
    }

    var reified;
    var module;
    var loaded = false;

    seen[name] = { }; // placeholder for run-time cycles

    tryFinally(function() {
      reified = reify(mod, name, seen[name]);
      module = mod.callback.apply(this, reified.deps);
      loaded = true;
    }, function() {
      if (!loaded) {
        mod.state = FAILED;
      }
    });

    var obj;
    if (module === undefined && reified.module.exports) {
      obj = reified.module.exports;
    } else {
      obj = seen[name] = module;
    }

    if (obj !== null &&
        (typeof obj === 'object' || typeof obj === 'function') &&
          obj['default'] === undefined) {
      obj['default'] = obj;
    }

    return (seen[name] = obj);
  };

  function resolve(child, name) {
    if (child.charAt(0) !== '.') { return child; }

    var parts = child.split('/');
    var nameParts = name.split('/');
    var parentBase = nameParts.slice(0, -1);

    for (var i = 0, l = parts.length; i < l; i++) {
      var part = parts[i];

      if (part === '..') {
        if (parentBase.length === 0) {
          throw new Error('Cannot access parent module of root');
        }
        parentBase.pop();
      } else if (part === '.') { continue; }
      else { parentBase.push(part); }
    }

    return parentBase.join('/');
  }

  requirejs.entries = requirejs._eak_seen = registry;
  requirejs.clear = function(){
    requirejs.entries = requirejs._eak_seen = registry = {};
    seen = state = {};
  };
})();

define("content-kit-editor/commands/base", ["exports"], function (exports) {
  "use strict";

  function Command(options) {
    options = options || {};
    var command = this;
    var name = options.name;
    var prompt = options.prompt;
    command.name = name;
    command.button = options.button || name;
    if (prompt) {
      command.prompt = prompt;
    }
  }

  Command.prototype.exec = function () {};

  exports["default"] = Command;
});
define('content-kit-editor/commands/bold', ['exports', 'content-kit-editor/commands/text-format', 'content-kit-editor/utils/selection-utils', 'content-kit-utils'], function (exports, _contentKitEditorCommandsTextFormat, _contentKitEditorUtilsSelectionUtils, _contentKitUtils) {
  'use strict';

  var RegExpHeadingTag = /^(h1|h2|h3|h4|h5|h6)$/i;

  function BoldCommand() {
    _contentKitEditorCommandsTextFormat['default'].call(this, {
      name: 'bold',
      tag: 'strong',
      mappedTags: ['b'],
      button: '<i class="ck-icon-bold"></i>'
    });
  }
  (0, _contentKitUtils.inherit)(BoldCommand, _contentKitEditorCommandsTextFormat['default']);

  BoldCommand.prototype.exec = function () {
    // Don't allow executing bold command on heading tags
    if (!RegExpHeadingTag.test((0, _contentKitEditorUtilsSelectionUtils.getSelectionBlockTagName)())) {
      BoldCommand._super.prototype.exec.call(this);
    }
  };

  exports['default'] = BoldCommand;
});
define('content-kit-editor/commands/card', ['exports', 'content-kit-editor/commands/base', 'content-kit-utils'], function (exports, _contentKitEditorCommandsBase, _contentKitUtils) {
  'use strict';

  function injectCardBlock(cardName, cardPayload, editor, index) {
    throw new Error('Unimplemented: BlockModel and Type.CARD are no longer things');
    // FIXME: Do we change the block model internal representation here?
    var cardBlock = BlockModel.createWithType(Type.CARD, {
      attributes: {
        name: cardName,
        payload: cardPayload
      }
    });
    editor.replaceBlock(cardBlock, index);
  }

  function CardCommand() {
    _contentKitEditorCommandsBase['default'].call(this, {
      name: 'card',
      button: '<i>CA</i>'
    });
  }
  (0, _contentKitUtils.inherit)(CardCommand, _contentKitEditorCommandsBase['default']);

  CardCommand.prototype = {
    exec: function exec() {
      CardCommand._super.prototype.exec.call(this);
      var editor = this.editorContext;
      var currentEditingIndex = editor.getCurrentBlockIndex();

      var cardName = 'pick-color';
      var cardPayload = { options: ['red', 'blue'] };
      injectCardBlock(cardName, cardPayload, editor, currentEditingIndex);
      editor.renderBlockAt(currentEditingIndex, true);
    }
  };

  exports['default'] = CardCommand;
});
define('content-kit-editor/commands/format-block', ['exports', 'content-kit-editor/commands/text-format', 'content-kit-editor/utils/selection-utils', 'content-kit-utils'], function (exports, _contentKitEditorCommandsTextFormat, _contentKitEditorUtilsSelectionUtils, _contentKitUtils) {
  'use strict';

  function FormatBlockCommand(options) {
    options = options || {};
    options.action = 'formatBlock';
    _contentKitEditorCommandsTextFormat['default'].call(this, options);
  }
  (0, _contentKitUtils.inherit)(FormatBlockCommand, _contentKitEditorCommandsTextFormat['default']);

  FormatBlockCommand.prototype.exec = function () {
    var tag = this.tag;
    // Brackets neccessary for certain browsers
    var value = '<' + tag + '>';
    var blockElement = (0, _contentKitEditorUtilsSelectionUtils.getSelectionBlockElement)();
    // Allow block commands to be toggled back to a text block
    if (tag === blockElement.tagName.toLowerCase()) {
      throw new Error('Unimplemented: Type.BOLD.paragraph must be replaced');
      value = Type.PARAGRAPH.tag;
    } else {
      // Flattens the selection before applying the block format.
      // Otherwise, undesirable nested blocks can occur.
      // TODO: would love to be able to remove this
      var flatNode = document.createTextNode(blockElement.textContent);
      blockElement.parentNode.insertBefore(flatNode, blockElement);
      blockElement.parentNode.removeChild(blockElement);
      (0, _contentKitEditorUtilsSelectionUtils.selectNode)(flatNode);
    }

    FormatBlockCommand._super.prototype.exec.call(this, value);
  };

  exports['default'] = FormatBlockCommand;
});
define('content-kit-editor/commands/heading', ['exports', 'content-kit-editor/commands/format-block', 'content-kit-utils'], function (exports, _contentKitEditorCommandsFormatBlock, _contentKitUtils) {
  'use strict';

  function HeadingCommand() {
    _contentKitEditorCommandsFormatBlock['default'].call(this, {
      name: 'heading',
      tag: 'h2',
      button: '<i class="ck-icon-heading"></i>1'
    });
  }
  (0, _contentKitUtils.inherit)(HeadingCommand, _contentKitEditorCommandsFormatBlock['default']);

  exports['default'] = HeadingCommand;
});
define('content-kit-editor/commands/image', ['exports', 'content-kit-editor/commands/base', 'content-kit-editor/views/message', 'content-kit-utils', 'content-kit-editor/utils/http-utils'], function (exports, _contentKitEditorCommandsBase, _contentKitEditorViewsMessage, _contentKitUtils, _contentKitEditorUtilsHttpUtils) {
  'use strict';

  function createFileInput(command) {
    var fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.className = 'ck-file-input';
    fileInput.addEventListener('change', function (e) {
      command.handleFile(e);
    });
    return fileInput;
  }

  function injectImageBlock(src, editor, index) {
    throw new Error('Unimplemented: BlockModel and Type.IMAGE are no longer things');
    var imageModel = BlockModel.createWithType(Type.IMAGE, { attributes: { src: src } });
    editor.replaceBlock(imageModel, index);
  }

  function renderFromFile(file, editor, index) {
    if (file && window.FileReader) {
      var reader = new FileReader();
      reader.onload = function (e) {
        var base64Src = e.target.result;
        injectImageBlock(base64Src, editor, index);
        editor.renderBlockAt(index, true);
      };
      reader.readAsDataURL(file);
    }
  }

  function ImageCommand(options) {
    _contentKitEditorCommandsBase['default'].call(this, {
      name: 'image',
      button: '<i class="ck-icon-image"></i>'
    });
    this.uploader = new _contentKitEditorUtilsHttpUtils.FileUploader({ url: options.serviceUrl, maxFileSize: 5000000 });
  }
  (0, _contentKitUtils.inherit)(ImageCommand, _contentKitEditorCommandsBase['default']);

  ImageCommand.prototype = {
    exec: function exec() {
      ImageCommand._super.prototype.exec.call(this);
      var fileInput = this.fileInput;
      if (!fileInput) {
        fileInput = this.fileInput = createFileInput(this);
        document.body.appendChild(fileInput);
      }
      fileInput.dispatchEvent(new MouseEvent('click', { bubbles: false }));
    },
    handleFile: function handleFile(e) {
      var fileInput = e.target;
      var file = fileInput.files && fileInput.files[0];
      var editor = this.editorContext;
      var embedIntent = this.embedIntent;
      var currentEditingIndex = editor.getCurrentBlockIndex();

      embedIntent.showLoading();
      renderFromFile(file, editor, currentEditingIndex); // render image immediately client-side
      this.uploader.upload({
        fileInput: fileInput,
        complete: function complete(response, error) {
          embedIntent.hideLoading();
          if (error || !response || !response.url) {
            setTimeout(function () {
              editor.removeBlockAt(currentEditingIndex);
              editor.syncVisual();
            }, 1000);
            return new _contentKitEditorViewsMessage['default']().showError(error.message || 'Error uploading image');
          }
          injectImageBlock(response.url, editor, currentEditingIndex);
        }
      });
      fileInput.value = null; // reset file input
    }
  };

  exports['default'] = ImageCommand;
});
define('content-kit-editor/commands/italic', ['exports', 'content-kit-editor/commands/text-format', 'content-kit-utils'], function (exports, _contentKitEditorCommandsTextFormat, _contentKitUtils) {
  'use strict';

  function ItalicCommand() {
    _contentKitEditorCommandsTextFormat['default'].call(this, {
      name: 'italic',
      tag: 'em',
      mappedTags: ['i'],
      button: '<i class="ck-icon-italic"></i>'
    });
  }
  (0, _contentKitUtils.inherit)(ItalicCommand, _contentKitEditorCommandsTextFormat['default']);

  exports['default'] = ItalicCommand;
});
define('content-kit-editor/commands/link', ['exports', 'content-kit-editor/commands/text-format', 'content-kit-editor/views/prompt', 'content-kit-editor/utils/selection-utils', 'content-kit-utils'], function (exports, _contentKitEditorCommandsTextFormat, _contentKitEditorViewsPrompt, _contentKitEditorUtilsSelectionUtils, _contentKitUtils) {
  'use strict';

  var RegExpHttp = /^https?:\/\//i;

  function LinkCommand() {
    _contentKitEditorCommandsTextFormat['default'].call(this, {
      name: 'link',
      tag: 'a',
      action: 'createLink',
      removeAction: 'unlink',
      button: '<i class="ck-icon-link"></i>',
      prompt: new _contentKitEditorViewsPrompt['default']({
        command: this,
        placeholder: 'Enter a url, press return...'
      })
    });
  }
  (0, _contentKitUtils.inherit)(LinkCommand, _contentKitEditorCommandsTextFormat['default']);

  LinkCommand.prototype.exec = function (url) {
    if (!url) {
      return LinkCommand._super.prototype.unexec.call(this);
    }

    if (this.tag === (0, _contentKitEditorUtilsSelectionUtils.getSelectionTagName)()) {
      this.unexec();
    } else {
      if (!RegExpHttp.test(url)) {
        url = 'http://' + url;
      }
      LinkCommand._super.prototype.exec.call(this, url);
    }
  };

  exports['default'] = LinkCommand;
});
define('content-kit-editor/commands/list', ['exports', 'content-kit-editor/commands/text-format', 'content-kit-editor/utils/selection-utils', 'content-kit-utils'], function (exports, _contentKitEditorCommandsTextFormat, _contentKitEditorUtilsSelectionUtils, _contentKitUtils) {
  'use strict';

  function ListCommand(options) {
    _contentKitEditorCommandsTextFormat['default'].call(this, options);
  }
  (0, _contentKitUtils.inherit)(ListCommand, _contentKitEditorCommandsTextFormat['default']);

  ListCommand.prototype.exec = function () {
    ListCommand._super.prototype.exec.call(this);

    // After creation, lists need to be unwrapped
    // TODO: eventually can remove this when direct model manipulation is ready
    var listElement = (0, _contentKitEditorUtilsSelectionUtils.getSelectionBlockElement)();
    var wrapperNode = listElement.parentNode;
    if (wrapperNode.firstChild === listElement) {
      var editorNode = wrapperNode.parentNode;
      editorNode.insertBefore(listElement, wrapperNode);
      editorNode.removeChild(wrapperNode);
      (0, _contentKitEditorUtilsSelectionUtils.selectNode)(listElement);
    }
  };

  ListCommand.prototype.checkAutoFormat = function (node) {
    // Creates unordered lists when node starts with '- '
    // or ordered list if node starts with '1. '
    var regex = this.autoFormatRegex,
        text;
    if (node && regex) {
      text = node.textContent;
      if ('li' !== (0, _contentKitEditorUtilsSelectionUtils.getSelectionTagName)() && regex.test(text)) {
        this.exec();
        window.getSelection().anchorNode.textContent = text.replace(regex, '');
        return true;
      }
    }
    return false;
  };

  exports['default'] = ListCommand;
});
define('content-kit-editor/commands/oembed', ['exports', 'content-kit-editor/commands/base', 'content-kit-editor/views/prompt', 'content-kit-editor/views/message', 'content-kit-utils', 'content-kit-editor/utils/http-utils'], function (exports, _contentKitEditorCommandsBase, _contentKitEditorViewsPrompt, _contentKitEditorViewsMessage, _contentKitUtils, _contentKitEditorUtilsHttpUtils) {
  'use strict';

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
    _contentKitEditorCommandsBase['default'].call(this, {
      name: 'embed',
      button: '<i class="ck-icon-embed"></i>',
      prompt: new _contentKitEditorViewsPrompt['default']({
        command: this,
        placeholder: 'Paste a YouTube or Twitter url...'
      })
    });

    this.embedService = new _contentKitEditorUtilsHttpUtils.OEmbedder({ url: options.serviceUrl });
  }
  (0, _contentKitUtils.inherit)(OEmbedCommand, _contentKitEditorCommandsBase['default']);

  OEmbedCommand.prototype.exec = function (url) {
    var command = this;
    var editorContext = command.editorContext;
    var embedIntent = command.embedIntent;
    var index = editorContext.getCurrentBlockIndex();

    embedIntent.showLoading();
    this.embedService.fetch({
      url: url,
      complete: function complete(response, error) {
        embedIntent.hideLoading();
        if (error) {
          var errorMsg = error;
          if (error.target && error.target.status === 0) {
            errorMsg = 'Error: could not connect to embed service.';
          } else if (typeof error !== 'string') {
            errorMsg = 'Error: unexpected embed error.';
          }
          new _contentKitEditorViewsMessage['default']().showError(errorMsg);
          embedIntent.show();
        } else if (response.error_message) {
          new _contentKitEditorViewsMessage['default']().showError(response.error_message);
          embedIntent.show();
        } else {
          throw new Error('Unimplemented EmbedModel is not a thing');
          var embedModel = new EmbedModel(response);
          editorContext.insertBlock(embedModel, index);
          editorContext.renderBlockAt(index);
          if (embedModel.attributes.provider_name.toLowerCase() === 'twitter') {
            loadTwitterWidgets(editorContext.element);
          }
        }
      }
    });
  };

  exports['default'] = OEmbedCommand;
});
define('content-kit-editor/commands/ordered-list', ['exports', 'content-kit-editor/commands/list', 'content-kit-utils'], function (exports, _contentKitEditorCommandsList, _contentKitUtils) {
  'use strict';

  function OrderedListCommand() {
    _contentKitEditorCommandsList['default'].call(this, {
      name: 'ordered list',
      tag: 'ol',
      action: 'insertOrderedList'
    });
  }
  (0, _contentKitUtils.inherit)(OrderedListCommand, _contentKitEditorCommandsList['default']);

  OrderedListCommand.prototype.autoFormatRegex = /^1\.\s/;

  exports['default'] = OrderedListCommand;
});
define('content-kit-editor/commands/quote', ['exports', 'content-kit-editor/commands/format-block', 'content-kit-utils'], function (exports, _contentKitEditorCommandsFormatBlock, _contentKitUtils) {
  'use strict';

  function QuoteCommand() {
    _contentKitEditorCommandsFormatBlock['default'].call(this, {
      name: 'quote',
      tag: 'blockquote',
      button: '<i class="ck-icon-quote"></i>'
    });
  }
  (0, _contentKitUtils.inherit)(QuoteCommand, _contentKitEditorCommandsFormatBlock['default']);

  exports['default'] = QuoteCommand;
});
define('content-kit-editor/commands/subheading', ['exports', 'content-kit-editor/commands/format-block', 'content-kit-utils'], function (exports, _contentKitEditorCommandsFormatBlock, _contentKitUtils) {
  'use strict';

  function SubheadingCommand() {
    _contentKitEditorCommandsFormatBlock['default'].call(this, {
      name: 'subheading',
      tag: 'h3',
      button: '<i class="ck-icon-heading"></i>2'
    });
  }
  (0, _contentKitUtils.inherit)(SubheadingCommand, _contentKitEditorCommandsFormatBlock['default']);

  exports['default'] = SubheadingCommand;
});
define('content-kit-editor/commands/text-format', ['exports', 'content-kit-editor/commands/base', 'content-kit-utils'], function (exports, _contentKitEditorCommandsBase, _contentKitUtils) {
  'use strict';

  function TextFormatCommand(options) {
    options = options || {};
    _contentKitEditorCommandsBase['default'].call(this, options);
    this.tag = options.tag;
    this.mappedTags = options.mappedTags || [];
    this.mappedTags.push(this.tag);
    this.action = options.action || this.name;
    this.removeAction = options.removeAction || this.action;
  }
  (0, _contentKitUtils.inherit)(TextFormatCommand, _contentKitEditorCommandsBase['default']);

  TextFormatCommand.prototype = {
    exec: function exec(value) {
      document.execCommand(this.action, false, value || null);
    },
    unexec: function unexec(value) {
      document.execCommand(this.removeAction, false, value || null);
    }
  };

  exports['default'] = TextFormatCommand;
});
define('content-kit-editor/commands/unordered-list', ['exports', 'content-kit-editor/commands/list', 'content-kit-utils'], function (exports, _contentKitEditorCommandsList, _contentKitUtils) {
  'use strict';

  function UnorderedListCommand() {
    _contentKitEditorCommandsList['default'].call(this, {
      name: 'list',
      tag: 'ul',
      action: 'insertUnorderedList'
    });
  }
  (0, _contentKitUtils.inherit)(UnorderedListCommand, _contentKitEditorCommandsList['default']);

  UnorderedListCommand.prototype.autoFormatRegex = /^[-*]\s/;

  exports['default'] = UnorderedListCommand;
});
define('content-kit-editor/editor/editor', ['exports', 'content-kit-editor/views/text-format-toolbar', 'content-kit-editor/views/tooltip', 'content-kit-editor/views/embed-intent', 'content-kit-editor/commands/bold', 'content-kit-editor/commands/italic', 'content-kit-editor/commands/link', 'content-kit-editor/commands/quote', 'content-kit-editor/commands/heading', 'content-kit-editor/commands/subheading', 'content-kit-editor/commands/unordered-list', 'content-kit-editor/commands/ordered-list', 'content-kit-editor/commands/image', 'content-kit-editor/commands/oembed', 'content-kit-editor/commands/card', 'content-kit-editor/utils/keycodes', 'content-kit-editor/utils/selection-utils', 'content-kit-editor/utils/event-emitter', 'content-kit-editor/parsers/mobiledoc', 'content-kit-editor/parsers/dom', 'content-kit-editor/renderers/editor-dom', 'content-kit-editor/renderers/mobiledoc', 'content-kit-utils', 'content-kit-editor/utils/dom-utils'], function (exports, _contentKitEditorViewsTextFormatToolbar, _contentKitEditorViewsTooltip, _contentKitEditorViewsEmbedIntent, _contentKitEditorCommandsBold, _contentKitEditorCommandsItalic, _contentKitEditorCommandsLink, _contentKitEditorCommandsQuote, _contentKitEditorCommandsHeading, _contentKitEditorCommandsSubheading, _contentKitEditorCommandsUnorderedList, _contentKitEditorCommandsOrderedList, _contentKitEditorCommandsImage, _contentKitEditorCommandsOembed, _contentKitEditorCommandsCard, _contentKitEditorUtilsKeycodes, _contentKitEditorUtilsSelectionUtils, _contentKitEditorUtilsEventEmitter, _contentKitEditorParsersMobiledoc, _contentKitEditorParsersDom, _contentKitEditorRenderersEditorDom, _contentKitEditorRenderersMobiledoc, _contentKitUtils, _contentKitEditorUtilsDomUtils) {
  'use strict';

  function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

  function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

  var defaults = {
    placeholder: 'Write here...',
    spellcheck: true,
    autofocus: true,
    post: null,
    serverHost: '',
    stickyToolbar: !!('ontouchstart' in window),
    textFormatCommands: [new _contentKitEditorCommandsBold['default'](), new _contentKitEditorCommandsItalic['default'](), new _contentKitEditorCommandsLink['default'](), new _contentKitEditorCommandsQuote['default'](), new _contentKitEditorCommandsHeading['default'](), new _contentKitEditorCommandsSubheading['default']()],
    embedCommands: [new _contentKitEditorCommandsImage['default']({ serviceUrl: '/upload' }), new _contentKitEditorCommandsOembed['default']({ serviceUrl: '/embed' }), new _contentKitEditorCommandsCard['default']()],
    autoTypingCommands: [new _contentKitEditorCommandsUnorderedList['default'](), new _contentKitEditorCommandsOrderedList['default']()],
    cards: {},
    mobiledoc: null
  };

  function forEachChildNode(parentNode, callback) {
    var i = undefined,
        l = undefined;
    for (i = 0, l = parentNode.childNodes.length; i < l; i++) {
      callback(parentNode.childNodes[i]);
    }
  }

  function bindContentEditableTypingListeners(editor) {
    editor.addEventListener(editor.element, 'keyup', function (e) {
      // Assure there is always a supported block tag, and not empty text nodes or divs.
      // On a carrage return, make sure to always generate a 'p' tag
      if (!(0, _contentKitEditorUtilsSelectionUtils.getSelectionBlockElement)() || !editor.element.textContent || !e.shiftKey && e.which === _contentKitEditorUtilsKeycodes['default'].ENTER || e.ctrlKey && e.which === _contentKitEditorUtilsKeycodes['default'].M) {
        document.execCommand('formatBlock', false, 'p');
      } //else if (e.which === Keycodes.BKSP) {
      // TODO: Need to rerender when backspacing 2 blocks together
      //var cursorIndex = editor.getCursorIndexInCurrentBlock();
      //var currentBlockElement = getSelectionBlockElement();
      //editor.renderBlockAt(editor.getCurrentBlockIndex(), true);
      //setCursorIndexInElement(currentBlockElement, cursorIndex);
      //}
    });

    // On 'PASTE' sanitize and insert
    editor.addEventListener(editor.element, 'paste', function (e) {
      var data = e.clipboardData;
      var pastedHTML = data && data.getData && data.getData('text/html');
      var sanitizedHTML = pastedHTML && editor._renderer.rerender(pastedHTML);
      if (sanitizedHTML) {
        document.execCommand('insertHTML', false, sanitizedHTML);
        editor.syncVisual();
      }
      e.preventDefault();
      return false;
    });
  }

  function bindAutoTypingListeners(editor) {
    // Watch typing patterns for auto format commands (e.g. lists '- ', '1. ')
    editor.addEventListener(editor.element, 'keyup', function (e) {
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

  function bindDragAndDrop(editor) {
    // TODO. For now, just prevent redirect when dropping something on the page
    editor.addEventListener(window, 'dragover', function (e) {
      e.preventDefault(); // prevents showing cursor where to drop
    });
    editor.addEventListener(window, 'drop', function (e) {
      e.preventDefault(); // prevent page from redirecting
    });
  }

  function initEmbedCommands(editor) {
    var commands = editor.embedCommands;
    if (commands) {
      return new _contentKitEditorViewsEmbedIntent['default']({
        editorContext: editor,
        commands: commands,
        rootElement: editor.element
      });
    }
  }

  function getNonTextBlocks(blockTypeSet, post) {
    var blocks = [];
    var len = post.length;
    var i, block, type;
    for (i = 0; i < len; i++) {
      block = post[i];
      type = blockTypeSet.findById(block && block.type);
      if (type && !type.isTextType) {
        blocks.push(block);
      }
    }
    return blocks;
  }

  function clearChildNodes(element) {
    while (element.childNodes.length) {
      element.childNodes[0].remove();
    }
  }

  /**
   * @class Editor
   * An individual Editor
   * @param element `Element` node
   * @param options hash of options
   */
  function Editor(element, options) {
    var _this = this,
        _arguments = arguments;

    if (!element) {
      throw new Error('Editor requires an element as the first argument');
    }

    this._elementListeners = [];
    this.element = element;

    // FIXME: This should merge onto this.options
    (0, _contentKitUtils.mergeWithOptions)(this, defaults, options);

    this._renderer = new _contentKitEditorRenderersEditorDom['default'](window.document, this.cards);
    this._parser = new _contentKitEditorParsersDom['default']();

    this.applyClassName();
    this.applyPlaceholder();

    element.spellcheck = this.spellcheck;
    element.setAttribute('contentEditable', true);

    // FIXME: We should be able to pass a serialized payload and disregard
    // whatever is in DOM
    if (this.mobiledoc) {
      this.parseModelFromMobiledoc(this.mobiledoc);
    } else {
      this.parseModelFromDOM(this.element);
    }

    clearChildNodes(element);
    this.syncVisual();

    bindContentEditableTypingListeners(this);
    bindAutoTypingListeners(this);
    bindDragAndDrop(this);
    this.addEventListener(element, 'input', function () {
      return _this.handleInput.apply(_this, _arguments);
    });
    initEmbedCommands(this);

    this.textFormatToolbar = new _contentKitEditorViewsTextFormatToolbar['default']({
      rootElement: element,
      commands: this.textFormatCommands,
      sticky: this.stickyToolbar
    });

    this.linkTooltips = new _contentKitEditorViewsTooltip['default']({
      rootElement: element,
      showForTag: 'a'
    });

    if (this.autofocus) {
      element.focus();
    }
  }

  // Add event emitter pub/sub functionality
  (0, _contentKitUtils.merge)(Editor.prototype, _contentKitEditorUtilsEventEmitter['default']);

  (0, _contentKitUtils.merge)(Editor.prototype, {

    addEventListener: function addEventListener(context, eventName, callback) {
      context.addEventListener(eventName, callback);
      this._elementListeners.push([context, eventName, callback]);
    },

    loadModel: function loadModel(post) {
      this.post = post;
      this.syncVisual();
      this.trigger('update');
    },

    parseModelFromDOM: function parseModelFromDOM(element) {
      this.post = this._parser.parse(element);
      this.trigger('update');
    },

    parseModelFromMobiledoc: function parseModelFromMobiledoc(mobiledoc) {
      this.post = new _contentKitEditorParsersMobiledoc['default']().parse(mobiledoc);
      this.trigger('update');
    },

    syncVisual: function syncVisual() {
      this._renderer.render(this.post, this.element);
    },

    getCurrentBlockIndex: function getCurrentBlockIndex() {
      var selectionEl = this.element || (0, _contentKitEditorUtilsSelectionUtils.getSelectionBlockElement)();
      var blockElements = (0, _contentKitUtils.toArray)(this.element.children);
      return blockElements.indexOf(selectionEl);
    },

    getCursorIndexInCurrentBlock: function getCursorIndexInCurrentBlock() {
      var currentBlock = (0, _contentKitEditorUtilsSelectionUtils.getSelectionBlockElement)();
      if (currentBlock) {
        return (0, _contentKitEditorUtilsSelectionUtils.getCursorOffsetInElement)(currentBlock);
      }
      return -1;
    },

    insertBlock: function insertBlock(block, index) {
      this.post.splice(index, 0, block);
      this.trigger('update');
    },

    removeBlockAt: function removeBlockAt(index) {
      this.post.splice(index, 1);
      this.trigger('update');
    },

    replaceBlock: function replaceBlock(block, index) {
      this.post[index] = block;
      this.trigger('update');
    },

    renderBlockAt: function renderBlockAt(index, replace) {
      throw new Error('Unimplemented');
      var modelAtIndex = this.post[index];
      var html = this.compiler.render([modelAtIndex]);
      var dom = document.createElement('div');
      dom.innerHTML = html;
      var newEl = dom.firstChild;
      newEl.dataset.modelIndex = index;
      var sibling = this.element.children[index];
      if (replace) {
        this.element.replaceChild(newEl, sibling);
      } else {
        this.element.insertBefore(newEl, sibling);
      }
    },

    syncContentEditableBlocks: function syncContentEditableBlocks() {
      throw new Error('Unimplemented');
      var nonTextBlocks = getNonTextBlocks(this.compiler.blockTypes, this.post);
      var blockElements = (0, _contentKitUtils.toArray)(this.element.children);
      var len = blockElements.length;
      var updatedModel = [];
      var i, block, blockEl;
      for (i = 0; i < len; i++) {
        blockEl = blockElements[i];
        if (blockEl.isContentEditable) {
          updatedModel.push(this._parser.serializeBlockNode(blockEl));
        } else {
          if (blockEl.dataset.modelIndex) {
            block = this.model[blockEl.dataset.modelIndex];
            updatedModel.push(block);
          } else {
            updatedModel.push(nonTextBlocks.shift());
          }
        }
      }
      this.post = updatedModel;
      this.trigger('update');
    },

    applyClassName: function applyClassName() {
      var editorClassName = 'ck-editor';
      var editorClassNameRegExp = new RegExp(editorClassName);
      var existingClassName = this.element.className;

      if (!editorClassNameRegExp.test(existingClassName)) {
        existingClassName += (existingClassName ? ' ' : '') + editorClassName;
      }
      this.element.className = existingClassName;
    },

    applyPlaceholder: function applyPlaceholder() {
      var dataset = this.element.dataset;
      var placeholder = this.placeholder;
      if (placeholder && !dataset.placeholder) {
        dataset.placeholder = placeholder;
      }
    },

    handleInput: function handleInput() {
      var _this2 = this;

      // find added sections
      var sectionsInDOM = [];
      var newSections = [];
      var previousSection = undefined;
      forEachChildNode(this.element, function (node) {
        var section = _this2.post.getElementSection(node);
        if (!section) {
          section = _this2._parser.parseSection(previousSection, node);
          _this2.post.setSectionElement(section, node);
          newSections.push(section);
          if (previousSection) {
            _this2.post.insertSectionAfter(section, previousSection);
          } else {
            _this2.post.prependSection(section);
          }
        }
        // may cause duplicates to be included
        sectionsInDOM.push(section);
        previousSection = section;
      });

      // remove deleted nodes
      var i = undefined;
      for (i = this.post.sections.length - 1; i >= 0; i--) {
        var section = this.post.sections[i];
        if (sectionsInDOM.indexOf(section) === -1) {
          this.post.removeSection(section);
        }
      }

      // reparse the section(s) with the cursor
      var sectionsWithCursor = this.getSectionsWithCursor();
      // FIXME: This is a hack to ensure a previous section is parsed when the
      // user presses enter (or pastes a newline)
      var firstSection = sectionsWithCursor[0];
      if (firstSection) {
        var _previousSection = this.post.getPreviousSection(firstSection);
        if (_previousSection) {
          sectionsWithCursor.unshift(_previousSection);
        }
      }
      sectionsWithCursor.forEach(function (section) {
        if (newSections.indexOf(section) === -1) {
          _this2.reparseSection(section);
        }
      });
    },

    getSectionsWithCursor: function getSectionsWithCursor() {
      var _this3 = this;

      var selection = document.getSelection();
      if (selection.rangeCount === 0) {
        return null;
      }

      var range = selection.getRangeAt(0);

      var startElement = range.startContainer;
      var endElement = range.endContainer;

      var getElementSection = function getElementSection(e) {
        return _this3.post.getElementSection(e);
      };

      var _detectParentNode = (0, _contentKitEditorUtilsDomUtils.detectParentNode)(startElement, getElementSection);

      var startSection = _detectParentNode.result;

      var _detectParentNode2 = (0, _contentKitEditorUtilsDomUtils.detectParentNode)(endElement, getElementSection);

      var endSection = _detectParentNode2.result;

      var startIndex = this.post.sections.indexOf(startSection),
          endIndex = this.post.sections.indexOf(endSection);

      return this.post.sections.slice(startIndex, endIndex + 1);
    },

    reparseSection: function reparseSection(section) {
      var sectionElement = this.post.getSectionElement(section);
      var previousSection = this.post.getPreviousSection(section);

      var newSection = this._parser.parseSection(previousSection, sectionElement);
      this.post.replaceSection(section, newSection);
      this.post.setSectionElement(newSection, sectionElement);

      this.trigger('update');
    },

    serialize: function serialize() {
      return _contentKitEditorRenderersMobiledoc['default'].render(this.post);
    },

    removeAllEventListeners: function removeAllEventListeners() {
      this._elementListeners.forEach(function (_ref) {
        var _ref2 = _toArray(_ref);

        var context = _ref2[0];

        var args = _ref2.slice(1);

        context.removeEventListener.apply(context, _toConsumableArray(args));
      });
    },

    destroy: function destroy() {
      this.removeAllEventListeners();
    }

  });

  exports['default'] = Editor;
});
define('content-kit-editor', ['exports', 'content-kit-editor/editor/editor', 'content-kit-editor/runtime/renderers/mobiledoc-dom'], function (exports, _contentKitEditorEditorEditor, _contentKitEditorRuntimeRenderersMobiledocDom) {
  'use strict';

  exports.registerGlobal = registerGlobal;

  var Runtime = {
    DOMRenderer: _contentKitEditorRuntimeRenderersMobiledocDom['default']
  };

  var ContentKit = {
    Editor: _contentKitEditorEditorEditor['default'], Runtime: Runtime
  };

  function registerGlobal(global) {
    global.ContentKit = ContentKit;
  }

  exports.Editor = _contentKitEditorEditorEditor['default'];
  exports['default'] = ContentKit;
});
define('content-kit-editor/models/post', ['exports', 'content-kit-editor/utils/element-map'], function (exports, _contentKitEditorUtilsElementMap) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  // FIXME: making sections a linked-list would greatly improve this

  var Post = (function () {
    function Post() {
      _classCallCheck(this, Post);

      this.type = 'post';
      this.sections = [];
      this.sectionElementMap = new _contentKitEditorUtilsElementMap['default']();
    }

    _createClass(Post, [{
      key: 'appendSection',
      value: function appendSection(section) {
        this.sections.push(section);
      }
    }, {
      key: 'prependSection',
      value: function prependSection(section) {
        this.sections.unshift(section);
      }
    }, {
      key: 'replaceSection',
      value: function replaceSection(section, newSection) {
        this.insertSectionAfter(newSection, section);
        this.removeSection(section);
      }
    }, {
      key: 'insertSectionAfter',
      value: function insertSectionAfter(section, previousSection) {
        var i, l;
        for (i = 0, l = this.sections.length; i < l; i++) {
          if (this.sections[i] === previousSection) {
            this.sections.splice(i + 1, 0, section);
            return;
          }
        }
        throw new Error('Previous section was not found in post.sections');
      }
    }, {
      key: 'setSectionElement',
      value: function setSectionElement(section, element) {
        section.element = element;
        this.sectionElementMap.set(element, section);
      }
    }, {
      key: 'getSectionElement',
      value: function getSectionElement(section) {
        return section && section.element;
      }
    }, {
      key: 'getElementSection',
      value: function getElementSection(element) {
        return this.sectionElementMap.get(element);
      }
    }, {
      key: 'removeSection',
      value: function removeSection(section) {
        this.sectionElementMap.remove(section.element);
        var i, l;
        for (i = 0, l = this.sections.length; i < l; i++) {
          if (this.sections[i] === section) {
            this.sections.splice(i, 1);
            return;
          }
        }
      }
    }, {
      key: 'getPreviousSection',
      value: function getPreviousSection(section) {
        var i, l;
        if (this.sections[0] !== section) {
          for (i = 1, l = this.sections.length; i < l; i++) {
            if (this.sections[i] === section) {
              return this.sections[i - 1];
            }
          }
        }
      }
    }]);

    return Post;
  })();

  exports['default'] = Post;
});
define('content-kit-editor/parsers/dom', ['exports', 'content-kit-editor/utils/post-builder', 'content-kit-utils'], function (exports, _contentKitEditorUtilsPostBuilder, _contentKitUtils) {
  'use strict';

  var ELEMENT_NODE = 1;
  var TEXT_NODE = 3;

  var MARKUP_SECTION_TAG_NAMES = ['P', 'H3', 'H2', 'H1', 'BLOCKQUOTE', 'UL', 'IMG', 'OL'];

  var ALLOWED_ATTRIBUTES = ['href', 'rel', 'src'];

  function isEmptyTextNode(node) {
    return node.nodeType === TEXT_NODE && (0, _contentKitUtils.trim)(node.textContent) === '';
  }

  // FIXME: should probably always return an array
  function readAttributes(node) {
    var attributes = null;
    if (node.hasAttributes()) {
      attributes = [];
      var i, l;
      for (i = 0, l = node.attributes.length; i < l; i++) {
        if (ALLOWED_ATTRIBUTES.indexOf(node.attributes[i].name) !== -1) {
          attributes.push(node.attributes[i].name);
          attributes.push(node.attributes[i].value);
        }
      }
      if (attributes.length === 0) {
        return null;
      }
    }
    return attributes;
  }

  var VALID_MARKER_ELEMENTS = ['B', 'I', 'STRONG', 'EM', 'A'];

  function isValidMarkerElement(element) {
    return VALID_MARKER_ELEMENTS.indexOf(element.tagName) !== -1;
  }

  function parseMarkers(section, postBuilder, topNode) {
    var markerTypes = [];
    var text = null;
    var currentNode = topNode;
    while (currentNode) {
      switch (currentNode.nodeType) {
        case ELEMENT_NODE:
          if (isValidMarkerElement(currentNode)) {
            markerTypes.push(postBuilder.generateMarkerType(currentNode.tagName, readAttributes(currentNode)));
          }
          break;
        case TEXT_NODE:
          text = (text || '') + currentNode.textContent;
          break;
      }

      if (currentNode.firstChild) {
        if (isValidMarkerElement(currentNode) && text !== null) {
          section.markers.push(postBuilder.generateMarker(markerTypes, 0, text));
          markerTypes = [];
          text = null;
        }
        currentNode = currentNode.firstChild;
      } else if (currentNode.nextSibling) {
        if (currentNode === topNode) {
          section.markers.push(postBuilder.generateMarker(markerTypes, markerTypes.length, text));
          break;
        } else {
          currentNode = currentNode.nextSibling;
          if (currentNode.nodeType === ELEMENT_NODE && isValidMarkerElement(currentNode) && text !== null) {
            section.markers.push(postBuilder.generateMarker(markerTypes, 0, text));
            markerTypes = [];
            text = null;
          }
        }
      } else {
        var toClose = 0;
        while (currentNode && !currentNode.nextSibling && currentNode !== topNode) {
          currentNode = currentNode.parentNode;
          if (isValidMarkerElement(currentNode)) {
            toClose++;
          }
        }

        section.markers.push(postBuilder.generateMarker(markerTypes, toClose, text));
        markerTypes = [];
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

  function NewHTMLParser() {
    this.postBuilder = (0, _contentKitEditorUtilsPostBuilder.generateBuilder)();
  }

  NewHTMLParser.prototype = {
    parseSection: function parseSection(previousSection, sectionElement) {
      var postBuilder = this.postBuilder;
      var section;
      switch (sectionElement.nodeType) {
        case ELEMENT_NODE:
          var tagName = sectionElement.tagName;
          // <p> <h2>, etc
          if (MARKUP_SECTION_TAG_NAMES.indexOf(tagName) !== -1) {
            section = postBuilder.generateSection(tagName, readAttributes(sectionElement));
            var node = sectionElement.firstChild;
            while (node) {
              parseMarkers(section, postBuilder, node);
              node = node.nextSibling;
            }
            // <strong> <b>, etc
          } else {
            if (previousSection && previousSection.isGenerated) {
              section = previousSection;
            } else {
              section = postBuilder.generateSection('P', {}, true);
            }
            parseMarkers(section, postBuilder, sectionElement);
          }
          break;
        case TEXT_NODE:
          if (previousSection && previousSection.isGenerated) {
            section = previousSection;
          } else {
            section = postBuilder.generateSection('P', {}, true);
          }
          parseMarkers(section, postBuilder, sectionElement);
          break;
      }
      return section;
    },
    parse: function parse(postElement) {
      var post = this.postBuilder.generatePost();
      var i, l, section, previousSection, sectionElement;
      // FIXME: Instead of storing isGenerated on sections, and passing
      // the previous section to the parser, we could instead do a two-pass
      // parse. The first pass identifies sections and gathers a list of
      // dom nodes that can be parsed for markers, the second pass parses
      // for markers.
      for (i = 0, l = postElement.childNodes.length; i < l; i++) {
        sectionElement = postElement.childNodes[i];
        if (!isEmptyTextNode(sectionElement)) {
          section = this.parseSection(previousSection, sectionElement);
          if (section !== previousSection) {
            post.appendSection(section);
            previousSection = section;
          }
        }
      }
      return post;
    }
  };

  exports['default'] = NewHTMLParser;
});
define('content-kit-editor/parsers/mobiledoc', ['exports', 'content-kit-editor/utils/post-builder'], function (exports, _contentKitEditorUtilsPostBuilder) {
  'use strict';

  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  /*
   * input mobiledoc: [ markers, elements ]
   * output: Post
   *
   */

  var MobiledocParser = (function () {
    function MobiledocParser() {
      _classCallCheck(this, MobiledocParser);

      this.builder = (0, _contentKitEditorUtilsPostBuilder.generateBuilder)();
    }

    _createClass(MobiledocParser, [{
      key: 'parse',
      value: function parse(mobiledoc) {
        var markerTypes = mobiledoc[0];
        var sections = mobiledoc[1];

        var post = this.builder.generatePost();

        this.markerTypes = this.parseMarkerTypes(markerTypes);
        this.parseSections(sections, post);

        return post;
      }
    }, {
      key: 'parseMarkerTypes',
      value: function parseMarkerTypes(markerTypes) {
        var _this = this;

        return markerTypes.map(function (markerType) {
          return _this.parseMarkerType(markerType);
        });
      }
    }, {
      key: 'parseMarkerType',
      value: function parseMarkerType(_ref) {
        var _ref2 = _slicedToArray(_ref, 2);

        var tagName = _ref2[0];
        var attributes = _ref2[1];

        return this.builder.generateMarkerType(tagName, attributes);
      }
    }, {
      key: 'parseSections',
      value: function parseSections(sections, post) {
        var _this2 = this;

        sections.forEach(function (section) {
          return _this2.parseSection(section, post);
        });
      }
    }, {
      key: 'parseSection',
      value: function parseSection(section, post) {
        var _section = _slicedToArray(section, 1);

        var type = _section[0];

        switch (type) {
          case 1:
            // markup section
            this.parseMarkupSection(section, post);
            break;
          default:
            throw new Error('Unexpected section type ' + type);
        }
      }
    }, {
      key: 'parseMarkupSection',
      value: function parseMarkupSection(_ref3, post) {
        var _ref32 = _slicedToArray(_ref3, 3);

        var type = _ref32[0];
        var tagName = _ref32[1];
        var markers = _ref32[2];

        var attributes = null;
        var isGenerated = false;
        var section = this.builder.generateSection(tagName, attributes, isGenerated);

        post.appendSection(section);
        this.parseMarkers(markers, section);
      }
    }, {
      key: 'parseMarkers',
      value: function parseMarkers(markers, section) {
        var _this3 = this;

        markers.forEach(function (marker) {
          return _this3.parseMarker(marker, section);
        });
      }
    }, {
      key: 'parseMarker',
      value: function parseMarker(_ref4, section) {
        var _this4 = this;

        var _ref42 = _slicedToArray(_ref4, 3);

        var markerTypeIndexes = _ref42[0];
        var closeCount = _ref42[1];
        var value = _ref42[2];

        var markerTypes = markerTypeIndexes.map(function (index) {
          return _this4.markerTypes[index];
        });
        var marker = this.builder.generateMarker(markerTypes, closeCount, value);
        section.markers.push(marker);
      }
    }]);

    return MobiledocParser;
  })();

  exports['default'] = MobiledocParser;
});
define('content-kit-editor/renderers/editor-dom', ['exports'], function (exports) {
  'use strict';

  function createElementFromMarkerType(doc, markerType) {
    var element = doc.createElement(markerType.tagName);
    if (markerType.attributes) {
      for (var i = 0, l = markerType.attributes.length; i < l; i = i + 2) {
        element.setAttribute(markerType.attributes[i], markerType.attributes[i + 1]);
      }
    }
    return element;
  }

  function renderMarkupSection(doc, section, markers) {
    var element = doc.createElement(section.tagName);
    var elements = [element];
    var currentElement = element;
    var i, l, j, m, marker, openTypes, closeTypes, text;
    var markerType;
    var openedElement;
    for (i = 0, l = markers.length; i < l; i++) {
      marker = markers[i];
      openTypes = marker.open;
      closeTypes = marker.close;
      text = marker.value;

      for (j = 0, m = openTypes.length; j < m; j++) {
        markerType = openTypes[j];
        openedElement = createElementFromMarkerType(doc, markerType);
        currentElement.appendChild(openedElement);
        elements.push(openedElement);
        currentElement = openedElement;
      }

      currentElement.appendChild(doc.createTextNode(text));

      for (j = 0, m = closeTypes; j < m; j++) {
        elements.pop();
        currentElement = elements[elements.length - 1];
      }
    }

    return element;
  }

  function NewDOMRenderer(doc, cards) {
    if (!doc) {
      throw new Error('renderer must be created with a document');
    }
    this.document = doc;
    if (!cards) {
      throw new Error('renderer must be created with cards');
    }
    this.cards = cards;
  }

  NewDOMRenderer.prototype.render = function NewDOMRenderer_render(post, target) {
    var sections = post.sections;
    var i, l, section, node;
    for (i = 0, l = sections.length; i < l; i++) {
      section = sections[i];
      switch (section.type) {
        case 'markupSection':
          node = renderMarkupSection(this.document, section, section.markers);
          break;
        case 5:
          throw new Error('unimplemented');
        //var componentFn = this.cards[section[1]];
        //node = componentFn(this.document, section.markers);
        //break;
        default:
          throw new Error('attempt to render unknown type:' + section.type);
      }
      post.setSectionElement(section, node);
      target.appendChild(node);
    }
  };

  exports['default'] = NewDOMRenderer;
});
define('content-kit-editor/renderers/mobiledoc', ['exports', 'content-kit-editor/utils/compiler'], function (exports, _contentKitEditorUtilsCompiler) {
  'use strict';

  var visitor = {
    post: function post(node, opcodes) {
      opcodes.push(['openPost']);
      (0, _contentKitEditorUtilsCompiler.visitArray)(visitor, node.sections, opcodes);
    },
    markupSection: function markupSection(node, opcodes) {
      opcodes.push(['openMarkupSection', node.tagName]);
      (0, _contentKitEditorUtilsCompiler.visitArray)(visitor, node.markers, opcodes);
    },
    marker: function marker(node, opcodes) {
      opcodes.push(['openMarker', node.close, node.value]);
      (0, _contentKitEditorUtilsCompiler.visitArray)(visitor, node.open, opcodes);
    },
    markerType: function markerType(node, opcodes) {
      opcodes.push(['openMarkerType', node.tagName, node.attributes]);
    }
  };

  var postOpcodeCompiler = {
    openMarker: function openMarker(closeCount, value) {
      this.markupMarkerIds = [];
      this.markers.push([this.markupMarkerIds, closeCount, value]);
    },
    openMarkupSection: function openMarkupSection(tagName) {
      this.markers = [];
      this.sections.push([1, tagName, this.markers]);
    },
    openPost: function openPost() {
      this.markerTypes = [];
      this.sections = [];
      this.result = [this.markerTypes, this.sections];
    },
    openMarkerType: function openMarkerType(tagName, attributes) {
      if (!this._seenMarkerTypes) {
        this._seenMarkerTypes = {};
      }
      var index = undefined;
      if (attributes) {
        this.markerTypes.push([tagName, attributes]);
        index = this.markerTypes.length - 1;
      } else {
        index = this._seenMarkerTypes[tagName];
        if (index === undefined) {
          this.markerTypes.push([tagName]);
          this._seenMarkerTypes[tagName] = index = this.markerTypes.length - 1;
        }
      }
      this.markupMarkerIds.push(index);
    }
  };

  exports['default'] = {
    render: function render(post) {
      var opcodes = [];
      (0, _contentKitEditorUtilsCompiler.visit)(visitor, post, opcodes);
      var compiler = Object.create(postOpcodeCompiler);
      (0, _contentKitEditorUtilsCompiler.compile)(compiler, opcodes);
      return compiler.result;
    }
  };
});
define('content-kit-editor/runtime/renderers/mobiledoc-dom', ['exports', 'mobiledoc-dom-renderer'], function (exports, _mobiledocDomRenderer) {
  'use strict';

  exports['default'] = _mobiledocDomRenderer['default'];
});
define('content-kit-editor/utils/compat', ['exports', 'content-kit-editor/utils/doc', 'content-kit-editor/utils/win'], function (exports, _contentKitEditorUtilsDoc, _contentKitEditorUtilsWin) {
  'use strict';

  exports.doc = _contentKitEditorUtilsDoc['default'];
  exports.win = _contentKitEditorUtilsWin['default'];
});
define("content-kit-editor/utils/compiler", ["exports"], function (exports) {
  "use strict";

  exports.visit = visit;
  exports.compile = compile;
  exports.visitArray = visitArray;

  function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

  function visit(visitor, node, opcodes) {
    visitor[node.type](node, opcodes);
  }

  function compile(compiler, opcodes) {
    for (var i = 0, l = opcodes.length; i < l; i++) {
      var _opcodes$i = _toArray(opcodes[i]);

      var method = _opcodes$i[0];

      var params = _opcodes$i.slice(1);

      if (params.length) {
        compiler[method].apply(compiler, params);
      } else {
        compiler[method].call(compiler);
      }
    }
  }

  function visitArray(visitor, nodes, opcodes) {
    if (!nodes || nodes.length === 0) {
      return;
    }
    for (var i = 0, l = nodes.length; i < l; i++) {
      visit(visitor, nodes[i], opcodes);
    }
  }
});
define("content-kit-editor/utils/dom-utils", ["exports"], function (exports) {
  "use strict";

  exports.detectParentNode = detectParentNode;

  function detectParentNode(element, callback) {
    while (element) {
      var result = callback(element);
      if (result) {
        return {
          element: element,
          result: result
        };
      }
      element = element.parentNode;
    }

    return {
      element: null,
      result: null
    };
  }
});
define('content-kit-editor/utils/element-map', ['exports'], function (exports) {
  // start at one to make the falsy semantics easier
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var uuidGenerator = 1;

  var ElementMap = (function () {
    function ElementMap() {
      _classCallCheck(this, ElementMap);

      this._map = {};
    }

    _createClass(ElementMap, [{
      key: 'set',
      value: function set(key, value) {
        var uuid = key._uuid;
        if (!uuid) {
          key._uuid = uuid = '' + uuidGenerator++;
        }
        this._map[uuid] = value;
      }
    }, {
      key: 'get',
      value: function get(key) {
        if (key._uuid) {
          return this._map[key._uuid];
        }
        return null;
      }
    }, {
      key: 'remove',
      value: function remove(key) {
        if (!key._uuid) {
          throw new Error('tried to fetch a value for an element not seen before');
        }
        delete this._map[key._uuid];
      }
    }]);

    return ElementMap;
  })();

  exports['default'] = ElementMap;
});
define('content-kit-editor/utils/element-utils', ['exports'], function (exports) {
  'use strict';

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
    while (parentNode) {
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
      offset.top = offsetParentRect.top;
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
    top = round(rect.top - relativeOffset.top - topOffset);
    style.left = left + 'px';
    style.top = top + 'px';
    return { left: left, top: top };
  }

  function positionElementHorizontallyCenteredToRect(element, rect, topOffset) {
    var horizontalCenter = element.offsetWidth / 2 - rect.width / 2;
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
    var verticalCenter = inElement.offsetHeight / 2 - element.offsetHeight / 2;
    return positionElementHorizontallyCenteredToRect(element, inElement.getBoundingClientRect(), -verticalCenter);
  }

  function positionElementToLeftOf(element, leftOfElement) {
    var verticalCenter = leftOfElement.offsetHeight / 2 - element.offsetHeight / 2;
    var elementMargin = getElementComputedStyleNumericProp(element, 'marginRight');
    return positionElementToRect(element, leftOfElement.getBoundingClientRect(), -verticalCenter, element.offsetWidth + elementMargin);
  }

  function positionElementToRightOf(element, rightOfElement) {
    var verticalCenter = rightOfElement.offsetHeight / 2 - element.offsetHeight / 2;
    var elementMargin = getElementComputedStyleNumericProp(element, 'marginLeft');
    var rightOfElementRect = rightOfElement.getBoundingClientRect();
    return positionElementToRect(element, rightOfElementRect, -verticalCenter, -rightOfElement.offsetWidth - elementMargin);
  }

  exports.createDiv = createDiv;
  exports.hideElement = hideElement;
  exports.showElement = showElement;
  exports.swapElements = swapElements;
  exports.getEventTargetMatchingTag = getEventTargetMatchingTag;
  exports.nodeIsDescendantOfElement = nodeIsDescendantOfElement;
  exports.elementContentIsEmpty = elementContentIsEmpty;
  exports.getElementRelativeOffset = getElementRelativeOffset;
  exports.getElementComputedStyleNumericProp = getElementComputedStyleNumericProp;
  exports.positionElementToRect = positionElementToRect;
  exports.positionElementHorizontallyCenteredToRect = positionElementHorizontallyCenteredToRect;
  exports.positionElementCenteredAbove = positionElementCenteredAbove;
  exports.positionElementCenteredBelow = positionElementCenteredBelow;
  exports.positionElementCenteredIn = positionElementCenteredIn;
  exports.positionElementToLeftOf = positionElementToLeftOf;
  exports.positionElementToRightOf = positionElementToRightOf;
});
define("content-kit-editor/utils/event-emitter", ["exports"], function (exports) {
  // Based on https://github.com/jeromeetienne/microevent.js/blob/master/microevent.js
  // See also: https://github.com/allouis/minivents/blob/master/minivents.js

  "use strict";

  var EventEmitter = {
    on: function on(type, handler) {
      var events = this.__events = this.__events || {};
      events[type] = events[type] || [];
      events[type].push(handler);
    },
    off: function off(type, handler) {
      var events = this.__events = this.__events || {};
      if (type in events) {
        events[type].splice(events[type].indexOf(handler), 1);
      }
    },
    trigger: function trigger(type) {
      var events = this.__events = this.__events || {};
      var eventForTypeCount, i;
      if (type in events) {
        eventForTypeCount = events[type].length;
        for (i = 0; i < eventForTypeCount; i++) {
          events[type][i].apply(this, Array.prototype.slice.call(arguments, 1));
        }
      }
    }
  };

  exports["default"] = EventEmitter;
});
define('content-kit-editor/utils/http-utils', ['exports'], function (exports) {
  'use strict';

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
    } catch (error) {}
  }

  function xhrPost(options) {
    options.method = 'POST';
    var xhr = createXHR(options);
    var formData = new FormData();
    formData.append('file', options.data);
    try {
      xhr.send(formData);
    } catch (error) {}
  }

  function responseJSON(jsonString) {
    if (!jsonString) {
      return null;
    }
    try {
      return JSON.parse(jsonString);
    } catch (e) {
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

  FileUploader.prototype.upload = function (options) {
    if (!options) {
      return;
    }

    var fileInput = options.fileInput;
    var file = options.file || fileInput && fileInput.files && fileInput.files[0];
    var callback = options.complete;
    var maxFileSize = this.maxFileSize;
    if (!file || !(file instanceof window.File)) {
      return;
    }

    if (maxFileSize && file.size > maxFileSize) {
      if (callback) {
        callback.call(this, null, { message: 'max file size is ' + maxFileSize + ' bytes' });
      }
      return;
    }

    xhrPost({
      url: this.url,
      data: file,
      success: function success(response) {
        if (callback) {
          callback.call(this, responseJSON(response));
        }
      },
      error: function error(_error) {
        if (callback) {
          callback.call(this, null, responseJSON(_error));
        }
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

  OEmbedder.prototype.fetch = function (options) {
    var callback = options.complete;
    xhrGet({
      url: this.url + '?url=' + encodeURI(options.url),
      success: function success(response) {
        if (callback) {
          callback.call(this, responseJSON(response));
        }
      },
      error: function error(_error2) {
        if (callback) {
          callback.call(this, null, responseJSON(_error2));
        }
      }
    });
  };

  exports.FileUploader = FileUploader;
  exports.OEmbedder = OEmbedder;
});
define("content-kit-editor/utils/keycodes", ["exports"], function (exports) {
  "use strict";

  exports["default"] = {
    BKSP: 8,
    ENTER: 13,
    ESC: 27,
    DEL: 46,
    M: 77
  };
});
define('content-kit-editor/utils/post-builder', ['exports', 'content-kit-editor/models/post'], function (exports, _contentKitEditorModelsPost) {
  'use strict';

  exports.generateBuilder = generateBuilder;

  var builder = {
    generatePost: function generatePost() {
      return new _contentKitEditorModelsPost['default']();
    },
    generateSection: function generateSection(tagName, attributes, isGenerated) {
      var section = {
        type: 'markupSection',
        tagName: tagName,
        markers: []
      };
      if (attributes && attributes.length) {
        section.attributes = attributes;
      }
      if (isGenerated) {
        section.isGenerated = !!isGenerated;
      }
      return section;
    },
    // open: Array
    // close: Integer
    // value: String
    generateMarker: function generateMarker(open, close, value) {
      return {
        type: 'marker',
        open: open,
        close: close,
        value: value
      };
    },
    generateMarkerType: function generateMarkerType(tagName, attributes) {
      if (attributes) {
        // FIXME: This could also be cached
        return {
          type: 'markerType',
          tagName: tagName,
          attributes: attributes
        };
      }
      var markerType = this._markerTypeCache[tagName];
      if (!markerType) {
        this._markerTypeCache[tagName] = markerType = {
          type: 'markerType',
          tagName: tagName
        };
      }
      return markerType;
    }
  };

  function reset(builder) {
    builder._markerTypeCache = {};
  }

  function generateBuilder() {
    reset(builder);
    return builder;
  }
});
define('content-kit-editor/utils/selection-utils', ['exports', 'content-kit-editor/utils/element-utils'], function (exports, _contentKitEditorUtilsElementUtils) {
  'use strict';

  // TODO: remove, pass in Editor's current block set
  var RootTags = ['p', 'h2', 'h3', 'blockquote', 'ul', 'ol'];

  var SelectionDirection = {
    LEFT_TO_RIGHT: 1,
    RIGHT_TO_LEFT: 2,
    SAME_NODE: 3
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
    while (element) {
      if (element.contentEditable === 'true') {
        break;
      } // Stop traversing up dom when hitting an editor element
      if (element.tagName) {
        tags.push(element.tagName.toLowerCase());
      }
      element = element.parentNode;
    }
    return tags;
  }

  function selectionIsInElement(selection, element) {
    var node = selection.anchorNode;
    return node && (0, _contentKitEditorUtilsElementUtils.nodeIsDescendantOfElement)(node, element);
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

  exports.getDirectionOfSelection = getDirectionOfSelection;
  exports.getSelectionElement = getSelectionElement;
  exports.getSelectionBlockElement = getSelectionBlockElement;
  exports.getSelectionTagName = getSelectionTagName;
  exports.getSelectionBlockTagName = getSelectionBlockTagName;
  exports.tagsInSelection = tagsInSelection;
  exports.selectionIsInElement = selectionIsInElement;
  exports.selectionIsEditable = selectionIsEditable;
  exports.restoreRange = restoreRange;
  exports.selectNode = selectNode;
  exports.setCursorToStartOfElement = setCursorToStartOfElement;
  exports.setCursorIndexInElement = setCursorIndexInElement;
  exports.getCursorOffsetInElement = getCursorOffsetInElement;
});
define('content-kit-editor/views/embed-intent', ['exports', 'content-kit-editor/views/view', 'content-kit-editor/views/toolbar', 'content-kit-utils', 'content-kit-editor/utils/selection-utils', 'content-kit-editor/utils/element-utils', 'content-kit-editor/utils/keycodes'], function (exports, _contentKitEditorViewsView, _contentKitEditorViewsToolbar, _contentKitUtils, _contentKitEditorUtilsSelectionUtils, _contentKitEditorUtilsElementUtils, _contentKitEditorUtilsKeycodes) {
  'use strict';

  var LayoutStyle = {
    GUTTER: 1,
    CENTERED: 2
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
    _contentKitEditorViewsView['default'].call(embedIntent, options);

    embedIntent.isActive = false;
    embedIntent.editorContext = options.editorContext;
    embedIntent.loadingIndicator = (0, _contentKitEditorUtilsElementUtils.createDiv)('ck-embed-loading');
    embedIntent.button = document.createElement('button');
    embedIntent.button.className = 'ck-embed-intent-btn';
    embedIntent.button.title = 'Insert image or embed...';
    embedIntent.element.appendChild(embedIntent.button);
    embedIntent.button.addEventListener('mouseup', function (e) {
      if (embedIntent.isActive) {
        embedIntent.deactivate();
      } else {
        embedIntent.activate();
      }
      e.stopPropagation();
    });

    embedIntent.toolbar = new _contentKitEditorViewsToolbar['default']({
      container: embedIntent.element,
      embedIntent: embedIntent,
      editor: embedIntent.editorContext,
      commands: options.commands,
      direction: _contentKitEditorViewsToolbar['default'].Direction.RIGHT
    });

    function embedIntentHandler() {
      var blockElement = (0, _contentKitEditorUtilsSelectionUtils.getSelectionBlockElement)();
      if (blockElement && (0, _contentKitEditorUtilsElementUtils.elementContentIsEmpty)(blockElement)) {
        embedIntent.showAt(blockElement);
      } else {
        embedIntent.hide();
      }
    }

    rootElement.addEventListener('keyup', embedIntentHandler);
    document.addEventListener('mouseup', function () {
      setTimeout(function () {
        embedIntentHandler();
      });
    });

    document.addEventListener('keyup', function (e) {
      if (e.keyCode === _contentKitEditorUtilsKeycodes['default'].ESC) {
        embedIntent.hide();
      }
    });

    window.addEventListener('resize', function () {
      if (embedIntent.isShowing) {
        embedIntent.reposition();
      }
    });
  }
  (0, _contentKitUtils.inherit)(EmbedIntent, _contentKitEditorViewsView['default']);

  EmbedIntent.prototype.hide = function () {
    if (EmbedIntent._super.prototype.hide.call(this)) {
      this.deactivate();
    }
  };

  EmbedIntent.prototype.showAt = function (node) {
    this.atNode = node;
    this.show();
    this.deactivate();
    this.reposition();
  };

  EmbedIntent.prototype.reposition = function () {
    if (computeLayoutStyle(this.rootElement) === LayoutStyle.GUTTER) {
      (0, _contentKitEditorUtilsElementUtils.positionElementToLeftOf)(this.element, this.atNode);
    } else {
      (0, _contentKitEditorUtilsElementUtils.positionElementCenteredIn)(this.element, this.atNode);
    }
  };

  EmbedIntent.prototype.activate = function () {
    if (!this.isActive) {
      this.addClass('activated');
      this.toolbar.show();
      this.isActive = true;
    }
  };

  EmbedIntent.prototype.deactivate = function () {
    if (this.isActive) {
      this.removeClass('activated');
      this.toolbar.hide();
      this.isActive = false;
    }
  };

  EmbedIntent.prototype.showLoading = function () {
    var embedIntent = this;
    var loadingIndicator = embedIntent.loadingIndicator;
    embedIntent.hide();
    embedIntent.atNode.appendChild(loadingIndicator);
  };

  EmbedIntent.prototype.hideLoading = function () {
    this.atNode.removeChild(this.loadingIndicator);
  };

  exports['default'] = EmbedIntent;
});
define('content-kit-editor/views/message', ['exports', 'content-kit-editor/views/view', 'content-kit-utils'], function (exports, _contentKitEditorViewsView, _contentKitUtils) {
  'use strict';

  var defaultClassNames = ['ck-message'];

  function Message(options) {
    options = options || {};
    options.classNames = defaultClassNames;
    _contentKitEditorViewsView['default'].call(this, options);
  }
  (0, _contentKitUtils.inherit)(Message, _contentKitEditorViewsView['default']);

  function show(view, message) {
    view.element.innerHTML = message;
    Message._super.prototype.show.call(view);
    setTimeout(function () {
      view.hide();
    }, 3200);
  }

  Message.prototype.showInfo = function (message) {
    this.setClasses(defaultClassNames);
    show(this, message);
  };

  Message.prototype.showError = function (message) {
    this.addClass('ck-message-error');
    show(this, message);
  };

  exports['default'] = Message;
});
define('content-kit-editor/views/prompt', ['exports', 'content-kit-editor/views/view', 'content-kit-utils', 'content-kit-editor/utils/selection-utils', 'content-kit-editor/utils/element-utils', 'content-kit-editor/utils/keycodes'], function (exports, _contentKitEditorViewsView, _contentKitUtils, _contentKitEditorUtilsSelectionUtils, _contentKitEditorUtilsElementUtils, _contentKitEditorUtilsKeycodes) {
  'use strict';

  var container = document.body;
  var hiliter = (0, _contentKitEditorUtilsElementUtils.createDiv)('ck-editor-hilite');

  function positionHiliteRange(range) {
    var rect = range.getBoundingClientRect();
    var style = hiliter.style;
    style.width = rect.width + 'px';
    style.height = rect.height + 'px';
    (0, _contentKitEditorUtilsElementUtils.positionElementToRect)(hiliter, rect);
  }

  function Prompt(options) {
    var prompt = this;
    options.tagName = 'input';
    _contentKitEditorViewsView['default'].call(prompt, options);

    prompt.command = options.command;
    prompt.element.placeholder = options.placeholder || '';
    prompt.element.addEventListener('mouseup', function (e) {
      e.stopPropagation();
    }); // prevents closing prompt when clicking input
    prompt.element.addEventListener('keyup', function (e) {
      var entry = this.value;
      if (entry && prompt.range && !e.shiftKey && e.which === _contentKitEditorUtilsKeycodes['default'].ENTER) {
        (0, _contentKitEditorUtilsSelectionUtils.restoreRange)(prompt.range);
        prompt.command.exec(entry);
        if (prompt.onComplete) {
          prompt.onComplete();
        }
      }
    });

    window.addEventListener('resize', function () {
      var activeHilite = hiliter.parentNode;
      var range = prompt.range;
      if (activeHilite && range) {
        positionHiliteRange(range);
      }
    });
  }
  (0, _contentKitUtils.inherit)(Prompt, _contentKitEditorViewsView['default']);

  Prompt.prototype.show = function (callback) {
    var prompt = this;
    var element = prompt.element;
    var selection = window.getSelection();
    var range = selection && selection.rangeCount && selection.getRangeAt(0);
    element.value = null;
    prompt.range = range || null;
    if (range) {
      container.appendChild(hiliter);
      positionHiliteRange(prompt.range);
      setTimeout(function () {
        element.focus();
      }); // defer focus (disrupts mouseup events)
      if (callback) {
        prompt.onComplete = callback;
      }
    }
  };

  Prompt.prototype.hide = function () {
    if (hiliter.parentNode) {
      container.removeChild(hiliter);
    }
  };

  exports['default'] = Prompt;
});
define('content-kit-editor/views/text-format-toolbar', ['exports', 'content-kit-editor/views/toolbar', 'content-kit-utils', 'content-kit-editor/utils/selection-utils', 'content-kit-editor/utils/keycodes'], function (exports, _contentKitEditorViewsToolbar, _contentKitUtils, _contentKitEditorUtilsSelectionUtils, _contentKitEditorUtilsKeycodes) {
  'use strict';

  function selectionIsEditableByToolbar(selection, toolbar) {
    return (0, _contentKitEditorUtilsSelectionUtils.selectionIsEditable)(selection) && (0, _contentKitEditorUtilsSelectionUtils.selectionIsInElement)(selection, toolbar.rootElement);
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
    _contentKitEditorViewsToolbar['default'].call(this, options);
    toolbar.rootElement = options.rootElement;
    toolbar.rootElement.addEventListener('keyup', function () {
      handleTextSelection(toolbar);
    });

    document.addEventListener('mouseup', function () {
      setTimeout(function () {
        handleTextSelection(toolbar);
      });
    });

    document.addEventListener('keyup', function (e) {
      var key = e.keyCode;
      if (key === 116) {
        //F5
        toolbar.toggleSticky();
        handleTextSelection(toolbar);
      } else if (!toolbar.sticky && key === _contentKitEditorUtilsKeycodes['default'].ESC) {
        toolbar.hide();
      }
    });

    window.addEventListener('resize', function () {
      if (!toolbar.sticky && toolbar.isShowing) {
        var activePromptRange = toolbar.activePrompt && toolbar.activePrompt.range;
        toolbar.positionToContent(activePromptRange ? activePromptRange : window.getSelection().getRangeAt(0));
      }
    });
  }
  (0, _contentKitUtils.inherit)(TextFormatToolbar, _contentKitEditorViewsToolbar['default']);

  exports['default'] = TextFormatToolbar;
});
define('content-kit-editor/views/toolbar-button', ['exports'], function (exports) {
  'use strict';

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
    element.addEventListener('mouseup', function (e) {
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
    setActive: function setActive() {
      var button = this;
      if (!button.isActive) {
        button.element.className = buttonClassName + ' active';
        button.isActive = true;
      }
    },
    setInactive: function setInactive() {
      var button = this;
      if (button.isActive) {
        button.element.className = buttonClassName;
        button.isActive = false;
      }
    }
  };

  exports['default'] = ToolbarButton;
});
define('content-kit-editor/views/toolbar', ['exports', 'content-kit-editor/views/view', 'content-kit-editor/views/toolbar-button', 'content-kit-utils', 'content-kit-editor/utils/selection-utils', 'content-kit-editor/utils/element-utils'], function (exports, _contentKitEditorViewsView, _contentKitEditorViewsToolbarButton, _contentKitUtils, _contentKitEditorUtilsSelectionUtils, _contentKitEditorUtilsElementUtils) {
  'use strict';

  var ToolbarDirection = {
    TOP: 1,
    RIGHT: 2
  };

  function selectionContainsButtonsTag(selectedTags, buttonsTags) {
    return selectedTags.filter(function (tag) {
      return buttonsTags.indexOf(tag) > -1;
    }).length;
  }

  function updateButtonsForSelection(buttons, selection) {
    var selectedTags = (0, _contentKitEditorUtilsSelectionUtils.tagsInSelection)(selection);
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
    var commandCount = commands && commands.length,
        i;
    options.classNames = ['ck-toolbar'];
    _contentKitEditorViewsView['default'].call(toolbar, options);

    toolbar.setSticky(options.sticky || false);
    toolbar.setDirection(options.direction || ToolbarDirection.TOP);
    toolbar.editor = options.editor || null;
    toolbar.embedIntent = options.embedIntent || null;
    toolbar.activePrompt = null;
    toolbar.buttons = [];

    toolbar.contentElement = (0, _contentKitEditorUtilsElementUtils.createDiv)('ck-toolbar-content');
    toolbar.promptContainerElement = (0, _contentKitEditorUtilsElementUtils.createDiv)('ck-toolbar-prompt');
    toolbar.buttonContainerElement = (0, _contentKitEditorUtilsElementUtils.createDiv)('ck-toolbar-buttons');
    toolbar.contentElement.appendChild(toolbar.promptContainerElement);
    toolbar.contentElement.appendChild(toolbar.buttonContainerElement);
    toolbar.element.appendChild(toolbar.contentElement);

    for (i = 0; i < commandCount; i++) {
      this.addCommand(commands[i]);
    }

    // Closes prompt if displayed when changing selection
    document.addEventListener('mouseup', function () {
      toolbar.dismissPrompt();
    });
  }
  (0, _contentKitUtils.inherit)(Toolbar, _contentKitEditorViewsView['default']);

  Toolbar.prototype.hide = function () {
    if (Toolbar._super.prototype.hide.call(this)) {
      var style = this.element.style;
      style.left = '';
      style.top = '';
      this.dismissPrompt();
    }
  };

  Toolbar.prototype.addCommand = function (command) {
    command.editorContext = this.editor;
    command.embedIntent = this.embedIntent;
    var button = new _contentKitEditorViewsToolbarButton['default']({ command: command, toolbar: this });
    this.buttons.push(button);
    this.buttonContainerElement.appendChild(button.element);
  };

  Toolbar.prototype.displayPrompt = function (prompt) {
    var toolbar = this;
    (0, _contentKitEditorUtilsElementUtils.swapElements)(toolbar.promptContainerElement, toolbar.buttonContainerElement);
    toolbar.promptContainerElement.appendChild(prompt.element);
    prompt.show(function () {
      toolbar.dismissPrompt();
      toolbar.updateForSelection();
    });
    toolbar.activePrompt = prompt;
  };

  Toolbar.prototype.dismissPrompt = function () {
    var toolbar = this;
    var activePrompt = toolbar.activePrompt;
    if (activePrompt) {
      activePrompt.hide();
      (0, _contentKitEditorUtilsElementUtils.swapElements)(toolbar.buttonContainerElement, toolbar.promptContainerElement);
      toolbar.activePrompt = null;
    }
  };

  Toolbar.prototype.updateForSelection = function (selection) {
    var toolbar = this;
    selection = selection || window.getSelection();
    if (toolbar.sticky) {
      updateButtonsForSelection(toolbar.buttons, selection);
    } else if (!selection.isCollapsed) {
      toolbar.positionToContent(selection.getRangeAt(0));
      updateButtonsForSelection(toolbar.buttons, selection);
    }
  };

  Toolbar.prototype.positionToContent = function (content) {
    var directions = ToolbarDirection;
    var positioningMethod, position, sideEdgeOffset;
    switch (this.direction) {
      case directions.RIGHT:
        positioningMethod = _contentKitEditorUtilsElementUtils.positionElementToRightOf;
        break;
      default:
        positioningMethod = _contentKitEditorUtilsElementUtils.positionElementCenteredAbove;
    }
    position = positioningMethod(this.element, content);
    sideEdgeOffset = Math.min(Math.max(10, position.left), document.body.clientWidth - this.element.offsetWidth - 10);
    this.contentElement.style.transform = 'translateX(' + (sideEdgeOffset - position.left) + 'px)';
  };

  Toolbar.prototype.setDirection = function (direction) {
    this.direction = direction;
    if (direction === ToolbarDirection.RIGHT) {
      this.addClass('right');
    } else {
      this.removeClass('right');
    }
  };

  Toolbar.prototype.setSticky = function (sticky) {
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

  Toolbar.prototype.toggleSticky = function () {
    this.setSticky(!this.sticky);
  };

  Toolbar.Direction = ToolbarDirection;

  exports['default'] = Toolbar;
});
define('content-kit-editor/views/tooltip', ['exports', 'content-kit-editor/views/view', 'content-kit-utils', 'content-kit-editor/utils/element-utils'], function (exports, _contentKitEditorViewsView, _contentKitUtils, _contentKitEditorUtilsElementUtils) {
  'use strict';

  function Tooltip(options) {
    var tooltip = this;
    var rootElement = options.rootElement;
    var delay = options.delay || 200;
    var timeout;
    options.classNames = ['ck-tooltip'];
    _contentKitEditorViewsView['default'].call(tooltip, options);

    rootElement.addEventListener('mouseover', function (e) {
      var target = (0, _contentKitEditorUtilsElementUtils.getEventTargetMatchingTag)(options.showForTag, e.target, rootElement);
      if (target && target.isContentEditable) {
        timeout = setTimeout(function () {
          tooltip.showLink(target.href, target);
        }, delay);
      }
    });

    rootElement.addEventListener('mouseout', function (e) {
      clearTimeout(timeout);
      var toElement = e.toElement || e.relatedTarget;
      if (toElement && toElement.className !== tooltip.element.className) {
        tooltip.hide();
      }
    });
  }
  (0, _contentKitUtils.inherit)(Tooltip, _contentKitEditorViewsView['default']);

  Tooltip.prototype.showMessage = function (message, element) {
    var tooltip = this;
    var tooltipElement = tooltip.element;
    tooltipElement.innerHTML = message;
    tooltip.show();
    (0, _contentKitEditorUtilsElementUtils.positionElementCenteredBelow)(tooltipElement, element);
  };

  Tooltip.prototype.showLink = function (link, element) {
    var message = '<a href="' + link + '" target="_blank">' + link + '</a>';
    this.showMessage(message, element);
  };

  exports['default'] = Tooltip;
});
define('content-kit-editor/views/view', ['exports'], function (exports) {
  'use strict';

  function renderClasses(view) {
    var classNames = view.classNames;
    if (classNames && classNames.length) {
      view.element.className = classNames.join(' ');
    } else if (view.element.className) {
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
    show: function show() {
      var view = this;
      if (!view.isShowing) {
        view.container.appendChild(view.element);
        view.isShowing = true;
        return true;
      }
    },
    hide: function hide() {
      var view = this;
      if (view.isShowing) {
        view.container.removeChild(view.element);
        view.isShowing = false;
        return true;
      }
    },
    addClass: function addClass(className) {
      var index = this.classNames && this.classNames.indexOf(className);
      if (index === -1) {
        this.classNames.push(className);
        renderClasses(this);
      }
    },
    removeClass: function removeClass(className) {
      var index = this.classNames && this.classNames.indexOf(className);
      if (index > -1) {
        this.classNames.splice(index, 1);
        renderClasses(this);
      }
    },
    setClasses: function setClasses(classNameArr) {
      this.classNames = classNameArr;
      renderClasses(this);
    }
  };

  exports['default'] = View;
});
define("content-kit-utils/array-utils", ["exports"], function (exports) {
  /**
   * Converts an array-like object (i.e. NodeList) to Array
   * Note: could just use Array.prototype.slice but does not work in IE <= 8
   */
  "use strict";

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
    var sum = 0,
        i;
    for (i in array) {
      // 'for in' is better for sparse arrays
      if (array.hasOwnProperty(i)) {
        sum += array[i];
      }
    }
    return sum;
  }

  exports.toArray = toArray;
  exports.sumSparseArray = sumSparseArray;
});
define('content-kit-utils', ['exports', 'content-kit-utils/array-utils', 'content-kit-utils/node-utils', 'content-kit-utils/object-utils', 'content-kit-utils/string-utils'], function (exports, _contentKitUtilsArrayUtils, _contentKitUtilsNodeUtils, _contentKitUtilsObjectUtils, _contentKitUtilsStringUtils) {
  'use strict';

  exports.toArray = _contentKitUtilsArrayUtils.toArray;
  exports.sumSparseArray = _contentKitUtilsArrayUtils.sumSparseArray;
  exports.textOfNode = _contentKitUtilsNodeUtils.textOfNode;
  exports.unwrapNode = _contentKitUtilsNodeUtils.unwrapNode;
  exports.attributesForNode = _contentKitUtilsNodeUtils.attributesForNode;
  exports.mergeWithOptions = _contentKitUtilsObjectUtils.mergeWithOptions;
  exports.merge = _contentKitUtilsObjectUtils.merge;
  exports.inherit = _contentKitUtilsObjectUtils.inherit;
  exports.trim = _contentKitUtilsStringUtils.trim;
  exports.trimLeft = _contentKitUtilsStringUtils.trimLeft;
  exports.underscore = _contentKitUtilsStringUtils.underscore;
  exports.sanitizeWhitespace = _contentKitUtilsStringUtils.sanitizeWhitespace;
  exports.injectIntoString = _contentKitUtilsStringUtils.injectIntoString;

  // needs a default export to be compatible with
  // broccoli-multi-builder
  exports['default'] = {};
});
define('content-kit-utils/node-utils', ['exports', 'content-kit-utils/string-utils', 'content-kit-utils/array-utils'], function (exports, _contentKitUtilsStringUtils, _contentKitUtilsArrayUtils) {
  'use strict';

  /**
   * Returns plain-text of a `Node`
   */
  function textOfNode(node) {
    var text = node.textContent || node.innerText;
    return text ? (0, _contentKitUtilsStringUtils.sanitizeWhitespace)(text) : '';
  }

  /**
   * Replaces a `Node` with its children
   */
  function unwrapNode(node) {
    if (node.hasChildNodes()) {
      var children = (0, _contentKitUtilsArrayUtils.toArray)(node.childNodes);
      var len = children.length;
      var parent = node.parentNode,
          i;
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
        if (blacklist && name in blacklist) {
          continue;
        }
        hash = hash || {};
        hash[name] = attr.value;
      }
    }
    return hash;
  }

  exports.textOfNode = textOfNode;
  exports.unwrapNode = unwrapNode;
  exports.attributesForNode = attributesForNode;
});
define("content-kit-utils/object-utils", ["exports"], function (exports) {
  /**
   * Merges defaults/options into an Object
   * Useful for constructors
   */
  "use strict";

  function mergeWithOptions(original, updates, options) {
    options = options || {};
    for (var prop in updates) {
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

  exports.mergeWithOptions = mergeWithOptions;
  exports.merge = merge;
  exports.inherit = inherit;
});
define('content-kit-utils/string-utils', ['exports'], function (exports) {
  'use strict';

  var RegExpTrim = /^\s+|\s+$/g;
  var RegExpTrimLeft = /^\s+/;
  var RegExpWSChars = /(\r\n|\n|\r|\t)/gm;
  var RegExpMultiWS = /\s+/g;
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

  exports.trim = trim;
  exports.trimLeft = trimLeft;
  exports.underscore = underscore;
  exports.sanitizeWhitespace = sanitizeWhitespace;
  exports.injectIntoString = injectIntoString;
});
define('mobiledoc-dom-renderer/dom-renderer', ['exports'], function (exports) {
  /**
   * runtime DOM renderer
   * renders a mobiledoc to DOM
   *
   * input: mobiledoc
   * output: DOM
   */

  'use strict';

  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var utils = {
    createElement: function createElement(tagName) {
      return document.createElement(tagName);
    },
    appendChild: function appendChild(target, child) {
      target.appendChild(child);
    },
    createTextNode: function createTextNode(text) {
      return document.createTextNode(text);
    }
  };

  function createElementFromMarkerType() {
    var _ref = arguments[0] === undefined ? ['', []] : arguments[0];

    var _ref2 = _slicedToArray(_ref, 2);

    var tagName = _ref2[0];
    var attributes = _ref2[1];

    var element = utils.createElement(tagName);
    attributes = attributes || [];

    for (var i = 0, l = attributes.length; i < l; i = i + 2) {
      var propName = attributes[i],
          propValue = attributes[i + 1];
      element.setAttribute(propName, propValue);
    }
    return element;
  }

  var DOMRenderer = (function () {
    function DOMRenderer() {
      _classCallCheck(this, DOMRenderer);
    }

    _createClass(DOMRenderer, [{
      key: 'render',

      /**
       * @param mobiledoc
       * @param rootElement optional, defaults to an empty div
       * @return DOMNode
       */
      value: function render(mobiledoc) {
        var _this = this;

        var rootElement = arguments[1] === undefined ? utils.createElement('div') : arguments[1];

        var _mobiledoc = _slicedToArray(mobiledoc, 2);

        var markerTypes = _mobiledoc[0];
        var sections = _mobiledoc[1];

        this.root = rootElement;
        this.markerTypes = markerTypes;

        sections.forEach(function (section) {
          return _this.renderSection(section);
        });

        return this.root;
      }
    }, {
      key: 'renderSection',
      value: function renderSection(section) {
        var _section = _slicedToArray(section, 1);

        var type = _section[0];

        switch (type) {
          case 1:
            var rendered = this.renderParagraphSection(section);
            utils.appendChild(this.root, rendered);
            break;
          default:
            throw new Error('Unimplement renderer for type ' + type);
        }
      }
    }, {
      key: 'renderParagraphSection',
      value: function renderParagraphSection(_ref3) {
        var _ref32 = _slicedToArray(_ref3, 3);

        var type = _ref32[0];
        var tagName = _ref32[1];
        var markers = _ref32[2];

        var element = utils.createElement(tagName);
        var elements = [element];
        var currentElement = element;

        for (var i = 0, l = markers.length; i < l; i++) {
          var marker = markers[i];

          var _marker = _slicedToArray(marker, 3);

          var openTypes = _marker[0];
          var closeTypes = _marker[1];
          var text = _marker[2];

          for (var j = 0, m = openTypes.length; j < m; j++) {
            var markerType = this.markerTypes[openTypes[j]];
            var openedElement = createElementFromMarkerType(markerType);
            utils.appendChild(currentElement, openedElement);
            elements.push(openedElement);
            currentElement = openedElement;
          }

          utils.appendChild(currentElement, utils.createTextNode(text));

          for (var j = 0, m = closeTypes; j < m; j++) {
            elements.pop();
            currentElement = elements[elements.length - 1];
          }
        }

        return element;
      }
    }]);

    return DOMRenderer;
  })();

  exports['default'] = DOMRenderer;
});
define('mobiledoc-dom-renderer', ['exports', 'mobiledoc-dom-renderer/dom-renderer'], function (exports, _mobiledocDomRendererDomRenderer) {
  'use strict';

  exports.registerGlobal = registerGlobal;

  function registerGlobal(window) {
    window.MobiledocDOMRenderer = _mobiledocDomRendererDomRenderer['default'];
  }

  exports['default'] = _mobiledocDomRendererDomRenderer['default'];
});
require("content-kit-editor")["registerGlobal"](window, document);
})();