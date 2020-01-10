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
  function addHTMLSpaces(text) {
    var nbsp = ' ';
    return text.replace(/  /g, ' ' + nbsp);
  }

  function createTextNode(dom, text) {
    return dom.createTextNode(addHTMLSpaces(text));
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

  var PROTOCOL_REGEXP = /^([a-z0-9.+-]+:)/i;

  var badProtocols = ['javascript:', // jshint ignore:line
  'vbscript:' // jshint ignore:line
  ];

  function getProtocol(url) {
    var matches = url && url.match(PROTOCOL_REGEXP);
    var protocol = matches && matches[0] || ':';
    return protocol;
  }

  function sanitizeHref(url) {
    var protocol = getProtocol(url).toLowerCase();
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
define('mobiledoc-kit/cards/image', ['exports', 'mobiledoc-kit/utils/placeholder-image-src'], function (exports, _mobiledocKitUtilsPlaceholderImageSrc) {
  'use strict';

  exports['default'] = {
    name: 'image',
    type: 'dom',

    render: function render(_ref) {
      var payload = _ref.payload;

      var img = document.createElement('img');
      img.src = payload.src || _mobiledocKitUtilsPlaceholderImageSrc['default'];
      return img;
    }
  };
});
define('mobiledoc-kit/editor/edit-history', ['exports', 'mobiledoc-kit/parsers/mobiledoc', 'mobiledoc-kit/utils/fixed-queue'], function (exports, _mobiledocKitParsersMobiledoc, _mobiledocKitUtilsFixedQueue) {
  'use strict';

  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function findLeafSectionAtIndex(post, index) {
    var section = undefined;
    post.walkAllLeafSections(function (_section, _index) {
      if (index === _index) {
        section = _section;
      }
    });
    return section;
  }

  var Snapshot = (function () {
    function Snapshot(takenAt, editor) {
      var editAction = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

      _classCallCheck(this, Snapshot);

      this.mobiledoc = editor.serialize();
      this.editor = editor;
      this.editAction = editAction;
      this.takenAt = takenAt;

      this.snapshotRange();
    }

    _createClass(Snapshot, [{
      key: 'snapshotRange',
      value: function snapshotRange() {
        var _editor = this.editor;
        var range = _editor.range;
        var cursor = _editor.cursor;

        if (cursor.hasCursor() && !range.isBlank) {
          var head = range.head;
          var tail = range.tail;

          this.range = {
            head: [head.leafSectionIndex, head.offset],
            tail: [tail.leafSectionIndex, tail.offset]
          };
        }
      }
    }, {
      key: 'getRange',
      value: function getRange(post) {
        if (this.range) {
          var _range = this.range;
          var head = _range.head;
          var tail = _range.tail;
          var _head = head;

          var _head2 = _slicedToArray(_head, 2);

          var headLeafSectionIndex = _head2[0];
          var headOffset = _head2[1];
          var _tail = tail;

          var _tail2 = _slicedToArray(_tail, 2);

          var tailLeafSectionIndex = _tail2[0];
          var tailOffset = _tail2[1];

          var headSection = findLeafSectionAtIndex(post, headLeafSectionIndex);
          var tailSection = findLeafSectionAtIndex(post, tailLeafSectionIndex);

          head = headSection.toPosition(headOffset);
          tail = tailSection.toPosition(tailOffset);

          return head.toRange(tail);
        }
      }
    }, {
      key: 'groupsWith',
      value: function groupsWith(groupingTimeout, editAction, takenAt) {
        return editAction !== null && this.editAction === editAction && this.takenAt + groupingTimeout > takenAt;
      }
    }]);

    return Snapshot;
  })();

  exports.Snapshot = Snapshot;

  var EditHistory = (function () {
    function EditHistory(editor, queueLength, groupingTimeout) {
      _classCallCheck(this, EditHistory);

      this.editor = editor;
      this._undoStack = new _mobiledocKitUtilsFixedQueue['default'](queueLength);
      this._redoStack = new _mobiledocKitUtilsFixedQueue['default'](queueLength);

      this._pendingSnapshot = null;
      this._groupingTimeout = groupingTimeout;
    }

    _createClass(EditHistory, [{
      key: 'snapshot',
      value: function snapshot() {
        // update the current snapshot with the range read from DOM
        if (this._pendingSnapshot) {
          this._pendingSnapshot.snapshotRange();
        }
      }
    }, {
      key: 'storeSnapshot',
      value: function storeSnapshot() {
        var editAction = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

        var now = Date.now();
        // store pending snapshot
        var pendingSnapshot = this._pendingSnapshot;
        if (pendingSnapshot) {
          if (!pendingSnapshot.groupsWith(this._groupingTimeout, editAction, now)) {
            this._undoStack.push(pendingSnapshot);
          }
          this._redoStack.clear();
        }

        // take new pending snapshot to store next time `storeSnapshot` is called
        this._pendingSnapshot = new Snapshot(now, this.editor, editAction);
      }
    }, {
      key: 'stepBackward',
      value: function stepBackward(postEditor) {
        // Throw away the pending snapshot
        this._pendingSnapshot = null;

        var snapshot = this._undoStack.pop();
        if (snapshot) {
          this._redoStack.push(new Snapshot(Date.now(), this.editor));
          this._restoreFromSnapshot(snapshot, postEditor);
        }
      }
    }, {
      key: 'stepForward',
      value: function stepForward(postEditor) {
        var snapshot = this._redoStack.pop();
        if (snapshot) {
          this._undoStack.push(new Snapshot(Date.now(), this.editor));
          this._restoreFromSnapshot(snapshot, postEditor);
        }
        postEditor.cancelSnapshot();
      }
    }, {
      key: '_restoreFromSnapshot',
      value: function _restoreFromSnapshot(snapshot, postEditor) {
        var mobiledoc = snapshot.mobiledoc;
        var editor = this.editor;
        var builder = editor.builder;
        var post = editor.post;

        var restoredPost = _mobiledocKitParsersMobiledoc['default'].parse(builder, mobiledoc);

        postEditor.removeAllSections();
        postEditor.migrateSectionsFromPost(restoredPost);

        // resurrect snapshotted range if it exists
        var newRange = snapshot.getRange(post);
        if (newRange) {
          postEditor.setRange(newRange);
        }
      }
    }]);

    return EditHistory;
  })();

  exports['default'] = EditHistory;
});
define('mobiledoc-kit/editor/edit-state', ['exports', 'mobiledoc-kit/utils/array-utils', 'mobiledoc-kit/utils/cursor/range'], function (exports, _mobiledocKitUtilsArrayUtils, _mobiledocKitUtilsCursorRange) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  /**
   * Used by {@link Editor} to manage its current state (cursor, active markups
   * and active sections).
   * @private
   */

  var EditState = (function () {
    function EditState(editor) {
      _classCallCheck(this, EditState);

      this.editor = editor;

      var defaultState = {
        range: _mobiledocKitUtilsCursorRange['default'].blankRange(),
        activeMarkups: [],
        activeSections: [],
        activeSectionTagNames: [],
        activeSectionAttributes: {}
      };

      this.prevState = this.state = defaultState;
    }

    _createClass(EditState, [{
      key: 'updateRange',
      value: function updateRange(newRange) {
        this.prevState = this.state;
        this.state = this._readState(newRange);
      }
    }, {
      key: 'destroy',
      value: function destroy() {
        this.editor = null;
        this.prevState = this.state = null;
      }

      /**
       * @return {Boolean}
       */
    }, {
      key: 'rangeDidChange',
      value: function rangeDidChange() {
        var range = this.state.range;
        var prevRange = this.prevState.range;

        return !prevRange.isEqual(range);
      }

      /**
       * @return {Boolean} Whether the input mode (active markups or active section tag names)
       * has changed.
       */
    }, {
      key: 'inputModeDidChange',
      value: function inputModeDidChange() {
        var state = this.state;
        var prevState = this.prevState;

        return !(0, _mobiledocKitUtilsArrayUtils.isArrayEqual)(state.activeMarkups, prevState.activeMarkups) || !(0, _mobiledocKitUtilsArrayUtils.isArrayEqual)(state.activeSectionTagNames, prevState.activeSectionTagNames) || !(0, _mobiledocKitUtilsArrayUtils.isArrayEqual)((0, _mobiledocKitUtilsArrayUtils.objectToSortedKVArray)(state.activeSectionAttributes), (0, _mobiledocKitUtilsArrayUtils.objectToSortedKVArray)(prevState.activeSectionAttributes));
      }

      /**
       * @return {Range}
       */
    }, {
      key: 'toggleMarkupState',

      /**
       * Update the editor's markup state. This is used when, e.g.,
       * a user types meta+B when the editor has a cursor but no selected text;
       * in this case the editor needs to track that it has an active "b" markup
       * and apply it to the next text the user types.
       */
      value: function toggleMarkupState(markup) {
        if ((0, _mobiledocKitUtilsArrayUtils.contains)(this.activeMarkups, markup)) {
          this._removeActiveMarkup(markup);
        } else {
          this._addActiveMarkup(markup);
        }
      }
    }, {
      key: '_readState',
      value: function _readState(range) {
        var state = {
          range: range,
          activeMarkups: this._readActiveMarkups(range),
          activeSections: this._readActiveSections(range)
        };
        // Section objects are 'live', so to check that they changed, we
        // need to map their tagNames now (and compare to mapped tagNames later).
        // In addition, to catch changes from ul -> ol, we keep track of the
        // un-nested tag names (otherwise we'd only see li -> li change)
        state.activeSectionTagNames = state.activeSections.map(function (s) {
          return s.isNested ? s.parent.tagName : s.tagName;
        });
        state.activeSectionAttributes = this._readSectionAttributes(state.activeSections);
        return state;
      }
    }, {
      key: '_readActiveSections',
      value: function _readActiveSections(range) {
        var head = range.head;
        var tail = range.tail;
        var post = this.editor.post;

        if (range.isBlank) {
          return [];
        } else {
          return post.sections.readRange(head.section, tail.section);
        }
      }
    }, {
      key: '_readActiveMarkups',
      value: function _readActiveMarkups(range) {
        var post = this.editor.post;

        return post.markupsInRange(range);
      }
    }, {
      key: '_readSectionAttributes',
      value: function _readSectionAttributes(sections) {
        return sections.reduce(function (sectionAttributes, s) {
          var attributes = s.isNested ? s.parent.attributes : s.attributes;
          Object.keys(attributes || {}).forEach(function (attrName) {
            var camelizedAttrName = attrName.replace(/^data-md-/, '');
            var attrValue = attributes[attrName];
            sectionAttributes[camelizedAttrName] = sectionAttributes[camelizedAttrName] || [];
            if (!(0, _mobiledocKitUtilsArrayUtils.contains)(sectionAttributes[camelizedAttrName], attrValue)) {
              sectionAttributes[camelizedAttrName].push(attrValue);
            }
          });
          return sectionAttributes;
        }, {});
      }
    }, {
      key: '_removeActiveMarkup',
      value: function _removeActiveMarkup(markup) {
        var index = this.state.activeMarkups.indexOf(markup);
        this.state.activeMarkups.splice(index, 1);
      }
    }, {
      key: '_addActiveMarkup',
      value: function _addActiveMarkup(markup) {
        this.state.activeMarkups.push(markup);
      }
    }, {
      key: 'range',
      get: function get() {
        return this.state.range;
      }

      /**
       * @return {Section[]}
       */
    }, {
      key: 'activeSections',
      get: function get() {
        return this.state.activeSections;
      }

      /**
       * @return {Object}
       */
    }, {
      key: 'activeSectionAttributes',
      get: function get() {
        return this.state.activeSectionAttributes;
      }

      /**
       * @return {Markup[]}
       */
    }, {
      key: 'activeMarkups',
      get: function get() {
        return this.state.activeMarkups;
      }
    }]);

    return EditState;
  })();

  exports['default'] = EditState;
});
define('mobiledoc-kit/editor/editor', ['exports', 'mobiledoc-kit/views/tooltip', 'mobiledoc-kit/editor/post', 'mobiledoc-kit/cards/image', 'mobiledoc-kit/utils/key', 'mobiledoc-kit/parsers/mobiledoc', 'mobiledoc-kit/parsers/html', 'mobiledoc-kit/parsers/dom', 'mobiledoc-kit/renderers/editor-dom', 'mobiledoc-kit/models/render-tree', 'mobiledoc-kit/renderers/mobiledoc', 'mobiledoc-kit/utils/merge', 'mobiledoc-kit/utils/dom-utils', 'mobiledoc-kit/utils/array-utils', 'mobiledoc-kit/utils/element-utils', 'mobiledoc-kit/utils/cursor', 'mobiledoc-kit/utils/cursor/range', 'mobiledoc-kit/utils/cursor/position', 'mobiledoc-kit/utils/environment', 'mobiledoc-kit/models/post-node-builder', 'mobiledoc-kit/editor/text-input-handlers', 'mobiledoc-kit/editor/key-commands', 'mobiledoc-kit/models/card', 'mobiledoc-kit/utils/assert', 'mobiledoc-kit/editor/mutation-handler', 'mobiledoc-kit/editor/edit-history', 'mobiledoc-kit/editor/event-manager', 'mobiledoc-kit/editor/edit-state', 'mobiledoc-dom-renderer', 'mobiledoc-text-renderer', 'mobiledoc-kit/models/lifecycle-callbacks', 'mobiledoc-kit/utils/log-manager', 'mobiledoc-kit/utils/to-range', 'mobiledoc-kit/utils/mobiledoc-error'], function (exports, _mobiledocKitViewsTooltip, _mobiledocKitEditorPost, _mobiledocKitCardsImage, _mobiledocKitUtilsKey, _mobiledocKitParsersMobiledoc, _mobiledocKitParsersHtml, _mobiledocKitParsersDom, _mobiledocKitRenderersEditorDom, _mobiledocKitModelsRenderTree, _mobiledocKitRenderersMobiledoc, _mobiledocKitUtilsMerge, _mobiledocKitUtilsDomUtils, _mobiledocKitUtilsArrayUtils, _mobiledocKitUtilsElementUtils, _mobiledocKitUtilsCursor, _mobiledocKitUtilsCursorRange, _mobiledocKitUtilsCursorPosition, _mobiledocKitUtilsEnvironment, _mobiledocKitModelsPostNodeBuilder, _mobiledocKitEditorTextInputHandlers, _mobiledocKitEditorKeyCommands, _mobiledocKitModelsCard, _mobiledocKitUtilsAssert, _mobiledocKitEditorMutationHandler, _mobiledocKitEditorEditHistory, _mobiledocKitEditorEventManager, _mobiledocKitEditorEditState, _mobiledocDomRenderer, _mobiledocTextRenderer, _mobiledocKitModelsLifecycleCallbacks, _mobiledocKitUtilsLogManager, _mobiledocKitUtilsToRange, _mobiledocKitUtilsMobiledocError) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  // This export may later be deprecated, but re-export it from the renderer here
  // for consumers that may depend on it.
  Object.defineProperty(exports, 'EDITOR_ELEMENT_CLASS_NAME', {
    enumerable: true,
    get: function get() {
      return _mobiledocKitRenderersEditorDom.EDITOR_ELEMENT_CLASS_NAME;
    }
  });

  var defaults = {
    placeholder: 'Write here...',
    spellcheck: true,
    autofocus: true,
    showLinkTooltips: true,
    undoDepth: 5,
    undoBlockTimeout: 5000, // ms for an undo event
    cards: [],
    atoms: [],
    cardOptions: {},
    unknownCardHandler: function unknownCardHandler(_ref) {
      var env = _ref.env;

      throw new _mobiledocKitUtilsMobiledocError['default']('Unknown card encountered: ' + env.name);
    },
    unknownAtomHandler: function unknownAtomHandler(_ref2) {
      var env = _ref2.env;

      throw new _mobiledocKitUtilsMobiledocError['default']('Unknown atom encountered: ' + env.name);
    },
    mobiledoc: null,
    html: null
  };

  var CALLBACK_QUEUES = {
    DID_UPDATE: 'didUpdate',
    WILL_RENDER: 'willRender',
    DID_RENDER: 'didRender',
    WILL_DELETE: 'willDelete',
    DID_DELETE: 'didDelete',
    WILL_HANDLE_NEWLINE: 'willHandleNewline',
    CURSOR_DID_CHANGE: 'cursorDidChange',
    DID_REPARSE: 'didReparse',
    POST_DID_CHANGE: 'postDidChange',
    INPUT_MODE_DID_CHANGE: 'inputModeDidChange'
  };

  /**
   * The Editor is a core component of mobiledoc-kit. After instantiating
   * an editor, use {@link Editor#render} to display the editor on the web page.
   *
   * An editor uses a {@link Post} internally to represent the displayed document.
   * The post can be serialized as mobiledoc using {@link Editor#serialize}. Mobiledoc
   * is the transportable "over-the-wire" format (JSON) that is suited for persisting
   * and sharing between editors and renderers (for display, e.g.), whereas the Post
   * model is better suited for programmatic editing.
   *
   * The editor will call registered callbacks for certain state changes. These are:
   *   * {@link Editor#cursorDidChange} -- The cursor position or selection changed.
   *   * {@link Editor#postDidChange} -- The contents of the post changed due to user input or
   *     programmatic editing. This hook can be used with {@link Editor#serialize}
   *     to auto-save a post as it is being edited.
   *   * {@link Editor#inputModeDidChange} -- The active section(s) or markup(s) at the current cursor
   *     position or selection have changed. This hook can be used with
   *     {@link Editor#activeMarkups} and {@link Editor#activeSections} to implement
   *     a custom toolbar.
   *   * {@link Editor#onTextInput} -- Register callbacks when the user enters text
   *     that matches a given string or regex.
   *   * {@link Editor#beforeToggleMarkup} -- Register callbacks that will be run before
   *     applying changes from {@link Editor#toggleMarkup}
   */

  var Editor = (function () {
    /**
     * @param {Object} [options]
     * @param {Object} [options.mobiledoc] The mobiledoc to load into the editor.
     *        Supersedes `options.html`.
     * @param {String|DOM} [options.html] The html (as a string or DOM fragment)
     *        to parse and load into the editor.
     *        Will be ignored if `options.mobiledoc` is also passed.
     * @param {Array} [options.parserPlugins=[]]
     * @param {Array} [options.cards=[]] The cards that the editor may render.
     * @param {Array} [options.atoms=[]] The atoms that the editor may render.
     * @param {Function} [options.unknownCardHandler] Invoked by the editor's renderer
     *        whenever it encounters an unknown card.
     * @param {Function} [options.unknownAtomHandler] Invoked by the editor's renderer
     *        whenever it encounters an unknown atom.
     * @param {String} [options.placeholder] Default text to show before user starts typing.
     * @param {Boolean} [options.spellcheck=true] Whether to enable spellcheck
     * @param {Boolean} [options.autofocus=true] Whether to focus the editor when it is first rendered.
     * @param {Boolean} [options.showLinkTooltips=true] Whether to show the url tooltip for links
     * @param {number} [options.undoDepth=5] How many undo levels will be available.
     *        Set to 0 to disable undo/redo functionality.
     * @return {Editor}
     * @public
     */

    function Editor() {
      var _this = this;

      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      _classCallCheck(this, Editor);

      (0, _mobiledocKitUtilsAssert['default'])('editor create accepts an options object. For legacy usage passing an element for the first argument, consider the `html` option for loading DOM or HTML posts. For other cases call `editor.render(domNode)` after editor creation', options && !options.nodeType);
      this._views = [];
      this.isEditable = true;
      this._parserPlugins = options.parserPlugins || [];

      // FIXME: This should merge onto this.options
      (0, _mobiledocKitUtilsMerge.mergeWithOptions)(this, defaults, options);
      this.cards.push(_mobiledocKitCardsImage['default']);

      _mobiledocKitEditorKeyCommands.DEFAULT_KEY_COMMANDS.forEach(function (kc) {
        return _this.registerKeyCommand(kc);
      });

      this._logManager = new _mobiledocKitUtilsLogManager['default']();
      this._parser = new _mobiledocKitParsersDom['default'](this.builder);
      var cards = this.cards;
      var atoms = this.atoms;
      var unknownCardHandler = this.unknownCardHandler;
      var unknownAtomHandler = this.unknownAtomHandler;
      var cardOptions = this.cardOptions;

      this._renderer = new _mobiledocKitRenderersEditorDom['default'](this, cards, atoms, unknownCardHandler, unknownAtomHandler, cardOptions);

      this.post = this.loadPost();
      this._renderTree = new _mobiledocKitModelsRenderTree['default'](this.post);

      this._editHistory = new _mobiledocKitEditorEditHistory['default'](this, this.undoDepth, this.undoBlockTimeout);
      this._eventManager = new _mobiledocKitEditorEventManager['default'](this);
      this._mutationHandler = new _mobiledocKitEditorMutationHandler['default'](this);
      this._editState = new _mobiledocKitEditorEditState['default'](this);
      this._callbacks = new _mobiledocKitModelsLifecycleCallbacks['default']((0, _mobiledocKitUtilsArrayUtils.values)(CALLBACK_QUEUES));
      this._beforeHooks = { toggleMarkup: [] };

      _mobiledocKitEditorTextInputHandlers.DEFAULT_TEXT_INPUT_HANDLERS.forEach(function (handler) {
        return _this.onTextInput(handler);
      });

      this.hasRendered = false;
    }

    /**
     * Turns on verbose logging for the editor.
     * @param {Array} [logTypes=[]] If present, only the given log types will be logged.
     * @public
     */

    _createClass(Editor, [{
      key: 'enableLogging',
      value: function enableLogging() {
        var logTypes = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

        if (logTypes.length === 0) {
          this._logManager.enableAll();
        } else {
          this._logManager.enableTypes(logTypes);
        }
      }

      /**
       * Disable all logging
       * @public
       */
    }, {
      key: 'disableLogging',
      value: function disableLogging() {
        this._logManager.disable();
      }

      /**
       * @private
       */
    }, {
      key: 'loggerFor',
      value: function loggerFor(type) {
        return this._logManager['for'](type);
      }

      /**
       * The editor's instance of a post node builder.
       * @type {PostNodeBuilder}
       */
    }, {
      key: 'loadPost',
      value: function loadPost() {
        var mobiledoc = this.mobiledoc;
        var html = this.html;

        if (mobiledoc) {
          return _mobiledocKitParsersMobiledoc['default'].parse(this.builder, mobiledoc);
        } else if (html) {
          if (typeof html === 'string') {
            var options = { plugins: this._parserPlugins };
            return new _mobiledocKitParsersHtml['default'](this.builder, options).parse(this.html);
          } else {
            var dom = html;
            return this._parser.parse(dom);
          }
        } else {
          return this.builder.createPost();
        }
      }
    }, {
      key: 'rerender',
      value: function rerender() {
        var _this2 = this;

        var postRenderNode = this.post.renderNode;

        // if we haven't rendered this post's renderNode before, mark it dirty
        if (!postRenderNode.element) {
          (0, _mobiledocKitUtilsAssert['default'])('Must call `render` before `rerender` can be called', this.hasRendered);
          postRenderNode.element = this.element;
          postRenderNode.markDirty();
        }

        this.runCallbacks(CALLBACK_QUEUES.WILL_RENDER);
        this._mutationHandler.suspendObservation(function () {
          _this2._renderer.render(_this2._renderTree);
        });
        this.runCallbacks(CALLBACK_QUEUES.DID_RENDER);
      }

      /**
       * @param {Element} element The DOM element to render into.
       *        Its contents will be replaced by the editor's rendered post.
       * @public
       */
    }, {
      key: 'render',
      value: function render(element) {
        (0, _mobiledocKitUtilsAssert['default'])('Cannot render an editor twice. Use `rerender` to update the ' + 'rendering of an existing editor instance.', !this.hasRendered);

        element.spellcheck = this.spellcheck;

        (0, _mobiledocKitUtilsDomUtils.clearChildNodes)(element);

        this.element = element;

        if (this.showLinkTooltips) {
          this._addTooltip();
        }

        // A call to `run` will trigger the didUpdatePostCallbacks hooks with a
        // postEditor.
        this.run(function () {});

        // Only set `hasRendered` to true after calling `run` to ensure that
        // no cursorDidChange or other callbacks get fired before the editor is
        // done rendering
        this.hasRendered = true;
        this.rerender();

        this._mutationHandler.init();
        this._eventManager.init();

        if (this.isEditable === false) {
          this.disableEditing();
        } else {
          this.enableEditing();
        }

        if (this.autofocus) {
          this.selectRange(this.post.headPosition());
        }
      }
    }, {
      key: '_addTooltip',
      value: function _addTooltip() {
        this.addView(new _mobiledocKitViewsTooltip['default']({
          rootElement: this.element,
          showForTag: 'a'
        }));
      }
    }, {
      key: 'registerKeyCommand',

      /**
       * @param {Object} keyCommand The key command to register. It must specify a
       * modifier key (meta, ctrl, etc), a string representing the ascii key, and
       * a `run` method that will be passed the editor instance when the key command
       * is invoked
       * @public
       */
      value: function registerKeyCommand(rawKeyCommand) {
        var keyCommand = (0, _mobiledocKitEditorKeyCommands.buildKeyCommand)(rawKeyCommand);
        (0, _mobiledocKitUtilsAssert['default'])('Key Command is not valid', (0, _mobiledocKitEditorKeyCommands.validateKeyCommand)(keyCommand));
        this.keyCommands.unshift(keyCommand);
      }

      /**
       * @param {String} name If the keyCommand event has a name attribute it can be removed.
       * @public
       */
    }, {
      key: 'unregisterKeyCommands',
      value: function unregisterKeyCommands(name) {
        for (var i = this.keyCommands.length - 1; i > -1; i--) {
          var keyCommand = this.keyCommands[i];

          if (keyCommand.name === name) {
            this.keyCommands.splice(i, 1);
          }
        }
      }

      /**
       * Convenience for {@link PostEditor#deleteAtPosition}. Deletes and puts the
       * cursor in the new position.
       * @public
       */
    }, {
      key: 'deleteAtPosition',
      value: function deleteAtPosition(position, direction, _ref3) {
        var unit = _ref3.unit;

        this.run(function (postEditor) {
          var nextPosition = postEditor.deleteAtPosition(position, direction, { unit: unit });
          postEditor.setRange(nextPosition);
        });
      }

      /**
       * Convenience for {@link PostEditor#deleteRange}. Deletes and puts the
       * cursor in the new position.
       * @param {Range} range
       * @public
       */
    }, {
      key: 'deleteRange',
      value: function deleteRange(range) {
        this.run(function (postEditor) {
          var nextPosition = postEditor.deleteRange(range);
          postEditor.setRange(nextPosition);
        });
      }

      /**
       * @private
       */
    }, {
      key: 'performDelete',
      value: function performDelete() {
        var _ref4 = arguments.length <= 0 || arguments[0] === undefined ? { direction: _mobiledocKitUtilsKey.DIRECTION.BACKWARD, unit: 'char' } : arguments[0];

        var direction = _ref4.direction;
        var unit = _ref4.unit;
        var range = this.range;

        this.runCallbacks(CALLBACK_QUEUES.WILL_DELETE, [range, direction, unit]);
        if (range.isCollapsed) {
          this.deleteAtPosition(range.head, direction, { unit: unit });
        } else {
          this.deleteRange(range);
        }
        this.runCallbacks(CALLBACK_QUEUES.DID_DELETE, [range, direction, unit]);
      }
    }, {
      key: 'handleNewline',
      value: function handleNewline(event) {
        var _this3 = this;

        if (!this.hasCursor()) {
          return;
        }

        event.preventDefault();

        var range = this.range;

        this.run(function (postEditor) {
          var cursorSection = undefined;
          if (!range.isCollapsed) {
            var nextPosition = postEditor.deleteRange(range);
            cursorSection = nextPosition.section;
            if (cursorSection && cursorSection.isBlank) {
              postEditor.setRange(cursorSection.headPosition());
              return;
            }
          }

          // Above logic might delete redundant range, so callback must run after it.
          var defaultPrevented = false;
          var event = { preventDefault: function preventDefault() {
              defaultPrevented = true;
            } };
          _this3.runCallbacks(CALLBACK_QUEUES.WILL_HANDLE_NEWLINE, [event]);
          if (defaultPrevented) {
            return;
          }

          cursorSection = postEditor.splitSection(range.head)[1];
          postEditor.setRange(cursorSection.headPosition());
        });
      }

      /**
       * Notify the editor that the post did change, and run associated
       * callbacks.
       * @private
       */
    }, {
      key: '_postDidChange',
      value: function _postDidChange() {
        this.runCallbacks(CALLBACK_QUEUES.POST_DID_CHANGE);
      }

      /**
       * Selects the given range or position. If given a collapsed range or a position, this positions the cursor
       * at the range's position. Otherwise a selection is created in the editor
       * surface encompassing the range.
       * @param {Range|Position} range
       */
    }, {
      key: 'selectRange',
      value: function selectRange(range) {
        range = (0, _mobiledocKitUtilsToRange['default'])(range);

        this.cursor.selectRange(range);
        this.range = range;
      }
    }, {
      key: '_readRangeFromDOM',
      value: function _readRangeFromDOM() {
        this.range = this.cursor.offsets;
      }
    }, {
      key: 'setPlaceholder',
      value: function setPlaceholder(placeholder) {
        (0, _mobiledocKitUtilsElementUtils.setData)(this.element, 'placeholder', placeholder);
      }
    }, {
      key: '_reparsePost',
      value: function _reparsePost() {
        var post = this._parser.parse(this.element);
        this.run(function (postEditor) {
          postEditor.removeAllSections();
          postEditor.migrateSectionsFromPost(post);
          postEditor.setRange(_mobiledocKitUtilsCursorRange['default'].blankRange());
        });

        this.runCallbacks(CALLBACK_QUEUES.DID_REPARSE);
        this._postDidChange();
      }
    }, {
      key: '_reparseSections',
      value: function _reparseSections() {
        var _this4 = this;

        var sections = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

        var currentRange = undefined;
        sections.forEach(function (section) {
          _this4._parser.reparseSection(section, _this4._renderTree);
        });
        this._removeDetachedSections();

        if (this._renderTree.isDirty) {
          currentRange = this.range;
        }

        // force the current snapshot's range to remain the same rather than
        // rereading it from DOM after the new character is applied and the browser
        // updates the cursor position
        var range = this._editHistory._pendingSnapshot.range;
        this.run(function () {
          _this4._editHistory._pendingSnapshot.range = range;
        });
        this.rerender();
        if (currentRange) {
          this.selectRange(currentRange);
        }

        this.runCallbacks(CALLBACK_QUEUES.DID_REPARSE);
        this._postDidChange();
      }

      // FIXME this should be able to be removed now -- if any sections are detached,
      // it's due to a bug in the code.
    }, {
      key: '_removeDetachedSections',
      value: function _removeDetachedSections() {
        (0, _mobiledocKitUtilsArrayUtils.forEach)((0, _mobiledocKitUtilsArrayUtils.filter)(this.post.sections, function (s) {
          return !s.renderNode.isAttached();
        }), function (s) {
          return s.renderNode.scheduleForRemoval();
        });
      }

      /**
       * The sections from the cursor's selection start to the selection end
       * @type {Section[]}
       */
    }, {
      key: 'detectMarkupInRange',
      value: function detectMarkupInRange(range, markupTagName) {
        var markups = this.post.markupsInRange(range);
        return (0, _mobiledocKitUtilsArrayUtils.detect)(markups, function (markup) {
          return markup.hasTag(markupTagName);
        });
      }

      /**
       * @type {Markup[]}
       * @public
       */
    }, {
      key: 'hasActiveMarkup',

      /**
       * @param {Markup|String} markup A markup instance, or a string (e.g. "b")
       * @return {boolean}
       */
      value: function hasActiveMarkup(markup) {
        var matchesFn = undefined;
        if (typeof markup === 'string') {
          (function () {
            var tagName = (0, _mobiledocKitUtilsDomUtils.normalizeTagName)(markup);
            matchesFn = function (m) {
              return m.tagName === tagName;
            };
          })();
        } else {
          matchesFn = function (m) {
            return m === markup;
          };
        }

        return !!(0, _mobiledocKitUtilsArrayUtils.detect)(this.activeMarkups, matchesFn);
      }

      /**
       * @param {String} version The mobiledoc version to serialize to.
       * @return {Mobiledoc} Serialized mobiledoc
       * @public
       */
    }, {
      key: 'serialize',
      value: function serialize() {
        var version = arguments.length <= 0 || arguments[0] === undefined ? _mobiledocKitRenderersMobiledoc.MOBILEDOC_VERSION : arguments[0];

        return this.serializePost(this.post, 'mobiledoc', { version: version });
      }

      /**
       * Serialize the editor's post to the requested format.
       * Note that only mobiledoc format is lossless. If cards or atoms are present
       * in the post, the html and text formats will omit them in output because
       * the editor does not have access to the html and text versions of the
       * cards/atoms.
       * @param {string} format The format to serialize ('mobiledoc', 'text', 'html')
       * @return {Object|String} The editor's post, serialized to {format}
       * @public
       */
    }, {
      key: 'serializeTo',
      value: function serializeTo(format) {
        var post = this.post;
        return this.serializePost(post, format);
      }

      /**
       * @param {Post}
       * @param {String} format Same as {serializeTo}
       * @param {Object} [options]
       * @param {String} [options.version=MOBILEDOC_VERSION] version to serialize to
       * @return {Object|String}
       * @private
       */
    }, {
      key: 'serializePost',
      value: function serializePost(post, format) {
        var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

        var validFormats = ['mobiledoc', 'html', 'text'];
        (0, _mobiledocKitUtilsAssert['default'])('Unrecognized serialization format ' + format, (0, _mobiledocKitUtilsArrayUtils.contains)(validFormats, format));

        if (format === 'mobiledoc') {
          var version = options.version || _mobiledocKitRenderersMobiledoc.MOBILEDOC_VERSION;
          return _mobiledocKitRenderersMobiledoc['default'].render(post, version);
        } else {
          var rendered = undefined;
          var mobiledoc = this.serializePost(post, 'mobiledoc');
          var unknownCardHandler = function unknownCardHandler() {};
          var unknownAtomHandler = function unknownAtomHandler() {};
          var rendererOptions = { unknownCardHandler: unknownCardHandler, unknownAtomHandler: unknownAtomHandler };

          switch (format) {
            case 'html':
              {
                var result = undefined;
                if (_mobiledocKitUtilsEnvironment['default'].hasDOM()) {
                  rendered = new _mobiledocDomRenderer['default'](rendererOptions).render(mobiledoc);
                  result = '<div>' + (0, _mobiledocKitUtilsDomUtils.serializeHTML)(rendered.result) + '</div>';
                } else {
                  // Fallback to text serialization
                  result = this.serializePost(post, 'text', options);
                }
                return result;
              }
            case 'text':
              rendered = new _mobiledocTextRenderer['default'](rendererOptions).render(mobiledoc);
              return rendered.result;
          }
        }
      }
    }, {
      key: 'addView',
      value: function addView(view) {
        this._views.push(view);
      }
    }, {
      key: 'removeAllViews',
      value: function removeAllViews() {
        this._views.forEach(function (v) {
          return v.destroy();
        });
        this._views = [];
      }

      /**
       * Whether the editor has a cursor (or a selected range).
       * It is possible for the editor to be focused but not have a selection.
       * In this case, key events will fire but the editor will not be able to
       * determine a cursor position, so they will be ignored.
       * @return {boolean}
       * @public
       */
    }, {
      key: 'hasCursor',
      value: function hasCursor() {
        return this.cursor.hasCursor();
      }

      /**
       * Tears down the editor's attached event listeners and views.
       * @public
       */
    }, {
      key: 'destroy',
      value: function destroy() {
        this.isDestroyed = true;
        if (this._hasSelection()) {
          this.cursor.clearSelection();
        }
        if (this._hasFocus()) {
          this.element.blur(); // FIXME This doesn't blur the element on IE11
        }
        this._mutationHandler.destroy();
        this._eventManager.destroy();
        this.removeAllViews();
        this._renderer.destroy();
        this._editState.destroy();
      }

      /**
       * Keep the user from directly editing the post using the keyboard and mouse.
       * Modification via the programmatic API is still permitted.
       * @see Editor#enableEditing
       * @public
       */
    }, {
      key: 'disableEditing',
      value: function disableEditing() {
        this.isEditable = false;
        if (this.hasRendered) {
          this._eventManager.stop();
          this.element.setAttribute('contentEditable', false);
          this.setPlaceholder('');
          this.selectRange(_mobiledocKitUtilsCursorRange['default'].blankRange());
        }
      }

      /**
       * Allow the user to directly interact with editing a post via keyboard and mouse input.
       * Editor instances are editable by default. Use this method to re-enable
       * editing after disabling it.
       * @see Editor#disableEditing
       * @public
       */
    }, {
      key: 'enableEditing',
      value: function enableEditing() {
        this.isEditable = true;
        if (this.hasRendered) {
          this._eventManager.start();
          this.element.setAttribute('contentEditable', true);
          this.setPlaceholder(this.placeholder);
        }
      }

      /**
       * Change a cardSection into edit mode
       * If called before the card has been rendered, it will be marked so that
       * it is rendered in edit mode when it gets rendered.
       * @param {CardSection} cardSection
       * @public
       */
    }, {
      key: 'editCard',
      value: function editCard(cardSection) {
        this._setCardMode(cardSection, _mobiledocKitModelsCard.CARD_MODES.EDIT);
      }

      /**
       * Change a cardSection into display mode
       * If called before the card has been rendered, it will be marked so that
       * it is rendered in display mode when it gets rendered.
       * @param {CardSection} cardSection
       * @return undefined
       * @public
       */
    }, {
      key: 'displayCard',
      value: function displayCard(cardSection) {
        this._setCardMode(cardSection, _mobiledocKitModelsCard.CARD_MODES.DISPLAY);
      }

      /**
       * Run a new post editing session. Yields a block with a new {@link PostEditor}
       * instance. This instance can be used to interact with the post abstract.
       * Rendering will be deferred until after the callback is completed.
       *
       * Usage:
       * ```
       *   let markerRange = this.range;
       *   editor.run((postEditor) => {
       *     postEditor.deleteRange(markerRange);
       *     // editing surface not updated yet
       *     postEditor.schedule(() => {
       *       console.log('logs during rerender flush');
       *     });
       *     // logging not yet flushed
       *   });
       *   // editing surface now updated.
       *   // logging now flushed
       * ```
       *
       * @param {Function} callback Called with an instance of
       *        {@link PostEditor} as its argument.
       * @return {Mixed} The return value of `callback`.
       * @public
       */
    }, {
      key: 'run',
      value: function run(callback) {
        var postEditor = new _mobiledocKitEditorPost['default'](this);
        postEditor.begin();
        this._editHistory.snapshot();
        var result = callback(postEditor);
        this.runCallbacks(CALLBACK_QUEUES.DID_UPDATE, [postEditor]);
        postEditor.complete();
        this._readRangeFromDOM();

        if (postEditor._shouldCancelSnapshot) {
          this._editHistory._pendingSnapshot = null;
        }
        this._editHistory.storeSnapshot(postEditor.editActionTaken);

        return result;
      }

      /**
       * @param {Function} callback Called with `postEditor` as its argument.
       * @public
       */
    }, {
      key: 'didUpdatePost',
      value: function didUpdatePost(callback) {
        this.addCallback(CALLBACK_QUEUES.DID_UPDATE, callback);
      }

      /**
       * @param {Function} callback Called when the post has changed, either via
       *        user input or programmatically. Use with {@link Editor#serialize} to
       *        retrieve the post in portable mobiledoc format.
       */
    }, {
      key: 'postDidChange',
      value: function postDidChange(callback) {
        this.addCallback(CALLBACK_QUEUES.POST_DID_CHANGE, callback);
      }

      /**
       * Register a handler that will be invoked by the editor after the user enters
       * matching text.
       * @param {Object} inputHandler
       * @param {String} inputHandler.name Required. Used by identifying handlers.
       * @param {String} [inputHandler.text] Required if `match` is not provided
       * @param {RegExp} [inputHandler.match] Required if `text` is not provided
       * @param {Function} inputHandler.run This callback is invoked with the {@link Editor}
       *                   instance and an array of matches. If `text` was provided,
       *                   the matches array will equal [`text`], and if a `match`
       *                   regex was provided the matches array will be the result of
       *                   `match.exec` on the matching text. The callback is called
       *                   after the matching text has been inserted.
       * @public
       */
    }, {
      key: 'onTextInput',
      value: function onTextInput(inputHandler) {
        this._eventManager.registerInputHandler(inputHandler);
      }

      /**
       * Unregister all text input handlers
       *
       * @public
       */
    }, {
      key: 'unregisterAllTextInputHandlers',
      value: function unregisterAllTextInputHandlers() {
        this._eventManager.unregisterAllTextInputHandlers();
      }

      /**
       * Unregister text input handler by name
       * @param {String} name The name of handler to be removed
       *
       * @public
       */
    }, {
      key: 'unregisterTextInputHandler',
      value: function unregisterTextInputHandler(name) {
        this._eventManager.unregisterInputHandler(name);
      }

      /**
       * @param {Function} callback Called when the editor's state (active markups or
       * active sections) has changed, either via user input or programmatically
       */
    }, {
      key: 'inputModeDidChange',
      value: function inputModeDidChange(callback) {
        this.addCallback(CALLBACK_QUEUES.INPUT_MODE_DID_CHANGE, callback);
      }

      /**
       * @param {Function} callback This callback will be called before the editor
       *        is rendered.
       * @public
       */
    }, {
      key: 'willRender',
      value: function willRender(callback) {
        this.addCallback(CALLBACK_QUEUES.WILL_RENDER, callback);
      }

      /**
       * @param {Function} callback This callback will be called after the editor
       *        is rendered.
       * @public
       */
    }, {
      key: 'didRender',
      value: function didRender(callback) {
        this.addCallback(CALLBACK_QUEUES.DID_RENDER, callback);
      }

      /**
       * @param {Function} callback This callback will be called before deleting.
       * @public
       */
    }, {
      key: 'willDelete',
      value: function willDelete(callback) {
        this.addCallback(CALLBACK_QUEUES.WILL_DELETE, callback);
      }

      /**
       * @param {Function} callback This callback will be called after deleting.
       * @public
       */
    }, {
      key: 'didDelete',
      value: function didDelete(callback) {
        this.addCallback(CALLBACK_QUEUES.DID_DELETE, callback);
      }

      /**
       * @param {Function} callback This callback will be called before handling new line.
       * @public
       */
    }, {
      key: 'willHandleNewline',
      value: function willHandleNewline(callback) {
        this.addCallback(CALLBACK_QUEUES.WILL_HANDLE_NEWLINE, callback);
      }

      /**
       * @param {Function} callback This callback will be called every time the cursor
       *        position (or selection) changes.
       * @public
       */
    }, {
      key: 'cursorDidChange',
      value: function cursorDidChange(callback) {
        this.addCallback(CALLBACK_QUEUES.CURSOR_DID_CHANGE, callback);
      }
    }, {
      key: '_rangeDidChange',
      value: function _rangeDidChange() {
        if (this.hasRendered) {
          this.runCallbacks(CALLBACK_QUEUES.CURSOR_DID_CHANGE);
        }
      }
    }, {
      key: '_inputModeDidChange',
      value: function _inputModeDidChange() {
        this.runCallbacks(CALLBACK_QUEUES.INPUT_MODE_DID_CHANGE);
      }
    }, {
      key: '_insertEmptyMarkupSectionAtCursor',
      value: function _insertEmptyMarkupSectionAtCursor() {
        var _this5 = this;

        this.run(function (postEditor) {
          var section = postEditor.builder.createMarkupSection('p');
          postEditor.insertSectionBefore(_this5.post.sections, section);
          postEditor.setRange(section.toRange());
        });
      }

      /**
       * @callback editorBeforeCallback
       * @param { Object } details
       * @param { Markup } details.markup
       * @param { Range } details.range
       * @param { boolean } details.willAdd Whether the markup will be applied
       */

      /**
       * Register a callback that will be run before {@link Editor#toggleMarkup} is applied.
       * If any callback returns literal `false`, the toggling of markup will be canceled.
       * Note this only applies to calling `editor#toggleMarkup`. Using `editor.run` and
       * modifying markup with the `postEditor` will skip any `beforeToggleMarkup` callbacks.
       * @param {editorBeforeCallback}
       */
    }, {
      key: 'beforeToggleMarkup',
      value: function beforeToggleMarkup(callback) {
        this._beforeHooks.toggleMarkup.push(callback);
      }

      /**
       * Toggles the given markup at the editor's current {@link Range}.
       * If the range is collapsed this changes the editor's state so that the
       * next characters typed will be affected. If there is text selected
       * (aka a non-collapsed range), the selections' markup will be toggled.
       * If the editor is not focused and has no active range, nothing happens.
       * Hooks added using #beforeToggleMarkup will be run before toggling,
       * and if any of them returns literal false, toggling the markup will be canceled
       * and no change will be applied.
       * @param {String} markup E.g. "b", "em", "a"
       * @param {Object} [attributes={}] E.g. {href: "http://bustle.com"}
       * @public
       * @see PostEditor#toggleMarkup
       */
    }, {
      key: 'toggleMarkup',
      value: function toggleMarkup(markup) {
        var attributes = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        markup = this.builder.createMarkup(markup, attributes);
        var range = this.range;

        var willAdd = !this.detectMarkupInRange(range, markup.tagName);
        var shouldCancel = this._runBeforeHooks('toggleMarkup', { markup: markup, range: range, willAdd: willAdd });
        if (shouldCancel) {
          return;
        }

        if (range.isCollapsed) {
          this._editState.toggleMarkupState(markup);
          this._inputModeDidChange();

          // when clicking a button to toggle markup, the button can end up being focused,
          // so ensure the editor is focused
          this._ensureFocus();
        } else {
          this.run(function (postEditor) {
            return postEditor.toggleMarkup(markup, range);
          });
        }
      }

      // If the editor has a selection but is not focused, focus it
    }, {
      key: '_ensureFocus',
      value: function _ensureFocus() {
        if (this._hasSelection() && !this._hasFocus()) {
          this.focus();
        }
      }
    }, {
      key: 'focus',
      value: function focus() {
        this.element.focus();
      }

      /**
       * Whether there is a selection inside the editor's element.
       * It's possible to have a selection but not have focus.
       * @see #_hasFocus
       * @return {Boolean}
       */
    }, {
      key: '_hasSelection',
      value: function _hasSelection() {
        var cursor = this.cursor;

        return this.hasRendered && (cursor._hasCollapsedSelection() || cursor._hasSelection());
      }

      /**
       * Whether the editor's element is focused
       * It's possible to be focused but have no selection
       * @see #_hasSelection
       * @return {Boolean}
       */
    }, {
      key: '_hasFocus',
      value: function _hasFocus() {
        return document.activeElement === this.element;
      }

      /**
       * Toggles the tagName for the current active section(s). This will skip
       * non-markerable sections. E.g. if the editor's range includes a "P" MarkupSection
       * and a CardSection, only the MarkupSection will be toggled.
       * @param {String} tagName The new tagname to change to.
       * @public
       * @see PostEditor#toggleSection
       */
    }, {
      key: 'toggleSection',
      value: function toggleSection(tagName) {
        var _this6 = this;

        this.run(function (postEditor) {
          return postEditor.toggleSection(tagName, _this6.range);
        });
      }

      /**
       * Sets an attribute for the current active section(s).
       *
       * @param {String} key The attribute. The only valid attribute is 'text-align'.
       * @param {String} value The value of the attribute.
       * @public
       * @see PostEditor#setAttribute
       */
    }, {
      key: 'setAttribute',
      value: function setAttribute(key, value) {
        var _this7 = this;

        this.run(function (postEditor) {
          return postEditor.setAttribute(key, value, _this7.range);
        });
      }

      /**
       * Removes an attribute from the current active section(s).
       *
       * @param {String} key The attribute. The only valid attribute is 'text-align'.
       * @public
       * @see PostEditor#removeAttribute
       */
    }, {
      key: 'removeAttribute',
      value: function removeAttribute(key) {
        var _this8 = this;

        this.run(function (postEditor) {
          return postEditor.removeAttribute(key, _this8.range);
        });
      }

      /**
       * Finds and runs the first matching key command for the event
       *
       * If multiple commands are bound to a key combination, the
       * first matching one is run.
       *
       * If a command returns `false` then the next matching command
       * is run instead.
       *
       * @param {Event} event The keyboard event triggered by the user
       * @return {Boolean} true when a command was successfully run
       * @private
       */
    }, {
      key: 'handleKeyCommand',
      value: function handleKeyCommand(event) {
        var keyCommands = (0, _mobiledocKitEditorKeyCommands.findKeyCommands)(this.keyCommands, event);
        for (var i = 0; i < keyCommands.length; i++) {
          var keyCommand = keyCommands[i];
          if (keyCommand.run(this) !== false) {
            event.preventDefault();
            return true;
          }
        }
        return false;
      }

      /**
       * Inserts the text at the current cursor position. If the editor has
       * no current cursor position, nothing will be inserted. If the editor's
       * range is not collapsed, it will be deleted before insertion.
       *
       * @param {String} text
       * @public
       */
    }, {
      key: 'insertText',
      value: function insertText(text) {
        if (!this.hasCursor()) {
          return;
        }
        if (this.post.isBlank) {
          this._insertEmptyMarkupSectionAtCursor();
        }
        var activeMarkups = this.activeMarkups;
        var range = this.range;
        var position = this.range.head;

        this.run(function (postEditor) {
          if (!range.isCollapsed) {
            position = postEditor.deleteRange(range);
          }

          postEditor.insertTextWithMarkup(position, text, activeMarkups);
        });
      }

      /**
       * Inserts an atom at the current cursor position. If the editor has
       * no current cursor position, nothing will be inserted. If the editor's
       * range is not collapsed, it will be deleted before insertion.
       * @param {String} atomName
       * @param {String} [atomText='']
       * @param {Object} [atomPayload={}]
       * @return {Atom} The inserted atom.
       * @public
       */
    }, {
      key: 'insertAtom',
      value: function insertAtom(atomName) {
        var atomText = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
        var atomPayload = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

        if (!this.hasCursor()) {
          return;
        }
        if (this.post.isBlank) {
          this._insertEmptyMarkupSectionAtCursor();
        }

        var atom = undefined;
        var range = this.range;

        this.run(function (postEditor) {
          var position = range.head;

          atom = postEditor.builder.createAtom(atomName, atomText, atomPayload);
          if (!range.isCollapsed) {
            position = postEditor.deleteRange(range);
          }

          postEditor.insertMarkers(position, [atom]);
        });
        return atom;
      }

      /**
       * Inserts a card at the section after the current cursor position. If the editor has
       * no current cursor position, nothing will be inserted. If the editor's
       * range is not collapsed, it will be deleted before insertion. If the cursor is in
       * a blank section, it will be replaced with a card section.
       * The editor's cursor will be placed at the end of the inserted card.
       * @param {String} cardName
       * @param {Object} [cardPayload={}]
       * @param {Boolean} [inEditMode=false] Whether the card should be inserted in edit mode.
       * @return {Card} The inserted Card section.
       * @public
       */
    }, {
      key: 'insertCard',
      value: function insertCard(cardName) {
        var _this9 = this;

        var cardPayload = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
        var inEditMode = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

        if (!this.hasCursor()) {
          return;
        }
        if (this.post.isBlank) {
          this._insertEmptyMarkupSectionAtCursor();
        }

        var card = undefined;
        var range = this.range;

        this.run(function (postEditor) {
          var position = range.tail;
          card = postEditor.builder.createCardSection(cardName, cardPayload);
          if (inEditMode) {
            _this9.editCard(card);
          }

          if (!range.isCollapsed) {
            position = postEditor.deleteRange(range);
          }

          var section = position.section;
          if (section.isNested) {
            section = section.parent;
          }

          if (section.isBlank) {
            postEditor.replaceSection(section, card);
          } else {
            var collection = _this9.post.sections;
            postEditor.insertSectionBefore(collection, card, section.next);
          }

          // It is important to explicitly set the range to the end of the card.
          // Otherwise it is possible to create an inconsistent state in the
          // browser. For instance, if the user clicked a button that
          // called `editor.insertCard`, the editor surface may retain
          // the selection but lose focus, and the next keystroke by the user
          // will cause an unexpected DOM mutation (which can wipe out the
          // card).
          // See: https://github.com/bustle/mobiledoc-kit/issues/286
          postEditor.setRange(card.tailPosition());
        });
        return card;
      }

      /**
       * @param {integer} x x-position in viewport
       * @param {integer} y y-position in viewport
       * @return {Position|null}
       */
    }, {
      key: 'positionAtPoint',
      value: function positionAtPoint(x, y) {
        return _mobiledocKitUtilsCursorPosition['default'].atPoint(x, y, this);
      }

      /**
       * @private
       */
    }, {
      key: '_setCardMode',
      value: function _setCardMode(cardSection, mode) {
        var renderNode = cardSection.renderNode;
        if (renderNode && renderNode.isRendered) {
          var cardNode = renderNode.cardNode;
          cardNode[mode]();
        } else {
          cardSection.setInitialMode(mode);
        }
      }
    }, {
      key: 'triggerEvent',
      value: function triggerEvent(context, eventName, event) {
        this._eventManager._trigger(context, eventName, event);
      }
    }, {
      key: 'addCallback',
      value: function addCallback() {
        var _callbacks;

        (_callbacks = this._callbacks).addCallback.apply(_callbacks, arguments);
      }
    }, {
      key: 'addCallbackOnce',
      value: function addCallbackOnce() {
        var _callbacks2;

        (_callbacks2 = this._callbacks).addCallbackOnce.apply(_callbacks2, arguments);
      }
    }, {
      key: 'runCallbacks',
      value: function runCallbacks() {
        var _callbacks3;

        if (this.isDestroyed) {
          // TODO warn that callback attempted after editor was destroyed
          return;
        }
        (_callbacks3 = this._callbacks).runCallbacks.apply(_callbacks3, arguments);
      }

      /**
       * Runs each callback for the given hookName.
       * Only the hookName 'toggleMarkup' is currently supported
       * @return {Boolean} shouldCancel Whether the action in `hookName` should be canceled
       * @private
       */
    }, {
      key: '_runBeforeHooks',
      value: function _runBeforeHooks(hookName) {
        var hooks = this._beforeHooks[hookName] || [];

        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        for (var i = 0; i < hooks.length; i++) {
          if (hooks[i].apply(hooks, args) === false) {
            return true;
          }
        }
      }
    }, {
      key: 'builder',
      get: function get() {
        if (!this._builder) {
          this._builder = new _mobiledocKitModelsPostNodeBuilder['default']();
        }
        return this._builder;
      }
    }, {
      key: 'keyCommands',
      get: function get() {
        if (!this._keyCommands) {
          this._keyCommands = [];
        }
        return this._keyCommands;
      }
    }, {
      key: 'cursor',
      get: function get() {
        return new _mobiledocKitUtilsCursor['default'](this);
      }

      /**
       * Return the current range for the editor (may be cached).
       * @return {Range}
       */
    }, {
      key: 'range',
      get: function get() {
        return this._editState.range;
      },
      set: function set(newRange) {
        this._editState.updateRange(newRange);

        if (this._editState.rangeDidChange()) {
          this._rangeDidChange();
        }

        if (this._editState.inputModeDidChange()) {
          this._inputModeDidChange();
        }
      }
    }, {
      key: 'activeSections',
      get: function get() {
        return this._editState.activeSections;
      }
    }, {
      key: 'activeSection',
      get: function get() {
        var activeSections = this.activeSections;

        return activeSections[activeSections.length - 1];
      }
    }, {
      key: 'activeSectionAttributes',
      get: function get() {
        return this._editState.activeSectionAttributes;
      }
    }, {
      key: 'activeMarkups',
      get: function get() {
        return this._editState.activeMarkups;
      }
    }]);

    return Editor;
  })();

  exports['default'] = Editor;
});
define('mobiledoc-kit/editor/event-manager', ['exports', 'mobiledoc-kit/utils/assert', 'mobiledoc-kit/utils/parse-utils', 'mobiledoc-kit/utils/array-utils', 'mobiledoc-kit/utils/key', 'mobiledoc-kit/editor/text-input-handler', 'mobiledoc-kit/editor/selection-manager', 'mobiledoc-kit/utils/browser'], function (exports, _mobiledocKitUtilsAssert, _mobiledocKitUtilsParseUtils, _mobiledocKitUtilsArrayUtils, _mobiledocKitUtilsKey, _mobiledocKitEditorTextInputHandler, _mobiledocKitEditorSelectionManager, _mobiledocKitUtilsBrowser) {
  'use strict';

  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var ELEMENT_EVENT_TYPES = ['keydown', 'keyup', 'cut', 'copy', 'paste', 'keypress', 'drop'];

  var EventManager = (function () {
    function EventManager(editor) {
      _classCallCheck(this, EventManager);

      this.editor = editor;
      this.logger = editor.loggerFor('event-manager');
      this._textInputHandler = new _mobiledocKitEditorTextInputHandler['default'](editor);
      this._listeners = [];
      this.modifierKeys = {
        shift: false
      };

      this._selectionManager = new _mobiledocKitEditorSelectionManager['default'](this.editor, this.selectionDidChange.bind(this));
      this.started = true;
    }

    _createClass(EventManager, [{
      key: 'init',
      value: function init() {
        var _this = this;

        var element = this.editor.element;

        (0, _mobiledocKitUtilsAssert['default'])('Cannot init EventManager without element', !!element);

        ELEMENT_EVENT_TYPES.forEach(function (type) {
          _this._addListener(element, type);
        });

        this._selectionManager.start();
      }
    }, {
      key: 'start',
      value: function start() {
        this.started = true;
      }
    }, {
      key: 'stop',
      value: function stop() {
        this.started = false;
      }
    }, {
      key: 'registerInputHandler',
      value: function registerInputHandler(inputHandler) {
        this._textInputHandler.register(inputHandler);
      }
    }, {
      key: 'unregisterInputHandler',
      value: function unregisterInputHandler(name) {
        this._textInputHandler.unregister(name);
      }
    }, {
      key: 'unregisterAllTextInputHandlers',
      value: function unregisterAllTextInputHandlers() {
        this._textInputHandler.destroy();
        this._textInputHandler = new _mobiledocKitEditorTextInputHandler['default'](this.editor);
      }
    }, {
      key: '_addListener',
      value: function _addListener(context, type) {
        var _this2 = this;

        (0, _mobiledocKitUtilsAssert['default'])('Missing listener for ' + type, !!this[type]);

        var listener = function listener(event) {
          return _this2._handleEvent(type, event);
        };
        context.addEventListener(type, listener);
        this._listeners.push([context, type, listener]);
      }
    }, {
      key: '_removeListeners',
      value: function _removeListeners() {
        this._listeners.forEach(function (_ref) {
          var _ref2 = _slicedToArray(_ref, 3);

          var context = _ref2[0];
          var type = _ref2[1];
          var listener = _ref2[2];

          context.removeEventListener(type, listener);
        });
        this._listeners = [];
      }

      // This is primarily useful for programmatically simulating events on the
      // editor from the tests.
    }, {
      key: '_trigger',
      value: function _trigger(context, type, event) {
        (0, _mobiledocKitUtilsArrayUtils.forEach)((0, _mobiledocKitUtilsArrayUtils.filter)(this._listeners, function (_ref3) {
          var _ref32 = _slicedToArray(_ref3, 2);

          var _context = _ref32[0];
          var _type = _ref32[1];

          return _context === context && _type === type;
        }), function (_ref4) {
          var _ref42 = _slicedToArray(_ref4, 3);

          var context = _ref42[0];
          var listener = _ref42[2];

          listener.call(context, event);
        });
      }
    }, {
      key: 'destroy',
      value: function destroy() {
        this._textInputHandler.destroy();
        this._selectionManager.destroy();
        this._removeListeners();
      }
    }, {
      key: '_handleEvent',
      value: function _handleEvent(type, event) {
        var element = event.target;

        if (!this.started) {
          // abort handling this event
          return true;
        }

        if (!this.isElementAddressable(element)) {
          // abort handling this event
          return true;
        }

        this[type](event);
      }
    }, {
      key: 'isElementAddressable',
      value: function isElementAddressable(element) {
        return this.editor.cursor.isAddressable(element);
      }
    }, {
      key: 'selectionDidChange',
      value: function selectionDidChange(selection /*, prevSelection */) {
        var shouldNotify = true;
        var anchorNode = selection.anchorNode;

        if (!this.isElementAddressable(anchorNode)) {
          if (!this.editor.range.isBlank) {
            // Selection changed from something addressable to something
            // not-addressable -- e.g., blur event, user clicked outside editor,
            // etc
            shouldNotify = true;
          } else {
            // selection changes wholly outside the editor should not trigger
            // change notifications
            shouldNotify = false;
          }
        }

        if (shouldNotify) {
          this.editor._readRangeFromDOM();
        }
      }
    }, {
      key: 'keypress',
      value: function keypress(event) {
        var editor = this.editor;
        var _textInputHandler = this._textInputHandler;

        if (!editor.hasCursor()) {
          return;
        }

        var key = _mobiledocKitUtilsKey['default'].fromEvent(event);
        if (!key.isPrintable()) {
          return;
        } else {
          event.preventDefault();
        }

        _textInputHandler.handle(key.toString());
      }
    }, {
      key: 'keydown',
      value: function keydown(event) {
        var editor = this.editor;

        if (!editor.hasCursor()) {
          return;
        }
        if (!editor.isEditable) {
          return;
        }

        var key = _mobiledocKitUtilsKey['default'].fromEvent(event);
        this._updateModifiersFromKey(key, { isDown: true });

        if (editor.handleKeyCommand(event)) {
          return;
        }

        if (editor.post.isBlank) {
          editor._insertEmptyMarkupSectionAtCursor();
        }

        var range = editor.range;

        switch (true) {
          // FIXME This should be restricted to only card/atom boundaries
          case key.isHorizontalArrowWithoutModifiersOtherThanShift():
            {
              var newRange = undefined;
              if (key.isShift()) {
                newRange = range.extend(key.direction * 1);
              } else {
                newRange = range.move(key.direction);
              }

              editor.selectRange(newRange);
              event.preventDefault();
              break;
            }
          case key.isDelete():
            {
              var direction = key.direction;

              var unit = 'char';
              if (key.altKey && _mobiledocKitUtilsBrowser['default'].isMac()) {
                unit = 'word';
              } else if (key.ctrlKey && !_mobiledocKitUtilsBrowser['default'].isMac()) {
                unit = 'word';
              }
              editor.performDelete({ direction: direction, unit: unit });
              event.preventDefault();
              break;
            }
          case key.isEnter():
            this._textInputHandler.handleNewLine();
            editor.handleNewline(event);
            break;
          case key.isTab():
            // Handle tab here because it does not fire a `keypress` event
            event.preventDefault();
            this._textInputHandler.handle(key.toString());
            break;
        }
      }
    }, {
      key: 'keyup',
      value: function keyup(event) {
        var editor = this.editor;

        if (!editor.hasCursor()) {
          return;
        }
        var key = _mobiledocKitUtilsKey['default'].fromEvent(event);
        this._updateModifiersFromKey(key, { isDown: false });
      }
    }, {
      key: 'cut',
      value: function cut(event) {
        event.preventDefault();

        this.copy(event);
        this.editor.performDelete();
      }
    }, {
      key: 'copy',
      value: function copy(event) {
        event.preventDefault();

        var editor = this.editor;
        var _editor = this.editor;
        var range = _editor.range;
        var post = _editor.post;

        post = post.trimTo(range);

        var data = {
          html: editor.serializePost(post, 'html'),
          text: editor.serializePost(post, 'text'),
          mobiledoc: editor.serializePost(post, 'mobiledoc')
        };

        (0, _mobiledocKitUtilsParseUtils.setClipboardData)(event, data, window);
      }
    }, {
      key: 'paste',
      value: function paste(event) {
        event.preventDefault();

        var editor = this.editor;

        var range = editor.range;

        if (!range.isCollapsed) {
          editor.performDelete();
        }

        if (editor.post.isBlank) {
          editor._insertEmptyMarkupSectionAtCursor();
        }

        var position = editor.range.head;
        var targetFormat = this.modifierKeys.shift ? 'text' : 'html';
        var pastedPost = (0, _mobiledocKitUtilsParseUtils.parsePostFromPaste)(event, editor, { targetFormat: targetFormat });

        editor.run(function (postEditor) {
          var nextPosition = postEditor.insertPost(position, pastedPost);
          postEditor.setRange(nextPosition);
        });
      }
    }, {
      key: 'drop',
      value: function drop(event) {
        event.preventDefault();

        var x = event.clientX;
        var y = event.clientY;
        var editor = this.editor;

        var position = editor.positionAtPoint(x, y);
        if (!position) {
          this.logger.log('Could not find drop position');
          return;
        }

        var post = (0, _mobiledocKitUtilsParseUtils.parsePostFromDrop)(event, editor, { logger: this.logger });
        if (!post) {
          this.logger.log('Could not determine post from drop event');
          return;
        }

        editor.run(function (postEditor) {
          var nextPosition = postEditor.insertPost(position, post);
          postEditor.setRange(nextPosition);
        });
      }
    }, {
      key: '_updateModifiersFromKey',
      value: function _updateModifiersFromKey(key, _ref5) {
        var isDown = _ref5.isDown;

        if (key.isShiftKey()) {
          this.modifierKeys.shift = isDown;
        }
      }
    }]);

    return EventManager;
  })();

  exports['default'] = EventManager;
});
define('mobiledoc-kit/editor/key-commands', ['exports', 'mobiledoc-kit/utils/key', 'mobiledoc-kit/utils/array-utils', 'mobiledoc-kit/utils/assert', 'mobiledoc-kit/utils/browser', 'mobiledoc-kit/editor/ui'], function (exports, _mobiledocKitUtilsKey, _mobiledocKitUtilsArrayUtils, _mobiledocKitUtilsAssert, _mobiledocKitUtilsBrowser, _mobiledocKitEditorUi) {
  'use strict';

  exports.buildKeyCommand = buildKeyCommand;
  exports.validateKeyCommand = validateKeyCommand;
  exports.findKeyCommands = findKeyCommands;

  function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

  function selectAll(editor) {
    var post = editor.post;

    editor.selectRange(post.toRange());
  }

  function gotoStartOfLine(editor) {
    var range = editor.range;
    var section = range.tail.section;

    editor.run(function (postEditor) {
      postEditor.setRange(section.headPosition());
    });
  }

  function gotoEndOfLine(editor) {
    var range = editor.range;
    var section = range.tail.section;

    editor.run(function (postEditor) {
      postEditor.setRange(section.tailPosition());
    });
  }

  function deleteToEndOfSection(editor) {
    var range = editor.range;

    if (range.isCollapsed) {
      var _range = range;
      var head = _range.head;
      var section = _range.head.section;

      range = head.toRange(section.tailPosition());
    }
    editor.run(function (postEditor) {
      var nextPosition = postEditor.deleteRange(range);
      postEditor.setRange(nextPosition);
    });
  }

  var DEFAULT_KEY_COMMANDS = [{
    str: 'META+B',
    run: function run(editor) {
      editor.toggleMarkup('strong');
    }
  }, {
    str: 'CTRL+B',
    run: function run(editor) {
      editor.toggleMarkup('strong');
    }
  }, {
    str: 'META+I',
    run: function run(editor) {
      editor.toggleMarkup('em');
    }
  }, {
    str: 'CTRL+I',
    run: function run(editor) {
      editor.toggleMarkup('em');
    }
  }, {
    str: 'META+U',
    run: function run(editor) {
      editor.toggleMarkup('u');
    }
  }, {
    str: 'CTRL+U',
    run: function run(editor) {
      editor.toggleMarkup('u');
    }
  }, {
    str: 'CTRL+K',
    run: function run(editor) {
      if (_mobiledocKitUtilsBrowser['default'].isMac()) {
        return deleteToEndOfSection(editor);
      } else if (_mobiledocKitUtilsBrowser['default'].isWin()) {
        return (0, _mobiledocKitEditorUi.toggleLink)(editor);
      }
    }
  }, {
    str: 'CTRL+A',
    run: function run(editor) {
      if (_mobiledocKitUtilsBrowser['default'].isMac()) {
        gotoStartOfLine(editor);
      } else {
        selectAll(editor);
      }
    }
  }, {
    str: 'META+A',
    run: function run(editor) {
      if (_mobiledocKitUtilsBrowser['default'].isMac()) {
        selectAll(editor);
      }
    }
  }, {
    str: 'CTRL+E',
    run: function run(editor) {
      if (_mobiledocKitUtilsBrowser['default'].isMac()) {
        gotoEndOfLine(editor);
      }
    }
  }, {
    str: 'META+K',
    run: function run(editor) {
      return (0, _mobiledocKitEditorUi.toggleLink)(editor);
    }

  }, {
    str: 'META+Z',
    run: function run(editor) {
      editor.run(function (postEditor) {
        postEditor.undoLastChange();
      });
    }
  }, {
    str: 'META+SHIFT+Z',
    run: function run(editor) {
      editor.run(function (postEditor) {
        postEditor.redoLastChange();
      });
    }
  }, {
    str: 'CTRL+Z',
    run: function run(editor) {
      if (_mobiledocKitUtilsBrowser['default'].isMac()) {
        return false;
      }
      editor.run(function (postEditor) {
        return postEditor.undoLastChange();
      });
    }
  }, {
    str: 'CTRL+SHIFT+Z',
    run: function run(editor) {
      if (_mobiledocKitUtilsBrowser['default'].isMac()) {
        return false;
      }
      editor.run(function (postEditor) {
        return postEditor.redoLastChange();
      });
    }
  }];

  exports.DEFAULT_KEY_COMMANDS = DEFAULT_KEY_COMMANDS;
  function modifierNamesToMask(modiferNames) {
    var defaultVal = 0;
    return (0, _mobiledocKitUtilsArrayUtils.reduce)(modiferNames, function (sum, name) {
      var modifier = _mobiledocKitUtilsKey.MODIFIERS[name.toUpperCase()];
      (0, _mobiledocKitUtilsAssert['default'])('No modifier named "' + name + '" found', !!modifier);
      return sum + modifier;
    }, defaultVal);
  }

  function characterToCode(character) {
    var upperCharacter = character.toUpperCase();
    var special = (0, _mobiledocKitUtilsKey.specialCharacterToCode)(upperCharacter);
    if (special) {
      return special;
    } else {
      (0, _mobiledocKitUtilsAssert['default'])('Only 1 character can be used in a key command str (got "' + character + '")', character.length === 1);
      return upperCharacter.charCodeAt(0);
    }
  }

  function buildKeyCommand(keyCommand) {
    var str = keyCommand.str;

    if (!str) {
      return keyCommand;
    }
    (0, _mobiledocKitUtilsAssert['default'])('[deprecation] Key commands no longer use the `modifier` property', !keyCommand.modifier);

    var _str$split$reverse = str.split('+').reverse();

    var _str$split$reverse2 = _toArray(_str$split$reverse);

    var character = _str$split$reverse2[0];

    var modifierNames = _str$split$reverse2.slice(1);

    keyCommand.modifierMask = modifierNamesToMask(modifierNames);
    keyCommand.code = characterToCode(character);

    return keyCommand;
  }

  function validateKeyCommand(keyCommand) {
    return !!keyCommand.code && !!keyCommand.run;
  }

  function findKeyCommands(keyCommands, keyEvent) {
    var key = _mobiledocKitUtilsKey['default'].fromEvent(keyEvent);

    return (0, _mobiledocKitUtilsArrayUtils.filter)(keyCommands, function (_ref) {
      var modifierMask = _ref.modifierMask;
      var code = _ref.code;

      return key.keyCode === code && key.modifierMask === modifierMask;
    });
  }
});
define('mobiledoc-kit/editor/mutation-handler', ['exports', 'mobiledoc-kit/utils/set', 'mobiledoc-kit/utils/array-utils', 'mobiledoc-kit/utils/assert', 'mobiledoc-kit/utils/dom-utils'], function (exports, _mobiledocKitUtilsSet, _mobiledocKitUtilsArrayUtils, _mobiledocKitUtilsAssert, _mobiledocKitUtilsDomUtils) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var MUTATION = {
    NODES_CHANGED: 'childList',
    CHARACTER_DATA: 'characterData'
  };

  var MutationHandler = (function () {
    function MutationHandler(editor) {
      var _this = this;

      _classCallCheck(this, MutationHandler);

      this.editor = editor;
      this.logger = editor.loggerFor('mutation-handler');
      this.renderTree = null;
      this._isObserving = false;

      this._observer = new MutationObserver(function (mutations) {
        _this._handleMutations(mutations);
      });
    }

    _createClass(MutationHandler, [{
      key: 'init',
      value: function init() {
        this.startObserving();
      }
    }, {
      key: 'destroy',
      value: function destroy() {
        this.stopObserving();
        this._observer = null;
      }
    }, {
      key: 'suspendObservation',
      value: function suspendObservation(callback) {
        this.stopObserving();
        callback();
        this.startObserving();
      }
    }, {
      key: 'stopObserving',
      value: function stopObserving() {
        if (this._isObserving) {
          this._isObserving = false;
          this._observer.disconnect();
        }
      }
    }, {
      key: 'startObserving',
      value: function startObserving() {
        if (!this._isObserving) {
          var editor = this.editor;

          (0, _mobiledocKitUtilsAssert['default'])('Cannot observe un-rendered editor', editor.hasRendered);

          this._isObserving = true;
          this.renderTree = editor._renderTree;

          this._observer.observe(editor.element, {
            characterData: true,
            childList: true,
            subtree: true
          });
        }
      }
    }, {
      key: 'reparsePost',
      value: function reparsePost() {
        this.editor._reparsePost();
      }
    }, {
      key: 'reparseSections',
      value: function reparseSections(sections) {
        this.editor._reparseSections(sections);
      }

      /**
       * for each mutation:
       *   * find the target nodes:
       *     * if nodes changed, target nodes are:
       *        * added nodes
       *        * the target from which removed nodes were removed
       *     * if character data changed
       *       * target node is the mutation event's target (text node)
       *     * filter out nodes that are no longer attached (parentNode is null)
       *   * for each remaining node:
       *   *  find its section, add to sections-to-reparse
       *   *  if no section, reparse all (and break)
       */
    }, {
      key: '_handleMutations',
      value: function _handleMutations(mutations) {
        var reparsePost = false;
        var sections = new _mobiledocKitUtilsSet['default']();

        for (var i = 0; i < mutations.length; i++) {
          if (reparsePost) {
            break;
          }

          var nodes = this._findTargetNodes(mutations[i]);

          for (var j = 0; j < nodes.length; j++) {
            var node = nodes[j];
            var renderNode = this._findRenderNodeFromNode(node);
            if (renderNode) {
              if (renderNode.reparsesMutationOfChildNode(node)) {
                var section = this._findSectionFromRenderNode(renderNode);
                if (section) {
                  sections.add(section);
                } else {
                  reparsePost = true;
                }
              }
            } else {
              reparsePost = true;
              break;
            }
          }
        }

        if (reparsePost) {
          this.logger.log('reparsePost (' + mutations.length + ' mutations)');
          this.reparsePost();
        } else if (sections.length) {
          this.logger.log('reparse ' + sections.length + ' sections (' + mutations.length + ' mutations)');
          this.reparseSections(sections.toArray());
        }
      }
    }, {
      key: '_findTargetNodes',
      value: function _findTargetNodes(mutation) {
        var nodes = [];

        switch (mutation.type) {
          case MUTATION.CHARACTER_DATA:
            nodes.push(mutation.target);
            break;
          case MUTATION.NODES_CHANGED:
            (0, _mobiledocKitUtilsArrayUtils.forEach)(mutation.addedNodes, function (n) {
              return nodes.push(n);
            });
            if (mutation.removedNodes.length) {
              nodes.push(mutation.target);
            }
            break;
        }

        var element = this.editor.element;
        var attachedNodes = (0, _mobiledocKitUtilsArrayUtils.filter)(nodes, function (node) {
          return (0, _mobiledocKitUtilsDomUtils.containsNode)(element, node);
        });
        return attachedNodes;
      }
    }, {
      key: '_findSectionRenderNodeFromNode',
      value: function _findSectionRenderNodeFromNode(node) {
        return this.renderTree.findRenderNodeFromElement(node, function (rn) {
          return rn.postNode.isSection;
        });
      }
    }, {
      key: '_findRenderNodeFromNode',
      value: function _findRenderNodeFromNode(node) {
        return this.renderTree.findRenderNodeFromElement(node);
      }
    }, {
      key: '_findSectionFromRenderNode',
      value: function _findSectionFromRenderNode(renderNode) {
        var sectionRenderNode = this._findSectionRenderNodeFromNode(renderNode.element);
        return sectionRenderNode && sectionRenderNode.postNode;
      }
    }]);

    return MutationHandler;
  })();

  exports['default'] = MutationHandler;
});
define('mobiledoc-kit/editor/post', ['exports', 'mobiledoc-kit/utils/cursor/position', 'mobiledoc-kit/utils/cursor/range', 'mobiledoc-kit/utils/array-utils', 'mobiledoc-kit/utils/key', 'mobiledoc-kit/models/lifecycle-callbacks', 'mobiledoc-kit/utils/assert', 'mobiledoc-kit/utils/dom-utils', 'mobiledoc-kit/editor/post/post-inserter', 'mobiledoc-kit/utils/deprecate', 'mobiledoc-kit/utils/to-range'], function (exports, _mobiledocKitUtilsCursorPosition, _mobiledocKitUtilsCursorRange, _mobiledocKitUtilsArrayUtils, _mobiledocKitUtilsKey, _mobiledocKitModelsLifecycleCallbacks, _mobiledocKitUtilsAssert, _mobiledocKitUtilsDomUtils, _mobiledocKitEditorPostPostInserter, _mobiledocKitUtilsDeprecate, _mobiledocKitUtilsToRange) {
  'use strict';

  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var FORWARD = _mobiledocKitUtilsKey.DIRECTION.FORWARD;
  var BACKWARD = _mobiledocKitUtilsKey.DIRECTION.BACKWARD;

  function isListSectionTagName(tagName) {
    return tagName === 'ul' || tagName === 'ol';
  }

  var CALLBACK_QUEUES = {
    BEFORE_COMPLETE: 'beforeComplete',
    COMPLETE: 'complete',
    AFTER_COMPLETE: 'afterComplete'
  };

  // There are only two events that we're concerned about for Undo, that is inserting text and deleting content.
  // These are the only two states that go on a "run" and create a combined undo, everything else has it's own
  // deadicated undo.
  var EDIT_ACTIONS = {
    INSERT_TEXT: 1,
    DELETE: 2
  };

  /**
   * The PostEditor is used to modify a post. It should not be instantiated directly.
   * Instead, a new instance of a PostEditor is created by the editor and passed
   * as the argument to the callback in {@link Editor#run}.
   *
   * Usage:
   * ```
   * editor.run((postEditor) => {
   *   // postEditor is an instance of PostEditor that can operate on the
   *   // editor's post
   * });
   * ```
   */

  var PostEditor = (function () {
    /**
     * @private
     */

    function PostEditor(editor) {
      var _this = this;

      _classCallCheck(this, PostEditor);

      this.editor = editor;
      this.builder = this.editor.builder;
      this._callbacks = new _mobiledocKitModelsLifecycleCallbacks['default']((0, _mobiledocKitUtilsArrayUtils.values)(CALLBACK_QUEUES));

      this._didComplete = false;
      this.editActionTaken = null;

      this._renderRange = function () {
        return _this.editor.selectRange(_this._range);
      };
      this._postDidChange = function () {
        return _this.editor._postDidChange();
      };
      this._rerender = function () {
        return _this.editor.rerender();
      };
    }

    _createClass(PostEditor, [{
      key: 'addCallback',
      value: function addCallback() {
        var _callbacks;

        (_callbacks = this._callbacks).addCallback.apply(_callbacks, arguments);
      }
    }, {
      key: 'addCallbackOnce',
      value: function addCallbackOnce() {
        var _callbacks2;

        (_callbacks2 = this._callbacks).addCallbackOnce.apply(_callbacks2, arguments);
      }
    }, {
      key: 'runCallbacks',
      value: function runCallbacks() {
        var _callbacks3;

        (_callbacks3 = this._callbacks).runCallbacks.apply(_callbacks3, arguments);
      }
    }, {
      key: 'begin',
      value: function begin() {
        // cache the editor's range
        this._range = this.editor.range;
      }

      /**
       * Schedules to select the given range on the editor after the postEditor
       * has completed its work. This also updates the postEditor's active range
       * (so that multiple calls to range-changing methods on the postEditor will
       * update the correct range).
       *
       * Usage:
       *   let range = editor.range;
       *   editor.run(postEditor => {
       *     let nextPosition = postEditor.deleteRange(range);
       *
       *     // Will position the editor's cursor at `nextPosition` after
       *     // the postEditor finishes work and the editor rerenders.
       *     postEditor.setRange(nextPosition);
       *   });
       * @param {Range|Position} range
       * @public
       */
    }, {
      key: 'setRange',
      value: function setRange(range) {
        range = (0, _mobiledocKitUtilsToRange['default'])(range);

        // TODO validate that the range is valid
        // (does not contain marked-for-removal head or tail sections?)
        this._range = range;
        this.scheduleAfterRender(this._renderRange, true);
      }

      /**
       * Delete a range from the post
       *
       * Usage:
       * ```
       *     let { range } = editor;
       *     editor.run((postEditor) => {
       *       let nextPosition = postEditor.deleteRange(range);
       *       postEditor.setRange(nextPosition);
       *     });
       * ```
       * @param {Range} range Cursor Range object with head and tail Positions
       * @return {Position} The position where the cursor would go after deletion
       * @public
       */
    }, {
      key: 'deleteRange',
      value: function deleteRange(range) {
        (0, _mobiledocKitUtilsAssert['default'])("Must pass MobiledocKit Range to `deleteRange`", range instanceof _mobiledocKitUtilsCursorRange['default']);

        this.editActionTaken = EDIT_ACTIONS.DELETE;

        var head = range.head;
        var headSection = range.head.section;
        var tail = range.tail;
        var tailSection = range.tail.section;
        var post = this.editor.post;

        if (headSection === tailSection) {
          return this.cutSection(headSection, head, tail);
        }

        var nextSection = headSection.nextLeafSection();

        var nextPos = this.cutSection(headSection, head, headSection.tailPosition());
        // cutSection can replace the section, so re-read headSection here
        headSection = nextPos.section;

        // Remove sections in the middle of the range
        while (nextSection !== tailSection) {
          var tmp = nextSection;
          nextSection = nextSection.nextLeafSection();
          this.removeSection(tmp);
        }

        var tailPos = this.cutSection(tailSection, tailSection.headPosition(), tail);
        // cutSection can replace the section, so re-read tailSection here
        tailSection = tailPos.section;

        if (tailSection.isBlank) {
          this.removeSection(tailSection);
        } else {
          // If head and tail sections are markerable, join them
          // Note: They may not be the same section type. E.g. this may join
          // a tail section that was a list item onto a markup section, or vice versa.
          // (This is the desired behavior.)
          if (headSection.isMarkerable && tailSection.isMarkerable) {
            headSection.join(tailSection);
            this._markDirty(headSection);
            this.removeSection(tailSection);
          } else if (headSection.isBlank) {
            this.removeSection(headSection);
            nextPos = tailPos;
          }
        }

        if (post.isBlank) {
          post.sections.append(this.builder.createMarkupSection('p'));
          nextPos = post.headPosition();
        }

        return nextPos;
      }

      /**
       * Note: This method may replace `section` with a different section.
       *
       * "Cut" out the part of the section inside `headOffset` and `tailOffset`.
       * If section is markerable this splits markers that straddle the head or tail (if necessary),
       * and removes markers that are wholly inside the offsets.
       * If section is a card, this may replace it with a blank markup section if the
       * positions contain the entire card.
       *
       * @param {Section} section
       * @param {Position} head
       * @param {Position} tail
       * @return {Position}
       * @private
       */
    }, {
      key: 'cutSection',
      value: function cutSection(section, head, tail) {
        var _this2 = this;

        (0, _mobiledocKitUtilsAssert['default'])('Must pass head position and tail position to `cutSection`', head instanceof _mobiledocKitUtilsCursorPosition['default'] && tail instanceof _mobiledocKitUtilsCursorPosition['default']);
        (0, _mobiledocKitUtilsAssert['default'])('Must pass positions within same section to `cutSection`', head.section === tail.section);

        if (section.isBlank || head.isEqual(tail)) {
          return head;
        }
        if (section.isCardSection) {
          if (head.isHead() && tail.isTail()) {
            var newSection = this.builder.createMarkupSection();
            this.replaceSection(section, newSection);
            return newSection.headPosition();
          } else {
            return tail;
          }
        }

        var range = head.toRange(tail);
        this.splitMarkers(range).forEach(function (m) {
          return _this2.removeMarker(m);
        });

        return head;
      }
    }, {
      key: '_coalesceMarkers',
      value: function _coalesceMarkers(section) {
        if (section.isMarkerable) {
          this._removeBlankMarkers(section);
          this._joinSimilarMarkers(section);
        }
      }
    }, {
      key: '_removeBlankMarkers',
      value: function _removeBlankMarkers(section) {
        var _this3 = this;

        (0, _mobiledocKitUtilsArrayUtils.forEach)((0, _mobiledocKitUtilsArrayUtils.filter)(section.markers, function (m) {
          return m.isBlank;
        }), function (m) {
          return _this3.removeMarker(m);
        });
      }

      // joins markers that have identical markups
    }, {
      key: '_joinSimilarMarkers',
      value: function _joinSimilarMarkers(section) {
        var marker = section.markers.head;
        var nextMarker = undefined;
        while (marker && marker.next) {
          nextMarker = marker.next;

          if (marker.canJoin(nextMarker)) {
            nextMarker.value = marker.value + nextMarker.value;
            this._markDirty(nextMarker);
            this.removeMarker(marker);
          }

          marker = nextMarker;
        }
      }
    }, {
      key: 'removeMarker',
      value: function removeMarker(marker) {
        this._scheduleForRemoval(marker);
        if (marker.section) {
          this._markDirty(marker.section);
          marker.section.markers.remove(marker);
        }
      }
    }, {
      key: '_scheduleForRemoval',
      value: function _scheduleForRemoval(postNode) {
        var _this4 = this;

        if (postNode.renderNode) {
          postNode.renderNode.scheduleForRemoval();

          this.scheduleRerender();
          this.scheduleDidUpdate();
        }
        var removedAdjacentToList = postNode.prev && postNode.prev.isListSection || postNode.next && postNode.next.isListSection;
        if (removedAdjacentToList) {
          this.addCallback(CALLBACK_QUEUES.BEFORE_COMPLETE, function () {
            return _this4._joinContiguousListSections();
          });
        }
      }
    }, {
      key: '_joinContiguousListSections',
      value: function _joinContiguousListSections() {
        var _this5 = this;

        var post = this.editor.post;

        var range = this._range;
        var prev = undefined;
        var groups = [];
        var currentGroup = undefined;

        // FIXME do we need to force a re-render of the range if changed sections
        // are contained within the range?
        var updatedHead = null;
        (0, _mobiledocKitUtilsArrayUtils.forEach)(post.sections, function (section) {
          if (prev && prev.isListSection && section.isListSection && prev.tagName === section.tagName) {

            currentGroup = currentGroup || [prev];
            currentGroup.push(section);
          } else {
            if (currentGroup) {
              groups.push(currentGroup);
            }
            currentGroup = null;
          }
          prev = section;
        });

        if (currentGroup) {
          groups.push(currentGroup);
        }

        (0, _mobiledocKitUtilsArrayUtils.forEach)(groups, function (group) {
          var list = group[0];
          (0, _mobiledocKitUtilsArrayUtils.forEach)(group, function (listSection) {
            if (listSection === list) {
              return;
            }

            var currentHead = range.head;
            var prevPosition = undefined;

            // FIXME is there a currentHead if there is no range?
            // is the current head a list item in the section
            if (!range.isBlank && currentHead.section.isListItem && currentHead.section.parent === listSection) {
              prevPosition = list.tailPosition();
            }
            _this5._joinListSections(list, listSection);
            if (prevPosition) {
              updatedHead = prevPosition.move(FORWARD);
            }
          });
        });

        if (updatedHead) {
          this.setRange(updatedHead);
        }
      }
    }, {
      key: '_joinListSections',
      value: function _joinListSections(baseList, nextList) {
        baseList.join(nextList);
        this._markDirty(baseList);
        this.removeSection(nextList);
      }
    }, {
      key: '_markDirty',
      value: function _markDirty(postNode) {
        var _this6 = this;

        if (postNode.renderNode) {
          postNode.renderNode.markDirty();

          this.scheduleRerender();
          this.scheduleDidUpdate();
        }
        if (postNode.section) {
          this._markDirty(postNode.section);
        }
        if (postNode.isMarkerable) {
          this.addCallback(CALLBACK_QUEUES.BEFORE_COMPLETE, function () {
            return _this6._coalesceMarkers(postNode);
          });
        }
      }

      /**
       * @param {Position} position object with {section, offset} the marker and offset to delete from
       * @param {Number} direction The direction to delete in (default is BACKWARD)
       * @return {Position} for positioning the cursor
       * @public
       * @deprecated after v0.10.3
       */
    }, {
      key: 'deleteFrom',
      value: function deleteFrom(position) {
        var direction = arguments.length <= 1 || arguments[1] === undefined ? _mobiledocKitUtilsKey.DIRECTION.BACKWARD : arguments[1];

        (0, _mobiledocKitUtilsDeprecate['default'])("`postEditor#deleteFrom is deprecated. Use `deleteAtPosition(position, direction=BACKWARD, {unit}={unit: 'char'})` instead");
        return this.deleteAtPosition(position, direction, { unit: 'char' });
      }

      /**
       * Delete 1 `unit` (can be 'char' or 'word') in the given `direction` at the given
       * `position`. In almost all cases this will be equivalent to deleting the range formed
       * by expanding the position 1 unit in the given direction. The exception is when deleting
       * backward from the beginning of a list item, which reverts the list item into a markup section
       * instead of joining it with its previous list item (if any).
       *
       * Usage:
       *
       *     let position = section.tailPosition();
       *     // Section has text of "Howdy!"
       *     editor.run((postEditor) => {
       *       postEditor.deleteAtPosition(position);
       *     });
       *     // section has text of "Howdy"
       *
       * @param {Position} position The position to delete at
       * @param {Direction} [direction=DIRECTION.BACKWARD] direction The direction to delete in
       * @param {Object} [options]
       * @param {String} [options.unit="char"] The unit of deletion ("word" or "char")
       * @return {Position}
       */
    }, {
      key: 'deleteAtPosition',
      value: function deleteAtPosition(position) {
        var direction = arguments.length <= 1 || arguments[1] === undefined ? _mobiledocKitUtilsKey.DIRECTION.BACKWARD : arguments[1];

        var _ref = arguments.length <= 2 || arguments[2] === undefined ? { unit: 'char' } : arguments[2];

        var unit = _ref.unit;

        if (direction === _mobiledocKitUtilsKey.DIRECTION.BACKWARD) {
          return this._deleteAtPositionBackward(position, unit);
        } else {
          return this._deleteAtPositionForward(position, unit);
        }
      }
    }, {
      key: '_deleteAtPositionBackward',
      value: function _deleteAtPositionBackward(position, unit) {
        if (position.isHead() && position.section.isListItem) {
          this.toggleSection('p', position);
          return this._range.head;
        } else {
          var prevPosition = unit === 'word' ? position.moveWord(BACKWARD) : position.move(BACKWARD);
          var range = prevPosition.toRange(position);
          return this.deleteRange(range);
        }
      }
    }, {
      key: '_deleteAtPositionForward',
      value: function _deleteAtPositionForward(position, unit) {
        var nextPosition = unit === 'word' ? position.moveWord(FORWARD) : position.move(FORWARD);
        var range = position.toRange(nextPosition);
        return this.deleteRange(range);
      }

      /**
       * Split markers at two positions, once at the head, and if necessary once
       * at the tail.
       *
       * Usage:
       * ```
       *     let range = editor.range;
       *     editor.run((postEditor) => {
       *       postEditor.splitMarkers(range);
       *     });
       * ```
       * The return value will be marker object completely inside the offsets
       * provided. Markers outside of the split may also have been modified.
       *
       * @param {Range} markerRange
       * @return {Array} of markers that are inside the split
       * @private
       */
    }, {
      key: 'splitMarkers',
      value: function splitMarkers(range) {
        var post = this.editor.post;
        var head = range.head;
        var tail = range.tail;

        this.splitSectionMarkerAtOffset(head.section, head.offset);
        this.splitSectionMarkerAtOffset(tail.section, tail.offset);

        return post.markersContainedByRange(range);
      }
    }, {
      key: 'splitSectionMarkerAtOffset',
      value: function splitSectionMarkerAtOffset(section, offset) {
        var _this7 = this;

        var edit = section.splitMarkerAtOffset(offset);
        edit.removed.forEach(function (m) {
          return _this7.removeMarker(m);
        });
      }

      /**
       * Split the section at the position.
       *
       * Usage:
       * ```
       *     let position = editor.cursor.offsets.head;
       *     editor.run((postEditor) => {
       *       postEditor.splitSection(position);
       *     });
       *     // Will result in the creation of two new sections
       *     // replacing the old one at the cursor position
       * ```
       * The return value will be the two new sections. One or both of these
       * sections can be blank (contain only a blank marker), for example if the
       * headMarkerOffset is 0.
       *
       * @param {Position} position
       * @return {Array} new sections, one for the first half and one for the second (either one can be null)
       * @public
       */
    }, {
      key: 'splitSection',
      value: function splitSection(position) {
        var _this8 = this;

        var section = position.section;

        if (section.isCardSection) {
          return this._splitCardSection(section, position);
        } else if (section.isListItem) {
          var isLastAndBlank = section.isBlank && !section.next;
          if (isLastAndBlank) {
            // if is last, replace the item with a blank markup section
            var _parent = section.parent;
            var collection = this.editor.post.sections;
            var blank = this.builder.createMarkupSection();
            this.removeSection(section);
            this.insertSectionBefore(collection, blank, _parent.next);

            return [null, blank];
          } else {
            var _splitListItem2 = this._splitListItem(section, position);

            var _splitListItem22 = _slicedToArray(_splitListItem2, 2);

            var pre = _splitListItem22[0];
            var post = _splitListItem22[1];

            return [pre, post];
          }
        } else {
          var splitSections = section.splitAtPosition(position);
          splitSections.forEach(function (s) {
            return _this8._coalesceMarkers(s);
          });
          this._replaceSection(section, splitSections);

          return splitSections;
        }
      }

      /**
       * @param {Section} cardSection
       * @param {Position} position to split at
       * @return {Section[]} 2-item array of pre and post-split sections
       * @private
       */
    }, {
      key: '_splitCardSection',
      value: function _splitCardSection(cardSection, position) {
        var offset = position.offset;

        (0, _mobiledocKitUtilsAssert['default'])('Cards section must be split at offset 0 or 1', offset === 0 || offset === 1);

        var newSection = this.builder.createMarkupSection();
        var nextSection = undefined;
        var surroundingSections = undefined;

        if (offset === 0) {
          nextSection = cardSection;
          surroundingSections = [newSection, cardSection];
        } else {
          nextSection = cardSection.next;
          surroundingSections = [cardSection, newSection];
        }

        var collection = this.editor.post.sections;
        this.insertSectionBefore(collection, newSection, nextSection);

        return surroundingSections;
      }

      /**
       * @param {Section} section
       * @param {Section} newSection
       * @return null
       * @public
       */
    }, {
      key: 'replaceSection',
      value: function replaceSection(section, newSection) {
        if (!section) {
          // FIXME should a falsy section be a valid argument?
          this.insertSectionBefore(this.editor.post.sections, newSection, null);
        } else {
          this._replaceSection(section, [newSection]);
        }
      }
    }, {
      key: 'moveSectionBefore',
      value: function moveSectionBefore(collection, renderedSection, beforeSection) {
        var newSection = renderedSection.clone();
        this.removeSection(renderedSection);
        this.insertSectionBefore(collection, newSection, beforeSection);
        return newSection;
      }

      /**
       * @param {Section} section A section that is already in DOM
       * @public
       */
    }, {
      key: 'moveSectionUp',
      value: function moveSectionUp(renderedSection) {
        var isFirst = !renderedSection.prev;
        if (isFirst) {
          return renderedSection;
        }

        var collection = renderedSection.parent.sections;
        var beforeSection = renderedSection.prev;
        return this.moveSectionBefore(collection, renderedSection, beforeSection);
      }

      /**
       * @param {Section} section A section that is already in DOM
       * @public
       */
    }, {
      key: 'moveSectionDown',
      value: function moveSectionDown(renderedSection) {
        var isLast = !renderedSection.next;
        if (isLast) {
          return renderedSection;
        }

        var beforeSection = renderedSection.next.next;
        var collection = renderedSection.parent.sections;
        return this.moveSectionBefore(collection, renderedSection, beforeSection);
      }

      /**
       * Insert an array of markers at the given position. If the position is in
       * a non-markerable section (like a card section), this method throws an error.
       *
       * @param {Position} position
       * @param {Marker[]} markers
       * @return {Position} The position that represents the end of the inserted markers.
       * @public
       */
    }, {
      key: 'insertMarkers',
      value: function insertMarkers(position, markers) {
        var _this9 = this;

        var section = position.section;
        var offset = position.offset;

        (0, _mobiledocKitUtilsAssert['default'])('Cannot insert markers at non-markerable position', section.isMarkerable);

        this.editActionTaken = EDIT_ACTIONS.INSERT_TEXT;

        var edit = section.splitMarkerAtOffset(offset);
        edit.removed.forEach(function (marker) {
          return _this9._scheduleForRemoval(marker);
        });

        var prevMarker = section.markerBeforeOffset(offset);
        markers.forEach(function (marker) {
          section.markers.insertAfter(marker, prevMarker);
          offset += marker.length;
          prevMarker = marker;
        });

        this._coalesceMarkers(section);
        this._markDirty(section);

        var nextPosition = section.toPosition(offset);
        this.setRange(nextPosition);
        return nextPosition;
      }

      /**
       * Inserts text with the given markups, ignoring the existing markups at
       * the position, if any.
       *
       * @param {Position} position
       * @param {String} text
       * @param {Markup[]} markups
       * @return {Position} position at the end of the inserted text
       */
    }, {
      key: 'insertTextWithMarkup',
      value: function insertTextWithMarkup(position, text) {
        var markups = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];
        var section = position.section;

        if (!section.isMarkerable) {
          return;
        }
        var marker = this.builder.createMarker(text, markups);
        return this.insertMarkers(position, [marker]);
      }

      /**
       * Insert the text at the given position
       * Inherits the markups already at that position, if any.
       *
       * @param {Position} position
       * @param {String} text
       * @return {Position} position at the end of the inserted text.
       */
    }, {
      key: 'insertText',
      value: function insertText(position, text) {
        var section = position.section;

        if (!section.isMarkerable) {
          return;
        }
        var markups = position.marker && position.marker.markups;
        markups = markups || [];
        return this.insertTextWithMarkup(position, text, markups);
      }
    }, {
      key: '_replaceSection',
      value: function _replaceSection(section, newSections) {
        var _this10 = this;

        var nextSection = section.next;
        var collection = section.parent.sections;

        var nextNewSection = newSections[0];
        if (nextNewSection.isMarkupSection && section.isListItem) {
          // put the new section after the ListSection (section.parent)
          // instead of after the ListItem
          collection = section.parent.parent.sections;
          nextSection = section.parent.next;
        }

        newSections.forEach(function (s) {
          return _this10.insertSectionBefore(collection, s, nextSection);
        });
        this.removeSection(section);
      }

      /**
       * Given a markerRange (for example `editor.range`) mark all markers
       * inside it as a given markup. The markup must be provided as a post
       * abstract node.
       *
       * Usage:
       *
       *     let range = editor.range;
       *     let strongMarkup = editor.builder.createMarkup('strong');
       *     editor.run((postEditor) => {
       *       postEditor.addMarkupToRange(range, strongMarkup);
       *     });
       *     // Will result some markers possibly being split, and the markup
       *     // being applied to all markers between the split.
       *
       * @param {Range} range
       * @param {Markup} markup A markup post abstract node
       * @public
       */
    }, {
      key: 'addMarkupToRange',
      value: function addMarkupToRange(range, markup) {
        var _this11 = this;

        if (range.isCollapsed) {
          return;
        }

        var markers = this.splitMarkers(range);
        if (markers.length) {
          (function () {
            // We insert the new markup at a consistent index across the range.
            // If we just push on the end of the list, it can end up in different positions
            // of the markup stack. This results in unnecessary closing and re-opening of
            // the markup each time it changes position.
            // If we just push it at the beginning of the list, this causes unnecessary closing
            // and re-opening of surrounding tags.
            // So, we look for any tags open across the whole range, and push into the stack
            // at the end of those.
            // Prompted by https://github.com/bustle/mobiledoc-kit/issues/360

            var markupsOpenAcrossRange = (0, _mobiledocKitUtilsArrayUtils.reduce)(markers, function (soFar, marker) {
              return (0, _mobiledocKitUtilsArrayUtils.commonItems)(soFar, marker.markups);
            }, markers[0].markups);
            var indexToInsert = markupsOpenAcrossRange.length;

            markers.forEach(function (marker) {
              marker.addMarkupAtIndex(markup, indexToInsert);
              _this11._markDirty(marker);
            });
          })();
        }
      }

      /**
       * Given a markerRange (for example `editor.range`) remove the given
       * markup from all contained markers.
       *
       * Usage:
       * ```
       *     let { range } = editor;
       *     let markup = markerRange.headMarker.markups[0];
       *     editor.run(postEditor => {
       *       postEditor.removeMarkupFromRange(range, markup);
       *     });
       *     // Will result in some markers possibly being split, and the markup
       *     // being removed from all markers between the split.
       * ```
       * @param {Range} range Object with offsets
       * @param {Markup|Function} markupOrCallback A markup post abstract node or
       * a function that returns true when passed a markup that should be removed
       * @private
       */
    }, {
      key: 'removeMarkupFromRange',
      value: function removeMarkupFromRange(range, markupOrMarkupCallback) {
        var _this12 = this;

        if (range.isCollapsed) {
          return;
        }

        this.splitMarkers(range).forEach(function (marker) {
          marker.removeMarkup(markupOrMarkupCallback);
          _this12._markDirty(marker);
        });
      }

      /**
       * Toggle the given markup in the given range (or at the position given). If the range/position
       * has the markup, the markup will be removed. If nothing in the range/position
       * has the markup, the markup will be added to everything in the range/position.
       *
       * Usage:
       * ```
       * // Remove any 'strong' markup if it exists in the selection, otherwise
       * // make it all 'strong'
       * editor.run(postEditor => postEditor.toggleMarkup('strong'));
       *
       * // add/remove a link to 'bustle.com' to the selection
       * editor.run(postEditor => {
       *   const linkMarkup = postEditor.builder.createMarkup('a', {href: 'http://bustle.com'});
       *   postEditor.toggleMarkup(linkMarkup);
       * });
       * ```
       * @param {Markup|String} markupOrString Either a markup object created using
       * the builder (useful when adding a markup with attributes, like an 'a' markup),
       * or, if a string, the tag name of the markup (e.g. 'strong', 'em') to toggle.
       * @param {Range|Position} range in which to toggle. Defaults to current editor range.
       * @public
       */
    }, {
      key: 'toggleMarkup',
      value: function toggleMarkup(markupOrMarkupString) {
        var range = arguments.length <= 1 || arguments[1] === undefined ? this._range : arguments[1];

        range = (0, _mobiledocKitUtilsToRange['default'])(range);
        var markup = typeof markupOrMarkupString === 'string' ? this.builder.createMarkup(markupOrMarkupString) : markupOrMarkupString;

        var hasMarkup = this.editor.detectMarkupInRange(range, markup.tagName);
        // FIXME: This implies only a single markup in a range. This may not be
        // true for links (which are not the same object instance like multiple
        // strong tags would be).
        if (hasMarkup) {
          this.removeMarkupFromRange(range, hasMarkup);
        } else {
          this.addMarkupToRange(range, markup);
        }

        this.setRange(range);
      }

      /**
       * Toggles the tagName of the active section or sections in the given range/position.
       * If every section has the tag name, they will all be reset to default sections.
       * Otherwise, every section will be changed to the requested type
       *
       * @param {String} sectionTagName A valid markup section or
       *        list section tag name (e.g. 'blockquote', 'h2', 'ul')
       * @param {Range|Position} range The range over which to toggle.
       *        Defaults to the current editor range.
       * @public
       */
    }, {
      key: 'toggleSection',
      value: function toggleSection(sectionTagName) {
        var _this13 = this;

        var range = arguments.length <= 1 || arguments[1] === undefined ? this._range : arguments[1];

        range = (0, _mobiledocKitUtilsToRange['default'])(range);

        sectionTagName = (0, _mobiledocKitUtilsDomUtils.normalizeTagName)(sectionTagName);
        var post = this.editor.post;

        var everySectionHasTagName = true;
        post.walkMarkerableSections(range, function (section) {
          if (!_this13._isSameSectionType(section, sectionTagName)) {
            everySectionHasTagName = false;
          }
        });

        var tagName = everySectionHasTagName ? 'p' : sectionTagName;
        var sectionTransformations = [];
        post.walkMarkerableSections(range, function (section) {
          var changedSection = _this13.changeSectionTagName(section, tagName);
          sectionTransformations.push({
            from: section,
            to: changedSection
          });
        });

        var nextRange = this._determineNextRangeAfterToggleSection(range, sectionTransformations);
        this.setRange(nextRange);
      }
    }, {
      key: '_determineNextRangeAfterToggleSection',
      value: function _determineNextRangeAfterToggleSection(range, sectionTransformations) {
        if (sectionTransformations.length) {
          var changedHeadSection = (0, _mobiledocKitUtilsArrayUtils.detect)(sectionTransformations, function (_ref2) {
            var from = _ref2.from;

            return from === range.headSection;
          }).to;
          var changedTailSection = (0, _mobiledocKitUtilsArrayUtils.detect)(sectionTransformations, function (_ref3) {
            var from = _ref3.from;

            return from === range.tailSection;
          }).to;

          if (changedHeadSection.isListSection || changedTailSection.isListSection) {
            // We don't know to which ListItem's the original sections point at, so
            // we don't have enough information to reconstruct the range when
            // dealing with lists.
            return sectionTransformations[0].to.headPosition().toRange();
          } else {
            return _mobiledocKitUtilsCursorRange['default'].create(changedHeadSection, range.headSectionOffset, changedTailSection, range.tailSectionOffset, range.direction);
          }
        } else {
          return range;
        }
      }
    }, {
      key: 'setAttribute',
      value: function setAttribute(key, value) {
        var range = arguments.length <= 2 || arguments[2] === undefined ? this._range : arguments[2];

        this._mutateAttribute(key, range, function (section, attribute) {
          if (section.getAttribute(attribute) !== value) {
            section.setAttribute(attribute, value);
            return true;
          }
        });
      }
    }, {
      key: 'removeAttribute',
      value: function removeAttribute(key) {
        var range = arguments.length <= 1 || arguments[1] === undefined ? this._range : arguments[1];

        this._mutateAttribute(key, range, function (section, attribute) {
          if (section.hasAttribute(attribute)) {
            section.removeAttribute(attribute);
            return true;
          }
        });
      }
    }, {
      key: '_mutateAttribute',
      value: function _mutateAttribute(key, range, cb) {
        var _this14 = this;

        range = (0, _mobiledocKitUtilsToRange['default'])(range);
        var post = this.editor.post;

        var attribute = 'data-md-' + key;

        post.walkMarkerableSections(range, function (section) {
          if (section.isListItem) {
            section = section.parent;
          }

          if (cb(section, attribute) === true) {
            _this14._markDirty(section);
          }
        });

        this.setRange(range);
      }
    }, {
      key: '_isSameSectionType',
      value: function _isSameSectionType(section, sectionTagName) {
        return section.isListItem ? section.parent.tagName === sectionTagName : section.tagName === sectionTagName;
      }

      /**
       * @param {Markerable} section
       * @private
       */
    }, {
      key: 'changeSectionTagName',
      value: function changeSectionTagName(section, newTagName) {
        (0, _mobiledocKitUtilsAssert['default'])('Cannot pass non-markerable section to `changeSectionTagName`', section.isMarkerable);

        if (isListSectionTagName(newTagName)) {
          return this._changeSectionToListItem(section, newTagName);
        } else if (section.isListItem) {
          return this._changeSectionFromListItem(section, newTagName);
        } else {
          section.tagName = newTagName;
          this._markDirty(section);
          return section;
        }
      }

      /**
       * Splits the item at the position given.
       * If the position is at the start or end of the item, the pre- or post-item
       * will contain a single empty ("") marker.
       * @param {ListItem} item
       * @param {Position} position
       * @return {Array} the pre-item and post-item on either side of the split
       * @private
       */
    }, {
      key: '_splitListItem',
      value: function _splitListItem(item, position) {
        var section = position.section;
        var offset = position.offset;

        (0, _mobiledocKitUtilsAssert['default'])('Cannot split list item at position that does not include item', item === section);

        item.splitMarkerAtOffset(offset);
        var prevMarker = item.markerBeforeOffset(offset);
        var preItem = this.builder.createListItem(),
            postItem = this.builder.createListItem();

        var currentItem = preItem;
        item.markers.forEach(function (marker) {
          currentItem.markers.append(marker.clone());
          if (marker === prevMarker) {
            currentItem = postItem;
          }
        });
        this._replaceSection(item, [preItem, postItem]);
        return [preItem, postItem];
      }

      /**
       * Splits the list at the position given.
       * @return {Array} pre-split list and post-split list, either of which could
       * be blank (0-item list) if the position is at the start or end of the list.
       *
       * Note: Contiguous list sections will be joined in the before_complete queue
       * of the postEditor.
       *
       * @private
       */
    }, {
      key: '_splitListAtPosition',
      value: function _splitListAtPosition(list, position) {
        (0, _mobiledocKitUtilsAssert['default'])('Cannot split list at position not in list', position.section.parent === list);

        var positionIsMiddle = !position.isHead() && !position.isTail();
        if (positionIsMiddle) {
          var item = position.section;

          var _splitListItem3 = this._splitListItem(item, position);

          var _splitListItem32 = _slicedToArray(_splitListItem3, 1);

          var pre = _splitListItem32[0];

          position = pre.tailPosition();
        }

        var preList = this.builder.createListSection(list.tagName);
        var postList = this.builder.createListSection(list.tagName);

        var preItem = position.section;
        var currentList = preList;
        list.items.forEach(function (item) {
          // If this item matches the start item and the position is at its start,
          // it should be appended to the postList instead of the preList
          if (item === preItem && position.isEqual(item.headPosition())) {
            currentList = postList;
          }
          currentList.items.append(item.clone());
          // If we just appended the preItem, append the remaining items to the postList
          if (item === preItem) {
            currentList = postList;
          }
        });

        this._replaceSection(list, [preList, postList]);
        return [preList, postList];
      }

      /**
       * @return Array of [prev, mid, next] lists. `prev` and `next` can
       *         be blank, depending on the position of `item`. `mid` will always
       *         be a 1-item list containing `item`. `prev` and `next` will be
       *         removed in the before_complete queue if they are blank
       *         (and still attached).
       *
       * @private
       */
    }, {
      key: '_splitListAtItem',
      value: function _splitListAtItem(list, item) {
        var _this15 = this;

        var next = list;
        var prev = this.builder.createListSection(next.tagName, [], next.attributes);
        var mid = this.builder.createListSection(next.tagName);

        var addToPrev = true;
        // must turn the LinkedList into an array so that we can remove items
        // as we iterate through it
        var items = next.items.toArray();
        items.forEach(function (i) {
          var listToAppend = undefined;
          if (i === item) {
            addToPrev = false;
            listToAppend = mid;
          } else if (addToPrev) {
            listToAppend = prev;
          } else {
            return; // break after iterating prev and mid parts of the list
          }
          listToAppend.join(i);
          _this15.removeSection(i);
        });
        var found = !addToPrev;
        (0, _mobiledocKitUtilsAssert['default'])('Cannot split list at item that is not present in the list', found);

        var collection = this.editor.post.sections;
        this.insertSectionBefore(collection, mid, next);
        this.insertSectionBefore(collection, prev, mid);

        // Remove possibly blank prev/next lists
        this.addCallback(CALLBACK_QUEUES.BEFORE_COMPLETE, function () {
          [prev, next].forEach(function (_list) {
            var isAttached = !!_list.parent;
            if (_list.isBlank && isAttached) {
              _this15.removeSection(_list);
            }
          });
        });

        return [prev, mid, next];
      }
    }, {
      key: '_changeSectionFromListItem',
      value: function _changeSectionFromListItem(section, newTagName) {
        (0, _mobiledocKitUtilsAssert['default'])('Must pass list item to `_changeSectionFromListItem`', section.isListItem);

        var listSection = section.parent;
        var markupSection = this.builder.createMarkupSection(newTagName);
        markupSection.join(section);

        var _splitListAtItem2 = this._splitListAtItem(listSection, section);

        var _splitListAtItem22 = _slicedToArray(_splitListAtItem2, 2);

        var mid = _splitListAtItem22[1];

        this.replaceSection(mid, markupSection);
        return markupSection;
      }
    }, {
      key: '_changeSectionToListItem',
      value: function _changeSectionToListItem(section, newTagName) {
        var isAlreadyCorrectListItem = section.isListItem && section.parent.tagName === newTagName;

        if (isAlreadyCorrectListItem) {
          return section;
        }

        var listSection = this.builder.createListSection(newTagName);
        listSection.join(section);

        var sectionToReplace = undefined;
        if (section.isListItem) {
          var _splitListAtItem3 = this._splitListAtItem(section.parent, section);

          var _splitListAtItem32 = _slicedToArray(_splitListAtItem3, 2);

          var mid = _splitListAtItem32[1];

          sectionToReplace = mid;
        } else {
          sectionToReplace = section;
        }
        this.replaceSection(sectionToReplace, listSection);
        return listSection;
      }

      /**
       * Insert a given section before another one, updating the post abstract
       * and the rendered UI.
       *
       * Usage:
       * ```
       *     let markerRange = editor.range;
       *     let sectionWithCursor = markerRange.headMarker.section;
       *     let section = editor.builder.createCardSection('my-image');
       *     let collection = sectionWithCursor.parent.sections;
       *     editor.run((postEditor) => {
       *       postEditor.insertSectionBefore(collection, section, sectionWithCursor);
       *     });
       * ```
       * @param {LinkedList} collection The list of sections to insert into
       * @param {Object} section The new section
       * @param {Object} beforeSection Optional The section "before" is relative to,
       *        if falsy the new section will be appended to the collection
       * @public
       */
    }, {
      key: 'insertSectionBefore',
      value: function insertSectionBefore(collection, section, beforeSection) {
        collection.insertBefore(section, beforeSection);
        this._markDirty(section.parent);
      }

      /**
       * Insert the given section after the current active section, or, if no
       * section is active, at the end of the document.
       * @param {Section} section
       * @public
       */
    }, {
      key: 'insertSection',
      value: function insertSection(section) {
        var activeSection = this.editor.activeSection;
        var nextSection = activeSection && activeSection.next;

        var collection = this.editor.post.sections;
        this.insertSectionBefore(collection, section, nextSection);
      }

      /**
       * Insert the given section at the end of the document.
       * @param {Section} section
       * @public
       */
    }, {
      key: 'insertSectionAtEnd',
      value: function insertSectionAtEnd(section) {
        this.insertSectionBefore(this.editor.post.sections, section, null);
      }

      /**
       * Insert the `post` at the given position in the editor's post.
       * @param {Position} position
       * @param {Post} post
       * @private
       */
    }, {
      key: 'insertPost',
      value: function insertPost(position, newPost) {
        var post = this.editor.post;
        var inserter = new _mobiledocKitEditorPostPostInserter['default'](this, post);
        var nextPosition = inserter.insert(position, newPost);
        return nextPosition;
      }

      /**
       * Remove a given section from the post abstract and the rendered UI.
       *
       * Usage:
       * ```
       *     let { range } = editor;
       *     let sectionWithCursor = range.head.section;
       *     editor.run((postEditor) => {
       *       postEditor.removeSection(sectionWithCursor);
       *     });
       * ```
       * @param {Object} section The section to remove
       * @public
       */
    }, {
      key: 'removeSection',
      value: function removeSection(section) {
        var parent = section.parent;
        this._scheduleForRemoval(section);
        parent.sections.remove(section);

        if (parent.isListSection) {
          this._scheduleListRemovalIfEmpty(parent);
        }
      }
    }, {
      key: 'removeAllSections',
      value: function removeAllSections() {
        var _this16 = this;

        this.editor.post.sections.toArray().forEach(function (section) {
          _this16.removeSection(section);
        });
      }
    }, {
      key: 'migrateSectionsFromPost',
      value: function migrateSectionsFromPost(post) {
        var _this17 = this;

        post.sections.toArray().forEach(function (section) {
          post.sections.remove(section);
          _this17.insertSectionBefore(_this17.editor.post.sections, section, null);
        });
      }
    }, {
      key: '_scheduleListRemovalIfEmpty',
      value: function _scheduleListRemovalIfEmpty(listSection) {
        var _this18 = this;

        this.addCallback(CALLBACK_QUEUES.BEFORE_COMPLETE, function () {
          // if the list is attached and blank after we do other rendering stuff,
          // remove it
          var isAttached = !!listSection.parent;
          if (isAttached && listSection.isBlank) {
            _this18.removeSection(listSection);
          }
        });
      }

      /**
       * A method for adding work the deferred queue
       *
       * @param {Function} callback to run during completion
       * @param {Boolean} [once=false] Whether to only schedule the callback once.
       * @public
       */
    }, {
      key: 'schedule',
      value: function schedule(callback) {
        var once = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

        (0, _mobiledocKitUtilsAssert['default'])('Work can only be scheduled before a post edit has completed', !this._didComplete);
        if (once) {
          this.addCallbackOnce(CALLBACK_QUEUES.COMPLETE, callback);
        } else {
          this.addCallback(CALLBACK_QUEUES.COMPLETE, callback);
        }
      }

      /**
       * A method for adding work the deferred queue. The callback will only
       * be added to the queue once, even if `scheduleOnce` is called multiple times.
       * The function cannot be an anonymous function.
       *
       * @param {Function} callback to run during completion
       * @public
       */
    }, {
      key: 'scheduleOnce',
      value: function scheduleOnce(callback) {
        this.schedule(callback, true);
      }

      /**
       * Add a rerender job to the queue
       *
       * @public
       */
    }, {
      key: 'scheduleRerender',
      value: function scheduleRerender() {
        this.scheduleOnce(this._rerender);
      }

      /**
       * Schedule a notification that the post has been changed.
       * The notification will result in the editor firing its `postDidChange`
       * hook after the postEditor completes its work (at the end of {@link Editor#run}).
       *
       * @public
       */
    }, {
      key: 'scheduleDidUpdate',
      value: function scheduleDidUpdate() {
        this.scheduleOnce(this._postDidChange);
      }
    }, {
      key: 'scheduleAfterRender',
      value: function scheduleAfterRender(callback) {
        var once = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

        if (once) {
          this.addCallbackOnce(CALLBACK_QUEUES.AFTER_COMPLETE, callback);
        } else {
          this.addCallback(CALLBACK_QUEUES.AFTER_COMPLETE, callback);
        }
      }

      /**
       * Flush any work on the queue. {@link Editor#run} calls this method; it
       * should not be called directly.
       *
       * @private
       */
    }, {
      key: 'complete',
      value: function complete() {
        (0, _mobiledocKitUtilsAssert['default'])('Post editing can only be completed once', !this._didComplete);

        this.runCallbacks(CALLBACK_QUEUES.BEFORE_COMPLETE);
        this._didComplete = true;
        this.runCallbacks(CALLBACK_QUEUES.COMPLETE);
        this.runCallbacks(CALLBACK_QUEUES.AFTER_COMPLETE);
      }
    }, {
      key: 'undoLastChange',
      value: function undoLastChange() {
        this.editor._editHistory.stepBackward(this);
      }
    }, {
      key: 'redoLastChange',
      value: function redoLastChange() {
        this.editor._editHistory.stepForward(this);
      }
    }, {
      key: 'cancelSnapshot',
      value: function cancelSnapshot() {
        this._shouldCancelSnapshot = true;
      }
    }]);

    return PostEditor;
  })();

  exports['default'] = PostEditor;
});
define('mobiledoc-kit/editor/post/post-inserter', ['exports', 'mobiledoc-kit/utils/assert', 'mobiledoc-kit/models/types'], function (exports, _mobiledocKitUtilsAssert, _mobiledocKitModelsTypes) {
  'use strict';

  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var MARKERABLE = 'markerable',
      NESTED_MARKERABLE = 'nested_markerable',
      NON_MARKERABLE = 'non_markerable';

  var Visitor = (function () {
    function Visitor(inserter, cursorPosition) {
      _classCallCheck(this, Visitor);

      var postEditor = inserter.postEditor;
      var post = inserter.post;

      this.postEditor = postEditor;
      this._post = post;
      this.cursorPosition = cursorPosition;
      this.builder = this.postEditor.builder;

      this._hasInsertedFirstLeafSection = false;
    }

    _createClass(Visitor, [{
      key: 'visit',
      value: function visit(node) {
        var method = node.type;
        (0, _mobiledocKitUtilsAssert['default'])('Cannot visit node of type ' + node.type, !!this[method]);
        this[method](node);
      }
    }, {
      key: '_canMergeSection',
      value: function _canMergeSection(section) {
        if (this._hasInsertedFirstLeafSection) {
          return false;
        } else {
          return this._isMarkerable && section.isMarkerable;
        }
      }
    }, {
      key: _mobiledocKitModelsTypes.POST_TYPE,
      value: function value(node) {
        var _this = this;

        if (this.cursorSection.isBlank && !this._isNested) {
          // replace blank section with entire post
          var newSections = node.sections.map(function (s) {
            return s.clone();
          });
          this._replaceSection(this.cursorSection, newSections);
        } else {
          node.sections.forEach(function (section) {
            return _this.visit(section);
          });
        }
      }
    }, {
      key: _mobiledocKitModelsTypes.MARKUP_SECTION_TYPE,
      value: function value(node) {
        this[MARKERABLE](node);
      }
    }, {
      key: _mobiledocKitModelsTypes.LIST_SECTION_TYPE,
      value: function value(node) {
        var _this2 = this;

        var hasNext = !!node.next;
        node.items.forEach(function (item) {
          return _this2.visit(item);
        });

        if (this._isNested && hasNext) {
          this._breakNestedAtCursor();
        }
      }
    }, {
      key: _mobiledocKitModelsTypes.LIST_ITEM_TYPE,
      value: function value(node) {
        this[NESTED_MARKERABLE](node);
      }
    }, {
      key: _mobiledocKitModelsTypes.CARD_TYPE,
      value: function value(node) {
        this[NON_MARKERABLE](node);
      }
    }, {
      key: _mobiledocKitModelsTypes.IMAGE_SECTION_TYPE,
      value: function value(node) {
        this[NON_MARKERABLE](node);
      }
    }, {
      key: NON_MARKERABLE,
      value: function value(section) {
        if (this._isNested) {
          this._breakNestedAtCursor();
        } else if (!this.cursorSection.isBlank) {
          this._breakAtCursor();
        }

        this._insertLeafSection(section);
      }
    }, {
      key: MARKERABLE,
      value: function value(section) {
        if (this._canMergeSection(section)) {
          this._mergeSection(section);
        } else if (this._isNested && this._isMarkerable) {
          // If we are attaching a markerable section to a list item,
          // insert a linebreak then merge the section onto the resulting blank list item
          this._breakAtCursor();

          // Advance the cursor to the head of the blank list item
          var nextPosition = this.cursorSection.next.headPosition();
          this.cursorPosition = nextPosition;

          // Merge this section onto the list item
          this._mergeSection(section);
        } else {
          this._breakAtCursor();
          this._insertLeafSection(section);
        }
      }
    }, {
      key: NESTED_MARKERABLE,
      value: function value(section) {
        if (this._canMergeSection(section)) {
          this._mergeSection(section);
          return;
        }

        section = this._isNested ? section : this._wrapNestedSection(section);
        this._breakAtCursor();
        this._insertLeafSection(section);
      }

      // break out of a nested cursor position
    }, {
      key: '_breakNestedAtCursor',
      value: function _breakNestedAtCursor() {
        (0, _mobiledocKitUtilsAssert['default'])('Cannot call _breakNestedAtCursor if not nested', this._isNested);

        var parent = this.cursorSection.parent;
        var cursorAtEndOfList = this.cursorPosition.isEqual(parent.tailPosition());

        if (cursorAtEndOfList) {
          var blank = this.builder.createMarkupSection();
          this._insertSectionAfter(blank, parent);
        } else {
          var _breakListAtCursor2 = this._breakListAtCursor();

          var _breakListAtCursor22 = _slicedToArray(_breakListAtCursor2, 2);

          var blank = _breakListAtCursor22[1];

          this.cursorPosition = blank.tailPosition();
        }
      }
    }, {
      key: '_breakListAtCursor',
      value: function _breakListAtCursor() {
        (0, _mobiledocKitUtilsAssert['default'])('Cannot _splitParentSection if cursor position is not nested', this._isNested);

        var list = this.cursorSection.parent,
            position = this.cursorPosition,
            blank = this.builder.createMarkupSection();

        var _postEditor$_splitListAtPosition = this.postEditor._splitListAtPosition(list, position);

        var _postEditor$_splitListAtPosition2 = _slicedToArray(_postEditor$_splitListAtPosition, 2);

        var pre = _postEditor$_splitListAtPosition2[0];
        var post = _postEditor$_splitListAtPosition2[1];

        var collection = this._post.sections,
            reference = post;
        this.postEditor.insertSectionBefore(collection, blank, reference);
        return [pre, blank, post];
      }
    }, {
      key: '_wrapNestedSection',
      value: function _wrapNestedSection(section) {
        var tagName = section.parent.tagName;
        var parent = this.builder.createListSection(tagName);
        parent.items.append(section.clone());
        return parent;
      }
    }, {
      key: '_mergeSection',
      value: function _mergeSection(section) {
        (0, _mobiledocKitUtilsAssert['default'])('Can only merge markerable sections', this._isMarkerable && section.isMarkerable);
        this._hasInsertedFirstLeafSection = true;

        var markers = section.markers.map(function (m) {
          return m.clone();
        });
        var position = this.postEditor.insertMarkers(this.cursorPosition, markers);

        this.cursorPosition = position;
      }

      // Can be called to add a line break when in a nested section or a parent
      // section.
    }, {
      key: '_breakAtCursor',
      value: function _breakAtCursor() {
        if (this.cursorSection.isBlank) {
          return;
        } else if (this._isMarkerable) {
          this._breakMarkerableAtCursor();
        } else {
          this._breakNonMarkerableAtCursor();
        }
      }

      // Inserts a blank section before/after the cursor,
      // depending on cursor position.
    }, {
      key: '_breakNonMarkerableAtCursor',
      value: function _breakNonMarkerableAtCursor() {
        var collection = this._post.sections,
            blank = this.builder.createMarkupSection(),
            reference = this.cursorPosition.isHead() ? this.cursorSection : this.cursorSection.next;
        this.postEditor.insertSectionBefore(collection, blank, reference);
        this.cursorPosition = blank.tailPosition();
      }
    }, {
      key: '_breakMarkerableAtCursor',
      value: function _breakMarkerableAtCursor() {
        var _postEditor$splitSection = this.postEditor.splitSection(this.cursorPosition);

        var _postEditor$splitSection2 = _slicedToArray(_postEditor$splitSection, 1);

        var pre = _postEditor$splitSection2[0];

        this.cursorPosition = pre.tailPosition();
      }
    }, {
      key: '_replaceSection',
      value: function _replaceSection(section, newSections) {
        var _this3 = this;

        (0, _mobiledocKitUtilsAssert['default'])('Cannot replace section that does not have parent.sections', section.parent && section.parent.sections);
        (0, _mobiledocKitUtilsAssert['default'])('Must pass enumerable to _replaceSection', !!newSections.forEach);

        var collection = section.parent.sections;
        var reference = section.next;
        this.postEditor.removeSection(section);
        newSections.forEach(function (section) {
          _this3.postEditor.insertSectionBefore(collection, section, reference);
        });
        var lastSection = newSections[newSections.length - 1];

        this.cursorPosition = lastSection.tailPosition();
      }
    }, {
      key: '_insertSectionBefore',
      value: function _insertSectionBefore(section, reference) {
        var collection = this.cursorSection.parent.sections;
        this.postEditor.insertSectionBefore(collection, section, reference);

        this.cursorPosition = section.tailPosition();
      }

      // Insert a section after the parent section.
      // E.g., add a markup section after a list section
    }, {
      key: '_insertSectionAfter',
      value: function _insertSectionAfter(section, parent) {
        (0, _mobiledocKitUtilsAssert['default'])('Cannot _insertSectionAfter nested section', !parent.isNested);
        var reference = parent.next;
        var collection = this._post.sections;
        this.postEditor.insertSectionBefore(collection, section, reference);
        this.cursorPosition = section.tailPosition();
      }
    }, {
      key: '_insertLeafSection',
      value: function _insertLeafSection(section) {
        (0, _mobiledocKitUtilsAssert['default'])('Can only _insertLeafSection when cursor is at end of section', this.cursorPosition.isTail());

        this._hasInsertedFirstLeafSection = true;
        section = section.clone();

        if (this.cursorSection.isBlank) {
          (0, _mobiledocKitUtilsAssert['default'])('Cannot insert leaf non-markerable section when cursor is nested', !(section.isMarkerable && this._isNested));
          this._replaceSection(this.cursorSection, [section]);
        } else if (this.cursorSection.next && this.cursorSection.next.isBlank) {
          this._replaceSection(this.cursorSection.next, [section]);
        } else {
          var reference = this.cursorSection.next;
          this._insertSectionBefore(section, reference);
        }
      }
    }, {
      key: 'cursorPosition',
      get: function get() {
        return this._cursorPosition;
      },
      set: function set(position) {
        this._cursorPosition = position;
        this.postEditor.setRange(position);
      }
    }, {
      key: '_isMarkerable',
      get: function get() {
        return this.cursorSection.isMarkerable;
      }
    }, {
      key: 'cursorSection',
      get: function get() {
        return this.cursorPosition.section;
      }
    }, {
      key: 'cursorOffset',
      get: function get() {
        return this.cursorPosition.offset;
      }
    }, {
      key: '_isNested',
      get: function get() {
        return this.cursorSection.isNested;
      }
    }]);

    return Visitor;
  })();

  var Inserter = (function () {
    function Inserter(postEditor, post) {
      _classCallCheck(this, Inserter);

      this.postEditor = postEditor;
      this.post = post;
    }

    _createClass(Inserter, [{
      key: 'insert',
      value: function insert(cursorPosition, newPost) {
        var visitor = new Visitor(this, cursorPosition);
        if (!newPost.isBlank) {
          visitor.visit(newPost);
        }
        return visitor.cursorPosition;
      }
    }]);

    return Inserter;
  })();

  exports['default'] = Inserter;
});
define("mobiledoc-kit/editor/selection-change-observer", ["exports"], function (exports) {
  "use strict";

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var instance = undefined;

  var SelectionChangeObserver = (function () {
    function SelectionChangeObserver() {
      _classCallCheck(this, SelectionChangeObserver);

      this.started = false;
      this.listeners = [];
      this.selection = {};
    }

    _createClass(SelectionChangeObserver, [{
      key: "addListener",
      value: function addListener(listener) {
        if (this.listeners.indexOf(listener) === -1) {
          this.listeners.push(listener);
          this.start();
        }
      }
    }, {
      key: "removeListener",
      value: function removeListener(listener) {
        var index = this.listeners.indexOf(listener);
        if (index !== -1) {
          this.listeners.splice(index, 1);
          if (this.listeners.length === 0) {
            this.stop();
          }
        }
      }
    }, {
      key: "start",
      value: function start() {
        if (this.started) {
          return;
        }
        this.started = true;

        this.poll();
      }
    }, {
      key: "stop",
      value: function stop() {
        this.started = false;
        this.selection = {};
      }
    }, {
      key: "notifyListeners",
      value: function notifyListeners() /* newSelection, prevSelection */{
        var _arguments = arguments;

        this.listeners.forEach(function (listener) {
          listener.selectionDidChange.apply(listener, _arguments);
        });
      }
    }, {
      key: "destroy",
      value: function destroy() {
        this.stop();
        this.listeners = [];
      }
    }, {
      key: "getSelection",
      value: function getSelection() {
        var selection = window.getSelection();
        var anchorNode = selection.anchorNode;
        var focusNode = selection.focusNode;
        var anchorOffset = selection.anchorOffset;
        var focusOffset = selection.focusOffset;

        return { anchorNode: anchorNode, focusNode: focusNode, anchorOffset: anchorOffset, focusOffset: focusOffset };
      }
    }, {
      key: "poll",
      value: function poll() {
        var _this = this;

        if (this.started) {
          this.update();
          this.runNext(function () {
            return _this.poll();
          });
        }
      }
    }, {
      key: "runNext",
      value: function runNext(fn) {
        window.requestAnimationFrame(fn);
      }
    }, {
      key: "update",
      value: function update() {
        var prevSelection = this.selection;
        var curSelection = this.getSelection();
        if (!this.selectionIsEqual(prevSelection, curSelection)) {
          this.selection = curSelection;
          this.notifyListeners(curSelection, prevSelection);
        }
      }
    }, {
      key: "selectionIsEqual",
      value: function selectionIsEqual(s1, s2) {
        return s1.anchorNode === s2.anchorNode && s1.anchorOffset === s2.anchorOffset && s1.focusNode === s2.focusNode && s1.focusOffset === s2.focusOffset;
      }
    }], [{
      key: "getInstance",
      value: function getInstance() {
        if (!instance) {
          instance = new SelectionChangeObserver();
        }
        return instance;
      }
    }, {
      key: "addListener",
      value: function addListener(listener) {
        SelectionChangeObserver.getInstance().addListener(listener);
      }
    }, {
      key: "removeListener",
      value: function removeListener(listener) {
        SelectionChangeObserver.getInstance().removeListener(listener);
      }
    }]);

    return SelectionChangeObserver;
  })();

  exports["default"] = SelectionChangeObserver;
});
define('mobiledoc-kit/editor/selection-manager', ['exports', 'mobiledoc-kit/editor/selection-change-observer'], function (exports, _mobiledocKitEditorSelectionChangeObserver) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var SelectionManager = (function () {
    function SelectionManager(editor, callback) {
      _classCallCheck(this, SelectionManager);

      this.editor = editor;
      this.callback = callback;
      this.started = false;
    }

    _createClass(SelectionManager, [{
      key: 'start',
      value: function start() {
        if (this.started) {
          return;
        }

        _mobiledocKitEditorSelectionChangeObserver['default'].addListener(this);
        this.started = true;
      }
    }, {
      key: 'stop',
      value: function stop() {
        this.started = false;
        _mobiledocKitEditorSelectionChangeObserver['default'].removeListener(this);
      }
    }, {
      key: 'destroy',
      value: function destroy() {
        this.stop();
      }
    }, {
      key: 'selectionDidChange',
      value: function selectionDidChange() {
        if (this.started) {
          this.callback.apply(this, arguments);
        }
      }
    }]);

    return SelectionManager;
  })();

  exports['default'] = SelectionManager;
});
define('mobiledoc-kit/editor/text-input-handler', ['exports', 'mobiledoc-kit/utils/string-utils', 'mobiledoc-kit/utils/assert', 'mobiledoc-kit/utils/deprecate', 'mobiledoc-kit/utils/characters'], function (exports, _mobiledocKitUtilsStringUtils, _mobiledocKitUtilsAssert, _mobiledocKitUtilsDeprecate, _mobiledocKitUtilsCharacters) {
  'use strict';

  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var TextInputHandler = (function () {
    function TextInputHandler(editor) {
      _classCallCheck(this, TextInputHandler);

      this.editor = editor;
      this._handlers = [];
    }

    _createClass(TextInputHandler, [{
      key: 'register',
      value: function register(handler) {
        (0, _mobiledocKitUtilsAssert['default'])('Input Handler is not valid', this._validateHandler(handler));
        this._handlers.push(handler);
      }
    }, {
      key: 'unregister',
      value: function unregister(name) {
        var handlers = this._handlers;
        for (var i = 0; i < handlers.length; i++) {
          if (handlers[i].name === name) {
            handlers.splice(i, 1);
          }
        }
      }
    }, {
      key: 'handle',
      value: function handle(string) {
        var editor = this.editor;

        editor.insertText(string);

        var matchedHandler = this._findHandler();
        if (matchedHandler) {
          var _matchedHandler = _slicedToArray(matchedHandler, 2);

          var handler = _matchedHandler[0];
          var matches = _matchedHandler[1];

          handler.run(editor, matches);
        }
      }
    }, {
      key: 'handleNewLine',
      value: function handleNewLine() {
        var editor = this.editor;

        var matchedHandler = this._findHandler(_mobiledocKitUtilsCharacters.ENTER);
        if (matchedHandler) {
          var _matchedHandler2 = _slicedToArray(matchedHandler, 2);

          var handler = _matchedHandler2[0];
          var matches = _matchedHandler2[1];

          handler.run(editor, matches);
        }
      }
    }, {
      key: '_findHandler',
      value: function _findHandler() {
        var string = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];
        var _editor$range = this.editor.range;
        var head = _editor$range.head;
        var section = _editor$range.head.section;

        var preText = section.textUntil(head) + string;

        for (var i = 0; i < this._handlers.length; i++) {
          var handler = this._handlers[i];
          var text = handler.text;
          var match = handler.match;

          if (text && (0, _mobiledocKitUtilsStringUtils.endsWith)(preText, text)) {
            return [handler, [text]];
          } else if (match && match.test(preText)) {
            return [handler, match.exec(preText)];
          }
        }
      }
    }, {
      key: '_validateHandler',
      value: function _validateHandler(handler) {
        (0, _mobiledocKitUtilsDeprecate['default'])('Registered input handlers require a "name" property so that they can be unregistered', !!handler.name);
        return !!handler.run && ( // has `run`
        !!handler.text || !!handler.match) && // and `text` or `match`
        !(!!handler.text && !!handler.match); // not both `text` and `match`
      }
    }, {
      key: 'destroy',
      value: function destroy() {
        this._handlers = [];
      }
    }]);

    return TextInputHandler;
  })();

  exports['default'] = TextInputHandler;
});
define('mobiledoc-kit/editor/text-input-handlers', ['exports'], function (exports) {
  /**
   * Convert section at the editor's cursor position into a list.
   * Does nothing if the cursor position is not at the start of the section,
   * or if the section is already a list item.
   *
   * @param {Editor} editor
   * @param {String} listTagName ("ul" or "ol")
   * @public
   */
  'use strict';

  exports.replaceWithListSection = replaceWithListSection;
  exports.replaceWithHeaderSection = replaceWithHeaderSection;

  function replaceWithListSection(editor, listTagName) {
    var _editor$range = editor.range;
    var head = _editor$range.head;
    var section = _editor$range.head.section;

    // Skip if cursor is not at end of section
    if (!head.isTail()) {
      return;
    }

    if (section.isListItem) {
      return;
    }

    editor.run(function (postEditor) {
      var builder = postEditor.builder;

      var item = builder.createListItem();
      var listSection = builder.createListSection(listTagName, [item]);

      postEditor.replaceSection(section, listSection);
      postEditor.setRange(listSection.headPosition());
    });
  }

  /**
   * Convert section at the editor's cursor position into a header section.
   * Does nothing if the cursor position is not at the start of the section.
   *
   * @param {Editor} editor
   * @param {String} headingTagName ('h1', 'h2', 'h3', 'h4', 'h5', 'h6')
   * @public
   */

  function replaceWithHeaderSection(editor, headingTagName) {
    var _editor$range2 = editor.range;
    var head = _editor$range2.head;
    var section = _editor$range2.head.section;

    // Skip if cursor is not at end of section
    if (!head.isTail()) {
      return;
    }

    editor.run(function (postEditor) {
      var builder = postEditor.builder;

      var newSection = builder.createMarkupSection(headingTagName);
      postEditor.replaceSection(section, newSection);
      postEditor.setRange(newSection.headPosition());
    });
  }

  var DEFAULT_TEXT_INPUT_HANDLERS = [{
    name: 'ul',
    // "* " -> ul
    match: /^\* $/,
    run: function run(editor) {
      replaceWithListSection(editor, 'ul');
    }
  }, {
    name: 'ol',
    // "1" -> ol, "1." -> ol
    match: /^1\.? $/,
    run: function run(editor) {
      replaceWithListSection(editor, 'ol');
    }
  }, {
    name: 'heading',
    /*
     * "# " -> h1
     * "## " -> h2
     * "### " -> h3
     * "#### " -> h4
     * "##### " -> h5
     * "###### " -> h6
     */
    match: /^(#{1,6}) $/,
    run: function run(editor, matches) {
      var capture = matches[1];
      var headingTag = 'h' + capture.length;
      replaceWithHeaderSection(editor, headingTag);
    }
  }];
  exports.DEFAULT_TEXT_INPUT_HANDLERS = DEFAULT_TEXT_INPUT_HANDLERS;
});
define('mobiledoc-kit/editor/ui', ['exports'], function (exports) {
  /**
   * @module UI
   */

  /**
   * @callback promptCallback
   * @param {String} url The URL to pass back to the editor for linking
   *        to the selected text.
   */

  /**
   * @callback showPrompt
   * @param {String} message The text of the prompt.
   * @param {String} defaultValue The initial URL to display in the prompt.
   * @param {module:UI~promptCallback} callback Once your handler has accepted a URL,
   *        it should pass it to `callback` so that the editor may link the
   *        selected text.
   */

  /**
   * Exposes the core behavior for linking and unlinking text, and allows for
   * customization of the URL input handler.
   * @param {Editor} editor An editor instance to operate on. If a range is selected,
   *        either prompt for a URL and add a link or un-link the
   *        currently linked text.
   * @param {module:UI~showPrompt} [showPrompt] An optional custom input handler. Defaults
   *        to using `window.prompt`.
   * @example
   * let myPrompt = (message, defaultURL, promptCallback) => {
   *   let url = window.prompt("Overriding the defaults", "http://placekitten.com");
   *   promptCallback(url);
   * };
   *
   * editor.registerKeyCommand({
   *   str: "META+K",
   *   run(editor) {
   *     toggleLink(editor, myPrompt);
   *   }
   * });
   * @public
   */

  'use strict';

  exports.toggleLink = toggleLink;
  var defaultShowPrompt = function defaultShowPrompt(message, defaultValue, callback) {
    return callback(window.prompt(message, defaultValue));
  };

  function toggleLink(editor) {
    var showPrompt = arguments.length <= 1 || arguments[1] === undefined ? defaultShowPrompt : arguments[1];

    if (editor.range.isCollapsed) {
      return;
    }

    var selectedText = editor.cursor.selectedText();
    var defaultUrl = '';
    if (selectedText.indexOf('http') !== -1) {
      defaultUrl = selectedText;
    }

    var range = editor.range;

    var hasLink = editor.detectMarkupInRange(range, 'a');

    if (hasLink) {
      editor.toggleMarkup('a');
    } else {
      showPrompt('Enter a URL', defaultUrl, function (url) {
        if (!url) {
          return;
        }

        editor.toggleMarkup('a', { href: url });
      });
    }
  }
});
define('mobiledoc-kit', ['exports', 'mobiledoc-kit/editor/editor', 'mobiledoc-kit/editor/ui', 'mobiledoc-kit/cards/image', 'mobiledoc-kit/utils/cursor/range', 'mobiledoc-kit/utils/cursor/position', 'mobiledoc-kit/utils/mobiledoc-error', 'mobiledoc-kit/version', 'mobiledoc-kit/renderers/mobiledoc'], function (exports, _mobiledocKitEditorEditor, _mobiledocKitEditorUi, _mobiledocKitCardsImage, _mobiledocKitUtilsCursorRange, _mobiledocKitUtilsCursorPosition, _mobiledocKitUtilsMobiledocError, _mobiledocKitVersion, _mobiledocKitRenderersMobiledoc) {
  'use strict';

  exports.registerGlobal = registerGlobal;

  var Mobiledoc = {
    Editor: _mobiledocKitEditorEditor['default'],
    UI: _mobiledocKitEditorUi,
    ImageCard: _mobiledocKitCardsImage['default'],
    Range: _mobiledocKitUtilsCursorRange['default'],
    Position: _mobiledocKitUtilsCursorPosition['default'],
    Error: _mobiledocKitUtilsMobiledocError['default'],
    VERSION: _mobiledocKitVersion['default'],
    MOBILEDOC_VERSION: _mobiledocKitRenderersMobiledoc.MOBILEDOC_VERSION
  };

  function registerGlobal(global) {
    global.Mobiledoc = Mobiledoc;
  }

  exports.Editor = _mobiledocKitEditorEditor['default'];
  exports.UI = _mobiledocKitEditorUi;
  exports.Range = _mobiledocKitUtilsCursorRange['default'];
  exports.Position = _mobiledocKitUtilsCursorPosition['default'];
  exports.MOBILEDOC_VERSION = _mobiledocKitRenderersMobiledoc.MOBILEDOC_VERSION;
  exports['default'] = Mobiledoc;
});
define('mobiledoc-kit/models/_attributable', ['exports', 'mobiledoc-kit/utils/object-utils', 'mobiledoc-kit/utils/array-utils'], function (exports, _mobiledocKitUtilsObjectUtils, _mobiledocKitUtilsArrayUtils) {
  'use strict';

  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  exports.attributable = attributable;
  var VALID_ATTRIBUTES = ['data-md-text-align'];

  exports.VALID_ATTRIBUTES = VALID_ATTRIBUTES;
  /*
   * A "mixin" to add section attribute support
   * to markup and list sections.
   */

  function attributable(ctx) {
    ctx.attributes = {};

    ctx.hasAttribute = function (key) {
      return key in ctx.attributes;
    };

    ctx.setAttribute = function (key, value) {
      if (!(0, _mobiledocKitUtilsArrayUtils.contains)(VALID_ATTRIBUTES, key)) {
        throw new Error('Invalid attribute "' + key + '" was passed. Constrain attributes to the spec-compliant whitelist.');
      }
      ctx.attributes[key] = value;
    };
    ctx.removeAttribute = function (key) {
      delete ctx.attributes[key];
    };
    ctx.getAttribute = function (key) {
      return ctx.attributes[key];
    };
    ctx.eachAttribute = function (cb) {
      (0, _mobiledocKitUtilsObjectUtils.entries)(ctx.attributes).forEach(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2);

        var k = _ref2[0];
        var v = _ref2[1];
        return cb(k, v);
      });
    };
  }
});
define('mobiledoc-kit/models/_markerable', ['exports', 'mobiledoc-kit/utils/array-utils', 'mobiledoc-kit/utils/set', 'mobiledoc-kit/utils/linked-list', 'mobiledoc-kit/models/_section', 'mobiledoc-kit/utils/assert'], function (exports, _mobiledocKitUtilsArrayUtils, _mobiledocKitUtilsSet, _mobiledocKitUtilsLinkedList, _mobiledocKitModels_section, _mobiledocKitUtilsAssert) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x4, _x5, _x6) { var _again = true; _function: while (_again) { var object = _x4, property = _x5, receiver = _x6; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x4 = parent; _x5 = property; _x6 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

  function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var Markerable = (function (_Section) {
    _inherits(Markerable, _Section);

    function Markerable(type, tagName) {
      var _this = this;

      var markers = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];

      _classCallCheck(this, Markerable);

      _get(Object.getPrototypeOf(Markerable.prototype), 'constructor', this).call(this, type);
      this.isMarkerable = true;
      this.tagName = tagName;
      this.markers = new _mobiledocKitUtilsLinkedList['default']({
        adoptItem: function adoptItem(m) {
          (0, _mobiledocKitUtilsAssert['default'])('Can only insert markers and atoms into markerable (was: ' + m.type + ')', m.isMarker || m.isAtom);
          m.section = m.parent = _this;
        },
        freeItem: function freeItem(m) {
          return m.section = m.parent = null;
        }
      });

      markers.forEach(function (m) {
        return _this.markers.append(m);
      });
    }

    _createClass(Markerable, [{
      key: 'canJoin',
      value: function canJoin(other) {
        return other.isMarkerable && other.type === this.type && other.tagName === this.tagName;
      }
    }, {
      key: 'clone',
      value: function clone() {
        var newMarkers = this.markers.map(function (m) {
          return m.clone();
        });
        return this.builder.createMarkerableSection(this.type, this.tagName, newMarkers);
      }
    }, {
      key: 'textUntil',
      value: function textUntil(position) {
        (0, _mobiledocKitUtilsAssert['default'])('Cannot get textUntil for a position not in this section', position.section === this);
        var marker = position.marker;
        var offsetInMarker = position.offsetInMarker;

        var text = '';
        var currentMarker = this.markers.head;
        while (currentMarker) {
          if (currentMarker === marker) {
            text += currentMarker.textUntil(offsetInMarker);
            break;
          } else {
            text += currentMarker.text;
            currentMarker = currentMarker.next;
          }
        }
        return text;
      }

      /**
       * @param {Marker}
       * @param {Number} markerOffset The offset relative to the start of the marker
       *
       * @return {Number} The offset relative to the start of this section
       */
    }, {
      key: 'offsetOfMarker',
      value: function offsetOfMarker(marker) {
        var markerOffset = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

        (0, _mobiledocKitUtilsAssert['default'])('Cannot get offsetOfMarker for marker that is not child of this', marker.section === this);

        // FIXME it is possible, when we get a cursor position before having finished reparsing,
        // for markerOffset to be > marker.length. We shouldn't rely on this functionality.

        var offset = 0;
        var currentMarker = this.markers.head;
        while (currentMarker && currentMarker !== marker.next) {
          var _length = currentMarker === marker ? markerOffset : currentMarker.length;
          offset += _length;
          currentMarker = currentMarker.next;
        }

        return offset;
      }

      // puts clones of this.markers into beforeSection and afterSection,
      // all markers before the marker/offset split go in beforeSection, and all
      // after the marker/offset split go in afterSection
      // @return {Array} [beforeSection, afterSection], two new sections
    }, {
      key: '_redistributeMarkers',
      value: function _redistributeMarkers(beforeSection, afterSection, marker) {
        var offset = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];

        var currentSection = beforeSection;
        (0, _mobiledocKitUtilsArrayUtils.forEach)(this.markers, function (m) {
          if (m === marker) {
            var _marker$split = marker.split(offset);

            var _marker$split2 = _toArray(_marker$split);

            var beforeMarker = _marker$split2[0];

            var afterMarkers = _marker$split2.slice(1);

            beforeSection.markers.append(beforeMarker);
            (0, _mobiledocKitUtilsArrayUtils.forEach)(afterMarkers, function (_m) {
              return afterSection.markers.append(_m);
            });
            currentSection = afterSection;
          } else {
            currentSection.markers.append(m.clone());
          }
        });

        return [beforeSection, afterSection];
      }
    }, {
      key: 'splitAtMarker',
      value: function splitAtMarker() /*marker, offset=0*/{
        (0, _mobiledocKitUtilsAssert['default'])('splitAtMarker must be implemented by sub-class', false);
      }

      /**
       * Split this section's marker (if any) at the given offset, so that
       * there is now a marker boundary at that offset (useful for later applying
       * a markup to a range)
       * @param {Number} sectionOffset The offset relative to start of this section
       * @return {EditObject} An edit object with 'removed' and 'added' keys with arrays of Markers. The added markers may be blank.
       * After calling `splitMarkerAtOffset(offset)`, there will always be a valid
       * result returned from `markerBeforeOffset(offset)`.
       */
    }, {
      key: 'splitMarkerAtOffset',
      value: function splitMarkerAtOffset(sectionOffset) {
        (0, _mobiledocKitUtilsAssert['default'])('Cannot splitMarkerAtOffset when offset is > length', sectionOffset <= this.length);
        var markerOffset = undefined;
        var len = 0;
        var currentMarker = this.markers.head;
        var edit = { added: [], removed: [] };

        if (!currentMarker) {
          var blankMarker = this.builder.createMarker();
          this.markers.prepend(blankMarker);
          edit.added.push(blankMarker);
        } else {
          while (currentMarker) {
            len += currentMarker.length;
            if (len === sectionOffset) {
              // nothing to do, there is a gap at the requested offset
              break;
            } else if (len > sectionOffset) {
              var _edit$added;

              markerOffset = currentMarker.length - (len - sectionOffset);
              var newMarkers = currentMarker.splitAtOffset(markerOffset);
              (_edit$added = edit.added).push.apply(_edit$added, _toConsumableArray(newMarkers));
              edit.removed.push(currentMarker);
              this.markers.splice(currentMarker, 1, newMarkers);
              break;
            } else {
              currentMarker = currentMarker.next;
            }
          }
        }

        return edit;
      }
    }, {
      key: 'splitAtPosition',
      value: function splitAtPosition(position) {
        var marker = position.marker;
        var offsetInMarker = position.offsetInMarker;

        return this.splitAtMarker(marker, offsetInMarker);
      }

      // returns the marker just before this offset.
      // It is an error to call this method with an offset that is in the middle
      // of a marker.
    }, {
      key: 'markerBeforeOffset',
      value: function markerBeforeOffset(sectionOffset) {
        var len = 0;
        var currentMarker = this.markers.head;

        while (currentMarker) {
          len += currentMarker.length;
          if (len === sectionOffset) {
            return currentMarker;
          } else {
            (0, _mobiledocKitUtilsAssert['default'])('markerBeforeOffset called with sectionOffset not between markers', len < sectionOffset);
            currentMarker = currentMarker.next;
          }
        }
      }
    }, {
      key: 'markerPositionAtOffset',
      value: function markerPositionAtOffset(offset) {
        var currentOffset = 0;
        var currentMarker = undefined;
        var remaining = offset;
        this.markers.detect(function (marker) {
          currentOffset = Math.min(remaining, marker.length);
          remaining -= currentOffset;
          if (remaining === 0) {
            currentMarker = marker;
            return true; // break out of detect
          }
        });

        return { marker: currentMarker, offset: currentOffset };
      }
    }, {
      key: 'markersFor',

      /**
       * @return {Array} New markers that match the boundaries of the
       * range. Does not change the existing markers in this section.
       */
      value: function markersFor(headOffset, tailOffset) {
        var range = { head: { section: this, offset: headOffset },
          tail: { section: this, offset: tailOffset } };

        var markers = [];
        this._markersInRange(range, function (marker, _ref) {
          var markerHead = _ref.markerHead;
          var markerTail = _ref.markerTail;
          var isContained = _ref.isContained;

          var cloned = marker.clone();
          if (!isContained) {
            // cannot do marker.value.slice if the marker is an atom -- this breaks the atom's "atomic" value
            // If a marker is an atom `isContained` should always be true so
            // we shouldn't hit this code path. FIXME add tests
            cloned.value = marker.value.slice(markerHead, markerTail);
          }
          markers.push(cloned);
        });
        return markers;
      }
    }, {
      key: 'markupsInRange',
      value: function markupsInRange(range) {
        var markups = new _mobiledocKitUtilsSet['default']();
        this._markersInRange(range, function (marker) {
          marker.markups.forEach(function (m) {
            return markups.add(m);
          });
        });
        return markups.toArray();
      }

      // calls the callback with (marker, {markerHead, markerTail, isContained})
      // for each marker that is wholly or partially contained in the range.
    }, {
      key: '_markersInRange',
      value: function _markersInRange(range, callback) {
        var head = range.head;
        var tail = range.tail;

        (0, _mobiledocKitUtilsAssert['default'])('Cannot call #_markersInRange if range expands beyond this section', head.section === this && tail.section === this);
        var headOffset = head.offset;var tailOffset = tail.offset;

        var currentHead = 0,
            currentTail = 0,
            currentMarker = this.markers.head;

        while (currentMarker) {
          currentTail += currentMarker.length;

          if (currentTail > headOffset && currentHead < tailOffset) {
            var markerHead = Math.max(headOffset - currentHead, 0);
            var markerTail = currentMarker.length - Math.max(currentTail - tailOffset, 0);
            var isContained = markerHead === 0 && markerTail === currentMarker.length;

            callback(currentMarker, { markerHead: markerHead, markerTail: markerTail, isContained: isContained });
          }

          currentHead += currentMarker.length;
          currentMarker = currentMarker.next;

          if (currentHead > tailOffset) {
            break;
          }
        }
      }

      // mutates this by appending the other section's (cloned) markers to it
    }, {
      key: 'join',
      value: function join(otherSection) {
        var _this2 = this;

        var beforeMarker = this.markers.tail;
        var afterMarker = null;

        otherSection.markers.forEach(function (m) {
          if (!m.isBlank) {
            m = m.clone();
            _this2.markers.append(m);
            if (!afterMarker) {
              afterMarker = m;
            }
          }
        });

        return { beforeMarker: beforeMarker, afterMarker: afterMarker };
      }
    }, {
      key: 'isBlank',
      get: function get() {
        if (!this.markers.length) {
          return true;
        }
        return this.markers.every(function (m) {
          return m.isBlank;
        });
      }
    }, {
      key: 'text',
      get: function get() {
        return (0, _mobiledocKitUtilsArrayUtils.reduce)(this.markers, function (prev, m) {
          return prev + m.value;
        }, '');
      }
    }, {
      key: 'length',
      get: function get() {
        return (0, _mobiledocKitUtilsArrayUtils.reduce)(this.markers, function (prev, m) {
          return prev + m.length;
        }, 0);
      }
    }]);

    return Markerable;
  })(_mobiledocKitModels_section['default']);

  exports['default'] = Markerable;
});
define('mobiledoc-kit/models/_section', ['exports', 'mobiledoc-kit/utils/dom-utils', 'mobiledoc-kit/utils/linked-item', 'mobiledoc-kit/utils/assert', 'mobiledoc-kit/utils/cursor/position'], function (exports, _mobiledocKitUtilsDomUtils, _mobiledocKitUtilsLinkedItem, _mobiledocKitUtilsAssert, _mobiledocKitUtilsCursorPosition) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  function unimplementedMethod(methodName, me) {
    (0, _mobiledocKitUtilsAssert['default'])('`' + methodName + '()` must be implemented by ' + me.constructor.name, false);
  }

  var Section = (function (_LinkedItem) {
    _inherits(Section, _LinkedItem);

    function Section(type) {
      _classCallCheck(this, Section);

      _get(Object.getPrototypeOf(Section.prototype), 'constructor', this).call(this);
      (0, _mobiledocKitUtilsAssert['default'])('Cannot create section without type', !!type);
      this.type = type;
      this.isSection = true;
      this.isMarkerable = false;
      this.isNested = false;
      this.isSection = true;
      this.isLeafSection = true;
    }

    _createClass(Section, [{
      key: 'isValidTagName',
      value: function isValidTagName() /* normalizedTagName */{
        unimplementedMethod('isValidTagName', this);
      }
    }, {
      key: 'clone',
      value: function clone() {
        unimplementedMethod('clone', this);
      }
    }, {
      key: 'canJoin',
      value: function canJoin() /* otherSection */{
        unimplementedMethod('canJoin', this);
      }

      /**
       * @return {Position} The position at the start of this section
       * @public
       */
    }, {
      key: 'headPosition',
      value: function headPosition() {
        return this.toPosition(0);
      }

      /**
       * @return {Position} The position at the end of this section
       * @public
       */
    }, {
      key: 'tailPosition',
      value: function tailPosition() {
        return this.toPosition(this.length);
      }

      /**
       * @param {Number} offset
       * @return {Position} The position in this section at the given offset
       * @public
       */
    }, {
      key: 'toPosition',
      value: function toPosition(offset) {
        (0, _mobiledocKitUtilsAssert['default'])("Must pass number to `toPosition`", typeof offset === 'number');
        (0, _mobiledocKitUtilsAssert['default'])("Cannot call `toPosition` with offset > length", offset <= this.length);

        return new _mobiledocKitUtilsCursorPosition['default'](this, offset);
      }

      /**
       * @return {Range} A range from this section's head to tail positions
       * @public
       */
    }, {
      key: 'toRange',
      value: function toRange() {
        return this.headPosition().toRange(this.tailPosition());
      }
    }, {
      key: 'join',
      value: function join() {
        unimplementedMethod('join', this);
      }
    }, {
      key: 'textUntil',
      value: function textUntil() /* position */{
        return '';
      }

      /**
       * Markerable sections should override this method
       */
    }, {
      key: 'splitMarkerAtOffset',
      value: function splitMarkerAtOffset() {
        var blankEdit = { added: [], removed: [] };
        return blankEdit;
      }
    }, {
      key: 'nextLeafSection',
      value: function nextLeafSection() {
        var next = this.next;
        if (next) {
          if (next.items) {
            return next.items.head;
          } else {
            return next;
          }
        } else {
          if (this.isNested) {
            return this.parent.nextLeafSection();
          }
        }
      }
    }, {
      key: 'immediatelyNextMarkerableSection',
      value: function immediatelyNextMarkerableSection() {
        var next = this.nextLeafSection();
        while (next && !next.isMarkerable) {
          next = next.nextLeafSection();
        }
        return next;
      }
    }, {
      key: 'previousLeafSection',
      value: function previousLeafSection() {
        var prev = this.prev;

        if (prev) {
          if (prev.items) {
            return prev.items.tail;
          } else {
            return prev;
          }
        } else {
          if (this.isNested) {
            return this.parent.previousLeafSection();
          }
        }
      }
    }, {
      key: 'tagName',
      set: function set(val) {
        var normalizedTagName = (0, _mobiledocKitUtilsDomUtils.normalizeTagName)(val);
        (0, _mobiledocKitUtilsAssert['default'])('Cannot set section tagName to ' + val, this.isValidTagName(normalizedTagName));
        this._tagName = normalizedTagName;
      },
      get: function get() {
        return this._tagName;
      }
    }, {
      key: 'length',
      get: function get() {
        return 0;
      }
    }, {
      key: 'isBlank',
      get: function get() {
        unimplementedMethod('isBlank', this);
      }
    }]);

    return Section;
  })(_mobiledocKitUtilsLinkedItem['default']);

  exports['default'] = Section;
});
define('mobiledoc-kit/models/atom-node', ['exports', 'mobiledoc-kit/utils/assert'], function (exports, _mobiledocKitUtilsAssert) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var AtomNode = (function () {
    function AtomNode(editor, atom, model, element, atomOptions) {
      _classCallCheck(this, AtomNode);

      this.editor = editor;
      this.atom = atom;
      this.model = model;
      this.atomOptions = atomOptions;
      this.element = element;

      this._teardownCallback = null;
      this._rendered = null;
    }

    _createClass(AtomNode, [{
      key: 'render',
      value: function render() {
        if (!this._rendered) {
          var options = this.atomOptions;
          var env = this.env;
          var _model = this.model;
          var value = _model.value;
          var payload = _model.payload;

          // cache initial render
          this._rendered = this.atom.render({ options: options, env: env, value: value, payload: payload });
        }

        this._validateAndAppendRenderResult(this._rendered);
      }
    }, {
      key: 'teardown',
      value: function teardown() {
        if (this._teardownCallback) {
          this._teardownCallback();
          this._teardownCallback = null;
        }
        if (this._rendered) {
          this.element.removeChild(this._rendered);
          this._rendered = null;
        }
      }
    }, {
      key: '_validateAndAppendRenderResult',
      value: function _validateAndAppendRenderResult(rendered) {
        if (!rendered) {
          return;
        }

        var name = this.atom.name;

        (0, _mobiledocKitUtilsAssert['default'])('Atom "' + name + '" must return a DOM node (returned value was: "' + rendered + '")', !!rendered.nodeType);
        this.element.appendChild(rendered);
      }
    }, {
      key: 'env',
      get: function get() {
        var _this = this;

        return {
          name: this.atom.name,
          onTeardown: function onTeardown(callback) {
            return _this._teardownCallback = callback;
          },
          save: function save(value) {
            var payload = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

            _this.model.value = value;
            _this.model.payload = payload;

            _this.editor._postDidChange();
            _this.teardown();
            _this.render();
          }
        };
      }
    }]);

    return AtomNode;
  })();

  exports['default'] = AtomNode;
});
define('mobiledoc-kit/models/atom', ['exports', 'mobiledoc-kit/models/types', 'mobiledoc-kit/utils/mixin', 'mobiledoc-kit/utils/markuperable', 'mobiledoc-kit/utils/linked-item', 'mobiledoc-kit/utils/assert'], function (exports, _mobiledocKitModelsTypes, _mobiledocKitUtilsMixin, _mobiledocKitUtilsMarkuperable, _mobiledocKitUtilsLinkedItem, _mobiledocKitUtilsAssert) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x4, _x5, _x6) { var _again = true; _function: while (_again) { var object = _x4, property = _x5, receiver = _x6; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x4 = parent; _x5 = property; _x6 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var ATOM_LENGTH = 1;

  var Atom = (function (_LinkedItem) {
    _inherits(Atom, _LinkedItem);

    function Atom(name, value, payload) {
      var _this = this;

      var markups = arguments.length <= 3 || arguments[3] === undefined ? [] : arguments[3];

      _classCallCheck(this, Atom);

      _get(Object.getPrototypeOf(Atom.prototype), 'constructor', this).call(this);
      this.name = name;
      this.value = value;
      this.text = ''; // An atom never has text, but it does have a value
      (0, _mobiledocKitUtilsAssert['default'])('Atom must have value', value !== undefined && value !== null);
      this.payload = payload;
      this.type = _mobiledocKitModelsTypes.ATOM_TYPE;
      this.isMarker = false;
      this.isAtom = true;

      this.markups = [];
      markups.forEach(function (m) {
        return _this.addMarkup(m);
      });
    }

    _createClass(Atom, [{
      key: 'clone',
      value: function clone() {
        var clonedMarkups = this.markups.slice();
        return this.builder.createAtom(this.name, this.value, this.payload, clonedMarkups);
      }
    }, {
      key: 'canJoin',
      value: function canJoin() /* other */{
        return false;
      }
    }, {
      key: 'textUntil',
      value: function textUntil() /* offset */{
        return '';
      }
    }, {
      key: 'split',
      value: function split() {
        var offset = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
        var endOffset = arguments.length <= 1 || arguments[1] === undefined ? offset : arguments[1];
        return (function () {
          var markers = [];

          if (endOffset === 0) {
            markers.push(this.builder.createMarker('', this.markups.slice()));
          }

          markers.push(this.clone());

          if (offset === ATOM_LENGTH) {
            markers.push(this.builder.createMarker('', this.markups.slice()));
          }

          return markers;
        }).apply(this, arguments);
      }
    }, {
      key: 'splitAtOffset',
      value: function splitAtOffset(offset) {
        (0, _mobiledocKitUtilsAssert['default'])('Cannot split a marker at an offset > its length', offset <= this.length);

        var builder = this.builder;

        var clone = this.clone();
        var blankMarker = builder.createMarker('');
        var pre = undefined,
            post = undefined;

        if (offset === 0) {
          pre = blankMarker;
          post = clone;
        } else if (offset === ATOM_LENGTH) {
          pre = clone;
          post = blankMarker;
        } else {
          (0, _mobiledocKitUtilsAssert['default'])('Invalid offset given to Atom#splitAtOffset: "' + offset + '"', false);
        }

        this.markups.forEach(function (markup) {
          pre.addMarkup(markup);
          post.addMarkup(markup);
        });
        return [pre, post];
      }
    }, {
      key: 'isBlank',
      get: function get() {
        return false;
      }
    }, {
      key: 'length',
      get: function get() {
        return ATOM_LENGTH;
      }
    }]);

    return Atom;
  })(_mobiledocKitUtilsLinkedItem['default']);

  (0, _mobiledocKitUtilsMixin['default'])(Atom, _mobiledocKitUtilsMarkuperable['default']);

  exports['default'] = Atom;
});
define('mobiledoc-kit/models/card-node', ['exports', 'mobiledoc-kit/utils/assert'], function (exports, _mobiledocKitUtilsAssert) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var CardNode = (function () {
    function CardNode(editor, card, section, element, options) {
      _classCallCheck(this, CardNode);

      this.editor = editor;
      this.card = card;
      this.section = section;
      this.element = element;
      this.options = options;

      this.mode = null;

      this._teardownCallback = null;
      this._rendered = null;
    }

    _createClass(CardNode, [{
      key: 'render',
      value: function render(mode) {
        if (this.mode === mode) {
          return;
        }

        this.teardown();

        this.mode = mode;

        var method = mode === 'display' ? 'render' : 'edit';
        method = this.card[method];

        (0, _mobiledocKitUtilsAssert['default'])('Card is missing "' + method + '" (tried to render mode: "' + mode + '")', !!method);
        var rendered = method({
          env: this.env,
          options: this.options,
          payload: this.section.payload
        });

        this._validateAndAppendRenderResult(rendered);
      }
    }, {
      key: 'teardown',
      value: function teardown() {
        if (this._teardownCallback) {
          this._teardownCallback();
          this._teardownCallback = null;
        }
        if (this._rendered) {
          this.element.removeChild(this._rendered);
          this._rendered = null;
        }
      }
    }, {
      key: 'didRender',
      value: function didRender() {
        if (this._didRenderCallback) {
          this._didRenderCallback();
        }
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
      key: 'remove',
      value: function remove() {
        var _this = this;

        this.editor.run(function (postEditor) {
          return postEditor.removeSection(_this.section);
        });
      }
    }, {
      key: '_validateAndAppendRenderResult',
      value: function _validateAndAppendRenderResult(rendered) {
        if (!rendered) {
          return;
        }

        var name = this.card.name;

        (0, _mobiledocKitUtilsAssert['default'])('Card "' + name + '" must render dom (render value was: "' + rendered + '")', !!rendered.nodeType);
        this.element.appendChild(rendered);
        this._rendered = rendered;
        this.didRender();
      }
    }, {
      key: 'env',
      get: function get() {
        var _this2 = this;

        return {
          name: this.card.name,
          isInEditor: true,
          onTeardown: function onTeardown(callback) {
            return _this2._teardownCallback = callback;
          },
          didRender: function didRender(callback) {
            return _this2._didRenderCallback = callback;
          },
          edit: function edit() {
            return _this2.edit();
          },
          save: function save(payload) {
            var transition = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

            _this2.section.payload = payload;

            _this2.editor._postDidChange();
            if (transition) {
              _this2.display();
            }
          },
          cancel: function cancel() {
            return _this2.display();
          },
          remove: function remove() {
            return _this2.remove();
          },
          postModel: this.section
        };
      }
    }]);

    return CardNode;
  })();

  exports['default'] = CardNode;
});
define('mobiledoc-kit/models/card', ['exports', 'mobiledoc-kit/models/_section', 'mobiledoc-kit/models/types', 'mobiledoc-kit/utils/copy'], function (exports, _mobiledocKitModels_section, _mobiledocKitModelsTypes, _mobiledocKitUtilsCopy) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var CARD_MODES = {
    DISPLAY: 'display',
    EDIT: 'edit'
  };

  exports.CARD_MODES = CARD_MODES;
  var CARD_LENGTH = 1;

  var DEFAULT_INITIAL_MODE = CARD_MODES.DISPLAY;

  var Card = (function (_Section) {
    _inherits(Card, _Section);

    function Card(name, payload) {
      _classCallCheck(this, Card);

      _get(Object.getPrototypeOf(Card.prototype), 'constructor', this).call(this, _mobiledocKitModelsTypes.CARD_TYPE);
      this.name = name;
      this.payload = payload;
      this.setInitialMode(DEFAULT_INITIAL_MODE);
      this.isCardSection = true;
    }

    _createClass(Card, [{
      key: 'canJoin',
      value: function canJoin() {
        return false;
      }
    }, {
      key: 'clone',
      value: function clone() {
        var payload = (0, _mobiledocKitUtilsCopy.shallowCopyObject)(this.payload);
        var card = this.builder.createCardSection(this.name, payload);
        // If this card is currently rendered, clone the mode it is
        // currently in as the default mode of the new card.
        var mode = this._initialMode;
        if (this.renderNode && this.renderNode.cardNode) {
          mode = this.renderNode.cardNode.mode;
        }
        card.setInitialMode(mode);
        return card;
      }

      /**
       * set the mode that this will be rendered into initially
       * @private
       */
    }, {
      key: 'setInitialMode',
      value: function setInitialMode(initialMode) {
        // TODO validate initialMode
        this._initialMode = initialMode;
      }
    }, {
      key: 'isBlank',
      get: function get() {
        return false;
      }
    }, {
      key: 'length',
      get: function get() {
        return CARD_LENGTH;
      }
    }]);

    return Card;
  })(_mobiledocKitModels_section['default']);

  exports['default'] = Card;
});
define('mobiledoc-kit/models/image', ['exports', 'mobiledoc-kit/models/types', 'mobiledoc-kit/models/_section'], function (exports, _mobiledocKitModelsTypes, _mobiledocKitModels_section) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var Image = (function (_Section) {
    _inherits(Image, _Section);

    function Image() {
      _classCallCheck(this, Image);

      _get(Object.getPrototypeOf(Image.prototype), 'constructor', this).call(this, _mobiledocKitModelsTypes.IMAGE_SECTION_TYPE);
      this.src = null;
    }

    _createClass(Image, [{
      key: 'canJoin',
      value: function canJoin() {
        return false;
      }
    }, {
      key: 'isBlank',
      get: function get() {
        return false;
      }
    }, {
      key: 'length',
      get: function get() {
        return 1;
      }
    }]);

    return Image;
  })(_mobiledocKitModels_section['default']);

  exports['default'] = Image;
});
define('mobiledoc-kit/models/lifecycle-callbacks', ['exports', 'mobiledoc-kit/utils/assert'], function (exports, _mobiledocKitUtilsAssert) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var LifecycleCallbacks = (function () {
    function LifecycleCallbacks() {
      var _this = this;

      var queueNames = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

      _classCallCheck(this, LifecycleCallbacks);

      this.callbackQueues = {};
      this.removalQueues = {};

      queueNames.forEach(function (name) {
        _this.callbackQueues[name] = [];
        _this.removalQueues[name] = [];
      });
    }

    _createClass(LifecycleCallbacks, [{
      key: 'runCallbacks',
      value: function runCallbacks(queueName) {
        var args = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

        var queue = this._getQueue(queueName);
        queue.forEach(function (cb) {
          return cb.apply(undefined, _toConsumableArray(args));
        });

        var toRemove = this.removalQueues[queueName];
        toRemove.forEach(function (cb) {
          var index = queue.indexOf(cb);
          if (index !== -1) {
            queue.splice(index, 1);
          }
        });

        this.removalQueues[queueName] = [];
      }
    }, {
      key: 'addCallback',
      value: function addCallback(queueName, callback) {
        this._getQueue(queueName).push(callback);
      }
    }, {
      key: '_scheduleCallbackForRemoval',
      value: function _scheduleCallbackForRemoval(queueName, callback) {
        this.removalQueues[queueName].push(callback);
      }
    }, {
      key: 'addCallbackOnce',
      value: function addCallbackOnce(queueName, callback) {
        var queue = this._getQueue(queueName);
        if (queue.indexOf(callback) === -1) {
          queue.push(callback);
          this._scheduleCallbackForRemoval(queueName, callback);
        }
      }
    }, {
      key: '_getQueue',
      value: function _getQueue(queueName) {
        var queue = this.callbackQueues[queueName];
        (0, _mobiledocKitUtilsAssert['default'])('No queue found for "' + queueName + '"', !!queue);
        return queue;
      }
    }]);

    return LifecycleCallbacks;
  })();

  exports['default'] = LifecycleCallbacks;
});
define('mobiledoc-kit/models/list-item', ['exports', 'mobiledoc-kit/models/_markerable', 'mobiledoc-kit/models/types', 'mobiledoc-kit/utils/dom-utils', 'mobiledoc-kit/utils/array-utils'], function (exports, _mobiledocKitModels_markerable, _mobiledocKitModelsTypes, _mobiledocKitUtilsDomUtils, _mobiledocKitUtilsArrayUtils) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var VALID_LIST_ITEM_TAGNAMES = ['li'].map(_mobiledocKitUtilsDomUtils.normalizeTagName);

  exports.VALID_LIST_ITEM_TAGNAMES = VALID_LIST_ITEM_TAGNAMES;

  var ListItem = (function (_Markerable) {
    _inherits(ListItem, _Markerable);

    function ListItem(tagName) {
      var markers = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

      _classCallCheck(this, ListItem);

      _get(Object.getPrototypeOf(ListItem.prototype), 'constructor', this).call(this, _mobiledocKitModelsTypes.LIST_ITEM_TYPE, tagName, markers);
      this.isListItem = true;
      this.isNested = true;
    }

    _createClass(ListItem, [{
      key: 'isValidTagName',
      value: function isValidTagName(normalizedTagName) {
        return (0, _mobiledocKitUtilsArrayUtils.contains)(VALID_LIST_ITEM_TAGNAMES, normalizedTagName);
      }
    }, {
      key: 'splitAtMarker',
      value: function splitAtMarker(marker) {
        var offset = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

        // FIXME need to check if we are going to split into two list items
        // or a list item and a new markup section:
        var isLastItem = !this.next;
        var createNewSection = !marker && offset === 0 && isLastItem;

        var beforeSection = this.builder.createListItem();
        var afterSection = createNewSection ? this.builder.createMarkupSection() : this.builder.createListItem();

        return this._redistributeMarkers(beforeSection, afterSection, marker, offset);
      }
    }, {
      key: 'post',
      get: function get() {
        return this.section.post;
      }
    }]);

    return ListItem;
  })(_mobiledocKitModels_markerable['default']);

  exports['default'] = ListItem;
});
define('mobiledoc-kit/models/list-section', ['exports', 'mobiledoc-kit/models/types', 'mobiledoc-kit/models/_section', 'mobiledoc-kit/models/_attributable', 'mobiledoc-kit/utils/linked-list', 'mobiledoc-kit/utils/array-utils', 'mobiledoc-kit/utils/dom-utils', 'mobiledoc-kit/utils/assert', 'mobiledoc-kit/utils/object-utils'], function (exports, _mobiledocKitModelsTypes, _mobiledocKitModels_section, _mobiledocKitModels_attributable, _mobiledocKitUtilsLinkedList, _mobiledocKitUtilsArrayUtils, _mobiledocKitUtilsDomUtils, _mobiledocKitUtilsAssert, _mobiledocKitUtilsObjectUtils) {
  'use strict';

  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x4, _x5, _x6) { var _again = true; _function: while (_again) { var object = _x4, property = _x5, receiver = _x6; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x4 = parent; _x5 = property; _x6 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var VALID_LIST_SECTION_TAGNAMES = ['ul', 'ol'].map(_mobiledocKitUtilsDomUtils.normalizeTagName);

  exports.VALID_LIST_SECTION_TAGNAMES = VALID_LIST_SECTION_TAGNAMES;
  var DEFAULT_TAG_NAME = VALID_LIST_SECTION_TAGNAMES[0];

  exports.DEFAULT_TAG_NAME = DEFAULT_TAG_NAME;

  var ListSection = (function (_Section) {
    _inherits(ListSection, _Section);

    function ListSection() {
      var tagName = arguments.length <= 0 || arguments[0] === undefined ? DEFAULT_TAG_NAME : arguments[0];

      var _this = this;

      var items = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
      var attributes = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      _classCallCheck(this, ListSection);

      _get(Object.getPrototypeOf(ListSection.prototype), 'constructor', this).call(this, _mobiledocKitModelsTypes.LIST_SECTION_TYPE);
      this.tagName = tagName;
      this.isListSection = true;
      this.isLeafSection = false;

      (0, _mobiledocKitModels_attributable.attributable)(this);
      (0, _mobiledocKitUtilsObjectUtils.entries)(attributes).forEach(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2);

        var k = _ref2[0];
        var v = _ref2[1];
        return _this.setAttribute(k, v);
      });

      this.items = new _mobiledocKitUtilsLinkedList['default']({
        adoptItem: function adoptItem(i) {
          (0, _mobiledocKitUtilsAssert['default'])('Cannot insert non-list-item to list (is: ' + i.type + ')', i.isListItem);
          i.section = i.parent = _this;
        },
        freeItem: function freeItem(i) {
          return i.section = i.parent = null;
        }
      });
      this.sections = this.items;

      items.forEach(function (i) {
        return _this.items.append(i);
      });
    }

    _createClass(ListSection, [{
      key: 'canJoin',
      value: function canJoin() {
        return false;
      }
    }, {
      key: 'isValidTagName',
      value: function isValidTagName(normalizedTagName) {
        return (0, _mobiledocKitUtilsArrayUtils.contains)(VALID_LIST_SECTION_TAGNAMES, normalizedTagName);
      }
    }, {
      key: 'headPosition',
      value: function headPosition() {
        return this.items.head.headPosition();
      }
    }, {
      key: 'tailPosition',
      value: function tailPosition() {
        return this.items.tail.tailPosition();
      }
    }, {
      key: 'clone',
      value: function clone() {
        var newSection = this.builder.createListSection(this.tagName);
        (0, _mobiledocKitUtilsArrayUtils.forEach)(this.items, function (i) {
          return newSection.items.append(i.clone());
        });
        return newSection;
      }

      /**
       * Mutates this list
       * @param {ListSection|Markerable}
       * @return null
       */
    }, {
      key: 'join',
      value: function join(other) {
        var _this2 = this;

        if (other.isListSection) {
          other.items.forEach(function (i) {
            return _this2.join(i);
          });
        } else if (other.isMarkerable) {
          var item = this.builder.createListItem();
          item.join(other);
          this.items.append(item);
        }
      }
    }, {
      key: 'isBlank',
      get: function get() {
        return this.items.isEmpty;
      }
    }]);

    return ListSection;
  })(_mobiledocKitModels_section['default']);

  exports['default'] = ListSection;
});
define('mobiledoc-kit/models/marker', ['exports', 'mobiledoc-kit/models/types', 'mobiledoc-kit/utils/mixin', 'mobiledoc-kit/utils/markuperable', 'mobiledoc-kit/utils/linked-item', 'mobiledoc-kit/utils/assert', 'mobiledoc-kit/utils/array-utils'], function (exports, _mobiledocKitModelsTypes, _mobiledocKitUtilsMixin, _mobiledocKitUtilsMarkuperable, _mobiledocKitUtilsLinkedItem, _mobiledocKitUtilsAssert, _mobiledocKitUtilsArrayUtils) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x5, _x6, _x7) { var _again = true; _function: while (_again) { var object = _x5, property = _x6, receiver = _x7; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x5 = parent; _x6 = property; _x7 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  // Unicode uses a pair of "surrogate" characters" (a high- and low-surrogate)
  // to encode characters outside the basic multilingual plane (like emoji and
  // some languages).
  // These values are the unicode code points for the start and end of the
  // high- and low-surrogate characters.
  // See "high surrogate" and "low surrogate" on
  // https://en.wikipedia.org/wiki/Unicode_block
  var HIGH_SURROGATE_RANGE = [0xD800, 0xDBFF];
  exports.HIGH_SURROGATE_RANGE = HIGH_SURROGATE_RANGE;
  var LOW_SURROGATE_RANGE = [0xDC00, 0xDFFF];

  exports.LOW_SURROGATE_RANGE = LOW_SURROGATE_RANGE;
  var Marker = (function (_LinkedItem) {
    _inherits(Marker, _LinkedItem);

    function Marker() {
      var _this = this;

      var value = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
      var markups = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

      _classCallCheck(this, Marker);

      _get(Object.getPrototypeOf(Marker.prototype), 'constructor', this).call(this);
      this.value = value;
      (0, _mobiledocKitUtilsAssert['default'])('Marker must have value', value !== undefined && value !== null);
      this.markups = [];
      this.type = _mobiledocKitModelsTypes.MARKER_TYPE;
      this.isMarker = true;
      this.isAtom = false;
      markups.forEach(function (m) {
        return _this.addMarkup(m);
      });
    }

    _createClass(Marker, [{
      key: 'clone',
      value: function clone() {
        var clonedMarkups = this.markups.slice();
        return this.builder.createMarker(this.value, clonedMarkups);
      }
    }, {
      key: 'charAt',
      value: function charAt(offset) {
        return this.value.slice(offset, offset + 1);
      }

      /**
       * A marker's text is equal to its value.
       * Compare with an Atom which distinguishes between text and value
       */
    }, {
      key: 'deleteValueAtOffset',

      // delete the character at this offset,
      // update the value with the new value
      value: function deleteValueAtOffset(offset) {
        (0, _mobiledocKitUtilsAssert['default'])('Cannot delete value at offset outside bounds', offset >= 0 && offset <= this.length);

        var width = 1;
        var code = this.value.charCodeAt(offset);
        if (code >= HIGH_SURROGATE_RANGE[0] && code <= HIGH_SURROGATE_RANGE[1]) {
          width = 2;
        } else if (code >= LOW_SURROGATE_RANGE[0] && code <= LOW_SURROGATE_RANGE[1]) {
          width = 2;
          offset = offset - 1;
        }

        var left = this.value.slice(0, offset);
        var right = this.value.slice(offset + width);

        this.value = left + right;

        return width;
      }
    }, {
      key: 'canJoin',
      value: function canJoin(other) {
        return other && other.isMarker && (0, _mobiledocKitUtilsArrayUtils.isArrayEqual)(this.markups, other.markups);
      }
    }, {
      key: 'textUntil',
      value: function textUntil(offset) {
        return this.value.slice(0, offset);
      }
    }, {
      key: 'split',
      value: function split() {
        var offset = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
        var endOffset = arguments.length <= 1 || arguments[1] === undefined ? this.length : arguments[1];

        var markers = [this.builder.createMarker(this.value.substring(0, offset)), this.builder.createMarker(this.value.substring(offset, endOffset)), this.builder.createMarker(this.value.substring(endOffset))];

        this.markups.forEach(function (mu) {
          return markers.forEach(function (m) {
            return m.addMarkup(mu);
          });
        });
        return markers;
      }

      /**
       * @return {Array} 2 markers either or both of which could be blank
       */
    }, {
      key: 'splitAtOffset',
      value: function splitAtOffset(offset) {
        (0, _mobiledocKitUtilsAssert['default'])('Cannot split a marker at an offset > its length', offset <= this.length);
        var value = this.value;
        var builder = this.builder;

        var pre = builder.createMarker(value.substring(0, offset));
        var post = builder.createMarker(value.substring(offset));

        this.markups.forEach(function (markup) {
          pre.addMarkup(markup);
          post.addMarkup(markup);
        });

        return [pre, post];
      }
    }, {
      key: 'isEmpty',
      get: function get() {
        return this.isBlank;
      }
    }, {
      key: 'isBlank',
      get: function get() {
        return this.length === 0;
      }
    }, {
      key: 'text',
      get: function get() {
        return this.value;
      }
    }, {
      key: 'length',
      get: function get() {
        return this.value.length;
      }
    }]);

    return Marker;
  })(_mobiledocKitUtilsLinkedItem['default']);

  (0, _mobiledocKitUtilsMixin['default'])(Marker, _mobiledocKitUtilsMarkuperable['default']);

  exports['default'] = Marker;
});
define('mobiledoc-kit/models/markup-section', ['exports', 'mobiledoc-kit/models/_markerable', 'mobiledoc-kit/models/_attributable', 'mobiledoc-kit/models/types', 'mobiledoc-kit/utils/dom-utils', 'mobiledoc-kit/utils/array-utils', 'mobiledoc-kit/utils/object-utils'], function (exports, _mobiledocKitModels_markerable, _mobiledocKitModels_attributable, _mobiledocKitModelsTypes, _mobiledocKitUtilsDomUtils, _mobiledocKitUtilsArrayUtils, _mobiledocKitUtilsObjectUtils) {
  'use strict';

  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x5, _x6, _x7) { var _again = true; _function: while (_again) { var object = _x5, property = _x6, receiver = _x7; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x5 = parent; _x6 = property; _x7 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  // valid values of `tagName` for a MarkupSection
  var VALID_MARKUP_SECTION_TAGNAMES = ['aside', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'].map(_mobiledocKitUtilsDomUtils.normalizeTagName);

  exports.VALID_MARKUP_SECTION_TAGNAMES = VALID_MARKUP_SECTION_TAGNAMES;
  // valid element names for a MarkupSection. A MarkupSection with a tagName
  // not in this will be rendered as a div with a className matching the
  // tagName
  var MARKUP_SECTION_ELEMENT_NAMES = ['aside', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'].map(_mobiledocKitUtilsDomUtils.normalizeTagName);
  exports.MARKUP_SECTION_ELEMENT_NAMES = MARKUP_SECTION_ELEMENT_NAMES;
  var DEFAULT_TAG_NAME = VALID_MARKUP_SECTION_TAGNAMES[8];

  exports.DEFAULT_TAG_NAME = DEFAULT_TAG_NAME;
  var MarkupSection = (function (_Markerable) {
    _inherits(MarkupSection, _Markerable);

    function MarkupSection() {
      var tagName = arguments.length <= 0 || arguments[0] === undefined ? DEFAULT_TAG_NAME : arguments[0];

      var _this = this;

      var markers = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
      var attributes = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      _classCallCheck(this, MarkupSection);

      _get(Object.getPrototypeOf(MarkupSection.prototype), 'constructor', this).call(this, _mobiledocKitModelsTypes.MARKUP_SECTION_TYPE, tagName, markers);

      (0, _mobiledocKitModels_attributable.attributable)(this);
      (0, _mobiledocKitUtilsObjectUtils.entries)(attributes).forEach(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2);

        var k = _ref2[0];
        var v = _ref2[1];
        return _this.setAttribute(k, v);
      });

      this.isMarkupSection = true;
    }

    _createClass(MarkupSection, [{
      key: 'isValidTagName',
      value: function isValidTagName(normalizedTagName) {
        return (0, _mobiledocKitUtilsArrayUtils.contains)(VALID_MARKUP_SECTION_TAGNAMES, normalizedTagName);
      }
    }, {
      key: 'splitAtMarker',
      value: function splitAtMarker(marker) {
        var offset = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
        var beforeSection = this.builder.createMarkupSection(this.tagName, [], false, this.attributes);
        var afterSection = this.builder.createMarkupSection();

        return this._redistributeMarkers(beforeSection, afterSection, marker, offset);
      }
    }]);

    return MarkupSection;
  })(_mobiledocKitModels_markerable['default']);

  exports['default'] = MarkupSection;
});
define('mobiledoc-kit/models/markup', ['exports', 'mobiledoc-kit/utils/dom-utils', 'mobiledoc-kit/utils/array-utils', 'mobiledoc-kit/models/types', 'mobiledoc-kit/utils/assert'], function (exports, _mobiledocKitUtilsDomUtils, _mobiledocKitUtilsArrayUtils, _mobiledocKitModelsTypes, _mobiledocKitUtilsAssert) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var VALID_MARKUP_TAGNAMES = ['a', 'b', 'code', 'em', 'i', 's', // strikethrough
  'strong', 'sub', // subscript
  'sup', // superscript
  'u'].map(_mobiledocKitUtilsDomUtils.normalizeTagName);

  exports.VALID_MARKUP_TAGNAMES = VALID_MARKUP_TAGNAMES;
  var VALID_ATTRIBUTES = ['href', 'rel'];

  exports.VALID_ATTRIBUTES = VALID_ATTRIBUTES;
  /**
   * A Markup is similar with an inline HTML tag that might be added to
   * text to modify its meaning and/or display. Examples of types of markup
   * that could be added are bold ('b'), italic ('i'), strikethrough ('s'), and `a` tags (links).
   * @property {String} tagName
   */

  var Markup = (function () {
    /*
     * @param {Object} attributes key-values
     */

    function Markup(tagName) {
      var attributes = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      _classCallCheck(this, Markup);

      this.tagName = (0, _mobiledocKitUtilsDomUtils.normalizeTagName)(tagName);

      (0, _mobiledocKitUtilsAssert['default'])('Must use attributes object param (not array) for Markup', !Array.isArray(attributes));

      this.attributes = (0, _mobiledocKitUtilsArrayUtils.filterObject)(attributes, VALID_ATTRIBUTES);
      this.type = _mobiledocKitModelsTypes.MARKUP_TYPE;

      (0, _mobiledocKitUtilsAssert['default'])('Cannot create markup of tagName ' + tagName, VALID_MARKUP_TAGNAMES.indexOf(this.tagName) !== -1);
    }

    /**
     * Whether text in the forward direction of the cursor (i.e. to the right in ltr text)
     * should be considered to have this markup applied to it.
     * @private
     */

    _createClass(Markup, [{
      key: 'isForwardInclusive',
      value: function isForwardInclusive() {
        return this.tagName === (0, _mobiledocKitUtilsDomUtils.normalizeTagName)("a") ? false : true;
      }
    }, {
      key: 'isBackwardInclusive',
      value: function isBackwardInclusive() {
        return false;
      }
    }, {
      key: 'hasTag',
      value: function hasTag(tagName) {
        return this.tagName === (0, _mobiledocKitUtilsDomUtils.normalizeTagName)(tagName);
      }

      /**
       * Returns the attribute value
       * @param {String} name, e.g. "href"
       */
    }, {
      key: 'getAttribute',
      value: function getAttribute(name) {
        return this.attributes[name];
      }
    }], [{
      key: 'isValidElement',
      value: function isValidElement(element) {
        var tagName = (0, _mobiledocKitUtilsDomUtils.normalizeTagName)(element.tagName);
        return VALID_MARKUP_TAGNAMES.indexOf(tagName) !== -1;
      }
    }]);

    return Markup;
  })();

  exports['default'] = Markup;
});
define('mobiledoc-kit/models/post-node-builder', ['exports', 'mobiledoc-kit/models/atom', 'mobiledoc-kit/models/post', 'mobiledoc-kit/models/markup-section', 'mobiledoc-kit/models/list-section', 'mobiledoc-kit/models/list-item', 'mobiledoc-kit/models/image', 'mobiledoc-kit/models/marker', 'mobiledoc-kit/models/markup', 'mobiledoc-kit/models/card', 'mobiledoc-kit/utils/dom-utils', 'mobiledoc-kit/utils/array-utils', 'mobiledoc-kit/models/types', 'mobiledoc-kit/utils/assert'], function (exports, _mobiledocKitModelsAtom, _mobiledocKitModelsPost, _mobiledocKitModelsMarkupSection, _mobiledocKitModelsListSection, _mobiledocKitModelsListItem, _mobiledocKitModelsImage, _mobiledocKitModelsMarker, _mobiledocKitModelsMarkup, _mobiledocKitModelsCard, _mobiledocKitUtilsDomUtils, _mobiledocKitUtilsArrayUtils, _mobiledocKitModelsTypes, _mobiledocKitUtilsAssert) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function cacheKey(tagName, attributes) {
    return (0, _mobiledocKitUtilsDomUtils.normalizeTagName)(tagName) + '-' + (0, _mobiledocKitUtilsArrayUtils.objectToSortedKVArray)(attributes).join('-');
  }

  function addMarkupToCache(cache, markup) {
    cache[cacheKey(markup.tagName, markup.attributes)] = markup;
  }

  function findMarkupInCache(cache, tagName, attributes) {
    var key = cacheKey(tagName, attributes);
    return cache[key];
  }

  /**
   * The PostNodeBuilder is used to create new {@link Post} primitives, such
   * as a MarkupSection, a CardSection, a Markup, etc. Every instance of an
   * {@link Editor} has its own builder instance. The builder can be used
   * inside an {@link Editor#run} callback to programmatically create new
   * Post primitives to insert into the document.
   * A PostNodeBuilder should be read from the Editor, *not* instantiated on its own.
   */

  var PostNodeBuilder = (function () {
    /**
     * @private
     */

    function PostNodeBuilder() {
      _classCallCheck(this, PostNodeBuilder);

      this.markupCache = {};
    }

    /**
     * @return {Post} A new, blank post
     */

    _createClass(PostNodeBuilder, [{
      key: 'createPost',
      value: function createPost() {
        var sections = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

        var post = new _mobiledocKitModelsPost['default']();
        post.builder = this;

        sections.forEach(function (s) {
          return post.sections.append(s);
        });

        return post;
      }
    }, {
      key: 'createMarkerableSection',
      value: function createMarkerableSection(type, tagName) {
        var markers = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];

        switch (type) {
          case _mobiledocKitModelsTypes.LIST_ITEM_TYPE:
            return this.createListItem(markers);
          case _mobiledocKitModelsTypes.MARKUP_SECTION_TYPE:
            return this.createMarkupSection(tagName, markers);
          default:
            (0, _mobiledocKitUtilsAssert['default'])('Cannot create markerable section of type ' + type, false);
        }
      }

      /**
       * @param {tagName} [tagName='P']
       * @param {Marker[]} [markers=[]]
       * @return {MarkupSection}
       */
    }, {
      key: 'createMarkupSection',
      value: function createMarkupSection() {
        var tagName = arguments.length <= 0 || arguments[0] === undefined ? _mobiledocKitModelsMarkupSection.DEFAULT_TAG_NAME : arguments[0];
        var markers = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
        var isGenerated = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
        var attributes = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

        tagName = (0, _mobiledocKitUtilsDomUtils.normalizeTagName)(tagName);
        var section = new _mobiledocKitModelsMarkupSection['default'](tagName, markers, attributes);
        if (isGenerated) {
          section.isGenerated = true;
        }
        section.builder = this;
        return section;
      }
    }, {
      key: 'createListSection',
      value: function createListSection() {
        var tagName = arguments.length <= 0 || arguments[0] === undefined ? _mobiledocKitModelsListSection.DEFAULT_TAG_NAME : arguments[0];
        var items = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
        var attributes = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

        tagName = (0, _mobiledocKitUtilsDomUtils.normalizeTagName)(tagName);
        var section = new _mobiledocKitModelsListSection['default'](tagName, items, attributes);
        section.builder = this;
        return section;
      }
    }, {
      key: 'createListItem',
      value: function createListItem() {
        var markers = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

        var tagName = (0, _mobiledocKitUtilsDomUtils.normalizeTagName)('li');
        var item = new _mobiledocKitModelsListItem['default'](tagName, markers);
        item.builder = this;
        return item;
      }
    }, {
      key: 'createImageSection',
      value: function createImageSection(url) {
        var section = new _mobiledocKitModelsImage['default']();
        if (url) {
          section.src = url;
        }
        return section;
      }

      /**
       * @param {String} name
       * @param {Object} [payload={}]
       * @return {CardSection}
       */
    }, {
      key: 'createCardSection',
      value: function createCardSection(name) {
        var payload = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        var card = new _mobiledocKitModelsCard['default'](name, payload);
        card.builder = this;
        return card;
      }

      /**
       * @param {String} value
       * @param {Markup[]} [markups=[]]
       * @return {Marker}
       */
    }, {
      key: 'createMarker',
      value: function createMarker(value) {
        var markups = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

        var marker = new _mobiledocKitModelsMarker['default'](value, markups);
        marker.builder = this;
        return marker;
      }

      /**
       * @param {String} name
       * @param {String} [value='']
       * @param {Object} [payload={}]
       * @param {Markup[]} [markups=[]]
       * @return {Atom}
       */
    }, {
      key: 'createAtom',
      value: function createAtom(name) {
        var value = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
        var payload = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
        var markups = arguments.length <= 3 || arguments[3] === undefined ? [] : arguments[3];

        var atom = new _mobiledocKitModelsAtom['default'](name, value, payload, markups);
        atom.builder = this;
        return atom;
      }

      /**
       * @param {String} tagName
       * @param {Object} attributes Key-value pairs of attributes for the markup
       * @return {Markup}
       */
    }, {
      key: 'createMarkup',
      value: function createMarkup(tagName) {
        var attributes = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        tagName = (0, _mobiledocKitUtilsDomUtils.normalizeTagName)(tagName);

        var markup = findMarkupInCache(this.markupCache, tagName, attributes);
        if (!markup) {
          markup = new _mobiledocKitModelsMarkup['default'](tagName, attributes);
          markup.builder = this;
          addMarkupToCache(this.markupCache, markup);
        }

        return markup;
      }
    }]);

    return PostNodeBuilder;
  })();

  exports['default'] = PostNodeBuilder;
});
define('mobiledoc-kit/models/post', ['exports', 'mobiledoc-kit/models/types', 'mobiledoc-kit/utils/linked-list', 'mobiledoc-kit/utils/array-utils', 'mobiledoc-kit/utils/set', 'mobiledoc-kit/utils/cursor/position', 'mobiledoc-kit/utils/assert'], function (exports, _mobiledocKitModelsTypes, _mobiledocKitUtilsLinkedList, _mobiledocKitUtilsArrayUtils, _mobiledocKitUtilsSet, _mobiledocKitUtilsCursorPosition, _mobiledocKitUtilsAssert) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  /**
   * The Post is an in-memory representation of an editor's document.
   * An editor always has a single post. The post is organized into a list of
   * sections. Each section may be markerable (contains "markers", aka editable
   * text) or non-markerable (e.g., a card).
   * When persisting a post, it must first be serialized (loss-lessly) into
   * mobiledoc using {@link Editor#serialize}.
   */

  var Post = (function () {
    /**
     * @private
     */

    function Post() {
      var _this = this;

      _classCallCheck(this, Post);

      this.type = _mobiledocKitModelsTypes.POST_TYPE;
      this.sections = new _mobiledocKitUtilsLinkedList['default']({
        adoptItem: function adoptItem(s) {
          return s.post = s.parent = _this;
        },
        freeItem: function freeItem(s) {
          return s.post = s.parent = null;
        }
      });
    }

    /**
     * @return {Position} The position at the start of the post (will be a {@link BlankPosition}
     * if the post is blank)
     * @public
     */

    _createClass(Post, [{
      key: 'headPosition',
      value: function headPosition() {
        if (this.isBlank) {
          return _mobiledocKitUtilsCursorPosition['default'].blankPosition();
        } else {
          return this.sections.head.headPosition();
        }
      }

      /**
       * @return {Position} The position at the end of the post (will be a {@link BlankPosition}
       * if the post is blank)
       * @public
       */
    }, {
      key: 'tailPosition',
      value: function tailPosition() {
        if (this.isBlank) {
          return _mobiledocKitUtilsCursorPosition['default'].blankPosition();
        } else {
          return this.sections.tail.tailPosition();
        }
      }

      /**
       * @return {Range} A range encompassing the entire post
       * @public
       */
    }, {
      key: 'toRange',
      value: function toRange() {
        return this.headPosition().toRange(this.tailPosition());
      }
    }, {
      key: 'markersContainedByRange',

      /**
       * @param {Range} range
       * @return {Array} markers that are completely contained by the range
       */
      value: function markersContainedByRange(range) {
        var markers = [];

        this.walkMarkerableSections(range, function (section) {
          section._markersInRange(range.trimTo(section), function (m, _ref) {
            var isContained = _ref.isContained;
            if (isContained) {
              markers.push(m);
            }
          });
        });

        return markers;
      }
    }, {
      key: 'markupsInRange',
      value: function markupsInRange(range) {
        var markups = new _mobiledocKitUtilsSet['default']();

        if (range.isCollapsed) {
          var pos = range.head;
          if (pos.isMarkerable) {
            var back = pos.markerIn(-1);
            var forward = pos.markerIn(1);

            if (back && forward && back === forward) {
              back.markups.forEach(function (m) {
                return markups.add(m);
              });
            } else {
              (back && back.markups || []).forEach(function (m) {
                if (m.isForwardInclusive()) {
                  markups.add(m);
                }
              });
              (forward && forward.markups || []).forEach(function (m) {
                if (m.isBackwardInclusive()) {
                  markups.add(m);
                }
              });
            }
          }
        } else {
          this.walkMarkerableSections(range, function (section) {
            (0, _mobiledocKitUtilsArrayUtils.forEach)(section.markupsInRange(range.trimTo(section)), function (m) {
              return markups.add(m);
            });
          });
        }

        return markups.toArray();
      }
    }, {
      key: 'walkAllLeafSections',
      value: function walkAllLeafSections(callback) {
        var range = this.headPosition().toRange(this.tailPosition());
        return this.walkLeafSections(range, callback);
      }
    }, {
      key: 'walkLeafSections',
      value: function walkLeafSections(range, callback) {
        var head = range.head;
        var tail = range.tail;

        var index = 0;
        var nextSection = undefined,
            shouldStop = undefined;
        var currentSection = head.section;

        while (currentSection) {
          nextSection = this._nextLeafSection(currentSection);
          shouldStop = currentSection === tail.section;

          callback(currentSection, index);
          index++;

          if (shouldStop) {
            break;
          } else {
            currentSection = nextSection;
          }
        }
      }
    }, {
      key: 'walkMarkerableSections',
      value: function walkMarkerableSections(range, callback) {
        this.walkLeafSections(range, function (section) {
          if (section.isMarkerable) {
            callback(section);
          }
        });
      }

      // return the next section that has markers after this one,
      // possibly skipping non-markerable sections
    }, {
      key: '_nextLeafSection',
      value: function _nextLeafSection(section) {
        if (!section) {
          return null;
        }

        var next = section.next;
        if (next) {
          if (next.isLeafSection) {
            return next;
          } else if (next.items) {
            return next.items.head;
          } else {
            (0, _mobiledocKitUtilsAssert['default'])('Cannot determine next section from non-leaf-section', false);
          }
        } else if (section.isNested) {
          // if there is no section after this, but this section is a child
          // (e.g. a ListItem inside a ListSection), check for a markerable
          // section after its parent
          return this._nextLeafSection(section.parent);
        }
      }

      /**
       * @param {Range} range
       * @return {Post} A new post, constrained to {range}
       */
    }, {
      key: 'trimTo',
      value: function trimTo(range) {
        var post = this.builder.createPost();
        var builder = this.builder;

        var sectionParent = post,
            listParent = null;
        this.walkLeafSections(range, function (section) {
          var newSection = undefined;
          if (section.isMarkerable) {
            if (section.isListItem) {
              if (listParent) {
                sectionParent = null;
              } else {
                listParent = builder.createListSection(section.parent.tagName);
                post.sections.append(listParent);
                sectionParent = null;
              }
              newSection = builder.createListItem();
              listParent.items.append(newSection);
            } else {
              listParent = null;
              sectionParent = post;
              newSection = builder.createMarkupSection(section.tagName);
            }

            var currentRange = range.trimTo(section);
            (0, _mobiledocKitUtilsArrayUtils.forEach)(section.markersFor(currentRange.headSectionOffset, currentRange.tailSectionOffset), function (m) {
              return newSection.markers.append(m);
            });
          } else {
            newSection = section.clone();
            sectionParent = post;
          }
          if (sectionParent) {
            sectionParent.sections.append(newSection);
          }
        });
        return post;
      }
    }, {
      key: 'isBlank',
      get: function get() {
        return this.sections.isEmpty;
      }

      /**
       * If the post has no sections, or only has one, blank section, then it does
       * not have content and this method returns false. Otherwise it is true.
       * @return {Boolean}
       * @public
       */
    }, {
      key: 'hasContent',
      get: function get() {
        if (this.sections.length > 1 || this.sections.length === 1 && !this.sections.head.isBlank) {
          return true;
        } else {
          return false;
        }
      }
    }]);

    return Post;
  })();

  exports['default'] = Post;
});
define('mobiledoc-kit/models/render-node', ['exports', 'mobiledoc-kit/utils/linked-item', 'mobiledoc-kit/utils/linked-list', 'mobiledoc-kit/utils/dom-utils', 'mobiledoc-kit/utils/assert'], function (exports, _mobiledocKitUtilsLinkedItem, _mobiledocKitUtilsLinkedList, _mobiledocKitUtilsDomUtils, _mobiledocKitUtilsAssert) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var RenderNode = (function (_LinkedItem) {
    _inherits(RenderNode, _LinkedItem);

    function RenderNode(postNode, renderTree) {
      _classCallCheck(this, RenderNode);

      _get(Object.getPrototypeOf(RenderNode.prototype), 'constructor', this).call(this);
      this.parent = null;
      this.isDirty = true;
      this.isRemoved = false;
      this.postNode = postNode;
      this._childNodes = null;
      this._element = null;
      this._cursorElement = null; // blank render nodes need a cursor element
      this.renderTree = renderTree;

      // RenderNodes for Markers keep track of their markupElement
      this.markupElement = null;

      // RenderNodes for Atoms use these properties
      this.headTextNode = null;
      this.tailTextNode = null;
      this.atomNode = null;

      // RenderNodes for cards use this property
      this.cardNode = null;
    }

    _createClass(RenderNode, [{
      key: 'isAttached',
      value: function isAttached() {
        (0, _mobiledocKitUtilsAssert['default'])('Cannot check if a renderNode is attached without an element.', !!this.element);
        return (0, _mobiledocKitUtilsDomUtils.containsNode)(this.renderTree.rootElement, this.element);
      }
    }, {
      key: 'scheduleForRemoval',
      value: function scheduleForRemoval() {
        this.isRemoved = true;
        if (this.parent) {
          this.parent.markDirty();
        }
      }
    }, {
      key: 'markDirty',
      value: function markDirty() {
        this.isDirty = true;
        if (this.parent) {
          this.parent.markDirty();
        }
      }
    }, {
      key: 'markClean',
      value: function markClean() {
        this.isDirty = false;
      }
    }, {
      key: 'destroy',
      value: function destroy() {
        this.element = null;
        this.parent = null;
        this.postNode = null;
        this.renderTree = null;
      }
    }, {
      key: 'reparsesMutationOfChildNode',
      value: function reparsesMutationOfChildNode(node) {
        if (this.postNode.isCardSection) {
          return !(0, _mobiledocKitUtilsDomUtils.containsNode)(this.cardNode.element, node);
        } else if (this.postNode.isAtom) {
          return !(0, _mobiledocKitUtilsDomUtils.containsNode)(this.atomNode.element, node);
        }
        return true;
      }
    }, {
      key: 'childNodes',
      get: function get() {
        var _this = this;

        if (!this._childNodes) {
          this._childNodes = new _mobiledocKitUtilsLinkedList['default']({
            adoptItem: function adoptItem(item) {
              return item.parent = _this;
            },
            freeItem: function freeItem(item) {
              return item.destroy();
            }
          });
        }
        return this._childNodes;
      }
    }, {
      key: 'isRendered',
      get: function get() {
        return !!this.element;
      }
    }, {
      key: 'element',
      set: function set(element) {
        var currentElement = this._element;
        this._element = element;

        if (currentElement) {
          this.renderTree.removeElementRenderNode(currentElement);
        }

        if (element) {
          this.renderTree.setElementRenderNode(element, this);
        }
      },
      get: function get() {
        return this._element;
      }
    }, {
      key: 'cursorElement',
      set: function set(cursorElement) {
        this._cursorElement = cursorElement;
      },
      get: function get() {
        return this._cursorElement || this.element;
      }
    }]);

    return RenderNode;
  })(_mobiledocKitUtilsLinkedItem['default']);

  exports['default'] = RenderNode;
});
define('mobiledoc-kit/models/render-tree', ['exports', 'mobiledoc-kit/models/render-node', 'mobiledoc-kit/utils/element-map'], function (exports, _mobiledocKitModelsRenderNode, _mobiledocKitUtilsElementMap) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var RenderTree = (function () {
    function RenderTree(rootPostNode) {
      _classCallCheck(this, RenderTree);

      this._rootNode = this.buildRenderNode(rootPostNode);
      this._elements = new _mobiledocKitUtilsElementMap['default']();
    }

    /*
     * @return {RenderNode} The root render node in this tree
     */

    _createClass(RenderTree, [{
      key: 'getElementRenderNode',

      /*
       * @param {DOMNode} element
       * @return {RenderNode} The renderNode for this element, if any
       */
      value: function getElementRenderNode(element) {
        return this._elements.get(element);
      }
    }, {
      key: 'setElementRenderNode',
      value: function setElementRenderNode(element, renderNode) {
        this._elements.set(element, renderNode);
      }
    }, {
      key: 'removeElementRenderNode',
      value: function removeElementRenderNode(element) {
        this._elements.remove(element);
      }

      /**
       * @param {DOMNode} element
       * Walk up from the dom element until we find a renderNode element
       */
    }, {
      key: 'findRenderNodeFromElement',
      value: function findRenderNodeFromElement(element) {
        var conditionFn = arguments.length <= 1 || arguments[1] === undefined ? function () {
          return true;
        } : arguments[1];

        var renderNode = undefined;
        while (element) {
          renderNode = this.getElementRenderNode(element);
          if (renderNode && conditionFn(renderNode)) {
            return renderNode;
          }

          // continue loop
          element = element.parentNode;

          // stop if we are at the root element
          if (element === this.rootElement) {
            if (conditionFn(this.rootNode)) {
              return this.rootNode;
            } else {
              return;
            }
          }
        }
      }
    }, {
      key: 'buildRenderNode',
      value: function buildRenderNode(postNode) {
        var renderNode = new _mobiledocKitModelsRenderNode['default'](postNode, this);
        postNode.renderNode = renderNode;
        return renderNode;
      }
    }, {
      key: 'rootNode',
      get: function get() {
        return this._rootNode;
      }

      /**
       * @return {Boolean}
       */
    }, {
      key: 'isDirty',
      get: function get() {
        return this.rootNode && this.rootNode.isDirty;
      }

      /*
       * @return {DOMNode} The root DOM element in this tree
       */
    }, {
      key: 'rootElement',
      get: function get() {
        return this.rootNode.element;
      }
    }]);

    return RenderTree;
  })();

  exports['default'] = RenderTree;
});
define('mobiledoc-kit/models/types', ['exports'], function (exports) {
  'use strict';

  var MARKUP_SECTION_TYPE = 'markup-section';
  exports.MARKUP_SECTION_TYPE = MARKUP_SECTION_TYPE;
  var LIST_SECTION_TYPE = 'list-section';
  exports.LIST_SECTION_TYPE = LIST_SECTION_TYPE;
  var MARKUP_TYPE = 'markup';
  exports.MARKUP_TYPE = MARKUP_TYPE;
  var MARKER_TYPE = 'marker';
  exports.MARKER_TYPE = MARKER_TYPE;
  var POST_TYPE = 'post';
  exports.POST_TYPE = POST_TYPE;
  var LIST_ITEM_TYPE = 'list-item';
  exports.LIST_ITEM_TYPE = LIST_ITEM_TYPE;
  var CARD_TYPE = 'card-section';
  exports.CARD_TYPE = CARD_TYPE;
  var IMAGE_SECTION_TYPE = 'image-section';
  exports.IMAGE_SECTION_TYPE = IMAGE_SECTION_TYPE;
  var ATOM_TYPE = 'atom';
  exports.ATOM_TYPE = ATOM_TYPE;
});
define('mobiledoc-kit/parsers/dom', ['exports', 'mobiledoc-kit/renderers/editor-dom', 'mobiledoc-kit/models/types', 'mobiledoc-kit/utils/dom-utils', 'mobiledoc-kit/utils/array-utils', 'mobiledoc-kit/utils/characters', 'mobiledoc-kit/parsers/section', 'mobiledoc-kit/models/markup'], function (exports, _mobiledocKitRenderersEditorDom, _mobiledocKitModelsTypes, _mobiledocKitUtilsDomUtils, _mobiledocKitUtilsArrayUtils, _mobiledocKitUtilsCharacters, _mobiledocKitParsersSection, _mobiledocKitModelsMarkup) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  exports.transformHTMLText = transformHTMLText;
  exports.trimSectionText = trimSectionText;

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var GOOGLE_DOCS_CONTAINER_ID_REGEX = /^docs\-internal\-guid/;

  var NO_BREAK_SPACE_REGEX = new RegExp(_mobiledocKitRenderersEditorDom.NO_BREAK_SPACE, 'g');
  var TAB_CHARACTER_REGEX = new RegExp(_mobiledocKitRenderersEditorDom.TAB_CHARACTER, 'g');

  function transformHTMLText(textContent) {
    var text = textContent;
    text = text.replace(NO_BREAK_SPACE_REGEX, ' ');
    text = text.replace(TAB_CHARACTER_REGEX, _mobiledocKitUtilsCharacters.TAB);
    return text;
  }

  function trimSectionText(section) {
    if (section.isMarkerable && section.markers.length) {
      var _section$markers = section.markers;
      var head = _section$markers.head;
      var tail = _section$markers.tail;

      head.value = head.value.replace(/^\s+/, '');
      tail.value = tail.value.replace(/\s+$/, '');
    }
  }

  function isGoogleDocsContainer(element) {
    return !(0, _mobiledocKitUtilsDomUtils.isTextNode)(element) && !(0, _mobiledocKitUtilsDomUtils.isCommentNode)(element) && (0, _mobiledocKitUtilsDomUtils.normalizeTagName)(element.tagName) === (0, _mobiledocKitUtilsDomUtils.normalizeTagName)('b') && GOOGLE_DOCS_CONTAINER_ID_REGEX.test(element.id);
  }

  function detectRootElement(element) {
    var childNodes = element.childNodes || [];
    var googleDocsContainer = (0, _mobiledocKitUtilsArrayUtils.detect)(childNodes, isGoogleDocsContainer);

    if (googleDocsContainer) {
      return googleDocsContainer;
    } else {
      return element;
    }
  }

  var TAG_REMAPPING = {
    'b': 'strong',
    'i': 'em'
  };

  function remapTagName(tagName) {
    var normalized = (0, _mobiledocKitUtilsDomUtils.normalizeTagName)(tagName);
    var remapped = TAG_REMAPPING[normalized];
    return remapped || normalized;
  }

  function trim(str) {
    return str.replace(/^\s+/, '').replace(/\s+$/, '');
  }

  function walkMarkerableNodes(parent, callback) {
    var currentNode = parent;

    if ((0, _mobiledocKitUtilsDomUtils.isTextNode)(currentNode) || (0, _mobiledocKitUtilsDomUtils.isElementNode)(currentNode) && currentNode.classList.contains(_mobiledocKitRenderersEditorDom.ATOM_CLASS_NAME)) {
      callback(currentNode);
    } else {
      currentNode = currentNode.firstChild;
      while (currentNode) {
        walkMarkerableNodes(currentNode, callback);
        currentNode = currentNode.nextSibling;
      }
    }
  }

  /**
   * Parses DOM element -> Post
   * @private
   */

  var DOMParser = (function () {
    function DOMParser(builder) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      _classCallCheck(this, DOMParser);

      this.builder = builder;
      this.sectionParser = new _mobiledocKitParsersSection['default'](this.builder, options);
    }

    _createClass(DOMParser, [{
      key: 'parse',
      value: function parse(element) {
        var _this = this;

        var post = this.builder.createPost();
        var rootElement = detectRootElement(element);

        this._eachChildNode(rootElement, function (child) {
          var sections = _this.parseSections(child);
          _this.appendSections(post, sections);
        });

        // trim leading/trailing whitespace of markerable sections to avoid
        // unnessary whitespace from indented HTML input
        (0, _mobiledocKitUtilsArrayUtils.forEach)(post.sections, function (section) {
          return trimSectionText(section);
        });

        return post;
      }
    }, {
      key: 'appendSections',
      value: function appendSections(post, sections) {
        var _this2 = this;

        (0, _mobiledocKitUtilsArrayUtils.forEach)(sections, function (section) {
          return _this2.appendSection(post, section);
        });
      }
    }, {
      key: 'appendSection',
      value: function appendSection(post, section) {
        if (section.isBlank || section.isMarkerable && trim(section.text) === "" && !(0, _mobiledocKitUtilsArrayUtils.any)(section.markers, function (marker) {
          return marker.isAtom;
        })) {
          return;
        }

        var lastSection = post.sections.tail;
        if (lastSection && lastSection._inferredTagName && section._inferredTagName && lastSection.tagName === section.tagName) {
          lastSection.join(section);
        } else {
          post.sections.append(section);
        }
      }
    }, {
      key: '_eachChildNode',
      value: function _eachChildNode(element, callback) {
        var nodes = (0, _mobiledocKitUtilsDomUtils.isTextNode)(element) ? [element] : element.childNodes;
        (0, _mobiledocKitUtilsArrayUtils.forEach)(nodes, function (node) {
          return callback(node);
        });
      }
    }, {
      key: 'parseSections',
      value: function parseSections(element) {
        return this.sectionParser.parse(element);
      }

      // walk up from the textNode until the rootNode, converting each
      // parentNode into a markup
    }, {
      key: 'collectMarkups',
      value: function collectMarkups(textNode, rootNode) {
        var markups = [];
        var currentNode = textNode.parentNode;
        while (currentNode && currentNode !== rootNode) {
          var markup = this.markupFromNode(currentNode);
          if (markup) {
            markups.push(markup);
          }

          currentNode = currentNode.parentNode;
        }
        return markups;
      }

      // Turn an element node into a markup
    }, {
      key: 'markupFromNode',
      value: function markupFromNode(node) {
        if (_mobiledocKitModelsMarkup['default'].isValidElement(node)) {
          var tagName = remapTagName(node.tagName);
          var attributes = (0, _mobiledocKitUtilsDomUtils.getAttributes)(node);
          return this.builder.createMarkup(tagName, attributes);
        }
      }

      // FIXME should move to the section parser?
      // FIXME the `collectMarkups` logic could simplify the section parser?
    }, {
      key: 'reparseSection',
      value: function reparseSection(section, renderTree) {
        switch (section.type) {
          case _mobiledocKitModelsTypes.LIST_SECTION_TYPE:
            return this.reparseListSection(section, renderTree);
          case _mobiledocKitModelsTypes.LIST_ITEM_TYPE:
            return this.reparseListItem(section, renderTree);
          case _mobiledocKitModelsTypes.MARKUP_SECTION_TYPE:
            return this.reparseMarkupSection(section, renderTree);
          default:
            return; // can only parse the above types
        }
      }
    }, {
      key: 'reparseMarkupSection',
      value: function reparseMarkupSection(section, renderTree) {
        return this._reparseSectionContainingMarkers(section, renderTree);
      }
    }, {
      key: 'reparseListItem',
      value: function reparseListItem(listItem, renderTree) {
        return this._reparseSectionContainingMarkers(listItem, renderTree);
      }
    }, {
      key: 'reparseListSection',
      value: function reparseListSection(listSection, renderTree) {
        var _this3 = this;

        listSection.items.forEach(function (li) {
          return _this3.reparseListItem(li, renderTree);
        });
      }
    }, {
      key: '_reparseSectionContainingMarkers',
      value: function _reparseSectionContainingMarkers(section, renderTree) {
        var _this4 = this;

        var element = section.renderNode.element;
        var seenRenderNodes = [];
        var previousMarker = undefined;

        walkMarkerableNodes(element, function (node) {
          var marker = undefined;
          var renderNode = renderTree.getElementRenderNode(node);
          if (renderNode) {
            if (renderNode.postNode.isMarker) {
              var text = transformHTMLText(node.textContent);
              var markups = _this4.collectMarkups(node, element);
              if (text.length) {
                marker = renderNode.postNode;
                marker.value = text;
                marker.markups = markups;
              } else {
                renderNode.scheduleForRemoval();
              }
            } else if (renderNode.postNode.isAtom) {
              var _renderNode = renderNode;
              var headTextNode = _renderNode.headTextNode;
              var tailTextNode = _renderNode.tailTextNode;

              if (headTextNode.textContent !== _mobiledocKitRenderersEditorDom.ZWNJ) {
                var value = headTextNode.textContent.replace(new RegExp(_mobiledocKitRenderersEditorDom.ZWNJ, 'g'), '');
                headTextNode.textContent = _mobiledocKitRenderersEditorDom.ZWNJ;
                if (previousMarker && previousMarker.isMarker) {
                  previousMarker.value += value;
                  if (previousMarker.renderNode) {
                    previousMarker.renderNode.markDirty();
                  }
                } else {
                  var postNode = renderNode.postNode;
                  var newMarkups = postNode.markups.slice();
                  var newPreviousMarker = _this4.builder.createMarker(value, newMarkups);
                  section.markers.insertBefore(newPreviousMarker, postNode);

                  var newPreviousRenderNode = renderTree.buildRenderNode(newPreviousMarker);
                  newPreviousRenderNode.markDirty();
                  section.renderNode.markDirty();

                  seenRenderNodes.push(newPreviousRenderNode);
                  section.renderNode.childNodes.insertBefore(newPreviousRenderNode, renderNode);
                }
              }
              if (tailTextNode.textContent !== _mobiledocKitRenderersEditorDom.ZWNJ) {
                var value = tailTextNode.textContent.replace(new RegExp(_mobiledocKitRenderersEditorDom.ZWNJ, 'g'), '');
                tailTextNode.textContent = _mobiledocKitRenderersEditorDom.ZWNJ;

                if (renderNode.postNode.next && renderNode.postNode.next.isMarker) {
                  var nextMarker = renderNode.postNode.next;

                  if (nextMarker.renderNode) {
                    var nextValue = nextMarker.renderNode.element.textContent;
                    nextMarker.renderNode.element.textContent = value + nextValue;
                  } else {
                    var nextValue = value + nextMarker.value;
                    nextMarker.value = nextValue;
                  }
                } else {
                  var postNode = renderNode.postNode;
                  var newMarkups = postNode.markups.slice();
                  var newMarker = _this4.builder.createMarker(value, newMarkups);

                  section.markers.insertAfter(newMarker, postNode);

                  var newRenderNode = renderTree.buildRenderNode(newMarker);
                  seenRenderNodes.push(newRenderNode);

                  newRenderNode.markDirty();
                  section.renderNode.markDirty();

                  section.renderNode.childNodes.insertAfter(newRenderNode, renderNode);
                }
              }
              if (renderNode) {
                marker = renderNode.postNode;
              }
            }
          } else if ((0, _mobiledocKitUtilsDomUtils.isTextNode)(node)) {
            var text = transformHTMLText(node.textContent);
            var markups = _this4.collectMarkups(node, element);
            marker = _this4.builder.createMarker(text, markups);

            renderNode = renderTree.buildRenderNode(marker);
            renderNode.element = node;
            renderNode.markClean();
            section.renderNode.markDirty();

            var previousRenderNode = previousMarker && previousMarker.renderNode;
            section.markers.insertAfter(marker, previousMarker);
            section.renderNode.childNodes.insertAfter(renderNode, previousRenderNode);
          }

          if (renderNode) {
            seenRenderNodes.push(renderNode);
          }
          previousMarker = marker;
        });

        var renderNode = section.renderNode.childNodes.head;
        while (renderNode) {
          if (seenRenderNodes.indexOf(renderNode) === -1) {
            renderNode.scheduleForRemoval();
          }
          renderNode = renderNode.next;
        }
      }
    }]);

    return DOMParser;
  })();

  exports['default'] = DOMParser;
});
define('mobiledoc-kit/parsers/html', ['exports', 'mobiledoc-kit/utils/dom-utils', 'mobiledoc-kit/utils/assert', 'mobiledoc-kit/parsers/dom'], function (exports, _mobiledocKitUtilsDomUtils, _mobiledocKitUtilsAssert, _mobiledocKitParsersDom) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var HTMLParser = (function () {
    function HTMLParser(builder) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      _classCallCheck(this, HTMLParser);

      (0, _mobiledocKitUtilsAssert['default'])('Must pass builder to HTMLParser', builder);
      this.builder = builder;
      this.options = options;
    }

    /**
     * @param {String} html to parse
     * @return {Post} A post abstract
     */

    _createClass(HTMLParser, [{
      key: 'parse',
      value: function parse(html) {
        var dom = (0, _mobiledocKitUtilsDomUtils.parseHTML)(html);
        var parser = new _mobiledocKitParsersDom['default'](this.builder, this.options);
        return parser.parse(dom);
      }
    }]);

    return HTMLParser;
  })();

  exports['default'] = HTMLParser;
});
define('mobiledoc-kit/parsers/mobiledoc/0-2', ['exports', 'mobiledoc-kit/renderers/mobiledoc/0-2', 'mobiledoc-kit/utils/array-utils', 'mobiledoc-kit/utils/assert'], function (exports, _mobiledocKitRenderersMobiledoc02, _mobiledocKitUtilsArrayUtils, _mobiledocKitUtilsAssert) {
  'use strict';

  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  /*
   * Parses from mobiledoc -> post
   */

  var MobiledocParser = (function () {
    function MobiledocParser(builder) {
      _classCallCheck(this, MobiledocParser);

      this.builder = builder;
    }

    /**
     * @param {Mobiledoc}
     * @return {Post}
     */

    _createClass(MobiledocParser, [{
      key: 'parse',
      value: function parse(_ref) {
        var sectionData = _ref.sections;

        try {
          var markerTypes = sectionData[0];
          var sections = sectionData[1];

          var post = this.builder.createPost();

          this.markups = [];
          this.markerTypes = this.parseMarkerTypes(markerTypes);
          this.parseSections(sections, post);

          return post;
        } catch (e) {
          (0, _mobiledocKitUtilsAssert['default'])('Unable to parse mobiledoc: ' + e.message, false);
        }
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
        var attributesArray = _ref22[1];

        var attributesObject = (0, _mobiledocKitUtilsArrayUtils.kvArrayToObject)(attributesArray || []);
        return this.builder.createMarkup(tagName, attributesObject);
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
          case _mobiledocKitRenderersMobiledoc02.MOBILEDOC_MARKUP_SECTION_TYPE:
            this.parseMarkupSection(section, post);
            break;
          case _mobiledocKitRenderersMobiledoc02.MOBILEDOC_IMAGE_SECTION_TYPE:
            this.parseImageSection(section, post);
            break;
          case _mobiledocKitRenderersMobiledoc02.MOBILEDOC_CARD_SECTION_TYPE:
            this.parseCardSection(section, post);
            break;
          case _mobiledocKitRenderersMobiledoc02.MOBILEDOC_LIST_SECTION_TYPE:
            this.parseListSection(section, post);
            break;
          default:
            (0, _mobiledocKitUtilsAssert['default'])('Unexpected section type ' + type, false);
        }
      }
    }, {
      key: 'parseCardSection',
      value: function parseCardSection(_ref3, post) {
        var _ref32 = _slicedToArray(_ref3, 3);

        var name = _ref32[1];
        var payload = _ref32[2];

        var section = this.builder.createCardSection(name, payload);
        post.sections.append(section);
      }
    }, {
      key: 'parseImageSection',
      value: function parseImageSection(_ref4, post) {
        var _ref42 = _slicedToArray(_ref4, 2);

        var src = _ref42[1];

        var section = this.builder.createImageSection(src);
        post.sections.append(section);
      }
    }, {
      key: 'parseMarkupSection',
      value: function parseMarkupSection(_ref5, post) {
        var _ref52 = _slicedToArray(_ref5, 3);

        var tagName = _ref52[1];
        var markers = _ref52[2];

        var section = this.builder.createMarkupSection(tagName.toLowerCase() === 'pull-quote' ? 'aside' : tagName);
        post.sections.append(section);
        this.parseMarkers(markers, section);
        // Strip blank markers after they have been created. This ensures any
        // markup they include has been correctly populated.
        (0, _mobiledocKitUtilsArrayUtils.filter)(section.markers, function (m) {
          return m.isBlank;
        }).forEach(function (m) {
          section.markers.remove(m);
        });
      }
    }, {
      key: 'parseListSection',
      value: function parseListSection(_ref6, post) {
        var _ref62 = _slicedToArray(_ref6, 3);

        var tagName = _ref62[1];
        var items = _ref62[2];

        var section = this.builder.createListSection(tagName);
        post.sections.append(section);
        this.parseListItems(items, section);
      }
    }, {
      key: 'parseListItems',
      value: function parseListItems(items, section) {
        var _this3 = this;

        items.forEach(function (i) {
          return _this3.parseListItem(i, section);
        });
      }
    }, {
      key: 'parseListItem',
      value: function parseListItem(markers, section) {
        var item = this.builder.createListItem();
        this.parseMarkers(markers, item);
        section.items.append(item);
      }
    }, {
      key: 'parseMarkers',
      value: function parseMarkers(markers, parent) {
        var _this4 = this;

        markers.forEach(function (m) {
          return _this4.parseMarker(m, parent);
        });
      }
    }, {
      key: 'parseMarker',
      value: function parseMarker(_ref7, parent) {
        var _this5 = this;

        var _ref72 = _slicedToArray(_ref7, 3);

        var markerTypeIndexes = _ref72[0];
        var closeCount = _ref72[1];
        var value = _ref72[2];

        markerTypeIndexes.forEach(function (index) {
          _this5.markups.push(_this5.markerTypes[index]);
        });
        var marker = this.builder.createMarker(value, this.markups.slice());
        parent.markers.append(marker);
        this.markups = this.markups.slice(0, this.markups.length - closeCount);
      }
    }]);

    return MobiledocParser;
  })();

  exports['default'] = MobiledocParser;
});
define('mobiledoc-kit/parsers/mobiledoc/0-3-1', ['exports', 'mobiledoc-kit/renderers/mobiledoc/0-3-1', 'mobiledoc-kit/utils/array-utils', 'mobiledoc-kit/utils/assert'], function (exports, _mobiledocKitRenderersMobiledoc031, _mobiledocKitUtilsArrayUtils, _mobiledocKitUtilsAssert) {
  'use strict';

  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  /*
   * Parses from mobiledoc -> post
   */

  var MobiledocParser = (function () {
    function MobiledocParser(builder) {
      _classCallCheck(this, MobiledocParser);

      this.builder = builder;
    }

    /**
     * @param {Mobiledoc}
     * @return {Post}
     */

    _createClass(MobiledocParser, [{
      key: 'parse',
      value: function parse(_ref) {
        var sections = _ref.sections;
        var markerTypes = _ref.markups;
        var cardTypes = _ref.cards;
        var atomTypes = _ref.atoms;

        try {
          var post = this.builder.createPost();

          this.markups = [];
          this.markerTypes = this.parseMarkerTypes(markerTypes);
          this.cardTypes = this.parseCardTypes(cardTypes);
          this.atomTypes = this.parseAtomTypes(atomTypes);
          this.parseSections(sections, post);

          return post;
        } catch (e) {
          (0, _mobiledocKitUtilsAssert['default'])('Unable to parse mobiledoc: ' + e.message, false);
        }
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
        var attributesArray = _ref22[1];

        var attributesObject = (0, _mobiledocKitUtilsArrayUtils.kvArrayToObject)(attributesArray || []);
        return this.builder.createMarkup(tagName, attributesObject);
      }
    }, {
      key: 'parseCardTypes',
      value: function parseCardTypes(cardTypes) {
        var _this2 = this;

        return cardTypes.map(function (cardType) {
          return _this2.parseCardType(cardType);
        });
      }
    }, {
      key: 'parseCardType',
      value: function parseCardType(_ref3) {
        var _ref32 = _slicedToArray(_ref3, 2);

        var cardName = _ref32[0];
        var cardPayload = _ref32[1];

        return [cardName, cardPayload];
      }
    }, {
      key: 'parseAtomTypes',
      value: function parseAtomTypes(atomTypes) {
        var _this3 = this;

        return atomTypes.map(function (atomType) {
          return _this3.parseAtomType(atomType);
        });
      }
    }, {
      key: 'parseAtomType',
      value: function parseAtomType(_ref4) {
        var _ref42 = _slicedToArray(_ref4, 3);

        var atomName = _ref42[0];
        var atomValue = _ref42[1];
        var atomPayload = _ref42[2];

        return [atomName, atomValue, atomPayload];
      }
    }, {
      key: 'parseSections',
      value: function parseSections(sections, post) {
        var _this4 = this;

        sections.forEach(function (section) {
          return _this4.parseSection(section, post);
        });
      }
    }, {
      key: 'parseSection',
      value: function parseSection(section, post) {
        var _section = _slicedToArray(section, 1);

        var type = _section[0];

        switch (type) {
          case _mobiledocKitRenderersMobiledoc031.MOBILEDOC_MARKUP_SECTION_TYPE:
            this.parseMarkupSection(section, post);
            break;
          case _mobiledocKitRenderersMobiledoc031.MOBILEDOC_IMAGE_SECTION_TYPE:
            this.parseImageSection(section, post);
            break;
          case _mobiledocKitRenderersMobiledoc031.MOBILEDOC_CARD_SECTION_TYPE:
            this.parseCardSection(section, post);
            break;
          case _mobiledocKitRenderersMobiledoc031.MOBILEDOC_LIST_SECTION_TYPE:
            this.parseListSection(section, post);
            break;
          default:
            (0, _mobiledocKitUtilsAssert['default'])('Unexpected section type ${type}', false);
        }
      }
    }, {
      key: 'getAtomTypeFromIndex',
      value: function getAtomTypeFromIndex(index) {
        var atomType = this.atomTypes[index];
        (0, _mobiledocKitUtilsAssert['default'])('No atom definition found at index ' + index, !!atomType);
        return atomType;
      }
    }, {
      key: 'getCardTypeFromIndex',
      value: function getCardTypeFromIndex(index) {
        var cardType = this.cardTypes[index];
        (0, _mobiledocKitUtilsAssert['default'])('No card definition found at index ' + index, !!cardType);
        return cardType;
      }
    }, {
      key: 'parseCardSection',
      value: function parseCardSection(_ref5, post) {
        var _ref52 = _slicedToArray(_ref5, 2);

        var cardIndex = _ref52[1];

        var _getCardTypeFromIndex = this.getCardTypeFromIndex(cardIndex);

        var _getCardTypeFromIndex2 = _slicedToArray(_getCardTypeFromIndex, 2);

        var name = _getCardTypeFromIndex2[0];
        var payload = _getCardTypeFromIndex2[1];

        var section = this.builder.createCardSection(name, payload);
        post.sections.append(section);
      }
    }, {
      key: 'parseImageSection',
      value: function parseImageSection(_ref6, post) {
        var _ref62 = _slicedToArray(_ref6, 2);

        var src = _ref62[1];

        var section = this.builder.createImageSection(src);
        post.sections.append(section);
      }
    }, {
      key: 'parseMarkupSection',
      value: function parseMarkupSection(_ref7, post) {
        var _ref72 = _slicedToArray(_ref7, 3);

        var tagName = _ref72[1];
        var markers = _ref72[2];

        var section = this.builder.createMarkupSection(tagName);
        post.sections.append(section);
        this.parseMarkers(markers, section);
        // Strip blank markers after they have been created. This ensures any
        // markup they include has been correctly populated.
        (0, _mobiledocKitUtilsArrayUtils.filter)(section.markers, function (m) {
          return m.isBlank;
        }).forEach(function (m) {
          section.markers.remove(m);
        });
      }
    }, {
      key: 'parseListSection',
      value: function parseListSection(_ref8, post) {
        var _ref82 = _slicedToArray(_ref8, 3);

        var tagName = _ref82[1];
        var items = _ref82[2];

        var section = this.builder.createListSection(tagName);
        post.sections.append(section);
        this.parseListItems(items, section);
      }
    }, {
      key: 'parseListItems',
      value: function parseListItems(items, section) {
        var _this5 = this;

        items.forEach(function (i) {
          return _this5.parseListItem(i, section);
        });
      }
    }, {
      key: 'parseListItem',
      value: function parseListItem(markers, section) {
        var item = this.builder.createListItem();
        this.parseMarkers(markers, item);
        section.items.append(item);
      }
    }, {
      key: 'parseMarkers',
      value: function parseMarkers(markers, parent) {
        var _this6 = this;

        markers.forEach(function (m) {
          return _this6.parseMarker(m, parent);
        });
      }
    }, {
      key: 'parseMarker',
      value: function parseMarker(_ref9, parent) {
        var _this7 = this;

        var _ref92 = _slicedToArray(_ref9, 4);

        var type = _ref92[0];
        var markerTypeIndexes = _ref92[1];
        var closeCount = _ref92[2];
        var value = _ref92[3];

        markerTypeIndexes.forEach(function (index) {
          _this7.markups.push(_this7.markerTypes[index]);
        });

        var marker = this.buildMarkerType(type, value);
        parent.markers.append(marker);

        this.markups = this.markups.slice(0, this.markups.length - closeCount);
      }
    }, {
      key: 'buildMarkerType',
      value: function buildMarkerType(type, value) {
        switch (type) {
          case _mobiledocKitRenderersMobiledoc031.MOBILEDOC_MARKUP_MARKER_TYPE:
            return this.builder.createMarker(value, this.markups.slice());
          case _mobiledocKitRenderersMobiledoc031.MOBILEDOC_ATOM_MARKER_TYPE:
            {
              var _getAtomTypeFromIndex = this.getAtomTypeFromIndex(value);

              var _getAtomTypeFromIndex2 = _slicedToArray(_getAtomTypeFromIndex, 3);

              var atomName = _getAtomTypeFromIndex2[0];
              var atomValue = _getAtomTypeFromIndex2[1];
              var atomPayload = _getAtomTypeFromIndex2[2];

              return this.builder.createAtom(atomName, atomValue, atomPayload, this.markups.slice());
            }
          default:
            (0, _mobiledocKitUtilsAssert['default'])('Unexpected marker type ' + type, false);
        }
      }
    }]);

    return MobiledocParser;
  })();

  exports['default'] = MobiledocParser;
});
define('mobiledoc-kit/parsers/mobiledoc/0-3-2', ['exports', 'mobiledoc-kit/renderers/mobiledoc/0-3-2', 'mobiledoc-kit/utils/array-utils', 'mobiledoc-kit/utils/assert', 'mobiledoc-kit/utils/object-utils'], function (exports, _mobiledocKitRenderersMobiledoc032, _mobiledocKitUtilsArrayUtils, _mobiledocKitUtilsAssert, _mobiledocKitUtilsObjectUtils) {
  'use strict';

  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  /*
   * Parses from mobiledoc -> post
   */

  var MobiledocParser = (function () {
    function MobiledocParser(builder) {
      _classCallCheck(this, MobiledocParser);

      this.builder = builder;
    }

    /**
     * @param {Mobiledoc}
     * @return {Post}
     */

    _createClass(MobiledocParser, [{
      key: 'parse',
      value: function parse(_ref) {
        var sections = _ref.sections;
        var markerTypes = _ref.markups;
        var cardTypes = _ref.cards;
        var atomTypes = _ref.atoms;

        try {
          var post = this.builder.createPost();

          this.markups = [];
          this.markerTypes = this.parseMarkerTypes(markerTypes);
          this.cardTypes = this.parseCardTypes(cardTypes);
          this.atomTypes = this.parseAtomTypes(atomTypes);
          this.parseSections(sections, post);

          return post;
        } catch (e) {
          (0, _mobiledocKitUtilsAssert['default'])('Unable to parse mobiledoc: ' + e.message, false);
        }
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
        var attributesArray = _ref22[1];

        var attributesObject = (0, _mobiledocKitUtilsArrayUtils.kvArrayToObject)(attributesArray || []);
        return this.builder.createMarkup(tagName, attributesObject);
      }
    }, {
      key: 'parseCardTypes',
      value: function parseCardTypes(cardTypes) {
        var _this2 = this;

        return cardTypes.map(function (cardType) {
          return _this2.parseCardType(cardType);
        });
      }
    }, {
      key: 'parseCardType',
      value: function parseCardType(_ref3) {
        var _ref32 = _slicedToArray(_ref3, 2);

        var cardName = _ref32[0];
        var cardPayload = _ref32[1];

        return [cardName, cardPayload];
      }
    }, {
      key: 'parseAtomTypes',
      value: function parseAtomTypes(atomTypes) {
        var _this3 = this;

        return atomTypes.map(function (atomType) {
          return _this3.parseAtomType(atomType);
        });
      }
    }, {
      key: 'parseAtomType',
      value: function parseAtomType(_ref4) {
        var _ref42 = _slicedToArray(_ref4, 3);

        var atomName = _ref42[0];
        var atomValue = _ref42[1];
        var atomPayload = _ref42[2];

        return [atomName, atomValue, atomPayload];
      }
    }, {
      key: 'parseSections',
      value: function parseSections(sections, post) {
        var _this4 = this;

        sections.forEach(function (section) {
          return _this4.parseSection(section, post);
        });
      }
    }, {
      key: 'parseSection',
      value: function parseSection(section, post) {
        var _section = _slicedToArray(section, 1);

        var type = _section[0];

        switch (type) {
          case _mobiledocKitRenderersMobiledoc032.MOBILEDOC_MARKUP_SECTION_TYPE:
            this.parseMarkupSection(section, post);
            break;
          case _mobiledocKitRenderersMobiledoc032.MOBILEDOC_IMAGE_SECTION_TYPE:
            this.parseImageSection(section, post);
            break;
          case _mobiledocKitRenderersMobiledoc032.MOBILEDOC_CARD_SECTION_TYPE:
            this.parseCardSection(section, post);
            break;
          case _mobiledocKitRenderersMobiledoc032.MOBILEDOC_LIST_SECTION_TYPE:
            this.parseListSection(section, post);
            break;
          default:
            (0, _mobiledocKitUtilsAssert['default'])('Unexpected section type ${type}', false);
        }
      }
    }, {
      key: 'getAtomTypeFromIndex',
      value: function getAtomTypeFromIndex(index) {
        var atomType = this.atomTypes[index];
        (0, _mobiledocKitUtilsAssert['default'])('No atom definition found at index ' + index, !!atomType);
        return atomType;
      }
    }, {
      key: 'getCardTypeFromIndex',
      value: function getCardTypeFromIndex(index) {
        var cardType = this.cardTypes[index];
        (0, _mobiledocKitUtilsAssert['default'])('No card definition found at index ' + index, !!cardType);
        return cardType;
      }
    }, {
      key: 'parseCardSection',
      value: function parseCardSection(_ref5, post) {
        var _ref52 = _slicedToArray(_ref5, 2);

        var cardIndex = _ref52[1];

        var _getCardTypeFromIndex = this.getCardTypeFromIndex(cardIndex);

        var _getCardTypeFromIndex2 = _slicedToArray(_getCardTypeFromIndex, 2);

        var name = _getCardTypeFromIndex2[0];
        var payload = _getCardTypeFromIndex2[1];

        var section = this.builder.createCardSection(name, payload);
        post.sections.append(section);
      }
    }, {
      key: 'parseImageSection',
      value: function parseImageSection(_ref6, post) {
        var _ref62 = _slicedToArray(_ref6, 2);

        var src = _ref62[1];

        var section = this.builder.createImageSection(src);
        post.sections.append(section);
      }
    }, {
      key: 'parseMarkupSection',
      value: function parseMarkupSection(_ref7, post) {
        var _ref72 = _slicedToArray(_ref7, 4);

        var tagName = _ref72[1];
        var markers = _ref72[2];
        var attributesArray = _ref72[3];

        var section = this.builder.createMarkupSection(tagName);
        post.sections.append(section);
        if (attributesArray) {
          (0, _mobiledocKitUtilsObjectUtils.entries)((0, _mobiledocKitUtilsArrayUtils.kvArrayToObject)(attributesArray)).forEach(function (_ref8) {
            var _ref82 = _slicedToArray(_ref8, 2);

            var key = _ref82[0];
            var value = _ref82[1];

            section.setAttribute(key, value);
          });
        }
        this.parseMarkers(markers, section);
        // Strip blank markers after they have been created. This ensures any
        // markup they include has been correctly populated.
        (0, _mobiledocKitUtilsArrayUtils.filter)(section.markers, function (m) {
          return m.isBlank;
        }).forEach(function (m) {
          section.markers.remove(m);
        });
      }
    }, {
      key: 'parseListSection',
      value: function parseListSection(_ref9, post) {
        var _ref92 = _slicedToArray(_ref9, 4);

        var tagName = _ref92[1];
        var items = _ref92[2];
        var attributesArray = _ref92[3];

        var section = this.builder.createListSection(tagName);
        post.sections.append(section);
        if (attributesArray) {
          (0, _mobiledocKitUtilsObjectUtils.entries)((0, _mobiledocKitUtilsArrayUtils.kvArrayToObject)(attributesArray)).forEach(function (_ref10) {
            var _ref102 = _slicedToArray(_ref10, 2);

            var key = _ref102[0];
            var value = _ref102[1];

            section.setAttribute(key, value);
          });
        }
        this.parseListItems(items, section);
      }
    }, {
      key: 'parseListItems',
      value: function parseListItems(items, section) {
        var _this5 = this;

        items.forEach(function (i) {
          return _this5.parseListItem(i, section);
        });
      }
    }, {
      key: 'parseListItem',
      value: function parseListItem(markers, section) {
        var item = this.builder.createListItem();
        this.parseMarkers(markers, item);
        section.items.append(item);
      }
    }, {
      key: 'parseMarkers',
      value: function parseMarkers(markers, parent) {
        var _this6 = this;

        markers.forEach(function (m) {
          return _this6.parseMarker(m, parent);
        });
      }
    }, {
      key: 'parseMarker',
      value: function parseMarker(_ref11, parent) {
        var _this7 = this;

        var _ref112 = _slicedToArray(_ref11, 4);

        var type = _ref112[0];
        var markerTypeIndexes = _ref112[1];
        var closeCount = _ref112[2];
        var value = _ref112[3];

        markerTypeIndexes.forEach(function (index) {
          _this7.markups.push(_this7.markerTypes[index]);
        });

        var marker = this.buildMarkerType(type, value);
        parent.markers.append(marker);

        this.markups = this.markups.slice(0, this.markups.length - closeCount);
      }
    }, {
      key: 'buildMarkerType',
      value: function buildMarkerType(type, value) {
        switch (type) {
          case _mobiledocKitRenderersMobiledoc032.MOBILEDOC_MARKUP_MARKER_TYPE:
            return this.builder.createMarker(value, this.markups.slice());
          case _mobiledocKitRenderersMobiledoc032.MOBILEDOC_ATOM_MARKER_TYPE:
            {
              var _getAtomTypeFromIndex = this.getAtomTypeFromIndex(value);

              var _getAtomTypeFromIndex2 = _slicedToArray(_getAtomTypeFromIndex, 3);

              var atomName = _getAtomTypeFromIndex2[0];
              var atomValue = _getAtomTypeFromIndex2[1];
              var atomPayload = _getAtomTypeFromIndex2[2];

              return this.builder.createAtom(atomName, atomValue, atomPayload, this.markups.slice());
            }
          default:
            (0, _mobiledocKitUtilsAssert['default'])('Unexpected marker type ' + type, false);
        }
      }
    }]);

    return MobiledocParser;
  })();

  exports['default'] = MobiledocParser;
});
define('mobiledoc-kit/parsers/mobiledoc/0-3', ['exports', 'mobiledoc-kit/renderers/mobiledoc/0-3', 'mobiledoc-kit/utils/array-utils', 'mobiledoc-kit/utils/assert'], function (exports, _mobiledocKitRenderersMobiledoc03, _mobiledocKitUtilsArrayUtils, _mobiledocKitUtilsAssert) {
  'use strict';

  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  /*
   * Parses from mobiledoc -> post
   */

  var MobiledocParser = (function () {
    function MobiledocParser(builder) {
      _classCallCheck(this, MobiledocParser);

      this.builder = builder;
    }

    /**
     * @param {Mobiledoc}
     * @return {Post}
     */

    _createClass(MobiledocParser, [{
      key: 'parse',
      value: function parse(_ref) {
        var sections = _ref.sections;
        var markerTypes = _ref.markups;
        var cardTypes = _ref.cards;
        var atomTypes = _ref.atoms;

        try {
          var post = this.builder.createPost();

          this.markups = [];
          this.markerTypes = this.parseMarkerTypes(markerTypes);
          this.cardTypes = this.parseCardTypes(cardTypes);
          this.atomTypes = this.parseAtomTypes(atomTypes);
          this.parseSections(sections, post);

          return post;
        } catch (e) {
          (0, _mobiledocKitUtilsAssert['default'])('Unable to parse mobiledoc: ' + e.message, false);
        }
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
        var attributesArray = _ref22[1];

        var attributesObject = (0, _mobiledocKitUtilsArrayUtils.kvArrayToObject)(attributesArray || []);
        return this.builder.createMarkup(tagName, attributesObject);
      }
    }, {
      key: 'parseCardTypes',
      value: function parseCardTypes(cardTypes) {
        var _this2 = this;

        return cardTypes.map(function (cardType) {
          return _this2.parseCardType(cardType);
        });
      }
    }, {
      key: 'parseCardType',
      value: function parseCardType(_ref3) {
        var _ref32 = _slicedToArray(_ref3, 2);

        var cardName = _ref32[0];
        var cardPayload = _ref32[1];

        return [cardName, cardPayload];
      }
    }, {
      key: 'parseAtomTypes',
      value: function parseAtomTypes(atomTypes) {
        var _this3 = this;

        return atomTypes.map(function (atomType) {
          return _this3.parseAtomType(atomType);
        });
      }
    }, {
      key: 'parseAtomType',
      value: function parseAtomType(_ref4) {
        var _ref42 = _slicedToArray(_ref4, 3);

        var atomName = _ref42[0];
        var atomValue = _ref42[1];
        var atomPayload = _ref42[2];

        return [atomName, atomValue, atomPayload];
      }
    }, {
      key: 'parseSections',
      value: function parseSections(sections, post) {
        var _this4 = this;

        sections.forEach(function (section) {
          return _this4.parseSection(section, post);
        });
      }
    }, {
      key: 'parseSection',
      value: function parseSection(section, post) {
        var _section = _slicedToArray(section, 1);

        var type = _section[0];

        switch (type) {
          case _mobiledocKitRenderersMobiledoc03.MOBILEDOC_MARKUP_SECTION_TYPE:
            this.parseMarkupSection(section, post);
            break;
          case _mobiledocKitRenderersMobiledoc03.MOBILEDOC_IMAGE_SECTION_TYPE:
            this.parseImageSection(section, post);
            break;
          case _mobiledocKitRenderersMobiledoc03.MOBILEDOC_CARD_SECTION_TYPE:
            this.parseCardSection(section, post);
            break;
          case _mobiledocKitRenderersMobiledoc03.MOBILEDOC_LIST_SECTION_TYPE:
            this.parseListSection(section, post);
            break;
          default:
            (0, _mobiledocKitUtilsAssert['default'])('Unexpected section type ${type}', false);
        }
      }
    }, {
      key: 'getAtomTypeFromIndex',
      value: function getAtomTypeFromIndex(index) {
        var atomType = this.atomTypes[index];
        (0, _mobiledocKitUtilsAssert['default'])('No atom definition found at index ' + index, !!atomType);
        return atomType;
      }
    }, {
      key: 'getCardTypeFromIndex',
      value: function getCardTypeFromIndex(index) {
        var cardType = this.cardTypes[index];
        (0, _mobiledocKitUtilsAssert['default'])('No card definition found at index ' + index, !!cardType);
        return cardType;
      }
    }, {
      key: 'parseCardSection',
      value: function parseCardSection(_ref5, post) {
        var _ref52 = _slicedToArray(_ref5, 2);

        var cardIndex = _ref52[1];

        var _getCardTypeFromIndex = this.getCardTypeFromIndex(cardIndex);

        var _getCardTypeFromIndex2 = _slicedToArray(_getCardTypeFromIndex, 2);

        var name = _getCardTypeFromIndex2[0];
        var payload = _getCardTypeFromIndex2[1];

        var section = this.builder.createCardSection(name, payload);
        post.sections.append(section);
      }
    }, {
      key: 'parseImageSection',
      value: function parseImageSection(_ref6, post) {
        var _ref62 = _slicedToArray(_ref6, 2);

        var src = _ref62[1];

        var section = this.builder.createImageSection(src);
        post.sections.append(section);
      }
    }, {
      key: 'parseMarkupSection',
      value: function parseMarkupSection(_ref7, post) {
        var _ref72 = _slicedToArray(_ref7, 3);

        var tagName = _ref72[1];
        var markers = _ref72[2];

        var section = this.builder.createMarkupSection(tagName.toLowerCase() === 'pull-quote' ? 'aside' : tagName);
        post.sections.append(section);
        this.parseMarkers(markers, section);
        // Strip blank markers after they have been created. This ensures any
        // markup they include has been correctly populated.
        (0, _mobiledocKitUtilsArrayUtils.filter)(section.markers, function (m) {
          return m.isBlank;
        }).forEach(function (m) {
          section.markers.remove(m);
        });
      }
    }, {
      key: 'parseListSection',
      value: function parseListSection(_ref8, post) {
        var _ref82 = _slicedToArray(_ref8, 3);

        var tagName = _ref82[1];
        var items = _ref82[2];

        var section = this.builder.createListSection(tagName);
        post.sections.append(section);
        this.parseListItems(items, section);
      }
    }, {
      key: 'parseListItems',
      value: function parseListItems(items, section) {
        var _this5 = this;

        items.forEach(function (i) {
          return _this5.parseListItem(i, section);
        });
      }
    }, {
      key: 'parseListItem',
      value: function parseListItem(markers, section) {
        var item = this.builder.createListItem();
        this.parseMarkers(markers, item);
        section.items.append(item);
      }
    }, {
      key: 'parseMarkers',
      value: function parseMarkers(markers, parent) {
        var _this6 = this;

        markers.forEach(function (m) {
          return _this6.parseMarker(m, parent);
        });
      }
    }, {
      key: 'parseMarker',
      value: function parseMarker(_ref9, parent) {
        var _this7 = this;

        var _ref92 = _slicedToArray(_ref9, 4);

        var type = _ref92[0];
        var markerTypeIndexes = _ref92[1];
        var closeCount = _ref92[2];
        var value = _ref92[3];

        markerTypeIndexes.forEach(function (index) {
          _this7.markups.push(_this7.markerTypes[index]);
        });

        var marker = this.buildMarkerType(type, value);
        parent.markers.append(marker);

        this.markups = this.markups.slice(0, this.markups.length - closeCount);
      }
    }, {
      key: 'buildMarkerType',
      value: function buildMarkerType(type, value) {
        switch (type) {
          case _mobiledocKitRenderersMobiledoc03.MOBILEDOC_MARKUP_MARKER_TYPE:
            return this.builder.createMarker(value, this.markups.slice());
          case _mobiledocKitRenderersMobiledoc03.MOBILEDOC_ATOM_MARKER_TYPE:
            {
              var _getAtomTypeFromIndex = this.getAtomTypeFromIndex(value);

              var _getAtomTypeFromIndex2 = _slicedToArray(_getAtomTypeFromIndex, 3);

              var atomName = _getAtomTypeFromIndex2[0];
              var atomValue = _getAtomTypeFromIndex2[1];
              var atomPayload = _getAtomTypeFromIndex2[2];

              return this.builder.createAtom(atomName, atomValue, atomPayload, this.markups.slice());
            }
          default:
            (0, _mobiledocKitUtilsAssert['default'])('Unexpected marker type ' + type, false);
        }
      }
    }]);

    return MobiledocParser;
  })();

  exports['default'] = MobiledocParser;
});
define('mobiledoc-kit/parsers/mobiledoc', ['exports', 'mobiledoc-kit/parsers/mobiledoc/0-2', 'mobiledoc-kit/parsers/mobiledoc/0-3', 'mobiledoc-kit/parsers/mobiledoc/0-3-1', 'mobiledoc-kit/parsers/mobiledoc/0-3-2', 'mobiledoc-kit/renderers/mobiledoc/0-2', 'mobiledoc-kit/renderers/mobiledoc/0-3', 'mobiledoc-kit/renderers/mobiledoc/0-3-1', 'mobiledoc-kit/renderers/mobiledoc/0-3-2', 'mobiledoc-kit/utils/assert'], function (exports, _mobiledocKitParsersMobiledoc02, _mobiledocKitParsersMobiledoc03, _mobiledocKitParsersMobiledoc031, _mobiledocKitParsersMobiledoc032, _mobiledocKitRenderersMobiledoc02, _mobiledocKitRenderersMobiledoc03, _mobiledocKitRenderersMobiledoc031, _mobiledocKitRenderersMobiledoc032, _mobiledocKitUtilsAssert) {
  'use strict';

  function parseVersion(mobiledoc) {
    return mobiledoc.version;
  }

  exports['default'] = {
    parse: function parse(builder, mobiledoc) {
      var version = parseVersion(mobiledoc);
      switch (version) {
        case _mobiledocKitRenderersMobiledoc02.MOBILEDOC_VERSION:
          return new _mobiledocKitParsersMobiledoc02['default'](builder).parse(mobiledoc);
        case _mobiledocKitRenderersMobiledoc03.MOBILEDOC_VERSION:
          return new _mobiledocKitParsersMobiledoc03['default'](builder).parse(mobiledoc);
        case _mobiledocKitRenderersMobiledoc031.MOBILEDOC_VERSION:
          return new _mobiledocKitParsersMobiledoc031['default'](builder).parse(mobiledoc);
        case _mobiledocKitRenderersMobiledoc032.MOBILEDOC_VERSION:
          return new _mobiledocKitParsersMobiledoc032['default'](builder).parse(mobiledoc);
        default:
          (0, _mobiledocKitUtilsAssert['default'])('Unknown version of mobiledoc parser requested: ' + version, false);
      }
    }
  };
});
define('mobiledoc-kit/parsers/section', ['exports', 'mobiledoc-kit/models/markup-section', 'mobiledoc-kit/models/list-section', 'mobiledoc-kit/models/list-item', 'mobiledoc-kit/models/types', 'mobiledoc-kit/models/markup', 'mobiledoc-kit/utils/dom-utils', 'mobiledoc-kit/utils/array-utils', 'mobiledoc-kit/parsers/dom', 'mobiledoc-kit/utils/assert'], function (exports, _mobiledocKitModelsMarkupSection, _mobiledocKitModelsListSection, _mobiledocKitModelsListItem, _mobiledocKitModelsTypes, _mobiledocKitModelsMarkup, _mobiledocKitUtilsDomUtils, _mobiledocKitUtilsArrayUtils, _mobiledocKitParsersDom, _mobiledocKitUtilsAssert) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var SKIPPABLE_ELEMENT_TAG_NAMES = ['style', 'head', 'title', 'meta'].map(_mobiledocKitUtilsDomUtils.normalizeTagName);

  var NEWLINES = /\n/g;
  function sanitize(text) {
    return text.replace(NEWLINES, ' ');
  }

  /**
   * parses an element into a section, ignoring any non-markup
   * elements contained within
   * @private
   */

  var SectionParser = (function () {
    function SectionParser(builder) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      _classCallCheck(this, SectionParser);

      this.builder = builder;
      this.plugins = options.plugins || [];
    }

    _createClass(SectionParser, [{
      key: 'parse',
      value: function parse(element) {
        var _this = this;

        if (this._isSkippable(element)) {
          return [];
        }
        this.sections = [];
        this.state = {};

        this._updateStateFromElement(element);

        var finished = false;

        // top-level text nodes will be run through parseNode later so avoid running
        // the node through parserPlugins twice
        if (!(0, _mobiledocKitUtilsDomUtils.isTextNode)(element)) {
          finished = this.runPlugins(element);
        }

        if (!finished) {
          var childNodes = (0, _mobiledocKitUtilsDomUtils.isTextNode)(element) ? [element] : element.childNodes;

          (0, _mobiledocKitUtilsArrayUtils.forEach)(childNodes, function (el) {
            _this.parseNode(el);
          });
        }

        this._closeCurrentSection();

        return this.sections;
      }
    }, {
      key: 'runPlugins',
      value: function runPlugins(node) {
        var _this2 = this;

        var isNodeFinished = false;
        var env = {
          addSection: function addSection(section) {
            // avoid creating empty paragraphs due to wrapper elements around
            // parser-plugin-handled elements
            if (_this2.state.section.isMarkerable && !_this2.state.text && !_this2.state.section.text) {
              _this2.state.section = null;
            } else {
              _this2._closeCurrentSection();
            }
            _this2.sections.push(section);
          },
          addMarkerable: function addMarkerable(marker) {
            var state = _this2.state;
            var section = state.section;

            (0, _mobiledocKitUtilsAssert['default'])('Markerables can only be appended to markup sections and list item sections', section && section.isMarkerable);
            if (state.text) {
              _this2._createMarker();
            }
            section.markers.append(marker);
          },
          nodeFinished: function nodeFinished() {
            isNodeFinished = true;
          }
        };
        for (var i = 0; i < this.plugins.length; i++) {
          var plugin = this.plugins[i];
          plugin(node, this.builder, env);
          if (isNodeFinished) {
            return true;
          }
        }
        return false;
      }

      /* eslint-disable complexity */
    }, {
      key: 'parseNode',
      value: function parseNode(node) {
        var _this3 = this;

        if (!this.state.section) {
          this._updateStateFromElement(node);
        }

        var nodeFinished = this.runPlugins(node);
        if (nodeFinished) {
          return;
        }

        // handle closing the current section and starting a new one if we hit a
        // new-section-creating element.
        if (this.state.section && !(0, _mobiledocKitUtilsDomUtils.isTextNode)(node) && node.tagName) {
          var tagName = (0, _mobiledocKitUtilsDomUtils.normalizeTagName)(node.tagName);
          var isListSection = (0, _mobiledocKitUtilsArrayUtils.contains)(_mobiledocKitModelsListSection.VALID_LIST_SECTION_TAGNAMES, tagName);
          var isListItem = (0, _mobiledocKitUtilsArrayUtils.contains)(_mobiledocKitModelsListItem.VALID_LIST_ITEM_TAGNAMES, tagName);
          var isMarkupSection = (0, _mobiledocKitUtilsArrayUtils.contains)(_mobiledocKitModelsMarkupSection.VALID_MARKUP_SECTION_TAGNAMES, tagName);
          var isNestedListSection = isListSection && this.state.section.isListItem;
          var lastSection = this.sections[this.sections.length - 1];

          // we can hit a list item after parsing a nested list, when that happens
          // and the lists are of different types we need to make sure we switch
          // the list type back
          if (isListItem && lastSection && lastSection.isListSection) {
            var parentElement = node.parentElement;
            var parentElementTagName = (0, _mobiledocKitUtilsDomUtils.normalizeTagName)(parentElement.tagName);
            if (parentElementTagName !== lastSection.tagName) {
              this._closeCurrentSection();
              this._updateStateFromElement(parentElement);
            }
          }

          // if we've broken out of a list due to nested section-level elements we
          // can hit the next list item without having a list section in the current
          // state. In this instance we find the parent list node and use it to
          // re-initialize the state with a new list section
          if (isListItem && !(this.state.section.isListItem || this.state.section.isListSection) && !lastSection.isListSection) {
            this._closeCurrentSection();
            this._updateStateFromElement(node.parentElement);
          }

          // if we have consecutive list sections of different types (ul, ol) then
          // ensure we close the current section and start a new one
          var isNewListSection = lastSection && lastSection.isListSection && this.state.section.isListItem && isListSection && tagName !== lastSection.tagName;

          if (isNewListSection || isListSection && !isNestedListSection || isMarkupSection || isListItem) {
            // don't break out of the list for list items that contain a single <p>.
            // deals with typical case of <li><p>Text</p></li><li><p>Text</p></li>
            if (this.state.section.isListItem && tagName === 'p' && !node.nextSibling && (0, _mobiledocKitUtilsArrayUtils.contains)(_mobiledocKitModelsListItem.VALID_LIST_ITEM_TAGNAMES, (0, _mobiledocKitUtilsDomUtils.normalizeTagName)(node.parentElement.tagName))) {
              this.parseElementNode(node);
              return;
            }

            // avoid creating empty paragraphs due to wrapper elements around
            // section-creating elements
            if (this.state.section.isMarkerable && !this.state.text && this.state.section.markers.length === 0) {
              this.state.section = null;
            } else {
              this._closeCurrentSection();
            }

            this._updateStateFromElement(node);
          }

          if (this.state.section.isListSection) {
            // ensure the list section is closed and added to the sections list.
            // _closeCurrentSection handles pushing list items onto the list section
            this._closeCurrentSection();

            (0, _mobiledocKitUtilsArrayUtils.forEach)(node.childNodes, function (node) {
              _this3.parseNode(node);
            });
            return;
          }
        }

        switch (node.nodeType) {
          case _mobiledocKitUtilsDomUtils.NODE_TYPES.TEXT:
            this.parseTextNode(node);
            break;
          case _mobiledocKitUtilsDomUtils.NODE_TYPES.ELEMENT:
            this.parseElementNode(node);
            break;
        }
      }
    }, {
      key: 'parseElementNode',
      value: function parseElementNode(element) {
        var _state$markups,
            _this4 = this;

        var state = this.state;

        var markups = this._markupsFromElement(element);
        if (markups.length && state.text.length && state.section.isMarkerable) {
          this._createMarker();
        }
        (_state$markups = state.markups).push.apply(_state$markups, _toConsumableArray(markups));

        (0, _mobiledocKitUtilsArrayUtils.forEach)(element.childNodes, function (node) {
          _this4.parseNode(node);
        });

        if (markups.length && state.text.length && state.section.isMarkerable) {
          // create the marker started for this node
          this._createMarker();
        }

        // pop the current markups from the stack
        state.markups.splice(-markups.length, markups.length);
      }
    }, {
      key: 'parseTextNode',
      value: function parseTextNode(textNode) {
        var state = this.state;

        state.text += sanitize(textNode.textContent);
      }
    }, {
      key: '_updateStateFromElement',
      value: function _updateStateFromElement(element) {
        var state = this.state;

        state.section = this._createSectionFromElement(element);
        state.markups = this._markupsFromElement(element);
        state.text = '';
      }
    }, {
      key: '_closeCurrentSection',
      value: function _closeCurrentSection() {
        var sections = this.sections;
        var state = this.state;

        var lastSection = sections[sections.length - 1];

        if (!state.section) {
          return;
        }

        // close a trailing text node if it exists
        if (state.text.length && state.section.isMarkerable) {
          this._createMarker();
        }

        // push listItems onto the listSection or add a new section
        if (state.section.isListItem && lastSection && lastSection.isListSection) {
          (0, _mobiledocKitParsersDom.trimSectionText)(state.section);
          lastSection.items.append(state.section);
        } else {
          // avoid creating empty markup sections, especially useful for indented source
          if (state.section.isMarkerable && !state.section.text.trim() && !(0, _mobiledocKitUtilsArrayUtils.any)(state.section.markers, function (marker) {
            return marker.isAtom;
          })) {
            state.section = null;
            state.text = '';
            return;
          }

          // remove empty list sections before creating a new section
          if (lastSection && lastSection.isListSection && lastSection.items.length === 0) {
            sections.pop();
          }

          sections.push(state.section);
        }

        state.section = null;
        state.text = '';
      }
    }, {
      key: '_markupsFromElement',
      value: function _markupsFromElement(element) {
        var builder = this.builder;

        var markups = [];
        if ((0, _mobiledocKitUtilsDomUtils.isTextNode)(element)) {
          return markups;
        }

        var tagName = (0, _mobiledocKitUtilsDomUtils.normalizeTagName)(element.tagName);
        if (this._isValidMarkupForElement(tagName, element)) {
          markups.push(builder.createMarkup(tagName, (0, _mobiledocKitUtilsDomUtils.getAttributes)(element)));
        }

        this._markupsFromElementStyle(element).forEach(function (markup) {
          return markups.push(markup);
        });

        return markups;
      }
    }, {
      key: '_isValidMarkupForElement',
      value: function _isValidMarkupForElement(tagName, element) {
        if (_mobiledocKitModelsMarkup.VALID_MARKUP_TAGNAMES.indexOf(tagName) === -1) {
          return false;
        } else if (tagName === 'b') {
          // google docs add a <b style="font-weight: normal;"> that should not
          // create a "b" markup
          return element.style.fontWeight !== 'normal';
        }
        return true;
      }
    }, {
      key: '_markupsFromElementStyle',
      value: function _markupsFromElementStyle(element) {
        var builder = this.builder;

        var markups = [];
        var _element$style = element.style;
        var fontStyle = _element$style.fontStyle;
        var fontWeight = _element$style.fontWeight;

        if (fontStyle === 'italic') {
          markups.push(builder.createMarkup('em'));
        }
        if (fontWeight === 'bold' || fontWeight === '700') {
          markups.push(builder.createMarkup('strong'));
        }
        return markups;
      }
    }, {
      key: '_createMarker',
      value: function _createMarker() {
        var state = this.state;

        var text = (0, _mobiledocKitParsersDom.transformHTMLText)(state.text);
        var marker = this.builder.createMarker(text, state.markups);
        state.section.markers.append(marker);
        state.text = '';
      }
    }, {
      key: '_getSectionDetails',
      value: function _getSectionDetails(element) {
        var sectionType = undefined,
            tagName = undefined,
            inferredTagName = false;
        if ((0, _mobiledocKitUtilsDomUtils.isTextNode)(element)) {
          tagName = _mobiledocKitModelsMarkupSection.DEFAULT_TAG_NAME;
          sectionType = _mobiledocKitModelsTypes.MARKUP_SECTION_TYPE;
          inferredTagName = true;
        } else {
          tagName = (0, _mobiledocKitUtilsDomUtils.normalizeTagName)(element.tagName);

          if ((0, _mobiledocKitUtilsArrayUtils.contains)(_mobiledocKitModelsListSection.VALID_LIST_SECTION_TAGNAMES, tagName)) {
            sectionType = _mobiledocKitModelsTypes.LIST_SECTION_TYPE;
          } else if ((0, _mobiledocKitUtilsArrayUtils.contains)(_mobiledocKitModelsListItem.VALID_LIST_ITEM_TAGNAMES, tagName)) {
            sectionType = _mobiledocKitModelsTypes.LIST_ITEM_TYPE;
          } else if ((0, _mobiledocKitUtilsArrayUtils.contains)(_mobiledocKitModelsMarkupSection.VALID_MARKUP_SECTION_TAGNAMES, tagName)) {
            sectionType = _mobiledocKitModelsTypes.MARKUP_SECTION_TYPE;
          } else {
            sectionType = _mobiledocKitModelsTypes.MARKUP_SECTION_TYPE;
            tagName = _mobiledocKitModelsMarkupSection.DEFAULT_TAG_NAME;
            inferredTagName = true;
          }
        }

        return { sectionType: sectionType, tagName: tagName, inferredTagName: inferredTagName };
      }
    }, {
      key: '_createSectionFromElement',
      value: function _createSectionFromElement(element) {
        var builder = this.builder;

        var section = undefined;

        var _getSectionDetails2 = this._getSectionDetails(element);

        var tagName = _getSectionDetails2.tagName;
        var sectionType = _getSectionDetails2.sectionType;
        var inferredTagName = _getSectionDetails2.inferredTagName;

        switch (sectionType) {
          case _mobiledocKitModelsTypes.LIST_SECTION_TYPE:
            section = builder.createListSection(tagName);
            break;
          case _mobiledocKitModelsTypes.LIST_ITEM_TYPE:
            section = builder.createListItem();
            break;
          case _mobiledocKitModelsTypes.MARKUP_SECTION_TYPE:
            section = builder.createMarkupSection(tagName);
            section._inferredTagName = inferredTagName;
            break;
          default:
            (0, _mobiledocKitUtilsAssert['default'])('Cannot parse section from element', false);
        }

        return section;
      }
    }, {
      key: '_isSkippable',
      value: function _isSkippable(element) {
        return (0, _mobiledocKitUtilsDomUtils.isCommentNode)(element) || element.nodeType === _mobiledocKitUtilsDomUtils.NODE_TYPES.ELEMENT && (0, _mobiledocKitUtilsArrayUtils.contains)(SKIPPABLE_ELEMENT_TAG_NAMES, (0, _mobiledocKitUtilsDomUtils.normalizeTagName)(element.tagName));
      }
    }]);

    return SectionParser;
  })();

  exports['default'] = SectionParser;
});
define('mobiledoc-kit/parsers/text', ['exports', 'mobiledoc-kit/utils/assert', 'mobiledoc-kit/models/types', 'mobiledoc-kit/models/markup-section'], function (exports, _mobiledocKitUtilsAssert, _mobiledocKitModelsTypes, _mobiledocKitModelsMarkupSection) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var UL_LI_REGEX = /^\* (.*)$/;
  var OL_LI_REGEX = /^\d\.? (.*)$/;
  var CR = '\r';
  var LF = '\n';
  var CR_REGEX = new RegExp(CR, 'g');
  var CR_LF_REGEX = new RegExp(CR + LF, 'g');

  var SECTION_BREAK = LF;

  exports.SECTION_BREAK = SECTION_BREAK;
  function normalizeLineEndings(text) {
    return text.replace(CR_LF_REGEX, LF).replace(CR_REGEX, LF);
  }

  var TextParser = (function () {
    function TextParser(builder, options) {
      _classCallCheck(this, TextParser);

      this.builder = builder;
      this.options = options;

      this.post = this.builder.createPost();
      this.prevSection = null;
    }

    /**
     * @param {String} text to parse
     * @return {Post} a post abstract
     */

    _createClass(TextParser, [{
      key: 'parse',
      value: function parse(text) {
        var _this = this;

        text = normalizeLineEndings(text);
        text.split(SECTION_BREAK).forEach(function (text) {
          var section = _this._parseSection(text);
          _this._appendSection(section);
        });

        return this.post;
      }
    }, {
      key: '_parseSection',
      value: function _parseSection(text) {
        var tagName = _mobiledocKitModelsMarkupSection.DEFAULT_TAG_NAME,
            type = _mobiledocKitModelsTypes.MARKUP_SECTION_TYPE,
            section = undefined;

        if (UL_LI_REGEX.test(text)) {
          tagName = 'ul';
          type = _mobiledocKitModelsTypes.LIST_SECTION_TYPE;
          text = text.match(UL_LI_REGEX)[1];
        } else if (OL_LI_REGEX.test(text)) {
          tagName = 'ol';
          type = _mobiledocKitModelsTypes.LIST_SECTION_TYPE;
          text = text.match(OL_LI_REGEX)[1];
        }

        var markers = [this.builder.createMarker(text)];

        switch (type) {
          case _mobiledocKitModelsTypes.LIST_SECTION_TYPE:
            {
              var item = this.builder.createListItem(markers);
              var list = this.builder.createListSection(tagName, [item]);
              section = list;
              break;
            }
          case _mobiledocKitModelsTypes.MARKUP_SECTION_TYPE:
            section = this.builder.createMarkupSection(tagName, markers);
            break;
          default:
            (0, _mobiledocKitUtilsAssert['default'])('Unknown type encountered ' + type, false);
        }

        return section;
      }
    }, {
      key: '_appendSection',
      value: function _appendSection(section) {
        var _this2 = this;

        var isSameListSection = section.isListSection && this.prevSection && this.prevSection.isListSection && this.prevSection.tagName === section.tagName;

        if (isSameListSection) {
          section.items.forEach(function (item) {
            _this2.prevSection.items.append(item.clone());
          });
        } else {
          this.post.sections.insertAfter(section, this.prevSection);
          this.prevSection = section;
        }
      }
    }]);

    return TextParser;
  })();

  exports['default'] = TextParser;
});
define('mobiledoc-kit/renderers/editor-dom', ['exports', 'mobiledoc-kit/models/card-node', 'mobiledoc-kit/utils/array-utils', 'mobiledoc-kit/models/atom-node', 'mobiledoc-kit/models/types', 'mobiledoc-kit/utils/string-utils', 'mobiledoc-kit/utils/dom-utils', 'mobiledoc-kit/models/markup-section', 'mobiledoc-kit/utils/assert', 'mobiledoc-kit/utils/characters'], function (exports, _mobiledocKitModelsCardNode, _mobiledocKitUtilsArrayUtils, _mobiledocKitModelsAtomNode, _mobiledocKitModelsTypes, _mobiledocKitUtilsStringUtils, _mobiledocKitUtilsDomUtils, _mobiledocKitModelsMarkupSection, _mobiledocKitUtilsAssert, _mobiledocKitUtilsCharacters) {
  'use strict';

  var _destroyHooks;

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var CARD_ELEMENT_CLASS_NAME = '__mobiledoc-card';
  exports.CARD_ELEMENT_CLASS_NAME = CARD_ELEMENT_CLASS_NAME;
  var NO_BREAK_SPACE = ' ';
  exports.NO_BREAK_SPACE = NO_BREAK_SPACE;
  var TAB_CHARACTER = ' ';
  exports.TAB_CHARACTER = TAB_CHARACTER;
  var SPACE = ' ';
  exports.SPACE = SPACE;
  var ZWNJ = '‌';
  exports.ZWNJ = ZWNJ;
  var ATOM_CLASS_NAME = '-mobiledoc-kit__atom';
  exports.ATOM_CLASS_NAME = ATOM_CLASS_NAME;
  var EDITOR_HAS_NO_CONTENT_CLASS_NAME = '__has-no-content';
  exports.EDITOR_HAS_NO_CONTENT_CLASS_NAME = EDITOR_HAS_NO_CONTENT_CLASS_NAME;
  var EDITOR_ELEMENT_CLASS_NAME = '__mobiledoc-editor';

  exports.EDITOR_ELEMENT_CLASS_NAME = EDITOR_ELEMENT_CLASS_NAME;
  function createElementFromMarkup(doc, markup) {
    var element = doc.createElement(markup.tagName);
    Object.keys(markup.attributes).forEach(function (k) {
      element.setAttribute(k, markup.attributes[k]);
    });
    return element;
  }

  var TWO_SPACES = '' + SPACE + SPACE;
  var SPACE_AND_NO_BREAK = '' + SPACE + NO_BREAK_SPACE;
  var SPACES_REGEX = new RegExp(TWO_SPACES, 'g');
  var TAB_REGEX = new RegExp(_mobiledocKitUtilsCharacters.TAB, 'g');
  var endsWithSpace = function endsWithSpace(text) {
    return (0, _mobiledocKitUtilsStringUtils.endsWith)(text, SPACE);
  };
  var startsWithSpace = function startsWithSpace(text) {
    return (0, _mobiledocKitUtilsStringUtils.startsWith)(text, SPACE);
  };

  // FIXME: This can be done more efficiently with a single pass
  // building a correct string based on the original.
  function renderHTMLText(marker) {
    var text = marker.value;
    text = text.replace(SPACES_REGEX, SPACE_AND_NO_BREAK).replace(TAB_REGEX, TAB_CHARACTER);

    // If the first marker has a leading space or the last marker has a
    // trailing space, the browser will collapse the space when we position
    // the cursor.
    // See https://github.com/bustle/mobiledoc-kit/issues/68
    //   and https://github.com/bustle/mobiledoc-kit/issues/75
    if (marker.isMarker && endsWithSpace(text) && !marker.next) {
      text = text.substr(0, text.length - 1) + NO_BREAK_SPACE;
    }
    if (marker.isMarker && startsWithSpace(text) && (!marker.prev || marker.prev.isMarker && endsWithSpace(marker.prev.value))) {
      text = NO_BREAK_SPACE + text.substr(1);
    }
    return text;
  }

  // ascends from element upward, returning the last parent node that is not
  // parentElement
  function penultimateParentOf(element, parentElement) {
    while (parentElement && element.parentNode !== parentElement && element.parentNode !== document.body // ensure the while loop stops
    ) {
      element = element.parentNode;
    }
    return element;
  }

  function setSectionAttributesOnElement(section, element) {
    section.eachAttribute(function (key, value) {
      element.setAttribute(key, value);
    });
  }

  function renderMarkupSection(section) {
    var element = undefined;
    if (_mobiledocKitModelsMarkupSection.MARKUP_SECTION_ELEMENT_NAMES.indexOf(section.tagName) !== -1) {
      element = document.createElement(section.tagName);
    } else {
      element = document.createElement('div');
      (0, _mobiledocKitUtilsDomUtils.addClassName)(element, section.tagName);
    }

    setSectionAttributesOnElement(section, element);

    return element;
  }

  function renderListSection(section) {
    var element = document.createElement(section.tagName);

    setSectionAttributesOnElement(section, element);

    return element;
  }

  function renderListItem() {
    return document.createElement('li');
  }

  function renderCursorPlaceholder() {
    return document.createElement('br');
  }

  function renderInlineCursorPlaceholder() {
    return document.createTextNode(ZWNJ);
  }

  function renderCard() {
    var wrapper = document.createElement('div');
    var cardElement = document.createElement('div');
    cardElement.contentEditable = false;
    (0, _mobiledocKitUtilsDomUtils.addClassName)(cardElement, CARD_ELEMENT_CLASS_NAME);
    wrapper.appendChild(renderInlineCursorPlaceholder());
    wrapper.appendChild(cardElement);
    wrapper.appendChild(renderInlineCursorPlaceholder());
    return { wrapper: wrapper, cardElement: cardElement };
  }

  /**
   * Wrap the element in all of the opened markups
   * @return {DOMElement} the wrapped element
   * @private
   */
  function wrapElement(element, openedMarkups) {
    var wrappedElement = element;

    for (var i = openedMarkups.length - 1; i >= 0; i--) {
      var markup = openedMarkups[i];
      var openedElement = createElementFromMarkup(document, markup);
      openedElement.appendChild(wrappedElement);
      wrappedElement = openedElement;
    }

    return wrappedElement;
  }

  // Attach the element to its parent element at the correct position based on the
  // previousRenderNode
  function attachElementToParent(element, parentElement) {
    var previousRenderNode = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

    if (previousRenderNode) {
      var previousSibling = previousRenderNode.element;
      var previousSiblingPenultimate = penultimateParentOf(previousSibling, parentElement);
      parentElement.insertBefore(element, previousSiblingPenultimate.nextSibling);
    } else {
      parentElement.insertBefore(element, parentElement.firstChild);
    }
  }

  function renderAtom(atom, element, previousRenderNode) {
    var atomElement = document.createElement('span');
    atomElement.contentEditable = false;

    var wrapper = document.createElement('span');
    (0, _mobiledocKitUtilsDomUtils.addClassName)(wrapper, ATOM_CLASS_NAME);
    var headTextNode = renderInlineCursorPlaceholder();
    var tailTextNode = renderInlineCursorPlaceholder();

    wrapper.appendChild(headTextNode);
    wrapper.appendChild(atomElement);
    wrapper.appendChild(tailTextNode);

    var wrappedElement = wrapElement(wrapper, atom.openedMarkups);
    attachElementToParent(wrappedElement, element, previousRenderNode);

    return {
      markupElement: wrappedElement,
      wrapper: wrapper,
      atomElement: atomElement,
      headTextNode: headTextNode,
      tailTextNode: tailTextNode
    };
  }

  function getNextMarkerElement(renderNode) {
    var element = renderNode.element.parentNode;
    var marker = renderNode.postNode;
    var closedCount = marker.closedMarkups.length;

    while (closedCount--) {
      element = element.parentNode;
    }
    return element;
  }

  /**
   * Render the marker
   * @param {Marker} marker the marker to render
   * @param {DOMNode} element the element to attach the rendered marker to
   * @param {RenderNode} [previousRenderNode] The render node before this one, which
   *        affects the determination of where to insert this rendered marker.
   * @return {Object} With properties `element` and `markupElement`.
   *         The element (textNode) that has the text for
   *         this marker, and the outermost rendered element. If the marker has no
   *         markups, element and markupElement will be the same textNode
   * @private
   */
  function renderMarker(marker, parentElement, previousRenderNode) {
    var text = renderHTMLText(marker);

    var element = document.createTextNode(text);
    var markupElement = wrapElement(element, marker.openedMarkups);
    attachElementToParent(markupElement, parentElement, previousRenderNode);

    return { element: element, markupElement: markupElement };
  }

  // Attach the render node's element to the DOM,
  // replacing the originalElement if it exists
  function attachRenderNodeElementToDOM(renderNode) {
    var originalElement = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    var element = renderNode.element;
    var hasRendered = !!originalElement;

    if (hasRendered) {
      var parentElement = renderNode.parent.element;
      parentElement.replaceChild(element, originalElement);
    } else {
      var parentElement = undefined,
          nextSiblingElement = undefined;
      if (renderNode.prev) {
        var previousElement = renderNode.prev.element;
        parentElement = previousElement.parentNode;
        nextSiblingElement = previousElement.nextSibling;
      } else {
        parentElement = renderNode.parent.element;
        nextSiblingElement = parentElement.firstChild;
      }
      parentElement.insertBefore(element, nextSiblingElement);
    }
  }

  function removeRenderNodeSectionFromParent(renderNode, section) {
    var parent = renderNode.parent.postNode;
    parent.sections.remove(section);
  }

  function removeRenderNodeElementFromParent(renderNode) {
    if (renderNode.element && renderNode.element.parentNode) {
      renderNode.element.parentNode.removeChild(renderNode.element);
    }
  }

  function validateCards() {
    var cards = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

    (0, _mobiledocKitUtilsArrayUtils.forEach)(cards, function (card) {
      (0, _mobiledocKitUtilsAssert['default'])('Card "' + card.name + '" must define type "dom", has: "' + card.type + '"', card.type === 'dom');
      (0, _mobiledocKitUtilsAssert['default'])('Card "' + card.name + '" must define `render` method', !!card.render);
    });
    return cards;
  }

  function validateAtoms() {
    var atoms = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

    (0, _mobiledocKitUtilsArrayUtils.forEach)(atoms, function (atom) {
      (0, _mobiledocKitUtilsAssert['default'])('Atom "' + atom.name + '" must define type "dom", has: "' + atom.type + '"', atom.type === 'dom');
      (0, _mobiledocKitUtilsAssert['default'])('Atom "' + atom.name + '" must define `render` method', !!atom.render);
    });
    return atoms;
  }

  var Visitor = (function () {
    function Visitor(editor, cards, atoms, unknownCardHandler, unknownAtomHandler, options) {
      _classCallCheck(this, Visitor);

      this.editor = editor;
      this.cards = validateCards(cards);
      this.atoms = validateAtoms(atoms);
      this.unknownCardHandler = unknownCardHandler;
      this.unknownAtomHandler = unknownAtomHandler;
      this.options = options;
    }

    _createClass(Visitor, [{
      key: '_findCard',
      value: function _findCard(cardName) {
        var card = (0, _mobiledocKitUtilsArrayUtils.detect)(this.cards, function (card) {
          return card.name === cardName;
        });
        return card || this._createUnknownCard(cardName);
      }
    }, {
      key: '_createUnknownCard',
      value: function _createUnknownCard(cardName) {
        (0, _mobiledocKitUtilsAssert['default'])('Unknown card "' + cardName + '" found, but no unknownCardHandler is defined', !!this.unknownCardHandler);

        return {
          name: cardName,
          type: 'dom',
          render: this.unknownCardHandler,
          edit: this.unknownCardHandler
        };
      }
    }, {
      key: '_findAtom',
      value: function _findAtom(atomName) {
        var atom = (0, _mobiledocKitUtilsArrayUtils.detect)(this.atoms, function (atom) {
          return atom.name === atomName;
        });
        return atom || this._createUnknownAtom(atomName);
      }
    }, {
      key: '_createUnknownAtom',
      value: function _createUnknownAtom(atomName) {
        (0, _mobiledocKitUtilsAssert['default'])('Unknown atom "' + atomName + '" found, but no unknownAtomHandler is defined', !!this.unknownAtomHandler);

        return {
          name: atomName,
          type: 'dom',
          render: this.unknownAtomHandler
        };
      }
    }, {
      key: _mobiledocKitModelsTypes.POST_TYPE,
      value: function value(renderNode, post, visit) {
        if (!renderNode.element) {
          renderNode.element = document.createElement('div');
        }
        (0, _mobiledocKitUtilsDomUtils.addClassName)(renderNode.element, EDITOR_ELEMENT_CLASS_NAME);
        if (post.hasContent) {
          (0, _mobiledocKitUtilsDomUtils.removeClassName)(renderNode.element, EDITOR_HAS_NO_CONTENT_CLASS_NAME);
        } else {
          (0, _mobiledocKitUtilsDomUtils.addClassName)(renderNode.element, EDITOR_HAS_NO_CONTENT_CLASS_NAME);
        }
        visit(renderNode, post.sections);
      }
    }, {
      key: _mobiledocKitModelsTypes.MARKUP_SECTION_TYPE,
      value: function value(renderNode, section, visit) {
        var originalElement = renderNode.element;

        // Always rerender the section -- its tag name or attributes may have changed.
        // TODO make this smarter, only rerendering and replacing the element when necessary
        renderNode.element = renderMarkupSection(section);
        renderNode.cursorElement = null;
        attachRenderNodeElementToDOM(renderNode, originalElement);

        if (section.isBlank) {
          var cursorPlaceholder = renderCursorPlaceholder();
          renderNode.element.appendChild(cursorPlaceholder);
          renderNode.cursorElement = cursorPlaceholder;
        } else {
          var visitAll = true;
          visit(renderNode, section.markers, visitAll);
        }
      }
    }, {
      key: _mobiledocKitModelsTypes.LIST_SECTION_TYPE,
      value: function value(renderNode, section, visit) {
        var originalElement = renderNode.element;

        renderNode.element = renderListSection(section);
        attachRenderNodeElementToDOM(renderNode, originalElement);

        var visitAll = true;
        visit(renderNode, section.items, visitAll);
      }
    }, {
      key: _mobiledocKitModelsTypes.LIST_ITEM_TYPE,
      value: function value(renderNode, item, visit) {
        // FIXME do we need to do anything special for rerenders?
        renderNode.element = renderListItem();
        renderNode.cursorElement = null;
        attachRenderNodeElementToDOM(renderNode, null);

        if (item.isBlank) {
          var cursorPlaceholder = renderCursorPlaceholder();
          renderNode.element.appendChild(cursorPlaceholder);
          renderNode.cursorElement = cursorPlaceholder;
        } else {
          var visitAll = true;
          visit(renderNode, item.markers, visitAll);
        }
      }
    }, {
      key: _mobiledocKitModelsTypes.MARKER_TYPE,
      value: function value(renderNode, marker) {
        var parentElement = undefined;

        if (renderNode.prev) {
          parentElement = getNextMarkerElement(renderNode.prev);
        } else {
          parentElement = renderNode.parent.element;
        }

        var _renderMarker = renderMarker(marker, parentElement, renderNode.prev);

        var element = _renderMarker.element;
        var markupElement = _renderMarker.markupElement;

        renderNode.element = element;
        renderNode.markupElement = markupElement;
      }
    }, {
      key: _mobiledocKitModelsTypes.IMAGE_SECTION_TYPE,
      value: function value(renderNode, section) {
        if (renderNode.element) {
          if (renderNode.element.src !== section.src) {
            renderNode.element.src = section.src;
          }
        } else {
          var element = document.createElement('img');
          element.src = section.src;
          if (renderNode.prev) {
            var previousElement = renderNode.prev.element;
            var nextElement = previousElement.nextSibling;
            if (nextElement) {
              nextElement.parentNode.insertBefore(element, nextElement);
            }
          }
          if (!element.parentNode) {
            renderNode.parent.element.appendChild(element);
          }
          renderNode.element = element;
        }
      }
    }, {
      key: _mobiledocKitModelsTypes.CARD_TYPE,
      value: function value(renderNode, section) {
        var originalElement = renderNode.element;
        var editor = this.editor;
        var options = this.options;

        var card = this._findCard(section.name);

        var _renderCard = renderCard();

        var wrapper = _renderCard.wrapper;
        var cardElement = _renderCard.cardElement;

        renderNode.element = wrapper;
        attachRenderNodeElementToDOM(renderNode, originalElement);

        var cardNode = new _mobiledocKitModelsCardNode['default'](editor, card, section, cardElement, options);
        renderNode.cardNode = cardNode;

        var initialMode = section._initialMode;
        cardNode[initialMode]();
      }
    }, {
      key: _mobiledocKitModelsTypes.ATOM_TYPE,
      value: function value(renderNode, atomModel) {
        var parentElement = undefined;

        if (renderNode.prev) {
          parentElement = getNextMarkerElement(renderNode.prev);
        } else {
          parentElement = renderNode.parent.element;
        }

        var editor = this.editor;
        var options = this.options;

        var _renderAtom = renderAtom(atomModel, parentElement, renderNode.prev);

        var wrapper = _renderAtom.wrapper;
        var markupElement = _renderAtom.markupElement;
        var atomElement = _renderAtom.atomElement;
        var headTextNode = _renderAtom.headTextNode;
        var tailTextNode = _renderAtom.tailTextNode;

        var atom = this._findAtom(atomModel.name);

        var atomNode = renderNode.atomNode;
        if (!atomNode) {
          // create new AtomNode
          atomNode = new _mobiledocKitModelsAtomNode['default'](editor, atom, atomModel, atomElement, options);
        } else {
          // retarget atomNode to new atom element
          atomNode.element = atomElement;
        }

        atomNode.render();

        renderNode.atomNode = atomNode;
        renderNode.element = wrapper;
        renderNode.headTextNode = headTextNode;
        renderNode.tailTextNode = tailTextNode;
        renderNode.markupElement = markupElement;
      }
    }]);

    return Visitor;
  })();

  var destroyHooks = (_destroyHooks = {}, _defineProperty(_destroyHooks, _mobiledocKitModelsTypes.POST_TYPE, function () /*renderNode, post*/{
    (0, _mobiledocKitUtilsAssert['default'])('post destruction is not supported by the renderer', false);
  }), _defineProperty(_destroyHooks, _mobiledocKitModelsTypes.MARKUP_SECTION_TYPE, function (renderNode, section) {
    removeRenderNodeSectionFromParent(renderNode, section);
    removeRenderNodeElementFromParent(renderNode);
  }), _defineProperty(_destroyHooks, _mobiledocKitModelsTypes.LIST_SECTION_TYPE, function (renderNode, section) {
    removeRenderNodeSectionFromParent(renderNode, section);
    removeRenderNodeElementFromParent(renderNode);
  }), _defineProperty(_destroyHooks, _mobiledocKitModelsTypes.LIST_ITEM_TYPE, function (renderNode, li) {
    removeRenderNodeSectionFromParent(renderNode, li);
    removeRenderNodeElementFromParent(renderNode);
  }), _defineProperty(_destroyHooks, _mobiledocKitModelsTypes.MARKER_TYPE, function (renderNode, marker) {
    // FIXME before we render marker, should delete previous renderNode's element
    // and up until the next marker element

    // If an atom throws during render we may end up later destroying a renderNode
    // that has not rendered yet, so exit early here if so.
    if (!renderNode.isRendered) {
      return;
    }
    var markupElement = renderNode.markupElement;

    if (marker.section) {
      marker.section.markers.remove(marker);
    }

    if (markupElement.parentNode) {
      // if no parentNode, the browser already removed this element
      markupElement.parentNode.removeChild(markupElement);
    }
  }), _defineProperty(_destroyHooks, _mobiledocKitModelsTypes.IMAGE_SECTION_TYPE, function (renderNode, section) {
    removeRenderNodeSectionFromParent(renderNode, section);
    removeRenderNodeElementFromParent(renderNode);
  }), _defineProperty(_destroyHooks, _mobiledocKitModelsTypes.CARD_TYPE, function (renderNode, section) {
    if (renderNode.cardNode) {
      renderNode.cardNode.teardown();
    }
    removeRenderNodeSectionFromParent(renderNode, section);
    removeRenderNodeElementFromParent(renderNode);
  }), _defineProperty(_destroyHooks, _mobiledocKitModelsTypes.ATOM_TYPE, function (renderNode, atom) {
    if (renderNode.atomNode) {
      renderNode.atomNode.teardown();
    }

    // an atom is a kind of marker so just call its destroy hook vs copying here
    destroyHooks[_mobiledocKitModelsTypes.MARKER_TYPE](renderNode, atom);
  }), _destroyHooks);

  // removes children from parentNode (a RenderNode) that are scheduled for removal
  function removeDestroyedChildren(parentNode) {
    var forceRemoval = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

    var child = parentNode.childNodes.head;
    var nextChild = undefined,
        method = undefined;
    while (child) {
      nextChild = child.next;
      if (child.isRemoved || forceRemoval) {
        removeDestroyedChildren(child, true);
        method = child.postNode.type;
        (0, _mobiledocKitUtilsAssert['default'])('editor-dom cannot destroy "' + method + '"', !!destroyHooks[method]);
        destroyHooks[method](child, child.postNode);
        parentNode.childNodes.remove(child);
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
      var renderNode = renderTree.buildRenderNode(postNode);
      parentNode.childNodes.insertAfter(renderNode, previousNode);
      return renderNode;
    }
  }

  var Renderer = (function () {
    function Renderer(editor, cards, atoms, unknownCardHandler, unknownAtomHandler, options) {
      _classCallCheck(this, Renderer);

      this.editor = editor;
      this.visitor = new Visitor(editor, cards, atoms, unknownCardHandler, unknownAtomHandler, options);
      this.nodes = [];
      this.hasRendered = false;
    }

    _createClass(Renderer, [{
      key: 'destroy',
      value: function destroy() {
        if (!this.hasRendered) {
          return;
        }
        var renderNode = this.renderTree.rootNode;
        var force = true;
        removeDestroyedChildren(renderNode, force);
      }
    }, {
      key: 'visit',
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
      key: 'render',
      value: function render(renderTree) {
        var _this2 = this;

        this.hasRendered = true;
        this.renderTree = renderTree;
        var renderNode = renderTree.rootNode;
        var method = undefined,
            postNode = undefined;

        while (renderNode) {
          removeDestroyedChildren(renderNode);
          postNode = renderNode.postNode;

          method = postNode.type;
          (0, _mobiledocKitUtilsAssert['default'])('EditorDom visitor cannot handle type ' + method, !!this.visitor[method]);
          this.visitor[method](renderNode, postNode, function () {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
              args[_key] = arguments[_key];
            }

            return _this2.visit.apply(_this2, [renderTree].concat(args));
          });
          renderNode.markClean();
          renderNode = this.nodes.shift();
        }
      }
    }]);

    return Renderer;
  })();

  exports['default'] = Renderer;
});
define('mobiledoc-kit/renderers/mobiledoc/0-2', ['exports', 'mobiledoc-kit/utils/compiler', 'mobiledoc-kit/utils/array-utils', 'mobiledoc-kit/models/types'], function (exports, _mobiledocKitUtilsCompiler, _mobiledocKitUtilsArrayUtils, _mobiledocKitModelsTypes) {
  'use strict';

  var _visitor;

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  var MOBILEDOC_VERSION = '0.2.0';
  exports.MOBILEDOC_VERSION = MOBILEDOC_VERSION;
  var MOBILEDOC_MARKUP_SECTION_TYPE = 1;
  exports.MOBILEDOC_MARKUP_SECTION_TYPE = MOBILEDOC_MARKUP_SECTION_TYPE;
  var MOBILEDOC_IMAGE_SECTION_TYPE = 2;
  exports.MOBILEDOC_IMAGE_SECTION_TYPE = MOBILEDOC_IMAGE_SECTION_TYPE;
  var MOBILEDOC_LIST_SECTION_TYPE = 3;
  exports.MOBILEDOC_LIST_SECTION_TYPE = MOBILEDOC_LIST_SECTION_TYPE;
  var MOBILEDOC_CARD_SECTION_TYPE = 10;

  exports.MOBILEDOC_CARD_SECTION_TYPE = MOBILEDOC_CARD_SECTION_TYPE;
  var visitor = (_visitor = {}, _defineProperty(_visitor, _mobiledocKitModelsTypes.POST_TYPE, function (node, opcodes) {
    opcodes.push(['openPost']);
    (0, _mobiledocKitUtilsCompiler.visitArray)(visitor, node.sections, opcodes);
  }), _defineProperty(_visitor, _mobiledocKitModelsTypes.MARKUP_SECTION_TYPE, function (node, opcodes) {
    opcodes.push(['openMarkupSection', node.tagName]);
    (0, _mobiledocKitUtilsCompiler.visitArray)(visitor, node.markers, opcodes);
  }), _defineProperty(_visitor, _mobiledocKitModelsTypes.LIST_SECTION_TYPE, function (node, opcodes) {
    opcodes.push(['openListSection', node.tagName]);
    (0, _mobiledocKitUtilsCompiler.visitArray)(visitor, node.items, opcodes);
  }), _defineProperty(_visitor, _mobiledocKitModelsTypes.LIST_ITEM_TYPE, function (node, opcodes) {
    opcodes.push(['openListItem']);
    (0, _mobiledocKitUtilsCompiler.visitArray)(visitor, node.markers, opcodes);
  }), _defineProperty(_visitor, _mobiledocKitModelsTypes.IMAGE_SECTION_TYPE, function (node, opcodes) {
    opcodes.push(['openImageSection', node.src]);
  }), _defineProperty(_visitor, _mobiledocKitModelsTypes.CARD_TYPE, function (node, opcodes) {
    opcodes.push(['openCardSection', node.name, node.payload]);
  }), _defineProperty(_visitor, _mobiledocKitModelsTypes.MARKER_TYPE, function (node, opcodes) {
    opcodes.push(['openMarker', node.closedMarkups.length, node.value]);
    (0, _mobiledocKitUtilsCompiler.visitArray)(visitor, node.openedMarkups, opcodes);
  }), _defineProperty(_visitor, _mobiledocKitModelsTypes.MARKUP_TYPE, function (node, opcodes) {
    opcodes.push(['openMarkup', node.tagName, (0, _mobiledocKitUtilsArrayUtils.objectToSortedKVArray)(node.attributes)]);
  }), _visitor);

  var postOpcodeCompiler = {
    openMarker: function openMarker(closeCount, value) {
      this.markupMarkerIds = [];
      this.markers.push([this.markupMarkerIds, closeCount, value || '']);
    },
    openMarkupSection: function openMarkupSection(tagName) {
      this.markers = [];
      this.sections.push([MOBILEDOC_MARKUP_SECTION_TYPE, tagName, this.markers]);
    },
    openListSection: function openListSection(tagName) {
      this.items = [];
      this.sections.push([MOBILEDOC_LIST_SECTION_TYPE, tagName, this.items]);
    },
    openListItem: function openListItem() {
      this.markers = [];
      this.items.push(this.markers);
    },
    openImageSection: function openImageSection(url) {
      this.sections.push([MOBILEDOC_IMAGE_SECTION_TYPE, url]);
    },
    openCardSection: function openCardSection(name, payload) {
      this.sections.push([MOBILEDOC_CARD_SECTION_TYPE, name, payload]);
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
      var index = this._findOrAddMarkerTypeIndex(tagName, attributes);
      this.markupMarkerIds.push(index);
    },
    _findOrAddMarkerTypeIndex: function _findOrAddMarkerTypeIndex(tagName, attributesArray) {
      if (!this._markerTypeCache) {
        this._markerTypeCache = {};
      }
      var key = tagName + '-' + attributesArray.join('-');

      var index = this._markerTypeCache[key];
      if (index === undefined) {
        var markerType = [tagName];
        if (attributesArray.length) {
          markerType.push(attributesArray);
        }
        this.markerTypes.push(markerType);

        index = this.markerTypes.length - 1;
        this._markerTypeCache[key] = index;
      }

      return index;
    }
  };

  /**
   * Render from post -> mobiledoc
   */
  exports['default'] = {
    /**
     * @param {Post}
     * @return {Mobiledoc}
     */
    render: function render(post) {
      var opcodes = [];
      (0, _mobiledocKitUtilsCompiler.visit)(visitor, post, opcodes);
      var compiler = Object.create(postOpcodeCompiler);
      (0, _mobiledocKitUtilsCompiler.compile)(compiler, opcodes);
      return compiler.result;
    }
  };
});
define('mobiledoc-kit/renderers/mobiledoc/0-3-1', ['exports', 'mobiledoc-kit/utils/compiler', 'mobiledoc-kit/utils/array-utils', 'mobiledoc-kit/models/types'], function (exports, _mobiledocKitUtilsCompiler, _mobiledocKitUtilsArrayUtils, _mobiledocKitModelsTypes) {
  'use strict';

  var _visitor;

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  var MOBILEDOC_VERSION = '0.3.1';
  exports.MOBILEDOC_VERSION = MOBILEDOC_VERSION;
  var MOBILEDOC_MARKUP_SECTION_TYPE = 1;
  exports.MOBILEDOC_MARKUP_SECTION_TYPE = MOBILEDOC_MARKUP_SECTION_TYPE;
  var MOBILEDOC_IMAGE_SECTION_TYPE = 2;
  exports.MOBILEDOC_IMAGE_SECTION_TYPE = MOBILEDOC_IMAGE_SECTION_TYPE;
  var MOBILEDOC_LIST_SECTION_TYPE = 3;
  exports.MOBILEDOC_LIST_SECTION_TYPE = MOBILEDOC_LIST_SECTION_TYPE;
  var MOBILEDOC_CARD_SECTION_TYPE = 10;

  exports.MOBILEDOC_CARD_SECTION_TYPE = MOBILEDOC_CARD_SECTION_TYPE;
  var MOBILEDOC_MARKUP_MARKER_TYPE = 0;
  exports.MOBILEDOC_MARKUP_MARKER_TYPE = MOBILEDOC_MARKUP_MARKER_TYPE;
  var MOBILEDOC_ATOM_MARKER_TYPE = 1;

  exports.MOBILEDOC_ATOM_MARKER_TYPE = MOBILEDOC_ATOM_MARKER_TYPE;
  var visitor = (_visitor = {}, _defineProperty(_visitor, _mobiledocKitModelsTypes.POST_TYPE, function (node, opcodes) {
    opcodes.push(['openPost']);
    (0, _mobiledocKitUtilsCompiler.visitArray)(visitor, node.sections, opcodes);
  }), _defineProperty(_visitor, _mobiledocKitModelsTypes.MARKUP_SECTION_TYPE, function (node, opcodes) {
    opcodes.push(['openMarkupSection', node.tagName]);
    (0, _mobiledocKitUtilsCompiler.visitArray)(visitor, node.markers, opcodes);
  }), _defineProperty(_visitor, _mobiledocKitModelsTypes.LIST_SECTION_TYPE, function (node, opcodes) {
    opcodes.push(['openListSection', node.tagName]);
    (0, _mobiledocKitUtilsCompiler.visitArray)(visitor, node.items, opcodes);
  }), _defineProperty(_visitor, _mobiledocKitModelsTypes.LIST_ITEM_TYPE, function (node, opcodes) {
    opcodes.push(['openListItem']);
    (0, _mobiledocKitUtilsCompiler.visitArray)(visitor, node.markers, opcodes);
  }), _defineProperty(_visitor, _mobiledocKitModelsTypes.IMAGE_SECTION_TYPE, function (node, opcodes) {
    opcodes.push(['openImageSection', node.src]);
  }), _defineProperty(_visitor, _mobiledocKitModelsTypes.CARD_TYPE, function (node, opcodes) {
    opcodes.push(['openCardSection', node.name, node.payload]);
  }), _defineProperty(_visitor, _mobiledocKitModelsTypes.MARKER_TYPE, function (node, opcodes) {
    opcodes.push(['openMarker', node.closedMarkups.length, node.value]);
    (0, _mobiledocKitUtilsCompiler.visitArray)(visitor, node.openedMarkups, opcodes);
  }), _defineProperty(_visitor, _mobiledocKitModelsTypes.MARKUP_TYPE, function (node, opcodes) {
    opcodes.push(['openMarkup', node.tagName, (0, _mobiledocKitUtilsArrayUtils.objectToSortedKVArray)(node.attributes)]);
  }), _defineProperty(_visitor, _mobiledocKitModelsTypes.ATOM_TYPE, function (node, opcodes) {
    opcodes.push(['openAtom', node.closedMarkups.length, node.name, node.value, node.payload]);
    (0, _mobiledocKitUtilsCompiler.visitArray)(visitor, node.openedMarkups, opcodes);
  }), _visitor);

  var postOpcodeCompiler = {
    openMarker: function openMarker(closeCount, value) {
      this.markupMarkerIds = [];
      this.markers.push([MOBILEDOC_MARKUP_MARKER_TYPE, this.markupMarkerIds, closeCount, value || '']);
    },
    openMarkupSection: function openMarkupSection(tagName) {
      this.markers = [];
      this.sections.push([MOBILEDOC_MARKUP_SECTION_TYPE, tagName, this.markers]);
    },
    openListSection: function openListSection(tagName) {
      this.items = [];
      this.sections.push([MOBILEDOC_LIST_SECTION_TYPE, tagName, this.items]);
    },
    openListItem: function openListItem() {
      this.markers = [];
      this.items.push(this.markers);
    },
    openImageSection: function openImageSection(url) {
      this.sections.push([MOBILEDOC_IMAGE_SECTION_TYPE, url]);
    },
    openCardSection: function openCardSection(name, payload) {
      var index = this._addCardTypeIndex(name, payload);
      this.sections.push([MOBILEDOC_CARD_SECTION_TYPE, index]);
    },
    openAtom: function openAtom(closeCount, name, value, payload) {
      var index = this._addAtomTypeIndex(name, value, payload);
      this.markupMarkerIds = [];
      this.markers.push([MOBILEDOC_ATOM_MARKER_TYPE, this.markupMarkerIds, closeCount, index]);
    },
    openPost: function openPost() {
      this.atomTypes = [];
      this.cardTypes = [];
      this.markerTypes = [];
      this.sections = [];
      this.result = {
        version: MOBILEDOC_VERSION,
        atoms: this.atomTypes,
        cards: this.cardTypes,
        markups: this.markerTypes,
        sections: this.sections
      };
    },
    openMarkup: function openMarkup(tagName, attributes) {
      var index = this._findOrAddMarkerTypeIndex(tagName, attributes);
      this.markupMarkerIds.push(index);
    },
    _addCardTypeIndex: function _addCardTypeIndex(cardName, payload) {
      var cardType = [cardName, payload];
      this.cardTypes.push(cardType);
      return this.cardTypes.length - 1;
    },
    _addAtomTypeIndex: function _addAtomTypeIndex(atomName, atomValue, payload) {
      var atomType = [atomName, atomValue, payload];
      this.atomTypes.push(atomType);
      return this.atomTypes.length - 1;
    },
    _findOrAddMarkerTypeIndex: function _findOrAddMarkerTypeIndex(tagName, attributesArray) {
      if (!this._markerTypeCache) {
        this._markerTypeCache = {};
      }
      var key = tagName + '-' + attributesArray.join('-');

      var index = this._markerTypeCache[key];
      if (index === undefined) {
        var markerType = [tagName];
        if (attributesArray.length) {
          markerType.push(attributesArray);
        }
        this.markerTypes.push(markerType);

        index = this.markerTypes.length - 1;
        this._markerTypeCache[key] = index;
      }

      return index;
    }
  };

  /**
   * Render from post -> mobiledoc
   */
  exports['default'] = {
    /**
     * @param {Post}
     * @return {Mobiledoc}
     */
    render: function render(post) {
      var opcodes = [];
      (0, _mobiledocKitUtilsCompiler.visit)(visitor, post, opcodes);
      var compiler = Object.create(postOpcodeCompiler);
      (0, _mobiledocKitUtilsCompiler.compile)(compiler, opcodes);
      return compiler.result;
    }
  };
});
define('mobiledoc-kit/renderers/mobiledoc/0-3-2', ['exports', 'mobiledoc-kit/utils/compiler', 'mobiledoc-kit/utils/array-utils', 'mobiledoc-kit/models/types'], function (exports, _mobiledocKitUtilsCompiler, _mobiledocKitUtilsArrayUtils, _mobiledocKitModelsTypes) {
  'use strict';

  var _visitor;

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  var MOBILEDOC_VERSION = '0.3.2';
  exports.MOBILEDOC_VERSION = MOBILEDOC_VERSION;
  var MOBILEDOC_MARKUP_SECTION_TYPE = 1;
  exports.MOBILEDOC_MARKUP_SECTION_TYPE = MOBILEDOC_MARKUP_SECTION_TYPE;
  var MOBILEDOC_IMAGE_SECTION_TYPE = 2;
  exports.MOBILEDOC_IMAGE_SECTION_TYPE = MOBILEDOC_IMAGE_SECTION_TYPE;
  var MOBILEDOC_LIST_SECTION_TYPE = 3;
  exports.MOBILEDOC_LIST_SECTION_TYPE = MOBILEDOC_LIST_SECTION_TYPE;
  var MOBILEDOC_CARD_SECTION_TYPE = 10;

  exports.MOBILEDOC_CARD_SECTION_TYPE = MOBILEDOC_CARD_SECTION_TYPE;
  var MOBILEDOC_MARKUP_MARKER_TYPE = 0;
  exports.MOBILEDOC_MARKUP_MARKER_TYPE = MOBILEDOC_MARKUP_MARKER_TYPE;
  var MOBILEDOC_ATOM_MARKER_TYPE = 1;

  exports.MOBILEDOC_ATOM_MARKER_TYPE = MOBILEDOC_ATOM_MARKER_TYPE;
  var visitor = (_visitor = {}, _defineProperty(_visitor, _mobiledocKitModelsTypes.POST_TYPE, function (node, opcodes) {
    opcodes.push(['openPost']);
    (0, _mobiledocKitUtilsCompiler.visitArray)(visitor, node.sections, opcodes);
  }), _defineProperty(_visitor, _mobiledocKitModelsTypes.MARKUP_SECTION_TYPE, function (node, opcodes) {
    opcodes.push(['openMarkupSection', node.tagName, (0, _mobiledocKitUtilsArrayUtils.objectToSortedKVArray)(node.attributes)]);
    (0, _mobiledocKitUtilsCompiler.visitArray)(visitor, node.markers, opcodes);
  }), _defineProperty(_visitor, _mobiledocKitModelsTypes.LIST_SECTION_TYPE, function (node, opcodes) {
    opcodes.push(['openListSection', node.tagName, (0, _mobiledocKitUtilsArrayUtils.objectToSortedKVArray)(node.attributes)]);
    (0, _mobiledocKitUtilsCompiler.visitArray)(visitor, node.items, opcodes);
  }), _defineProperty(_visitor, _mobiledocKitModelsTypes.LIST_ITEM_TYPE, function (node, opcodes) {
    opcodes.push(['openListItem']);
    (0, _mobiledocKitUtilsCompiler.visitArray)(visitor, node.markers, opcodes);
  }), _defineProperty(_visitor, _mobiledocKitModelsTypes.IMAGE_SECTION_TYPE, function (node, opcodes) {
    opcodes.push(['openImageSection', node.src]);
  }), _defineProperty(_visitor, _mobiledocKitModelsTypes.CARD_TYPE, function (node, opcodes) {
    opcodes.push(['openCardSection', node.name, node.payload]);
  }), _defineProperty(_visitor, _mobiledocKitModelsTypes.MARKER_TYPE, function (node, opcodes) {
    opcodes.push(['openMarker', node.closedMarkups.length, node.value]);
    (0, _mobiledocKitUtilsCompiler.visitArray)(visitor, node.openedMarkups, opcodes);
  }), _defineProperty(_visitor, _mobiledocKitModelsTypes.MARKUP_TYPE, function (node, opcodes) {
    opcodes.push(['openMarkup', node.tagName, (0, _mobiledocKitUtilsArrayUtils.objectToSortedKVArray)(node.attributes)]);
  }), _defineProperty(_visitor, _mobiledocKitModelsTypes.ATOM_TYPE, function (node, opcodes) {
    opcodes.push(['openAtom', node.closedMarkups.length, node.name, node.value, node.payload]);
    (0, _mobiledocKitUtilsCompiler.visitArray)(visitor, node.openedMarkups, opcodes);
  }), _visitor);

  var postOpcodeCompiler = {
    openMarker: function openMarker(closeCount, value) {
      this.markupMarkerIds = [];
      this.markers.push([MOBILEDOC_MARKUP_MARKER_TYPE, this.markupMarkerIds, closeCount, value || '']);
    },
    openMarkupSection: function openMarkupSection(tagName, attributes) {
      this.markers = [];
      this.sections.push([MOBILEDOC_MARKUP_SECTION_TYPE, tagName, this.markers, attributes]);
    },
    openListSection: function openListSection(tagName, attributes) {
      this.items = [];
      this.sections.push([MOBILEDOC_LIST_SECTION_TYPE, tagName, this.items, attributes]);
    },
    openListItem: function openListItem() {
      this.markers = [];
      this.items.push(this.markers);
    },
    openImageSection: function openImageSection(url) {
      this.sections.push([MOBILEDOC_IMAGE_SECTION_TYPE, url]);
    },
    openCardSection: function openCardSection(name, payload) {
      var index = this._addCardTypeIndex(name, payload);
      this.sections.push([MOBILEDOC_CARD_SECTION_TYPE, index]);
    },
    openAtom: function openAtom(closeCount, name, value, payload) {
      var index = this._addAtomTypeIndex(name, value, payload);
      this.markupMarkerIds = [];
      this.markers.push([MOBILEDOC_ATOM_MARKER_TYPE, this.markupMarkerIds, closeCount, index]);
    },
    openPost: function openPost() {
      this.atomTypes = [];
      this.cardTypes = [];
      this.markerTypes = [];
      this.sections = [];
      this.result = {
        version: MOBILEDOC_VERSION,
        atoms: this.atomTypes,
        cards: this.cardTypes,
        markups: this.markerTypes,
        sections: this.sections
      };
    },
    openMarkup: function openMarkup(tagName, attributes) {
      var index = this._findOrAddMarkerTypeIndex(tagName, attributes);
      this.markupMarkerIds.push(index);
    },
    _addCardTypeIndex: function _addCardTypeIndex(cardName, payload) {
      var cardType = [cardName, payload];
      this.cardTypes.push(cardType);
      return this.cardTypes.length - 1;
    },
    _addAtomTypeIndex: function _addAtomTypeIndex(atomName, atomValue, payload) {
      var atomType = [atomName, atomValue, payload];
      this.atomTypes.push(atomType);
      return this.atomTypes.length - 1;
    },
    _findOrAddMarkerTypeIndex: function _findOrAddMarkerTypeIndex(tagName, attributesArray) {
      if (!this._markerTypeCache) {
        this._markerTypeCache = {};
      }
      var key = tagName + '-' + attributesArray.join('-');

      var index = this._markerTypeCache[key];
      if (index === undefined) {
        var markerType = [tagName];
        if (attributesArray.length) {
          markerType.push(attributesArray);
        }
        this.markerTypes.push(markerType);

        index = this.markerTypes.length - 1;
        this._markerTypeCache[key] = index;
      }

      return index;
    }
  };

  /**
   * Render from post -> mobiledoc
   */
  exports['default'] = {
    /**
     * @param {Post}
     * @return {Mobiledoc}
     */
    render: function render(post) {
      var opcodes = [];
      (0, _mobiledocKitUtilsCompiler.visit)(visitor, post, opcodes);
      var compiler = Object.create(postOpcodeCompiler);
      (0, _mobiledocKitUtilsCompiler.compile)(compiler, opcodes);
      return compiler.result;
    }
  };
});
define('mobiledoc-kit/renderers/mobiledoc/0-3', ['exports', 'mobiledoc-kit/utils/compiler', 'mobiledoc-kit/utils/array-utils', 'mobiledoc-kit/models/types'], function (exports, _mobiledocKitUtilsCompiler, _mobiledocKitUtilsArrayUtils, _mobiledocKitModelsTypes) {
  'use strict';

  var _visitor;

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  var MOBILEDOC_VERSION = '0.3.0';
  exports.MOBILEDOC_VERSION = MOBILEDOC_VERSION;
  var MOBILEDOC_MARKUP_SECTION_TYPE = 1;
  exports.MOBILEDOC_MARKUP_SECTION_TYPE = MOBILEDOC_MARKUP_SECTION_TYPE;
  var MOBILEDOC_IMAGE_SECTION_TYPE = 2;
  exports.MOBILEDOC_IMAGE_SECTION_TYPE = MOBILEDOC_IMAGE_SECTION_TYPE;
  var MOBILEDOC_LIST_SECTION_TYPE = 3;
  exports.MOBILEDOC_LIST_SECTION_TYPE = MOBILEDOC_LIST_SECTION_TYPE;
  var MOBILEDOC_CARD_SECTION_TYPE = 10;

  exports.MOBILEDOC_CARD_SECTION_TYPE = MOBILEDOC_CARD_SECTION_TYPE;
  var MOBILEDOC_MARKUP_MARKER_TYPE = 0;
  exports.MOBILEDOC_MARKUP_MARKER_TYPE = MOBILEDOC_MARKUP_MARKER_TYPE;
  var MOBILEDOC_ATOM_MARKER_TYPE = 1;

  exports.MOBILEDOC_ATOM_MARKER_TYPE = MOBILEDOC_ATOM_MARKER_TYPE;
  var visitor = (_visitor = {}, _defineProperty(_visitor, _mobiledocKitModelsTypes.POST_TYPE, function (node, opcodes) {
    opcodes.push(['openPost']);
    (0, _mobiledocKitUtilsCompiler.visitArray)(visitor, node.sections, opcodes);
  }), _defineProperty(_visitor, _mobiledocKitModelsTypes.MARKUP_SECTION_TYPE, function (node, opcodes) {
    opcodes.push(['openMarkupSection', node.tagName]);
    (0, _mobiledocKitUtilsCompiler.visitArray)(visitor, node.markers, opcodes);
  }), _defineProperty(_visitor, _mobiledocKitModelsTypes.LIST_SECTION_TYPE, function (node, opcodes) {
    opcodes.push(['openListSection', node.tagName]);
    (0, _mobiledocKitUtilsCompiler.visitArray)(visitor, node.items, opcodes);
  }), _defineProperty(_visitor, _mobiledocKitModelsTypes.LIST_ITEM_TYPE, function (node, opcodes) {
    opcodes.push(['openListItem']);
    (0, _mobiledocKitUtilsCompiler.visitArray)(visitor, node.markers, opcodes);
  }), _defineProperty(_visitor, _mobiledocKitModelsTypes.IMAGE_SECTION_TYPE, function (node, opcodes) {
    opcodes.push(['openImageSection', node.src]);
  }), _defineProperty(_visitor, _mobiledocKitModelsTypes.CARD_TYPE, function (node, opcodes) {
    opcodes.push(['openCardSection', node.name, node.payload]);
  }), _defineProperty(_visitor, _mobiledocKitModelsTypes.MARKER_TYPE, function (node, opcodes) {
    opcodes.push(['openMarker', node.closedMarkups.length, node.value]);
    (0, _mobiledocKitUtilsCompiler.visitArray)(visitor, node.openedMarkups, opcodes);
  }), _defineProperty(_visitor, _mobiledocKitModelsTypes.MARKUP_TYPE, function (node, opcodes) {
    opcodes.push(['openMarkup', node.tagName, (0, _mobiledocKitUtilsArrayUtils.objectToSortedKVArray)(node.attributes)]);
  }), _defineProperty(_visitor, _mobiledocKitModelsTypes.ATOM_TYPE, function (node, opcodes) {
    opcodes.push(['openAtom', node.closedMarkups.length, node.name, node.value, node.payload]);
    (0, _mobiledocKitUtilsCompiler.visitArray)(visitor, node.openedMarkups, opcodes);
  }), _visitor);

  var postOpcodeCompiler = {
    openMarker: function openMarker(closeCount, value) {
      this.markupMarkerIds = [];
      this.markers.push([MOBILEDOC_MARKUP_MARKER_TYPE, this.markupMarkerIds, closeCount, value || '']);
    },
    openMarkupSection: function openMarkupSection(tagName) {
      this.markers = [];
      this.sections.push([MOBILEDOC_MARKUP_SECTION_TYPE, tagName, this.markers]);
    },
    openListSection: function openListSection(tagName) {
      this.items = [];
      this.sections.push([MOBILEDOC_LIST_SECTION_TYPE, tagName, this.items]);
    },
    openListItem: function openListItem() {
      this.markers = [];
      this.items.push(this.markers);
    },
    openImageSection: function openImageSection(url) {
      this.sections.push([MOBILEDOC_IMAGE_SECTION_TYPE, url]);
    },
    openCardSection: function openCardSection(name, payload) {
      var index = this._addCardTypeIndex(name, payload);
      this.sections.push([MOBILEDOC_CARD_SECTION_TYPE, index]);
    },
    openAtom: function openAtom(closeCount, name, value, payload) {
      var index = this._addAtomTypeIndex(name, value, payload);
      this.markupMarkerIds = [];
      this.markers.push([MOBILEDOC_ATOM_MARKER_TYPE, this.markupMarkerIds, closeCount, index]);
    },
    openPost: function openPost() {
      this.atomTypes = [];
      this.cardTypes = [];
      this.markerTypes = [];
      this.sections = [];
      this.result = {
        version: MOBILEDOC_VERSION,
        atoms: this.atomTypes,
        cards: this.cardTypes,
        markups: this.markerTypes,
        sections: this.sections
      };
    },
    openMarkup: function openMarkup(tagName, attributes) {
      var index = this._findOrAddMarkerTypeIndex(tagName, attributes);
      this.markupMarkerIds.push(index);
    },
    _addCardTypeIndex: function _addCardTypeIndex(cardName, payload) {
      var cardType = [cardName, payload];
      this.cardTypes.push(cardType);
      return this.cardTypes.length - 1;
    },
    _addAtomTypeIndex: function _addAtomTypeIndex(atomName, atomValue, payload) {
      var atomType = [atomName, atomValue, payload];
      this.atomTypes.push(atomType);
      return this.atomTypes.length - 1;
    },
    _findOrAddMarkerTypeIndex: function _findOrAddMarkerTypeIndex(tagName, attributesArray) {
      if (!this._markerTypeCache) {
        this._markerTypeCache = {};
      }
      var key = tagName + '-' + attributesArray.join('-');

      var index = this._markerTypeCache[key];
      if (index === undefined) {
        var markerType = [tagName];
        if (attributesArray.length) {
          markerType.push(attributesArray);
        }
        this.markerTypes.push(markerType);

        index = this.markerTypes.length - 1;
        this._markerTypeCache[key] = index;
      }

      return index;
    }
  };

  /**
   * Render from post -> mobiledoc
   */
  exports['default'] = {
    /**
     * @param {Post}
     * @return {Mobiledoc}
     */
    render: function render(post) {
      var opcodes = [];
      (0, _mobiledocKitUtilsCompiler.visit)(visitor, post, opcodes);
      var compiler = Object.create(postOpcodeCompiler);
      (0, _mobiledocKitUtilsCompiler.compile)(compiler, opcodes);
      return compiler.result;
    }
  };
});
define('mobiledoc-kit/renderers/mobiledoc', ['exports', 'mobiledoc-kit/renderers/mobiledoc/0-2', 'mobiledoc-kit/renderers/mobiledoc/0-3', 'mobiledoc-kit/renderers/mobiledoc/0-3-1', 'mobiledoc-kit/renderers/mobiledoc/0-3-2', 'mobiledoc-kit/utils/assert'], function (exports, _mobiledocKitRenderersMobiledoc02, _mobiledocKitRenderersMobiledoc03, _mobiledocKitRenderersMobiledoc031, _mobiledocKitRenderersMobiledoc032, _mobiledocKitUtilsAssert) {
  'use strict';

  var MOBILEDOC_VERSION = _mobiledocKitRenderersMobiledoc032.MOBILEDOC_VERSION;

  exports.MOBILEDOC_VERSION = MOBILEDOC_VERSION;
  exports['default'] = {
    render: function render(post, version) {
      switch (version) {
        case _mobiledocKitRenderersMobiledoc02.MOBILEDOC_VERSION:
          return _mobiledocKitRenderersMobiledoc02['default'].render(post);
        case _mobiledocKitRenderersMobiledoc03.MOBILEDOC_VERSION:
          return _mobiledocKitRenderersMobiledoc03['default'].render(post);
        case _mobiledocKitRenderersMobiledoc031.MOBILEDOC_VERSION:
          return _mobiledocKitRenderersMobiledoc031['default'].render(post);
        case undefined:
        case null:
        case _mobiledocKitRenderersMobiledoc032.MOBILEDOC_VERSION:
          return _mobiledocKitRenderersMobiledoc032['default'].render(post);
        default:
          (0, _mobiledocKitUtilsAssert['default'])('Unknown version of mobiledoc renderer requested: ' + version, false);
      }
    }
  };
});
define("mobiledoc-kit/utils/array-utils", ["exports"], function (exports) {
  "use strict";

  function detect(enumerable, callback) {
    if (enumerable.detect) {
      return enumerable.detect(callback);
    } else {
      for (var i = 0; i < enumerable.length; i++) {
        if (callback(enumerable[i])) {
          return enumerable[i];
        }
      }
    }
  }

  function any(enumerable, callback) {
    if (enumerable.any) {
      return enumerable.any(callback);
    }

    for (var i = 0; i < enumerable.length; i++) {
      if (callback(enumerable[i])) {
        return true;
      }
    }

    return false;
  }

  function every(enumerable, callback) {
    if (enumerable.every) {
      return enumerable.every(callback);
    }

    for (var i = 0; i < enumerable.length; i++) {
      if (!callback(enumerable[i])) {
        return false;
      }
    }
    return true;
  }

  function toArray(arrayLike) {
    return Array.prototype.slice.call(arrayLike);
  }

  /**
   * Useful for array-like things that aren't
   * actually arrays, like NodeList
   * @private
   */
  function forEach(enumerable, callback) {
    if (enumerable.forEach) {
      enumerable.forEach(callback);
    } else {
      for (var i = 0; i < enumerable.length; i++) {
        callback(enumerable[i], i);
      }
    }
  }

  function filter(enumerable, conditionFn) {
    var filtered = [];
    forEach(enumerable, function (i) {
      if (conditionFn(i)) {
        filtered.push(i);
      }
    });
    return filtered;
  }

  /**
   * @return {Integer} the number of items that are the same, starting from the 0th index, in a and b
   * @private
   */
  function commonItemLength(listA, listB) {
    var offset = 0;
    while (offset < listA.length && offset < listB.length) {
      if (listA[offset] !== listB[offset]) {
        break;
      }
      offset++;
    }
    return offset;
  }

  /**
   * @return {Array} the items that are the same, starting from the 0th index, in a and b
   * @private
   */
  function commonItems(listA, listB) {
    var offset = 0;
    while (offset < listA.length && offset < listB.length) {
      if (listA[offset] !== listB[offset]) {
        break;
      }
      offset++;
    }
    return listA.slice(0, offset);
  }

  // return new array without falsy items like ruby's `compact`
  function compact(enumerable) {
    return filter(enumerable, function (i) {
      return !!i;
    });
  }

  function reduce(enumerable, callback, initialValue) {
    var previousValue = initialValue;
    forEach(enumerable, function (val, index) {
      previousValue = callback(previousValue, val, index);
    });
    return previousValue;
  }

  /**
   * @param {Array} array of key1,value1,key2,value2,...
   * @return {Object} {key1:value1, key2:value2, ...}
   * @private
   */
  function kvArrayToObject(array) {
    var obj = {};
    for (var i = 0; i < array.length; i += 2) {
      var key = array[i];
      var value = array[i + 1];

      obj[key] = value;
    }
    return obj;
  }

  function objectToSortedKVArray(obj) {
    var keys = Object.keys(obj).sort();
    var result = [];
    keys.forEach(function (k) {
      result.push(k);
      result.push(obj[k]);
    });
    return result;
  }

  // check shallow equality of two non-nested arrays
  function isArrayEqual(arr1, arr2) {
    var l1 = arr1.length,
        l2 = arr2.length;
    if (l1 !== l2) {
      return false;
    }

    for (var i = 0; i < l1; i++) {
      if (arr1[i] !== arr2[i]) {
        return false;
      }
    }
    return true;
  }

  // return an object with only the valid keys
  function filterObject(object) {
    var validKeys = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

    var result = {};
    forEach(filter(Object.keys(object), function (key) {
      return validKeys.indexOf(key) !== -1;
    }), function (key) {
      return result[key] = object[key];
    });
    return result;
  }

  function contains(array, item) {
    return array.indexOf(item) !== -1;
  }

  function values(object) {
    return Object.keys(object).map(function (key) {
      return object[key];
    });
  }

  exports.detect = detect;
  exports.forEach = forEach;
  exports.any = any;
  exports.every = every;
  exports.filter = filter;
  exports.commonItemLength = commonItemLength;
  exports.commonItems = commonItems;
  exports.compact = compact;
  exports.reduce = reduce;
  exports.objectToSortedKVArray = objectToSortedKVArray;
  exports.kvArrayToObject = kvArrayToObject;
  exports.isArrayEqual = isArrayEqual;
  exports.toArray = toArray;
  exports.filterObject = filterObject;
  exports.contains = contains;
  exports.values = values;
});
define('mobiledoc-kit/utils/assert', ['exports', 'mobiledoc-kit/utils/mobiledoc-error'], function (exports, _mobiledocKitUtilsMobiledocError) {
  'use strict';

  exports['default'] = function (message, conditional) {
    if (!conditional) {
      throw new _mobiledocKitUtilsMobiledocError['default'](message);
    }
  };
});
define('mobiledoc-kit/utils/browser', ['exports'], function (exports) {
  'use strict';

  exports['default'] = {
    isMac: function isMac() {
      return typeof window !== 'undefined' && window.navigator && /Mac/.test(window.navigator.platform);
    },
    isWin: function isWin() {
      return typeof window !== 'undefined' && window.navigator && /Win/.test(window.navigator.platform);
    }
  };
});
define('mobiledoc-kit/utils/characters', ['exports'], function (exports) {
  'use strict';

  var TAB = '\t';
  exports.TAB = TAB;
  var ENTER = '\n';
  exports.ENTER = ENTER;
  var SPACE = ' ';
  exports.SPACE = SPACE;
});
define('mobiledoc-kit/utils/compiler', ['exports', 'mobiledoc-kit/utils/array-utils', 'mobiledoc-kit/utils/assert'], function (exports, _mobiledocKitUtilsArrayUtils, _mobiledocKitUtilsAssert) {
  'use strict';

  exports.visit = visit;
  exports.compile = compile;
  exports.visitArray = visitArray;

  function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

  function visit(visitor, node, opcodes) {
    var method = node.type;
    (0, _mobiledocKitUtilsAssert['default'])('Cannot visit unknown type ' + method, !!visitor[method]);
    visitor[method](node, opcodes);
  }

  function compile(compiler, opcodes) {
    for (var i = 0, l = opcodes.length; i < l; i++) {
      var _opcodes$i = _toArray(opcodes[i]);

      var method = _opcodes$i[0];

      var params = _opcodes$i.slice(1);

      var _length = params.length;
      if (_length === 0) {
        compiler[method].call(compiler);
      } else if (_length === 1) {
        compiler[method].call(compiler, params[0]);
      } else if (_length === 2) {
        compiler[method].call(compiler, params[0], params[1]);
      } else {
        compiler[method].apply(compiler, params);
      }
    }
  }

  function visitArray(visitor, nodes, opcodes) {
    if (!nodes || nodes.length === 0) {
      return;
    }
    (0, _mobiledocKitUtilsArrayUtils.forEach)(nodes, function (node) {
      visit(visitor, node, opcodes);
    });
  }
});
define("mobiledoc-kit/utils/copy", ["exports"], function (exports) {
  "use strict";

  function shallowCopyObject(object) {
    var copy = {};
    Object.keys(object).forEach(function (key) {
      copy[key] = object[key];
    });
    return copy;
  }

  exports.shallowCopyObject = shallowCopyObject;
});
define('mobiledoc-kit/utils/cursor', ['exports', 'mobiledoc-kit/utils/selection-utils', 'mobiledoc-kit/utils/dom-utils', 'mobiledoc-kit/utils/cursor/position', 'mobiledoc-kit/utils/cursor/range', 'mobiledoc-kit/utils/key'], function (exports, _mobiledocKitUtilsSelectionUtils, _mobiledocKitUtilsDomUtils, _mobiledocKitUtilsCursorPosition, _mobiledocKitUtilsCursorRange, _mobiledocKitUtilsKey) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  exports.Position = _mobiledocKitUtilsCursorPosition['default'];
  exports.Range = _mobiledocKitUtilsCursorRange['default'];

  var Cursor = (function () {
    function Cursor(editor) {
      _classCallCheck(this, Cursor);

      this.editor = editor;
      this.renderTree = editor._renderTree;
      this.post = editor.post;
    }

    _createClass(Cursor, [{
      key: 'clearSelection',
      value: function clearSelection() {
        (0, _mobiledocKitUtilsSelectionUtils.clearSelection)();
      }

      /**
       * @return {Boolean} true when there is either a collapsed cursor in the
       * editor's element or a selection that is contained in the editor's element
       */
    }, {
      key: 'hasCursor',
      value: function hasCursor() {
        return this.editor.hasRendered && (this._hasCollapsedSelection() || this._hasSelection());
      }
    }, {
      key: 'hasSelection',
      value: function hasSelection() {
        return this.editor.hasRendered && this._hasSelection();
      }

      /**
       * @return {Boolean} Can the cursor be on this element?
       */
    }, {
      key: 'isAddressable',
      value: function isAddressable(element) {
        var renderTree = this.renderTree;

        var renderNode = renderTree.findRenderNodeFromElement(element);
        if (renderNode && renderNode.postNode.isCardSection) {
          var renderedElement = renderNode.element;

          // card sections have addressable text nodes containing &zwnj;
          // as their first and last child
          if (element !== renderedElement && element !== renderedElement.firstChild && element !== renderedElement.lastChild) {
            return false;
          }
        }

        return !!renderNode;
      }

      /*
       * @return {Range} Cursor#Range object
       */
    }, {
      key: '_findNodeForPosition',
      value: function _findNodeForPosition(position) {
        var section = position.section;

        var node = undefined,
            offset = undefined;
        if (section.isCardSection) {
          offset = 0;
          if (position.offset === 0) {
            node = section.renderNode.element.firstChild;
          } else {
            node = section.renderNode.element.lastChild;
          }
        } else if (section.isBlank) {
          node = section.renderNode.cursorElement;
          offset = 0;
        } else {
          var marker = position.marker;
          var offsetInMarker = position.offsetInMarker;

          if (marker.isAtom) {
            if (offsetInMarker > 0) {
              // FIXME -- if there is a next marker, focus on it?
              offset = 0;
              node = marker.renderNode.tailTextNode;
            } else {
              offset = 0;
              node = marker.renderNode.headTextNode;
            }
          } else {
            node = marker.renderNode.element;
            offset = offsetInMarker;
          }
        }

        return { node: node, offset: offset };
      }
    }, {
      key: 'selectRange',
      value: function selectRange(range) {
        if (range.isBlank) {
          this.clearSelection();
          return;
        }

        var head = range.head;
        var tail = range.tail;
        var direction = range.direction;

        var _findNodeForPosition2 = this._findNodeForPosition(head);

        var headNode = _findNodeForPosition2.node;
        var headOffset = _findNodeForPosition2.offset;

        var _findNodeForPosition3 = this._findNodeForPosition(tail);

        var tailNode = _findNodeForPosition3.node;
        var tailOffset = _findNodeForPosition3.offset;

        this._moveToNode(headNode, headOffset, tailNode, tailOffset, direction);

        // Firefox sometimes doesn't keep focus in the editor after adding a card
        this.editor._ensureFocus();
      }
    }, {
      key: 'selectedText',
      value: function selectedText() {
        // FIXME remove this
        return this.selection.toString();
      }

      /**
       * @param {textNode} node
       * @param {integer} offset
       * @param {textNode} endNode
       * @param {integer} endOffset
       * @param {integer} direction forward or backward, default forward
       * @private
       */
    }, {
      key: '_moveToNode',
      value: function _moveToNode(node, offset, endNode, endOffset) {
        var direction = arguments.length <= 4 || arguments[4] === undefined ? _mobiledocKitUtilsKey.DIRECTION.FORWARD : arguments[4];

        this.clearSelection();

        if (direction === _mobiledocKitUtilsKey.DIRECTION.BACKWARD) {
          var _ref = [endNode, endOffset, node, offset];
          node = _ref[0];
          offset = _ref[1];
          endNode = _ref[2];
          endOffset = _ref[3];
        }

        var range = document.createRange();
        range.setStart(node, offset);
        if (direction === _mobiledocKitUtilsKey.DIRECTION.BACKWARD && !!this.selection.extend) {
          this.selection.addRange(range);
          this.selection.extend(endNode, endOffset);
        } else {
          range.setEnd(endNode, endOffset);
          this.selection.addRange(range);
        }
      }
    }, {
      key: '_hasSelection',
      value: function _hasSelection() {
        var element = this.editor.element;
        var _selectionRange = this._selectionRange;

        if (!_selectionRange || _selectionRange.collapsed) {
          return false;
        }

        return (0, _mobiledocKitUtilsDomUtils.containsNode)(element, this.selection.anchorNode) && (0, _mobiledocKitUtilsDomUtils.containsNode)(element, this.selection.focusNode);
      }
    }, {
      key: '_hasCollapsedSelection',
      value: function _hasCollapsedSelection() {
        var _selectionRange = this._selectionRange;

        if (!_selectionRange) {
          return false;
        }

        var element = this.editor.element;
        return (0, _mobiledocKitUtilsDomUtils.containsNode)(element, this.selection.anchorNode);
      }
    }, {
      key: 'offsets',
      get: function get() {
        if (!this.hasCursor()) {
          return _mobiledocKitUtilsCursorRange['default'].blankRange();
        }

        var selection = this.selection;
        var renderTree = this.renderTree;

        var parentNode = this.editor.element;
        selection = (0, _mobiledocKitUtilsSelectionUtils.constrainSelectionTo)(selection, parentNode);

        var _comparePosition = (0, _mobiledocKitUtilsSelectionUtils.comparePosition)(selection);

        var headNode = _comparePosition.headNode;
        var headOffset = _comparePosition.headOffset;
        var tailNode = _comparePosition.tailNode;
        var tailOffset = _comparePosition.tailOffset;
        var direction = _comparePosition.direction;

        var headPosition = _mobiledocKitUtilsCursorPosition['default'].fromNode(renderTree, headNode, headOffset);
        var tailPosition = _mobiledocKitUtilsCursorPosition['default'].fromNode(renderTree, tailNode, tailOffset);

        return new _mobiledocKitUtilsCursorRange['default'](headPosition, tailPosition, direction);
      }
    }, {
      key: 'selection',
      get: function get() {
        return window.getSelection();
      }
    }, {
      key: '_selectionRange',
      get: function get() {
        var selection = this.selection;

        if (selection.rangeCount === 0) {
          return null;
        }
        return selection.getRangeAt(0);
      }
    }]);

    return Cursor;
  })();

  exports['default'] = Cursor;
});
define('mobiledoc-kit/utils/cursor/position', ['exports', 'mobiledoc-kit/utils/dom-utils', 'mobiledoc-kit/utils/assert', 'mobiledoc-kit/models/marker', 'mobiledoc-kit/utils/selection-utils', 'mobiledoc-kit/utils/key', 'mobiledoc-kit/utils/cursor/range'], function (exports, _mobiledocKitUtilsDomUtils, _mobiledocKitUtilsAssert, _mobiledocKitModelsMarker, _mobiledocKitUtilsSelectionUtils, _mobiledocKitUtilsKey, _mobiledocKitUtilsCursorRange) {
  'use strict';

  var _get = function get(_x5, _x6, _x7) { var _again = true; _function: while (_again) { var object = _x5, property = _x6, receiver = _x7; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x5 = parent; _x6 = property; _x7 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var FORWARD = _mobiledocKitUtilsKey.DIRECTION.FORWARD;
  var BACKWARD = _mobiledocKitUtilsKey.DIRECTION.BACKWARD;

  // generated via http://xregexp.com/ to cover chars that \w misses
  // (new XRegExp('\\p{Alphabetic}|[0-9]|_|:')).toString()
  var WORD_CHAR_REGEX = /[A-Za-zªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮͅͰ-ʹͶͷͺ-ͽͿΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁҊ-ԯԱ-Ֆՙա-ևְ-ׇֽֿׁׂׅׄא-תװ-ײؐ-ؚؠ-ٗٙ-ٟٮ-ۓە-ۜۡ-ۭۨ-ۯۺ-ۼۿܐ-ܿݍ-ޱߊ-ߪߴߵߺࠀ-ࠗࠚ-ࠬࡀ-ࡘࢠ-ࢴࣣ-ࣰࣩ-ऻऽ-ौॎ-ॐॕ-ॣॱ-ঃঅ-ঌএঐও-নপ-রলশ-হঽ-ৄেৈোৌৎৗড়ঢ়য়-ৣৰৱਁ-ਃਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹਾ-ੂੇੈੋੌੑਖ਼-ੜਫ਼ੰ-ੵઁ-ઃઅ-ઍએ-ઑઓ-નપ-રલળવ-હઽ-ૅે-ૉોૌૐૠ-ૣૹଁ-ଃଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହଽ-ୄେୈୋୌୖୗଡ଼ଢ଼ୟ-ୣୱஂஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹா-ூெ-ைொ-ௌௐௗఀ-ఃఅ-ఌఎ-ఐఒ-నప-హఽ-ౄె-ైొ-ౌౕౖౘ-ౚౠ-ౣಁ-ಃಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹಽ-ೄೆ-ೈೊ-ೌೕೖೞೠ-ೣೱೲഁ-ഃഅ-ഌഎ-ഐഒ-ഺഽ-ൄെ-ൈൊ-ൌൎൗൟ-ൣൺ-ൿංඃඅ-ඖක-නඳ-රලව-ෆා-ුූෘ-ෟෲෳก-ฺเ-ๆํກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ູົ-ຽເ-ໄໆໍໜ-ໟༀཀ-ཇཉ-ཬཱ-ཱྀྈ-ྗྙ-ྼက-ံးျ-ဿၐ-ၢၥ-ၨၮ-ႆႎႜႝႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚ፟ᎀ-ᎏᎠ-Ᏽᏸ-ᏽᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛸᜀ-ᜌᜎ-ᜓᜠ-ᜳᝀ-ᝓᝠ-ᝬᝮ-ᝰᝲᝳក-ឳា-ៈៗៜᠠ-ᡷᢀ-ᢪᢰ-ᣵᤀ-ᤞᤠ-ᤫᤰ-ᤸᥐ-ᥭᥰ-ᥴᦀ-ᦫᦰ-ᧉᨀ-ᨛᨠ-ᩞᩡ-ᩴᪧᬀ-ᬳᬵ-ᭃᭅ-ᭋᮀ-ᮩᮬ-ᮯᮺ-ᯥᯧ-ᯱᰀ-ᰵᱍ-ᱏᱚ-ᱽᳩ-ᳬᳮ-ᳳᳵᳶᴀ-ᶿᷧ-ᷴḀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼⁱⁿₐ-ₜℂℇℊ-ℓℕℙ-ℝℤΩℨK-ℭℯ-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⒶ-ⓩⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳮⳲⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯⶀ-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞⷠ-ⷿⸯ々-〇〡-〩〱-〵〸-〼ぁ-ゖゝ-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿕ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘟꘪꘫꙀ-ꙮꙴ-ꙻꙿ-ꛯꜗ-ꜟꜢ-ꞈꞋ-ꞭꞰ-ꞷꟷ-ꠁꠃ-ꠅꠇ-ꠊꠌ-ꠧꡀ-ꡳꢀ-ꣃꣲ-ꣷꣻꣽꤊ-ꤪꤰ-ꥒꥠ-ꥼꦀ-ꦲꦴ-ꦿꧏꧠ-ꧤꧦ-ꧯꧺ-ꧾꨀ-ꨶꩀ-ꩍꩠ-ꩶꩺꩾ-ꪾꫀꫂꫛ-ꫝꫠ-ꫯꫲ-ꫵꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꬰ-ꭚꭜ-ꭥꭰ-ꯪ가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼＡ-Ｚａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ]|[0-9]|_|:/;

  function findParentSectionFromNode(renderTree, node) {
    var renderNode = renderTree.findRenderNodeFromElement(node, function (renderNode) {
      return renderNode.postNode.isSection;
    });

    return renderNode && renderNode.postNode;
  }

  function findOffsetInMarkerable(markerable, node, offset) {
    var offsetInSection = 0;
    var marker = markerable.markers.head;
    while (marker) {
      var markerNode = marker.renderNode.element;
      if (markerNode === node) {
        return offsetInSection + offset;
      } else if (marker.isAtom) {
        if (marker.renderNode.headTextNode === node) {
          return offsetInSection;
        } else if (marker.renderNode.tailTextNode === node) {
          return offsetInSection + 1;
        }
      }

      offsetInSection += marker.length;
      marker = marker.next;
    }

    return offsetInSection;
  }

  function findOffsetInSection(section, node, offset) {
    if (section.isMarkerable) {
      return findOffsetInMarkerable(section, node, offset);
    } else {
      (0, _mobiledocKitUtilsAssert['default'])('findOffsetInSection must be called with markerable or card section', section.isCardSection);

      var wrapperNode = section.renderNode.element;
      var endTextNode = wrapperNode.lastChild;
      if (node === endTextNode) {
        return 1;
      }
      return 0;
    }
  }

  var Position = undefined,
      BlankPosition = undefined;

  Position = (function () {
    /**
     * A position is a logical location (zero-width, or "collapsed") in a post,
     * typically between two characters in a section.
     * Two positions (a head and a tail) make up a {@link Range}.
     * @constructor
     */

    function Position(section) {
      var offset = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
      var isBlank = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

      _classCallCheck(this, Position);

      if (!isBlank) {
        (0, _mobiledocKitUtilsAssert['default'])('Position must have a section that is addressable by the cursor', section && section.isLeafSection);
        (0, _mobiledocKitUtilsAssert['default'])('Position must have numeric offset', typeof offset === 'number');
      }

      this.section = section;
      this.offset = offset;
      this.isBlank = isBlank;
    }

    /**
     * @param {integer} x x-position in current viewport
     * @param {integer} y y-position in current viewport
     * @param {Editor} editor
     * @return {Position|null}
     */

    _createClass(Position, [{
      key: 'toRange',

      /**
       * Returns a range from this position to the given tail. If no explicit
       * tail is given this returns a collapsed range focused on this position.
       * @param {Position} [tail=this] The ending position
       * @return {Range}
       * @public
       */
      value: function toRange() {
        var tail = arguments.length <= 0 || arguments[0] === undefined ? this : arguments[0];
        var direction = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

        return new _mobiledocKitUtilsCursorRange['default'](this, tail, direction);
      }
    }, {
      key: 'markerIn',

      /**
       * Returns the marker in `direction` from this position.
       * If the position is in the middle of a marker, the direction is irrelevant.
       * Otherwise, if the position is at a boundary between two markers, returns the
       * marker to the left if `direction` === BACKWARD and the marker to the right
       * if `direction` === FORWARD (assuming left-to-right text direction).
       * @param {Direction}
       * @return {Marker|undefined}
       */
      value: function markerIn(direction) {
        if (!this.isMarkerable) {
          return;
        }

        var marker = this.marker;
        var offsetInMarker = this.offsetInMarker;

        if (!marker) {
          return;
        }

        if (offsetInMarker > 0 && offsetInMarker < marker.length) {
          return marker;
        } else if (offsetInMarker === 0) {
          return direction === BACKWARD ? marker : marker.prev;
        } else if (offsetInMarker === marker.length) {
          return direction === FORWARD ? marker.next : marker;
        }
      }
    }, {
      key: 'isEqual',
      value: function isEqual(position) {
        return this.section === position.section && this.offset === position.offset;
      }

      /**
       * @return {Boolean} If this position is at the head of the post
       */
    }, {
      key: 'isHeadOfPost',
      value: function isHeadOfPost() {
        return this.move(BACKWARD).isEqual(this);
      }

      /**
       * @return {Boolean} If this position is at the tail of the post
       */
    }, {
      key: 'isTailOfPost',
      value: function isTailOfPost() {
        return this.move(FORWARD).isEqual(this);
      }

      /**
       * @return {Boolean} If this position is at the head of its section
       */
    }, {
      key: 'isHead',
      value: function isHead() {
        return this.isEqual(this.section.headPosition());
      }

      /**
       * @return {Boolean} If this position is at the tail of its section
       */
    }, {
      key: 'isTail',
      value: function isTail() {
        return this.isEqual(this.section.tailPosition());
      }

      /**
       * Move the position 1 unit in `direction`.
       *
       * @param {Number} units to move. > 0 moves right, < 0 moves left
       * @return {Position} Return a new position one unit in the given
       * direction. If the position is moving left and at the beginning of the post,
       * the same position will be returned. Same if the position is moving right and
       * at the end of the post.
       */
    }, {
      key: 'move',
      value: function move(units) {
        (0, _mobiledocKitUtilsAssert['default'])('Must pass integer to Position#move', typeof units === 'number');

        if (units < 0) {
          return this.moveLeft().move(++units);
        } else if (units > 0) {
          return this.moveRight().move(--units);
        } else {
          return this;
        }
      }

      /**
       * @param {Number} direction (FORWARD or BACKWARD)
       * @return {Position} The result of moving 1 "word" unit in `direction`
       */
    }, {
      key: 'moveWord',
      value: function moveWord(direction) {
        var isPostBoundary = direction === BACKWARD ? this.isHeadOfPost() : this.isTailOfPost();
        if (isPostBoundary) {
          return this;
        }

        if (!this.isMarkerable) {
          return this.move(direction);
        }

        var pos = this;

        // Helper fn to check if the pos is at the `dir` boundary of its section
        var isBoundary = function isBoundary(pos, dir) {
          return dir === BACKWARD ? pos.isHead() : pos.isTail();
        };
        // Get the char at this position (looking forward/right)
        var getChar = function getChar(pos) {
          var marker = pos.marker;
          var offsetInMarker = pos.offsetInMarker;

          return marker.charAt(offsetInMarker);
        };
        // Get the char in `dir` at this position
        var peekChar = function peekChar(pos, dir) {
          return dir === BACKWARD ? getChar(pos.move(BACKWARD)) : getChar(pos);
        };
        // Whether there is an atom in `dir` from this position
        var isAtom = function isAtom(pos, dir) {
          // Special case when position is at end, the marker associated with it is
          // the marker to its left. Normally `pos#marker` is the marker to the right of the pos's offset.
          if (dir === BACKWARD && pos.isTail() && pos.marker.isAtom) {
            return true;
          }
          return dir === BACKWARD ? pos.move(BACKWARD).marker.isAtom : pos.marker.isAtom;
        };

        if (isBoundary(pos, direction)) {
          // extend movement into prev/next section
          return pos.move(direction).moveWord(direction);
        }

        var seekWord = function seekWord(pos) {
          return !isBoundary(pos, direction) && !isAtom(pos, direction) && !WORD_CHAR_REGEX.test(peekChar(pos, direction));
        };

        // move(dir) while we are seeking the first word char
        while (seekWord(pos)) {
          pos = pos.move(direction);
        }

        if (isAtom(pos, direction)) {
          return pos.move(direction);
        }

        var seekBoundary = function seekBoundary(pos) {
          return !isBoundary(pos, direction) && !isAtom(pos, direction) && WORD_CHAR_REGEX.test(peekChar(pos, direction));
        };

        // move(dir) while we are seeking the first boundary position
        while (seekBoundary(pos)) {
          pos = pos.move(direction);
        }

        return pos;
      }

      /**
       * The position to the left of this position.
       * If this position is the post's headPosition it returns itself.
       * @return {Position}
       * @private
       */
    }, {
      key: 'moveLeft',
      value: function moveLeft() {
        if (this.isHead()) {
          var prev = this.section.previousLeafSection();
          return prev ? prev.tailPosition() : this;
        } else {
          var offset = this.offset - 1;
          if (this.isMarkerable && this.marker) {
            var code = this.marker.value.charCodeAt(offset);
            if (code >= _mobiledocKitModelsMarker.LOW_SURROGATE_RANGE[0] && code <= _mobiledocKitModelsMarker.LOW_SURROGATE_RANGE[1]) {
              offset = offset - 1;
            }
          }
          return new Position(this.section, offset);
        }
      }

      /**
       * The position to the right of this position.
       * If this position is the post's tailPosition it returns itself.
       * @return {Position}
       * @private
       */
    }, {
      key: 'moveRight',
      value: function moveRight() {
        if (this.isTail()) {
          var next = this.section.nextLeafSection();
          return next ? next.headPosition() : this;
        } else {
          var offset = this.offset + 1;
          if (this.isMarkerable && this.marker) {
            var code = this.marker.value.charCodeAt(offset - 1);
            if (code >= _mobiledocKitModelsMarker.HIGH_SURROGATE_RANGE[0] && code <= _mobiledocKitModelsMarker.HIGH_SURROGATE_RANGE[1]) {
              offset = offset + 1;
            }
          }
          return new Position(this.section, offset);
        }
      }
    }, {
      key: 'leafSectionIndex',
      get: function get() {
        var _this = this;

        var post = this.section.post;
        var leafSectionIndex = undefined;
        post.walkAllLeafSections(function (section, index) {
          if (section === _this.section) {
            leafSectionIndex = index;
          }
        });
        return leafSectionIndex;
      }
    }, {
      key: 'isMarkerable',
      get: function get() {
        return this.section && this.section.isMarkerable;
      }

      /**
       * Returns the marker at this position, in the backward direction
       * (i.e., the marker to the left of the cursor if the cursor is on a marker boundary and text is left-to-right)
       * @return {Marker|undefined}
       */
    }, {
      key: 'marker',
      get: function get() {
        return this.isMarkerable && this.markerPosition.marker;
      }
    }, {
      key: 'offsetInMarker',
      get: function get() {
        return this.markerPosition.offset;
      }
    }, {
      key: 'markerPosition',

      /**
       * @private
       */
      get: function get() {
        (0, _mobiledocKitUtilsAssert['default'])('Cannot get markerPosition without a section', !!this.section);
        (0, _mobiledocKitUtilsAssert['default'])('cannot get markerPosition of a non-markerable', !!this.section.isMarkerable);
        return this.section.markerPositionAtOffset(this.offset);
      }
    }], [{
      key: 'atPoint',
      value: function atPoint(x, y, editor) {
        var _renderTree = editor._renderTree;
        var rootElement = editor.element;

        var elementFromPoint = document.elementFromPoint(x, y);
        if (!(0, _mobiledocKitUtilsDomUtils.containsNode)(rootElement, elementFromPoint)) {
          return;
        }

        var _findOffsetInNode = (0, _mobiledocKitUtilsSelectionUtils.findOffsetInNode)(elementFromPoint, { left: x, top: y });

        var node = _findOffsetInNode.node;
        var offset = _findOffsetInNode.offset;

        return Position.fromNode(_renderTree, node, offset);
      }
    }, {
      key: 'blankPosition',
      value: function blankPosition() {
        return new BlankPosition();
      }
    }, {
      key: 'fromNode',
      value: function fromNode(renderTree, node, offset) {
        if ((0, _mobiledocKitUtilsDomUtils.isTextNode)(node)) {
          return Position.fromTextNode(renderTree, node, offset);
        } else {
          return Position.fromElementNode(renderTree, node, offset);
        }
      }
    }, {
      key: 'fromTextNode',
      value: function fromTextNode(renderTree, textNode, offsetInNode) {
        var renderNode = renderTree.getElementRenderNode(textNode);
        var section = undefined,
            offsetInSection = undefined;

        if (renderNode) {
          var marker = renderNode.postNode;
          section = marker.section;

          (0, _mobiledocKitUtilsAssert['default'])('Could not find parent section for mapped text node "' + textNode.textContent + '"', !!section);
          offsetInSection = section.offsetOfMarker(marker, offsetInNode);
        } else {
          // all text nodes should be rendered by markers except:
          //   * text nodes inside cards
          //   * text nodes created by the browser during text input
          // both of these should have rendered parent sections, though
          section = findParentSectionFromNode(renderTree, textNode);
          (0, _mobiledocKitUtilsAssert['default'])('Could not find parent section for un-mapped text node "' + textNode.textContent + '"', !!section);

          offsetInSection = findOffsetInSection(section, textNode, offsetInNode);
        }

        return new Position(section, offsetInSection);
      }
    }, {
      key: 'fromElementNode',
      value: function fromElementNode(renderTree, elementNode, offset) {
        var position = undefined;

        // The browser may change the reported selection to equal the editor's root
        // element if the user clicks an element that is immediately removed,
        // which can happen when clicking to remove a card.
        if (elementNode === renderTree.rootElement) {
          var post = renderTree.rootNode.postNode;
          position = offset === 0 ? post.headPosition() : post.tailPosition();
        } else {
          var section = findParentSectionFromNode(renderTree, elementNode);
          (0, _mobiledocKitUtilsAssert['default'])('Could not find parent section from element node', !!section);

          if (section.isCardSection) {
            // Selections in cards are usually made on a text node
            // containing a &zwnj;  on one side or the other of the card but
            // some scenarios (Firefox) will result in selecting the
            // card's wrapper div. If the offset is 2 we've selected
            // the final zwnj and should consider the cursor at the
            // end of the card (offset 1). Otherwise,  the cursor is at
            // the start of the card
            position = offset < 2 ? section.headPosition() : section.tailPosition();
          } else {

            // In Firefox it is possible for the cursor to be on an atom's wrapper
            // element. (In Chrome/Safari, the browser corrects this to be on
            // one of the text nodes surrounding the wrapper).
            // This code corrects for when the browser reports the cursor position
            // to be on the wrapper element itself
            var renderNode = renderTree.getElementRenderNode(elementNode);
            var postNode = renderNode && renderNode.postNode;
            if (postNode && postNode.isAtom) {
              var sectionOffset = section.offsetOfMarker(postNode);
              if (offset > 1) {
                // we are on the tail side of the atom
                sectionOffset += postNode.length;
              }
              position = new Position(section, sectionOffset);
            } else if (offset >= elementNode.childNodes.length) {

              // This is to deal with how Firefox handles triple-click selections.
              // See https://stackoverflow.com/a/21234837/1269194 for an
              // explanation.
              position = section.tailPosition();
            } else {
              // The offset is 0 if the cursor is on a non-atom-wrapper element node
              // (e.g., a <br> tag in a blank markup section)
              position = section.headPosition();
            }
          }
        }

        return position;
      }
    }]);

    return Position;
  })();

  BlankPosition = (function (_Position) {
    _inherits(BlankPosition, _Position);

    function BlankPosition() {
      _classCallCheck(this, BlankPosition);

      _get(Object.getPrototypeOf(BlankPosition.prototype), 'constructor', this).call(this, null, 0, true);
    }

    _createClass(BlankPosition, [{
      key: 'isEqual',
      value: function isEqual(other) {
        return other && other.isBlank;
      }
    }, {
      key: 'toRange',
      value: function toRange() {
        return _mobiledocKitUtilsCursorRange['default'].blankRange();
      }
    }, {
      key: 'isHeadOfPost',
      value: function isHeadOfPost() {
        return false;
      }
    }, {
      key: 'isTailOfPost',
      value: function isTailOfPost() {
        return false;
      }
    }, {
      key: 'isHead',
      value: function isHead() {
        return false;
      }
    }, {
      key: 'isTail',
      value: function isTail() {
        return false;
      }
    }, {
      key: 'move',
      value: function move() {
        return this;
      }
    }, {
      key: 'moveWord',
      value: function moveWord() {
        return this;
      }
    }, {
      key: 'leafSectionIndex',
      get: function get() {
        (0, _mobiledocKitUtilsAssert['default'])('must implement get leafSectionIndex', false);
      }
    }, {
      key: 'isMarkerable',
      get: function get() {
        return false;
      }
    }, {
      key: 'marker',
      get: function get() {
        return false;
      }
    }, {
      key: 'markerPosition',
      get: function get() {
        return {};
      }
    }]);

    return BlankPosition;
  })(Position);

  exports['default'] = Position;
});
define('mobiledoc-kit/utils/cursor/range', ['exports', 'mobiledoc-kit/utils/cursor/position', 'mobiledoc-kit/utils/key', 'mobiledoc-kit/utils/assert'], function (exports, _mobiledocKitUtilsCursorPosition, _mobiledocKitUtilsKey, _mobiledocKitUtilsAssert) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  /**
   * A logical range of a {@link Post}.
   * Usually an instance of Range will be read from the {@link Editor#range} property,
   * but it may be useful to instantiate a range directly when programmatically modifying a Post.
   */

  var Range = (function () {
    /**
     * @param {Position} head
     * @param {Position} [tail=head]
     * @param {Direction} [direction=null]
     * @return {Range}
     * @private
     */

    function Range(head) {
      var tail = arguments.length <= 1 || arguments[1] === undefined ? head : arguments[1];
      var direction = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
      return (function () {
        _classCallCheck(this, Range);

        /** @property {Position} head */
        this.head = head;

        /** @property {Position} tail */
        this.tail = tail;

        /** @property {Direction} direction */
        this.direction = direction;
      }).apply(this, arguments);
    }

    /**
     * Shorthand to create a new range from a section(s) and offset(s).
     * When given only a head section and offset, creates a collapsed range.
     * @param {Section} headSection
     * @param {number} headOffset
     * @param {Section} [tailSection=headSection]
     * @param {number} [tailOffset=headOffset]
     * @param {Direction} [direction=null]
     * @return {Range}
     */

    _createClass(Range, [{
      key: 'trimTo',

      /**
       * @param {Markerable} section
       * @return {Range} A range that is constrained to only the part that
       * includes the section.
       * FIXME -- if the section isn't the head or tail, it's assumed to be
       * wholly contained. It's possible to call `trimTo` with a selection that is
       * outside of the range, though, which would invalidate that assumption.
       * There's no efficient way to determine if a section is within a range, yet.
       * @private
       */
      value: function trimTo(section) {
        var length = section.length;

        var headOffset = section === this.head.section ? Math.min(this.head.offset, length) : 0;
        var tailOffset = section === this.tail.section ? Math.min(this.tail.offset, length) : length;

        return Range.create(section, headOffset, section, tailOffset);
      }

      /**
       * Expands the range 1 unit in the given direction
       * If the range is expandable in the given direction, always returns a
       * non-collapsed range.
       * @param {Number} units If units is > 0, the range is extended to the right,
       *                 otherwise range is extended to the left.
       * @return {Range}
       * @public
       */
    }, {
      key: 'extend',
      value: function extend(units) {
        (0, _mobiledocKitUtilsAssert['default'])('Must pass integer to Range#extend', typeof units === 'number');

        if (units === 0) {
          return this;
        }

        var head = this.head;
        var tail = this.tail;
        var currentDirection = this.direction;

        switch (currentDirection) {
          case _mobiledocKitUtilsKey.DIRECTION.FORWARD:
            return new Range(head, tail.move(units), currentDirection);
          case _mobiledocKitUtilsKey.DIRECTION.BACKWARD:
            return new Range(head.move(units), tail, currentDirection);
          default:
            {
              var newDirection = units > 0 ? _mobiledocKitUtilsKey.DIRECTION.FORWARD : _mobiledocKitUtilsKey.DIRECTION.BACKWARD;
              return new Range(head, tail, newDirection).extend(units);
            }
        }
      }

      /**
       * Moves this range 1 unit in the given direction.
       * If the range is collapsed, returns a collapsed range shifted by 1 unit,
       * otherwise collapses this range to the position at the `direction` end of the range.
       * Always returns a collapsed range.
       * @param {Direction} direction
       * @return {Range}
       * @public
       */
    }, {
      key: 'move',
      value: function move(direction) {
        (0, _mobiledocKitUtilsAssert['default'])('Must pass DIRECTION.FORWARD (' + _mobiledocKitUtilsKey.DIRECTION.FORWARD + ') or DIRECTION.BACKWARD (' + _mobiledocKitUtilsKey.DIRECTION.BACKWARD + ') to Range#move', direction === _mobiledocKitUtilsKey.DIRECTION.FORWARD || direction === _mobiledocKitUtilsKey.DIRECTION.BACKWARD);

        var focusedPosition = this.focusedPosition;
        var isCollapsed = this.isCollapsed;

        if (isCollapsed) {
          return new Range(focusedPosition.move(direction));
        } else {
          return this._collapse(direction);
        }
      }

      /**
       * expand a range to all markers matching a given check
       *
       * @param {Function} detectMarker
       * @return {Range} The expanded range
       *
       * @public
       */
    }, {
      key: 'expandByMarker',
      value: function expandByMarker(detectMarker) {
        var head = this.head;
        var tail = this.tail;
        var direction = this.direction;
        var headSection = head.section;

        if (headSection !== tail.section) {
          throw new Error('#expandByMarker does not work across sections. Perhaps you should confirm the range is collapsed');
        }

        var firstNotMatchingDetect = function firstNotMatchingDetect(i) {
          return !detectMarker(i);
        };

        var headMarker = headSection.markers.detect(firstNotMatchingDetect, head.marker, true);
        if (!headMarker && detectMarker(headSection.markers.head)) {
          headMarker = headSection.markers.head;
        } else {
          headMarker = headMarker.next || head.marker;
        }
        var headPosition = new _mobiledocKitUtilsCursorPosition['default'](headSection, headSection.offsetOfMarker(headMarker));

        var tailMarker = tail.section.markers.detect(firstNotMatchingDetect, tail.marker);
        if (!tailMarker && detectMarker(headSection.markers.tail)) {
          tailMarker = headSection.markers.tail;
        } else {
          tailMarker = tailMarker.prev || tail.marker;
        }
        var tailPosition = new _mobiledocKitUtilsCursorPosition['default'](tail.section, tail.section.offsetOfMarker(tailMarker) + tailMarker.length);

        return headPosition.toRange(tailPosition, direction);
      }
    }, {
      key: '_collapse',
      value: function _collapse(direction) {
        return new Range(direction === _mobiledocKitUtilsKey.DIRECTION.BACKWARD ? this.head : this.tail);
      }
    }, {
      key: 'isEqual',
      value: function isEqual(other) {
        return other && this.head.isEqual(other.head) && this.tail.isEqual(other.tail);
      }
    }, {
      key: 'focusedPosition',
      get: function get() {
        return this.direction === _mobiledocKitUtilsKey.DIRECTION.BACKWARD ? this.head : this.tail;
      }
    }, {
      key: 'isBlank',
      get: function get() {
        return this.head.isBlank && this.tail.isBlank;
      }

      // "legacy" APIs
    }, {
      key: 'headSection',
      get: function get() {
        return this.head.section;
      }
    }, {
      key: 'tailSection',
      get: function get() {
        return this.tail.section;
      }
    }, {
      key: 'headSectionOffset',
      get: function get() {
        return this.head.offset;
      }
    }, {
      key: 'tailSectionOffset',
      get: function get() {
        return this.tail.offset;
      }
    }, {
      key: 'isCollapsed',
      get: function get() {
        return this.head.isEqual(this.tail);
      }
    }, {
      key: 'headMarker',
      get: function get() {
        return this.head.marker;
      }
    }, {
      key: 'tailMarker',
      get: function get() {
        return this.tail.marker;
      }
    }, {
      key: 'headMarkerOffset',
      get: function get() {
        return this.head.offsetInMarker;
      }
    }, {
      key: 'tailMarkerOffset',
      get: function get() {
        return this.tail.offsetInMarker;
      }
    }], [{
      key: 'create',
      value: function create(headSection, headOffset) {
        var tailSection = arguments.length <= 2 || arguments[2] === undefined ? headSection : arguments[2];
        var tailOffset = arguments.length <= 3 || arguments[3] === undefined ? headOffset : arguments[3];
        var direction = arguments.length <= 4 || arguments[4] === undefined ? null : arguments[4];
        return (function () {
          return new Range(new _mobiledocKitUtilsCursorPosition['default'](headSection, headOffset), new _mobiledocKitUtilsCursorPosition['default'](tailSection, tailOffset), direction);
        })();
      }
    }, {
      key: 'blankRange',
      value: function blankRange() {
        return new Range(_mobiledocKitUtilsCursorPosition['default'].blankPosition(), _mobiledocKitUtilsCursorPosition['default'].blankPosition());
      }
    }]);

    return Range;
  })();

  exports['default'] = Range;
});
define("mobiledoc-kit/utils/deprecate", ["exports"], function (exports) {
  /**
   * Usage:
   * Without a conditional, always prints deprecate message:
   *   `deprecate('This is deprecated')`
   *
   * Conditional deprecation, works similarly to `assert`, prints deprecation if
   * conditional is false:
   *   `deprecate('Deprecated only if foo !== bar', foo === bar)`
   */
  "use strict";

  exports["default"] = deprecate;

  function deprecate(message) {
    var conditional = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

    if (!conditional) {
      // eslint-disable-next-line no-console
      console.log("[mobiledoc-kit] [DEPRECATED]: " + message);
    }
  }
});
define('mobiledoc-kit/utils/dom-utils', ['exports', 'mobiledoc-kit/utils/array-utils'], function (exports, _mobiledocKitUtilsArrayUtils) {
  'use strict';

  var NODE_TYPES = {
    ELEMENT: 1,
    TEXT: 3,
    COMMENT: 8
  };

  exports.NODE_TYPES = NODE_TYPES;
  function isTextNode(node) {
    return node.nodeType === NODE_TYPES.TEXT;
  }

  function isCommentNode(node) {
    return node.nodeType === NODE_TYPES.COMMENT;
  }

  function isElementNode(node) {
    return node.nodeType === NODE_TYPES.ELEMENT;
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

  /**
   * @return {Boolean} true when the child node is contained or the same as
   * (e.g., inclusive containment)  the parent node
   *  see https://github.com/webmodules/node-contains/blob/master/index.js
   *  Mimics the behavior of `Node.contains`, which is broken in IE 10
   *  @private
   */
  function containsNode(parentNode, childNode) {
    if (parentNode === childNode) {
      return true;
    }
    var position = parentNode.compareDocumentPosition(childNode);
    return !!(position & Node.DOCUMENT_POSITION_CONTAINED_BY);
  }

  /**
   * converts the element's NamedNodeMap of attrs into
   * an object with key-value pairs
   * @param {DOMNode} element
   * @return {Object} key-value pairs
   * @private
   */
  function getAttributes(element) {
    var result = {};
    if (element.hasAttributes()) {
      (0, _mobiledocKitUtilsArrayUtils.forEach)(element.attributes, function (_ref) {
        var name = _ref.name;
        var value = _ref.value;

        result[name] = value;
      });
    }
    return result;
  }

  function addClassName(element, className) {
    element.classList.add(className);
  }

  function removeClassName(element, className) {
    element.classList.remove(className);
  }

  function normalizeTagName(tagName) {
    return tagName.toLowerCase();
  }

  function parseHTML(html) {
    var div = document.createElement('div');
    div.innerHTML = html;
    return div;
  }

  function serializeHTML(node) {
    var div = document.createElement('div');
    div.appendChild(node);
    return div.innerHTML;
  }

  exports.containsNode = containsNode;
  exports.clearChildNodes = clearChildNodes;
  exports.getAttributes = getAttributes;
  exports.walkDOM = walkDOM;
  exports.walkTextNodes = walkTextNodes;
  exports.addClassName = addClassName;
  exports.removeClassName = removeClassName;
  exports.normalizeTagName = normalizeTagName;
  exports.isTextNode = isTextNode;
  exports.isCommentNode = isCommentNode;
  exports.isElementNode = isElementNode;
  exports.parseHTML = parseHTML;
  exports.serializeHTML = serializeHTML;
});
define('mobiledoc-kit/utils/element-map', ['exports', 'mobiledoc-kit/utils/assert'], function (exports, _mobiledocKitUtilsAssert) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  // start at one to make the falsy semantics easier
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
        (0, _mobiledocKitUtilsAssert['default'])('tried to fetch a value for an element not seen before', !!key._uuid);
        delete this._map[key._uuid];
      }
    }]);

    return ElementMap;
  })();

  exports['default'] = ElementMap;
});
define('mobiledoc-kit/utils/element-utils', ['exports', 'mobiledoc-kit/utils/string-utils', 'mobiledoc-kit/utils/dom-utils'], function (exports, _mobiledocKitUtilsStringUtils, _mobiledocKitUtilsDomUtils) {
  'use strict';

  function getEventTargetMatchingTag(tagName, target, container) {
    tagName = (0, _mobiledocKitUtilsDomUtils.normalizeTagName)(tagName);
    // Traverses up DOM from an event target to find the node matching specifed tag
    while (target && target !== container) {
      if ((0, _mobiledocKitUtilsDomUtils.normalizeTagName)(target.tagName) === tagName) {
        return target;
      }
      target = target.parentNode;
    }
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

  function positionElementCenteredBelow(element, belowElement) {
    var elementMargin = getElementComputedStyleNumericProp(element, 'marginTop');
    return positionElementHorizontallyCenteredToRect(element, belowElement.getBoundingClientRect(), -element.offsetHeight - elementMargin);
  }

  function setData(element, name, value) {
    if (element.dataset) {
      element.dataset[name] = value;
    } else {
      var dataName = (0, _mobiledocKitUtilsStringUtils.dasherize)(name);
      return element.setAttribute(dataName, value);
    }
  }

  function whenElementIsNotInDOM(element, callback) {
    var isCanceled = false;
    var observerFn = function observerFn() {
      if (isCanceled) {
        return;
      }
      if (!element.parentNode) {
        callback();
      } else {
        window.requestAnimationFrame(observerFn);
      }
    };
    observerFn();
    return { cancel: function cancel() {
        return isCanceled = true;
      } };
  }

  exports.setData = setData;
  exports.getEventTargetMatchingTag = getEventTargetMatchingTag;
  exports.getElementRelativeOffset = getElementRelativeOffset;
  exports.getElementComputedStyleNumericProp = getElementComputedStyleNumericProp;
  exports.positionElementToRect = positionElementToRect;
  exports.positionElementHorizontallyCenteredToRect = positionElementHorizontallyCenteredToRect;
  exports.positionElementCenteredBelow = positionElementCenteredBelow;
  exports.whenElementIsNotInDOM = whenElementIsNotInDOM;
});
define('mobiledoc-kit/utils/environment', ['exports'], function (exports) {
  'use strict';

  exports['default'] = {
    hasDOM: function hasDOM() {
      return typeof document !== 'undefined';
    }
  };
});
define("mobiledoc-kit/utils/fixed-queue", ["exports"], function (exports) {
  "use strict";

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var FixedQueue = (function () {
    function FixedQueue() {
      var length = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

      _classCallCheck(this, FixedQueue);

      this._maxLength = length;
      this._items = [];
    }

    _createClass(FixedQueue, [{
      key: "pop",
      value: function pop() {
        return this._items.pop();
      }
    }, {
      key: "push",
      value: function push(item) {
        this._items.push(item);
        if (this.length > this._maxLength) {
          this._items.shift();
        }
      }
    }, {
      key: "clear",
      value: function clear() {
        this._items = [];
      }
    }, {
      key: "toArray",
      value: function toArray() {
        return this._items;
      }
    }, {
      key: "length",
      get: function get() {
        return this._items.length;
      }
    }]);

    return FixedQueue;
  })();

  exports["default"] = FixedQueue;
});
define('mobiledoc-kit/utils/key', ['exports', 'mobiledoc-kit/utils/keycodes', 'mobiledoc-kit/utils/keys', 'mobiledoc-kit/utils/characters', 'mobiledoc-kit/utils/assert'], function (exports, _mobiledocKitUtilsKeycodes, _mobiledocKitUtilsKeys, _mobiledocKitUtilsCharacters, _mobiledocKitUtilsAssert) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  exports.modifierMask = modifierMask;
  exports.specialCharacterToCode = specialCharacterToCode;

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  /**
   * @typedef Direction
   * @enum {number}
   * @property {number} FORWARD
   * @property {number} BACKWARD
   */
  var DIRECTION = {
    FORWARD: 1,
    BACKWARD: -1
  };
  exports.DIRECTION = DIRECTION;
  var MODIFIERS = {
    META: 1, // also called "command" on OS X
    CTRL: 2,
    SHIFT: 4,
    ALT: 8 // also called "option" on OS X
  };

  exports.MODIFIERS = MODIFIERS;

  function modifierMask(event) {
    var metaKey = event.metaKey;
    var shiftKey = event.shiftKey;
    var ctrlKey = event.ctrlKey;
    var altKey = event.altKey;

    var modVal = function modVal(val, modifier) {
      return val && modifier || 0;
    };
    return modVal(metaKey, MODIFIERS.META) + modVal(shiftKey, MODIFIERS.SHIFT) + modVal(ctrlKey, MODIFIERS.CTRL) + modVal(altKey, MODIFIERS.ALT);
  }

  var SPECIAL_KEYS = {
    BACKSPACE: _mobiledocKitUtilsKeycodes['default'].BACKSPACE,
    TAB: _mobiledocKitUtilsKeycodes['default'].TAB,
    ENTER: _mobiledocKitUtilsKeycodes['default'].ENTER,
    ESC: _mobiledocKitUtilsKeycodes['default'].ESC,
    SPACE: _mobiledocKitUtilsKeycodes['default'].SPACE,
    PAGEUP: _mobiledocKitUtilsKeycodes['default'].PAGEUP,
    PAGEDOWN: _mobiledocKitUtilsKeycodes['default'].PAGEDOWN,
    END: _mobiledocKitUtilsKeycodes['default'].END,
    HOME: _mobiledocKitUtilsKeycodes['default'].HOME,
    LEFT: _mobiledocKitUtilsKeycodes['default'].LEFT,
    UP: _mobiledocKitUtilsKeycodes['default'].UP,
    RIGHT: _mobiledocKitUtilsKeycodes['default'].RIGHT,
    DOWN: _mobiledocKitUtilsKeycodes['default'].DOWN,
    INS: _mobiledocKitUtilsKeycodes['default'].INS,
    DEL: _mobiledocKitUtilsKeycodes['default'].DELETE
  };

  function specialCharacterToCode(specialCharacter) {
    return SPECIAL_KEYS[specialCharacter];
  }

  // heuristic for determining if `event` is a key event
  function isKeyEvent(event) {
    return (/^key/.test(event.type)
    );
  }

  /**
   * An abstraction around a KeyEvent
   * that key listeners in the editor can use
   * to determine what sort of key was pressed
   */
  var Key = (function () {
    function Key(event) {
      _classCallCheck(this, Key);

      this.key = event.key;
      this.keyCode = event.keyCode;
      this.charCode = event.charCode;
      this.event = event;
      this.modifierMask = modifierMask(event);
    }

    _createClass(Key, [{
      key: 'toString',
      value: function toString() {
        if (this.isTab()) {
          return _mobiledocKitUtilsCharacters.TAB;
        }
        return String.fromCharCode(this.charCode);
      }

      // See https://caniuse.com/#feat=keyboardevent-key for browser support.
    }, {
      key: 'isKeySupported',
      value: function isKeySupported() {
        return this.key;
      }
    }, {
      key: 'isKey',
      value: function isKey(identifier) {
        if (this.isKeySupported()) {
          (0, _mobiledocKitUtilsAssert['default'])('Must define Keys.' + identifier + '.', _mobiledocKitUtilsKeys['default'][identifier]);
          return this.key === _mobiledocKitUtilsKeys['default'][identifier];
        } else {
          (0, _mobiledocKitUtilsAssert['default'])('Must define Keycodes.' + identifier + '.', _mobiledocKitUtilsKeycodes['default'][identifier]);
          return this.keyCode === _mobiledocKitUtilsKeycodes['default'][identifier];
        }
      }
    }, {
      key: 'isEscape',
      value: function isEscape() {
        return this.isKey('ESC');
      }
    }, {
      key: 'isDelete',
      value: function isDelete() {
        return this.isKey('BACKSPACE') || this.isForwardDelete();
      }
    }, {
      key: 'isForwardDelete',
      value: function isForwardDelete() {
        return this.isKey('DELETE');
      }
    }, {
      key: 'isArrow',
      value: function isArrow() {
        return this.isHorizontalArrow() || this.isVerticalArrow();
      }
    }, {
      key: 'isHorizontalArrow',
      value: function isHorizontalArrow() {
        return this.isLeftArrow() || this.isRightArrow();
      }
    }, {
      key: 'isHorizontalArrowWithoutModifiersOtherThanShift',
      value: function isHorizontalArrowWithoutModifiersOtherThanShift() {
        return this.isHorizontalArrow() && !(this.ctrlKey || this.metaKey || this.altKey);
      }
    }, {
      key: 'isVerticalArrow',
      value: function isVerticalArrow() {
        return this.isKey('UP') || this.isKey('DOWN');
      }
    }, {
      key: 'isLeftArrow',
      value: function isLeftArrow() {
        return this.isKey('LEFT');
      }
    }, {
      key: 'isRightArrow',
      value: function isRightArrow() {
        return this.isKey('RIGHT');
      }
    }, {
      key: 'isHome',
      value: function isHome() {
        return this.isKey('HOME');
      }
    }, {
      key: 'isEnd',
      value: function isEnd() {
        return this.isKey('END');
      }
    }, {
      key: 'isPageUp',
      value: function isPageUp() {
        return this.isKey('PAGEUP');
      }
    }, {
      key: 'isPageDown',
      value: function isPageDown() {
        return this.isKey('PAGEDOWN');
      }
    }, {
      key: 'isInsert',
      value: function isInsert() {
        return this.isKey('INS');
      }
    }, {
      key: 'isClear',
      value: function isClear() {
        return this.isKey('CLEAR');
      }
    }, {
      key: 'isPause',
      value: function isPause() {
        return this.isKey('PAUSE');
      }
    }, {
      key: 'isSpace',
      value: function isSpace() {
        return this.isKey('SPACE');
      }

      // In Firefox, pressing ctrl-TAB will switch to another open browser tab, but
      // it will also fire a keydown event for the tab+modifier (ctrl). This causes
      // Mobiledoc to erroneously insert a tab character before FF switches to the
      // new browser tab.  Chrome doesn't fire this event so the issue doesn't
      // arise there. Fix this by returning false when the TAB key event includes a
      // modifier.
      // See: https://github.com/bustle/mobiledoc-kit/issues/565
    }, {
      key: 'isTab',
      value: function isTab() {
        return !this.hasAnyModifier() && this.isKey('TAB');
      }
    }, {
      key: 'isEnter',
      value: function isEnter() {
        return this.isKey('ENTER');
      }

      /*
       * If the key is the actual shift key. This is false when the shift key
       * is held down and the source `event` is not the shift key.
       * @see {isShift}
       * @return {bool}
       */
    }, {
      key: 'isShiftKey',
      value: function isShiftKey() {
        return this.isKey('SHIFT');
      }

      /*
       * If the key is the actual alt key (aka "option" on mac). This is false when the alt key
       * is held down and the source `event` is not the alt key.
       * @return {bool}
       */
    }, {
      key: 'isAltKey',
      value: function isAltKey() {
        return this.isKey('ALT');
      }

      /*
       * If the key is the actual ctrl key. This is false when the ctrl key
       * is held down and the source `event` is not the ctrl key.
       * @return {bool}
       */
    }, {
      key: 'isCtrlKey',
      value: function isCtrlKey() {
        return this.isKey('CTRL');
      }
    }, {
      key: 'isIME',
      value: function isIME() {
        // FIXME the IME action seems to get lost when we issue an
        // `editor.deleteSelection` before it (in Chrome)
        return this.keyCode === _mobiledocKitUtilsKeycodes['default'].IME;
      }
    }, {
      key: 'isShift',

      /**
       * If the shift key is depressed.
       * For example, while holding down meta+shift, pressing the "v"
       * key would result in an event whose `Key` had `isShift()` with a truthy value,
       * because the shift key is down when pressing the "v".
       * @see {isShiftKey} which checks if the key is actually the shift key itself.
       * @return {bool}
       */
      value: function isShift() {
        return this.shiftKey;
      }
    }, {
      key: 'hasModifier',
      value: function hasModifier(modifier) {
        return modifier & this.modifierMask;
      }
    }, {
      key: 'hasAnyModifier',
      value: function hasAnyModifier() {
        return !!this.modifierMask;
      }
    }, {
      key: 'isPrintableKey',
      value: function isPrintableKey() {
        return !(this.isArrow() || this.isHome() || this.isEnd() || this.isPageUp() || this.isPageDown() || this.isInsert() || this.isClear() || this.isPause() || this.isEscape());
      }
    }, {
      key: 'isNumberKey',
      value: function isNumberKey() {
        if (this.isKeySupported()) {
          return this.key >= '0' && this.key <= '9';
        } else {
          var code = this.keyCode;
          return code >= _mobiledocKitUtilsKeycodes['default']['0'] && code <= _mobiledocKitUtilsKeycodes['default']['9'] || code >= _mobiledocKitUtilsKeycodes['default'].NUMPAD_0 && code <= _mobiledocKitUtilsKeycodes['default'].NUMPAD_9; // numpad keys
        }
      }
    }, {
      key: 'isLetterKey',
      value: function isLetterKey() {
        if (this.isKeySupported()) {
          var key = this.key;
          return key >= 'a' && key <= 'z' || key >= 'A' && key <= 'Z';
        } else {
          var code = this.keyCode;
          return code >= _mobiledocKitUtilsKeycodes['default'].A && code <= _mobiledocKitUtilsKeycodes['default'].Z || code >= _mobiledocKitUtilsKeycodes['default'].a && code <= _mobiledocKitUtilsKeycodes['default'].z;
        }
      }
    }, {
      key: 'isPunctuation',
      value: function isPunctuation() {
        if (this.isKeySupported()) {
          var key = this.key;
          return key >= ';' && key <= '`' || key >= '[' && key <= '"';
        } else {
          var code = this.keyCode;
          return code >= _mobiledocKitUtilsKeycodes['default'][';'] && code <= _mobiledocKitUtilsKeycodes['default']['`'] || code >= _mobiledocKitUtilsKeycodes['default']['['] && code <= _mobiledocKitUtilsKeycodes['default']['"'];
        }
      }

      /**
       * See https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode#Printable_keys_in_standard_position
       *   and http://stackoverflow.com/a/12467610/137784
       */
    }, {
      key: 'isPrintable',
      value: function isPrintable() {
        if (this.ctrlKey || this.metaKey) {
          return false;
        }

        // Firefox calls keypress events for some keys that should not be printable
        if (!this.isPrintableKey()) {
          return false;
        }

        return this.keyCode !== 0 || this.toString().length > 0 || this.isNumberKey() || this.isSpace() || this.isTab() || this.isEnter() || this.isLetterKey() || this.isPunctuation() || this.isIME();
      }
    }, {
      key: 'direction',
      get: function get() {
        switch (true) {
          case this.isDelete():
            return this.isForwardDelete() ? DIRECTION.FORWARD : DIRECTION.BACKWARD;
          case this.isHorizontalArrow():
            return this.isRightArrow() ? DIRECTION.FORWARD : DIRECTION.BACKWARD;
        }
      }
    }, {
      key: 'ctrlKey',
      get: function get() {
        return MODIFIERS.CTRL & this.modifierMask;
      }
    }, {
      key: 'metaKey',
      get: function get() {
        return MODIFIERS.META & this.modifierMask;
      }
    }, {
      key: 'shiftKey',
      get: function get() {
        return MODIFIERS.SHIFT & this.modifierMask;
      }
    }, {
      key: 'altKey',
      get: function get() {
        return MODIFIERS.ALT & this.modifierMask;
      }
    }], [{
      key: 'fromEvent',
      value: function fromEvent(event) {
        (0, _mobiledocKitUtilsAssert['default'])('Must pass a Key event to Key.fromEvent', event && isKeyEvent(event));
        return new Key(event);
      }
    }]);

    return Key;
  })();

  exports['default'] = Key;
});
define('mobiledoc-kit/utils/keycodes', ['exports'], function (exports) {
  'use strict';

  exports['default'] = {
    BACKSPACE: 8,
    SPACE: 32,
    ENTER: 13,
    SHIFT: 16,
    ESC: 27,
    DELETE: 46,
    '0': 48,
    '9': 57,
    A: 65,
    Z: 90,
    a: 97,
    z: 122,
    'NUMPAD_0': 186,
    'NUMPAD_9': 111,
    ';': 186,
    '.': 190,
    '`': 192,
    '[': 219,
    '"': 222,

    // Input Method Editor uses multiple keystrokes to display characters.
    // Example on mac: press option-i then i. This fires 2 key events in Chrome
    // with keyCode 229 and displays ˆ and then î.
    // See http://lists.w3.org/Archives/Public/www-dom/2010JulSep/att-0182/keyCode-spec.html#fixed-virtual-key-codes
    IME: 229,

    TAB: 9,
    CLEAR: 12,
    PAUSE: 19,
    PAGEUP: 33,
    PAGEDOWN: 34,
    END: 35,
    HOME: 36,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    INS: 45,
    META: 91,
    ALT: 18,
    CTRL: 17
  };
});
define('mobiledoc-kit/utils/keys', ['exports'], function (exports) {
  'use strict';

  exports['default'] = {
    BACKSPACE: 'Backspace',
    SPACE: ' ',
    ENTER: 'Enter',
    SHIFT: 'Shift',
    ESC: 'Escape',
    DELETE: 'Delete',
    INS: 'Insert',
    HOME: 'Home',
    END: 'End',
    PAGEUP: 'PageUp',
    PAGEDOWN: 'PageDown',
    CLEAR: 'Clear',
    PAUSE: 'Pause',
    TAB: 'Tab',
    ALT: 'Alt',
    CTRL: 'Control',

    LEFT: 'ArrowLeft',
    RIGHT: 'ArrowRight',
    UP: 'ArrowUp',
    DOWN: 'ArrowDown'
  };
});
define("mobiledoc-kit/utils/linked-item", ["exports"], function (exports) {
  "use strict";

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var LinkedItem = function LinkedItem() {
    _classCallCheck(this, LinkedItem);

    this.next = null;
    this.prev = null;
  };

  exports["default"] = LinkedItem;
});
define('mobiledoc-kit/utils/linked-list', ['exports', 'mobiledoc-kit/utils/assert'], function (exports, _mobiledocKitUtilsAssert) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var PARENT_PROP = '__parent';

  var LinkedList = (function () {
    function LinkedList(options) {
      _classCallCheck(this, LinkedList);

      this.head = null;
      this.tail = null;
      this.length = 0;

      if (options) {
        var adoptItem = options.adoptItem;
        var freeItem = options.freeItem;

        this._adoptItem = adoptItem;
        this._freeItem = freeItem;
      }
    }

    _createClass(LinkedList, [{
      key: 'adoptItem',
      value: function adoptItem(item) {
        item[PARENT_PROP] = this;
        this.length++;
        if (this._adoptItem) {
          this._adoptItem(item);
        }
      }
    }, {
      key: 'freeItem',
      value: function freeItem(item) {
        item[PARENT_PROP] = null;
        this.length--;
        if (this._freeItem) {
          this._freeItem(item);
        }
      }
    }, {
      key: 'prepend',
      value: function prepend(item) {
        this.insertBefore(item, this.head);
      }
    }, {
      key: 'append',
      value: function append(item) {
        this.insertBefore(item, null);
      }
    }, {
      key: 'insertAfter',
      value: function insertAfter(item, prevItem) {
        var nextItem = prevItem ? prevItem.next : this.head;
        this.insertBefore(item, nextItem);
      }
    }, {
      key: '_ensureItemIsNotAlreadyInList',
      value: function _ensureItemIsNotAlreadyInList(item) {
        (0, _mobiledocKitUtilsAssert['default'])('Cannot insert an item into a list if it is already in a list', !item.next && !item.prev && this.head !== item);
      }
    }, {
      key: 'insertBefore',
      value: function insertBefore(item, nextItem) {
        this._ensureItemIsNotInList(item);
        this.adoptItem(item);

        var insertPos = undefined;
        if (nextItem && nextItem.prev) {
          insertPos = 'middle';
        } else if (nextItem) {
          insertPos = 'start';
        } else {
          insertPos = 'end';
        }

        switch (insertPos) {
          case 'start':
            if (this.head) {
              item.next = this.head;
              this.head.prev = item;
            }
            this.head = item;

            break;
          case 'middle':
            {
              var prevItem = nextItem.prev;
              item.next = nextItem;
              item.prev = prevItem;
              nextItem.prev = item;
              prevItem.next = item;

              break;
            }
          case 'end':
            {
              var tail = this.tail;
              item.prev = tail;

              if (tail) {
                tail.next = item;
              } else {
                this.head = item;
              }
              this.tail = item;

              break;
            }
        }
      }
    }, {
      key: 'remove',
      value: function remove(item) {
        if (!item[PARENT_PROP]) {
          return;
        }
        this._ensureItemIsInThisList(item);
        this.freeItem(item);

        var prev = item.prev;
        var next = item.next;

        item.prev = null;
        item.next = null;

        if (prev) {
          prev.next = next;
        } else {
          this.head = next;
        }

        if (next) {
          next.prev = prev;
        } else {
          this.tail = prev;
        }
      }
    }, {
      key: 'forEach',
      value: function forEach(callback) {
        var item = this.head;
        var index = 0;
        while (item) {
          callback(item, index++);
          item = item.next;
        }
      }
    }, {
      key: 'map',
      value: function map(callback) {
        var result = [];
        this.forEach(function (i) {
          return result.push(callback(i));
        });
        return result;
      }
    }, {
      key: 'walk',
      value: function walk(startItem, endItem, callback) {
        var item = startItem || this.head;
        while (item) {
          callback(item);
          if (item === endItem) {
            break;
          }
          item = item.next;
        }
      }
    }, {
      key: 'readRange',
      value: function readRange(startItem, endItem) {
        var items = [];
        this.walk(startItem, endItem, function (item) {
          items.push(item);
        });
        return items;
      }
    }, {
      key: 'toArray',
      value: function toArray() {
        return this.readRange();
      }
    }, {
      key: 'detect',
      value: function detect(callback) {
        var item = arguments.length <= 1 || arguments[1] === undefined ? this.head : arguments[1];
        var reverse = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

        while (item) {
          if (callback(item)) {
            return item;
          }
          item = reverse ? item.prev : item.next;
        }
      }
    }, {
      key: 'any',
      value: function any(callback) {
        return !!this.detect(callback);
      }
    }, {
      key: 'every',
      value: function every(callback) {
        var item = this.head;
        while (item) {
          if (!callback(item)) {
            return false;
          }
          item = item.next;
        }
        return true;
      }
    }, {
      key: 'objectAt',
      value: function objectAt(targetIndex) {
        var index = -1;
        return this.detect(function () {
          index++;
          return targetIndex === index;
        });
      }
    }, {
      key: 'splice',
      value: function splice(targetItem, removalCount, newItems) {
        var _this = this;

        var item = targetItem;
        var nextItem = item.next;
        var count = 0;
        while (item && count < removalCount) {
          count++;
          nextItem = item.next;
          this.remove(item);
          item = nextItem;
        }
        newItems.forEach(function (newItem) {
          _this.insertBefore(newItem, nextItem);
        });
      }
    }, {
      key: 'removeBy',
      value: function removeBy(conditionFn) {
        var item = this.head;
        while (item) {
          var nextItem = item.next;

          if (conditionFn(item)) {
            this.remove(item);
          }

          item = nextItem;
        }
      }
    }, {
      key: '_ensureItemIsNotInList',
      value: function _ensureItemIsNotInList(item) {
        (0, _mobiledocKitUtilsAssert['default'])('Cannot insert an item into a list if it is already in a list', !item[PARENT_PROP]);
      }
    }, {
      key: '_ensureItemIsInThisList',
      value: function _ensureItemIsInThisList(item) {
        (0, _mobiledocKitUtilsAssert['default'])('Cannot remove item that is in another list', item[PARENT_PROP] === this);
      }
    }, {
      key: 'isEmpty',
      get: function get() {
        return this.length === 0;
      }
    }]);

    return LinkedList;
  })();

  exports['default'] = LinkedList;
});
define("mobiledoc-kit/utils/log-manager", ["exports"], function (exports) {
  "use strict";

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var Logger = (function () {
    function Logger(type, manager) {
      _classCallCheck(this, Logger);

      this.type = type;
      this.manager = manager;
    }

    _createClass(Logger, [{
      key: "isEnabled",
      value: function isEnabled() {
        return this.manager.isEnabled(this.type);
      }
    }, {
      key: "log",
      value: function log() {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        args.unshift("[" + this.type + "]");
        if (this.isEnabled()) {
          var _window$console;

          (_window$console = window.console).log.apply(_window$console, args);
        }
      }
    }]);

    return Logger;
  })();

  var LogManager = (function () {
    function LogManager() {
      _classCallCheck(this, LogManager);

      this.enabledTypes = [];
      this.allEnabled = false;
    }

    _createClass(LogManager, [{
      key: "for",
      value: function _for(type) {
        return new Logger(type, this);
      }
    }, {
      key: "enableAll",
      value: function enableAll() {
        this.allEnabled = true;
      }
    }, {
      key: "enableTypes",
      value: function enableTypes(types) {
        this.enabledTypes = this.enabledTypes.concat(types);
      }
    }, {
      key: "disable",
      value: function disable() {
        this.enabledTypes = [];
        this.allEnabled = false;
      }
    }, {
      key: "isEnabled",
      value: function isEnabled(type) {
        return this.allEnabled || this.enabledTypes.indexOf(type) !== -1;
      }
    }]);

    return LogManager;
  })();

  exports["default"] = LogManager;
});
define('mobiledoc-kit/utils/markuperable', ['exports', 'mobiledoc-kit/utils/dom-utils', 'mobiledoc-kit/utils/array-utils'], function (exports, _mobiledocKitUtilsDomUtils, _mobiledocKitUtilsArrayUtils) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var Markerupable = (function () {
    function Markerupable() {
      _classCallCheck(this, Markerupable);
    }

    _createClass(Markerupable, [{
      key: 'clearMarkups',
      value: function clearMarkups() {
        this.markups = [];
      }
    }, {
      key: 'addMarkup',
      value: function addMarkup(markup) {
        this.markups.push(markup);
      }
    }, {
      key: 'addMarkupAtIndex',
      value: function addMarkupAtIndex(markup, index) {
        this.markups.splice(index, 0, markup);
      }
    }, {
      key: 'removeMarkup',
      value: function removeMarkup(markupOrMarkupCallback) {
        var _this = this;

        var callback = undefined;
        if (typeof markupOrMarkupCallback === 'function') {
          callback = markupOrMarkupCallback;
        } else {
          (function () {
            var markup = markupOrMarkupCallback;
            callback = function (_markup) {
              return _markup === markup;
            };
          })();
        }

        (0, _mobiledocKitUtilsArrayUtils.forEach)((0, _mobiledocKitUtilsArrayUtils.filter)(this.markups, callback), function (m) {
          return _this._removeMarkup(m);
        });
      }
    }, {
      key: '_removeMarkup',
      value: function _removeMarkup(markup) {
        var index = this.markups.indexOf(markup);
        if (index !== -1) {
          this.markups.splice(index, 1);
        }
      }
    }, {
      key: 'hasMarkup',
      value: function hasMarkup(tagNameOrMarkup) {
        return !!this.getMarkup(tagNameOrMarkup);
      }
    }, {
      key: 'getMarkup',
      value: function getMarkup(tagNameOrMarkup) {
        var _this2 = this;

        if (typeof tagNameOrMarkup === 'string') {
          var _ret2 = (function () {
            var tagName = (0, _mobiledocKitUtilsDomUtils.normalizeTagName)(tagNameOrMarkup);
            return {
              v: (0, _mobiledocKitUtilsArrayUtils.detect)(_this2.markups, function (markup) {
                return markup.tagName === tagName;
              })
            };
          })();

          if (typeof _ret2 === 'object') return _ret2.v;
        } else {
          var _ret3 = (function () {
            var targetMarkup = tagNameOrMarkup;
            return {
              v: (0, _mobiledocKitUtilsArrayUtils.detect)(_this2.markups, function (markup) {
                return markup === targetMarkup;
              })
            };
          })();

          if (typeof _ret3 === 'object') return _ret3.v;
        }
      }
    }, {
      key: 'openedMarkups',
      get: function get() {
        var count = 0;
        if (this.prev) {
          count = (0, _mobiledocKitUtilsArrayUtils.commonItemLength)(this.markups, this.prev.markups);
        }

        return this.markups.slice(count);
      }
    }, {
      key: 'closedMarkups',
      get: function get() {
        var count = 0;
        if (this.next) {
          count = (0, _mobiledocKitUtilsArrayUtils.commonItemLength)(this.markups, this.next.markups);
        }

        return this.markups.slice(count);
      }
    }]);

    return Markerupable;
  })();

  exports['default'] = Markerupable;
});
define("mobiledoc-kit/utils/merge", ["exports"], function (exports) {
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
   * @private
   */
  function merge(original, updates) {
    return mergeWithOptions(original, updates);
  }

  exports.mergeWithOptions = mergeWithOptions;
  exports.merge = merge;
});
define('mobiledoc-kit/utils/mixin', ['exports'], function (exports) {
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
define('mobiledoc-kit/utils/mobiledoc-error', ['exports'], function (exports) {
  'use strict';

  var errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];

  function MobiledocError() {
    var tmp = Error.apply(this, arguments);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
    // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
    for (var idx = 0; idx < errorProps.length; idx++) {
      this[errorProps[idx]] = tmp[errorProps[idx]];
    }
  }

  MobiledocError.prototype = Object.create(Error.prototype);

  exports['default'] = MobiledocError;
});
define("mobiledoc-kit/utils/object-utils", ["exports"], function (exports) {
  "use strict";

  exports.entries = entries;

  function entries(obj) {
    var ownProps = Object.keys(obj);
    var i = ownProps.length;
    var resArray = new Array(i);

    while (i--) {
      resArray[i] = [ownProps[i], obj[ownProps[i]]];
    }

    return resArray;
  }
});
define('mobiledoc-kit/utils/parse-utils', ['exports', 'mobiledoc-kit/parsers/mobiledoc', 'mobiledoc-kit/parsers/html', 'mobiledoc-kit/parsers/text'], function (exports, _mobiledocKitParsersMobiledoc, _mobiledocKitParsersHtml, _mobiledocKitParsersText) {
  /* global JSON */
  'use strict';

  exports.getContentFromPasteEvent = getContentFromPasteEvent;
  exports.setClipboardData = setClipboardData;
  exports.parsePostFromPaste = parsePostFromPaste;
  exports.parsePostFromDrop = parsePostFromDrop;
  var MIME_TEXT_PLAIN = 'text/plain';
  exports.MIME_TEXT_PLAIN = MIME_TEXT_PLAIN;
  var MIME_TEXT_HTML = 'text/html';
  exports.MIME_TEXT_HTML = MIME_TEXT_HTML;
  var NONSTANDARD_IE_TEXT_TYPE = 'Text';

  exports.NONSTANDARD_IE_TEXT_TYPE = NONSTANDARD_IE_TEXT_TYPE;
  var MOBILEDOC_REGEX = new RegExp(/data\-mobiledoc='(.*?)'>/);

  /**
   * @return {Post}
   * @private
   */
  function parsePostFromHTML(html, builder, plugins) {
    var post = undefined;

    if (MOBILEDOC_REGEX.test(html)) {
      var mobiledocString = html.match(MOBILEDOC_REGEX)[1];
      var mobiledoc = JSON.parse(mobiledocString);
      post = _mobiledocKitParsersMobiledoc['default'].parse(builder, mobiledoc);
    } else {
      post = new _mobiledocKitParsersHtml['default'](builder, { plugins: plugins }).parse(html);
    }

    return post;
  }

  /**
   * @return {Post}
   * @private
   */
  function parsePostFromText(text, builder, plugins) {
    var parser = new _mobiledocKitParsersText['default'](builder, { plugins: plugins });
    var post = parser.parse(text);
    return post;
  }

  /**
   * @return {{html: String, text: String}}
   * @private
   */

  function getContentFromPasteEvent(event, window) {
    var html = '',
        text = '';

    var clipboardData = event.clipboardData;

    if (clipboardData && clipboardData.getData) {
      html = clipboardData.getData(MIME_TEXT_HTML);
      text = clipboardData.getData(MIME_TEXT_PLAIN);
    } else if (window.clipboardData && window.clipboardData.getData) {
      // IE
      // The Internet Explorers (including Edge) have a non-standard way of interacting with the
      // Clipboard API (see http://caniuse.com/#feat=clipboard). In short, they expose a global window.clipboardData
      // object instead of the per-event event.clipboardData object on the other browsers.
      html = window.clipboardData.getData(NONSTANDARD_IE_TEXT_TYPE);
    }

    return { html: html, text: text };
  }

  /**
   * @return {{html: String, text: String}}
   * @private
   */
  function getContentFromDropEvent(event, logger) {
    var html = '',
        text = '';

    try {
      html = event.dataTransfer.getData(MIME_TEXT_HTML);
      text = event.dataTransfer.getData(MIME_TEXT_PLAIN);
    } catch (e) {
      // FIXME IE11 does not include any data in the 'text/html' or 'text/plain'
      // mimetypes. It throws an error 'Invalid argument' when attempting to read
      // these properties.
      if (logger) {
        logger.log('Error getting drop data: ', e);
      }
    }

    return { html: html, text: text };
  }

  /**
   * @param {CopyEvent|CutEvent}
   * @param {Editor}
   * @param {Window}
   * @private
   */

  function setClipboardData(event, _ref, window) {
    var mobiledoc = _ref.mobiledoc;
    var html = _ref.html;
    var text = _ref.text;

    if (mobiledoc && html) {
      html = '<div data-mobiledoc=\'' + JSON.stringify(mobiledoc) + '\'>' + html + '</div>';
    }

    var clipboardData = event.clipboardData;
    var nonstandardClipboardData = window.clipboardData;

    if (clipboardData && clipboardData.setData) {
      clipboardData.setData(MIME_TEXT_HTML, html);
      clipboardData.setData(MIME_TEXT_PLAIN, text);
    } else if (nonstandardClipboardData && nonstandardClipboardData.setData) {
      // The Internet Explorers (including Edge) have a non-standard way of interacting with the
      // Clipboard API (see http://caniuse.com/#feat=clipboard). In short, they expose a global window.clipboardData
      // object instead of the per-event event.clipboardData object on the other browsers.
      nonstandardClipboardData.setData(NONSTANDARD_IE_TEXT_TYPE, html);
    }
  }

  /**
   * @param {PasteEvent}
   * @param {{builder: Builder, _parserPlugins: Array}} options
   * @return {Post}
   * @private
   */

  function parsePostFromPaste(pasteEvent, _ref2) {
    var builder = _ref2.builder;
    var plugins = _ref2._parserPlugins;

    var _ref3 = arguments.length <= 2 || arguments[2] === undefined ? { targetFormat: 'html' } : arguments[2];

    var targetFormat = _ref3.targetFormat;

    var _getContentFromPasteEvent = getContentFromPasteEvent(pasteEvent, window);

    var html = _getContentFromPasteEvent.html;
    var text = _getContentFromPasteEvent.text;

    if (targetFormat === 'html' && html && html.length) {
      return parsePostFromHTML(html, builder, plugins);
    } else if (text && text.length) {
      return parsePostFromText(text, builder, plugins);
    }
  }

  /**
   * @param {DropEvent}
   * @param {Editor} editor
   * @param {Object} [options={}] Can pass a logger
   * @return {Post}
   * @private
   */

  function parsePostFromDrop(dropEvent, editor) {
    var _ref4 = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    var logger = _ref4.logger;
    var builder = editor.builder;
    var plugins = editor._parserPlugins;

    var _getContentFromDropEvent = getContentFromDropEvent(dropEvent, logger);

    var html = _getContentFromDropEvent.html;
    var text = _getContentFromDropEvent.text;

    if (html && html.length) {
      return parsePostFromHTML(html, builder, plugins);
    } else if (text && text.length) {
      return parsePostFromText(text, builder, plugins);
    }
  }
});
define("mobiledoc-kit/utils/placeholder-image-src", ["exports"], function (exports) {
  "use strict";

  var placeholderImageSrc = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAMFBMVEXp7vG6vsHm6+63u77Hy868wMPe4+bO09bh5unr8fTR1djAxMfM0NPX3N/c4eTBxcjXRf5TAAACh0lEQVR4nO3b6ZKqMBSFUSQMYZL3f9tbBq/NEEDiqUqOfusn1ZXKbjcQlGQZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACC6RkbsGHuabChEtHmiGYfS3EQYM+Sxw/gMQvmcNnYaj6oTDHi73WPn2eqnj9B8zo3TJXcq5uNjXmVff86VwSR3JtryMa1BYqi7S1hJDCVpSigyLcGhJJEwzlCSNtPKrbVhVwsdCfOhH7uuaG3ARV9DwsaOzxt3N1yPqCHhvXytTUz92VDpmE/LLhZwl++R6Sds6sUa/PL6K/2E2fIhw1xdRKefsFolrPc+xNx/N0k/4fpBsdhL2HfeiN+TsDCms8dDpeRyS3P3QDl6Iqaf8L0rTf+80m6Lmn7Ct+4Wxf+/2RY1/YRv3PHz/u+fsCmqgoTnq7Z+8SGviqoh4dnKu1ieqauiakh4/PQ0r6ivqDoSHj0B97eNRVG1JNxV+L4bnxdVecJtRTdFVZ7QU9F1UXUn9FZ0VVRlCav5ob2KLouqKmFjy676u2HsVnRRVFUJq3J+8KCi86IqSthMvyl209Hjijqm3RsqAZ5pNfa5PJ2KelJRjQmr1/r7cfy0ouoSNvOfvbvhvKLaEr4qOin9kTQnrN7LpDZhE/Zmhp6Eq4p+YcKgiipKGFhRRQkDK6ooYfgLbiSMioQkJGF8P5XwHv4O+7AaKiXzaeXh1kMl5AffTUxiKEm/krD94BR8Gdxl1fceSlR58ZhXKbEpyD2amNiBtmrJLTMHL1LF8/rpXkSZXEmz8K8uvAFFNm6Iq0aBLUFOmeCuJ6exrcCmoLpN7kYx891bSAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgh/wDdr8peyRHLogAAAAASUVORK5CYII=";

  exports["default"] = placeholderImageSrc;
});
define('mobiledoc-kit/utils/selection-utils', ['exports', 'mobiledoc-kit/utils/key', 'mobiledoc-kit/utils/dom-utils'], function (exports, _mobiledocKitUtilsKey, _mobiledocKitUtilsDomUtils) {
  'use strict';

  function clearSelection() {
    window.getSelection().removeAllRanges();
  }

  function textNodeRects(node) {
    var range = document.createRange();
    range.setEnd(node, node.nodeValue.length);
    range.setStart(node, 0);
    return range.getClientRects();
  }

  function findOffsetInTextNode(node, coords) {
    var len = node.nodeValue.length;
    var range = document.createRange();
    for (var i = 0; i < len; i++) {
      range.setEnd(node, i + 1);
      range.setStart(node, i);
      var rect = range.getBoundingClientRect();
      if (rect.top === rect.bottom) {
        continue;
      }
      if (rect.left <= coords.left && rect.right >= coords.left && rect.top <= coords.top && rect.bottom >= coords.top) {
        return { node: node, offset: i + (coords.left >= (rect.left + rect.right) / 2 ? 1 : 0) };
      }
    }
    return { node: node, offset: 0 };
  }

  /*
   * @param {Object} coords with `top` and `left`
   * @see https://github.com/ProseMirror/prosemirror/blob/4c22e3fe97d87a355a0534e25d65aaf0c0d83e57/src/edit/dompos.js
   * @return {Object} {node, offset}
   */
  /* eslint-disable complexity */
  function findOffsetInNode(_x, _x2) {
    var _again = true;

    _function: while (_again) {
      var node = _x,
          coords = _x2;
      _again = false;

      var closest = undefined,
          dyClosest = 1e8,
          coordsClosest = undefined,
          offset = 0;
      for (var child = node.firstChild; child; child = child.nextSibling) {
        var rects = undefined;
        if ((0, _mobiledocKitUtilsDomUtils.isElementNode)(child)) {
          rects = child.getClientRects();
        } else if ((0, _mobiledocKitUtilsDomUtils.isTextNode)(child)) {
          rects = textNodeRects(child);
        } else {
          continue;
        }

        for (var i = 0; i < rects.length; i++) {
          var rect = rects[i];
          if (rect.left <= coords.left && rect.right >= coords.left) {
            var dy = rect.top > coords.top ? rect.top - coords.top : rect.bottom < coords.top ? coords.top - rect.bottom : 0;
            if (dy < dyClosest) {
              closest = child;
              dyClosest = dy;
              coordsClosest = dy ? { left: coords.left, top: rect.top } : coords;
              if ((0, _mobiledocKitUtilsDomUtils.isElementNode)(child) && !child.firstChild) {
                offset = i + (coords.left >= (rect.left + rect.right) / 2 ? 1 : 0);
              }
              continue;
            }
          }
          if (!closest && (coords.top >= rect.bottom || coords.top >= rect.top && coords.left >= rect.right)) {
            offset = i + 1;
          }
        }
      }
      if (!closest) {
        return { node: node, offset: offset };
      }
      if ((0, _mobiledocKitUtilsDomUtils.isTextNode)(closest)) {
        return findOffsetInTextNode(closest, coordsClosest);
      }
      if (closest.firstChild) {
        _x = closest;
        _x2 = coordsClosest;
        _again = true;
        closest = dyClosest = coordsClosest = offset = child = rects = i = rect = dy = undefined;
        continue _function;
      }
      return { node: node, offset: offset };
    }
  }
  /* eslint-enable complexity */

  function constrainNodeTo(node, parentNode, existingOffset) {
    var compare = parentNode.compareDocumentPosition(node);
    if (compare & Node.DOCUMENT_POSITION_CONTAINED_BY) {
      // the node is inside parentNode, do nothing
      return { node: node, offset: existingOffset };
    } else if (compare & Node.DOCUMENT_POSITION_CONTAINS) {
      // the node contains parentNode. This shouldn't happen.
      return { node: node, offset: existingOffset };
    } else if (compare & Node.DOCUMENT_POSITION_PRECEDING) {
      // node is before parentNode. return start of deepest first child
      var child = parentNode.firstChild;
      while (child.firstChild) {
        child = child.firstChild;
      }
      return { node: child, offset: 0 };
    } else if (compare & Node.DOCUMENT_POSITION_FOLLOWING) {
      // node is after parentNode. return end of deepest last child
      var child = parentNode.lastChild;
      while (child.lastChild) {
        child = child.lastChild;
      }

      var offset = (0, _mobiledocKitUtilsDomUtils.isTextNode)(child) ? child.textContent.length : 1;
      return { node: child, offset: offset };
    } else {
      return { node: node, offset: existingOffset };
    }
  }

  /*
   * Returns a new selection that is constrained within parentNode.
   * If the anchorNode or focusNode are outside the parentNode, they are replaced with the beginning
   * or end of the parentNode's children
   */
  function constrainSelectionTo(selection, parentNode) {
    var _constrainNodeTo = constrainNodeTo(selection.anchorNode, parentNode, selection.anchorOffset);

    var anchorNode = _constrainNodeTo.node;
    var anchorOffset = _constrainNodeTo.offset;

    var _constrainNodeTo2 = constrainNodeTo(selection.focusNode, parentNode, selection.focusOffset);

    var focusNode = _constrainNodeTo2.node;
    var focusOffset = _constrainNodeTo2.offset;

    return { anchorNode: anchorNode, anchorOffset: anchorOffset, focusNode: focusNode, focusOffset: focusOffset };
  }

  function comparePosition(_x3) {
    var _again2 = true;

    _function2: while (_again2) {
      var selection = _x3;
      _again2 = false;
      var anchorNode = selection.anchorNode;
      var focusNode = selection.focusNode;
      var anchorOffset = selection.anchorOffset;
      var focusOffset = selection.focusOffset;

      var headNode = undefined,
          tailNode = undefined,
          headOffset = undefined,
          tailOffset = undefined,
          direction = undefined;

      var position = anchorNode.compareDocumentPosition(focusNode);

      // IE may select return focus and anchor nodes far up the DOM tree instead of
      // picking the deepest, most specific possible node. For example in
      //
      //     <div><span>abc</span><span>def</span></div>
      //
      // with a cursor between c and d, IE might say the focusNode is <div> with
      // an offset of 1. However the anchorNode for a selection might still be
      // <span> 2 if there was a selection.
      //
      // This code walks down the DOM tree until a good comparison of position can be
      // made.
      //
      if (position & Node.DOCUMENT_POSITION_CONTAINS) {
        if (focusOffset < focusNode.childNodes.length) {
          focusNode = focusNode.childNodes[focusOffset];
          focusOffset = 0;
        } else {
          // This situation happens on IE when triple-clicking to select.
          // Set the focus to the very last character inside the node.
          while (focusNode.lastChild) {
            focusNode = focusNode.lastChild;
          }
          focusOffset = focusNode.textContent.length;
        }

        _x3 = {
          focusNode: focusNode,
          focusOffset: focusOffset,
          anchorNode: anchorNode, anchorOffset: anchorOffset
        };
        _again2 = true;
        anchorNode = focusNode = anchorOffset = focusOffset = headNode = tailNode = headOffset = tailOffset = direction = position = undefined;
        continue _function2;
      } else if (position & Node.DOCUMENT_POSITION_CONTAINED_BY) {
        var offset = anchorOffset - 1;
        if (offset < 0) {
          offset = 0;
        }
        _x3 = {
          anchorNode: anchorNode.childNodes[offset],
          anchorOffset: 0,
          focusNode: focusNode, focusOffset: focusOffset
        };
        _again2 = true;
        anchorNode = focusNode = anchorOffset = focusOffset = headNode = tailNode = headOffset = tailOffset = direction = position = offset = undefined;
        continue _function2;

        // The meat of translating anchor and focus nodes to head and tail nodes
      } else if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
          headNode = anchorNode;tailNode = focusNode;
          headOffset = anchorOffset;tailOffset = focusOffset;
          direction = _mobiledocKitUtilsKey.DIRECTION.FORWARD;
        } else if (position & Node.DOCUMENT_POSITION_PRECEDING) {
          headNode = focusNode;tailNode = anchorNode;
          headOffset = focusOffset;tailOffset = anchorOffset;
          direction = _mobiledocKitUtilsKey.DIRECTION.BACKWARD;
        } else {
          // same node
          headNode = tailNode = anchorNode;
          headOffset = anchorOffset;
          tailOffset = focusOffset;
          if (tailOffset < headOffset) {
            // Swap the offset order
            headOffset = focusOffset;
            tailOffset = anchorOffset;
            direction = _mobiledocKitUtilsKey.DIRECTION.BACKWARD;
          } else if (headOffset < tailOffset) {
            direction = _mobiledocKitUtilsKey.DIRECTION.FORWARD;
          } else {
            direction = null;
          }
        }

      return { headNode: headNode, headOffset: headOffset, tailNode: tailNode, tailOffset: tailOffset, direction: direction };
    }
  }

  exports.clearSelection = clearSelection;
  exports.comparePosition = comparePosition;
  exports.findOffsetInNode = findOffsetInNode;
  exports.constrainSelectionTo = constrainSelectionTo;
});
define("mobiledoc-kit/utils/set", ["exports"], function (exports) {
  "use strict";

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var Set = (function () {
    function Set() {
      var _this = this;

      var items = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

      _classCallCheck(this, Set);

      this.items = [];
      items.forEach(function (i) {
        return _this.add(i);
      });
    }

    _createClass(Set, [{
      key: "add",
      value: function add(item) {
        if (!this.has(item)) {
          this.items.push(item);
        }
      }
    }, {
      key: "has",
      value: function has(item) {
        return this.items.indexOf(item) !== -1;
      }
    }, {
      key: "toArray",
      value: function toArray() {
        return this.items;
      }
    }, {
      key: "length",
      get: function get() {
        return this.items.length;
      }
    }]);

    return Set;
  })();

  exports["default"] = Set;
});
define('mobiledoc-kit/utils/string-utils', ['exports'], function (exports) {
  /*
   * @param {String} string
   * @return {String} a dasherized string. 'modelIndex' -> 'model-index', etc
   */
  'use strict';

  exports.dasherize = dasherize;
  exports.capitalize = capitalize;
  exports.startsWith = startsWith;
  exports.endsWith = endsWith;

  function dasherize(string) {
    return string.replace(/[A-Z]/g, function (match, offset) {
      var lower = match.toLowerCase();

      return offset === 0 ? lower : '-' + lower;
    });
  }

  function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  function startsWith(string, character) {
    return string.charAt(0) === character;
  }

  function endsWith(string, endString) {
    var index = string.lastIndexOf(endString);
    return index !== -1 && index === string.length - endString.length;
  }
});
define('mobiledoc-kit/utils/to-range', ['exports', 'mobiledoc-kit/utils/cursor/range', 'mobiledoc-kit/utils/cursor/position', 'mobiledoc-kit/utils/assert'], function (exports, _mobiledocKitUtilsCursorRange, _mobiledocKitUtilsCursorPosition, _mobiledocKitUtilsAssert) {
  'use strict';

  exports['default'] = toRange;

  function toRange(rangeLike) {
    (0, _mobiledocKitUtilsAssert['default'])('Must pass non-blank object to "toRange"', !!rangeLike);

    if (rangeLike instanceof _mobiledocKitUtilsCursorRange['default']) {
      return rangeLike;
    } else if (rangeLike instanceof _mobiledocKitUtilsCursorPosition['default']) {
      return rangeLike.toRange();
    }

    (0, _mobiledocKitUtilsAssert['default'])('Incorrect structure for rangeLike: ' + rangeLike, false);
  }
});
define('mobiledoc-kit/version', ['exports'], function (exports) {
  'use strict';

  exports['default'] = '0.12.2';
});
define('mobiledoc-kit/views/tooltip', ['exports', 'mobiledoc-kit/views/view', 'mobiledoc-kit/utils/element-utils'], function (exports, _mobiledocKitViewsView, _mobiledocKitUtilsElementUtils) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var DELAY = 200;

  var Tooltip = (function (_View) {
    _inherits(Tooltip, _View);

    function Tooltip(options) {
      var _this = this;

      _classCallCheck(this, Tooltip);

      var rootElement = options.rootElement;

      var timeout = undefined;
      options.classNames = ['__mobiledoc-tooltip'];
      _get(Object.getPrototypeOf(Tooltip.prototype), 'constructor', this).call(this, options);

      this.addEventListener(rootElement, 'mouseover', function (e) {
        var target = (0, _mobiledocKitUtilsElementUtils.getEventTargetMatchingTag)(options.showForTag, e.target, rootElement);
        if (target && target.isContentEditable) {
          timeout = setTimeout(function () {
            _this.showLink(target.href, target);
          }, DELAY);
        }
      });

      this.addEventListener(rootElement, 'mouseout', function (e) {
        clearTimeout(timeout);
        if (_this.elementObserver) {
          _this.elementObserver.cancel();
        }
        var toElement = e.toElement || e.relatedTarget;
        if (toElement && toElement.className !== _this.element.className) {
          _this.hide();
        }
      });
    }

    _createClass(Tooltip, [{
      key: 'showMessage',
      value: function showMessage(message, element) {
        var tooltipElement = this.element;
        tooltipElement.innerHTML = message;
        this.show();
        (0, _mobiledocKitUtilsElementUtils.positionElementCenteredBelow)(tooltipElement, element);
      }
    }, {
      key: 'showLink',
      value: function showLink(link, element) {
        var _this2 = this;

        var message = '<a href="' + link + '" target="_blank">' + link + '</a>';
        this.showMessage(message, element);
        this.elementObserver = (0, _mobiledocKitUtilsElementUtils.whenElementIsNotInDOM)(element, function () {
          return _this2.hide();
        });
      }
    }]);

    return Tooltip;
  })(_mobiledocKitViewsView['default']);

  exports['default'] = Tooltip;
});
define('mobiledoc-kit/views/view', ['exports', 'mobiledoc-kit/utils/dom-utils'], function (exports, _mobiledocKitUtilsDomUtils) {
  'use strict';

  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var View = (function () {
    function View() {
      var _this = this;

      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      _classCallCheck(this, View);

      options.tagName = options.tagName || 'div';
      options.container = options.container || document.body;

      this.element = document.createElement(options.tagName);
      this.container = options.container;
      this.isShowing = false;

      var classNames = options.classNames || [];
      classNames.forEach(function (name) {
        return (0, _mobiledocKitUtilsDomUtils.addClassName)(_this.element, name);
      });
      this._eventListeners = [];
    }

    _createClass(View, [{
      key: 'addEventListener',
      value: function addEventListener(element, type, listener) {
        element.addEventListener(type, listener);
        this._eventListeners.push([element, type, listener]);
      }
    }, {
      key: 'removeAllEventListeners',
      value: function removeAllEventListeners() {
        this._eventListeners.forEach(function (_ref) {
          var _ref2 = _slicedToArray(_ref, 3);

          var element = _ref2[0];
          var type = _ref2[1];
          var listener = _ref2[2];

          element.removeEventListener(type, listener);
        });
      }
    }, {
      key: 'show',
      value: function show() {
        if (!this.isShowing) {
          this.container.appendChild(this.element);
          this.isShowing = true;
          return true;
        }
      }
    }, {
      key: 'hide',
      value: function hide() {
        if (this.isShowing) {
          this.container.removeChild(this.element);
          this.isShowing = false;
          return true;
        }
      }
    }, {
      key: 'destroy',
      value: function destroy() {
        this.removeAllEventListeners();
        this.hide();
        this.isDestroyed = true;
      }
    }]);

    return View;
  })();

  exports['default'] = View;
});
define('mobiledoc-text-renderer/cards/image', ['exports'], function (exports) {
  'use strict';

  exports['default'] = {
    name: 'image-card',
    type: 'text',
    render: function render() {}
  };
});
define('mobiledoc-text-renderer', ['exports', 'mobiledoc-text-renderer/renderer-factory', 'mobiledoc-text-renderer/utils/render-type'], function (exports, _mobiledocTextRendererRendererFactory, _mobiledocTextRendererUtilsRenderType) {
  'use strict';

  exports.registerGlobal = registerGlobal;

  function registerGlobal(window) {
    window.MobiledocTextRenderer = _mobiledocTextRendererRendererFactory['default'];
  }

  exports.RENDER_TYPE = _mobiledocTextRendererUtilsRenderType['default'];
  exports['default'] = _mobiledocTextRendererRendererFactory['default'];
});
define('mobiledoc-text-renderer/renderer-factory', ['exports', 'mobiledoc-text-renderer/renderers/0-2', 'mobiledoc-text-renderer/renderers/0-3', 'mobiledoc-text-renderer/utils/render-type'], function (exports, _mobiledocTextRendererRenderers02, _mobiledocTextRendererRenderers03, _mobiledocTextRendererUtilsRenderType) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  /**
   * runtime Text renderer
   * renders a mobiledoc to Text
   *
   * input: mobiledoc
   * output: Text (string)
   */

  function validateCards(cards) {
    if (!Array.isArray(cards)) {
      throw new Error('`cards` must be passed as an array');
    }
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      if (card.type !== _mobiledocTextRendererUtilsRenderType['default']) {
        throw new Error('Card "' + card.name + '" must be type "' + _mobiledocTextRendererUtilsRenderType['default'] + '", was "' + card.type + '"');
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
      if (atom.type !== _mobiledocTextRendererUtilsRenderType['default']) {
        throw new Error('Atom "' + atom.name + '" must be type "' + _mobiledocTextRendererUtilsRenderType['default'] + '", was "' + atom.type + '"');
      }
      if (!atom.render) {
        throw new Error('Atom "' + atom.name + '" must define `render`');
      }
    }
  }

  var RendererFactory = (function () {
    function RendererFactory() {
      var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var cards = _ref.cards;
      var atoms = _ref.atoms;
      var cardOptions = _ref.cardOptions;
      var unknownCardHandler = _ref.unknownCardHandler;
      var unknownAtomHandler = _ref.unknownAtomHandler;

      _classCallCheck(this, RendererFactory);

      cards = cards || [];
      validateCards(cards);
      atoms = atoms || [];
      validateAtoms(atoms);
      cardOptions = cardOptions || {};

      this.state = { cards: cards, atoms: atoms, cardOptions: cardOptions, unknownCardHandler: unknownCardHandler, unknownAtomHandler: unknownAtomHandler };
    }

    _createClass(RendererFactory, [{
      key: 'render',
      value: function render(mobiledoc) {
        var version = mobiledoc.version;

        switch (version) {
          case _mobiledocTextRendererRenderers02.MOBILEDOC_VERSION:
            return new _mobiledocTextRendererRenderers02['default'](mobiledoc, this.state).render();
          case undefined:
          case null:
          case _mobiledocTextRendererRenderers03.MOBILEDOC_VERSION_0_3:
          case _mobiledocTextRendererRenderers03.MOBILEDOC_VERSION_0_3_1:
          case _mobiledocTextRendererRenderers03.MOBILEDOC_VERSION_0_3_2:
            return new _mobiledocTextRendererRenderers03['default'](mobiledoc, this.state).render();
          default:
            throw new Error('Unexpected Mobiledoc version "' + version + '"');
        }
      }
    }]);

    return RendererFactory;
  })();

  exports['default'] = RendererFactory;
});
define('mobiledoc-text-renderer/renderers/0-2', ['exports', 'mobiledoc-text-renderer/cards/image', 'mobiledoc-text-renderer/utils/render-type', 'mobiledoc-text-renderer/utils/section-types'], function (exports, _mobiledocTextRendererCardsImage, _mobiledocTextRendererUtilsRenderType, _mobiledocTextRendererUtilsSectionTypes) {
  /**
   * runtime Text renderer
   * renders a mobiledoc to Text
   *
   * input: mobiledoc
   * output: Text (string)
   */
  'use strict';

  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var LINE_BREAK = '\n';

  var MOBILEDOC_VERSION = '0.2.0';

  exports.MOBILEDOC_VERSION = MOBILEDOC_VERSION;
  function validateVersion(version) {
    if (version !== MOBILEDOC_VERSION) {
      throw new Error('Unexpected Mobiledoc version "' + version + '"');
    }
  }

  var Renderer = (function () {
    function Renderer(mobiledoc, state) {
      _classCallCheck(this, Renderer);

      var cards = state.cards;
      var cardOptions = state.cardOptions;
      var atoms = state.atoms;
      var unknownCardHandler = state.unknownCardHandler;
      var version = mobiledoc.version;
      var sectionData = mobiledoc.sections;

      validateVersion(version);

      var _sectionData = _slicedToArray(sectionData, 2);

      var sections = _sectionData[1];

      this.root = [];
      this.sections = sections;
      this.cards = cards;
      this.atoms = atoms;
      this.cardOptions = cardOptions;
      this.unknownCardHandler = unknownCardHandler || this._defaultUnknownCardHandler;

      this._teardownCallbacks = [];
    }

    _createClass(Renderer, [{
      key: 'render',
      value: function render() {
        var _this = this;

        this.sections.forEach(function (section) {
          _this.root.push(_this.renderSection(section));
        });

        var result = this.root.join(LINE_BREAK);
        return { result: result, teardown: function teardown() {
            return _this.teardown();
          } };
      }
    }, {
      key: 'teardown',
      value: function teardown() {
        for (var i = 0; i < this._teardownCallbacks.length; i++) {
          this._teardownCallbacks[i]();
        }
      }
    }, {
      key: 'renderSection',

      // for the text renderer, a missing card is a no-op
      value: function renderSection(section) {
        var _section = _slicedToArray(section, 1);

        var type = _section[0];

        switch (type) {
          case _mobiledocTextRendererUtilsSectionTypes.MARKUP_SECTION_TYPE:
            return this.renderMarkupSection(section);
          case _mobiledocTextRendererUtilsSectionTypes.IMAGE_SECTION_TYPE:
            return this.renderImageSection(section);
          case _mobiledocTextRendererUtilsSectionTypes.LIST_SECTION_TYPE:
            return this.renderListSection(section);
          case _mobiledocTextRendererUtilsSectionTypes.CARD_SECTION_TYPE:
            return this.renderCardSection(section);
          default:
            throw new Error('Unimplemented renderer for type ' + type);
        }
      }
    }, {
      key: 'renderImageSection',
      value: function renderImageSection() {
        return '';
      }
    }, {
      key: 'renderListSection',
      value: function renderListSection(_ref) {
        var _this2 = this;

        var _ref2 = _slicedToArray(_ref, 3);

        var type = _ref2[0];
        var tagName = _ref2[1];
        var items = _ref2[2];

        return items.map(function (li) {
          return _this2.renderListItem(li);
        }).join(LINE_BREAK);
      }
    }, {
      key: 'renderListItem',
      value: function renderListItem(markers) {
        return this.renderMarkers(markers);
      }
    }, {
      key: 'findCard',
      value: function findCard(name) {
        for (var i = 0; i < this.cards.length; i++) {
          if (this.cards[i].name === name) {
            return this.cards[i];
          }
        }
        if (name === _mobiledocTextRendererCardsImage['default'].name) {
          return _mobiledocTextRendererCardsImage['default'];
        }
        return this._createUnknownCard(name);
      }
    }, {
      key: '_createUnknownCard',
      value: function _createUnknownCard(name) {
        return {
          name: name,
          type: _mobiledocTextRendererUtilsRenderType['default'],
          render: this.unknownCardHandler
        };
      }
    }, {
      key: 'renderCardSection',
      value: function renderCardSection(_ref3) {
        var _ref32 = _slicedToArray(_ref3, 3);

        var type = _ref32[0];
        var name = _ref32[1];
        var payload = _ref32[2];

        var card = this.findCard(name);

        var cardArg = this._createCardArgument(card, payload);
        var rendered = card.render(cardArg);

        this._validateCardRender(rendered, card.name);

        return rendered || '';
      }
    }, {
      key: '_validateCardRender',
      value: function _validateCardRender(rendered, cardName) {
        if (!rendered) {
          return;
        }

        if (typeof rendered !== 'string') {
          throw new Error('Card "' + cardName + '" must render ' + _mobiledocTextRendererUtilsRenderType['default'] + ', but result was ' + typeof rendered + '"');
        }
      }
    }, {
      key: '_registerTeardownCallback',
      value: function _registerTeardownCallback(callback) {
        this._teardownCallbacks.push(callback);
      }
    }, {
      key: '_createCardArgument',
      value: function _createCardArgument(card) {
        var _this3 = this;

        var payload = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        var env = {
          name: card.name,
          isInEditor: false,
          onTeardown: function onTeardown(callback) {
            return _this3._registerTeardownCallback(callback);
          }
        };

        var options = this.cardOptions;

        return { env: env, options: options, payload: payload };
      }
    }, {
      key: 'renderMarkupSection',
      value: function renderMarkupSection(_ref4) {
        var _ref42 = _slicedToArray(_ref4, 3);

        var type = _ref42[0];
        var tagName = _ref42[1];
        var markers = _ref42[2];

        return this.renderMarkers(markers);
      }
    }, {
      key: 'renderMarkers',
      value: function renderMarkers(markers) {
        var str = '';
        markers.forEach(function (m) {
          var _m = _slicedToArray(m, 3);

          var text = _m[2];

          str += text;
        });
        return str;
      }
    }, {
      key: '_defaultUnknownCardHandler',
      get: function get() {
        return function () {};
      }
    }]);

    return Renderer;
  })();

  exports['default'] = Renderer;
});
define('mobiledoc-text-renderer/renderers/0-3', ['exports', 'mobiledoc-text-renderer/cards/image', 'mobiledoc-text-renderer/utils/render-type', 'mobiledoc-text-renderer/utils/section-types', 'mobiledoc-text-renderer/utils/marker-types'], function (exports, _mobiledocTextRendererCardsImage, _mobiledocTextRendererUtilsRenderType, _mobiledocTextRendererUtilsSectionTypes, _mobiledocTextRendererUtilsMarkerTypes) {
  /**
   * runtime Text renderer
   * renders a mobiledoc to Text
   *
   * input: mobiledoc
   * output: Text (string)
   */
  'use strict';

  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var LINE_BREAK = '\n';

  var MOBILEDOC_VERSION_0_3 = '0.3.0';
  exports.MOBILEDOC_VERSION_0_3 = MOBILEDOC_VERSION_0_3;
  var MOBILEDOC_VERSION_0_3_1 = '0.3.1';
  exports.MOBILEDOC_VERSION_0_3_1 = MOBILEDOC_VERSION_0_3_1;
  var MOBILEDOC_VERSION_0_3_2 = '0.3.2';

  exports.MOBILEDOC_VERSION_0_3_2 = MOBILEDOC_VERSION_0_3_2;
  function validateVersion(version) {
    if (version !== MOBILEDOC_VERSION_0_3 && version !== MOBILEDOC_VERSION_0_3_1 && version !== MOBILEDOC_VERSION_0_3_2) {
      throw new Error('Unexpected Mobiledoc version "' + version + '"');
    }
  }

  var Renderer = (function () {
    function Renderer(mobiledoc, state) {
      _classCallCheck(this, Renderer);

      var cards = state.cards;
      var cardOptions = state.cardOptions;
      var atoms = state.atoms;
      var unknownCardHandler = state.unknownCardHandler;
      var unknownAtomHandler = state.unknownAtomHandler;
      var version = mobiledoc.version;
      var sections = mobiledoc.sections;
      var atomTypes = mobiledoc.atoms;
      var cardTypes = mobiledoc.cards;

      validateVersion(version);

      this.root = [];
      this.sections = sections;
      this.atomTypes = atomTypes;
      this.cardTypes = cardTypes;
      this.cards = cards;
      this.atoms = atoms;
      this.cardOptions = cardOptions;
      this.unknownCardHandler = unknownCardHandler || this._defaultUnknownCardHandler;
      this.unknownAtomHandler = unknownAtomHandler || this._defaultUnknownAtomHandler;

      this._teardownCallbacks = [];
    }

    _createClass(Renderer, [{
      key: 'render',
      value: function render() {
        var _this = this;

        this.sections.forEach(function (section) {
          _this.root.push(_this.renderSection(section));
        });

        var result = this.root.join(LINE_BREAK);
        return { result: result, teardown: function teardown() {
            return _this.teardown();
          } };
      }
    }, {
      key: 'teardown',
      value: function teardown() {
        for (var i = 0; i < this._teardownCallbacks.length; i++) {
          this._teardownCallbacks[i]();
        }
      }
    }, {
      key: 'renderSection',
      value: function renderSection(section) {
        var _section = _slicedToArray(section, 1);

        var type = _section[0];

        switch (type) {
          case _mobiledocTextRendererUtilsSectionTypes.MARKUP_SECTION_TYPE:
            return this.renderMarkupSection(section);
          case _mobiledocTextRendererUtilsSectionTypes.IMAGE_SECTION_TYPE:
            return this.renderImageSection(section);
          case _mobiledocTextRendererUtilsSectionTypes.LIST_SECTION_TYPE:
            return this.renderListSection(section);
          case _mobiledocTextRendererUtilsSectionTypes.CARD_SECTION_TYPE:
            return this.renderCardSection(section);
          default:
            throw new Error('Unimplemented renderer for type ' + type);
        }
      }
    }, {
      key: 'renderImageSection',
      value: function renderImageSection() {
        return '';
      }
    }, {
      key: 'renderListSection',
      value: function renderListSection(_ref) {
        var _this2 = this;

        var _ref2 = _slicedToArray(_ref, 3);

        var type = _ref2[0];
        var tagName = _ref2[1];
        var items = _ref2[2];

        return items.map(function (li) {
          return _this2.renderListItem(li);
        }).join(LINE_BREAK);
      }
    }, {
      key: 'renderListItem',
      value: function renderListItem(markers) {
        return this.renderMarkers(markers);
      }
    }, {
      key: 'findCard',
      value: function findCard(name) {
        for (var i = 0; i < this.cards.length; i++) {
          if (this.cards[i].name === name) {
            return this.cards[i];
          }
        }
        if (name === _mobiledocTextRendererCardsImage['default'].name) {
          return _mobiledocTextRendererCardsImage['default'];
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
          type: _mobiledocTextRendererUtilsRenderType['default'],
          render: this.unknownCardHandler
        };
      }
    }, {
      key: 'renderCardSection',
      value: function renderCardSection(_ref3) {
        var _ref32 = _slicedToArray(_ref3, 2);

        var type = _ref32[0];
        var index = _ref32[1];

        var _findCardByIndex2 = this._findCardByIndex(index);

        var card = _findCardByIndex2.card;
        var payload = _findCardByIndex2.payload;

        var cardArg = this._createCardArgument(card, payload);
        var rendered = card.render(cardArg);

        this._validateCardRender(rendered, card.name);

        return rendered || '';
      }
    }, {
      key: '_validateCardRender',
      value: function _validateCardRender(rendered, cardName) {
        if (!rendered) {
          return;
        }

        if (typeof rendered !== 'string') {
          throw new Error('Card "' + cardName + '" must render ' + _mobiledocTextRendererUtilsRenderType['default'] + ', but result was ' + typeof rendered + '"');
        }
      }
    }, {
      key: '_registerTeardownCallback',
      value: function _registerTeardownCallback(callback) {
        this._teardownCallbacks.push(callback);
      }
    }, {
      key: '_createCardArgument',
      value: function _createCardArgument(card) {
        var _this3 = this;

        var payload = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        var env = {
          name: card.name,
          isInEditor: false,
          onTeardown: function onTeardown(callback) {
            return _this3._registerTeardownCallback(callback);
          }
        };

        var options = this.cardOptions;

        return { env: env, options: options, payload: payload };
      }
    }, {
      key: 'renderMarkupSection',
      value: function renderMarkupSection(_ref4) {
        var _ref42 = _slicedToArray(_ref4, 3);

        var type = _ref42[0];
        var tagName = _ref42[1];
        var markers = _ref42[2];

        return this.renderMarkers(markers);
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
          type: _mobiledocTextRendererUtilsRenderType['default'],
          render: this.unknownAtomHandler
        };
      }
    }, {
      key: '_createAtomArgument',
      value: function _createAtomArgument(atom, value, payload) {
        var _this4 = this;

        var env = {
          name: atom.name,
          onTeardown: function onTeardown(callback) {
            return _this4._registerTeardownCallback(callback);
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

        if (typeof rendered !== 'string') {
          throw new Error('Atom "' + atomName + '" must render ' + _mobiledocTextRendererUtilsRenderType['default'] + ', but result was ' + typeof rendered + '"');
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

        return rendered || '';
      }
    }, {
      key: 'renderMarkers',
      value: function renderMarkers(markers) {
        var _this5 = this;

        var str = '';
        markers.forEach(function (m) {
          var _m = _slicedToArray(m, 4);

          var type = _m[0];
          var value = _m[3];

          switch (type) {
            case _mobiledocTextRendererUtilsMarkerTypes.MARKUP_MARKER_TYPE:
              str += value;
              break;
            case _mobiledocTextRendererUtilsMarkerTypes.ATOM_MARKER_TYPE:
              str += _this5._renderAtom(value);
              break;
            default:
              throw new Error('Unknown markup type (' + type + ')');
          }
        });
        return str;
      }
    }, {
      key: '_defaultUnknownCardHandler',
      get: function get() {
        return function () {
          // for the text renderer, a missing card is a no-op
        };
      }
    }, {
      key: '_defaultUnknownAtomHandler',
      get: function get() {
        return function (_ref5) {
          var value = _ref5.value;

          return value || '';
        };
      }
    }]);

    return Renderer;
  })();

  exports['default'] = Renderer;
});
define("mobiledoc-text-renderer/utils/marker-types", ["exports"], function (exports) {
  "use strict";

  var MARKUP_MARKER_TYPE = 0;
  exports.MARKUP_MARKER_TYPE = MARKUP_MARKER_TYPE;
  var ATOM_MARKER_TYPE = 1;
  exports.ATOM_MARKER_TYPE = ATOM_MARKER_TYPE;
});
define('mobiledoc-text-renderer/utils/render-type', ['exports'], function (exports) {
  'use strict';

  exports['default'] = 'text';
});
define("mobiledoc-text-renderer/utils/section-types", ["exports"], function (exports) {
  "use strict";

  var MARKUP_SECTION_TYPE = 1;
  exports.MARKUP_SECTION_TYPE = MARKUP_SECTION_TYPE;
  var IMAGE_SECTION_TYPE = 2;
  exports.IMAGE_SECTION_TYPE = IMAGE_SECTION_TYPE;
  var LIST_SECTION_TYPE = 3;
  exports.LIST_SECTION_TYPE = LIST_SECTION_TYPE;
  var CARD_SECTION_TYPE = 10;
  exports.CARD_SECTION_TYPE = CARD_SECTION_TYPE;
});//# sourceMappingURL=mobiledoc-kit.map
