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

define('content-kit-editor/cards/image', ['exports', 'content-kit-editor/cards/placeholder-image', 'content-kit-editor/utils/http-utils'], function (exports, _contentKitEditorCardsPlaceholderImage, _contentKitEditorUtilsHttpUtils) {
  'use strict';

  function buildFileInput() {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.classList.add('ck-file-input');
    document.body.appendChild(input);
    return input;
  }

  function buildButton(text) {
    var button = document.createElement('button');
    button.innerHTML = text;
    return button;
  }

  function upload(imageOptions, fileInput, success, failure) {
    var uploader = new _contentKitEditorUtilsHttpUtils.FileUploader({
      url: imageOptions.uploadUrl,
      maxFileSize: 5000000
    });
    uploader.upload({
      fileInput: fileInput,
      complete: function complete(response, error) {
        if (!error && response && response.url) {
          success({
            src: response.url
          });
        } else {
          window.alert('There was a problem uploading the image: ' + error);
          failure();
        }
      }
    });
  }

  exports['default'] = {
    name: 'image',

    display: {
      setup: function setup(element, options, _ref, payload) {
        var edit = _ref.edit;

        var img = document.createElement('img');
        img.src = payload.src || _contentKitEditorCardsPlaceholderImage['default'];
        if (edit) {
          img.onclick = edit;
        }
        element.appendChild(img);
        return img;
      },
      teardown: function teardown(element) {
        element.parentNode.removeChild(element);
      }
    },

    edit: {
      setup: function setup(element, options, _ref2) {
        var save = _ref2.save;
        var cancel = _ref2.cancel;

        var uploadButton = buildButton('Upload');
        var cancelButton = buildButton('Cancel');
        cancelButton.onclick = cancel;

        var imageOptions = options.image;

        if (!imageOptions || imageOptions && !imageOptions.uploadUrl) {
          window.alert('Image card must have `image.uploadUrl` included in cardOptions');
          cancel();
          return;
        }

        var fileInput = buildFileInput();
        uploadButton.onclick = function () {
          fileInput.dispatchEvent(new MouseEvent('click', { bubbles: false }));
        };
        element.appendChild(uploadButton);
        element.appendChild(cancelButton);

        fileInput.onchange = function () {
          try {
            if (fileInput.files.length === 0) {
              cancel();
            }
            upload(imageOptions, fileInput, save, cancel);
          } catch (error) {
            window.alert('There was a starting the upload: ' + error);
            cancel();
          }
        };
        return [uploadButton, cancelButton, fileInput];
      },
      teardown: function teardown(elements) {
        elements.forEach(function (element) {
          return element.parentNode.removeChild(element);
        });
      }
    }

  };
});
define("content-kit-editor/cards/placeholder-image", ["exports"], function (exports) {
  "use strict";

  var placeholderImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAMFBMVEXp7vG6vsHm6+63u77Hy868wMPe4+bO09bh5unr8fTR1djAxMfM0NPX3N/c4eTBxcjXRf5TAAACh0lEQVR4nO3b6ZKqMBSFUSQMYZL3f9tbBq/NEEDiqUqOfusn1ZXKbjcQlGQZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACC6RkbsGHuabChEtHmiGYfS3EQYM+Sxw/gMQvmcNnYaj6oTDHi73WPn2eqnj9B8zo3TJXcq5uNjXmVff86VwSR3JtryMa1BYqi7S1hJDCVpSigyLcGhJJEwzlCSNtPKrbVhVwsdCfOhH7uuaG3ARV9DwsaOzxt3N1yPqCHhvXytTUz92VDpmE/LLhZwl++R6Sds6sUa/PL6K/2E2fIhw1xdRKefsFolrPc+xNx/N0k/4fpBsdhL2HfeiN+TsDCms8dDpeRyS3P3QDl6Iqaf8L0rTf+80m6Lmn7Ct+4Wxf+/2RY1/YRv3PHz/u+fsCmqgoTnq7Z+8SGviqoh4dnKu1ieqauiakh4/PQ0r6ivqDoSHj0B97eNRVG1JNxV+L4bnxdVecJtRTdFVZ7QU9F1UXUn9FZ0VVRlCav5ob2KLouqKmFjy676u2HsVnRRVFUJq3J+8KCi86IqSthMvyl209Hjijqm3RsqAZ5pNfa5PJ2KelJRjQmr1/r7cfy0ouoSNvOfvbvhvKLaEr4qOin9kTQnrN7LpDZhE/Zmhp6Eq4p+YcKgiipKGFhRRQkDK6ooYfgLbiSMioQkJGF8P5XwHv4O+7AaKiXzaeXh1kMl5AffTUxiKEm/krD94BR8Gdxl1fceSlR58ZhXKbEpyD2amNiBtmrJLTMHL1LF8/rpXkSZXEmz8K8uvAFFNm6Iq0aBLUFOmeCuJ6exrcCmoLpN7kYx891bSAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgh/wDdr8peyRHLogAAAAASUVORK5CYII=";

  exports["default"] = placeholderImage;
});
define("content-kit-editor/commands/base", ["exports"], function (exports) {
  "use strict";

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var Command = (function () {
    function Command() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      _classCallCheck(this, Command);

      var command = this;
      var name = options.name;
      var prompt = options.prompt;
      command.name = name;
      command.button = options.button || name;
      if (prompt) {
        command.prompt = prompt;
      }
    }

    _createClass(Command, [{
      key: "exec",
      value: function exec() {/* override in subclass */}
    }, {
      key: "unexec",
      value: function unexec() {/* override in subclass */}
    }]);

    return Command;
  })();

  exports["default"] = Command;
});
define('content-kit-editor/commands/bold', ['exports', 'content-kit-editor/commands/text-format', 'content-kit-editor/utils/array-utils'], function (exports, _contentKitEditorCommandsTextFormat, _contentKitEditorUtilsArrayUtils) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var BoldCommand = (function (_TextFormatCommand) {
    _inherits(BoldCommand, _TextFormatCommand);

    function BoldCommand(editor) {
      _classCallCheck(this, BoldCommand);

      _get(Object.getPrototypeOf(BoldCommand.prototype), 'constructor', this).call(this, {
        name: 'bold',
        button: '<i class="ck-icon-bold"></i>'
      });
      this.editor = editor;
      var builder = this.editor.builder;

      this.markup = builder.createMarkup('strong');
    }

    _createClass(BoldCommand, [{
      key: 'exec',
      value: function exec() {
        this.editor.applyMarkupToSelection(this.markup);
      }
    }, {
      key: 'unexec',
      value: function unexec() {
        this.editor.removeMarkupFromSelection(this.markup);
      }
    }, {
      key: 'isActive',
      value: function isActive() {
        var _this = this;

        return (0, _contentKitEditorUtilsArrayUtils.any)(this.editor.activeMarkers, function (m) {
          return m.hasMarkup(_this.markup);
        });
      }
    }]);

    return BoldCommand;
  })(_contentKitEditorCommandsTextFormat['default']);

  exports['default'] = BoldCommand;
});
define('content-kit-editor/commands/card', ['exports', 'content-kit-editor/commands/base'], function (exports, _contentKitEditorCommandsBase) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  function injectCardBlock() /* cardName, cardPayload, editor, index */{
    throw new Error('Unimplemented: BlockModel and Type.CARD are no longer things');
  }

  var CardCommand = (function (_Command) {
    _inherits(CardCommand, _Command);

    function CardCommand() {
      _classCallCheck(this, CardCommand);

      _get(Object.getPrototypeOf(CardCommand.prototype), 'constructor', this).call(this, {
        name: 'card',
        button: '<i>CA</i>'
      });
    }

    _createClass(CardCommand, [{
      key: 'exec',
      value: function exec() {
        _get(Object.getPrototypeOf(CardCommand.prototype), 'exec', this).call(this);
        var editor = this.editor;
        var currentEditingIndex = editor.getCurrentBlockIndex();

        var cardName = 'pick-color';
        var cardPayload = { options: ['red', 'blue'] };
        injectCardBlock(cardName, cardPayload, editor, currentEditingIndex);
      }
    }]);

    return CardCommand;
  })(_contentKitEditorCommandsBase['default']);

  exports['default'] = CardCommand;
});
define('content-kit-editor/commands/format-block', ['exports', 'content-kit-editor/commands/text-format', 'content-kit-editor/utils/array-utils'], function (exports, _contentKitEditorCommandsTextFormat, _contentKitEditorUtilsArrayUtils) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var FormatBlockCommand = (function (_TextFormatCommand) {
    _inherits(FormatBlockCommand, _TextFormatCommand);

    function FormatBlockCommand(editor) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      _classCallCheck(this, FormatBlockCommand);

      _get(Object.getPrototypeOf(FormatBlockCommand.prototype), 'constructor', this).call(this, options);
      this.editor = editor;
    }

    _createClass(FormatBlockCommand, [{
      key: 'isActive',
      value: function isActive() {
        var _this = this;

        var editor = this.editor;
        var activeSections = editor.activeSections;

        return (0, _contentKitEditorUtilsArrayUtils.any)(activeSections, function (section) {
          return (0, _contentKitEditorUtilsArrayUtils.any)(_this.mappedTags, function (t) {
            return section.tagName === t;
          });
        });
      }
    }, {
      key: 'exec',
      value: function exec() {
        var _this2 = this;

        var editor = this.editor;
        var activeSections = editor.activeSections;

        activeSections.forEach(function (s) {
          editor.resetSectionMarkers(s);
          editor.setSectionTagName(s, _this2.tag);
        });

        editor.rerender();
        editor.selectSections(activeSections);
        this.editor.didUpdate();
      }
    }, {
      key: 'unexec',
      value: function unexec() {
        var editor = this.editor;
        var activeSections = editor.activeSections;

        activeSections.forEach(function (s) {
          editor.resetSectionTagName(s);
        });

        editor.rerender();
        editor.selectSections(activeSections);
        this.editor.didUpdate();
      }
    }]);

    return FormatBlockCommand;
  })(_contentKitEditorCommandsTextFormat['default']);

  exports['default'] = FormatBlockCommand;
});
define('content-kit-editor/commands/heading', ['exports', 'content-kit-editor/commands/format-block'], function (exports, _contentKitEditorCommandsFormatBlock) {
  'use strict';

  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var HeadingCommand = (function (_FormatBlockCommand) {
    _inherits(HeadingCommand, _FormatBlockCommand);

    function HeadingCommand(editor) {
      _classCallCheck(this, HeadingCommand);

      var options = {
        name: 'heading',
        tag: 'h2',
        button: '<i class="ck-icon-heading"></i>2'
      };
      _get(Object.getPrototypeOf(HeadingCommand.prototype), 'constructor', this).call(this, editor, options);
    }

    return HeadingCommand;
  })(_contentKitEditorCommandsFormatBlock['default']);

  exports['default'] = HeadingCommand;
});
define('content-kit-editor/commands/image', ['exports', 'content-kit-editor/commands/base'], function (exports, _contentKitEditorCommandsBase) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var ImageCommand = (function (_Command) {
    _inherits(ImageCommand, _Command);

    function ImageCommand() {
      _classCallCheck(this, ImageCommand);

      _get(Object.getPrototypeOf(ImageCommand.prototype), 'constructor', this).call(this, {
        name: 'image',
        button: '<i class="ck-icon-image"></i>'
      });
    }

    _createClass(ImageCommand, [{
      key: 'exec',
      value: function exec() {
        var _editor = this.editor;
        var post = _editor.post;
        var builder = _editor.builder;

        var sections = this.editor.activeSections;
        var lastSection = sections[sections.length - 1];
        var section = builder.createCardSection('image');
        post.sections.insertAfter(section, lastSection);
        sections.forEach(function (section) {
          return section.renderNode.scheduleForRemoval();
        });

        this.editor.rerender();
        this.editor.didUpdate();
      }
    }]);

    return ImageCommand;
  })(_contentKitEditorCommandsBase['default']);

  exports['default'] = ImageCommand;
});
define('content-kit-editor/commands/italic', ['exports', 'content-kit-editor/commands/text-format', 'content-kit-editor/utils/array-utils'], function (exports, _contentKitEditorCommandsTextFormat, _contentKitEditorUtilsArrayUtils) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var ItalicCommand = (function (_TextFormatCommand) {
    _inherits(ItalicCommand, _TextFormatCommand);

    function ItalicCommand(editor) {
      _classCallCheck(this, ItalicCommand);

      _get(Object.getPrototypeOf(ItalicCommand.prototype), 'constructor', this).call(this, {
        name: 'italic',
        button: '<i class="ck-icon-italic"></i>'
      });
      this.editor = editor;
      var builder = this.editor.builder;

      this.markup = builder.createMarkup('em');
    }

    _createClass(ItalicCommand, [{
      key: 'exec',
      value: function exec() {
        this.editor.applyMarkupToSelection(this.markup);
      }
    }, {
      key: 'unexec',
      value: function unexec() {
        this.editor.removeMarkupFromSelection(this.markup);
      }
    }, {
      key: 'isActive',
      value: function isActive() {
        var _this = this;

        return (0, _contentKitEditorUtilsArrayUtils.any)(this.editor.activeMarkers, function (m) {
          return m.hasMarkup(_this.markup);
        });
      }
    }]);

    return ItalicCommand;
  })(_contentKitEditorCommandsTextFormat['default']);

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
define('content-kit-editor/commands/quote', ['exports', 'content-kit-editor/commands/format-block'], function (exports, _contentKitEditorCommandsFormatBlock) {
  'use strict';

  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var QuoteCommand = (function (_FormatBlockCommand) {
    _inherits(QuoteCommand, _FormatBlockCommand);

    function QuoteCommand(editor) {
      _classCallCheck(this, QuoteCommand);

      _get(Object.getPrototypeOf(QuoteCommand.prototype), 'constructor', this).call(this, editor, {
        name: 'quote',
        tag: 'blockquote',
        button: '<i class="ck-icon-quote"></i>'
      });
    }

    return QuoteCommand;
  })(_contentKitEditorCommandsFormatBlock['default']);

  exports['default'] = QuoteCommand;
});
define('content-kit-editor/commands/subheading', ['exports', 'content-kit-editor/commands/format-block'], function (exports, _contentKitEditorCommandsFormatBlock) {
  'use strict';

  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var SubheadingCommand = (function (_FormatBlockCommand) {
    _inherits(SubheadingCommand, _FormatBlockCommand);

    function SubheadingCommand(editor) {
      _classCallCheck(this, SubheadingCommand);

      _get(Object.getPrototypeOf(SubheadingCommand.prototype), 'constructor', this).call(this, editor, {
        name: 'subheading',
        tag: 'h3',
        button: '<i class="ck-icon-heading"></i>3'
      });
    }

    return SubheadingCommand;
  })(_contentKitEditorCommandsFormatBlock['default']);

  exports['default'] = SubheadingCommand;
});
define('content-kit-editor/commands/text-format', ['exports', 'content-kit-editor/commands/base'], function (exports, _contentKitEditorCommandsBase) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var TextFormatCommand = (function (_Command) {
    _inherits(TextFormatCommand, _Command);

    function TextFormatCommand() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      _classCallCheck(this, TextFormatCommand);

      _get(Object.getPrototypeOf(TextFormatCommand.prototype), 'constructor', this).call(this, options);

      this.tag = options.tag;
      this.mappedTags = options.mappedTags || [];
      if (this.tag) {
        this.mappedTags.push(this.tag);
      }
      this.action = options.action || this.name;
      this.removeAction = options.removeAction || this.action;
    }

    _createClass(TextFormatCommand, [{
      key: 'exec',
      value: function exec(value) {
        document.execCommand(this.action, false, value || null);
      }
    }, {
      key: 'unexec',
      value: function unexec(value) {
        document.execCommand(this.removeAction, false, value || null);
      }
    }]);

    return TextFormatCommand;
  })(_contentKitEditorCommandsBase['default']);

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
define('content-kit-editor/editor/editor', ['exports', 'content-kit-editor/views/text-format-toolbar', 'content-kit-editor/views/tooltip', 'content-kit-editor/views/embed-intent', 'content-kit-editor/views/reversible-toolbar-button', 'content-kit-editor/commands/bold', 'content-kit-editor/commands/italic', 'content-kit-editor/commands/link', 'content-kit-editor/commands/quote', 'content-kit-editor/commands/heading', 'content-kit-editor/commands/subheading', 'content-kit-editor/commands/unordered-list', 'content-kit-editor/commands/ordered-list', 'content-kit-editor/commands/image', 'content-kit-editor/commands/card', 'content-kit-editor/cards/image', 'content-kit-editor/utils/keycodes', 'content-kit-editor/utils/selection-utils', 'content-kit-editor/utils/event-emitter', 'content-kit-editor/parsers/mobiledoc', 'content-kit-editor/parsers/post', 'content-kit-editor/renderers/editor-dom', 'content-kit-editor/models/render-tree', 'content-kit-editor/renderers/mobiledoc', 'content-kit-utils', 'content-kit-editor/utils/dom-utils', 'content-kit-editor/utils/array-utils', 'content-kit-editor/utils/element-utils', 'content-kit-editor/utils/mixin', 'content-kit-editor/utils/event-listener', 'content-kit-editor/models/cursor', 'content-kit-editor/models/markup-section', 'content-kit-editor/models/post-node-builder'], function (exports, _contentKitEditorViewsTextFormatToolbar, _contentKitEditorViewsTooltip, _contentKitEditorViewsEmbedIntent, _contentKitEditorViewsReversibleToolbarButton, _contentKitEditorCommandsBold, _contentKitEditorCommandsItalic, _contentKitEditorCommandsLink, _contentKitEditorCommandsQuote, _contentKitEditorCommandsHeading, _contentKitEditorCommandsSubheading, _contentKitEditorCommandsUnorderedList, _contentKitEditorCommandsOrderedList, _contentKitEditorCommandsImage, _contentKitEditorCommandsCard, _contentKitEditorCardsImage, _contentKitEditorUtilsKeycodes, _contentKitEditorUtilsSelectionUtils, _contentKitEditorUtilsEventEmitter, _contentKitEditorParsersMobiledoc, _contentKitEditorParsersPost, _contentKitEditorRenderersEditorDom, _contentKitEditorModelsRenderTree, _contentKitEditorRenderersMobiledoc, _contentKitUtils, _contentKitEditorUtilsDomUtils, _contentKitEditorUtilsArrayUtils, _contentKitEditorUtilsElementUtils, _contentKitEditorUtilsMixin, _contentKitEditorUtilsEventListener, _contentKitEditorModelsCursor, _contentKitEditorModelsMarkupSection, _contentKitEditorModelsPostNodeBuilder) {
  'use strict';

  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var EDITOR_ELEMENT_CLASS_NAME = 'ck-editor';

  exports.EDITOR_ELEMENT_CLASS_NAME = EDITOR_ELEMENT_CLASS_NAME;
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
    textFormatCommands: [new _contentKitEditorCommandsLink['default']()],
    embedCommands: [new _contentKitEditorCommandsImage['default'](), new _contentKitEditorCommandsCard['default']()],
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

    var toggleSelection = function toggleSelection() {
      return editor.cursor.hasSelection() ? editor.hasSelection() : editor.hasNoSelection();
    };

    // mouseup will not properly report a selection until the next tick, so add a timeout:
    var mouseupHandler = function mouseupHandler() {
      return setTimeout(toggleSelection);
    };
    editor.addEventListener(document, 'mouseup', mouseupHandler);

    var keyupHandler = toggleSelection;
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

  function makeButtons(editor) {
    var headingCommand = new _contentKitEditorCommandsHeading['default'](editor);
    var headingButton = new _contentKitEditorViewsReversibleToolbarButton['default'](headingCommand, editor);

    var subheadingCommand = new _contentKitEditorCommandsSubheading['default'](editor);
    var subheadingButton = new _contentKitEditorViewsReversibleToolbarButton['default'](subheadingCommand, editor);

    var quoteCommand = new _contentKitEditorCommandsQuote['default'](editor);
    var quoteButton = new _contentKitEditorViewsReversibleToolbarButton['default'](quoteCommand, editor);

    var boldCommand = new _contentKitEditorCommandsBold['default'](editor);
    var boldButton = new _contentKitEditorViewsReversibleToolbarButton['default'](boldCommand, editor);

    var italicCommand = new _contentKitEditorCommandsItalic['default'](editor);
    var italicButton = new _contentKitEditorViewsReversibleToolbarButton['default'](italicCommand, editor);

    return [headingButton, subheadingButton, quoteButton, boldButton, italicButton];
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

      this.builder = new _contentKitEditorModelsPostNodeBuilder['default']();

      // FIXME: This should merge onto this.options
      (0, _contentKitUtils.mergeWithOptions)(this, defaults, options);

      this.cards.push(_contentKitEditorCardsImage['default']);

      this._parser = new _contentKitEditorParsersPost['default'](this.builder);
      this._renderer = new _contentKitEditorRenderersEditorDom['default'](this, this.cards, this.unknownCardHandler, this.cardOptions);

      this.applyClassName(EDITOR_ELEMENT_CLASS_NAME);
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
        // FIXME -- eventually all the commands should migrate to being buttons
        // that can be added
        commands: this.textFormatCommands,
        buttons: makeButtons(this),
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
        this.post = new _contentKitEditorParsersMobiledoc['default'](this.builder).parse(mobiledoc);
        this._renderTree = new _contentKitEditorModelsRenderTree['default']();
        var node = this._renderTree.buildRenderNode(this.post);
        this._renderTree.node = node;
        this.trigger('update');
      }
    }, {
      key: 'rerender',
      value: function rerender() {
        var postRenderNode = this.post.renderNode;

        // if we haven't rendered this post's renderNode before, mark it dirty
        if (!postRenderNode.element) {
          postRenderNode.element = this.element;
          postRenderNode.markDirty();
        }

        this._renderer.render(this._renderTree);
      }
    }, {
      key: 'deleteSelection',
      value: function deleteSelection(event) {
        event.preventDefault();

        // types of selection deletion:
        //   * a selection starts at the beginning of a section
        //     -- cursor should end up at the beginning of that section
        //     -- if the section not longer has markers, add a blank one for the cursor to focus on
        //   * a selection is entirely within a section
        //     -- split the markers with the selection, remove those new markers from their section
        //     -- cursor goes at end of the marker before the selection start, or if the
        //     -- selection was at the start of the section, cursor goes at section start
        //   * a selection crosses multiple sections
        //     -- remove all the sections that are between (exclusive ) selection start and end
        //     -- join the start and end sections
        //     -- mark the end section for removal
        //     -- cursor goes at end of marker before the selection start

        var markers = this.splitMarkersFromSelection();

        var _post$cutMarkers = this.post.cutMarkers(markers);

        var changedSections = _post$cutMarkers.changedSections;
        var removedSections = _post$cutMarkers.removedSections;
        var currentMarker = _post$cutMarkers.currentMarker;
        var currentOffset = _post$cutMarkers.currentOffset;

        changedSections.forEach(function (section) {
          return section.renderNode.markDirty();
        });
        removedSections.forEach(function (section) {
          return section.renderNode.scheduleForRemoval();
        });

        this.rerender();

        var currentTextNode = currentMarker.renderNode.element;
        this.cursor.moveToNode(currentTextNode, currentOffset);

        this.trigger('update');
      }

      // FIXME ensure we handle deletion when there is a selection
    }, {
      key: 'handleDeletion',
      value: function handleDeletion(event) {
        var _cursor$offsets = this.cursor.offsets;
        var leftRenderNode = _cursor$offsets.leftRenderNode;
        var leftOffset = _cursor$offsets.leftOffset;

        // need to handle these cases:
        // when cursor is:
        //   * A in the middle of a marker -- just delete the character
        //   * B offset is 0 and there is a previous marker
        //     * delete last char of previous marker
        //   * C offset is 0 and there is no previous marker
        //     * join this section with previous section

        if (this.cursor.hasSelection()) {
          this.deleteSelection(event);
          return;
        }

        var currentMarker = leftRenderNode.postNode;
        var nextCursorMarker = currentMarker;
        var nextCursorOffset = leftOffset - 1;

        // A: in the middle of a marker
        if (leftOffset !== 0) {
          currentMarker.deleteValueAtOffset(leftOffset - 1);
          if (currentMarker.length === 0 && currentMarker.section.markers.length > 1) {
            leftRenderNode.scheduleForRemoval();

            var isFirstRenderNode = leftRenderNode === leftRenderNode.parent.childNodes.head;
            if (isFirstRenderNode) {
              // move cursor to start of next node
              nextCursorMarker = leftRenderNode.next.postNode;
              nextCursorOffset = 0;
            } else {
              // move cursor to end of prev node
              nextCursorMarker = leftRenderNode.prev.postNode;
              nextCursorOffset = leftRenderNode.prev.postNode.length;
            }
          } else {
            leftRenderNode.markDirty();
          }
        } else {
          var currentSection = currentMarker.section;
          var previousMarker = currentMarker.prev;
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
            var previousSection = currentSection.prev;
            if (previousSection) {
              var isMarkupSection = previousSection.type === _contentKitEditorModelsMarkupSection.MARKUP_SECTION_TYPE;

              if (isMarkupSection) {
                var lastPreviousMarker = previousSection.markers.tail;
                previousSection.join(currentSection);
                previousSection.renderNode.markDirty();
                currentSection.renderNode.scheduleForRemoval();

                nextCursorMarker = lastPreviousMarker.next;
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
        var leftRenderNode = _cursor$offsets2.leftRenderNode;
        var rightRenderNode = _cursor$offsets2.rightRenderNode;
        var leftOffset = _cursor$offsets2.leftOffset;

        // if there's no left/right nodes, we are probably not in the editor,
        // or we have selected some non-marker thing like a card
        if (!leftRenderNode || !rightRenderNode) {
          return;
        }

        // FIXME handle when the selection is not collapsed, this code assumes it is
        event.preventDefault();

        var markerRenderNode = leftRenderNode;
        var marker = markerRenderNode.postNode;
        var section = marker.section;

        var _section$splitAtMarker = section.splitAtMarker(marker, leftOffset);

        var _section$splitAtMarker2 = _slicedToArray(_section$splitAtMarker, 2);

        var beforeSection = _section$splitAtMarker2[0];
        var afterSection = _section$splitAtMarker2[1];

        section.renderNode.scheduleForRemoval();

        this.post.sections.insertAfter(beforeSection, section);
        this.post.sections.insertAfter(afterSection, beforeSection);
        this.post.sections.remove(section);

        this.rerender();
        this.trigger('update');

        this.cursor.moveToSection(afterSection);
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
      key: 'didUpdate',
      value: function didUpdate() {
        this.trigger('update');
      }
    }, {
      key: 'selectSections',
      value: function selectSections(sections) {
        this.cursor.selectSections(sections);
        this.hasSelection();
      }

      /*
       * @return {Array} of markers that are "inside the split"
       */
    }, {
      key: 'splitMarkersFromSelection',
      value: function splitMarkersFromSelection() {
        var _cursor$offsets3 = this.cursor.offsets;
        var startMarker = _cursor$offsets3.startMarker;
        var startMarkerOffset = _cursor$offsets3.leftOffset;
        var endMarker = _cursor$offsets3.endMarker;
        var endMarkerOffset = _cursor$offsets3.rightOffset;
        var startSection = _cursor$offsets3.startSection;
        var endSection = _cursor$offsets3.endSection;

        var selectedMarkers = [];

        startMarker.renderNode.scheduleForRemoval();
        endMarker.renderNode.scheduleForRemoval();

        if (startMarker === endMarker) {
          var newMarkers = startSection.splitMarker(startMarker, startMarkerOffset, endMarkerOffset);
          selectedMarkers = this.markersInOffset(newMarkers, startMarkerOffset, endMarkerOffset);
        } else {
          var newStartMarkers = startSection.splitMarker(startMarker, startMarkerOffset);
          var selectedStartMarkers = this.markersInOffset(newStartMarkers, startMarkerOffset);

          var newEndMarkers = endSection.splitMarker(endMarker, endMarkerOffset);
          var selectedEndMarkers = this.markersInOffset(newEndMarkers, 0, endMarkerOffset);

          var newStartMarker = selectedStartMarkers[0],
              newEndMarker = selectedEndMarkers[selectedEndMarkers.length - 1];

          this.post.markersFrom(newStartMarker, newEndMarker, function (m) {
            return selectedMarkers.push(m);
          });
        }

        return selectedMarkers;
      }
    }, {
      key: 'markersInOffset',
      value: function markersInOffset(markers, startOffset, endOffset) {
        var offset = 0;
        var foundMarkers = [];
        var toEnd = endOffset === undefined;
        if (toEnd) {
          endOffset = 0;
        }

        markers.forEach(function (marker) {
          if (toEnd) {
            endOffset += marker.length;
          }

          if (offset >= startOffset && offset < endOffset) {
            foundMarkers.push(marker);
          }

          offset += marker.length;
        });

        return foundMarkers;
      }
    }, {
      key: 'applyMarkupToSelection',
      value: function applyMarkupToSelection(markup) {
        var markers = this.splitMarkersFromSelection();
        markers.forEach(function (marker) {
          marker.addMarkup(markup);
          marker.section.renderNode.markDirty();
        });

        this.rerender();
        this.selectMarkers(markers);
        this.didUpdate();
      }
    }, {
      key: 'removeMarkupFromSelection',
      value: function removeMarkupFromSelection(markup) {
        var markers = this.splitMarkersFromSelection();
        markers.forEach(function (marker) {
          marker.removeMarkup(markup);
          marker.section.renderNode.markDirty();
        });

        this.rerender();
        this.selectMarkers(markers);
        this.didUpdate();
      }
    }, {
      key: 'selectMarkers',
      value: function selectMarkers(markers) {
        this.cursor.selectMarkers(markers);
        this.hasSelection();
      }
    }, {
      key: 'getCurrentBlockIndex',
      value: function getCurrentBlockIndex() {
        var selectionEl = this.element || (0, _contentKitEditorUtilsSelectionUtils.getSelectionBlockElement)();
        var blockElements = (0, _contentKitUtils.toArray)(this.element.children);
        return blockElements.indexOf(selectionEl);
      }
    }, {
      key: 'applyClassName',
      value: function applyClassName(className) {
        (0, _contentKitEditorUtilsDomUtils.addClassName)(this.element, className);
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

            var previousSectionRenderNode = previousSection && previousSection.renderNode;
            _this2.post.sections.insertAfter(_section, previousSection);
            _this2._renderTree.node.childNodes.insertAfter(sectionRenderNode, previousSectionRenderNode);
          }

          // may cause duplicates to be included
          var section = sectionRenderNode.postNode;
          sectionsInDOM.push(section);
          previousSection = section;
        });

        // remove deleted nodes
        var deletedSections = [];
        (0, _contentKitEditorUtilsArrayUtils.forEach)(this.post.sections, function (section) {
          if (!section.renderNode) {
            throw new Error('All sections are expected to have a renderNode');
          }

          if (sectionsInDOM.indexOf(section) === -1) {
            deletedSections.push(section);
          }
        });
        (0, _contentKitEditorUtilsArrayUtils.forEach)(deletedSections, function (s) {
          return s.renderNode.scheduleForRemoval();
        });

        // reparse the new section(s) with the cursor
        // to ensure that we catch any changed html that the browser might have
        // added
        var sectionsWithCursor = this.cursor.activeSections;
        (0, _contentKitEditorUtilsArrayUtils.forEach)(sectionsWithCursor, function (section) {
          if (newSections.indexOf(section) === -1) {
            _this2.reparseSection(section);
          }
        });

        var _cursor$offsets4 = this.cursor.offsets;
        var leftRenderNode = _cursor$offsets4.leftRenderNode;
        var leftOffset = _cursor$offsets4.leftOffset;
        var rightRenderNode = _cursor$offsets4.rightRenderNode;
        var rightOffset = _cursor$offsets4.rightOffset;

        // The cursor will lose its textNode if we have reparsed (and thus will rerender, below)
        // its section. Ensure the cursor is placed where it should be after render.
        //
        // New sections are presumed clean, and thus do not get rerendered and lose
        // their cursor position.
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
      key: 'resetSectionMarkers',

      /*
       * Clear the markups from each of the section's markers
       */
      value: function resetSectionMarkers(section) {
        section.markers.forEach(function (m) {
          m.clearMarkups();
          m.renderNode.markDirty();
        });
      }

      /*
       * Change the tag name for the given section
       */
    }, {
      key: 'setSectionTagName',
      value: function setSectionTagName(section, tagName) {
        section.setTagName(tagName);
        section.renderNode.markDirty();
      }
    }, {
      key: 'resetSectionTagName',
      value: function resetSectionTagName(section) {
        section.resetTagName();
        section.renderNode.markDirty();
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
        var renderNodes = this.cursor.activeSections.map(function (s) {
          return s.renderNode;
        });
        var lastRenderNode = renderNodes[renderNodes.length - 1];
        lastRenderNode.parent.childNodes.insertAfter(newRenderNode, lastRenderNode);
        this.post.sections.insertAfter(newSection, lastRenderNode.postNode);
        renderNodes.forEach(function (renderNode) {
          return renderNode.scheduleForRemoval();
        });
        this.trigger('update');
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
    }, {
      key: 'cursorSelection',
      get: function get() {
        return this.cursor.cursorSelection;
      }

      /*
       * Returns the active sections. If the cursor selection is collapsed this will be
       * an array of 1 item. Else will return an array containing each section that is either
       * wholly or partly contained by the cursor selection.
       *
       * @return {array} The sections from the cursor's selection start to the selection end
       */
    }, {
      key: 'activeSections',
      get: function get() {
        return this.cursor.activeSections;
      }
    }, {
      key: 'activeMarkers',
      get: function get() {
        var _cursor$offsets5 = this.cursor.offsets;
        var startMarker = _cursor$offsets5.startMarker;
        var endMarker = _cursor$offsets5.endMarker;

        if (!(startMarker && endMarker)) {
          return [];
        }

        var activeMarkers = [];
        this.post.markersFrom(startMarker, endMarker, function (m) {
          return activeMarkers.push(m);
        });
        return activeMarkers;
      }
    }]);

    return Editor;
  })();

  (0, _contentKitEditorUtilsMixin['default'])(Editor, _contentKitEditorUtilsEventEmitter['default']);
  (0, _contentKitEditorUtilsMixin['default'])(Editor, _contentKitEditorUtilsEventListener['default']);

  exports['default'] = Editor;
});
define('content-kit-editor', ['exports', 'content-kit-editor/editor/editor', 'content-kit-editor/cards/image'], function (exports, _contentKitEditorEditorEditor, _contentKitEditorCardsImage) {
  'use strict';

  exports.registerGlobal = registerGlobal;

  var ContentKit = {
    Editor: _contentKitEditorEditorEditor['default'],
    ImageCard: _contentKitEditorCardsImage['default']
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
    function CardNode(editor, card, section, element, cardOptions) {
      _classCallCheck(this, CardNode);

      this.editor = editor;
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

            _this.editor.didUpdate();
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
define("content-kit-editor/models/card", ["exports", "content-kit-editor/utils/linked-item"], function (exports, _contentKitEditorUtilsLinkedItem) {
  "use strict";

  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var CARD_TYPE = 'card-section';

  exports.CARD_TYPE = CARD_TYPE;

  var Card = (function (_LinkedItem) {
    _inherits(Card, _LinkedItem);

    function Card(name, payload) {
      _classCallCheck(this, Card);

      _get(Object.getPrototypeOf(Card.prototype), "constructor", this).call(this);
      this.name = name;
      this.payload = payload;
      this.type = CARD_TYPE;
    }

    return Card;
  })(_contentKitEditorUtilsLinkedItem["default"]);

  exports["default"] = Card;
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
        var marker = section.markers.head;
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
      key: 'selectSections',
      value: function selectSections(sections) {
        var startSection = sections[0],
            endSection = sections[sections.length - 1];

        var startNode = startSection.markers.head.renderNode.element,
            endNode = endSection.markers.tail.renderNode.element;

        var startOffset = 0,
            endOffset = endNode.textContent.length;

        this.moveToNode(startNode, startOffset, endNode, endOffset);
      }
    }, {
      key: 'selectMarkers',
      value: function selectMarkers(markers) {
        var startMarker = markers[0],
            endMarker = markers[markers.length - 1];

        var startNode = startMarker.renderNode.element,
            endNode = endMarker.renderNode.element;
        var startOffset = 0,
            endOffset = endMarker.length;

        this.moveToNode(startNode, startOffset, endNode, endOffset);
      }

      /**
       * @param {textNode} node
       * @param {integer} offset
       * @param {textNode} endNode (default: node)
       * @param {integer} endOffset (default: offset)
       */
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
    }, {
      key: 'offsets',
      get: function get() {
        var leftNode = undefined,
            rightNode = undefined,
            leftOffset = undefined,
            rightOffset = undefined;
        var selection = this.selection;
        var anchorNode = selection.anchorNode;
        var focusNode = selection.focusNode;
        var anchorOffset = selection.anchorOffset;
        var focusOffset = selection.focusOffset;
        var rangeCount = selection.rangeCount;

        var range = rangeCount > 0 && selection.getRangeAt(0);

        if (!range) {
          return {};
        }

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

        var startMarker = leftRenderNode && leftRenderNode.postNode,
            endMarker = rightRenderNode && rightRenderNode.postNode;

        var startSection = startMarker && startMarker.section;
        var endSection = endMarker && endMarker.section;

        return {
          leftNode: leftNode,
          rightNode: rightNode,
          leftOffset: leftOffset,
          rightOffset: rightOffset,
          leftRenderNode: leftRenderNode,
          rightRenderNode: rightRenderNode,
          startMarker: startMarker,
          endMarker: endMarker,
          startSection: startSection,
          endSection: endSection
        };
      }
    }, {
      key: 'activeSections',
      get: function get() {
        var sections = this.post.sections;

        var selection = this.selection;
        var rangeCount = selection.rangeCount;

        var range = rangeCount > 0 && selection.getRangeAt(0);

        if (!range) {
          return [];
        }

        var startContainer = range.startContainer;
        var endContainer = range.endContainer;

        var isSectionElement = function isSectionElement(element) {
          return (0, _contentKitEditorUtilsArrayUtils.detect)(sections, function (s) {
            return s.renderNode.element === element;
          });
        };

        var _detectParentNode = (0, _contentKitEditorUtilsDomUtils.detectParentNode)(startContainer, isSectionElement);

        var startSection = _detectParentNode.result;

        var _detectParentNode2 = (0, _contentKitEditorUtilsDomUtils.detectParentNode)(endContainer, isSectionElement);

        var endSection = _detectParentNode2.result;

        return sections.readRange(startSection, endSection);
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
define('content-kit-editor/models/marker', ['exports', 'content-kit-editor/utils/dom-utils', 'content-kit-editor/utils/array-utils', 'content-kit-editor/utils/linked-item'], function (exports, _contentKitEditorUtilsDomUtils, _contentKitEditorUtilsArrayUtils, _contentKitEditorUtilsLinkedItem) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x5, _x6, _x7) { var _again = true; _function: while (_again) { var object = _x5, property = _x6, receiver = _x7; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x5 = parent; _x6 = property; _x7 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var MARKER_TYPE = 'marker';

  exports.MARKER_TYPE = MARKER_TYPE;

  var Marker = (function (_LinkedItem) {
    _inherits(Marker, _LinkedItem);

    function Marker() {
      var _this = this;

      var value = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
      var markups = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

      _classCallCheck(this, Marker);

      _get(Object.getPrototypeOf(Marker.prototype), 'constructor', this).call(this);
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
        return this.builder.createMarker(this.value, clonedMarkups);
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
      key: 'removeMarkup',
      value: function removeMarkup(markup) {
        var index = this.markups.indexOf(markup);
        if (index !== -1) {
          this.markups.splice(index, 1);
        }
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
      value: function hasMarkup(tagNameOrMarkup) {
        var _this2 = this;

        if (typeof tagNameOrMarkup === 'string') {
          var _ret = (function () {
            var tagName = (0, _contentKitEditorUtilsDomUtils.normalizeTagName)(tagNameOrMarkup);
            return {
              v: (0, _contentKitEditorUtilsArrayUtils.detect)(_this2.markups, function (markup) {
                return markup.tagName === tagName;
              })
            };
          })();

          if (typeof _ret === 'object') return _ret.v;
        } else {
          var _ret2 = (function () {
            var targetMarkup = tagNameOrMarkup;
            return {
              v: (0, _contentKitEditorUtilsArrayUtils.detect)(_this2.markups, function (markup) {
                return markup === targetMarkup;
              })
            };
          })();

          if (typeof _ret2 === 'object') return _ret2.v;
        }
      }
    }, {
      key: 'getMarkup',
      value: function getMarkup(tagName) {
        return this.hasMarkup(tagName);
      }
    }, {
      key: 'join',
      value: function join(other) {
        var joined = this.builder.createMarker(this.value + other.value);
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
      value: function split() {
        var offset = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
        var endOffset = arguments.length <= 1 || arguments[1] === undefined ? this.length : arguments[1];

        var markers = [];

        markers = [this.builder.createMarker(this.value.substring(0, offset)), this.builder.createMarker(this.value.substring(offset, endOffset)), this.builder.createMarker(this.value.substring(endOffset))];

        this.markups.forEach(function (mu) {
          return markers.forEach(function (m) {
            return m.addMarkup(mu);
          });
        });
        return markers;
      }
    }, {
      key: 'isEmpty',
      get: function get() {
        return this.length === 0;
      }
    }, {
      key: 'length',
      get: function get() {
        return this.value.length;
      }
    }, {
      key: 'openedMarkups',
      get: function get() {
        var count = 0;
        if (this.prev) {
          count = (0, _contentKitEditorUtilsArrayUtils.commonItemLength)(this.markups, this.prev.markups);
        }

        return this.markups.slice(count);
      }
    }, {
      key: 'closedMarkups',
      get: function get() {
        var count = 0;
        if (this.next) {
          count = (0, _contentKitEditorUtilsArrayUtils.commonItemLength)(this.markups, this.next.markups);
        }

        return this.markups.slice(count);
      }
    }]);

    return Marker;
  })(_contentKitEditorUtilsLinkedItem['default']);

  exports['default'] = Marker;
});
define('content-kit-editor/models/markup-section', ['exports', 'content-kit-editor/utils/dom-utils', 'content-kit-editor/utils/array-utils', 'content-kit-editor/utils/linked-list', 'content-kit-editor/utils/linked-item'], function (exports, _contentKitEditorUtilsDomUtils, _contentKitEditorUtilsArrayUtils, _contentKitEditorUtilsLinkedList, _contentKitEditorUtilsLinkedItem) {
  'use strict';

  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x5, _x6, _x7) { var _again = true; _function: while (_again) { var object = _x5, property = _x6, receiver = _x7; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x5 = parent; _x6 = property; _x7 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var DEFAULT_TAG_NAME = (0, _contentKitEditorUtilsDomUtils.normalizeTagName)('p');
  exports.DEFAULT_TAG_NAME = DEFAULT_TAG_NAME;
  var VALID_MARKUP_SECTION_TAGNAMES = ['p', 'h3', 'h2', 'h1', 'blockquote', 'ul', 'ol'].map(_contentKitEditorUtilsDomUtils.normalizeTagName);
  exports.VALID_MARKUP_SECTION_TAGNAMES = VALID_MARKUP_SECTION_TAGNAMES;
  var MARKUP_SECTION_TYPE = 'markup-section';
  exports.MARKUP_SECTION_TYPE = MARKUP_SECTION_TYPE;

  var Section = (function (_LinkedItem) {
    _inherits(Section, _LinkedItem);

    function Section(tagName) {
      var _this = this;

      var markers = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

      _classCallCheck(this, Section);

      _get(Object.getPrototypeOf(Section.prototype), 'constructor', this).call(this);
      this.markers = new _contentKitEditorUtilsLinkedList['default']({
        adoptItem: function adoptItem(marker) {
          marker.section = _this;
        },
        freeItem: function freeItem(marker) {
          marker.section = null;
        }
      });
      this.tagName = tagName || DEFAULT_TAG_NAME;
      this.type = MARKUP_SECTION_TYPE;
      this.element = null;

      markers.forEach(function (m) {
        return _this.markers.append(m);
      });
    }

    _createClass(Section, [{
      key: 'setTagName',
      value: function setTagName(newTagName) {
        newTagName = (0, _contentKitEditorUtilsDomUtils.normalizeTagName)(newTagName);
        if (VALID_MARKUP_SECTION_TAGNAMES.indexOf(newTagName) === -1) {
          throw new Error('Cannot change section tagName to "' + newTagName);
        }
        this.tagName = newTagName;
      }
    }, {
      key: 'resetTagName',
      value: function resetTagName() {
        this.tagName = DEFAULT_TAG_NAME;
      }

      /**
       * Splits the marker at the offset, filters empty markers from the result,
       * and replaces this marker with the new non-empty ones
       * @param {Marker} marker the marker to split
       * @return {Array} the new markers that replaced `marker`
       */
    }, {
      key: 'splitMarker',
      value: function splitMarker(marker, offset) {
        var endOffset = arguments.length <= 2 || arguments[2] === undefined ? marker.length : arguments[2];
        return (function () {
          var newMarkers = (0, _contentKitEditorUtilsArrayUtils.filter)(marker.split(offset, endOffset), function (m) {
            return !m.isEmpty;
          });
          this.markers.splice(marker, 1, newMarkers);
          return newMarkers;
        }).apply(this, arguments);
      }
    }, {
      key: 'splitAtMarker',
      value: function splitAtMarker(marker) {
        var offset = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
        var beforeSection = this.builder.createMarkupSection(this.tagName, []);
        var afterSection = this.builder.createMarkupSection(this.tagName, []);

        var currentSection = beforeSection;
        (0, _contentKitEditorUtilsArrayUtils.forEach)(this.markers, function (m) {
          if (m === marker) {
            var _marker$split = marker.split(offset);

            var _marker$split2 = _toArray(_marker$split);

            var beforeMarker = _marker$split2[0];

            var afterMarkers = _marker$split2.slice(1);

            beforeSection.markers.append(beforeMarker);
            (0, _contentKitEditorUtilsArrayUtils.forEach)(afterMarkers, function (_m) {
              return afterSection.markers.append(_m);
            });
            currentSection = afterSection;
          } else {
            currentSection.markers.append(m.clone());
          }
        });

        beforeSection.coalesceMarkers();
        afterSection.coalesceMarkers();

        return [beforeSection, afterSection];
      }

      /**
       * Remove extranous empty markers, adding one at the end if there
       * are no longer any markers
       *
       * Mutates this section's markers
       */
    }, {
      key: 'coalesceMarkers',
      value: function coalesceMarkers() {
        var _this2 = this;

        (0, _contentKitEditorUtilsArrayUtils.forEach)(this.markers, function (m) {
          if (m.isEmpty) {
            _this2.markers.remove(m);
          }
        });
        if (this.markers.isEmpty) {
          this.markers.append(this.builder.createBlankMarker());
        }
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

        left = middle.prev ? this.markers.readRange(null, middle.prev) : [];
        right = middle.next ? this.markers.readRange(middle.next, null) : [];

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
        var _this3 = this;

        otherSection.markers.forEach(function (m) {
          _this3.markers.append(m.clone());
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

        var length = 0;
        var lastMarker = null;

        if (offset === 0) {
          return this.markers.head;
        }

        this.markers.detect(function (marker) {
          if (length < offset) {
            lastMarker = marker;
            length += marker.length;
            return false;
          } else {
            return true; // stop iteration
          }
        });

        if (length > offset) {
          return lastMarker;
        } else if (length === offset) {
          return leftInclusive ? lastMarker.next : lastMarker;
        }
      }
    }, {
      key: 'tagName',
      set: function set(val) {
        this._tagName = (0, _contentKitEditorUtilsDomUtils.normalizeTagName)(val);
      },
      get: function get() {
        return this._tagName;
      }
    }, {
      key: 'isEmpty',
      get: function get() {
        return this.markers.isEmpty;
      }
    }]);

    return Section;
  })(_contentKitEditorUtilsLinkedItem['default']);

  exports['default'] = Section;
});
define('content-kit-editor/models/markup', ['exports', 'content-kit-editor/utils/dom-utils'], function (exports, _contentKitEditorUtilsDomUtils) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var MARKUP_TYPE = 'markup';
  exports.MARKUP_TYPE = MARKUP_TYPE;
  var VALID_MARKUP_TAGNAMES = ['b', 'i', 'strong', 'em', 'a', 'li'].map(_contentKitEditorUtilsDomUtils.normalizeTagName);

  exports.VALID_MARKUP_TAGNAMES = VALID_MARKUP_TAGNAMES;

  var Markup = (function () {
    /*
     * @param {attributes} array flat array of key1,value1,key2,value2,...
     */

    function Markup(tagName) {
      var attributes = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

      _classCallCheck(this, Markup);

      this.tagName = (0, _contentKitEditorUtilsDomUtils.normalizeTagName)(tagName);
      this.attributes = attributes;
      this.type = MARKUP_TYPE;

      if (VALID_MARKUP_TAGNAMES.indexOf(this.tagName) === -1) {
        throw new Error('Cannot create markup of tagName ' + tagName);
      }
    }

    _createClass(Markup, null, [{
      key: 'isValidElement',
      value: function isValidElement(element) {
        var tagName = (0, _contentKitEditorUtilsDomUtils.normalizeTagName)(element.tagName);
        return VALID_MARKUP_TAGNAMES.indexOf(tagName) !== -1;
      }
    }]);

    return Markup;
  })();

  exports['default'] = Markup;
});
define('content-kit-editor/models/post-node-builder', ['exports', 'content-kit-editor/models/post', 'content-kit-editor/models/markup-section', 'content-kit-editor/models/image', 'content-kit-editor/models/marker', 'content-kit-editor/models/markup', 'content-kit-editor/models/card', 'content-kit-editor/utils/dom-utils'], function (exports, _contentKitEditorModelsPost, _contentKitEditorModelsMarkupSection, _contentKitEditorModelsImage, _contentKitEditorModelsMarker, _contentKitEditorModelsMarkup, _contentKitEditorModelsCard, _contentKitEditorUtilsDomUtils) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var PostNodeBuilder = (function () {
    function PostNodeBuilder() {
      _classCallCheck(this, PostNodeBuilder);

      this.markupCache = {};
    }

    _createClass(PostNodeBuilder, [{
      key: 'createPost',
      value: function createPost() {
        var post = new _contentKitEditorModelsPost['default']();
        post.builder = this;
        return post;
      }
    }, {
      key: 'createMarkupSection',
      value: function createMarkupSection(tagName) {
        var markers = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
        var isGenerated = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

        tagName = (0, _contentKitEditorUtilsDomUtils.normalizeTagName)(tagName);
        var section = new _contentKitEditorModelsMarkupSection['default'](tagName, markers);
        if (isGenerated) {
          section.isGenerated = true;
        }
        section.builder = this;
        return section;
      }
    }, {
      key: 'createImageSection',
      value: function createImageSection(url) {
        var section = new _contentKitEditorModelsImage['default']();
        if (url) {
          section.src = url;
        }
        return section;
      }
    }, {
      key: 'createCardSection',
      value: function createCardSection(name) {
        var payload = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        return new _contentKitEditorModelsCard['default'](name, payload);
      }
    }, {
      key: 'createMarker',
      value: function createMarker(value) {
        var markups = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

        var marker = new _contentKitEditorModelsMarker['default'](value, markups);
        marker.builder = this;
        return marker;
      }
    }, {
      key: 'createBlankMarker',
      value: function createBlankMarker() {
        var marker = new _contentKitEditorModelsMarker['default']('');
        marker.builder = this;
        return marker;
      }
    }, {
      key: 'createMarkup',
      value: function createMarkup(tagName, attributes) {
        tagName = (0, _contentKitEditorUtilsDomUtils.normalizeTagName)(tagName);

        var markup = undefined;

        if (attributes) {
          // FIXME: This could also be cached
          markup = new _contentKitEditorModelsMarkup['default'](tagName, attributes);
        } else {
          if (this.markupCache[tagName]) {
            markup = this.markupCache[tagName];
          } else {
            markup = new _contentKitEditorModelsMarkup['default'](tagName, attributes);
          }
        }

        markup.builder = this;
        return markup;
      }
    }]);

    return PostNodeBuilder;
  })();

  exports['default'] = PostNodeBuilder;
});
define("content-kit-editor/models/post", ["exports", "content-kit-editor/utils/linked-list"], function (exports, _contentKitEditorUtilsLinkedList) {
  "use strict";

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var POST_TYPE = 'post';
  exports.POST_TYPE = POST_TYPE;

  var Post = (function () {
    function Post() {
      _classCallCheck(this, Post);

      this.type = POST_TYPE;
      this.sections = new _contentKitEditorUtilsLinkedList["default"]({
        adoptItem: function adoptItem(section) {
          section.post = this;
        },
        freeItem: function freeItem(section) {
          section.post = null;
        }
      });
    }

    _createClass(Post, [{
      key: "cutMarkers",
      value: function cutMarkers(markers) {
        var _this = this;

        var firstSection = markers[0].section,
            lastSection = markers[markers.length - 1].section;

        var currentSection = firstSection;
        var removedSections = [],
            changedSections = [firstSection, lastSection];

        var previousMarker = markers[0].prev;

        markers.forEach(function (marker) {
          if (marker.section !== currentSection) {
            // this marker is in a section we haven't seen yet
            if (marker.section !== firstSection && marker.section !== lastSection) {
              // section is wholly contained by markers, and can be removed
              removedSections.push(marker.section);
            }
          }

          currentSection = marker.section;
          currentSection.markers.remove(marker);
        });

        // add a blank marker to any sections that are now empty
        changedSections.forEach(function (section) {
          if (section.isEmpty) {
            section.markers.append(_this.builder.createBlankMarker());
          }
        });

        var currentMarker = undefined,
            currentOffset = undefined;

        if (previousMarker) {
          currentMarker = previousMarker;
          currentOffset = currentMarker.length;
        } else {
          currentMarker = firstSection.markers.head;
          currentOffset = 0;
        }

        if (firstSection !== lastSection) {
          firstSection.join(lastSection);
          removedSections.push(lastSection);
        }

        return { changedSections: changedSections, removedSections: removedSections, currentMarker: currentMarker, currentOffset: currentOffset };
      }

      /**
       * Invoke `callbackFn` for all markers between the startMarker and endMarker (inclusive),
       * across sections
       */
    }, {
      key: "markersFrom",
      value: function markersFrom(startMarker, endMarker, callbackFn) {
        var currentMarker = startMarker;
        while (currentMarker) {
          callbackFn(currentMarker);

          if (currentMarker === endMarker) {
            currentMarker = null;
          } else if (currentMarker.next) {
            currentMarker = currentMarker.next;
          } else {
            var nextSection = currentMarker.section.next;
            currentMarker = nextSection.markers.head;
          }
        }
      }
    }]);

    return Post;
  })();

  exports["default"] = Post;
});
define("content-kit-editor/models/render-node", ["exports", "content-kit-editor/utils/linked-item", "content-kit-editor/utils/linked-list"], function (exports, _contentKitEditorUtilsLinkedItem, _contentKitEditorUtilsLinkedList) {
  "use strict";

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var RenderNode = (function (_LinkedItem) {
    _inherits(RenderNode, _LinkedItem);

    function RenderNode(postNode) {
      _classCallCheck(this, RenderNode);

      _get(Object.getPrototypeOf(RenderNode.prototype), "constructor", this).call(this);
      this.parent = null;
      this.isDirty = true;
      this.isRemoved = false;
      this.postNode = postNode;
      this._childNodes = null;
    }

    _createClass(RenderNode, [{
      key: "scheduleForRemoval",
      value: function scheduleForRemoval() {
        this.isRemoved = true;
        if (this.parent) {
          this.parent.markDirty();
        }
      }
    }, {
      key: "markDirty",
      value: function markDirty() {
        this.isDirty = true;
        if (this.parent) {
          this.parent.markDirty();
        }
      }
    }, {
      key: "markClean",
      value: function markClean() {
        this.isDirty = false;
      }
    }, {
      key: "childNodes",
      get: function get() {
        var _this = this;

        if (!this._childNodes) {
          this._childNodes = new _contentKitEditorUtilsLinkedList["default"]({
            adoptItem: function adoptItem(item) {
              item.parent = _this;
              item.renderTree = _this.renderTree;
            },
            freeItem: function freeItem(item) {
              item.parent = null;
              item.renderTree = null;
            }
          });
        }
        return this._childNodes;
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
  })(_contentKitEditorUtilsLinkedItem["default"]);

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
define('content-kit-editor/parsers/dom', ['exports', 'content-kit-utils', 'content-kit-editor/models/markup-section', 'content-kit-editor/models/markup', 'content-kit-editor/utils/dom-utils'], function (exports, _contentKitUtils, _contentKitEditorModelsMarkupSection, _contentKitEditorModelsMarkup, _contentKitEditorUtilsDomUtils) {
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

  /**
   * @return {array} attributes as key1,value1,key2,value2,etc
   */
  function readAttributes(node) {
    var attributes = [];

    if (node.hasAttributes()) {
      var i, l;
      for (i = 0, l = node.attributes.length; i < l; i++) {
        if (ALLOWED_ATTRIBUTES.indexOf(node.attributes[i].name) !== -1) {
          attributes.push(node.attributes[i].name);
          attributes.push(node.attributes[i].value);
        }
      }
    }

    return sortAttributes(attributes);
  }

  function isValidMarkerElement(element) {
    var tagName = (0, _contentKitEditorUtilsDomUtils.normalizeTagName)(element.tagName);
    return _contentKitEditorModelsMarkup.VALID_MARKUP_TAGNAMES.indexOf(tagName) !== -1;
  }

  function parseMarkers(section, builder, topNode) {
    var markups = [];
    var text = null;
    var currentNode = topNode;
    while (currentNode) {
      switch (currentNode.nodeType) {
        case ELEMENT_NODE:
          if (isValidMarkerElement(currentNode)) {
            markups.push(builder.createMarkup(currentNode.tagName, readAttributes(currentNode)));
          }
          break;
        case TEXT_NODE:
          text = (text || '') + currentNode.textContent;
          break;
      }

      if (currentNode.firstChild) {
        if (isValidMarkerElement(currentNode) && text !== null) {
          section.markers.append(builder.createMarker(text, markups.slice()));
          text = null;
        }
        currentNode = currentNode.firstChild;
      } else if (currentNode.nextSibling) {
        if (currentNode === topNode) {
          section.markers.append(builder.createMarker(text, markups.slice()));
          break;
        } else {
          currentNode = currentNode.nextSibling;
          if (currentNode.nodeType === ELEMENT_NODE && isValidMarkerElement(currentNode) && text !== null) {
            section.markers.append(builder.createMarker(text, markups.slice()));
            text = null;
          }
        }
      } else {
        section.markers.append(builder.createMarker(text, markups.slice()));

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

  function NewHTMLParser(builder) {
    this.builder = builder;
  }

  NewHTMLParser.prototype = {
    parseSection: function parseSection(previousSection, sectionElement) {
      var builder = this.builder;
      var section;
      switch (sectionElement.nodeType) {
        case ELEMENT_NODE:
          var tagName = (0, _contentKitEditorUtilsDomUtils.normalizeTagName)(sectionElement.tagName);
          // <p> <h2>, etc
          if (_contentKitEditorModelsMarkupSection.VALID_MARKUP_SECTION_TAGNAMES.indexOf(tagName) !== -1) {
            section = builder.createMarkupSection(tagName);
            var node = sectionElement.firstChild;
            while (node) {
              parseMarkers(section, builder, node);
              node = node.nextSibling;
            }
            // <strong> <b>, etc
          } else {
              if (previousSection && previousSection.isGenerated) {
                section = previousSection;
              } else {
                section = builder.createMarkupSection('P', [], true);
              }
              parseMarkers(section, builder, sectionElement);
            }
          break;
        case TEXT_NODE:
          if (previousSection && previousSection.isGenerated) {
            section = previousSection;
          } else {
            section = builder.createMarkupSection('P', [], true);
          }
          parseMarkers(section, builder, sectionElement);
          break;
      }
      return section;
    },
    parse: function parse(postElement) {
      var post = this.builder.createPost();
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
            post.sections.append(section);
            previousSection = section;
          }
        }
      }
      return post;
    }
  };

  exports['default'] = NewHTMLParser;
});
define("content-kit-editor/parsers/mobiledoc", ["exports"], function (exports) {
  "use strict";

  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var CARD_SECTION_TYPE = 10;
  var IMAGE_SECTION_TYPE = 2;

  /*
   * input mobiledoc: [ markers, elements ]
   * output: Post
   *
   */

  var MobiledocParser = (function () {
    function MobiledocParser(builder) {
      _classCallCheck(this, MobiledocParser);

      this.builder = builder;
    }

    _createClass(MobiledocParser, [{
      key: "parse",
      value: function parse(_ref) {
        var version = _ref.version;
        var sectionData = _ref.sections;

        var markerTypes = sectionData[0];
        var sections = sectionData[1];

        var post = this.builder.createPost();

        this.markups = [];
        this.markerTypes = this.parseMarkerTypes(markerTypes);
        this.parseSections(sections, post);

        return post;
      }
    }, {
      key: "parseMarkerTypes",
      value: function parseMarkerTypes(markerTypes) {
        var _this = this;

        return markerTypes.map(function (markerType) {
          return _this.parseMarkerType(markerType);
        });
      }
    }, {
      key: "parseMarkerType",
      value: function parseMarkerType(_ref2) {
        var _ref22 = _slicedToArray(_ref2, 2);

        var tagName = _ref22[0];
        var attributes = _ref22[1];

        return this.builder.createMarkup(tagName, attributes);
      }
    }, {
      key: "parseSections",
      value: function parseSections(sections, post) {
        var _this2 = this;

        sections.forEach(function (section) {
          return _this2.parseSection(section, post);
        });
      }
    }, {
      key: "parseSection",
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
            throw new Error("Unexpected section type " + type);
        }
      }
    }, {
      key: "parseCardSection",
      value: function parseCardSection(_ref3, post) {
        var _ref32 = _slicedToArray(_ref3, 3);

        var type = _ref32[0];
        var name = _ref32[1];
        var payload = _ref32[2];

        var section = this.builder.createCardSection(name, payload);
        post.sections.append(section);
      }
    }, {
      key: "parseImageSection",
      value: function parseImageSection(_ref4, post) {
        var _ref42 = _slicedToArray(_ref4, 2);

        var type = _ref42[0];
        var src = _ref42[1];

        var section = this.builder.createImageSection(src);
        post.sections.append(section);
      }
    }, {
      key: "parseMarkupSection",
      value: function parseMarkupSection(_ref5, post) {
        var _ref52 = _slicedToArray(_ref5, 3);

        var type = _ref52[0];
        var tagName = _ref52[1];
        var markers = _ref52[2];

        var section = this.builder.createMarkupSection(tagName);
        post.sections.append(section);
        this.parseMarkers(markers, section);
      }
    }, {
      key: "parseMarkers",
      value: function parseMarkers(markers, section) {
        var _this3 = this;

        markers.forEach(function (marker) {
          return _this3.parseMarker(marker, section);
        });
      }
    }, {
      key: "parseMarker",
      value: function parseMarker(_ref6, section) {
        var _this4 = this;

        var _ref62 = _slicedToArray(_ref6, 3);

        var markerTypeIndexes = _ref62[0];
        var closeCount = _ref62[1];
        var value = _ref62[2];

        markerTypeIndexes.forEach(function (index) {
          _this4.markups.push(_this4.markerTypes[index]);
        });
        var marker = this.builder.createMarker(value, this.markups.slice());
        section.markers.append(marker);
        this.markups = this.markups.slice(0, this.markups.length - closeCount);
      }
    }]);

    return MobiledocParser;
  })();

  exports["default"] = MobiledocParser;
});
define('content-kit-editor/parsers/post', ['exports', 'content-kit-editor/models/markup-section', 'content-kit-editor/parsers/section', 'content-kit-editor/utils/array-utils', 'content-kit-editor/utils/dom-utils', 'content-kit-editor/renderers/editor-dom', 'content-kit-editor/models/markup'], function (exports, _contentKitEditorModelsMarkupSection, _contentKitEditorParsersSection, _contentKitEditorUtilsArrayUtils, _contentKitEditorUtilsDomUtils, _contentKitEditorRenderersEditorDom, _contentKitEditorModelsMarkup) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var sanitizeTextRegex = new RegExp(_contentKitEditorRenderersEditorDom.UNPRINTABLE_CHARACTER, 'g');

  function sanitizeText(text) {
    return text.replace(sanitizeTextRegex, '');
  }

  var PostParser = (function () {
    function PostParser(builder) {
      _classCallCheck(this, PostParser);

      this.builder = builder;
      this.sectionParser = new _contentKitEditorParsersSection['default'](this.builder);
    }

    _createClass(PostParser, [{
      key: 'parse',
      value: function parse(element) {
        var _this = this;

        var post = this.builder.createPost();

        (0, _contentKitEditorUtilsArrayUtils.forEach)(element.childNodes, function (child) {
          post.sections.append(_this.sectionParser.parse(child));
        });

        return post;
      }
    }, {
      key: 'parseSection',
      value: function parseSection(element, otherArg) {
        if (!!otherArg) {
          element = otherArg; // hack to deal with passed previousSection
        }
        return this.sectionParser.parse(element);
      }

      // FIXME should move to the section parser?
      // FIXME the `collectMarkups` logic could simplify the section parser?
    }, {
      key: 'reparseSection',
      value: function reparseSection(section, renderTree) {
        var _this2 = this;

        if (section.type !== _contentKitEditorModelsMarkupSection.MARKUP_SECTION_TYPE) {
          // can only reparse markup sections
          return;
        }
        var sectionElement = section.renderNode.element;

        // Turn an element node into a markup
        var markupFromNode = function markupFromNode(node) {
          if (_contentKitEditorModelsMarkup['default'].isValidElement(node)) {
            var tagName = node.tagName;
            var attributes = (0, _contentKitEditorUtilsDomUtils.getAttributesArray)(node);

            return _this2.builder.createMarkup(tagName, attributes);
          }
        };

        // walk up from the textNode until the rootNode, converting each
        // parentNode into a markup
        var collectMarkups = function collectMarkups(textNode, rootNode) {
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
        };

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
            marker = _this2.builder.createMarker(text, markups);

            // create a cleaned render node to account for the fact that this
            // render node comes from already-displayed DOM
            // FIXME this should be cleaner
            renderNode = renderTree.buildRenderNode(marker);
            renderNode.element = textNode;
            renderNode.markClean();

            if (previousMarker) {
              // insert this marker after the previous one
              section.markers.insertAfter(marker, previousMarker);
              section.renderNode.childNodes.insertAfter(renderNode, previousMarker.renderNode);
            } else {
              // insert marker at the beginning of the section
              section.markers.prepend(marker);
              section.renderNode.childNodes.insertAfter(renderNode, null);
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

        // remove any nodes that were not marked as seen
        var renderNode = section.renderNode.firstChild;
        while (renderNode) {
          if (seenRenderNodes.indexOf(renderNode) === -1) {
            // remove it
            renderNode.scheduleForRemoval();
          }

          renderNode = renderNode.next;
        }
      }
    }]);

    return PostParser;
  })();

  exports['default'] = PostParser;
});
define('content-kit-editor/parsers/section', ['exports', 'content-kit-editor/models/markup-section', 'content-kit-editor/models/markup', 'content-kit-editor/utils/dom-utils', 'content-kit-editor/utils/array-utils'], function (exports, _contentKitEditorModelsMarkupSection, _contentKitEditorModelsMarkup, _contentKitEditorUtilsDomUtils, _contentKitEditorUtilsArrayUtils) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var TEXT_NODE = 3;
  var ELEMENT_NODE = 1;

  /**
   * parses an element into a section, ignoring any non-markup
   * elements contained within
   * @return {Section}
   */

  var SectionParser = (function () {
    function SectionParser(builder) {
      _classCallCheck(this, SectionParser);

      this.builder = builder;
    }

    _createClass(SectionParser, [{
      key: 'parse',
      value: function parse(element) {
        var _this = this;

        var tagName = this.sectionTagNameFromElement(element);
        var section = this.builder.createMarkupSection(tagName);
        var state = { section: section, markups: [], text: '' };

        (0, _contentKitEditorUtilsArrayUtils.forEach)(element.childNodes, function (el) {
          _this.parseNode(el, state);
        });

        // close a trailing text nodes if it exists
        if (state.text.length) {
          var marker = this.builder.createMarker(state.text, state.markups);
          state.section.markers.append(marker);
        }

        if (section.markers.length === 0) {
          section.markers.append(this.builder.createBlankMarker());
        }

        return section;
      }
    }, {
      key: 'parseNode',
      value: function parseNode(node, state) {
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
      }
    }, {
      key: 'parseElementNode',
      value: function parseElementNode(element, state) {
        var _this2 = this;

        var markup = this.markupFromElement(element);
        if (markup) {
          if (state.text.length) {
            // close previous text marker
            var marker = this.builder.createMarker(state.text, state.markups);
            state.section.markers.append(marker);
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
          var marker = this.builder.createMarker(state.text, state.markups);
          state.section.markers.append(marker);
          state.markups.pop();
          state.text = '';
        }
      }
    }, {
      key: 'parseTextNode',
      value: function parseTextNode(textNode, state) {
        state.text += textNode.textContent;
      }
    }, {
      key: 'isSectionElement',
      value: function isSectionElement(element) {
        return element.nodeType === ELEMENT_NODE && _contentKitEditorModelsMarkupSection.VALID_MARKUP_SECTION_TAGNAMES.indexOf((0, _contentKitEditorUtilsDomUtils.normalizeTagName)(element.tagName)) !== -1;
      }
    }, {
      key: 'markupFromElement',
      value: function markupFromElement(element) {
        var tagName = (0, _contentKitEditorUtilsDomUtils.normalizeTagName)(element.tagName);
        if (_contentKitEditorModelsMarkup.VALID_MARKUP_TAGNAMES.indexOf(tagName) === -1) {
          return null;
        }

        return this.builder.createMarkup(tagName, (0, _contentKitEditorUtilsDomUtils.getAttributes)(element));
      }
    }, {
      key: 'sectionTagNameFromElement',
      value: function sectionTagNameFromElement(element) {
        var tagName = element.tagName;
        tagName = tagName && (0, _contentKitEditorUtilsDomUtils.normalizeTagName)(tagName);
        if (_contentKitEditorModelsMarkupSection.VALID_MARKUP_SECTION_TAGNAMES.indexOf(tagName) === -1) {
          tagName = _contentKitEditorModelsMarkupSection.DEFAULT_TAG_NAME;
        }
        return tagName;
      }
    }]);

    return SectionParser;
  })();

  exports['default'] = SectionParser;
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

  function renderMarkupSection(section) {
    var element = document.createElement(section.tagName);
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

    while (closedCount--) {
      element = element.parentNode;
    }
    return element;
  }

  function renderMarker(marker, element, previousRenderNode) {
    var text = marker.value;
    if (isEmptyText(text)) {
      // This is necessary to allow the cursor to move into this area
      text = UNPRINTABLE_CHARACTER;
    }

    var textNode = document.createTextNode(text);
    var currentElement = textNode;
    var markup = undefined;

    var openTypes = marker.openedMarkups;
    for (var j = openTypes.length - 1; j >= 0; j--) {
      markup = openTypes[j];
      var openedElement = createElementFromMarkup(document, markup);
      openedElement.appendChild(currentElement);
      currentElement = openedElement;
    }

    if (previousRenderNode) {
      var previousSibling = previousRenderNode.element;
      var previousSiblingPenultimate = penultimateParentOf(previousSibling, element);
      element.insertBefore(currentElement, previousSiblingPenultimate.nextSibling);
    } else {
      element.insertBefore(currentElement, element.firstChild);
    }

    return textNode;
  }

  var Visitor = (function () {
    function Visitor(editor, cards, unknownCardHandler, options) {
      _classCallCheck(this, Visitor);

      this.editor = editor;
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
        var originalElement = renderNode.element;
        var hasRendered = !!originalElement;

        // Always rerender the section -- its tag name or attributes may have changed.
        // TODO make this smarter, only rerendering and replacing the element when necessary
        var element = renderMarkupSection(section);
        renderNode.element = element;

        if (!hasRendered) {
          var _element = renderNode.element;

          if (renderNode.prev) {
            var previousElement = renderNode.prev.element;
            var parentNode = previousElement.parentNode;
            parentNode.insertBefore(_element, previousElement.nextSibling);
          } else {
            var parentElement = renderNode.parent.element;
            parentElement.insertBefore(_element, parentElement.firstChild);
          }
        } else {
          renderNode.parent.element.replaceChild(element, originalElement);
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

        if (renderNode.prev) {
          parentElement = getNextMarkerElement(renderNode.prev);
        } else {
          parentElement = renderNode.parent.element;
        }
        var textNode = renderMarker(marker, parentElement, renderNode.prev);

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
      key: _contentKitEditorModelsCard.CARD_TYPE,
      value: function value(renderNode, section) {
        var editor = this.editor;
        var options = this.options;

        var card = (0, _contentKitEditorUtilsArrayUtils.detect)(this.cards, function (card) {
          return card.name === section.name;
        });

        var env = { name: section.name };
        var element = document.createElement('div');
        element.contentEditable = 'false';
        renderNode.element = element;
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

        if (card) {
          var cardNode = new _contentKitEditorModelsCardNode["default"](editor, card, section, renderNode.element, options);
          renderNode.cardNode = cardNode;
          cardNode.display();
        } else {
          this.unknownCardHandler(renderNode.element, options, env, section.payload);
        }
      }
    }]);

    return Visitor;
  })();

  var destroyHooks = (_destroyHooks = {}, _defineProperty(_destroyHooks, _contentKitEditorModelsPost.POST_TYPE, function () /*renderNode, post*/{
    throw new Error('post destruction is not supported by the renderer');
  }), _defineProperty(_destroyHooks, _contentKitEditorModelsMarkupSection.MARKUP_SECTION_TYPE, function (renderNode, section) {
    var post = renderNode.parent.postNode;
    post.sections.remove(section);
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

    if (marker.section) {
      marker.section.markers.remove(marker);
    }

    if (element.parentNode) {
      // if no parentNode, the browser already removed this element
      element.parentNode.removeChild(element);
    }
  }), _defineProperty(_destroyHooks, _contentKitEditorModelsImage.IMAGE_SECTION_TYPE, function (renderNode, section) {
    var post = renderNode.parent.postNode;
    post.sections.remove(section);
    renderNode.element.parentNode.removeChild(renderNode.element);
  }), _defineProperty(_destroyHooks, _contentKitEditorModelsCard.CARD_TYPE, function (renderNode, section) {
    if (renderNode.cardNode) {
      renderNode.cardNode.teardown();
    }
    var post = renderNode.parent.postNode;
    post.sections.remove(section);
    renderNode.element.parentNode.removeChild(renderNode.element);
  }), _destroyHooks);

  // removes children from parentNode that are scheduled for removal
  function removeChildren(parentNode) {
    var child = parentNode.childNodes.head;
    while (child) {
      var nextChild = child.next;
      if (child.isRemoved) {
        destroyHooks[child.postNode.type](child, child.postNode);
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
      var renderNode = new _contentKitEditorModelsRenderNode["default"](postNode);
      parentNode.childNodes.insertAfter(renderNode, previousNode);
      postNode.renderNode = renderNode;
      return renderNode;
    }
  }

  var Renderer = (function () {
    function Renderer(editor, cards, unknownCardHandler, options) {
      _classCallCheck(this, Renderer);

      this.editor = editor;
      this.visitor = new Visitor(editor, cards, unknownCardHandler, options);
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

  function any(array, callback) {
    for (var i = 0; i < array.length; i++) {
      if (callback(array[i])) {
        return true;
      }
    }

    return false;
  }

  /**
   * Useful for array-like things that aren't
   * actually arrays, like NodeList
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

  exports.detect = detect;
  exports.forEach = forEach;
  exports.any = any;
  exports.filter = filter;
  exports.commonItemLength = commonItemLength;
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
    nodes.forEach(function (node) {
      visit(visitor, node, opcodes);
    });
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

  function addClassName(element, className) {
    // FIXME-IE IE10+
    element.classList.add(className);
  }

  function normalizeTagName(tagName) {
    return tagName.toLowerCase();
  }

  exports.detectParentNode = detectParentNode;
  exports.containsNode = containsNode;
  exports.clearChildNodes = clearChildNodes;
  exports.getAttributes = getAttributes;
  exports.getAttributesArray = getAttributesArray;
  exports.walkDOMUntil = walkDOMUntil;
  exports.walkTextNodes = walkTextNodes;
  exports.addClassName = addClassName;
  exports.normalizeTagName = normalizeTagName;
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
define('content-kit-editor/utils/element-utils', ['exports', 'content-kit-editor/renderers/editor-dom', 'content-kit-editor/utils/string-utils', 'content-kit-editor/utils/dom-utils'], function (exports, _contentKitEditorRenderersEditorDom, _contentKitEditorUtilsStringUtils, _contentKitEditorUtilsDomUtils) {
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

  function getEventTargetMatchingTag(tagName, target, container) {
    tagName = (0, _contentKitEditorUtilsDomUtils.normalizeTagName)(tagName);
    // Traverses up DOM from an event target to find the node matching specifed tag
    while (target && target !== container) {
      if ((0, _contentKitEditorUtilsDomUtils.normalizeTagName)(target.tagName) === tagName) {
        return target;
      }
      target = target.parentNode;
    }
  }

  function elementContentIsEmpty(element) {
    if (!element.firstChild) {
      return true;
    } else if (element.childNodes.length === 1 && element.firstChild.textContent === _contentKitEditorRenderersEditorDom.UNPRINTABLE_CHARACTER) {
      return true;
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

  exports.FileUploader = FileUploader;
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
define("content-kit-editor/utils/linked-item", ["exports"], function (exports) {
  "use strict";

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var LinkedItem = function LinkedItem() {
    _classCallCheck(this, LinkedItem);

    this.next = null;
    this.prev = null;
  };

  exports["default"] = LinkedItem;
});
define("content-kit-editor/utils/linked-list", ["exports"], function (exports) {
  "use strict";

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var LinkedList = (function () {
    function LinkedList(options) {
      _classCallCheck(this, LinkedList);

      this.head = null;
      this.tail = null;
      this.length = 0;
      if (options) {
        var adoptItem = options.adoptItem;
        var freeItem = options.freeItem;

        this.adoptItem = adoptItem;
        this.freeItem = freeItem;
      }
    }

    _createClass(LinkedList, [{
      key: "prepend",
      value: function prepend(item) {
        this.insertBefore(item, this.head);
      }
    }, {
      key: "append",
      value: function append(item) {
        this.insertBefore(item, null);
      }
    }, {
      key: "insertAfter",
      value: function insertAfter(item, prevItem) {
        var nextItem = null;
        if (prevItem) {
          nextItem = prevItem.next;
        } else {
          nextItem = this.head;
        }
        this.insertBefore(item, nextItem);
      }
    }, {
      key: "insertBefore",
      value: function insertBefore(item, nextItem) {
        this.remove(item);
        if (this.adoptItem) {
          this.adoptItem(item);
        }
        if (nextItem && nextItem.prev) {
          // middle of the items
          var prevItem = nextItem.prev;
          item.next = nextItem;
          nextItem.prev = item;
          item.prev = prevItem;
          prevItem.next = item;
        } else if (nextItem) {
          // first item
          if (this.head === nextItem) {
            item.next = nextItem;
            nextItem.prev = item;
          } else {
            this.tail = item;
          }
          this.head = item;
        } else {
          // last item
          if (this.tail) {
            item.prev = this.tail;
            this.tail.next = item;
          }
          if (!this.head) {
            this.head = item;
          }
          this.tail = item;
        }
        this.length++;
      }
    }, {
      key: "remove",
      value: function remove(item) {
        if (this.freeItem) {
          this.freeItem(item);
        }
        var didRemove = false;
        if (item.next && item.prev) {
          // Middle of the list
          item.next.prev = item.prev;
          item.prev.next = item.next;
          didRemove = true;
        } else {
          if (item === this.head) {
            // Head of the list
            if (item.next) {
              item.next.prev = null;
            }
            this.head = item.next;
            didRemove = true;
          }
          if (item === this.tail) {
            // Tail of the list
            if (item.prev) {
              item.prev.next = null;
            }
            this.tail = item.prev;
            didRemove = true;
          }
        }
        if (didRemove) {
          this.length--;
        }
        item.prev = null;
        item.next = null;
      }
    }, {
      key: "forEach",
      value: function forEach(callback) {
        var item = this.head;
        var index = 0;
        while (item) {
          callback(item, index);
          index++;
          item = item.next;
        }
      }
    }, {
      key: "readRange",
      value: function readRange(startItem, endItem) {
        var items = [];
        var item = startItem || this.head;
        while (item) {
          items.push(item);
          if (item === endItem) {
            break;
          }
          item = item.next;
        }
        return items;
      }
    }, {
      key: "toArray",
      value: function toArray() {
        return this.readRange();
      }
    }, {
      key: "detect",
      value: function detect(callback) {
        var item = arguments.length <= 1 || arguments[1] === undefined ? this.head : arguments[1];

        while (item) {
          if (callback(item)) {
            return item;
          }
          item = item.next;
        }
      }
    }, {
      key: "objectAt",
      value: function objectAt(targetIndex) {
        var index = -1;
        return this.detect(function () {
          index++;
          return targetIndex === index;
        });
      }
    }, {
      key: "splice",
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
      key: "isEmpty",
      get: function get() {
        return this.length === 0;
      }
    }]);

    return LinkedList;
  })();

  exports["default"] = LinkedList;
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
    var tag = element && (0, _contentKitEditorUtilsDomUtils.normalizeTagName)(element.tagName);
    while (tag && RootTags.indexOf(tag) === -1) {
      if (element.contentEditable === 'true') {
        return null; // Stop traversing up dom when hitting an editor element
      }
      element = element.parentNode;
      tag = element.tagName && (0, _contentKitEditorUtilsDomUtils.normalizeTagName)(element.tagName);
    }
    return element;
  }

  function getSelectionTagName() {
    var element = getSelectionElement();
    return element ? (0, _contentKitEditorUtilsDomUtils.normalizeTagName)(element.tagName) : null;
  }

  function getSelectionBlockTagName() {
    var element = getSelectionBlockElement();
    return element ? element.tagName && (0, _contentKitEditorUtilsDomUtils.normalizeTagName)(element.tagName) : null;
  }

  function tagsInSelection(selection) {
    var element = getSelectionElement(selection);
    var tags = [];
    while (element) {
      if (element.contentEditable === 'true') {
        break;
      } // Stop traversing up dom when hitting an editor element
      if (element.tagName) {
        tags.push((0, _contentKitEditorUtilsDomUtils.normalizeTagName)(element.tagName));
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

  exports.getDirectionOfSelection = getDirectionOfSelection;
  exports.getSelectionElement = getSelectionElement;
  exports.getSelectionBlockElement = getSelectionBlockElement;
  exports.getSelectionTagName = getSelectionTagName;
  exports.getSelectionBlockTagName = getSelectionBlockTagName;
  exports.tagsInSelection = tagsInSelection;
  exports.restoreRange = restoreRange;
  exports.selectNode = selectNode;
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

    this.addEventListener(embedIntent.button, 'click', function (e) {
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
    this.addEventListener(document, 'click', function () {
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
      this.addEventListener(prompt.element, 'click', function (e) {
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
define('content-kit-editor/views/reversible-toolbar-button', ['exports', 'content-kit-editor/utils/mixin', 'content-kit-editor/utils/event-listener'], function (exports, _contentKitEditorUtilsMixin, _contentKitEditorUtilsEventListener) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var ELEMENT_TYPE = 'button';
  var BUTTON_CLASS_NAME = 'ck-toolbar-btn';

  var ReversibleToolbarButton = (function () {
    function ReversibleToolbarButton(command, editor) {
      var _this = this;

      _classCallCheck(this, ReversibleToolbarButton);

      this.command = command;
      this.editor = editor;
      this.element = this.createElement();
      this.active = false;

      this.addEventListener(this.element, 'click', function (e) {
        return _this.handleClick(e);
      });
      this.editor.on('selection', function () {
        return _this.updateActiveState();
      });
      this.editor.on('selectionUpdated', function () {
        return _this.updateActiveState();
      });
      this.editor.on('selectionEnded', function () {
        return _this.updateActiveState();
      });
    }

    // These are here to match the API of the ToolbarButton class

    _createClass(ReversibleToolbarButton, [{
      key: 'setInactive',
      value: function setInactive() {}
    }, {
      key: 'setActive',
      value: function setActive() {}
    }, {
      key: 'handleClick',
      value: function handleClick(e) {
        e.stopPropagation();

        if (this.active) {
          this.command.unexec();
        } else {
          this.command.exec();
        }
      }
    }, {
      key: 'updateActiveState',
      value: function updateActiveState() {
        this.active = this.command.isActive();
      }
    }, {
      key: 'createElement',
      value: function createElement() {
        var element = document.createElement(ELEMENT_TYPE);
        element.className = BUTTON_CLASS_NAME;
        element.innerHTML = this.command.button;
        element.title = this.command.name;
        return element;
      }
    }, {
      key: 'active',
      set: function set(val) {
        this._active = val;
        if (this._active) {
          this.element.className = BUTTON_CLASS_NAME + ' active';
        } else {
          this.element.className = BUTTON_CLASS_NAME;
        }
      },
      get: function get() {
        return this._active;
      }
    }]);

    return ReversibleToolbarButton;
  })();

  (0, _contentKitEditorUtilsMixin['default'])(ReversibleToolbarButton, _contentKitEditorUtilsEventListener['default']);

  exports['default'] = ReversibleToolbarButton;
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
    this.addEventListener(element, 'click', function (e) {
      if (!button.isActive && prompt) {
        toolbar.displayPrompt(prompt);
      } else {
        command.exec();
        toolbar.updateForSelection();
        if (toolbar.embedIntent) {
          toolbar.embedIntent.hide();
        }
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

      (options.buttons || []).forEach(function (b) {
        return _this.addButton(b);
      });
      (options.commands || []).forEach(function (c) {
        return _this.addCommand(c);
      });

      // Closes prompt if displayed when changing selection
      this.addEventListener(document, 'click', function () {
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
        command.editor = this.editor;
        command.embedIntent = this.embedIntent;
        var button = new _contentKitEditorViewsToolbarButton['default']({ command: command, toolbar: this });
        this.addButton(button);
      }
    }, {
      key: 'addButton',
      value: function addButton(button) {
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
require("content-kit-editor")["registerGlobal"](window, document);
})();//# sourceMappingURL=content-kit-editor.map