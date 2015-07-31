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

  function injectCardBlock() /* cardName, cardPayload, editor, index */{
    throw new Error('Unimplemented: BlockModel and Type.CARD are no longer things');
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
      /*
      value = Type.PARAGRAPH.tag;
      */
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
define('content-kit-editor/commands/image', ['exports', 'content-kit-editor/commands/base', 'content-kit-editor/views/message', 'content-kit-utils', 'content-kit-editor/utils/http-utils', 'content-kit-editor/utils/post-builder'], function (exports, _contentKitEditorCommandsBase, _contentKitEditorViewsMessage, _contentKitUtils, _contentKitEditorUtilsHttpUtils, _contentKitEditorUtilsPostBuilder) {
  'use strict';

  function readFromFile(file, callback) {
    var reader = new FileReader();
    reader.onload = function (_ref) {
      var target = _ref.target;
      return callback(target.result);
    };
    reader.readAsDataURL(file);
  }

  function ImageCommand(options) {
    _contentKitEditorCommandsBase['default'].call(this, {
      name: 'image',
      button: '<i class="ck-icon-image"></i>'
    });
    this.uploader = new _contentKitEditorUtilsHttpUtils.FileUploader({
      url: options.serviceUrl,
      maxFileSize: 5000000
    });
  }
  (0, _contentKitUtils.inherit)(ImageCommand, _contentKitEditorCommandsBase['default']);

  ImageCommand.prototype = {
    exec: function exec() {
      ImageCommand._super.prototype.exec.call(this);
      var fileInput = this.getFileInput();
      fileInput.dispatchEvent(new MouseEvent('click', { bubbles: false }));
    },
    getFileInput: function getFileInput() {
      var _this = this;

      if (this._fileInput) {
        return this._fileInput;
      }

      var fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.className = 'ck-file-input';
      fileInput.addEventListener('change', function (e) {
        return _this.handleFile(e);
      });
      document.body.appendChild(fileInput);

      return fileInput;
    },
    handleFile: function handleFile(_ref2) {
      var _this2 = this;

      var fileInput = _ref2.target;

      var imageSection = undefined;

      var file = fileInput.files[0];
      readFromFile(file, function (base64Image) {
        imageSection = (0, _contentKitEditorUtilsPostBuilder.generateBuilder)().generateImageSection(base64Image);
        _this2.editorContext.insertSectionAtCursor(imageSection);
        _this2.editorContext.rerender();
      });

      this.uploader.upload({
        fileInput: fileInput,
        complete: function complete(response, error) {
          if (!imageSection) {
            throw new Error('Upload completed before the image was read into memory');
          }
          if (!error && response && response.url) {
            imageSection.src = response.url;
            imageSection.renderNode.markDirty();
            _this2.editorContext.rerender();
            _this2.editorContext.trigger('update');
          } else {
            _this2.editorContext.removeSection(imageSection);
            new _contentKitEditorViewsMessage['default']().showError(error.message || 'Error uploading image');
          }
          _this2.editorContext.rerender();
        }
      });
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

  /*
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
  */

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
    // var editorContext = command.editorContext;
    var embedIntent = command.embedIntent;
    // var index = editorContext.getCurrentBlockIndex();

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
define('content-kit-editor/editor/editor', ['exports', 'content-kit-editor/views/text-format-toolbar', 'content-kit-editor/views/tooltip', 'content-kit-editor/views/embed-intent', 'content-kit-editor/commands/bold', 'content-kit-editor/commands/italic', 'content-kit-editor/commands/link', 'content-kit-editor/commands/quote', 'content-kit-editor/commands/heading', 'content-kit-editor/commands/subheading', 'content-kit-editor/commands/unordered-list', 'content-kit-editor/commands/ordered-list', 'content-kit-editor/commands/image', 'content-kit-editor/commands/oembed', 'content-kit-editor/commands/card', 'content-kit-editor/utils/keycodes', 'content-kit-editor/utils/selection-utils', 'content-kit-editor/utils/event-emitter', 'content-kit-editor/parsers/mobiledoc', 'content-kit-editor/parsers/post', 'content-kit-editor/renderers/editor-dom', 'content-kit-editor/models/render-tree', 'content-kit-editor/renderers/mobiledoc', 'content-kit-utils', 'content-kit-editor/utils/dom-utils', 'content-kit-editor/utils/array-utils', 'content-kit-editor/utils/element-utils', 'content-kit-editor/utils/mixin', 'content-kit-editor/utils/event-listener', 'content-kit-editor/models/cursor', 'content-kit-editor/models/markup-section', 'content-kit-editor/utils/post-builder'], function (exports, _contentKitEditorViewsTextFormatToolbar, _contentKitEditorViewsTooltip, _contentKitEditorViewsEmbedIntent, _contentKitEditorCommandsBold, _contentKitEditorCommandsItalic, _contentKitEditorCommandsLink, _contentKitEditorCommandsQuote, _contentKitEditorCommandsHeading, _contentKitEditorCommandsSubheading, _contentKitEditorCommandsUnorderedList, _contentKitEditorCommandsOrderedList, _contentKitEditorCommandsImage, _contentKitEditorCommandsOembed, _contentKitEditorCommandsCard, _contentKitEditorUtilsKeycodes, _contentKitEditorUtilsSelectionUtils, _contentKitEditorUtilsEventEmitter, _contentKitEditorParsersMobiledoc, _contentKitEditorParsersPost, _contentKitEditorRenderersEditorDom, _contentKitEditorModelsRenderTree, _contentKitEditorRenderersMobiledoc, _contentKitUtils, _contentKitEditorUtilsDomUtils, _contentKitEditorUtilsArrayUtils, _contentKitEditorUtilsElementUtils, _contentKitEditorUtilsMixin, _contentKitEditorUtilsEventListener, _contentKitEditorModelsCursor, _contentKitEditorModelsMarkupSection, _contentKitEditorUtilsPostBuilder) {
  'use strict';

  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var defaults = {
    placeholder: 'Write here...',
    spellcheck: true,
    autofocus: true,
    post: null,
    serverHost: '',
    // FIXME PhantomJS has 'ontouchstart' in window,
    // causing the stickyToolbar to accidentally be auto-activated
    // in tests
    stickyToolbar: false, // !!('ontouchstart' in window),
    textFormatCommands: [new _contentKitEditorCommandsBold['default'](), new _contentKitEditorCommandsItalic['default'](), new _contentKitEditorCommandsLink['default'](), new _contentKitEditorCommandsQuote['default'](), new _contentKitEditorCommandsHeading['default'](), new _contentKitEditorCommandsSubheading['default']()],
    embedCommands: [new _contentKitEditorCommandsImage['default']({ serviceUrl: '/upload' }), new _contentKitEditorCommandsOembed['default']({ serviceUrl: '/embed' }), new _contentKitEditorCommandsCard['default']()],
    autoTypingCommands: [new _contentKitEditorCommandsUnorderedList['default'](), new _contentKitEditorCommandsOrderedList['default']()],
    cards: [],
    cardOptions: {},
    unknownCardHandler: function unknownCardHandler() {
      throw new Error('Unknown card encountered');
    },
    mobiledoc: null
  };

  function bindContentEditableTypingListeners(editor) {
    // On 'PASTE' sanitize and insert
    editor.addEventListener(editor.element, 'paste', function (e) {
      var data = e.clipboardData;
      var pastedHTML = data && data.getData && data.getData('text/html');
      var sanitizedHTML = pastedHTML && editor._renderer.rerender(pastedHTML);
      if (sanitizedHTML) {
        document.execCommand('insertHTML', false, sanitizedHTML);
        editor.rerender();
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

  function handleSelection(editor) {
    return function () {
      if (editor.cursor.hasSelection()) {
        editor.hasSelection();
      } else {
        editor.hasNoSelection();
      }
    };
  }

  function bindSelectionEvent(editor) {
    /**
     * The following events/sequences can create a selection and are handled:
     *  * mouseup -- can happen anywhere in document, must wait until next tick to read selection
     *  * keyup when key is a movement key and shift is pressed -- in editor element
     *  * keyup when key combo was cmd-A (alt-A) aka "select all"
     *  * keyup when key combo was cmd-Z (browser restores selection if there was one)
     *
     * These cases can create a selection and are not handled:
     *  * ctrl-click -> context menu -> click "select all"
     */

    // mouseup will not properly report a selection until the next tick, so add a timeout:
    var mouseupHandler = function mouseupHandler() {
      return setTimeout(handleSelection(editor));
    };
    editor.addEventListener(document, 'mouseup', mouseupHandler);

    var keyupHandler = handleSelection(editor);
    editor.addEventListener(editor.element, 'keyup', keyupHandler);
  }

  function bindKeyListeners(editor) {
    // escape key
    editor.addEventListener(document, 'keyup', function (event) {
      if (event.keyCode === _contentKitEditorUtilsKeycodes['default'].ESC) {
        editor.trigger('escapeKey');
      }
    });

    editor.addEventListener(document, 'keydown', function (event) {
      switch (event.keyCode) {
        case _contentKitEditorUtilsKeycodes['default'].BACKSPACE:
        case _contentKitEditorUtilsKeycodes['default'].DELETE:
          editor.handleDeletion(event);
          break;
        case _contentKitEditorUtilsKeycodes['default'].ENTER:
          editor.handleNewline(event);
          break;
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
      editor.addView(new _contentKitEditorViewsEmbedIntent['default']({
        editorContext: editor,
        commands: commands,
        rootElement: editor.element
      }));
    }
  }

  /**
   * @class Editor
   * An individual Editor
   * @param element `Element` node
   * @param options hash of options
   */

  var Editor = (function () {
    function Editor(element, options) {
      var _this = this;

      _classCallCheck(this, Editor);

      if (!element) {
        throw new Error('Editor requires an element as the first argument');
      }

      this._elementListeners = [];
      this._views = [];
      this.element = element;

      // FIXME: This should merge onto this.options
      (0, _contentKitUtils.mergeWithOptions)(this, defaults, options);

      this._parser = _contentKitEditorParsersPost['default'];
      this._renderer = new _contentKitEditorRenderersEditorDom['default'](this.cards, this.unknownCardHandler, this.cardOptions);

      this.applyClassName();
      this.applyPlaceholder();

      element.spellcheck = this.spellcheck;
      element.setAttribute('contentEditable', true);

      if (this.mobiledoc) {
        this.parseModelFromMobiledoc(this.mobiledoc);
      } else {
        this.parseModelFromDOM(this.element);
      }

      (0, _contentKitEditorUtilsDomUtils.clearChildNodes)(element);
      this.rerender();

      bindContentEditableTypingListeners(this);
      bindAutoTypingListeners(this);
      bindDragAndDrop(this);
      bindSelectionEvent(this);
      bindKeyListeners(this);
      this.addEventListener(element, 'input', function () {
        return _this.handleInput();
      });
      initEmbedCommands(this);

      this.addView(new _contentKitEditorViewsTextFormatToolbar['default']({
        editor: this,
        rootElement: element,
        commands: this.textFormatCommands,
        sticky: this.stickyToolbar
      }));

      this.addView(new _contentKitEditorViewsTooltip['default']({
        rootElement: element,
        showForTag: 'a'
      }));

      if (this.autofocus) {
        element.focus();
      }
    }

    _createClass(Editor, [{
      key: 'addView',
      value: function addView(view) {
        this._views.push(view);
      }
    }, {
      key: 'loadModel',
      value: function loadModel(post) {
        this.post = post;
        this.rerender();
        this.trigger('update');
      }
    }, {
      key: 'parseModelFromDOM',
      value: function parseModelFromDOM(element) {
        this.post = this._parser.parse(element);
        this._renderTree = new _contentKitEditorModelsRenderTree['default']();
        var node = this._renderTree.buildRenderNode(this.post);
        this._renderTree.node = node;
        this.trigger('update');
      }
    }, {
      key: 'parseModelFromMobiledoc',
      value: function parseModelFromMobiledoc(mobiledoc) {
        this.post = new _contentKitEditorParsersMobiledoc['default']().parse(mobiledoc);
        this._renderTree = new _contentKitEditorModelsRenderTree['default']();
        var node = this._renderTree.buildRenderNode(this.post);
        this._renderTree.node = node;
        this.trigger('update');
      }
    }, {
      key: 'rerender',
      value: function rerender() {
        var postRenderNode = this.post.renderNode;
        if (!postRenderNode.element) {
          postRenderNode.element = this.element;
          postRenderNode.markDirty();
        }

        this._renderer.render(this._renderTree);
      }

      // FIXME ensure we handle deletion when there is a selection
    }, {
      key: 'handleDeletion',
      value: function handleDeletion(event) {
        var _cursor$offsets = this.cursor.offsets;

        // need to handle these cases:
        // when cursor is:
        //   * A in the middle of a marker -- just delete the character
        //   * B offset is 0 and there is a previous marker
        //     * delete last char of previous marker
        //   * C offset is 0 and there is no previous marker
        //     * join this section with previous section

        var leftRenderNode = _cursor$offsets.leftRenderNode;
        var leftOffset = _cursor$offsets.leftOffset;
        var currentMarker = leftRenderNode.postNode;
        var nextCursorMarker = currentMarker;
        var nextCursorOffset = leftOffset - 1;

        // A: in the middle of a marker
        if (leftOffset !== 0) {
          currentMarker.deleteValueAtOffset(leftOffset - 1);
          if (currentMarker.length === 0 && currentMarker.section.markers.length > 1) {
            leftRenderNode.scheduleForRemoval();

            var isFirstRenderNode = leftRenderNode === leftRenderNode.parentNode.firstChild;
            if (isFirstRenderNode) {
              // move cursor to start of next node
              nextCursorMarker = leftRenderNode.nextSibling.postNode;
              nextCursorOffset = 0;
            } else {
              // move cursor to end of prev node
              nextCursorMarker = leftRenderNode.previousSibling.postNode;
              nextCursorOffset = leftRenderNode.previousSibling.postNode.length;
            }
          } else {
            leftRenderNode.markDirty();
          }
        } else {
          var currentSection = currentMarker.section;
          var previousMarker = currentMarker.previousSibling;
          if (previousMarker) {
            // (B)
            var markerLength = previousMarker.length;
            previousMarker.deleteValueAtOffset(markerLength - 1);
          } else {
            // (C)
            // possible previous sections:
            //   * none -- do nothing
            //   * markup section -- join to it
            //   * non-markup section (card) -- select it? delete it?
            var previousSection = this.post.getPreviousSection(currentSection);
            if (previousSection) {
              var isMarkupSection = previousSection.type === _contentKitEditorModelsMarkupSection.MARKUP_SECTION_TYPE;

              if (isMarkupSection) {
                var previousSectionMarkerLength = previousSection.markers.length;
                previousSection.join(currentSection);
                previousSection.renderNode.markDirty();
                currentSection.renderNode.scheduleForRemoval();

                nextCursorMarker = previousSection.markers[previousSectionMarkerLength];
                nextCursorOffset = 0;
                /*
                } else {
                  // card section: ??
                */
              }
            } else {
                // no previous section -- do nothing
                nextCursorMarker = currentMarker;
                nextCursorOffset = 0;
              }
          }
        }

        this.rerender();

        this.cursor.moveToNode(nextCursorMarker.renderNode.element, nextCursorOffset);

        this.trigger('update');
        event.preventDefault();
      }
    }, {
      key: 'handleNewline',
      value: function handleNewline(event) {
        var _cursor$offsets2 = this.cursor.offsets;

        // if there's no left/right nodes, we are probably not in the editor,
        // or we have selected some non-marker thing like a card
        var leftRenderNode = _cursor$offsets2.leftRenderNode;
        var rightRenderNode = _cursor$offsets2.rightRenderNode;
        var leftOffset = _cursor$offsets2.leftOffset;
        if (!leftRenderNode || !rightRenderNode) {
          return;
        }

        // FIXME handle when the selection is not collapsed, this code assumes it is
        event.preventDefault();

        var markerRenderNode = leftRenderNode;
        var marker = markerRenderNode.postNode;
        var section = marker.section;

        var _marker$split = marker.split(leftOffset);

        var _marker$split2 = _slicedToArray(_marker$split, 2);

        var leftMarker = _marker$split2[0];
        var rightMarker = _marker$split2[1];

        section.insertMarkerAfter(leftMarker, marker);
        markerRenderNode.scheduleForRemoval();

        var newSection = (0, _contentKitEditorUtilsPostBuilder.generateBuilder)().generateMarkupSection('P');
        newSection.appendMarker(rightMarker);

        var nodeForMove = markerRenderNode.nextSibling;
        while (nodeForMove) {
          nodeForMove.scheduleForRemoval();
          var movedMarker = nodeForMove.postNode.clone();
          newSection.appendMarker(movedMarker);

          nodeForMove = nodeForMove.nextSibling;
        }

        var post = this.post;
        post.insertSectionAfter(newSection, section);

        this.rerender();
        this.trigger('update');

        this.cursor.moveToSection(newSection);
      }
    }, {
      key: 'hasSelection',
      value: function hasSelection() {
        if (!this._hasSelection) {
          this.trigger('selection');
        } else {
          this.trigger('selectionUpdated');
        }
        this._hasSelection = true;
      }
    }, {
      key: 'hasNoSelection',
      value: function hasNoSelection() {
        if (this._hasSelection) {
          this.trigger('selectionEnded');
        }
        this._hasSelection = false;
      }
    }, {
      key: 'cancelSelection',
      value: function cancelSelection() {
        if (this._hasSelection) {
          // FIXME perhaps restore cursor position to end of the selection?
          this.cursor.clearSelection();
          this.hasNoSelection();
        }
      }
    }, {
      key: 'getActiveMarkers',
      value: function getActiveMarkers() {
        var cursor = this.cursor;
        return cursor.activeMarkers;
      }
    }, {
      key: 'getActiveSections',
      value: function getActiveSections() {
        var cursor = this.cursor;
        return cursor.activeSections;
      }
    }, {
      key: 'getCurrentBlockIndex',
      value: function getCurrentBlockIndex() {
        var selectionEl = this.element || (0, _contentKitEditorUtilsSelectionUtils.getSelectionBlockElement)();
        var blockElements = (0, _contentKitUtils.toArray)(this.element.children);
        return blockElements.indexOf(selectionEl);
      }
    }, {
      key: 'getCursorIndexInCurrentBlock',
      value: function getCursorIndexInCurrentBlock() {
        var currentBlock = (0, _contentKitEditorUtilsSelectionUtils.getSelectionBlockElement)();
        if (currentBlock) {
          return (0, _contentKitEditorUtilsSelectionUtils.getCursorOffsetInElement)(currentBlock);
        }
        return -1;
      }
    }, {
      key: 'applyClassName',
      value: function applyClassName() {
        var editorClassName = 'ck-editor';
        var editorClassNameRegExp = new RegExp(editorClassName);
        var existingClassName = this.element.className;

        if (!editorClassNameRegExp.test(existingClassName)) {
          existingClassName += (existingClassName ? ' ' : '') + editorClassName;
        }
        this.element.className = existingClassName;
      }
    }, {
      key: 'applyPlaceholder',
      value: function applyPlaceholder() {
        var placeholder = this.placeholder;
        var existingPlaceholder = (0, _contentKitEditorUtilsElementUtils.getData)(this.element, 'placeholder');

        if (placeholder && !existingPlaceholder) {
          (0, _contentKitEditorUtilsElementUtils.setData)(this.element, 'placeholder', placeholder);
        }
      }

      /**
       * types of input to handle:
       *   * delete from beginning of section
       *       joins 2 sections
       *   * delete when multiple sections selected
       *       removes wholly-selected sections,
       *       joins the partially-selected sections
       *   * hit enter (handled by capturing 'keydown' for enter key and `handleNewline`)
       *       if anything is selected, delete it first, then
       *       split the current marker at the cursor position,
       *         schedule removal of every marker after the split,
       *         create new section, append it to post
       *         append the after-split markers onto the new section
       *         rerender -- this should render the new section at the appropriate spot
       */
    }, {
      key: 'handleInput',
      value: function handleInput() {
        this.reparse();
        this.trigger('update');
      }
    }, {
      key: 'reparse',
      value: function reparse() {
        var _this2 = this;

        // find added sections
        var sectionsInDOM = [];
        var newSections = [];
        var previousSection = undefined;

        (0, _contentKitEditorUtilsArrayUtils.forEach)(this.element.childNodes, function (node) {
          var sectionRenderNode = _this2._renderTree.getElementRenderNode(node);
          if (!sectionRenderNode) {
            var _section = _this2._parser.parseSection(node);
            newSections.push(_section);

            // create a clean "already-rendered" node to represent the fact that
            // this (new) section is already in DOM
            sectionRenderNode = _this2._renderTree.buildRenderNode(_section);
            sectionRenderNode.element = node;
            sectionRenderNode.markClean();

            if (previousSection) {
              // insert after existing section
              _this2.post.insertSectionAfter(_section, previousSection);
              _this2._renderTree.node.insertAfter(sectionRenderNode, previousSection.renderNode);
            } else {
              // prepend at beginning (first section)
              _this2.post.prependSection(_section);
              _this2._renderTree.node.insertAfter(sectionRenderNode, null);
            }
          }
          // may cause duplicates to be included
          var section = sectionRenderNode.postNode;
          sectionsInDOM.push(section);
          previousSection = section;
        });

        // remove deleted nodes
        var i = undefined;
        for (i = this.post.sections.length - 1; i >= 0; i--) {
          var section = this.post.sections[i];
          if (sectionsInDOM.indexOf(section) === -1) {
            if (section.renderNode) {
              section.renderNode.scheduleForRemoval();
            } else {
              throw new Error('All sections are expected to have a renderNode');
            }
          }
        }

        // reparse the section(s) with the cursor
        var sectionsWithCursor = this.getSectionsWithCursor();
        sectionsWithCursor.forEach(function (section) {
          if (newSections.indexOf(section) === -1) {
            _this2.reparseSection(section);
          }
        });

        var _cursor$offsets3 = this.cursor.offsets;

        // The cursor will lose its textNode if we have parsed (and thus rerendered)
        // its section. Ensure the cursor is placed where it should be after render.
        //
        // New sections are presumed clean, and thus do not get rerendered and lose
        // their cursor position.
        //
        var leftRenderNode = _cursor$offsets3.leftRenderNode;
        var leftOffset = _cursor$offsets3.leftOffset;
        var rightRenderNode = _cursor$offsets3.rightRenderNode;
        var rightOffset = _cursor$offsets3.rightOffset;
        var resetCursor = leftRenderNode && sectionsWithCursor.indexOf(leftRenderNode.postNode.section) !== -1;

        if (resetCursor) {
          var unprintableOffset = leftRenderNode.element.textContent.indexOf(_contentKitEditorRenderersEditorDom.UNPRINTABLE_CHARACTER);
          if (unprintableOffset !== -1) {
            leftRenderNode.markDirty();
            if (unprintableOffset < leftOffset) {
              // FIXME: we should move backward/forward some number of characters
              // with a method on markers that returns the relevent marker and
              // offset (may not be the marker it was called with);
              leftOffset--;
              rightOffset--;
            }
          }
        }

        this.rerender();
        this.trigger('update');

        if (resetCursor) {
          this.cursor.moveToNode(leftRenderNode.element, leftOffset, rightRenderNode.element, rightOffset);
        }
      }
    }, {
      key: 'getSectionsWithCursor',
      value: function getSectionsWithCursor() {
        return this.getRenderNodesWithCursor().map(function (renderNode) {
          return renderNode.postNode;
        });
      }
    }, {
      key: 'getRenderNodesWithCursor',
      value: function getRenderNodesWithCursor() {
        var _this3 = this;

        var selection = document.getSelection();
        if (selection.rangeCount === 0) {
          return null;
        }

        var range = selection.getRangeAt(0);

        var startElement = range.startContainer;
        var endElement = range.endContainer;

        var getElementRenderNode = function getElementRenderNode(e) {
          var node = _this3._renderTree.getElementRenderNode(e);
          if (node && node.postNode.type === _contentKitEditorModelsMarkupSection.MARKUP_SECTION_TYPE) {
            return node;
          }
        };

        var _detectParentNode = (0, _contentKitEditorUtilsDomUtils.detectParentNode)(startElement, getElementRenderNode);

        var startRenderNode = _detectParentNode.result;

        var _detectParentNode2 = (0, _contentKitEditorUtilsDomUtils.detectParentNode)(endElement, getElementRenderNode);

        var endRenderNode = _detectParentNode2.result;

        var nodes = [];
        var node = startRenderNode;
        while (node && (!endRenderNode.nextSibling || endRenderNode.nextSibling !== node)) {
          nodes.push(node);
          node = node.nextSibling;
        }

        return nodes;
      }
    }, {
      key: 'reparseSection',
      value: function reparseSection(section) {
        this._parser.reparseSection(section, this._renderTree);
      }
    }, {
      key: 'serialize',
      value: function serialize() {
        return _contentKitEditorRenderersMobiledoc['default'].render(this.post);
      }
    }, {
      key: 'removeAllViews',
      value: function removeAllViews() {
        this._views.forEach(function (v) {
          return v.destroy();
        });
        this._views = [];
      }
    }, {
      key: 'insertSectionAtCursor',
      value: function insertSectionAtCursor(newSection) {
        var newRenderNode = this._renderTree.buildRenderNode(newSection);
        var renderNodes = this.getRenderNodesWithCursor();
        var lastRenderNode = renderNodes[renderNodes.length - 1];
        lastRenderNode.parentNode.insertAfter(newRenderNode, lastRenderNode);
        this.post.insertSectionAfter(newSection, lastRenderNode.postNode);
        renderNodes.forEach(function (renderNode) {
          return renderNode.scheduleForRemoval();
        });
        this.trigger('update');
      }
    }, {
      key: 'removeSection',
      value: function removeSection(section) {
        this.post.removeSection(section);
      }
    }, {
      key: 'destroy',
      value: function destroy() {
        this.removeAllEventListeners();
        this.removeAllViews();
      }
    }, {
      key: 'cursor',
      get: function get() {
        return new _contentKitEditorModelsCursor['default'](this);
      }
    }]);

    return Editor;
  })();

  (0, _contentKitEditorUtilsMixin['default'])(Editor, _contentKitEditorUtilsEventEmitter['default']);
  (0, _contentKitEditorUtilsMixin['default'])(Editor, _contentKitEditorUtilsEventListener['default']);

  exports['default'] = Editor;
});
define('content-kit-editor', ['exports', 'content-kit-editor/editor/editor'], function (exports, _contentKitEditorEditorEditor) {
  'use strict';

  exports.registerGlobal = registerGlobal;

  var ContentKit = {
    Editor: _contentKitEditorEditorEditor['default']
  };

  function registerGlobal(global) {
    global.ContentKit = ContentKit;
  }

  exports.Editor = _contentKitEditorEditorEditor['default'];
  exports['default'] = ContentKit;
});
define('content-kit-editor/models/card-node', ['exports'], function (exports) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var CardNode = (function () {
    function CardNode(card, section, element, cardOptions) {
      _classCallCheck(this, CardNode);

      this.card = card;
      this.section = section;
      this.cardOptions = cardOptions;
      this.element = element;

      this.mode = null;
      this.setupResult = null;
    }

    _createClass(CardNode, [{
      key: 'render',
      value: function render(mode) {
        if (this.mode === mode) {
          return;
        }

        this.teardown();

        this.mode = mode;
        this.setupResult = this.card[mode].setup(this.element, this.cardOptions, this.env, this.section.payload);
      }
    }, {
      key: 'display',
      value: function display() {
        this.render('display');
      }
    }, {
      key: 'edit',
      value: function edit() {
        this.render('edit');
      }
    }, {
      key: 'teardown',
      value: function teardown() {
        if (this.mode) {
          if (this.card[this.mode].teardown) {
            this.card[this.mode].teardown(this.setupResult);
          }
        }
      }
    }, {
      key: 'env',
      get: function get() {
        var _this = this;

        return {
          name: this.card.name,
          edit: function edit() {
            _this.edit();
          },
          save: function save(payload) {
            _this.section.payload = payload;
            _this.display();
          },
          cancel: function cancel() {
            _this.display();
          }
        };
      }
    }]);

    return CardNode;
  })();

  exports['default'] = CardNode;
});
define('content-kit-editor/models/card', ['exports'], function (exports) {
  'use strict';

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var CARD_TYPE = 'card-section';

  exports.CARD_TYPE = CARD_TYPE;

  var Card = function Card(name, payload) {
    _classCallCheck(this, Card);

    this.name = name;
    this.payload = payload;
    this.type = CARD_TYPE;
  };

  exports['default'] = Card;
});
define('content-kit-editor/models/cursor', ['exports', 'content-kit-editor/utils/array-utils', 'content-kit-editor/utils/selection-utils', 'content-kit-editor/utils/dom-utils'], function (exports, _contentKitEditorUtilsArrayUtils, _contentKitEditorUtilsSelectionUtils, _contentKitEditorUtilsDomUtils) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var Cursor = (function () {
    function Cursor(editor) {
      _classCallCheck(this, Cursor);

      this.editor = editor;
      this.renderTree = editor._renderTree;
      this.post = editor.post;
    }

    _createClass(Cursor, [{
      key: 'hasSelection',
      value: function hasSelection() {
        var parentElement = this.editor.element;
        return (0, _contentKitEditorUtilsSelectionUtils.isSelectionInElement)(parentElement);
      }
    }, {
      key: 'clearSelection',
      value: function clearSelection() {
        (0, _contentKitEditorUtilsSelectionUtils.clearSelection)();
      }
    }, {
      key: 'moveToSection',

      // moves cursor to the start of the section
      value: function moveToSection(section) {
        var marker = section.markers[0];
        if (!marker) {
          throw new Error('Cannot move cursor to section without a marker');
        }
        var markerElement = marker.renderNode.element;

        var r = document.createRange();
        r.selectNode(markerElement);
        r.collapse(true);
        var selection = this.selection;
        if (selection.rangeCount > 0) {
          selection.removeAllRanges();
        }
        selection.addRange(r);
      }
    }, {
      key: 'moveToNode',
      value: function moveToNode(node) {
        var offset = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
        var endNode = arguments.length <= 2 || arguments[2] === undefined ? node : arguments[2];
        var endOffset = arguments.length <= 3 || arguments[3] === undefined ? offset : arguments[3];
        return (function () {
          var r = document.createRange();
          r.setStart(node, offset);
          r.setEnd(endNode, endOffset);
          var selection = this.selection;
          if (selection.rangeCount > 0) {
            selection.removeAllRanges();
          }
          selection.addRange(r);
        }).apply(this, arguments);
      }
    }, {
      key: 'selection',
      get: function get() {
        return window.getSelection();
      }

      /**
       * the offset from the left edge of the section
       */
    }, {
      key: 'leftOffset',
      get: function get() {
        return this.offsets.leftOffset;
      }
    }, {
      key: 'offsets',
      get: function get() {
        var leftNode = undefined,
            rightNode = undefined,
            leftOffset = undefined,
            rightOffset = undefined;
        var _selection = this.selection;
        var anchorNode = _selection.anchorNode;
        var focusNode = _selection.focusNode;
        var anchorOffset = _selection.anchorOffset;
        var focusOffset = _selection.focusOffset;

        var position = anchorNode.compareDocumentPosition(focusNode);

        if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
          leftNode = anchorNode;rightNode = focusNode;
          leftOffset = anchorOffset;rightOffset = focusOffset;
        } else if (position & Node.DOCUMENT_POSITION_PRECEDING) {
          leftNode = focusNode;rightNode = anchorNode;
          leftOffset = focusOffset;rightOffset = anchorOffset;
        } else {
          // same node
          leftNode = anchorNode;
          rightNode = focusNode;
          leftOffset = Math.min(anchorOffset, focusOffset);
          rightOffset = Math.max(anchorOffset, focusOffset);
        }

        var leftRenderNode = this.renderTree.elements.get(leftNode),
            rightRenderNode = this.renderTree.elements.get(rightNode);

        return {
          leftNode: leftNode,
          rightNode: rightNode,
          leftOffset: leftOffset,
          rightOffset: rightOffset,
          leftRenderNode: leftRenderNode,
          rightRenderNode: rightRenderNode
        };
      }
    }, {
      key: 'activeMarkers',
      get: function get() {
        var firstSection = this.activeSections[0];
        if (!firstSection) {
          return [];
        }
        var firstSectionElement = firstSection.renderNode.element;

        var _offsets = this.offsets;
        var leftNode = _offsets.leftNode;
        var rightNode = _offsets.rightNode;
        var leftOffset = _offsets.leftOffset;
        var rightOffset = _offsets.rightOffset;

        var textLeftOffset = 0,
            textRightOffset = 0,
            foundLeft = false,
            foundRight = false;

        (0, _contentKitEditorUtilsDomUtils.walkTextNodes)(firstSectionElement, function (textNode) {
          var textLength = textNode.textContent.length;

          if (!foundLeft) {
            if ((0, _contentKitEditorUtilsDomUtils.containsNode)(leftNode, textNode)) {
              textLeftOffset += leftOffset;
              foundLeft = true;
            } else {
              textLeftOffset += textLength;
            }
          }
          if (!foundRight) {
            if ((0, _contentKitEditorUtilsDomUtils.containsNode)(rightNode, textNode)) {
              textRightOffset += rightOffset;
              foundRight = true;
            } else {
              textRightOffset += textLength;
            }
          }
        });

        // get section element
        //   walk it until we find one containing the left node, adding up textContent length along the way
        //   add the selection offset in the left node -- this is the offset in the parent textContent
        //   repeat for right node (subtract the remaining chars after selection offset) -- this is the end offset
        //
        //   walk the section's markers, adding up length. Each marker with length >= offset and <= end offset is active

        var leftMarker = firstSection.markerContaining(textLeftOffset, true);
        var rightMarker = firstSection.markerContaining(textRightOffset, false);

        var leftMarkerIndex = firstSection.markers.indexOf(leftMarker),
            rightMarkerIndex = firstSection.markers.indexOf(rightMarker) + 1;

        return firstSection.markers.slice(leftMarkerIndex, rightMarkerIndex);
      }
    }, {
      key: 'activeSections',
      get: function get() {
        var sections = this.post.sections;

        var selection = this.selection;
        var rangeCount = selection.rangeCount;

        var range = rangeCount > 0 && selection.getRangeAt(0);

        if (!range) {
          throw new Error('Unable to get activeSections because no range');
        }

        var startContainer = range.startContainer;
        var endContainer = range.endContainer;

        var isSectionElement = function isSectionElement(element) {
          return (0, _contentKitEditorUtilsArrayUtils.detect)(sections, function (section) {
            return section.renderNode.element === element;
          });
        };

        var _detectParentNode = (0, _contentKitEditorUtilsDomUtils.detectParentNode)(startContainer, isSectionElement);

        var startSection = _detectParentNode.result;

        var _detectParentNode2 = (0, _contentKitEditorUtilsDomUtils.detectParentNode)(endContainer, isSectionElement);

        var endSection = _detectParentNode2.result;

        var startIndex = sections.indexOf(startSection),
            endIndex = sections.indexOf(endSection) + 1;

        return sections.slice(startIndex, endIndex);
      }
    }]);

    return Cursor;
  })();

  exports['default'] = Cursor;
});
define('content-kit-editor/models/image', ['exports'], function (exports) {
  'use strict';

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var IMAGE_SECTION_TYPE = 'image-section';

  exports.IMAGE_SECTION_TYPE = IMAGE_SECTION_TYPE;

  var Image = function Image() {
    _classCallCheck(this, Image);

    this.type = IMAGE_SECTION_TYPE;
    this.src = null;
  };

  exports['default'] = Image;
});
define('content-kit-editor/models/marker', ['exports', 'content-kit-editor/utils/array-utils'], function (exports, _contentKitEditorUtilsArrayUtils) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var MARKER_TYPE = 'marker';

  exports.MARKER_TYPE = MARKER_TYPE;

  var Marker = (function () {
    function Marker() {
      var _this = this;

      var value = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
      var markups = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

      _classCallCheck(this, Marker);

      this.value = value;
      this.markups = [];
      this.type = MARKER_TYPE;

      if (markups && markups.length) {
        markups.forEach(function (m) {
          return _this.addMarkup(m);
        });
      }
    }

    _createClass(Marker, [{
      key: 'clone',
      value: function clone() {
        var clonedMarkups = this.markups.slice();
        return new this.constructor(this.value, clonedMarkups);
      }
    }, {
      key: 'truncateFrom',
      value: function truncateFrom(offset) {
        this.value = this.value.substr(0, offset);
      }
    }, {
      key: 'truncateTo',
      value: function truncateTo(offset) {
        this.value = this.value.substr(offset);
      }
    }, {
      key: 'addMarkup',
      value: function addMarkup(markup) {
        this.markups.push(markup);
      }
    }, {
      key: 'removeMarkup',
      value: function removeMarkup(markup) {
        var index = this.markups.indexOf(markup);
        if (index === -1) {
          throw new Error('Cannot remove markup that is not there.');
        }

        this.markups.splice(index, 1);
      }

      // delete the character at this offset,
      // update the value with the new value
    }, {
      key: 'deleteValueAtOffset',
      value: function deleteValueAtOffset(offset) {
        var left = this.value.slice(0, offset);
        var right = this.value.slice(offset + 1);

        this.value = left + right;
      }
    }, {
      key: 'hasMarkup',
      value: function hasMarkup(tagName) {
        tagName = tagName.toLowerCase();
        return (0, _contentKitEditorUtilsArrayUtils.detect)(this.markups, function (markup) {
          return markup.tagName === tagName;
        });
      }
    }, {
      key: 'getMarkup',
      value: function getMarkup(tagName) {
        return this.hasMarkup(tagName);
      }
    }, {
      key: 'join',
      value: function join(other) {
        var joined = new Marker(this.value + other.value);
        this.markups.forEach(function (m) {
          return joined.addMarkup(m);
        });
        other.markups.forEach(function (m) {
          return joined.addMarkup(m);
        });

        return joined;
      }
    }, {
      key: 'split',
      value: function split(offset) {
        var m1 = new Marker(this.value.substr(0, offset));
        var m2 = new Marker(this.value.substr(offset));

        this.markups.forEach(function (m) {
          m1.addMarkup(m);m2.addMarkup(m);
        });

        return [m1, m2];
      }
    }, {
      key: 'length',
      get: function get() {
        return this.value.length;
      }
    }, {
      key: 'openedMarkups',
      get: function get() {
        if (!this.previousSibling) {
          return this.markups.slice();
        }
        var i = undefined;
        for (i = 0; i < this.markups.length; i++) {
          if (this.markups[i] !== this.previousSibling.markups[i]) {
            return this.markups.slice(i);
          }
        }
        return [];
      }
    }, {
      key: 'closedMarkups',
      get: function get() {
        if (!this.nextSibling) {
          return this.markups.slice();
        }
        var i = undefined;
        for (i = 0; i < this.markups.length; i++) {
          if (this.markups[i] !== this.nextSibling.markups[i]) {
            return this.markups.slice(i);
          }
        }
        return [];
      }

      // FIXME this should be implemented as a linked list
    }, {
      key: 'nextSibling',
      get: function get() {
        var index = this.section.markers.indexOf(this);
        if (index > -1 && index < this.section.markers.length - 1) {
          return this.section.markers[index + 1];
        }
      }
    }, {
      key: 'previousSibling',
      get: function get() {
        var index = this.section.markers.indexOf(this);
        if (index > 0) {
          return this.section.markers[index - 1];
        }
      }
    }]);

    return Marker;
  })();

  exports['default'] = Marker;
});
define('content-kit-editor/models/markup-section', ['exports'], function (exports) {
  'use strict';

  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var DEFAULT_TAG_NAME = 'p';
  exports.DEFAULT_TAG_NAME = DEFAULT_TAG_NAME;
  var VALID_MARKUP_SECTION_TAGNAMES = ['p', 'h3', 'h2', 'h1', 'blockquote', 'ul', 'ol'];
  exports.VALID_MARKUP_SECTION_TAGNAMES = VALID_MARKUP_SECTION_TAGNAMES;
  var MARKUP_SECTION_TYPE = 'markup-section';

  exports.MARKUP_SECTION_TYPE = MARKUP_SECTION_TYPE;

  var Section = (function () {
    function Section(tagName) {
      var _this = this;

      var markers = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

      _classCallCheck(this, Section);

      this.markers = [];
      this.tagName = tagName || DEFAULT_TAG_NAME;
      this.type = MARKUP_SECTION_TYPE;
      this.element = null;

      markers.forEach(function (m) {
        return _this.appendMarker(m);
      });
    }

    _createClass(Section, [{
      key: 'prependMarker',
      value: function prependMarker(marker) {
        marker.section = this;
        this.markers.unshift(marker);
      }
    }, {
      key: 'appendMarker',
      value: function appendMarker(marker) {
        marker.section = this;
        this.markers.push(marker);
      }
    }, {
      key: 'removeMarker',
      value: function removeMarker(marker) {
        var index = this.markers.indexOf(marker);
        if (index === -1) {
          throw new Error('Cannot remove not-found marker');
        }
        this.markers.splice(index, 1);
      }
    }, {
      key: 'insertMarkerAfter',
      value: function insertMarkerAfter(marker, previousMarker) {
        var index = this.markers.indexOf(previousMarker);
        if (index === -1) {
          throw new Error('Cannot insert marker after: ' + previousMarker);
        }

        marker.section = this;
        this.markers.splice(index + 1, 0, marker);
      }

      /**
       * @return {Array} 2 new sections
       */
    }, {
      key: 'split',
      value: function split(offset) {
        var left = [],
            right = [],
            middle = undefined;

        middle = this.markerContaining(offset);
        // end of section
        if (!middle) {
          return [new this.constructor(this.tagName, this.markers), new this.constructor(this.tagName, [])];
        }
        var middleIndex = this.markers.indexOf(middle);

        for (var i = 0; i < this.markers.length; i++) {
          if (i < middleIndex) {
            left.push(this.markers[i]);
          }
          if (i > middleIndex) {
            right.push(this.markers[i]);
          }
        }

        var leftLength = left.reduce(function (prev, cur) {
          return prev + cur.length;
        }, 0);
        var middleOffset = offset - leftLength;

        var _middle$split = middle.split(middleOffset);

        var _middle$split2 = _slicedToArray(_middle$split, 2);

        var leftMiddle = _middle$split2[0];
        var rightMiddle = _middle$split2[1];

        left.push(leftMiddle);
        right.push(rightMiddle);

        return [new this.constructor(this.tagName, left), new this.constructor(this.tagName, right)];
      }

      // mutates this by appending the other section's (cloned) markers to it
    }, {
      key: 'join',
      value: function join(otherSection) {
        var _this2 = this;

        otherSection.markers.forEach(function (m) {
          return _this2.appendMarker(m.clone());
        });
      }

      /**
       * A marker contains this offset if:
       *   * The offset is between the marker's start and end
       *   * the offset is between two markers and this is the right marker (and leftInclusive is true)
       *   * the offset is between two markers and this is the left marker (and leftInclusive is false)
       *
       * @return {Marker} The marker that contains this offset
       */
    }, {
      key: 'markerContaining',
      value: function markerContaining(offset) {
        var leftInclusive = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

        var length = 0,
            i = 0;

        if (offset === 0) {
          return this.markers[0];
        }

        while (length < offset && i < this.markers.length) {
          length += this.markers[i].length;
          i++;
        }

        if (length > offset) {
          return this.markers[i - 1];
        } else if (length === offset) {
          return this.markers[leftInclusive ? i : i - 1];
        }
      }
    }]);

    return Section;
  })();

  exports['default'] = Section;
});
define('content-kit-editor/models/markup', ['exports'], function (exports) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var MARKUP_TYPE = 'markup';
  exports.MARKUP_TYPE = MARKUP_TYPE;
  var VALID_MARKUP_TAGNAMES = ['b', 'i', 'strong', 'em', 'a', 'li'];

  exports.VALID_MARKUP_TAGNAMES = VALID_MARKUP_TAGNAMES;

  var Markup = (function () {
    /*
     * @param {attributes} array flat array of key1,value1,key2,value2,...
     */

    function Markup(tagName) {
      var attributes = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

      _classCallCheck(this, Markup);

      this.tagName = tagName.toLowerCase();
      this.attributes = attributes;
      this.type = MARKUP_TYPE;

      if (VALID_MARKUP_TAGNAMES.indexOf(this.tagName) === -1) {
        throw new Error('Cannot create markup of tagName ' + tagName);
      }
    }

    _createClass(Markup, null, [{
      key: 'isValidElement',
      value: function isValidElement(element) {
        var tagName = element.tagName.toLowerCase();
        return VALID_MARKUP_TAGNAMES.indexOf(tagName) !== -1;
      }
    }]);

    return Markup;
  })();

  exports['default'] = Markup;
});
define('content-kit-editor/models/post', ['exports'], function (exports) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var POST_TYPE = 'post';

  // FIXME: making sections a linked-list would greatly improve this
  exports.POST_TYPE = POST_TYPE;

  var Post = (function () {
    function Post() {
      _classCallCheck(this, Post);

      this.type = POST_TYPE;
      this.sections = [];
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
      key: 'removeSection',
      value: function removeSection(section) {
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
define("content-kit-editor/models/render-node", ["exports"], function (exports) {
  "use strict";

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var RenderNode = (function () {
    function RenderNode(postNode) {
      _classCallCheck(this, RenderNode);

      this.parentNode = null;
      this.isDirty = true;
      this.isRemoved = false;
      this.postNode = postNode;

      this.firstChild = null;
      this.lastChild = null;
      this.nextSibling = null;
      this.previousSibling = null;
    }

    _createClass(RenderNode, [{
      key: "scheduleForRemoval",
      value: function scheduleForRemoval() {
        this.isRemoved = true;
        if (this.parentNode) {
          this.parentNode.markDirty();
        }
      }
    }, {
      key: "markDirty",
      value: function markDirty() {
        this.isDirty = true;
        if (this.parentNode) {
          this.parentNode.markDirty();
        }
      }
    }, {
      key: "markClean",
      value: function markClean() {
        this.isDirty = false;
      }
    }, {
      key: "appendChild",
      value: function appendChild(child) {
        if (!this.firstChild) {
          this.firstChild = child;
        }
        if (this.lastChild) {
          child.previousSibling = this.lastChild;
          this.lastChild.nextSibling = child;
        }
        this.lastChild = child;
        child.parentNode = this;
        child.renderTree = this.renderTree;
      }
    }, {
      key: "removeChild",
      value: function removeChild(child) {
        if (child.nextSibling) {
          child.nextSibling.previousSibling = child.previousSibling;
        } else {
          this.lastChild = child.previousSibling;
        }
        if (child.previousSibling) {
          child.previousSibling.nextSibling = child.nextSibling;
        } else {
          this.firstChild = child.nextSibling;
        }
      }
    }, {
      key: "insertAfter",
      value: function insertAfter(node, previousChild) {
        if (previousChild) {
          node.previousSibling = previousChild;
          if (previousChild.nextSibling) {
            previousChild.nextSibling.previousSibling = node;
            node.nextSibling = previousChild.nextSibling;
          } else {
            this.lastChild = node;
          }
          previousChild.nextSibling = node;
        } else {
          node.nextSibling = this.firstChild;
          if (node.nextSibling) {
            node.nextSibling.previousSibling = node;
          } else {
            this.lastChild = node;
          }
          this.firstChild = node;
        }
        node.parentNode = this;
        node.renderTree = this.renderTree;
      }
    }, {
      key: "element",
      set: function set(element) {
        this._element = element;
        this.renderTree.elements.set(element, this);
        return element;
      },
      get: function get() {
        return this._element;
      }
    }]);

    return RenderNode;
  })();

  exports["default"] = RenderNode;
});
define("content-kit-editor/models/render-tree", ["exports", "content-kit-editor/models/render-node", "content-kit-editor/utils/element-map"], function (exports, _contentKitEditorModelsRenderNode, _contentKitEditorUtilsElementMap) {
  "use strict";

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var RenderTree = (function () {
    function RenderTree(node) {
      _classCallCheck(this, RenderTree);

      this.node = node;
      this.elements = new _contentKitEditorUtilsElementMap["default"]();
    }

    _createClass(RenderTree, [{
      key: "getElementRenderNode",
      value: function getElementRenderNode(element) {
        return this.elements.get(element);
      }
    }, {
      key: "buildRenderNode",
      value: function buildRenderNode(section) {
        var renderNode = new _contentKitEditorModelsRenderNode["default"](section);
        renderNode.renderTree = this;
        section.renderNode = renderNode;
        return renderNode;
      }
    }]);

    return RenderTree;
  })();

  exports["default"] = RenderTree;
});
define('content-kit-editor/parsers/dom', ['exports', 'content-kit-editor/utils/post-builder', 'content-kit-utils', 'content-kit-editor/models/markup-section', 'content-kit-editor/models/markup'], function (exports, _contentKitEditorUtilsPostBuilder, _contentKitUtils, _contentKitEditorModelsMarkupSection, _contentKitEditorModelsMarkup) {
  'use strict';

  var ELEMENT_NODE = 1;
  var TEXT_NODE = 3;

  var ALLOWED_ATTRIBUTES = ['href', 'rel', 'src'];

  function isEmptyTextNode(node) {
    return node.nodeType === TEXT_NODE && (0, _contentKitUtils.trim)(node.textContent) === '';
  }

  // FIXME we need sorted attributes for deterministic tests. This is not
  // a particularly elegant method, since it loops at least 3 times.
  function sortAttributes(attributes) {
    var keyValueAttributes = [];
    var currentKey = undefined;
    attributes.forEach(function (keyOrValue, index) {
      if (index % 2 === 0) {
        currentKey = keyOrValue;
      } else {
        keyValueAttributes.push({ key: currentKey, value: keyOrValue });
      }
    });
    keyValueAttributes.sort(function (a, b) {
      return a.key === b.key ? 0 : a.key > b.key ? 1 : -1;
    });
    var sortedAttributes = [];
    keyValueAttributes.forEach(function (_ref) {
      var key = _ref.key;
      var value = _ref.value;

      sortedAttributes.push(key, value);
    });
    return sortedAttributes;
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
      } else {
        return sortAttributes(attributes);
      }
    }

    return null;
  }

  function isValidMarkerElement(element) {
    return _contentKitEditorModelsMarkup.VALID_MARKUP_TAGNAMES.indexOf(element.tagName.toLowerCase()) !== -1;
  }

  function parseMarkers(section, postBuilder, topNode) {
    var markups = [];
    var text = null;
    var currentNode = topNode;
    while (currentNode) {
      switch (currentNode.nodeType) {
        case ELEMENT_NODE:
          if (isValidMarkerElement(currentNode)) {
            markups.push(postBuilder.generateMarkup(currentNode.tagName, readAttributes(currentNode)));
          }
          break;
        case TEXT_NODE:
          text = (text || '') + currentNode.textContent;
          break;
      }

      if (currentNode.firstChild) {
        if (isValidMarkerElement(currentNode) && text !== null) {
          section.appendMarker(postBuilder.generateMarker(markups.slice(), text));
          text = null;
        }
        currentNode = currentNode.firstChild;
      } else if (currentNode.nextSibling) {
        if (currentNode === topNode) {
          section.appendMarker(postBuilder.generateMarker(markups.slice(), text));
          break;
        } else {
          currentNode = currentNode.nextSibling;
          if (currentNode.nodeType === ELEMENT_NODE && isValidMarkerElement(currentNode) && text !== null) {
            section.appendMarker(postBuilder.generateMarker(markups.slice(), text));
            text = null;
          }
        }
      } else {
        section.appendMarker(postBuilder.generateMarker(markups.slice(), text));

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
          if (_contentKitEditorModelsMarkupSection.VALID_MARKUP_SECTION_TAGNAMES.indexOf(tagName.toLowerCase()) !== -1) {
            section = postBuilder.generateMarkupSection(tagName, readAttributes(sectionElement));
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
                section = postBuilder.generateMarkupSection('P', {}, true);
              }
              parseMarkers(section, postBuilder, sectionElement);
            }
          break;
        case TEXT_NODE:
          if (previousSection && previousSection.isGenerated) {
            section = previousSection;
          } else {
            section = postBuilder.generateMarkupSection('P', {}, true);
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

  var CARD_SECTION_TYPE = 10;
  var IMAGE_SECTION_TYPE = 2;

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
      value: function parse(_ref) {
        var version = _ref.version;
        var sectionData = _ref.sections;

        var markerTypes = sectionData[0];
        var sections = sectionData[1];

        var post = this.builder.generatePost();

        this.markups = [];
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
      value: function parseMarkerType(_ref2) {
        var _ref22 = _slicedToArray(_ref2, 2);

        var tagName = _ref22[0];
        var attributes = _ref22[1];

        return this.builder.generateMarkup(tagName, attributes);
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
          case IMAGE_SECTION_TYPE:
            this.parseImageSection(section, post);
            break;
          case CARD_SECTION_TYPE:
            this.parseCardSection(section, post);
            break;
          default:
            throw new Error('Unexpected section type ' + type);
        }
      }
    }, {
      key: 'parseCardSection',
      value: function parseCardSection(_ref3, post) {
        var _ref32 = _slicedToArray(_ref3, 3);

        var type = _ref32[0];
        var name = _ref32[1];
        var payload = _ref32[2];

        var section = this.builder.generateCardSection(name, payload);
        post.appendSection(section);
      }
    }, {
      key: 'parseImageSection',
      value: function parseImageSection(_ref4, post) {
        var _ref42 = _slicedToArray(_ref4, 2);

        var type = _ref42[0];
        var src = _ref42[1];

        var section = this.builder.generateImageSection(src);
        post.appendSection(section);
      }
    }, {
      key: 'parseMarkupSection',
      value: function parseMarkupSection(_ref5, post) {
        var _ref52 = _slicedToArray(_ref5, 3);

        var type = _ref52[0];
        var tagName = _ref52[1];
        var markers = _ref52[2];

        var attributes = null;
        var isGenerated = false;
        var section = this.builder.generateMarkupSection(tagName, attributes, isGenerated);

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
      value: function parseMarker(_ref6, section) {
        var _this4 = this;

        var _ref62 = _slicedToArray(_ref6, 3);

        var markerTypeIndexes = _ref62[0];
        var closeCount = _ref62[1];
        var value = _ref62[2];

        markerTypeIndexes.forEach(function (index) {
          _this4.markups.push(_this4.markerTypes[index]);
        });
        var marker = this.builder.generateMarker(this.markups.slice(), value);
        section.appendMarker(marker);
        this.markups = this.markups.slice(0, this.markups.length - closeCount);
      }
    }]);

    return MobiledocParser;
  })();

  exports['default'] = MobiledocParser;
});
define('content-kit-editor/parsers/post', ['exports', 'content-kit-editor/models/post', 'content-kit-editor/models/markup-section', 'content-kit-editor/parsers/section', 'content-kit-editor/utils/array-utils', 'content-kit-editor/utils/post-builder', 'content-kit-editor/utils/dom-utils', 'content-kit-editor/renderers/editor-dom', 'content-kit-editor/models/markup'], function (exports, _contentKitEditorModelsPost, _contentKitEditorModelsMarkupSection, _contentKitEditorParsersSection, _contentKitEditorUtilsArrayUtils, _contentKitEditorUtilsPostBuilder, _contentKitEditorUtilsDomUtils, _contentKitEditorRenderersEditorDom, _contentKitEditorModelsMarkup) {
  'use strict';

  var sanitizeTextRegex = new RegExp(_contentKitEditorRenderersEditorDom.UNPRINTABLE_CHARACTER, 'g');

  function sanitizeText(text) {
    return text.replace(sanitizeTextRegex, '');
  }

  exports['default'] = {
    parse: function parse(element) {
      var post = new _contentKitEditorModelsPost['default']();

      (0, _contentKitEditorUtilsArrayUtils.forEach)(element.childNodes, function (child) {
        post.appendSection(_contentKitEditorParsersSection['default'].parse(child));
      });

      return post;
    },

    parseSection: function parseSection(element, otherArg) {
      if (!!otherArg) {
        element = otherArg; // hack to deal with passed previousSection
      }
      return _contentKitEditorParsersSection['default'].parse(element);
    },

    // FIXME should move to the section parser?
    // FIXME the `collectMarkups` logic could simplify the section parser?
    reparseSection: function reparseSection(section, renderTree) {
      if (section.type !== _contentKitEditorModelsMarkupSection.MARKUP_SECTION_TYPE) {
        // can only reparse markup sections
        return;
      }
      var sectionElement = section.renderNode.element;

      // Turn an element node into a markup
      function markupFromNode(node) {
        if (_contentKitEditorModelsMarkup['default'].isValidElement(node)) {
          var tagName = node.tagName;
          var attributes = (0, _contentKitEditorUtilsDomUtils.getAttributesArray)(node);

          return (0, _contentKitEditorUtilsPostBuilder.generateBuilder)().generateMarkup(tagName, attributes);
        }
      }

      // walk up from the textNode until the rootNode, converting each
      // parentNode into a markup
      function collectMarkups(textNode, rootNode) {
        var markups = [];
        var currentNode = textNode.parentNode;
        while (currentNode && currentNode !== rootNode) {
          var markup = markupFromNode(currentNode);
          if (markup) {
            markups.push(markup);
          }

          currentNode = currentNode.parentNode;
        }
        return markups;
      }

      var seenRenderNodes = [];
      var previousMarker = undefined;

      (0, _contentKitEditorUtilsDomUtils.walkTextNodes)(sectionElement, function (textNode) {
        var text = sanitizeText(textNode.textContent);
        var markups = collectMarkups(textNode, sectionElement);

        var marker = undefined;

        var renderNode = renderTree.elements.get(textNode);
        if (renderNode) {
          if (text.length) {
            marker = renderNode.postNode;
            marker.value = text;
            marker.markups = markups;
          } else {
            renderNode.scheduleForRemoval();
          }
        } else {
          marker = (0, _contentKitEditorUtilsPostBuilder.generateBuilder)().generateMarker(markups, text);

          // create a cleaned render node to account for the fact that this
          // render node comes from already-displayed DOM
          // FIXME this should be cleaner
          renderNode = renderTree.buildRenderNode(marker);
          renderNode.element = textNode;
          renderNode.markClean();

          if (previousMarker) {
            // insert this marker after the previous one
            section.insertMarkerAfter(marker, previousMarker);
            section.renderNode.insertAfter(renderNode, previousMarker.renderNode);
          } else {
            // insert marker at the beginning of the section
            section.prependMarker(marker);
            section.renderNode.insertAfter(renderNode, null);
          }

          // find the nextMarkerElement, set it on the render node
          var parentNodeCount = marker.closedMarkups.length;
          var nextMarkerElement = textNode.parentNode;
          while (parentNodeCount--) {
            nextMarkerElement = nextMarkerElement.parentNode;
          }
          renderNode.nextMarkerElement = nextMarkerElement;
        }

        seenRenderNodes.push(renderNode);
        previousMarker = marker;
      });

      // schedule any nodes that were not marked as seen
      var node = section.renderNode.firstChild;
      while (node) {
        if (seenRenderNodes.indexOf(node) === -1) {
          // remove it
          node.scheduleForRemoval();
        }

        node = node.nextSibling;
      }
    }
  };
});
define('content-kit-editor/parsers/section', ['exports', 'content-kit-editor/models/markup-section', 'content-kit-editor/models/marker', 'content-kit-editor/models/markup', 'content-kit-editor/utils/dom-utils', 'content-kit-editor/utils/array-utils', 'content-kit-editor/utils/post-builder'], function (exports, _contentKitEditorModelsMarkupSection, _contentKitEditorModelsMarker, _contentKitEditorModelsMarkup, _contentKitEditorUtilsDomUtils, _contentKitEditorUtilsArrayUtils, _contentKitEditorUtilsPostBuilder) {
  'use strict';

  var TEXT_NODE = 3;
  var ELEMENT_NODE = 1;

  /**
   * parses an element into a section, ignoring any non-markup
   * elements contained within
   * @return {Section}
   */
  exports['default'] = {
    parse: function parse(element) {
      var _this = this;

      var tagName = this.sectionTagNameFromElement(element);
      var section = new _contentKitEditorModelsMarkupSection['default'](tagName);
      var state = { section: section, markups: [], text: '' };

      (0, _contentKitEditorUtilsArrayUtils.forEach)(element.childNodes, function (el) {
        _this.parseNode(el, state);
      });

      // close a trailing text nodes if it exists
      if (state.text.length) {
        var marker = new _contentKitEditorModelsMarker['default'](state.text, state.markups);
        state.section.appendMarker(marker);
      }

      if (section.markers.length === 0) {
        section.appendMarker((0, _contentKitEditorUtilsPostBuilder.generateBuilder)().generateBlankMarker());
      }

      return section;
    },

    parseNode: function parseNode(node, state) {
      switch (node.nodeType) {
        case TEXT_NODE:
          this.parseTextNode(node, state);
          break;
        case ELEMENT_NODE:
          this.parseElementNode(node, state);
          break;
        default:
          throw new Error('parseNode got unexpected element type ' + node.nodeType + ' ' + node);
      }
    },

    parseElementNode: function parseElementNode(element, state) {
      var _this2 = this;

      var markup = this.markupFromElement(element);
      if (markup) {
        if (state.text.length) {
          // close previous text marker
          var marker = new _contentKitEditorModelsMarker['default'](state.text, state.markups);
          state.section.appendMarker(marker);
          state.text = '';
        }

        state.markups.push(markup);
      }

      (0, _contentKitEditorUtilsArrayUtils.forEach)(element.childNodes, function (node) {
        _this2.parseNode(node, state);
      });

      if (markup) {
        // close the marker started for this node and pop
        // its markup from the stack
        var marker = new _contentKitEditorModelsMarker['default'](state.text, state.markups);
        state.section.appendMarker(marker);
        state.markups.pop();
        state.text = '';
      }
    },

    parseTextNode: function parseTextNode(textNode, state) {
      state.text += textNode.textContent;
    },

    isSectionElement: function isSectionElement(element) {
      return element.nodeType === ELEMENT_NODE && _contentKitEditorModelsMarkupSection.VALID_MARKUP_SECTION_TAGNAMES.indexOf(element.tagName.toLowerCase()) !== -1;
    },

    markupFromElement: function markupFromElement(element) {
      var tagName = element.tagName.toLowerCase();
      if (_contentKitEditorModelsMarkup.VALID_MARKUP_TAGNAMES.indexOf(tagName) === -1) {
        return null;
      }

      return new _contentKitEditorModelsMarkup['default'](tagName, (0, _contentKitEditorUtilsDomUtils.getAttributes)(element));
    },

    sectionTagNameFromElement: function sectionTagNameFromElement(element) {
      var tagName = element.tagName;
      tagName = tagName && tagName.toLowerCase();
      if (_contentKitEditorModelsMarkupSection.VALID_MARKUP_SECTION_TAGNAMES.indexOf(tagName) === -1) {
        tagName = _contentKitEditorModelsMarkupSection.DEFAULT_TAG_NAME;
      }
      return tagName;
    }
  };
});
define("content-kit-editor/renderers/editor-dom", ["exports", "content-kit-editor/models/render-node", "content-kit-editor/models/card-node", "content-kit-editor/utils/array-utils", "content-kit-editor/models/post", "content-kit-editor/models/markup-section", "content-kit-editor/models/marker", "content-kit-editor/models/image", "content-kit-editor/models/card", "content-kit-editor/utils/dom-utils"], function (exports, _contentKitEditorModelsRenderNode, _contentKitEditorModelsCardNode, _contentKitEditorUtilsArrayUtils, _contentKitEditorModelsPost, _contentKitEditorModelsMarkupSection, _contentKitEditorModelsMarker, _contentKitEditorModelsImage, _contentKitEditorModelsCard, _contentKitEditorUtilsDomUtils) {
  "use strict";

  var _destroyHooks;

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var UNPRINTABLE_CHARACTER = "‌";

  exports.UNPRINTABLE_CHARACTER = UNPRINTABLE_CHARACTER;
  function createElementFromMarkup(doc, markup) {
    var element = doc.createElement(markup.tagName);
    if (markup.attributes) {
      for (var i = 0, l = markup.attributes.length; i < l; i = i + 2) {
        element.setAttribute(markup.attributes[i], markup.attributes[i + 1]);
      }
    }
    return element;
  }

  // ascends from element upward, returning the last parent node that is not
  // parentElement
  function penultimateParentOf(element, parentElement) {
    while (parentElement && element.parentNode !== parentElement && element.parentElement !== document.body // ensure the while loop stops
    ) {
      element = element.parentNode;
    }
    return element;
  }

  function renderMarkupSection(doc, section) {
    var element = doc.createElement(section.tagName);
    section.element = element;
    return element;
  }

  function isEmptyText(text) {
    return text.trim() === '';
  }

  // pass in a renderNode's previousSibling
  function getNextMarkerElement(renderNode) {
    var element = renderNode.element.parentNode;
    var closedCount = renderNode.postNode.closedMarkups.length;

    // walk up the number of closed markups
    while (closedCount--) {
      element = element.parentNode;
    }
    return element;
  }

  function renderMarker(marker, element, previousRenderNode) {
    var openTypes = marker.openedMarkups;
    var text = marker.value;
    if (isEmptyText(text)) {
      // This is necessary to allow the cursor to move into this area
      text = UNPRINTABLE_CHARACTER;
    }

    var textNode = document.createTextNode(text);
    var currentElement = textNode;
    var markup = undefined;

    for (var j = openTypes.length - 1; j >= 0; j--) {
      markup = openTypes[j];
      var openedElement = createElementFromMarkup(document, markup);
      openedElement.appendChild(currentElement);
      currentElement = openedElement;
    }

    if (previousRenderNode) {
      var nextMarkerElement = getNextMarkerElement(previousRenderNode);

      var previousSibling = previousRenderNode.element;
      var previousSiblingPenultimate = penultimateParentOf(previousSibling, nextMarkerElement);
      nextMarkerElement.insertBefore(currentElement, previousSiblingPenultimate.nextSibling);
    } else {
      element.insertBefore(currentElement, element.firstChild);
    }

    return textNode;
  }

  var Visitor = (function () {
    function Visitor(cards, unknownCardHandler, options) {
      _classCallCheck(this, Visitor);

      this.cards = cards;
      this.unknownCardHandler = unknownCardHandler;
      this.options = options;
    }

    _createClass(Visitor, [{
      key: _contentKitEditorModelsPost.POST_TYPE,
      value: function value(renderNode, post, visit) {
        if (!renderNode.element) {
          var element = document.createElement('div');
          renderNode.element = element;
        }
        visit(renderNode, post.sections);
      }
    }, {
      key: _contentKitEditorModelsMarkupSection.MARKUP_SECTION_TYPE,
      value: function value(renderNode, section, visit) {
        if (!renderNode.element) {
          var element = renderMarkupSection(window.document, section);
          if (renderNode.previousSibling) {
            var previousElement = renderNode.previousSibling.element;
            var nextElement = previousElement.nextSibling;
            if (nextElement) {
              nextElement.parentNode.insertBefore(element, nextElement);
            }
          }
          if (!element.parentNode) {
            renderNode.parentNode.element.appendChild(element);
          }
          renderNode.element = element;
        }

        // remove all elements so that we can rerender
        (0, _contentKitEditorUtilsDomUtils.clearChildNodes)(renderNode.element);

        var visitAll = true;
        visit(renderNode, section.markers, visitAll);
      }
    }, {
      key: _contentKitEditorModelsMarker.MARKER_TYPE,
      value: function value(renderNode, marker) {
        var parentElement = undefined;

        if (renderNode.previousSibling) {
          parentElement = getNextMarkerElement(renderNode.previousSibling);
        } else {
          parentElement = renderNode.parentNode.element;
        }
        var textNode = renderMarker(marker, parentElement, renderNode.previousSibling);

        renderNode.element = textNode;
      }
    }, {
      key: _contentKitEditorModelsImage.IMAGE_SECTION_TYPE,
      value: function value(renderNode, section) {
        if (renderNode.element) {
          if (renderNode.element.src !== section.src) {
            renderNode.element.src = section.src;
          }
        } else {
          var element = document.createElement('img');
          element.src = section.src;
          if (renderNode.previousSibling) {
            var previousElement = renderNode.previousSibling.element;
            var nextElement = previousElement.nextSibling;
            if (nextElement) {
              nextElement.parentNode.insertBefore(element, nextElement);
            }
          }
          if (!element.parentNode) {
            renderNode.parentNode.element.appendChild(element);
          }
          renderNode.element = element;
        }
      }
    }, {
      key: _contentKitEditorModelsCard.CARD_TYPE,
      value: function value(renderNode, section) {
        var card = (0, _contentKitEditorUtilsArrayUtils.detect)(this.cards, function (card) {
          return card.name === section.name;
        });

        var env = { name: section.name };
        var element = document.createElement('div');
        element.contentEditable = 'false';
        renderNode.element = element;
        renderNode.parentNode.element.appendChild(renderNode.element);

        if (card) {
          var cardNode = new _contentKitEditorModelsCardNode["default"](card, section, renderNode.element, this.options);
          renderNode.cardNode = cardNode;
          cardNode.display();
        } else {
          this.unknownCardHandler(renderNode.element, this.options, env, section.payload);
        }
      }
    }]);

    return Visitor;
  })();

  var destroyHooks = (_destroyHooks = {}, _defineProperty(_destroyHooks, _contentKitEditorModelsPost.POST_TYPE, function () /*renderNode, post*/{
    throw new Error('post destruction is not supported by the renderer');
  }), _defineProperty(_destroyHooks, _contentKitEditorModelsMarkupSection.MARKUP_SECTION_TYPE, function (renderNode, section) {
    var post = renderNode.parentNode.postNode;
    post.removeSection(section);
    // Some formatting commands remove the element from the DOM during
    // formatting. Do not error if this is the case.
    if (renderNode.element.parentNode) {
      renderNode.element.parentNode.removeChild(renderNode.element);
    }
  }), _defineProperty(_destroyHooks, _contentKitEditorModelsMarker.MARKER_TYPE, function (renderNode, marker) {
    // FIXME before we render marker, should delete previous renderNode's element
    // and up until the next marker element

    var element = renderNode.element;
    var nextMarkerElement = getNextMarkerElement(renderNode);
    while (element.parentNode && element.parentNode !== nextMarkerElement) {
      element = element.parentNode;
    }

    marker.section.removeMarker(marker);

    if (element.parentNode) {
      // if no parentNode, the browser already removed this element
      element.parentNode.removeChild(element);
    }
  }), _defineProperty(_destroyHooks, _contentKitEditorModelsImage.IMAGE_SECTION_TYPE, function (renderNode, section) {
    var post = renderNode.parentNode.postNode;
    post.removeSection(section);
    renderNode.element.parentNode.removeChild(renderNode.element);
  }), _defineProperty(_destroyHooks, _contentKitEditorModelsCard.CARD_TYPE, function (renderNode, section) {
    if (renderNode.cardNode) {
      renderNode.cardNode.teardown();
    }
    var post = renderNode.parentNode.postNode;
    post.removeSection(section);
    renderNode.element.parentNode.removeChild(renderNode.element);
  }), _destroyHooks);

  // removes children from parentNode that are scheduled for removal
  function removeChildren(parentNode) {
    var child = parentNode.firstChild;
    while (child) {
      var nextChild = child.nextSibling;
      if (child.isRemoved) {
        destroyHooks[child.postNode.type](child, child.postNode);
        parentNode.removeChild(child);
      }
      child = nextChild;
    }
  }

  // Find an existing render node for the given postNode, or
  // create one, insert it into the tree, and return it
  function lookupNode(renderTree, parentNode, postNode, previousNode) {
    if (postNode.renderNode) {
      return postNode.renderNode;
    } else {
      var renderNode = new _contentKitEditorModelsRenderNode["default"](postNode);
      renderNode.renderTree = renderTree;
      parentNode.insertAfter(renderNode, previousNode);
      postNode.renderNode = renderNode;
      return renderNode;
    }
  }

  var Renderer = (function () {
    function Renderer(cards, unknownCardHandler, options) {
      _classCallCheck(this, Renderer);

      this.visitor = new Visitor(cards, unknownCardHandler, options);
      this.nodes = [];
    }

    _createClass(Renderer, [{
      key: "visit",
      value: function visit(renderTree, parentNode, postNodes) {
        var _this = this;

        var visitAll = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

        var previousNode = undefined;
        postNodes.forEach(function (postNode) {
          var node = lookupNode(renderTree, parentNode, postNode, previousNode);
          if (node.isDirty || visitAll) {
            _this.nodes.push(node);
          }
          previousNode = node;
        });
      }
    }, {
      key: "render",
      value: function render(renderTree) {
        var _this2 = this;

        var node = renderTree.node;
        while (node) {
          removeChildren(node);
          this.visitor[node.postNode.type](node, node.postNode, function () {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
              args[_key] = arguments[_key];
            }

            return _this2.visit.apply(_this2, [renderTree].concat(args));
          });
          node.markClean();
          node = this.nodes.shift();
        }
      }
    }]);

    return Renderer;
  })();

  exports["default"] = Renderer;
});
define("content-kit-editor/renderers/mobiledoc", ["exports", "content-kit-editor/utils/compiler", "content-kit-editor/models/post", "content-kit-editor/models/markup-section", "content-kit-editor/models/image", "content-kit-editor/models/marker", "content-kit-editor/models/markup", "content-kit-editor/models/card"], function (exports, _contentKitEditorUtilsCompiler, _contentKitEditorModelsPost, _contentKitEditorModelsMarkupSection, _contentKitEditorModelsImage, _contentKitEditorModelsMarker, _contentKitEditorModelsMarkup, _contentKitEditorModelsCard) {
  "use strict";

  var _visitor;

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  var MOBILEDOC_VERSION = '0.1';

  exports.MOBILEDOC_VERSION = MOBILEDOC_VERSION;
  var visitor = (_visitor = {}, _defineProperty(_visitor, _contentKitEditorModelsPost.POST_TYPE, function (node, opcodes) {
    opcodes.push(['openPost']);
    (0, _contentKitEditorUtilsCompiler.visitArray)(visitor, node.sections, opcodes);
  }), _defineProperty(_visitor, _contentKitEditorModelsMarkupSection.MARKUP_SECTION_TYPE, function (node, opcodes) {
    opcodes.push(['openMarkupSection', node.tagName]);
    (0, _contentKitEditorUtilsCompiler.visitArray)(visitor, node.markers, opcodes);
  }), _defineProperty(_visitor, _contentKitEditorModelsImage.IMAGE_SECTION_TYPE, function (node, opcodes) {
    opcodes.push(['openImageSection', node.src]);
  }), _defineProperty(_visitor, _contentKitEditorModelsCard.CARD_TYPE, function (node, opcodes) {
    opcodes.push(['openCardSection', node.name, node.payload]);
  }), _defineProperty(_visitor, _contentKitEditorModelsMarker.MARKER_TYPE, function (node, opcodes) {
    opcodes.push(['openMarker', node.closedMarkups.length, node.value]);
    (0, _contentKitEditorUtilsCompiler.visitArray)(visitor, node.openedMarkups, opcodes);
  }), _defineProperty(_visitor, _contentKitEditorModelsMarkup.MARKUP_TYPE, function (node, opcodes) {
    opcodes.push(['openMarkup', node.tagName, node.attributes]);
  }), _visitor);

  var postOpcodeCompiler = {
    openMarker: function openMarker(closeCount, value) {
      this.markupMarkerIds = [];
      this.markers.push([this.markupMarkerIds, closeCount, value || '']);
    },
    openMarkupSection: function openMarkupSection(tagName) {
      this.markers = [];
      this.sections.push([1, tagName, this.markers]);
    },
    openImageSection: function openImageSection(url) {
      this.sections.push([2, url]);
    },
    openCardSection: function openCardSection(name, payload) {
      this.sections.push([10, name, payload]);
    },
    openPost: function openPost() {
      this.markerTypes = [];
      this.sections = [];
      this.result = {
        version: MOBILEDOC_VERSION,
        sections: [this.markerTypes, this.sections]
      };
    },
    openMarkup: function openMarkup(tagName, attributes) {
      if (!this._seenMarkerTypes) {
        this._seenMarkerTypes = {};
      }
      var index = undefined;
      if (attributes.length) {
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

  exports["default"] = {
    render: function render(post) {
      var opcodes = [];
      (0, _contentKitEditorUtilsCompiler.visit)(visitor, post, opcodes);
      var compiler = Object.create(postOpcodeCompiler);
      (0, _contentKitEditorUtilsCompiler.compile)(compiler, opcodes);
      return compiler.result;
    }
  };
});
define("content-kit-editor/utils/array-utils", ["exports"], function (exports) {
  "use strict";

  function detect(array, callback) {
    for (var i = 0; i < array.length; i++) {
      if (callback(array[i])) {
        return array[i];
      }
    }
  }

  /**
   * Useful for array-like things that aren't
   * actually arrays, like NodeList
   */
  function forEach(enumerable, callback) {
    for (var i = 0; i < enumerable.length; i++) {
      callback(enumerable[i]);
    }
  }

  exports.detect = detect;
  exports.forEach = forEach;
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
define('content-kit-editor/utils/dom-utils', ['exports', 'content-kit-editor/utils/array-utils'], function (exports, _contentKitEditorUtilsArrayUtils) {
  'use strict';

  var TEXT_NODE_TYPE = 3;

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

  function isTextNode(node) {
    return node.nodeType === TEXT_NODE_TYPE;
  }

  // perform a pre-order tree traversal of the dom, calling `callbackFn(node)`
  // for every node for which `conditionFn(node)` is true
  function walkDOM(topNode) {
    var callbackFn = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];
    var conditionFn = arguments.length <= 2 || arguments[2] === undefined ? function () {
      return true;
    } : arguments[2];

    var currentNode = topNode;

    if (conditionFn(currentNode)) {
      callbackFn(currentNode);
    }

    currentNode = currentNode.firstChild;

    while (currentNode) {
      walkDOM(currentNode, callbackFn, conditionFn);
      currentNode = currentNode.nextSibling;
    }
  }

  function walkTextNodes(topNode) {
    var callbackFn = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

    var conditionFn = function conditionFn(node) {
      return isTextNode(node);
    };
    walkDOM(topNode, callbackFn, conditionFn);
  }

  function clearChildNodes(element) {
    while (element.childNodes.length) {
      element.removeChild(element.childNodes[0]);
    }
  }

  // walks DOWN the dom from node to childNodes, returning the element
  // for which `conditionFn(element)` is true
  function walkDOMUntil(topNode) {
    var conditionFn = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

    if (!topNode) {
      throw new Error('Cannot call walkDOMUntil without a node');
    }
    var stack = [topNode];
    var currentElement = undefined;

    while (stack.length) {
      currentElement = stack.pop();

      if (conditionFn(currentElement)) {
        return currentElement;
      }

      (0, _contentKitEditorUtilsArrayUtils.forEach)(currentElement.childNodes, function (el) {
        return stack.push(el);
      });
    }
  }

  // see https://github.com/webmodules/node-contains/blob/master/index.js
  function containsNode(parentNode, childNode) {
    var isSame = function isSame() {
      return parentNode === childNode;
    };
    var isContainedBy = function isContainedBy() {
      var position = parentNode.compareDocumentPosition(childNode);
      return !!(position & Node.DOCUMENT_POSITION_CONTAINED_BY);
    };
    return isSame() || isContainedBy();
  }

  /**
   * converts the element's NamedNodeMap of attrs into
   * an object with key-value pairs
   * FIXME should add a whitelist as a second arg
   */
  function getAttributes(element) {
    var result = {};
    if (element.hasAttributes()) {
      var attributes = element.attributes;

      (0, _contentKitEditorUtilsArrayUtils.forEach)(attributes, function (_ref) {
        var name = _ref.name;
        var value = _ref.value;
        return result[name] = value;
      });
    }
    return result;
  }

  /**
   * converts the element's NamedNodeMap of attrs into
   * an array of key1,value1,key2,value2,...
   * FIXME should add a whitelist as a second arg
   */
  function getAttributesArray(element) {
    var attributes = getAttributes(element);
    var result = [];
    Object.keys(attributes).forEach(function (key) {
      result.push(key);
      result.push(attributes[key]);
    });
    return result;
  }

  exports.detectParentNode = detectParentNode;
  exports.containsNode = containsNode;
  exports.clearChildNodes = clearChildNodes;
  exports.getAttributes = getAttributes;
  exports.getAttributesArray = getAttributesArray;
  exports.walkDOMUntil = walkDOMUntil;
  exports.walkTextNodes = walkTextNodes;
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
define('content-kit-editor/utils/element-utils', ['exports', 'content-kit-editor/utils/string-utils'], function (exports, _contentKitEditorUtilsStringUtils) {
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

  function getData(element, name) {
    if (element.dataset) {
      return element.dataset[name];
    } else {
      var dataName = (0, _contentKitEditorUtilsStringUtils.dasherize)(name);
      return element.getAttribute(dataName);
    }
  }

  function setData(element, name, value) {
    if (element.dataset) {
      element.dataset[name] = value;
    } else {
      var dataName = (0, _contentKitEditorUtilsStringUtils.dasherize)(name);
      return element.setAttribute(dataName, value);
    }
  }

  exports.getData = getData;
  exports.setData = setData;
  exports.createDiv = createDiv;
  exports.hideElement = hideElement;
  exports.showElement = showElement;
  exports.swapElements = swapElements;
  exports.getEventTargetMatchingTag = getEventTargetMatchingTag;
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
define("content-kit-editor/utils/event-listener", ["exports"], function (exports) {
  "use strict";

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

  function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var EventListenerMixin = (function () {
    function EventListenerMixin() {
      _classCallCheck(this, EventListenerMixin);
    }

    _createClass(EventListenerMixin, [{
      key: "addEventListener",
      value: function addEventListener(context, eventName, listener) {
        if (!this._eventListeners) {
          this._eventListeners = [];
        }
        context.addEventListener(eventName, listener);
        this._eventListeners.push([context, eventName, listener]);
      }
    }, {
      key: "removeAllEventListeners",
      value: function removeAllEventListeners() {
        var listeners = this._eventListeners || [];
        listeners.forEach(function (_ref) {
          var _ref2 = _toArray(_ref);

          var context = _ref2[0];

          var args = _ref2.slice(1);

          context.removeEventListener.apply(context, _toConsumableArray(args));
        });
      }
    }]);

    return EventListenerMixin;
  })();

  exports["default"] = EventListenerMixin;
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
      return window.JSON.parse(jsonString);
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
      url: this.url + "?url=" + encodeURI(options.url),
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
    LEFT_ARROW: 37,
    BACKSPACE: 8,
    ENTER: 13,
    ESC: 27,
    DELETE: 46,
    M: 77
  };
});
define('content-kit-editor/utils/mixin', ['exports'], function (exports) {
  'use strict';

  exports['default'] = mixin;
  var CONSTRUCTOR_FN_NAME = 'constructor';

  function mixin(target, source) {
    target = target.prototype;
    // Fallback to just `source` to allow mixing in a plain object (pojo)
    source = source.prototype || source;

    Object.getOwnPropertyNames(source).forEach(function (name) {
      if (name !== CONSTRUCTOR_FN_NAME) {
        var descriptor = Object.getOwnPropertyDescriptor(source, name);

        Object.defineProperty(target, name, descriptor);
      }
    });
  }
});
define("content-kit-editor/utils/post-builder", ["exports", "content-kit-editor/models/post", "content-kit-editor/models/markup-section", "content-kit-editor/models/image", "content-kit-editor/models/marker", "content-kit-editor/models/markup", "content-kit-editor/models/card"], function (exports, _contentKitEditorModelsPost, _contentKitEditorModelsMarkupSection, _contentKitEditorModelsImage, _contentKitEditorModelsMarker, _contentKitEditorModelsMarkup, _contentKitEditorModelsCard) {
  "use strict";

  exports.generateBuilder = generateBuilder;

  var builder = {
    generatePost: function generatePost() {
      return new _contentKitEditorModelsPost["default"]();
    },
    generateMarkupSection: function generateMarkupSection(tagName, attributes, isGenerated) {
      var section = new _contentKitEditorModelsMarkupSection["default"](tagName);
      if (isGenerated) {
        section.isGenerated = !!isGenerated;
      }
      return section;
    },
    generateImageSection: function generateImageSection(url) {
      var section = new _contentKitEditorModelsImage["default"]();
      if (url) {
        section.src = url;
      }
      return section;
    },
    generateCardSection: function generateCardSection(name) {
      var payload = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      return new _contentKitEditorModelsCard["default"](name, payload);
    },
    generateMarker: function generateMarker(markups, value) {
      return new _contentKitEditorModelsMarker["default"](value, markups);
    },
    generateBlankMarker: function generateBlankMarker() {
      return new _contentKitEditorModelsMarker["default"]('__BLANK__');
    },
    generateMarkup: function generateMarkup(tagName, attributes) {
      if (attributes) {
        // FIXME: This could also be cached
        return new _contentKitEditorModelsMarkup["default"](tagName, attributes);
      }
      var markerType = this._markerTypeCache[tagName];
      if (!markerType) {
        this._markerTypeCache[tagName] = markerType = new _contentKitEditorModelsMarkup["default"](tagName);
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
define('content-kit-editor/utils/selection-utils', ['exports', 'content-kit-editor/utils/dom-utils'], function (exports, _contentKitEditorUtilsDomUtils) {
  'use strict';

  // TODO: remove, pass in Editor's current block set
  var RootTags = ['p', 'h2', 'h3', 'blockquote', 'ul', 'ol'];

  var SelectionDirection = {
    LEFT_TO_RIGHT: 1,
    RIGHT_TO_LEFT: 2,
    SAME_NODE: 3
  };

  function clearSelection() {
    // FIXME-IE ensure this works on IE 9. It works on IE10.
    window.getSelection().removeAllRanges();
  }

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
    // FIXME it used to return `anchorNode` when selection direction is `LEFT_TO_RIGHT`,
    // but I think that was a bug. In Safari and Chrome the selection usually had the
    // same anchorNode and focusNode when selecting text, so it didn't matter.
    var node = getDirectionOfSelection(selection) === SelectionDirection.LEFT_TO_RIGHT ? selection.focusNode : selection.anchorNode;
    return node && (node.nodeType === 3 ? node.parentNode : node);
  }

  function isSelectionInElement(element) {
    var selection = window.getSelection();
    var rangeCount = selection.rangeCount;
    var anchorNode = selection.anchorNode;
    var focusNode = selection.focusNode;

    var range = rangeCount > 0 && selection.getRangeAt(0);
    var hasSelection = range && !range.collapsed;

    if (hasSelection) {
      return (0, _contentKitEditorUtilsDomUtils.containsNode)(element, anchorNode) && (0, _contentKitEditorUtilsDomUtils.containsNode)(element, focusNode);
    } else {
      return false;
    }
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

  function restoreRange(range) {
    clearSelection();
    var selection = window.getSelection();
    selection.addRange(range);
  }

  function selectNode(node) {
    clearSelection();

    var range = document.createRange();
    range.setStart(node, 0);
    range.setEnd(node, node.length);

    var selection = window.getSelection();
    selection.addRange(range);
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
  exports.restoreRange = restoreRange;
  exports.selectNode = selectNode;
  exports.getCursorOffsetInElement = getCursorOffsetInElement;
  exports.clearSelection = clearSelection;
  exports.isSelectionInElement = isSelectionInElement;
});
define('content-kit-editor/utils/string-utils', ['exports'], function (exports) {
  /*
   * @param {String} string
   * @return {String} a dasherized string. 'modelIndex' -> 'model-index', etc
   */
  'use strict';

  exports.dasherize = dasherize;

  function dasherize(string) {
    return string.replace(/[A-Z]/g, function (match, offset) {
      var lower = match.toLowerCase();

      return offset === 0 ? lower : '-' + lower;
    });
  }
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

    this.addEventListener(embedIntent.button, 'mouseup', function (e) {
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

    this.addEventListener(rootElement, 'keyup', embedIntentHandler);
    this.addEventListener(document, 'mouseup', function () {
      setTimeout(function () {
        embedIntentHandler();
      });
    });

    this.addEventListener(document, 'keyup', function (e) {
      if (e.keyCode === _contentKitEditorUtilsKeycodes['default'].ESC) {
        embedIntent.hide();
      }
    });

    this.addEventListener(window, 'resize', function () {
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
define('content-kit-editor/views/prompt', ['exports', 'content-kit-editor/views/view', 'content-kit-editor/utils/selection-utils', 'content-kit-editor/utils/element-utils', 'content-kit-editor/utils/keycodes'], function (exports, _contentKitEditorViewsView, _contentKitEditorUtilsSelectionUtils, _contentKitEditorUtilsElementUtils, _contentKitEditorUtilsKeycodes) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var container = document.body;
  var hiliter = (0, _contentKitEditorUtilsElementUtils.createDiv)('ck-editor-hilite');

  function positionHiliteRange(range) {
    var rect = range.getBoundingClientRect();
    var style = hiliter.style;
    style.width = rect.width + 'px';
    style.height = rect.height + 'px';
    (0, _contentKitEditorUtilsElementUtils.positionElementToRect)(hiliter, rect);
  }

  var Prompt = (function (_View) {
    _inherits(Prompt, _View);

    function Prompt(options) {
      var _this = this;

      _classCallCheck(this, Prompt);

      options.tagName = 'input';
      _get(Object.getPrototypeOf(Prompt.prototype), 'constructor', this).call(this, options);

      var prompt = this;

      prompt.command = options.command;
      prompt.element.placeholder = options.placeholder || '';
      this.addEventListener(prompt.element, 'mouseup', function (e) {
        // prevents closing prompt when clicking input
        e.stopPropagation();
      });
      this.addEventListener(prompt.element, 'keyup', function (e) {
        var entry = prompt.element.value;

        if (entry && prompt.range && !e.shiftKey && e.which === _contentKitEditorUtilsKeycodes['default'].ENTER) {
          (0, _contentKitEditorUtilsSelectionUtils.restoreRange)(prompt.range);
          _this.command.exec(entry);
          if (_this.onComplete) {
            _this.onComplete();
          }
        }
      });

      this.addEventListener(window, 'resize', function () {
        var activeHilite = hiliter.parentNode;
        var range = prompt.range;
        if (activeHilite && range) {
          positionHiliteRange(range);
        }
      });
    }

    _createClass(Prompt, [{
      key: 'show',
      value: function show(callback) {
        var element = this.element;
        var selection = window.getSelection();
        var range = selection && selection.rangeCount && selection.getRangeAt(0);
        element.value = null;
        this.range = range || null;

        if (range) {
          container.appendChild(hiliter);
          positionHiliteRange(this.range);
          setTimeout(function () {
            // defer focus (disrupts mouseup events)
            element.focus();
          });
          if (callback) {
            this.onComplete = callback;
          }
        }
      }
    }, {
      key: 'hide',
      value: function hide() {
        if (hiliter.parentNode) {
          container.removeChild(hiliter);
        }
      }
    }]);

    return Prompt;
  })(_contentKitEditorViewsView['default']);

  exports['default'] = Prompt;
});
define('content-kit-editor/views/text-format-toolbar', ['exports', 'content-kit-editor/views/toolbar'], function (exports, _contentKitEditorViewsToolbar) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var TextFormatToolbar = (function (_Toolbar) {
    _inherits(TextFormatToolbar, _Toolbar);

    function TextFormatToolbar() {
      var _this = this;

      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      _classCallCheck(this, TextFormatToolbar);

      _get(Object.getPrototypeOf(TextFormatToolbar.prototype), 'constructor', this).call(this, options);

      this.editor.on('selection', function () {
        return _this.handleSelection();
      });
      this.editor.on('selectionUpdated', function () {
        return _this.handleSelection();
      });
      this.editor.on('selectionEnded', function () {
        return _this.handleSelectionEnded();
      });
      this.editor.on('escapeKey', function () {
        return _this.editor.cancelSelection();
      });
      this.addEventListener(window, 'resize', function () {
        return _this.handleResize();
      });
    }

    _createClass(TextFormatToolbar, [{
      key: 'handleResize',
      value: function handleResize() {
        if (this.isShowing) {
          var activePromptRange = this.activePrompt && this.activePrompt.range;
          this.positionToContent(activePromptRange ? activePromptRange : window.getSelection().getRangeAt(0));
        }
      }
    }, {
      key: 'handleSelection',
      value: function handleSelection() {
        this.show();
        this.updateForSelection(window.getSelection());
      }
    }, {
      key: 'handleSelectionEnded',
      value: function handleSelectionEnded() {
        this.hide();
      }
    }]);

    return TextFormatToolbar;
  })(_contentKitEditorViewsToolbar['default']);

  exports['default'] = TextFormatToolbar;
});
define('content-kit-editor/views/toolbar-button', ['exports', 'content-kit-editor/utils/mixin', 'content-kit-editor/utils/event-listener'], function (exports, _contentKitEditorUtilsMixin, _contentKitEditorUtilsEventListener) {
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
    this.addEventListener(element, 'mouseup', function (e) {
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

  (0, _contentKitEditorUtilsMixin['default'])(ToolbarButton, _contentKitEditorUtilsEventListener['default']);

  exports['default'] = ToolbarButton;
});
define('content-kit-editor/views/toolbar', ['exports', 'content-kit-editor/views/view', 'content-kit-editor/views/toolbar-button', 'content-kit-editor/utils/selection-utils', 'content-kit-editor/utils/element-utils'], function (exports, _contentKitEditorViewsView, _contentKitEditorViewsToolbarButton, _contentKitEditorUtilsSelectionUtils, _contentKitEditorUtilsElementUtils) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

  var Toolbar = (function (_View) {
    _inherits(Toolbar, _View);

    function Toolbar() {
      var _this = this;

      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      _classCallCheck(this, Toolbar);

      options.classNames = ['ck-toolbar'];
      _get(Object.getPrototypeOf(Toolbar.prototype), 'constructor', this).call(this, options);

      var commands = options.commands;
      var commandCount = commands && commands.length;

      this.setDirection(options.direction || ToolbarDirection.TOP);
      this.editor = options.editor || null;
      this.embedIntent = options.embedIntent || null;
      this.activePrompt = null;
      this.buttons = [];

      this.contentElement = (0, _contentKitEditorUtilsElementUtils.createDiv)('ck-toolbar-content');
      this.promptContainerElement = (0, _contentKitEditorUtilsElementUtils.createDiv)('ck-toolbar-prompt');
      this.buttonContainerElement = (0, _contentKitEditorUtilsElementUtils.createDiv)('ck-toolbar-buttons');
      this.contentElement.appendChild(this.promptContainerElement);
      this.contentElement.appendChild(this.buttonContainerElement);
      this.element.appendChild(this.contentElement);

      for (var i = 0; i < commandCount; i++) {
        this.addCommand(commands[i]);
      }

      // Closes prompt if displayed when changing selection
      this.addEventListener(document, 'mouseup', function () {
        _this.dismissPrompt();
      });
    }

    _createClass(Toolbar, [{
      key: 'hide',
      value: function hide() {
        if (_get(Object.getPrototypeOf(Toolbar.prototype), 'hide', this).call(this)) {
          var style = this.element.style;
          style.left = '';
          style.top = '';
          this.dismissPrompt();
        }
      }
    }, {
      key: 'addCommand',
      value: function addCommand(command) {
        command.editorContext = this.editor;
        command.embedIntent = this.embedIntent;
        var button = new _contentKitEditorViewsToolbarButton['default']({ command: command, toolbar: this });
        this.buttons.push(button);
        this.buttonContainerElement.appendChild(button.element);
      }
    }, {
      key: 'displayPrompt',
      value: function displayPrompt(prompt) {
        var _this2 = this;

        (0, _contentKitEditorUtilsElementUtils.swapElements)(this.promptContainerElement, this.buttonContainerElement);
        this.promptContainerElement.appendChild(prompt.element);
        prompt.show(function () {
          _this2.dismissPrompt();
          _this2.updateForSelection();
        });
        this.activePrompt = prompt;
      }
    }, {
      key: 'dismissPrompt',
      value: function dismissPrompt() {
        var activePrompt = this.activePrompt;
        if (activePrompt) {
          activePrompt.hide();
          (0, _contentKitEditorUtilsElementUtils.swapElements)(this.buttonContainerElement, this.promptContainerElement);
          this.activePrompt = null;
        }
      }
    }, {
      key: 'updateForSelection',
      value: function updateForSelection() {
        var selection = arguments.length <= 0 || arguments[0] === undefined ? window.getSelection() : arguments[0];

        if (!selection.isCollapsed) {
          this.positionToContent(selection.getRangeAt(0));
          updateButtonsForSelection(this.buttons, selection);
        }
      }
    }, {
      key: 'positionToContent',
      value: function positionToContent(content) {
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
      }
    }, {
      key: 'setDirection',
      value: function setDirection(direction) {
        this.direction = direction;
        if (direction === ToolbarDirection.RIGHT) {
          this.addClass('right');
        } else {
          this.removeClass('right');
        }
      }
    }]);

    return Toolbar;
  })(_contentKitEditorViewsView['default']);

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

    this.addEventListener(rootElement, 'mouseover', function (e) {
      var target = (0, _contentKitEditorUtilsElementUtils.getEventTargetMatchingTag)(options.showForTag, e.target, rootElement);
      if (target && target.isContentEditable) {
        timeout = setTimeout(function () {
          tooltip.showLink(target.href, target);
        }, delay);
      }
    });

    this.addEventListener(rootElement, 'mouseout', function (e) {
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
define('content-kit-editor/views/view', ['exports', 'content-kit-editor/utils/mixin', 'content-kit-editor/utils/event-listener'], function (exports, _contentKitEditorUtilsMixin, _contentKitEditorUtilsEventListener) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function renderClasses(view) {
    var classNames = view.classNames;
    if (classNames && classNames.length) {
      view.element.className = classNames.join(' ');
    } else if (view.element.className) {
      view.element.removeAttribute('className');
    }
  }

  var View = (function () {
    function View() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      _classCallCheck(this, View);

      this.tagName = options.tagName || 'div';
      this.classNames = options.classNames || [];
      this.element = document.createElement(this.tagName);
      this.container = options.container || document.body;
      this.isShowing = false;
      renderClasses(this);
    }

    _createClass(View, [{
      key: 'show',
      value: function show() {
        var view = this;
        if (!view.isShowing) {
          view.container.appendChild(view.element);
          view.isShowing = true;
          return true;
        }
      }
    }, {
      key: 'hide',
      value: function hide() {
        var view = this;
        if (view.isShowing) {
          view.container.removeChild(view.element);
          view.isShowing = false;
          return true;
        }
      }
    }, {
      key: 'addClass',
      value: function addClass(className) {
        var index = this.classNames && this.classNames.indexOf(className);
        if (index === -1) {
          this.classNames.push(className);
          renderClasses(this);
        }
      }
    }, {
      key: 'removeClass',
      value: function removeClass(className) {
        var index = this.classNames && this.classNames.indexOf(className);
        if (index > -1) {
          this.classNames.splice(index, 1);
          renderClasses(this);
        }
      }
    }, {
      key: 'setClasses',
      value: function setClasses(classNameArr) {
        this.classNames = classNameArr;
        renderClasses(this);
      }
    }, {
      key: 'destroy',
      value: function destroy() {
        this.removeAllEventListeners();
        this.hide();
      }
    }]);

    return View;
  })();

  (0, _contentKitEditorUtilsMixin['default'])(View, _contentKitEditorUtilsEventListener['default']);

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

  // needs a default export to be compatible with
  // broccoli-multi-builder
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
require("content-kit-editor")["registerGlobal"](window, document);
})();