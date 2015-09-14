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

  var registry = {};
  var seen = {};
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
      } else if (part === '.') {
        continue;
      } else { parentBase.push(part); }
    }

    return parentBase.join('/');
  }

  requirejs.entries = requirejs._eak_seen = registry;
  requirejs.unsee = function(moduleName) {
    delete seen[moduleName];
  };

  requirejs.clear = function() {
    requirejs.entries = requirejs._eak_seen = registry = {};
    seen = state = {};
  };
})();

define('mobiledoc-dom-renderer/cards/image', ['exports', 'mobiledoc-dom-renderer/utils'], function (exports, _mobiledocDomRendererUtils) {
  'use strict';

  var ImageCard = {
    name: 'image',
    display: {
      setup: function setup(element, options, env, payload) {
        if (payload.src) {
          var img = (0, _mobiledocDomRendererUtils.createElement)('img');
          img.src = payload.src;
          element.appendChild(img);
        }
      }
    }
  };

  exports['default'] = ImageCard;
});
define("mobiledoc-dom-renderer/dom-renderer", ["exports", "mobiledoc-dom-renderer/utils", "mobiledoc-dom-renderer/cards/image"], function (exports, _mobiledocDomRendererUtils, _mobiledocDomRendererCardsImage) {
  "use strict";

  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  /**
   * runtime DOM renderer
   * renders a mobiledoc to DOM
   *
   * input: mobiledoc
   * output: DOM
   */

  function createElementFromMarkerType() {
    var _ref = arguments.length <= 0 || arguments[0] === undefined ? ['', []] : arguments[0];

    var _ref2 = _slicedToArray(_ref, 2);

    var tagName = _ref2[0];
    var attributes = _ref2[1];

    var element = (0, _mobiledocDomRendererUtils.createElement)(tagName);
    attributes = attributes || [];

    for (var i = 0, l = attributes.length; i < l; i = i + 2) {
      var propName = attributes[i],
          propValue = attributes[i + 1];
      element.setAttribute(propName, propValue);
    }
    return element;
  }

  function setDefaultCards(cards) {
    cards.image = cards.image || _mobiledocDomRendererCardsImage["default"];
  }

  var DOMRenderer = (function () {
    function DOMRenderer() {
      _classCallCheck(this, DOMRenderer);
    }

    _createClass(DOMRenderer, [{
      key: "render",

      /**
       * @param mobiledoc
       * @param rootElement optional, defaults to an empty div
       * @return DOMNode
       */
      value: function render(_ref3) {
        var _this = this;

        var rootElement = arguments.length <= 1 || arguments[1] === undefined ? (0, _mobiledocDomRendererUtils.createElement)('div') : arguments[1];
        var version = _ref3.version;
        var sectionData = _ref3.sections;
        var cards = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

        var _sectionData = _slicedToArray(sectionData, 2);

        var markerTypes = _sectionData[0];
        var sections = _sectionData[1];

        this.root = rootElement;
        this.markerTypes = markerTypes;
        this.cards = cards;
        setDefaultCards(this.cards);

        sections.forEach(function (section) {
          return _this.renderSection(section);
        });

        return this.root;
      }
    }, {
      key: "renderSection",
      value: function renderSection(section) {
        var _section = _slicedToArray(section, 1);

        var type = _section[0];

        var rendered = undefined;
        switch (type) {
          case 1:
            // markup section
            rendered = this.renderMarkupSection(section);
            (0, _mobiledocDomRendererUtils.appendChild)(this.root, rendered);
            break;
          case 2:
            rendered = this.renderImageSection(section);
            (0, _mobiledocDomRendererUtils.appendChild)(this.root, rendered);
            break;
          case 3:
            // list section
            rendered = this.renderListSection(section);
            (0, _mobiledocDomRendererUtils.appendChild)(this.root, rendered);
            break;
          case 10:
            // card section
            rendered = this.renderCardSection(section);
            (0, _mobiledocDomRendererUtils.appendChild)(this.root, rendered);
            break;
          default:
            throw new Error('Unimplement renderer for type ' + type);
        }
      }
    }, {
      key: "renderListSection",
      value: function renderListSection(_ref4) {
        var _this2 = this;

        var _ref42 = _slicedToArray(_ref4, 3);

        var type = _ref42[0];
        var tagName = _ref42[1];
        var listItems = _ref42[2];

        var element = (0, _mobiledocDomRendererUtils.createElement)(tagName);
        listItems.forEach(function (li) {
          element.appendChild(_this2.renderListItem(li));
        });
        return element;
      }
    }, {
      key: "renderListItem",
      value: function renderListItem(markers) {
        var element = (0, _mobiledocDomRendererUtils.createElement)('li');
        this._renderMarkersOnElement(element, markers);
        return element;
      }
    }, {
      key: "renderImageSection",
      value: function renderImageSection(_ref5) {
        var _ref52 = _slicedToArray(_ref5, 2);

        var type = _ref52[0];
        var src = _ref52[1];

        var element = (0, _mobiledocDomRendererUtils.createElement)('img');
        element.src = src;
        return element;
      }
    }, {
      key: "renderCardSection",
      value: function renderCardSection(_ref6) {
        var _ref62 = _slicedToArray(_ref6, 3);

        var type = _ref62[0];
        var name = _ref62[1];
        var payload = _ref62[2];

        var card = this.cards[name];
        if (!card) {
          throw new Error("Cannot render unknown card named " + name);
        }
        var element = (0, _mobiledocDomRendererUtils.createElement)('div');
        card.display.setup(element, {}, { name: name }, payload);
        return element;
      }
    }, {
      key: "renderMarkupSection",
      value: function renderMarkupSection(_ref7) {
        var _ref72 = _slicedToArray(_ref7, 3);

        var type = _ref72[0];
        var tagName = _ref72[1];
        var markers = _ref72[2];

        var element = (0, _mobiledocDomRendererUtils.createElement)(tagName);
        this._renderMarkersOnElement(element, markers);
        return element;
      }
    }, {
      key: "_renderMarkersOnElement",
      value: function _renderMarkersOnElement(element, markers) {
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
            (0, _mobiledocDomRendererUtils.appendChild)(currentElement, openedElement);
            elements.push(openedElement);
            currentElement = openedElement;
          }

          (0, _mobiledocDomRendererUtils.appendChild)(currentElement, (0, _mobiledocDomRendererUtils.createTextNode)(text));

          for (var j = 0, m = closeTypes; j < m; j++) {
            elements.pop();
            currentElement = elements[elements.length - 1];
          }
        }
      }
    }]);

    return DOMRenderer;
  })();

  exports["default"] = DOMRenderer;
});
define('mobiledoc-dom-renderer', ['exports', 'mobiledoc-dom-renderer/dom-renderer'], function (exports, _mobiledocDomRendererDomRenderer) {
  'use strict';

  exports.registerGlobal = registerGlobal;

  function registerGlobal(window) {
    window.MobiledocDOMRenderer = _mobiledocDomRendererDomRenderer['default'];
  }

  exports['default'] = _mobiledocDomRendererDomRenderer['default'];
});
define("mobiledoc-dom-renderer/utils", ["exports"], function (exports) {
  "use strict";

  exports.createElement = createElement;
  exports.appendChild = appendChild;
  exports.createTextNode = createTextNode;

  function createElement(tagName) {
    return document.createElement(tagName);
  }

  function appendChild(target, child) {
    target.appendChild(child);
  }

  function createTextNode(text) {
    return document.createTextNode(text);
  }
});
require("mobiledoc-dom-renderer")["registerGlobal"](window, document);
})();//# sourceMappingURL=mobiledoc-dom-renderer.map