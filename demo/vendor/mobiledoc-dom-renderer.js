;(function() {
var loader, define, requireModule, require, requirejs;
var global = this;

(function() {
  'use strict';

  // Save off the original values of these globals, so we can restore them if someone asks us to
  var oldGlobals = {
    loader: loader,
    define: define,
    requireModule: requireModule,
    require: require,
    requirejs: requirejs
  };

  loader = {
    noConflict: function(aliases) {
      var oldName, newName;

      for (oldName in aliases) {
        if (aliases.hasOwnProperty(oldName)) {
          if (oldGlobals.hasOwnProperty(oldName)) {
            newName = aliases[oldName];

            global[newName] = global[oldName];
            global[oldName] = oldGlobals[oldName];
          }
        }
      }
    }
  };

  var _isArray;
  if (!Array.isArray) {
    _isArray = function (x) {
      return Object.prototype.toString.call(x) === '[object Array]';
    };
  } else {
    _isArray = Array.isArray;
  }

  var registry = {};
  var seen = {};
  var FAILED = false;
  var LOADED = true;

  var uuid = 0;

  function unsupportedModule(length) {
    throw new Error('an unsupported module was defined, expected `define(name, deps, module)` instead got: `' +
                    length + '` arguments to define`');
  }

  var defaultDeps = ['require', 'exports', 'module'];

  function Module(name, deps, callback) {
    this.id        = uuid++;
    this.name      = name;
    this.deps      = !deps.length && callback.length ? defaultDeps : deps;
    this.module    = { exports: {} };
    this.callback  = callback;
    this.state     = undefined;
    this._require  = undefined;
    this.finalized = false;
    this.hasExportsAsDep = false;
  }

  Module.prototype.makeDefaultExport = function() {
    var exports = this.module.exports;
    if (exports !== null &&
        (typeof exports === 'object' || typeof exports === 'function') &&
          exports['default'] === undefined) {
      exports['default'] = exports;
    }
  };

  Module.prototype.exports = function(reifiedDeps) {
    if (this.finalized) {
      return this.module.exports;
    } else {
      if (loader.wrapModules) {
        this.callback = loader.wrapModules(this.name, this.callback);
      }
      var result = this.callback.apply(this, reifiedDeps);
      if (!(this.hasExportsAsDep && result === undefined)) {
        this.module.exports = result;
      }
      this.makeDefaultExport();
      this.finalized = true;
      return this.module.exports;
    }
  };

  Module.prototype.unsee = function() {
    this.finalized = false;
    this.state = undefined;
    this.module = { exports: {}};
  };

  Module.prototype.reify = function() {
    var deps = this.deps;
    var length = deps.length;
    var reified = new Array(length);
    var dep;

    for (var i = 0, l = length; i < l; i++) {
      dep = deps[i];
      if (dep === 'exports') {
        this.hasExportsAsDep = true;
        reified[i] = this.module.exports;
      } else if (dep === 'require') {
        reified[i] = this.makeRequire();
      } else if (dep === 'module') {
        reified[i] = this.module;
      } else {
        reified[i] = findModule(resolve(dep, this.name), this.name).module.exports;
      }
    }

    return reified;
  };

  Module.prototype.makeRequire = function() {
    var name = this.name;

    return this._require || (this._require = function(dep) {
      return require(resolve(dep, name));
    });
  };

  Module.prototype.build = function() {
    if (this.state === FAILED) { return; }
    this.state = FAILED;
    this.exports(this.reify());
    this.state = LOADED;
  };

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

  function missingModule(name, referrer) {
    throw new Error('Could not find module `' + name + '` imported from `' + referrer + '`');
  }

  requirejs = require = requireModule = function(name) {
    return findModule(name, '(require)').module.exports;
  };

  function findModule(name, referrer) {
    var mod = registry[name] || registry[name + '/index'];

    while (mod && mod.callback instanceof Alias) {
      name = mod.callback.name;
      mod = registry[name];
    }

    if (!mod) { missingModule(name, referrer); }

    mod.build();
    return mod;
  }

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
      } else if (part === '.') {
        continue;
      } else { parentBase.push(part); }
    }

    return parentBase.join('/');
  }

  requirejs.entries = requirejs._eak_seen = registry;
  requirejs.unsee = function(moduleName) {
    findModule(moduleName, '(unsee)').unsee();
  };

  requirejs.clear = function() {
    requirejs.entries = requirejs._eak_seen = registry = {};
    seen = {};
  };
})();

define('mobiledoc-dom-renderer/cards/image', ['exports', 'mobiledoc-dom-renderer/utils/render-type'], function (exports, _mobiledocDomRendererUtilsRenderType) {
  'use strict';

  exports['default'] = {
    name: 'image',
    type: _mobiledocDomRendererUtilsRenderType['default'],
    render: function render(_ref) {
      var payload = _ref.payload;
      var dom = _ref.env.dom;

      var img = dom.createElement('img');
      img.src = payload.src;
      return img;
    }
  };
});
define('mobiledoc-dom-renderer', ['exports', 'mobiledoc-dom-renderer/renderer-factory', 'mobiledoc-dom-renderer/utils/render-type'], function (exports, _mobiledocDomRendererRendererFactory, _mobiledocDomRendererUtilsRenderType) {
  'use strict';

  exports.registerGlobal = registerGlobal;
  exports.RENDER_TYPE = _mobiledocDomRendererUtilsRenderType['default'];

  function registerGlobal(window) {
    window.MobiledocDOMRenderer = _mobiledocDomRendererRendererFactory['default'];
  }

  exports['default'] = _mobiledocDomRendererRendererFactory['default'];
});
define('mobiledoc-dom-renderer/renderer-factory', ['exports', 'mobiledoc-dom-renderer/renderers/0-2', 'mobiledoc-dom-renderer/renderers/0-3', 'mobiledoc-dom-renderer/utils/render-type'], function (exports, _mobiledocDomRendererRenderers02, _mobiledocDomRendererRenderers03, _mobiledocDomRendererUtilsRenderType) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  /**
   * runtime DOM renderer
   * renders a mobiledoc to DOM
   *
   * input: mobiledoc
   * output: DOM
   */

  function validateCards(cards) {
    if (!Array.isArray(cards)) {
      throw new Error('`cards` must be passed as an array');
    }
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      if (card.type !== _mobiledocDomRendererUtilsRenderType['default']) {
        throw new Error('Card "' + card.name + '" must be of type "' + _mobiledocDomRendererUtilsRenderType['default'] + '", was "' + card.type + '"');
      }
      if (!card.render) {
        throw new Error('Card "' + card.name + '" must define `render`');
      }
    }
  }

  function validateAtoms(atoms) {
    if (!Array.isArray(atoms)) {
      throw new Error('`atoms` must be passed as an array');
    }
    for (var i = 0; i < atoms.length; i++) {
      var atom = atoms[i];
      if (atom.type !== _mobiledocDomRendererUtilsRenderType['default']) {
        throw new Error('Atom "' + atom.name + '" must be type "' + _mobiledocDomRendererUtilsRenderType['default'] + '", was "' + atom.type + '"');
      }
      if (!atom.render) {
        throw new Error('Atom "' + atom.name + '" must define `render`');
      }
    }
  }

  var RendererFactory = (function () {
    function RendererFactory() {
      var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var _ref$cards = _ref.cards;
      var cards = _ref$cards === undefined ? [] : _ref$cards;
      var _ref$atoms = _ref.atoms;
      var atoms = _ref$atoms === undefined ? [] : _ref$atoms;
      var _ref$cardOptions = _ref.cardOptions;
      var cardOptions = _ref$cardOptions === undefined ? {} : _ref$cardOptions;
      var unknownCardHandler = _ref.unknownCardHandler;
      var unknownAtomHandler = _ref.unknownAtomHandler;
      var _ref$markupElementRenderer = _ref.markupElementRenderer;
      var markupElementRenderer = _ref$markupElementRenderer === undefined ? {} : _ref$markupElementRenderer;
      var _ref$sectionElementRenderer = _ref.sectionElementRenderer;
      var sectionElementRenderer = _ref$sectionElementRenderer === undefined ? {} : _ref$sectionElementRenderer;
      var dom = _ref.dom;
      var _ref$markupSanitizer = _ref.markupSanitizer;
      var markupSanitizer = _ref$markupSanitizer === undefined ? null : _ref$markupSanitizer;

      _classCallCheck(this, RendererFactory);

      validateCards(cards);
      validateAtoms(atoms);

      if (!dom) {
        if (typeof window === 'undefined') {
          throw new Error('A `dom` option must be provided to the renderer when running without window.document');
        }
        dom = window.document;
      }

      this.options = {
        cards: cards,
        atoms: atoms,
        cardOptions: cardOptions,
        unknownCardHandler: unknownCardHandler,
        unknownAtomHandler: unknownAtomHandler,
        markupElementRenderer: markupElementRenderer,
        sectionElementRenderer: sectionElementRenderer,
        dom: dom,
        markupSanitizer: markupSanitizer
      };
    }

    _createClass(RendererFactory, [{
      key: 'render',
      value: function render(mobiledoc) {
        var version = mobiledoc.version;

        switch (version) {
          case _mobiledocDomRendererRenderers02.MOBILEDOC_VERSION:
          case undefined:
          case null:
            return new _mobiledocDomRendererRenderers02['default'](mobiledoc, this.options).render();
          case _mobiledocDomRendererRenderers03.MOBILEDOC_VERSION_0_3_0:
          case _mobiledocDomRendererRenderers03.MOBILEDOC_VERSION_0_3_1:
          case _mobiledocDomRendererRenderers03.MOBILEDOC_VERSION_0_3_2:
            return new _mobiledocDomRendererRenderers03['default'](mobiledoc, this.options).render();
          default:
            throw new Error('Unexpected Mobiledoc version "' + version + '"');
        }
      }
    }]);

    return RendererFactory;
  })();

  exports['default'] = RendererFactory;
});
define('mobiledoc-dom-renderer/renderers/0-2', ['exports', 'mobiledoc-dom-renderer/utils/dom', 'mobiledoc-dom-renderer/cards/image', 'mobiledoc-dom-renderer/utils/render-type', 'mobiledoc-dom-renderer/utils/section-types', 'mobiledoc-dom-renderer/utils/tag-names', 'mobiledoc-dom-renderer/utils/sanitization-utils', 'mobiledoc-dom-renderer/utils/render-utils'], function (exports, _mobiledocDomRendererUtilsDom, _mobiledocDomRendererCardsImage, _mobiledocDomRendererUtilsRenderType, _mobiledocDomRendererUtilsSectionTypes, _mobiledocDomRendererUtilsTagNames, _mobiledocDomRendererUtilsSanitizationUtils, _mobiledocDomRendererUtilsRenderUtils) {
  'use strict';

  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var MOBILEDOC_VERSION = '0.2.0';

  exports.MOBILEDOC_VERSION = MOBILEDOC_VERSION;
  var IMAGE_SECTION_TAG_NAME = 'img';

  function validateVersion(version) {
    if (version !== MOBILEDOC_VERSION) {
      throw new Error('Unexpected Mobiledoc version "' + version + '"');
    }
  }

  var Renderer = (function () {
    function Renderer(mobiledoc, options) {
      var _this = this;

      _classCallCheck(this, Renderer);

      var cards = options.cards;
      var cardOptions = options.cardOptions;
      var unknownCardHandler = options.unknownCardHandler;
      var markupElementRenderer = options.markupElementRenderer;
      var sectionElementRenderer = options.sectionElementRenderer;
      var dom = options.dom;
      var version = mobiledoc.version;
      var sectionData = mobiledoc.sections;

      validateVersion(version);

      var _sectionData = _slicedToArray(sectionData, 2);

      var markerTypes = _sectionData[0];
      var sections = _sectionData[1];

      this.dom = dom;
      this.root = dom.createDocumentFragment();
      this.markerTypes = markerTypes;
      this.sections = sections;
      this.cards = cards;
      this.cardOptions = cardOptions;
      this.unknownCardHandler = unknownCardHandler || this._defaultUnknownCardHandler;

      this.sectionElementRenderer = {
        '__default__': _mobiledocDomRendererUtilsRenderUtils.defaultSectionElementRenderer
      };
      Object.keys(sectionElementRenderer).forEach(function (key) {
        _this.sectionElementRenderer[key.toLowerCase()] = sectionElementRenderer[key];
      });

      this.markupElementRenderer = {
        '__default__': _mobiledocDomRendererUtilsRenderUtils.defaultMarkupElementRenderer
      };
      Object.keys(markupElementRenderer).forEach(function (key) {
        _this.markupElementRenderer[key.toLowerCase()] = markupElementRenderer[key];
      });

      this._renderCallbacks = [];
      this._teardownCallbacks = [];
      this._renderedChildNodes = [];
    }

    _createClass(Renderer, [{
      key: 'render',
      value: function render() {
        var _this2 = this;

        this.sections.forEach(function (section) {
          var rendered = _this2.renderSection(section);
          if (rendered) {
            _this2.root.appendChild(rendered);
          }
        });
        for (var i = 0; i < this._renderCallbacks.length; i++) {
          this._renderCallbacks[i]();
        }
        // maintain a reference to child nodes so they can be cleaned up later by teardown
        this._renderedChildNodes = [];
        var node = this.root.firstChild;
        while (node) {
          this._renderedChildNodes.push(node);
          node = node.nextSibling;
        }
        return { result: this.root, teardown: function teardown() {
            return _this2.teardown();
          } };
      }
    }, {
      key: 'teardown',
      value: function teardown() {
        for (var i = 0; i < this._teardownCallbacks.length; i++) {
          this._teardownCallbacks[i]();
        }
        for (var i = 0; i < this._renderedChildNodes.length; i++) {
          var node = this._renderedChildNodes[i];
          if (node.parentNode) {
            node.parentNode.removeChild(node);
          }
        }
      }
    }, {
      key: 'renderSection',
      value: function renderSection(section) {
        var _section = _slicedToArray(section, 1);

        var type = _section[0];

        switch (type) {
          case _mobiledocDomRendererUtilsSectionTypes.MARKUP_SECTION_TYPE:
            return this.renderMarkupSection(section);
          case _mobiledocDomRendererUtilsSectionTypes.IMAGE_SECTION_TYPE:
            return this.renderImageSection(section);
          case _mobiledocDomRendererUtilsSectionTypes.LIST_SECTION_TYPE:
            return this.renderListSection(section);
          case _mobiledocDomRendererUtilsSectionTypes.CARD_SECTION_TYPE:
            return this.renderCardSection(section);
          default:
            throw new Error('Cannot render mobiledoc section of type "' + type + '"');
        }
      }
    }, {
      key: 'renderMarkersOnElement',
      value: function renderMarkersOnElement(element, markers) {
        var elements = [element];
        var currentElement = element;

        var pushElement = function pushElement(openedElement) {
          currentElement.appendChild(openedElement);
          elements.push(openedElement);
          currentElement = openedElement;
        };

        for (var i = 0, l = markers.length; i < l; i++) {
          var marker = markers[i];

          var _marker = _slicedToArray(marker, 3);

          var openTypes = _marker[0];
          var closeCount = _marker[1];
          var text = _marker[2];

          for (var j = 0, m = openTypes.length; j < m; j++) {
            var markerType = this.markerTypes[openTypes[j]];

            var _markerType = _slicedToArray(markerType, 2);

            var tagName = _markerType[0];
            var _markerType$1 = _markerType[1];
            var attrs = _markerType$1 === undefined ? [] : _markerType$1;

            if ((0, _mobiledocDomRendererUtilsTagNames.isValidMarkerType)(tagName)) {
              pushElement(this.renderMarkupElement(tagName, attrs));
            } else {
              closeCount--;
            }
          }

          currentElement.appendChild((0, _mobiledocDomRendererUtilsDom.createTextNode)(this.dom, text));

          for (var j = 0, m = closeCount; j < m; j++) {
            elements.pop();
            currentElement = elements[elements.length - 1];
          }
        }
      }

      /**
       * @param attrs Array
       */
    }, {
      key: 'renderMarkupElement',
      value: function renderMarkupElement(tagName, attrs) {
        tagName = tagName.toLowerCase();
        attrs = (0, _mobiledocDomRendererUtilsSanitizationUtils.reduceAttributes)(attrs);

        var renderer = this.markupElementRendererFor(tagName);
        return renderer(tagName, this.dom, attrs);
      }
    }, {
      key: 'markupElementRendererFor',
      value: function markupElementRendererFor(tagName) {
        return this.markupElementRenderer[tagName] || this.markupElementRenderer.__default__;
      }
    }, {
      key: 'renderListItem',
      value: function renderListItem(markers) {
        var element = this.dom.createElement('li');
        this.renderMarkersOnElement(element, markers);
        return element;
      }
    }, {
      key: 'renderListSection',
      value: function renderListSection(_ref) {
        var _this3 = this;

        var _ref2 = _slicedToArray(_ref, 3);

        var type = _ref2[0];
        var tagName = _ref2[1];
        var listItems = _ref2[2];

        if (!(0, _mobiledocDomRendererUtilsTagNames.isValidSectionTagName)(tagName, _mobiledocDomRendererUtilsSectionTypes.LIST_SECTION_TYPE)) {
          return;
        }
        var element = this.dom.createElement(tagName);
        listItems.forEach(function (li) {
          element.appendChild(_this3.renderListItem(li));
        });
        return element;
      }
    }, {
      key: 'renderImageSection',
      value: function renderImageSection(_ref3) {
        var _ref32 = _slicedToArray(_ref3, 2);

        var type = _ref32[0];
        var src = _ref32[1];

        var element = this.dom.createElement(IMAGE_SECTION_TAG_NAME);
        element.src = src;
        return element;
      }
    }, {
      key: 'findCard',
      value: function findCard(name) {
        for (var i = 0; i < this.cards.length; i++) {
          if (this.cards[i].name === name) {
            return this.cards[i];
          }
        }
        if (name === _mobiledocDomRendererCardsImage['default'].name) {
          return _mobiledocDomRendererCardsImage['default'];
        }
        return this._createUnknownCard(name);
      }
    }, {
      key: '_createUnknownCard',
      value: function _createUnknownCard(name) {
        return {
          name: name,
          type: _mobiledocDomRendererUtilsRenderType['default'],
          render: this.unknownCardHandler
        };
      }
    }, {
      key: '_createCardArgument',
      value: function _createCardArgument(card) {
        var _this4 = this;

        var payload = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        var env = {
          name: card.name,
          isInEditor: false,
          dom: this.dom,
          didRender: function didRender(callback) {
            return _this4._registerRenderCallback(callback);
          },
          onTeardown: function onTeardown(callback) {
            return _this4._registerTeardownCallback(callback);
          }
        };

        var options = this.cardOptions;

        return { env: env, options: options, payload: payload };
      }
    }, {
      key: '_registerRenderCallback',
      value: function _registerRenderCallback(callback) {
        this._renderCallbacks.push(callback);
      }
    }, {
      key: '_registerTeardownCallback',
      value: function _registerTeardownCallback(callback) {
        this._teardownCallbacks.push(callback);
      }
    }, {
      key: 'renderCardSection',
      value: function renderCardSection(_ref4) {
        var _ref42 = _slicedToArray(_ref4, 3);

        var type = _ref42[0];
        var name = _ref42[1];
        var payload = _ref42[2];

        var card = this.findCard(name);

        var cardArg = this._createCardArgument(card, payload);
        var rendered = card.render(cardArg);

        this._validateCardRender(rendered, card.name);

        return rendered;
      }
    }, {
      key: '_validateCardRender',
      value: function _validateCardRender(rendered, cardName) {
        if (!rendered) {
          return;
        }

        if (typeof rendered !== 'object') {
          throw new Error('Card "' + cardName + '" must render ' + _mobiledocDomRendererUtilsRenderType['default'] + ', but result was "' + rendered + '"');
        }
      }
    }, {
      key: 'renderMarkupSection',
      value: function renderMarkupSection(_ref5) {
        var _ref52 = _slicedToArray(_ref5, 3);

        var type = _ref52[0];
        var tagName = _ref52[1];
        var markers = _ref52[2];

        tagName = tagName.toLowerCase();
        if (!(0, _mobiledocDomRendererUtilsTagNames.isValidSectionTagName)(tagName, _mobiledocDomRendererUtilsSectionTypes.MARKUP_SECTION_TYPE)) {
          return;
        }

        var renderer = this.sectionElementRendererFor(tagName);
        var element = renderer(tagName, this.dom);

        this.renderMarkersOnElement(element, markers);
        return element;
      }
    }, {
      key: 'sectionElementRendererFor',
      value: function sectionElementRendererFor(tagName) {
        return this.sectionElementRenderer[tagName] || this.sectionElementRenderer.__default__;
      }
    }, {
      key: '_defaultUnknownCardHandler',
      get: function get() {
        return function (_ref6) {
          var name = _ref6.env.name;

          throw new Error('Card "' + name + '" not found but no unknownCardHandler was registered');
        };
      }
    }]);

    return Renderer;
  })();

  exports['default'] = Renderer;
});
define('mobiledoc-dom-renderer/renderers/0-3', ['exports', 'mobiledoc-dom-renderer/utils/dom', 'mobiledoc-dom-renderer/cards/image', 'mobiledoc-dom-renderer/utils/render-type', 'mobiledoc-dom-renderer/utils/section-types', 'mobiledoc-dom-renderer/utils/tag-names', 'mobiledoc-dom-renderer/utils/sanitization-utils', 'mobiledoc-dom-renderer/utils/render-utils', 'mobiledoc-dom-renderer/utils/marker-types'], function (exports, _mobiledocDomRendererUtilsDom, _mobiledocDomRendererCardsImage, _mobiledocDomRendererUtilsRenderType, _mobiledocDomRendererUtilsSectionTypes, _mobiledocDomRendererUtilsTagNames, _mobiledocDomRendererUtilsSanitizationUtils, _mobiledocDomRendererUtilsRenderUtils, _mobiledocDomRendererUtilsMarkerTypes) {
  'use strict';

  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var MOBILEDOC_VERSION_0_3_0 = '0.3.0';
  exports.MOBILEDOC_VERSION_0_3_0 = MOBILEDOC_VERSION_0_3_0;
  var MOBILEDOC_VERSION_0_3_1 = '0.3.1';
  exports.MOBILEDOC_VERSION_0_3_1 = MOBILEDOC_VERSION_0_3_1;
  var MOBILEDOC_VERSION_0_3_2 = '0.3.2';

  exports.MOBILEDOC_VERSION_0_3_2 = MOBILEDOC_VERSION_0_3_2;
  var IMAGE_SECTION_TAG_NAME = 'img';

  function validateVersion(version) {
    switch (version) {
      case MOBILEDOC_VERSION_0_3_0:
      case MOBILEDOC_VERSION_0_3_1:
      case MOBILEDOC_VERSION_0_3_2:
        return;
      default:
        throw new Error('Unexpected Mobiledoc version "' + version + '"');
    }
  }

  var Renderer = (function () {
    function Renderer(mobiledoc, state) {
      var _this = this;

      _classCallCheck(this, Renderer);

      var cards = state.cards;
      var cardOptions = state.cardOptions;
      var atoms = state.atoms;
      var unknownCardHandler = state.unknownCardHandler;
      var unknownAtomHandler = state.unknownAtomHandler;
      var markupElementRenderer = state.markupElementRenderer;
      var sectionElementRenderer = state.sectionElementRenderer;
      var dom = state.dom;
      var version = mobiledoc.version;
      var sections = mobiledoc.sections;
      var atomTypes = mobiledoc.atoms;
      var cardTypes = mobiledoc.cards;
      var markerTypes = mobiledoc.markups;

      validateVersion(version);

      this.dom = dom;
      this.root = this.dom.createDocumentFragment();
      this.sections = sections;
      this.atomTypes = atomTypes;
      this.cardTypes = cardTypes;
      this.markerTypes = markerTypes;
      this.cards = cards;
      this.atoms = atoms;
      this.cardOptions = cardOptions;
      this.unknownCardHandler = unknownCardHandler || this._defaultUnknownCardHandler;
      this.unknownAtomHandler = unknownAtomHandler || this._defaultUnknownAtomHandler;

      this.sectionElementRenderer = {
        '__default__': _mobiledocDomRendererUtilsRenderUtils.defaultSectionElementRenderer
      };
      Object.keys(sectionElementRenderer).forEach(function (key) {
        _this.sectionElementRenderer[key.toLowerCase()] = sectionElementRenderer[key];
      });

      this.markupElementRenderer = {
        '__default__': _mobiledocDomRendererUtilsRenderUtils.defaultMarkupElementRenderer
      };
      Object.keys(markupElementRenderer).forEach(function (key) {
        _this.markupElementRenderer[key.toLowerCase()] = markupElementRenderer[key];
      });

      this._renderCallbacks = [];
      this._teardownCallbacks = [];
    }

    _createClass(Renderer, [{
      key: 'render',
      value: function render() {
        var _this2 = this;

        this.sections.forEach(function (section) {
          var rendered = _this2.renderSection(section);
          if (rendered) {
            _this2.root.appendChild(rendered);
          }
        });
        for (var i = 0; i < this._renderCallbacks.length; i++) {
          this._renderCallbacks[i]();
        }
        // maintain a reference to child nodes so they can be cleaned up later by teardown
        this._renderedChildNodes = Array.prototype.slice.call(this.root.childNodes);
        return { result: this.root, teardown: function teardown() {
            return _this2.teardown();
          } };
      }
    }, {
      key: 'teardown',
      value: function teardown() {
        for (var i = 0; i < this._teardownCallbacks.length; i++) {
          this._teardownCallbacks[i]();
        }
        for (var i = 0; i < this._renderedChildNodes.length; i++) {
          var node = this._renderedChildNodes[i];
          if (node.parentNode) {
            node.parentNode.removeChild(node);
          }
        }
      }
    }, {
      key: 'renderSection',
      value: function renderSection(section) {
        var _section = _slicedToArray(section, 1);

        var type = _section[0];

        switch (type) {
          case _mobiledocDomRendererUtilsSectionTypes.MARKUP_SECTION_TYPE:
            return this.renderMarkupSection(section);
          case _mobiledocDomRendererUtilsSectionTypes.IMAGE_SECTION_TYPE:
            return this.renderImageSection(section);
          case _mobiledocDomRendererUtilsSectionTypes.LIST_SECTION_TYPE:
            return this.renderListSection(section);
          case _mobiledocDomRendererUtilsSectionTypes.CARD_SECTION_TYPE:
            return this.renderCardSection(section);
          default:
            throw new Error('Cannot render mobiledoc section of type "' + type + '"');
        }
      }
    }, {
      key: 'renderMarkersOnElement',
      value: function renderMarkersOnElement(element, markers) {
        var elements = [element];
        var currentElement = element;

        var pushElement = function pushElement(openedElement) {
          currentElement.appendChild(openedElement);
          elements.push(openedElement);
          currentElement = openedElement;
        };

        for (var i = 0, l = markers.length; i < l; i++) {
          var marker = markers[i];

          var _marker = _slicedToArray(marker, 4);

          var type = _marker[0];
          var openTypes = _marker[1];
          var closeCount = _marker[2];
          var value = _marker[3];

          for (var j = 0, m = openTypes.length; j < m; j++) {
            var markerType = this.markerTypes[openTypes[j]];

            var _markerType = _slicedToArray(markerType, 2);

            var tagName = _markerType[0];
            var _markerType$1 = _markerType[1];
            var attrs = _markerType$1 === undefined ? [] : _markerType$1;

            if ((0, _mobiledocDomRendererUtilsTagNames.isValidMarkerType)(tagName)) {
              pushElement(this.renderMarkupElement(tagName, attrs));
            } else {
              closeCount--;
            }
          }

          switch (type) {
            case _mobiledocDomRendererUtilsMarkerTypes.MARKUP_MARKER_TYPE:
              currentElement.appendChild((0, _mobiledocDomRendererUtilsDom.createTextNode)(this.dom, value));
              break;
            case _mobiledocDomRendererUtilsMarkerTypes.ATOM_MARKER_TYPE:
              currentElement.appendChild(this._renderAtom(value));
              break;
            default:
              throw new Error('Unknown markup type (' + type + ')');
          }

          for (var j = 0, m = closeCount; j < m; j++) {
            elements.pop();
            currentElement = elements[elements.length - 1];
          }
        }
      }

      /**
       * @param attrs Array
       */
    }, {
      key: 'renderMarkupElement',
      value: function renderMarkupElement(tagName, attrs) {
        tagName = tagName.toLowerCase();
        attrs = (0, _mobiledocDomRendererUtilsSanitizationUtils.reduceAttributes)(attrs);

        var renderer = this.markupElementRendererFor(tagName);
        return renderer(tagName, this.dom, attrs);
      }
    }, {
      key: 'markupElementRendererFor',
      value: function markupElementRendererFor(tagName) {
        return this.markupElementRenderer[tagName] || this.markupElementRenderer.__default__;
      }
    }, {
      key: 'renderListItem',
      value: function renderListItem(markers) {
        var element = this.dom.createElement('li');
        this.renderMarkersOnElement(element, markers);
        return element;
      }
    }, {
      key: 'renderListSection',
      value: function renderListSection(_ref) {
        var _this3 = this;

        var _ref2 = _slicedToArray(_ref, 3);

        var type = _ref2[0];
        var tagName = _ref2[1];
        var listItems = _ref2[2];

        if (!(0, _mobiledocDomRendererUtilsTagNames.isValidSectionTagName)(tagName, _mobiledocDomRendererUtilsSectionTypes.LIST_SECTION_TYPE)) {
          return;
        }
        var element = this.dom.createElement(tagName);
        listItems.forEach(function (li) {
          element.appendChild(_this3.renderListItem(li));
        });
        return element;
      }
    }, {
      key: 'renderImageSection',
      value: function renderImageSection(_ref3) {
        var _ref32 = _slicedToArray(_ref3, 2);

        var type = _ref32[0];
        var src = _ref32[1];

        var element = this.dom.createElement(IMAGE_SECTION_TAG_NAME);
        element.src = src;
        return element;
      }
    }, {
      key: 'findCard',
      value: function findCard(name) {
        for (var i = 0; i < this.cards.length; i++) {
          if (this.cards[i].name === name) {
            return this.cards[i];
          }
        }
        if (name === _mobiledocDomRendererCardsImage['default'].name) {
          return _mobiledocDomRendererCardsImage['default'];
        }
        return this._createUnknownCard(name);
      }
    }, {
      key: '_findCardByIndex',
      value: function _findCardByIndex(index) {
        var cardType = this.cardTypes[index];
        if (!cardType) {
          throw new Error('No card definition found at index ' + index);
        }

        var _cardType = _slicedToArray(cardType, 2);

        var name = _cardType[0];
        var payload = _cardType[1];

        var card = this.findCard(name);

        return {
          card: card,
          payload: payload
        };
      }
    }, {
      key: '_createUnknownCard',
      value: function _createUnknownCard(name) {
        return {
          name: name,
          type: _mobiledocDomRendererUtilsRenderType['default'],
          render: this.unknownCardHandler
        };
      }
    }, {
      key: '_createCardArgument',
      value: function _createCardArgument(card) {
        var _this4 = this;

        var payload = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        var env = {
          name: card.name,
          isInEditor: false,
          dom: this.dom,
          didRender: function didRender(callback) {
            return _this4._registerRenderCallback(callback);
          },
          onTeardown: function onTeardown(callback) {
            return _this4._registerTeardownCallback(callback);
          }
        };

        var options = this.cardOptions;

        return { env: env, options: options, payload: payload };
      }
    }, {
      key: '_registerTeardownCallback',
      value: function _registerTeardownCallback(callback) {
        this._teardownCallbacks.push(callback);
      }
    }, {
      key: '_registerRenderCallback',
      value: function _registerRenderCallback(callback) {
        this._renderCallbacks.push(callback);
      }
    }, {
      key: 'renderCardSection',
      value: function renderCardSection(_ref4) {
        var _ref42 = _slicedToArray(_ref4, 2);

        var type = _ref42[0];
        var index = _ref42[1];

        var _findCardByIndex2 = this._findCardByIndex(index);

        var card = _findCardByIndex2.card;
        var payload = _findCardByIndex2.payload;

        var cardArg = this._createCardArgument(card, payload);
        var rendered = card.render(cardArg);

        this._validateCardRender(rendered, card.name);

        return rendered;
      }
    }, {
      key: '_validateCardRender',
      value: function _validateCardRender(rendered, cardName) {
        if (!rendered) {
          return;
        }

        if (typeof rendered !== 'object') {
          throw new Error('Card "' + cardName + '" must render ' + _mobiledocDomRendererUtilsRenderType['default'] + ', but result was "' + rendered + '"');
        }
      }
    }, {
      key: 'findAtom',
      value: function findAtom(name) {
        for (var i = 0; i < this.atoms.length; i++) {
          if (this.atoms[i].name === name) {
            return this.atoms[i];
          }
        }
        return this._createUnknownAtom(name);
      }
    }, {
      key: '_createUnknownAtom',
      value: function _createUnknownAtom(name) {
        return {
          name: name,
          type: _mobiledocDomRendererUtilsRenderType['default'],
          render: this.unknownAtomHandler
        };
      }
    }, {
      key: '_createAtomArgument',
      value: function _createAtomArgument(atom, value, payload) {
        var _this5 = this;

        var env = {
          name: atom.name,
          isInEditor: false,
          dom: this.dom,
          onTeardown: function onTeardown(callback) {
            return _this5._registerTeardownCallback(callback);
          }
        };

        var options = this.cardOptions;

        return { env: env, options: options, value: value, payload: payload };
      }
    }, {
      key: '_validateAtomRender',
      value: function _validateAtomRender(rendered, atomName) {
        if (!rendered) {
          return;
        }

        if (typeof rendered !== 'object') {
          throw new Error('Atom "' + atomName + '" must render ' + _mobiledocDomRendererUtilsRenderType['default'] + ', but result was "' + rendered + '"');
        }
      }
    }, {
      key: '_findAtomByIndex',
      value: function _findAtomByIndex(index) {
        var atomType = this.atomTypes[index];
        if (!atomType) {
          throw new Error('No atom definition found at index ' + index);
        }

        var _atomType = _slicedToArray(atomType, 3);

        var name = _atomType[0];
        var value = _atomType[1];
        var payload = _atomType[2];

        var atom = this.findAtom(name);

        return {
          atom: atom,
          value: value,
          payload: payload
        };
      }
    }, {
      key: '_renderAtom',
      value: function _renderAtom(index) {
        var _findAtomByIndex2 = this._findAtomByIndex(index);

        var atom = _findAtomByIndex2.atom;
        var value = _findAtomByIndex2.value;
        var payload = _findAtomByIndex2.payload;

        var atomArg = this._createAtomArgument(atom, value, payload);
        var rendered = atom.render(atomArg);

        this._validateAtomRender(rendered, atom.name);

        return rendered || (0, _mobiledocDomRendererUtilsDom.createTextNode)(this.dom, '');
      }
    }, {
      key: 'renderMarkupSection',
      value: function renderMarkupSection(_ref5) {
        var _ref52 = _slicedToArray(_ref5, 4);

        var type = _ref52[0];
        var tagName = _ref52[1];
        var markers = _ref52[2];
        var _ref52$3 = _ref52[3];
        var attributes = _ref52$3 === undefined ? [] : _ref52$3;

        tagName = tagName.toLowerCase();
        if (!(0, _mobiledocDomRendererUtilsTagNames.isValidSectionTagName)(tagName, _mobiledocDomRendererUtilsSectionTypes.MARKUP_SECTION_TYPE)) {
          return;
        }

        var attrsObj = (0, _mobiledocDomRendererUtilsSanitizationUtils.reduceAttributes)(attributes);
        var renderer = this.sectionElementRendererFor(tagName);
        var element = renderer(tagName, this.dom, attrsObj);

        this.renderMarkersOnElement(element, markers);
        return element;
      }
    }, {
      key: 'sectionElementRendererFor',
      value: function sectionElementRendererFor(tagName) {
        return this.sectionElementRenderer[tagName] || this.sectionElementRenderer.__default__;
      }
    }, {
      key: '_defaultUnknownCardHandler',
      get: function get() {
        return function (_ref6) {
          var name = _ref6.env.name;

          throw new Error('Card "' + name + '" not found but no unknownCardHandler was registered');
        };
      }
    }, {
      key: '_defaultUnknownAtomHandler',
      get: function get() {
        return function (_ref7) {
          var name = _ref7.env.name;

          throw new Error('Atom "' + name + '" not found but no unknownAtomHandler was registered');
        };
      }
    }]);

    return Renderer;
  })();

  exports['default'] = Renderer;
});
define("mobiledoc-dom-renderer/utils/array-utils", ["exports"], function (exports) {
  "use strict";

  exports.includes = includes;
  exports.kvArrayToObject = kvArrayToObject;
  exports.objectToSortedKVArray = objectToSortedKVArray;

  function includes(array, detectValue) {
    for (var i = 0; i < array.length; i++) {
      var value = array[i];
      if (value === detectValue) {
        return true;
      }
    }
    return false;
  }

  /**
   * @param {Array} array of key1,value1,key2,value2,...
   * @return {Object} {key1:value1, key2:value2, ...}
   * @private
   */

  function kvArrayToObject(array) {
    if (!Array.isArray(array)) {
      return {};
    }

    var obj = {};
    for (var i = 0; i < array.length; i += 2) {
      var key = array[i];
      var value = array[i + 1];

      obj[key] = value;
    }
    return obj;
  }

  /**
   * @param {Object} {key1:value1, key2:value2, ...}
   * @return {Array} array of key1,value1,key2,value2,...
   * @private
   */

  function objectToSortedKVArray(obj) {
    var keys = Object.keys(obj).sort();
    var result = [];
    keys.forEach(function (k) {
      result.push(k);
      result.push(obj[k]);
    });
    return result;
  }
});
define('mobiledoc-dom-renderer/utils/dom', ['exports'], function (exports) {
  'use strict';

  exports.createTextNode = createTextNode;
  exports.normalizeTagName = normalizeTagName;
  var NBSP = ' ';
  var EMSP = ' ';

  function prepareText(text) {
    return text.replace(/  /g, ' ' + NBSP).replace(/\t/g, EMSP);
  }

  function createTextNode(dom, text) {
    return dom.createTextNode(prepareText(text));
  }

  function normalizeTagName(tagName) {
    return tagName.toLowerCase();
  }
});
define("mobiledoc-dom-renderer/utils/marker-types", ["exports"], function (exports) {
  "use strict";

  var MARKUP_MARKER_TYPE = 0;
  exports.MARKUP_MARKER_TYPE = MARKUP_MARKER_TYPE;
  var ATOM_MARKER_TYPE = 1;
  exports.ATOM_MARKER_TYPE = ATOM_MARKER_TYPE;
});
define('mobiledoc-dom-renderer/utils/render-type', ['exports'], function (exports) {
  'use strict';

  exports['default'] = 'dom';
});
define('mobiledoc-dom-renderer/utils/render-utils', ['exports', 'mobiledoc-dom-renderer/utils/tag-names', 'mobiledoc-dom-renderer/utils/sanitization-utils'], function (exports, _mobiledocDomRendererUtilsTagNames, _mobiledocDomRendererUtilsSanitizationUtils) {
  'use strict';

  exports.defaultSectionElementRenderer = defaultSectionElementRenderer;
  exports.defaultMarkupElementRenderer = defaultMarkupElementRenderer;
  var VALID_ATTRIBUTES = ['data-md-text-align'];

  exports.VALID_ATTRIBUTES = VALID_ATTRIBUTES;
  function _isValidAttribute(attr) {
    return VALID_ATTRIBUTES.indexOf(attr) !== -1;
  }

  function handleMarkupSectionAttribute(element, attributeKey, attributeValue) {
    if (!_isValidAttribute(attributeKey)) {
      throw new Error('Cannot use attribute: ' + attributeKey);
    }

    element.setAttribute(attributeKey, attributeValue);
  }

  function defaultSectionElementRenderer(tagName, dom) {
    var attrsObj = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    var element = undefined;
    if ((0, _mobiledocDomRendererUtilsTagNames.isMarkupSectionElementName)(tagName)) {
      element = dom.createElement(tagName);

      Object.keys(attrsObj).forEach(function (k) {
        handleMarkupSectionAttribute(element, k, attrsObj[k]);
      });
    } else {
      element = dom.createElement('div');
      element.setAttribute('class', tagName);
    }

    return element;
  }

  function sanitizeAttribute(tagName, attrName, attrValue) {
    if (tagName === 'a' && attrName === 'href') {
      return (0, _mobiledocDomRendererUtilsSanitizationUtils.sanitizeHref)(attrValue);
    } else {
      return attrValue;
    }
  }

  function defaultMarkupElementRenderer(tagName, dom, attrsObj) {
    var element = dom.createElement(tagName);
    Object.keys(attrsObj).forEach(function (attrName) {
      var attrValue = attrsObj[attrName];
      attrValue = sanitizeAttribute(tagName, attrName, attrValue);
      element.setAttribute(attrName, attrValue);
    });
    return element;
  }
});
define('mobiledoc-dom-renderer/utils/sanitization-utils', ['exports', 'mobiledoc-dom-renderer/utils/array-utils'], function (exports, _mobiledocDomRendererUtilsArrayUtils) {
  'use strict';

  exports.sanitizeHref = sanitizeHref;
  exports.reduceAttributes = reduceAttributes;

  var PROTOCOL_REGEXP = /.+:/i;

  var badProtocols = ['javascript', // jshint ignore:line
  'vbscript' // jshint ignore:line
  ];

  function getProtocol(url) {
    var matches = url && url.match(PROTOCOL_REGEXP);
    var protocol = matches && matches[0] && matches[0].split(':')[0] || '';
    return protocol;
  }

  function sanitizeHref(url) {
    var protocol = getProtocol(url).toLowerCase().replace(/ /g, '');
    if ((0, _mobiledocDomRendererUtilsArrayUtils.includes)(badProtocols, protocol)) {
      return 'unsafe:' + url;
    }
    return url;
  }

  /**
   * @param attributes array
   * @return obj with normalized attribute names (lowercased)
   */

  function reduceAttributes(attributes) {
    var obj = {};
    for (var i = 0; i < attributes.length; i += 2) {
      var key = attributes[i];
      var val = attributes[i + 1];
      obj[key.toLowerCase()] = val;
    }
    return obj;
  }
});
define("mobiledoc-dom-renderer/utils/section-types", ["exports"], function (exports) {
  "use strict";

  var MARKUP_SECTION_TYPE = 1;
  exports.MARKUP_SECTION_TYPE = MARKUP_SECTION_TYPE;
  var IMAGE_SECTION_TYPE = 2;
  exports.IMAGE_SECTION_TYPE = IMAGE_SECTION_TYPE;
  var LIST_SECTION_TYPE = 3;
  exports.LIST_SECTION_TYPE = LIST_SECTION_TYPE;
  var CARD_SECTION_TYPE = 10;
  exports.CARD_SECTION_TYPE = CARD_SECTION_TYPE;
});
define('mobiledoc-dom-renderer/utils/tag-names', ['exports', 'mobiledoc-dom-renderer/utils/section-types', 'mobiledoc-dom-renderer/utils/dom'], function (exports, _mobiledocDomRendererUtilsSectionTypes, _mobiledocDomRendererUtilsDom) {
  'use strict';

  exports.isValidSectionTagName = isValidSectionTagName;
  exports.isMarkupSectionElementName = isMarkupSectionElementName;
  exports.isValidMarkerType = isValidMarkerType;

  var MARKUP_SECTION_TAG_NAMES = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pull-quote', 'aside'].map(_mobiledocDomRendererUtilsDom.normalizeTagName);

  var MARKUP_SECTION_ELEMENT_NAMES = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'aside'].map(_mobiledocDomRendererUtilsDom.normalizeTagName);

  var LIST_SECTION_TAG_NAMES = ['ul', 'ol'].map(_mobiledocDomRendererUtilsDom.normalizeTagName);

  var MARKUP_TYPES = ['b', 'i', 'strong', 'em', 'a', 'u', 'sub', 'sup', 's', 'code'].map(_mobiledocDomRendererUtilsDom.normalizeTagName);

  function contains(array, item) {
    return array.indexOf(item) !== -1;
  }

  function isValidSectionTagName(tagName, sectionType) {
    tagName = (0, _mobiledocDomRendererUtilsDom.normalizeTagName)(tagName);

    switch (sectionType) {
      case _mobiledocDomRendererUtilsSectionTypes.MARKUP_SECTION_TYPE:
        return contains(MARKUP_SECTION_TAG_NAMES, tagName);
      case _mobiledocDomRendererUtilsSectionTypes.LIST_SECTION_TYPE:
        return contains(LIST_SECTION_TAG_NAMES, tagName);
      default:
        throw new Error('Cannot validate tagName for unknown section type "' + sectionType + '"');
    }
  }

  function isMarkupSectionElementName(tagName) {
    tagName = (0, _mobiledocDomRendererUtilsDom.normalizeTagName)(tagName);
    return contains(MARKUP_SECTION_ELEMENT_NAMES, tagName);
  }

  function isValidMarkerType(type) {
    type = (0, _mobiledocDomRendererUtilsDom.normalizeTagName)(type);
    return contains(MARKUP_TYPES, type);
  }
});
require("mobiledoc-dom-renderer")["registerGlobal"](window, document);
})();
