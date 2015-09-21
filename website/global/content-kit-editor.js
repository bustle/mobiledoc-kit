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
define('content-kit-editor/commands/bold', ['exports', 'content-kit-editor/commands/text-format'], function (exports, _contentKitEditorCommandsTextFormat) {
  'use strict';

  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var BoldCommand = (function (_TextFormatCommand) {
    _inherits(BoldCommand, _TextFormatCommand);

    function BoldCommand(editor) {
      _classCallCheck(this, BoldCommand);

      _get(Object.getPrototypeOf(BoldCommand.prototype), 'constructor', this).call(this, editor, {
        tag: 'strong',
        name: 'bold',
        button: '<i class="ck-icon-bold"></i>'
      });
    }

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

      _get(Object.getPrototypeOf(FormatBlockCommand.prototype), 'constructor', this).call(this, editor, options);
    }

    _createClass(FormatBlockCommand, [{
      key: 'isActive',
      value: function isActive() {
        var _this = this;

        return (0, _contentKitEditorUtilsArrayUtils.any)(this.editor.activeSections, function (s) {
          return s.tagName === _this.tag;
        });
      }
    }, {
      key: 'exec',
      value: function exec() {
        var _this2 = this;

        var editor = this.editor;

        editor.run(function (postEditor) {
          var activeSections = editor.activeSections;
          activeSections.forEach(function (s) {
            return postEditor.changeSectionTagName(s, _this2.tag);
          });
          postEditor.scheduleAfterRender(function () {
            editor.selectSections(activeSections);
          });
        });
      }
    }, {
      key: 'unexec',
      value: function unexec() {
        var editor = this.editor;

        editor.run(function (postEditor) {
          var activeSections = editor.activeSections;
          activeSections.forEach(function (s) {
            return postEditor.resetSectionTagName(s);
          });
          postEditor.scheduleAfterRender(function () {
            editor.selectSections(activeSections);
          });
        });
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
        var beforeSection = this.editor.cursor.offsets.headSection;

        var afterSection = beforeSection.next;
        var section = this.editor.builder.createCardSection('image');
        var collection = beforeSection.parent.sections;

        this.editor.run(function (postEditor) {
          if (beforeSection.isBlank) {
            postEditor.removeSection(beforeSection);
          }
          postEditor.insertSectionBefore(collection, section, afterSection);
        });
      }
    }]);

    return ImageCommand;
  })(_contentKitEditorCommandsBase['default']);

  exports['default'] = ImageCommand;
});
define('content-kit-editor/commands/italic', ['exports', 'content-kit-editor/commands/text-format'], function (exports, _contentKitEditorCommandsTextFormat) {
  'use strict';

  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var ItalicCommand = (function (_TextFormatCommand) {
    _inherits(ItalicCommand, _TextFormatCommand);

    function ItalicCommand(editor) {
      _classCallCheck(this, ItalicCommand);

      _get(Object.getPrototypeOf(ItalicCommand.prototype), 'constructor', this).call(this, editor, {
        tag: 'em',
        name: 'italic',
        button: '<i class="ck-icon-italic"></i>'
      });
    }

    return ItalicCommand;
  })(_contentKitEditorCommandsTextFormat['default']);

  exports['default'] = ItalicCommand;
});
define('content-kit-editor/commands/link', ['exports', 'content-kit-editor/commands/text-format'], function (exports, _contentKitEditorCommandsTextFormat) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var LinkCommand = (function (_TextFormatCommand) {
    _inherits(LinkCommand, _TextFormatCommand);

    function LinkCommand(editor) {
      _classCallCheck(this, LinkCommand);

      _get(Object.getPrototypeOf(LinkCommand.prototype), 'constructor', this).call(this, editor, {
        name: 'link',
        tag: 'a',
        button: '<i class="ck-icon-link"></i>'
      });
    }

    _createClass(LinkCommand, [{
      key: 'exec',
      value: function exec(href) {
        var _this = this;

        this.editor.run(function (postEditor) {
          var markup = postEditor.builder.createMarkup('a', { href: href });
          _this.editor.run(function (postEditor) {
            return postEditor.toggleMarkup(markup);
          });
        });
      }
    }]);

    return LinkCommand;
  })(_contentKitEditorCommandsTextFormat['default']);

  exports['default'] = LinkCommand;
});
define('content-kit-editor/commands/list', ['exports', 'content-kit-editor/commands/text-format'], function (exports, _contentKitEditorCommandsTextFormat) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var ListCommand = (function (_TextFormatCommand) {
    _inherits(ListCommand, _TextFormatCommand);

    function ListCommand(editor, options) {
      _classCallCheck(this, ListCommand);

      _get(Object.getPrototypeOf(ListCommand.prototype), 'constructor', this).call(this, editor, options);
    }

    _createClass(ListCommand, [{
      key: 'isActive',
      value: function isActive() {
        return false;
      }
    }, {
      key: 'exec',
      value: function exec() {
        var _this = this;

        var editor = this.editor;
        var cursor = editor.cursor;
        var currentSection = cursor.offsets.head.section;

        var listItem = editor.run(function (postEditor) {
          var builder = postEditor.builder;

          var tagName = _this.tag;
          var listSection = builder.createListSection(tagName);
          var listItem = builder.createListItem();
          listSection.items.append(listItem);

          postEditor.replaceSection(currentSection, listSection);
          return listItem;
        });

        editor.cursor.moveToSection(listItem);
      }
    }, {
      key: 'unexec',
      value: function unexec() {
        throw new Error('Cannot unexec a ListCommand');
      }
    }]);

    return ListCommand;
  })(_contentKitEditorCommandsTextFormat['default']);

  exports['default'] = ListCommand;
});
define('content-kit-editor/commands/ordered-list', ['exports', 'content-kit-editor/commands/list'], function (exports, _contentKitEditorCommandsList) {
  'use strict';

  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var UnorderedListCommand = (function (_ListCommand) {
    _inherits(UnorderedListCommand, _ListCommand);

    function UnorderedListCommand(editor) {
      _classCallCheck(this, UnorderedListCommand);

      _get(Object.getPrototypeOf(UnorderedListCommand.prototype), 'constructor', this).call(this, editor, {
        name: 'Ordered List',
        tag: 'ol',
        button: '<i>ol</i>'
      });
    }

    return UnorderedListCommand;
  })(_contentKitEditorCommandsList['default']);

  exports['default'] = UnorderedListCommand;
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
define('content-kit-editor/commands/text-format', ['exports', 'content-kit-editor/commands/base', 'content-kit-editor/utils/array-utils'], function (exports, _contentKitEditorCommandsBase, _contentKitEditorUtilsArrayUtils) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var TextFormatCommand = (function (_Command) {
    _inherits(TextFormatCommand, _Command);

    function TextFormatCommand(editor) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      _classCallCheck(this, TextFormatCommand);

      _get(Object.getPrototypeOf(TextFormatCommand.prototype), 'constructor', this).call(this, options);
      this.editor = editor;
      this.tag = options.tag;
    }

    _createClass(TextFormatCommand, [{
      key: 'isActive',
      value: function isActive() {
        var _this = this;

        return (0, _contentKitEditorUtilsArrayUtils.any)(this.editor.markupsInSelection, function (m) {
          return m.hasTag(_this.tag);
        });
      }
    }, {
      key: 'exec',
      value: function exec() {
        var _this2 = this;

        this.editor.run(function (postEditor) {
          return postEditor.toggleMarkup(_this2.tag);
        });
      }
    }, {
      key: 'unexec',
      value: function unexec() {
        var _this3 = this;

        this.editor.run(function (postEditor) {
          return postEditor.toggleMarkup(_this3.tag);
        });
      }
    }]);

    return TextFormatCommand;
  })(_contentKitEditorCommandsBase['default']);

  exports['default'] = TextFormatCommand;
});
define('content-kit-editor/commands/unordered-list', ['exports', 'content-kit-editor/commands/list'], function (exports, _contentKitEditorCommandsList) {
  'use strict';

  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var UnorderedListCommand = (function (_ListCommand) {
    _inherits(UnorderedListCommand, _ListCommand);

    function UnorderedListCommand(editor) {
      _classCallCheck(this, UnorderedListCommand);

      _get(Object.getPrototypeOf(UnorderedListCommand.prototype), 'constructor', this).call(this, editor, {
        name: 'Unordered List',
        tag: 'ul',
        button: '<i>ul</i>'
      });
    }

    return UnorderedListCommand;
  })(_contentKitEditorCommandsList['default']);

  exports['default'] = UnorderedListCommand;
});
define('content-kit-editor/editor/editor', ['exports', 'content-kit-editor/views/text-format-toolbar', 'content-kit-editor/views/tooltip', 'content-kit-editor/views/embed-intent', 'content-kit-editor/editor/post', 'content-kit-editor/cards/image', 'content-kit-editor/utils/key', 'content-kit-editor/utils/event-emitter', 'content-kit-editor/parsers/mobiledoc', 'content-kit-editor/parsers/post', 'content-kit-editor/parsers/dom', 'content-kit-editor/renderers/editor-dom', 'content-kit-editor/models/render-tree', 'content-kit-editor/renderers/mobiledoc', 'content-kit-utils', 'content-kit-editor/utils/dom-utils', 'content-kit-editor/utils/array-utils', 'content-kit-editor/utils/element-utils', 'content-kit-editor/utils/mixin', 'content-kit-editor/utils/event-listener', 'content-kit-editor/utils/cursor', 'content-kit-editor/models/post-node-builder', 'content-kit-editor/editor/text-expansions', 'content-kit-editor/editor/key-commands', 'content-kit-editor/utils/string-utils'], function (exports, _contentKitEditorViewsTextFormatToolbar, _contentKitEditorViewsTooltip, _contentKitEditorViewsEmbedIntent, _contentKitEditorEditorPost, _contentKitEditorCardsImage, _contentKitEditorUtilsKey, _contentKitEditorUtilsEventEmitter, _contentKitEditorParsersMobiledoc, _contentKitEditorParsersPost, _contentKitEditorParsersDom, _contentKitEditorRenderersEditorDom, _contentKitEditorModelsRenderTree, _contentKitEditorRenderersMobiledoc, _contentKitUtils, _contentKitEditorUtilsDomUtils, _contentKitEditorUtilsArrayUtils, _contentKitEditorUtilsElementUtils, _contentKitEditorUtilsMixin, _contentKitEditorUtilsEventListener, _contentKitEditorUtilsCursor, _contentKitEditorModelsPostNodeBuilder, _contentKitEditorEditorTextExpansions, _contentKitEditorEditorKeyCommands, _contentKitEditorUtilsStringUtils) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var EDITOR_ELEMENT_CLASS_NAME = 'ck-editor';

  exports.EDITOR_ELEMENT_CLASS_NAME = EDITOR_ELEMENT_CLASS_NAME;
  var defaults = {
    placeholder: 'Write here...',
    spellcheck: true,
    autofocus: true,
    // FIXME PhantomJS has 'ontouchstart' in window,
    // causing the stickyToolbar to accidentally be auto-activated
    // in tests
    stickyToolbar: false, // !!('ontouchstart' in window),
    cards: [],
    cardOptions: {},
    unknownCardHandler: function unknownCardHandler() {
      throw new Error('Unknown card encountered');
    },
    mobiledoc: null,
    html: null
  };

  function runCallbacks(callbacks, args) {
    var i = undefined;
    for (i = 0; i < callbacks.length; i++) {
      callbacks[i].apply(null, args);
    }
  }

  /**
   * @class Editor
   * An individual Editor
   * @param element `Element` node
   * @param options hash of options
   */

  var Editor = (function () {
    function Editor() {
      var _this = this;

      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      _classCallCheck(this, Editor);

      if (!options || options.nodeType) {
        throw new Error('editor create accepts an options object. For legacy usage passing an element for the first argument, consider the `html` option for loading DOM or HTML posts. For other cases call `editor.render(domNode)` after editor creation');
      }
      this._elementListeners = [];
      this._views = [];
      this.isEditable = null;

      this._didUpdatePostCallbacks = [];
      this._willRenderCallbacks = [];
      this._didRenderCallbacks = [];

      // FIXME: This should merge onto this.options
      (0, _contentKitUtils.mergeWithOptions)(this, defaults, options);

      this.cards.push(_contentKitEditorCardsImage['default']);

      _contentKitEditorEditorTextExpansions.DEFAULT_TEXT_EXPANSIONS.forEach(function (e) {
        return _this.registerExpansion(e);
      });
      _contentKitEditorEditorKeyCommands.DEFAULT_KEY_COMMANDS.forEach(function (kc) {
        return _this.registerKeyCommand(kc);
      });

      this._parser = new _contentKitEditorParsersPost['default'](this.builder);
      this._renderer = new _contentKitEditorRenderersEditorDom['default'](this, this.cards, this.unknownCardHandler, this.cardOptions);

      this.post = this.loadPost();
      this._renderTree = new _contentKitEditorModelsRenderTree['default'](this.post);
    }

    _createClass(Editor, [{
      key: 'addView',
      value: function addView(view) {
        this._views.push(view);
      }
    }, {
      key: 'loadPost',
      value: function loadPost() {
        if (this.mobiledoc) {
          return new _contentKitEditorParsersMobiledoc['default'](this.builder).parse(this.mobiledoc);
        } else if (this.html) {
          if (typeof this.html === 'string') {
            this.html = (0, _contentKitEditorUtilsDomUtils.parseHTML)(this.html);
          }
          return new _contentKitEditorParsersDom['default'](this.builder).parse(this.html);
        } else {
          return this.builder.createBlankPost();
        }
      }
    }, {
      key: 'rerender',
      value: function rerender() {
        var postRenderNode = this.post.renderNode;

        // if we haven't rendered this post's renderNode before, mark it dirty
        if (!postRenderNode.element) {
          if (!this.element) {
            throw new Error('Initial call to `render` must happen before `rerender` can be called.');
          }
          postRenderNode.element = this.element;
          postRenderNode.markDirty();
        }

        runCallbacks(this._willRenderCallbacks, []);
        this._renderer.render(this._renderTree);
        runCallbacks(this._didRenderCallbacks, []);
      }
    }, {
      key: 'render',
      value: function render(element) {
        if (this.element) {
          throw new Error('Cannot render an editor twice. Use `rerender` to update the rendering of an existing editor instance');
        }

        this.element = element;

        (0, _contentKitEditorUtilsDomUtils.addClassName)(this.element, EDITOR_ELEMENT_CLASS_NAME);
        element.spellcheck = this.spellcheck;

        if (this.isEditable === null) {
          this.enableEditing();
        }

        (0, _contentKitEditorUtilsDomUtils.clearChildNodes)(element);

        this._setupListeners();
        this._addEmbedIntent();
        this._addToolbar();
        this._addTooltip();

        // A call to `run` will trigger the didUpdatePostCallbacks hooks with a
        // postEditor.
        this.run(function () {});
        this.rerender();

        if (this.autofocus) {
          this.element.focus();
        }
      }
    }, {
      key: '_addToolbar',
      value: function _addToolbar() {
        this.addView(new _contentKitEditorViewsTextFormatToolbar['default']({
          editor: this,
          rootElement: this.element,
          commands: [],
          sticky: this.stickyToolbar
        }));
      }
    }, {
      key: '_addTooltip',
      value: function _addTooltip() {
        this.addView(new _contentKitEditorViewsTooltip['default']({ rootElement: this.element, showForTag: 'a' }));
      }
    }, {
      key: 'registerExpansion',
      value: function registerExpansion(expansion) {
        if (!(0, _contentKitEditorEditorTextExpansions.validateExpansion)(expansion)) {
          throw new Error('Expansion is not valid');
        }
        this.expansions.push(expansion);
      }
    }, {
      key: 'registerKeyCommand',
      value: function registerKeyCommand(keyCommand) {
        if (!(0, _contentKitEditorEditorKeyCommands.validateKeyCommand)(keyCommand)) {
          throw new Error('Key Command is not valid');
        }
        this.keyCommands.push(keyCommand);
      }
    }, {
      key: 'handleExpansion',
      value: function handleExpansion(event) {
        var expansion = (0, _contentKitEditorEditorTextExpansions.findExpansion)(this.expansions, event, this);
        if (expansion) {
          event.preventDefault();
          expansion.run(this);
        }
      }
    }, {
      key: 'handleDeletion',
      value: function handleDeletion(event) {
        var _this2 = this;

        event.preventDefault();

        var range = this.cursor.offsets;

        if (this.cursor.hasSelection()) {
          this.run(function (postEditor) {
            return postEditor.deleteRange(range);
          });
          this.cursor.moveToPosition(range.head);
        } else {
          (function () {
            var key = _contentKitEditorUtilsKey['default'].fromEvent(event);
            var nextPosition = _this2.run(function (postEditor) {
              return postEditor.deleteFrom(range.head, key.direction);
            });
            _this2.cursor.moveToPosition(nextPosition);
          })();
        }
      }
    }, {
      key: 'handleNewline',
      value: function handleNewline(event) {
        if (!this.cursor.hasCursor()) {
          return;
        }

        event.preventDefault();

        var range = this.cursor.offsets;
        var cursorSection = this.run(function (postEditor) {
          if (!range.isCollapsed) {
            postEditor.deleteRange(range);
            if (range.head.section.isBlank) {
              return range.head.section;
            }
          }
          return postEditor.splitSection(range.head)[1];
        });
        this.cursor.moveToSection(cursorSection);
      }

      // FIXME it might be nice to use the toolbar's prompt instead
    }, {
      key: 'showPrompt',
      value: function showPrompt(message, defaultValue, callback) {
        callback(window.prompt(message, defaultValue));
      }
    }, {
      key: 'reportSelection',
      value: function reportSelection() {
        if (!this._hasSelection) {
          this.trigger('selection');
        } else {
          this.trigger('selectionUpdated');
        }
        this._hasSelection = true;
      }
    }, {
      key: 'reportNoSelection',
      value: function reportNoSelection() {
        if (this._hasSelection) {
          this.trigger('selectionEnded');
        }
        this._hasSelection = false;
      }
    }, {
      key: 'cancelSelection',
      value: function cancelSelection() {
        if (this._hasSelection) {
          var range = this.cursor.offsets;
          this.moveToPosition(range.tail);
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
        this.reportSelection();
      }
    }, {
      key: 'selectRange',
      value: function selectRange(range) {
        this.cursor.selectRange(range);
        if (range.isCollapsed) {
          this.reportNoSelection();
        } else {
          this.reportSelection();
        }
      }
    }, {
      key: 'moveToPosition',
      value: function moveToPosition(position) {
        this.cursor.moveToPosition(position);
        this.reportNoSelection();
      }
    }, {
      key: 'setPlaceholder',
      value: function setPlaceholder(placeholder) {
        (0, _contentKitEditorUtilsElementUtils.setData)(this.element, 'placeholder', placeholder);
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
        var _cursor$offsets = this.cursor.offsets;
        var headSection = _cursor$offsets.headSection;
        var headSectionOffset = _cursor$offsets.headSectionOffset;

        if (headSectionOffset === 0) {
          // FIXME if the offset is 0, the user is typing the first character
          // in an empty section, so we need to move the cursor 1 letter forward
          headSectionOffset = 1;
        }

        this._reparseCurrentSection();
        this._removeDetachedSections();

        // A call to `run` will trigger the didUpdatePostCallbacks hooks with a
        // postEditor.
        this.run(function () {});
        this.rerender();
        this.trigger('update');

        this.cursor.moveToSection(headSection, headSectionOffset);
      }

      // FIXME this should be able to be removed now -- if any sections are detached,
      // it's due to a bug in the code.
    }, {
      key: '_removeDetachedSections',
      value: function _removeDetachedSections() {
        (0, _contentKitEditorUtilsArrayUtils.forEach)((0, _contentKitEditorUtilsArrayUtils.filter)(this.post.sections, function (s) {
          return !s.renderNode.isAttached();
        }), function (s) {
          return s.renderNode.scheduleForRemoval();
        });
      }

      /*
       * Returns the active sections. If the cursor selection is collapsed this will be
       * an array of 1 item. Else will return an array containing each section that is either
       * wholly or partly contained by the cursor selection.
       *
       * @return {array} The sections from the cursor's selection start to the selection end
       */
    }, {
      key: '_reparseCurrentSection',
      value: function _reparseCurrentSection() {
        var currentSection = this.cursor.offsets.headSection;

        this._parser.reparseSection(currentSection, this._renderTree);
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
      key: 'destroy',
      value: function destroy() {
        this._isDestroyed = true;
        this.removeAllEventListeners();
        this.removeAllViews();
      }

      /**
       * Keep the user from directly editing the post. Modification via the
       * programmatic API is still permitted.
       *
       * @method disableEditing
       * @public
       */
    }, {
      key: 'disableEditing',
      value: function disableEditing() {
        this.isEditable = false;
        if (this.element) {
          this.element.setAttribute('contentEditable', false);
          this.setPlaceholder('');
        }
      }

      /**
       * Allow the user to directly interact with editing a post via a cursor.
       *
       * @method enableEditing
       * @return undefined
       * @public
       */
    }, {
      key: 'enableEditing',
      value: function enableEditing() {
        this.isEditable = true;
        if (this.element) {
          this.element.setAttribute('contentEditable', true);
          this.setPlaceholder(this.placeholder);
        }
      }

      /**
       * Run a new post editing session. Yields a block with a new `postEditor`
       * instance. This instance can be used to interact with the post abstract,
       * and defers rendering until the end of all changes.
       *
       * Usage:
       *
       *     let markerRange = this.cursor.offsets;
       *     editor.run((postEditor) => {
       *       postEditor.deleteRange(markerRange);
       *       // editing surface not updated yet
       *       postEditor.schedule(() => {
       *         console.log('logs during rerender flush');
       *       });
       *       // logging not yet flushed
       *     });
       *     // editing surface now updated.
       *     // logging now flushed
       *
       * The return value of `run` is whatever was returned from the callback.
       *
       * @method run
       * @param {Function} callback Function to handle post editing with, provided the `postEditor` as an argument.
       * @return {} Whatever the return value of `callback` is.
       * @public
       */
    }, {
      key: 'run',
      value: function run(callback) {
        var postEditor = new _contentKitEditorEditorPost['default'](this);
        var result = callback(postEditor);
        runCallbacks(this._didUpdatePostCallbacks, [postEditor]);
        postEditor.complete();
        return result;
      }
    }, {
      key: 'didUpdatePost',
      value: function didUpdatePost(callback) {
        this._didUpdatePostCallbacks.push(callback);
      }
    }, {
      key: 'willRender',
      value: function willRender(callback) {
        this._willRenderCallbacks.push(callback);
      }
    }, {
      key: 'didRender',
      value: function didRender(callback) {
        this._didRenderCallbacks.push(callback);
      }
    }, {
      key: '_addEmbedIntent',
      value: function _addEmbedIntent() {
        this.addView(new _contentKitEditorViewsEmbedIntent['default']({
          editor: this,
          rootElement: this.element
        }));
      }
    }, {
      key: '_setupListeners',
      value: function _setupListeners() {
        var _this3 = this;

        var elementEvents = ['keydown', 'keyup', 'input', 'dragover', 'drop', 'paste'];
        var documentEvents = ['mouseup'];

        elementEvents.forEach(function (eventName) {
          _this3.addEventListener(_this3.element, eventName, function () {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
              args[_key] = arguments[_key];
            }

            return _this3.handleEvent.apply(_this3, [eventName].concat(args));
          });
        });

        documentEvents.forEach(function (eventName) {
          _this3.addEventListener(document, eventName, function () {
            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
              args[_key2] = arguments[_key2];
            }

            return _this3.handleEvent.apply(_this3, [eventName].concat(args));
          });
        });
      }
    }, {
      key: 'handleEvent',
      value: function handleEvent(eventName) {
        if (this.cursor.isInCard()) {
          return;
        }

        var methodName = 'handle' + (0, _contentKitEditorUtilsStringUtils.capitalize)(eventName);
        if (!this[methodName]) {
          throw new Error('No handler for ' + eventName);
        }

        for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
          args[_key3 - 1] = arguments[_key3];
        }

        this[methodName].apply(this, args);
      }
    }, {
      key: 'handleMouseup',
      value: function handleMouseup() {
        var _this4 = this;

        // mouseup does not correctly report a selection until the next tick
        setTimeout(function () {
          return _this4._reportSelectionState();
        });
      }
    }, {
      key: 'handleKeyup',
      value: function handleKeyup(event) {
        var key = _contentKitEditorUtilsKey['default'].fromEvent(event);

        if (key.isEscape()) {
          this.trigger('escapeKey');
        }
        this._reportSelectionState();
      }

      /*
         The following events/sequences can create a selection and are handled:
           * mouseup -- can happen anywhere in document, must wait until next tick to read selection
           * keyup when key is a movement key and shift is pressed -- in editor element
           * keyup when key combo was cmd-A (alt-A) aka "select all"
           * keyup when key combo was cmd-Z (browser may restore selection)
         These cases can create a selection and are not handled:
           * ctrl-click -> context menu -> click "select all"
       */
    }, {
      key: '_reportSelectionState',
      value: function _reportSelectionState() {
        if (this.cursor.hasSelection()) {
          this.reportSelection();
        } else {
          this.reportNoSelection();
        }
      }
    }, {
      key: 'handleDragover',
      value: function handleDragover(e) {
        e.preventDefault(); // FIXME for now, just prevent default
      }
    }, {
      key: 'handleDrop',
      value: function handleDrop(e) {
        e.preventDefault(); // FIXME for now, just prevent default
      }
    }, {
      key: '_insertEmptyMarkupSectionAtCursor',
      value: function _insertEmptyMarkupSectionAtCursor() {
        var _this5 = this;

        var section = this.run(function (postEditor) {
          var section = postEditor.builder.createMarkupSection('p');
          postEditor.insertSectionBefore(_this5.post.sections, section);
          return section;
        });
        this.cursor.moveToSection(section);
      }
    }, {
      key: 'handleKeydown',
      value: function handleKeydown(event) {
        var _this6 = this;

        if (!this.isEditable) {
          return;
        }
        if (this.post.isBlank) {
          this._insertEmptyMarkupSectionAtCursor();
        }

        var key = _contentKitEditorUtilsKey['default'].fromEvent(event);

        if (key.isDelete()) {
          this.handleDeletion(event);
          event.preventDefault();
        } else if (key.isEnter()) {
          this.handleNewline(event);
        } else if (key.isPrintable()) {
          if (this.cursor.hasSelection()) {
            (function () {
              var range = _this6.cursor.offsets;
              _this6.run(function (postEditor) {
                return postEditor.deleteRange(range);
              });
              _this6.cursor.moveToPosition(range.head);
            })();
          }
        }

        this.handleExpansion(event);
        this.handleKeyCommand(event);
      }
    }, {
      key: 'handleKeyCommand',
      value: function handleKeyCommand(event) {
        var keyCommand = (0, _contentKitEditorEditorKeyCommands.findKeyCommand)(this.keyCommands, event);
        if (keyCommand) {
          event.preventDefault();
          keyCommand.run(this);
        }
      }
    }, {
      key: 'handlePaste',
      value: function handlePaste(event) {
        event.preventDefault(); // FIXME for now, just prevent pasting
      }
    }, {
      key: 'builder',
      get: function get() {
        if (!this._builder) {
          this._builder = new _contentKitEditorModelsPostNodeBuilder['default']();
        }
        return this._builder;
      }
    }, {
      key: 'expansions',
      get: function get() {
        if (!this._expansions) {
          this._expansions = [];
        }
        return this._expansions;
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
        return new _contentKitEditorUtilsCursor['default'](this);
      }
    }, {
      key: 'activeSections',
      get: function get() {
        return this.cursor.activeSections;
      }
    }, {
      key: 'activeSection',
      get: function get() {
        var activeSections = this.activeSections;

        return activeSections[activeSections.length - 1];
      }
    }, {
      key: 'markupsInSelection',
      get: function get() {
        if (this.cursor.hasSelection()) {
          var range = this.cursor.offsets;
          return this.post.markupsInRange(range);
        } else {
          return [];
        }
      }
    }]);

    return Editor;
  })();

  (0, _contentKitEditorUtilsMixin['default'])(Editor, _contentKitEditorUtilsEventEmitter['default']);
  (0, _contentKitEditorUtilsMixin['default'])(Editor, _contentKitEditorUtilsEventListener['default']);

  exports['default'] = Editor;
});
define('content-kit-editor/editor/key-commands', ['exports', 'content-kit-editor/utils/key', 'content-kit-editor/utils/array-utils', 'content-kit-editor/commands/link', 'content-kit-editor/commands/bold', 'content-kit-editor/commands/italic'], function (exports, _contentKitEditorUtilsKey, _contentKitEditorUtilsArrayUtils, _contentKitEditorCommandsLink, _contentKitEditorCommandsBold, _contentKitEditorCommandsItalic) {
  'use strict';

  exports.validateKeyCommand = validateKeyCommand;
  exports.findKeyCommand = findKeyCommand;

  function runSelectionCommand(editor, CommandKlass) {
    if (editor.cursor.hasSelection()) {
      var cmd = new CommandKlass(editor);
      if (cmd.isActive()) {
        cmd.unexec();
      } else {
        cmd.exec();
      }
    }
  }

  var DEFAULT_KEY_COMMANDS = [{
    modifier: _contentKitEditorUtilsKey.MODIFIERS.META,
    str: 'B',
    run: function run(editor) {
      runSelectionCommand(editor, _contentKitEditorCommandsBold['default']);
    }
  }, {
    modifier: _contentKitEditorUtilsKey.MODIFIERS.CTRL,
    str: 'B',
    run: function run(editor) {
      runSelectionCommand(editor, _contentKitEditorCommandsBold['default']);
    }
  }, {
    modifier: _contentKitEditorUtilsKey.MODIFIERS.META,
    str: 'I',
    run: function run(editor) {
      runSelectionCommand(editor, _contentKitEditorCommandsItalic['default']);
    }
  }, {
    modifier: _contentKitEditorUtilsKey.MODIFIERS.CTRL,
    str: 'I',
    run: function run(editor) {
      runSelectionCommand(editor, _contentKitEditorCommandsItalic['default']);
    }
  }, {
    modifier: _contentKitEditorUtilsKey.MODIFIERS.META,
    str: 'K',
    run: function run(editor) {
      if (!editor.cursor.hasSelection()) {
        return;
      }

      var selectedText = editor.cursor.selectedText();
      var defaultUrl = '';
      if (selectedText.indexOf('http') !== -1) {
        defaultUrl = selectedText;
      }

      editor.showPrompt('Enter a URL', defaultUrl, function (url) {
        if (!url) {
          return;
        }

        var linkCommand = new _contentKitEditorCommandsLink['default'](editor);
        linkCommand.exec(url);
      });
    }
  }];

  exports.DEFAULT_KEY_COMMANDS = DEFAULT_KEY_COMMANDS;

  function validateKeyCommand(keyCommand) {
    return !!keyCommand.modifier && !!keyCommand.str && !!keyCommand.run;
  }

  function findKeyCommand(keyCommands, keyEvent) {
    var key = _contentKitEditorUtilsKey['default'].fromEvent(keyEvent);

    return (0, _contentKitEditorUtilsArrayUtils.detect)(keyCommands, function (_ref) {
      var modifier = _ref.modifier;
      var str = _ref.str;

      return key.hasModifier(modifier) && key.isChar(str);
    });
  }
});
define('content-kit-editor/editor/post', ['exports', 'content-kit-editor/models/markup-section', 'content-kit-editor/models/types', 'content-kit-editor/utils/cursor/position', 'content-kit-editor/utils/array-utils', 'content-kit-editor/utils/key'], function (exports, _contentKitEditorModelsMarkupSection, _contentKitEditorModelsTypes, _contentKitEditorUtilsCursorPosition, _contentKitEditorUtilsArrayUtils, _contentKitEditorUtilsKey) {
  'use strict';

  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function isMarkupSection(section) {
    return section.type === _contentKitEditorModelsTypes.MARKUP_SECTION_TYPE;
  }

  function isListItem(section) {
    return section.type === _contentKitEditorModelsTypes.LIST_ITEM_TYPE;
  }

  function isBlankAndListItem(section) {
    return isListItem(section) && section.isBlank;
  }

  function isMarkerable(section) {
    return !!section.markers;
  }

  var PostEditor = (function () {
    function PostEditor(editor) {
      _classCallCheck(this, PostEditor);

      this.editor = editor;
      this.builder = this.editor.builder;
      this._queues = {
        beforeCompletion: [],
        completion: [],
        afterCompletion: []
      };
      this._didScheduleRerender = false;
      this._didScheduleUpdate = false;
      this._didComplete = false;
    }

    /**
     * Remove a range from the post
     *
     * Usage:
     *
     *     const range = editor.cursor.offsets;
     *     editor.run((postEditor) => {
     *       postEditor.deleteRange(range);
     *     });
     *
     * @method deleteRange
     * @param {Range} range Cursor Range object with head and tail Positions
     * @public
     */

    _createClass(PostEditor, [{
      key: 'deleteRange',
      value: function deleteRange(range) {
        var _this = this;

        // types of selection deletion:
        //   * a selection starts at the beginning of a section
        //     -- cursor should end up at the beginning of that section
        //     -- if the section not longer has markers, add a blank one for the cursor to focus on
        //   * a selection is entirely within a section
        //     -- split the markers with the selection, remove those new markers from their section
        //     -- cursor goes at end of the marker before the selection start, or if the
        //     -- selection was at the start of the section, cursor goes at section start
        //   * a selection crosses multiple sections
        //     -- remove all the sections that are between (exclusive) selection start and end
        //     -- join the start and end sections
        //     -- mark the end section for removal
        //     -- cursor goes at end of marker before the selection start

        var _range$head = range.head;
        var headSection = _range$head.section;
        var headSectionOffset = _range$head.offset;
        var _range$tail = range.tail;
        var tailSection = _range$tail.section;
        var tailSectionOffset = _range$tail.offset;
        var post = this.editor.post;

        if (headSection === tailSection) {
          this.cutSection(headSection, headSectionOffset, tailSectionOffset);
        } else {
          (function () {
            var removedSections = post.sectionsContainedBy(range);
            post.walkMarkerableSections(range, function (section) {
              switch (section) {
                case headSection:
                  _this.cutSection(section, headSectionOffset, section.text.length);
                  break;
                case tailSection:
                  section.markersFor(tailSectionOffset, section.text.length).forEach(function (m) {
                    headSection.markers.append(m);
                  });
                  _this._markDirty(headSection); // May have added nodes
                  removedSections.push(section);
                  break;
                default:
                  if (removedSections.indexOf(section) === -1) {
                    removedSections.push(section);
                  }
              }
            });
            removedSections.forEach(function (section) {
              return _this.removeSection(section);
            });
          })();
        }
      }
    }, {
      key: 'cutSection',
      value: function cutSection(section, headSectionOffset, tailSectionOffset) {
        if (section.isBlank) {
          return;
        }

        var adjustedHead = 0,
            marker = section.markers.head,
            adjustedTail = marker.length;

        // Walk to the first node inside the headSectionOffset, splitting
        // a marker if needed. Leave marker as the first node inside.
        while (marker) {
          if (adjustedTail >= headSectionOffset) {
            var splitOffset = headSectionOffset - adjustedHead;

            var _splitMarker = this.splitMarker(marker, splitOffset);

            var afterMarker = _splitMarker.afterMarker;

            adjustedHead = adjustedHead + splitOffset;
            // FIXME: That these two loops cannot agree on adjustedTail being
            // incremented at the start or end seems prime for refactoring.
            adjustedTail = adjustedHead;
            marker = afterMarker;
            break;
          }
          adjustedHead += marker.length;
          marker = marker.next;
          if (marker) {
            adjustedTail += marker.length;
          }
        }

        // Walk each marker inside, removing it if needed. when the last is
        // reached split it and remove the part inside the tailSectionOffset
        while (marker) {
          adjustedTail += marker.length;
          if (adjustedTail >= tailSectionOffset) {
            var splitOffset = marker.length - (adjustedTail - tailSectionOffset);

            var _splitMarker2 = this.splitMarker(marker, splitOffset);

            var beforeMarker = _splitMarker2.beforeMarker;

            if (beforeMarker) {
              this.removeMarker(beforeMarker);
            }
            break;
          }
          adjustedHead += marker.length;
          var nextMarker = marker.next;
          this.removeMarker(marker);
          marker = nextMarker;
        }
      }
    }, {
      key: '_coalesceMarkers',
      value: function _coalesceMarkers(section) {
        this._removeEmptyMarkers(section);
        this._joinSimilarMarkers(section);
      }
    }, {
      key: '_removeEmptyMarkers',
      value: function _removeEmptyMarkers(section) {
        var _this2 = this;

        (0, _contentKitEditorUtilsArrayUtils.forEach)((0, _contentKitEditorUtilsArrayUtils.filter)(section.markers, function (m) {
          return m.isEmpty;
        }), function (m) {
          return _this2.removeMarker(m);
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

          if ((0, _contentKitEditorUtilsArrayUtils.isArrayEqual)(marker.markups, nextMarker.markups)) {
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
        if (postNode.renderNode) {
          postNode.renderNode.scheduleForRemoval();

          this.scheduleRerender();
          this.scheduleDidUpdate();
        }
      }
    }, {
      key: '_markDirty',
      value: function _markDirty(postNode) {
        var _this3 = this;

        if (postNode.renderNode) {
          postNode.renderNode.markDirty();

          this.scheduleRerender();
          this.scheduleDidUpdate();
        }
        if (postNode.section) {
          this._markDirty(postNode.section);
        }
        if (isMarkerable(postNode)) {
          this._queues.beforeCompletion.push(function () {
            return _this3._coalesceMarkers(postNode);
          });
        }
      }

      /**
       * Remove a character from a {marker, offset} position, in either
       * forward or backward (default) direction.
       *
       * Usage:
       *
       *     let marker = editor.post.sections.head.markers.head;
       *     // marker has text of "Howdy!"
       *     editor.run((postEditor) => {
       *       postEditor.deleteFrom({section, offset: 3});
       *     });
       *     // marker has text of "Hody!"
       *
       * `deleteFrom` may remove a character from a different marker or join the
       * marker's section with the previous/next section (depending on the
       * deletion direction) if direction is `BACKWARD` and the offset is 0,
       * or direction is `FORWARD` and the offset is equal to the length of the
       * marker.
       *
       * @method deleteFrom
       * @param {Position} position object with {section, offset} the marker and offset to delete from
       * @param {Number} direction The direction to delete in (default is BACKWARD)
       * @return {Position} for positioning the cursor
       * @public
       */
    }, {
      key: 'deleteFrom',
      value: function deleteFrom(position) {
        var direction = arguments.length <= 1 || arguments[1] === undefined ? _contentKitEditorUtilsKey.DIRECTION.BACKWARD : arguments[1];

        if (direction === _contentKitEditorUtilsKey.DIRECTION.BACKWARD) {
          return this._deleteBackwardFrom(position);
        } else {
          return this._deleteForwardFrom(position);
        }
      }
    }, {
      key: '_joinPositionToPreviousSection',
      value: function _joinPositionToPreviousSection(position) {
        var section = position.section;

        var nextPosition = position.clone();

        if (!isMarkerable(section)) {
          throw new Error('Cannot join non-markerable section to previous section');
        } else if (isListItem(section)) {
          nextPosition = this._convertListItemToMarkupSection(section);
        } else {
          var prevSection = section.immediatelyPreviousMarkerableSection();

          if (prevSection) {
            var _prevSection$join = prevSection.join(section);

            var beforeMarker = _prevSection$join.beforeMarker;

            this._markDirty(prevSection);
            this.removeSection(section);

            nextPosition.section = prevSection;
            nextPosition.offset = beforeMarker ? prevSection.offsetOfMarker(beforeMarker, beforeMarker.length) : 0;
          }
        }

        return nextPosition;
      }

      /**
       * delete 1 character in the FORWARD direction from the given position
       * @method _deleteForwardFrom
       * @param {Position} position
       * @private
       */
    }, {
      key: '_deleteForwardFrom',
      value: function _deleteForwardFrom(position) {
        var section = position.section;
        var offset = position.offset;

        if (section.isBlank) {
          // remove this section, focus on start of next markerable section
          var nextPosition = position.clone();
          var next = section.immediatelyNextMarkerableSection();
          if (next) {
            this.removeSection(section);
            nextPosition.section = next;
            nextPosition.offset = 0;
          }
          return nextPosition;
        } else if (offset === section.length) {
          // join next markerable section to this one
          return this._joinPositionToNextSection(position);
        } else {
          return this._deleteForwardFromMarkerPosition(position.markerPosition);
        }
      }
    }, {
      key: '_joinPositionToNextSection',
      value: function _joinPositionToNextSection(position) {
        var section = position.section;

        var nextPosition = position.clone();

        if (!isMarkerable(section)) {
          throw new Error('Cannot join non-markerable section to next section');
        } else {
          var next = section.immediatelyNextMarkerableSection();
          if (next) {
            section.join(next);
            this._markDirty(section);
            this.removeSection(next);
          }
        }

        return nextPosition;
      }
    }, {
      key: '_deleteForwardFromMarkerPosition',
      value: function _deleteForwardFromMarkerPosition(markerPosition) {
        var marker = markerPosition.marker;
        var offset = markerPosition.offset;
        var section = marker.section;

        var nextPosition = new _contentKitEditorUtilsCursorPosition['default'](section, section.offsetOfMarker(marker, offset));

        if (offset === marker.length) {
          var nextMarker = marker.next;

          if (nextMarker) {
            var nextMarkerPosition = { marker: nextMarker, offset: 0 };
            return this._deleteForwardFromMarkerPosition(nextMarkerPosition);
          } else {
            var nextSection = marker.section.next;
            if (nextSection && isMarkupSection(nextSection)) {
              var currentSection = marker.section;

              currentSection.join(nextSection);
              this._markDirty(currentSection);

              this.removeSection(nextSection);
            }
          }
        } else {
          marker.deleteValueAtOffset(offset);
          this._markDirty(marker);
        }

        return nextPosition;
      }
    }, {
      key: '_convertListItemToMarkupSection',
      value: function _convertListItemToMarkupSection(listItem) {
        var listSection = listItem.parent;

        var newSections = listItem.splitIntoSections();
        var newMarkupSection = newSections[1];

        this._replaceSection(listSection, (0, _contentKitEditorUtilsArrayUtils.compact)(newSections));

        return new _contentKitEditorUtilsCursorPosition['default'](newMarkupSection, 0);
      }

      /**
       * delete 1 character in the BACKWARD direction from the given position
       * @method _deleteBackwardFrom
       * @param {Position} position
       * @return {Position} The position the cursor should be put after this deletion
       * @private
       */
    }, {
      key: '_deleteBackwardFrom',
      value: function _deleteBackwardFrom(position) {
        var sectionOffset = position.offset;

        if (sectionOffset === 0) {
          return this._joinPositionToPreviousSection(position);
        }

        var nextPosition = position.clone();
        var _position$markerPosition = position.markerPosition;
        var marker = _position$markerPosition.marker;
        var markerOffset = _position$markerPosition.offset;

        var offsetToDeleteAt = markerOffset - 1;

        marker.deleteValueAtOffset(offsetToDeleteAt);
        nextPosition.offset -= 1;
        this._markDirty(marker);

        return nextPosition;
      }

      /**
       * Split markers at two positions, once at the head, and if necessary once
       * at the tail. This method is designed to accept a range
       * (e.g. `editor.cursor.offsets`) as an argument.
       *
       * Usage:
       *
       *     let markerRange = this.cursor.offsets;
       *     editor.run((postEditor) => {
       *       postEditor.splitMarkers(markerRange);
       *     });
       *
       * The return value will be marker object completely inside the offsets
       * provided. Markers on the outside of the split may also have been modified.
       *
       * @method splitMarkers
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
        var _this4 = this;

        var edit = section.splitMarkerAtOffset(offset);
        edit.removed.forEach(function (m) {
          return _this4.removeMarker(m);
        });
      }
    }, {
      key: 'splitMarker',
      value: function splitMarker(marker, offset) {
        var beforeMarker = undefined,
            afterMarker = undefined;

        if (offset === 0) {
          beforeMarker = marker.prev;
          afterMarker = marker;
        } else if (offset === marker.length) {
          beforeMarker = marker;
          afterMarker = marker.next;
        } else {
          var builder = this.editor.builder;
          var section = marker.section;

          beforeMarker = builder.createMarker(marker.value.substring(0, offset), marker.markups);
          afterMarker = builder.createMarker(marker.value.substring(offset, marker.length), marker.markups);
          section.markers.splice(marker, 1, [beforeMarker, afterMarker]);

          this.removeMarker(marker);
          this._markDirty(section);
        }

        return { beforeMarker: beforeMarker, afterMarker: afterMarker };
      }

      /**
       * Split a section at one position. This method is designed to accept
       * `editor.cursor.offsets` as an argument, but will only split at the
       * head of the cursor position.
       *
       * Usage:
       *
       *     let marker = editor.post.sections.head.marker.head;
       *     editor.run((postEditor) => {
       *       postEditor.splitSection({
       *         headSection: section,
       *         headSectionOffset: 3
       *       });
       *     });
       *     // Will result in the marker and its old section being removed from
       *     // the post and rendered DOM, and in the creation of two new sections
       *     // replacing the old one.
       *
       * The return value will be the two new sections. One or both of these
       * sections can be blank (contain only a blank marker), for example if the
       * headMarkerOffset is 0.
       *
       * @method splitSection
       * @param {Position} position
       * @return {Array} new sections, one for the first half and one for the second
       * @public
       */
    }, {
      key: 'splitSection',
      value: function splitSection(position) {
        var section = position.section;

        var _section$splitAtPosition = section.splitAtPosition(position);

        var _section$splitAtPosition2 = _slicedToArray(_section$splitAtPosition, 2);

        var beforeSection = _section$splitAtPosition2[0];
        var afterSection = _section$splitAtPosition2[1];

        this._coalesceMarkers(beforeSection);
        this._coalesceMarkers(afterSection);

        var newSections = [beforeSection, afterSection];
        var replacementSections = [beforeSection, afterSection];

        if (isBlankAndListItem(beforeSection) && isBlankAndListItem(section)) {
          var isLastItemInList = section === section.parent.sections.tail;

          if (isLastItemInList) {
            // when hitting enter in a final empty list item, do not insert a new
            // empty item
            replacementSections.shift();
          }
        }

        this._replaceSection(section, replacementSections);

        // FIXME we must return 2 sections because other code expects this to always return 2
        return newSections;
      }

      /**
       * @method replaceSection
       * @param {Section} section
       * @param {Section} newSection
       * @return null
       * @public
       */
    }, {
      key: 'replaceSection',
      value: function replaceSection(section, newSection) {
        if (!section) {
          // The section may be undefined if the user used the embed intent
          // ("+" icon) to insert a new "ul" section in a blank post
          this.insertSectionBefore(this.editor.post.sections, newSection);
        } else {
          this._replaceSection(section, [newSection]);
        }
      }
    }, {
      key: '_replaceSection',
      value: function _replaceSection(section, newSections) {
        var _this5 = this;

        var nextSection = section.next;
        var collection = section.parent.sections;

        var nextNewSection = newSections[0];
        if (isMarkupSection(nextNewSection) && isListItem(section)) {
          // put the new section after the ListSection (section.parent) instead of after the ListItem
          collection = section.parent.parent.sections;
          nextSection = section.parent.next;
        }

        newSections.forEach(function (s) {
          return _this5.insertSectionBefore(collection, s, nextSection);
        });
        this.removeSection(section);
      }

      /**
       * Given a markerRange (for example `editor.cursor.offsets`) mark all markers
       * inside it as a given markup. The markup must be provided as a post
       * abstract node.
       *
       * Usage:
       *
       *     const range = editor.cursor.offsets;
       *     const strongMarkup = editor.builder.createMarkup('strong');
       *     editor.run((postEditor) => {
       *       postEditor.applyMarkupToRange(range, strongMarkup);
       *     });
       *     // Will result some markers possibly being split, and the markup
       *     // being applied to all markers between the split.
       *
       * The return value will be all markers between the split, the same return
       * value as `splitMarkers`.
       *
       * @method applyMarkupToRange
       * @param {Range} range
       * @param {Markup} markup A markup post abstract node
       * @public
       */
    }, {
      key: 'applyMarkupToRange',
      value: function applyMarkupToRange(range, markup) {
        var _this6 = this;

        this.splitMarkers(range).forEach(function (marker) {
          marker.addMarkup(markup);
          _this6._markDirty(marker);
        });
      }

      /**
       * Given a markerRange (for example `editor.cursor.offsets`) remove the given
       * markup from all contained markers. The markup must be provided as a post
       * abstract node.
       *
       * Usage:
       *
       *     const range = editor.cursor.offsets;
       *     const markup = markerRange.headMarker.markups[0];
       *     editor.run(postEditor => {
       *       postEditor.removeMarkupFromRange(range, markup);
       *     });
       *     // Will result in some markers possibly being split, and the markup
       *     // being removed from all markers between the split.
       *
       * The return value will be all markers between the split, the same return
       * value as `splitMarkers`.
       *
       * @method removeMarkupFromRange
       * @param {Range} range Object with offsets
       * @param {Markup} markup A markup post abstract node
       * @private
       */
    }, {
      key: 'removeMarkupFromRange',
      value: function removeMarkupFromRange(range, markupOrMarkupCallback) {
        var _this7 = this;

        this.splitMarkers(range).forEach(function (marker) {
          marker.removeMarkup(markupOrMarkupCallback);
          _this7._markDirty(marker);
        });
      }

      /**
       * Toggle the given markup on the current selection. If anything in the current
       * selection has the markup, it will be removed. If nothing in the selection
       * has the markup, it will be added to everything in the selection.
       *
       * Usage:
       *
       * // Remove any 'strong' markup if it exists in the selection, otherwise
       * // make it all 'strong'
       * editor.run(postEditor => postEditor.toggleMarkup('strong'));
       *
       * // add/remove a link to 'bustle.com' to the selection
       * editor.run(postEditor => {
       *   const linkMarkup = postEditor.builder.createMarkup('a', ['href', 'http://bustle.com']);
       *   postEditor.toggleMarkup(linkMarkup);
       * });
       *
       * @method toggleMarkup
       * @param {Markup|String} markupOrString Either a markup object created using
       * the builder (useful when adding a markup with attributes, like an 'a' markup),
       * or, if a string, the tag name of the markup (e.g. 'strong', 'em') to toggle.
       */
    }, {
      key: 'toggleMarkup',
      value: function toggleMarkup(markupOrMarkupString) {
        var _this8 = this;

        var markup = typeof markupOrMarkupString === 'string' ? this.builder.createMarkup(markupOrMarkupString) : markupOrMarkupString;

        var range = this.editor.cursor.offsets;
        var hasMarkup = function hasMarkup(m) {
          return m.hasTag(markup.tagName);
        };
        var rangeHasMarkup = (0, _contentKitEditorUtilsArrayUtils.any)(this.editor.markupsInSelection, hasMarkup);

        if (rangeHasMarkup) {
          this.removeMarkupFromRange(range, hasMarkup);
        } else {
          this.applyMarkupToRange(range, markup);
        }
        this.scheduleAfterRender(function () {
          return _this8.editor.selectRange(range);
        });
      }
    }, {
      key: 'changeSectionTagName',
      value: function changeSectionTagName(section, newTagName) {
        var _this9 = this;

        section.markers.forEach(function (m) {
          m.clearMarkups();
          _this9._markDirty(m);
        });
        section.setTagName(newTagName);
        this._markDirty(section);
      }
    }, {
      key: 'resetSectionTagName',
      value: function resetSectionTagName(section) {
        this.changeSectionTagName(section, _contentKitEditorModelsMarkupSection.DEFAULT_TAG_NAME);
      }

      /**
       * Insert a given section before another one, updating the post abstract
       * and the rendered UI.
       *
       * Usage:
       *
       *     let markerRange = editor.cursor.offsets;
       *     let sectionWithCursor = markerRange.headMarker.section;
       *     let section = editor.builder.createCardSection('my-image');
       *     let collection = sectionWithCursor.parent.sections;
       *     editor.run((postEditor) => {
       *       postEditor.insertSectionBefore(collection, section, sectionWithCursor);
       *     });
       *
       * @method insertSectionBefore
       * @param {LinkedList} collection The list of sections to insert into
       * @param {Object} section The new section
       * @param {Object} beforeSection Optional The section "before" is relative to,
       * if falsy the new section will be appended to the collection
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
       * @method insertSection
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
       * @method insertSectionAtEnd
       * @param {Section} section
       * @public
       */
    }, {
      key: 'insertSectionAtEnd',
      value: function insertSectionAtEnd(section) {
        this.insertSectionBefore(this.editor.post.sections, section, null);
      }

      /**
       * Remove a given section from the post abstract and the rendered UI.
       *
       * Usage:
       *
       *     const range = editor.cursor.offsets;
       *     const sectionWithCursor = range.head.section;
       *     editor.run((postEditor) => {
       *       postEditor.removeSection(sectionWithCursor);
       *     });
       *
       * @method removeSection
       * @param {Object} section The section to remove
       * @public
       */
    }, {
      key: 'removeSection',
      value: function removeSection(section) {
        var parent = section.parent;
        var parentIsRemoved = parent.renderNode.isRemoved;

        if (parentIsRemoved) {
          // This can happen if we remove a list section and later
          // try to remove one of the section's list items;
          return;
        }

        this._scheduleForRemoval(section);
        parent.sections.remove(section);

        if (parent.isBlank && parent.type !== _contentKitEditorModelsTypes.POST_TYPE) {
          // If we removed the last child from a parent (e.g. the last li in a ul),
          // also remove the parent
          this.removeSection(parent);
        }
      }

      /**
       * A method for adding work the deferred queue
       *
       * @method schedule
       * @param {Function} callback to run during completion
       * @public
       */
    }, {
      key: 'schedule',
      value: function schedule(callback) {
        if (this._didComplete) {
          throw new Error('Work can only be scheduled before a post edit has completed');
        }
        this._queues.completion.push(callback);
      }

      /**
       * Add a rerender job to the queue
       *
       * @method scheduleRerender
       * @public
       */
    }, {
      key: 'scheduleRerender',
      value: function scheduleRerender() {
        var _this10 = this;

        if (!this._didScheduleRerender) {
          this.schedule(function () {
            return _this10.editor.rerender();
          });
          this._didScheduleRerender = true;
        }
      }

      /**
       * Add a didUpdate job to the queue
       *
       * @method scheduleDidRender
       * @public
       */
    }, {
      key: 'scheduleDidUpdate',
      value: function scheduleDidUpdate() {
        var _this11 = this;

        if (!this._didScheduleUpdate) {
          this.schedule(function () {
            return _this11.editor.didUpdate();
          });
          this._didScheduleUpdate = true;
        }
      }
    }, {
      key: 'scheduleAfterRender',
      value: function scheduleAfterRender(callback) {
        this._queues.afterCompletion.push(callback);
      }

      /**
       * Flush any work on the queue. `editor.run` already does this, calling this
       * method directly should not be needed outside `editor.run`.
       *
       * @method complete
       * @private
       */
    }, {
      key: 'complete',
      value: function complete() {
        if (this._didComplete) {
          throw new Error('Post editing can only be completed once');
        }

        this._runCallbacks([this._queues.beforeCompletion]);
        this._didComplete = true;
        this._runCallbacks([this._queues.completion, this._queues.afterCompletion]);
      }
    }, {
      key: '_runCallbacks',
      value: function _runCallbacks(queues) {
        queues.forEach(function (queue) {
          return queue.forEach(function (cb) {
            return cb();
          });
        });
      }
    }]);

    return PostEditor;
  })();

  exports['default'] = PostEditor;
});
define('content-kit-editor/editor/text-expansions', ['exports', 'content-kit-editor/utils/keycodes', 'content-kit-editor/utils/key', 'content-kit-editor/utils/array-utils', 'content-kit-editor/models/types'], function (exports, _contentKitEditorUtilsKeycodes, _contentKitEditorUtilsKey, _contentKitEditorUtilsArrayUtils, _contentKitEditorModelsTypes) {
  'use strict';

  exports.validateExpansion = validateExpansion;
  exports.findExpansion = findExpansion;
  var SPACE = _contentKitEditorUtilsKeycodes['default'].SPACE;

  function replaceWithListSection(editor, listTagName) {
    var section = editor.cursor.offsets.head.section;

    var newSection = editor.run(function (postEditor) {
      var builder = postEditor.builder;

      var listItem = builder.createListItem();
      var listSection = builder.createListSection(listTagName, [listItem]);

      postEditor.replaceSection(section, listSection);
      return listItem;
    });

    editor.cursor.moveToSection(newSection);
  }

  function replaceWithHeaderSection(editor, headingTagName) {
    var section = editor.cursor.offsets.head.section;

    var newSection = editor.run(function (postEditor) {
      var builder = postEditor.builder;

      var newSection = builder.createMarkupSection(headingTagName);
      postEditor.replaceSection(section, newSection);
      return newSection;
    });

    editor.cursor.moveToSection(newSection);
  }

  function validateExpansion(expansion) {
    return !!expansion.trigger && !!expansion.text && !!expansion.run;
  }

  var DEFAULT_TEXT_EXPANSIONS = [{
    trigger: SPACE,
    text: '*',
    run: function run(editor) {
      replaceWithListSection(editor, 'ul');
    }
  }, {
    trigger: SPACE,
    text: '1',
    run: function run(editor) {
      replaceWithListSection(editor, 'ol');
    }
  }, {
    trigger: SPACE,
    text: '1.',
    run: function run(editor) {
      replaceWithListSection(editor, 'ol');
    }
  }, {
    trigger: SPACE,
    text: '##',
    run: function run(editor) {
      replaceWithHeaderSection(editor, 'h2');
    }
  }, {
    trigger: SPACE,
    text: '###',
    run: function run(editor) {
      replaceWithHeaderSection(editor, 'h3');
    }
  }];

  exports.DEFAULT_TEXT_EXPANSIONS = DEFAULT_TEXT_EXPANSIONS;

  function findExpansion(expansions, keyEvent, editor) {
    var key = _contentKitEditorUtilsKey['default'].fromEvent(keyEvent);
    if (!key.isPrintable()) {
      return;
    }

    var _editor$cursor$offsets$head = editor.cursor.offsets.head;
    var section = _editor$cursor$offsets$head.section;
    var offset = _editor$cursor$offsets$head.offset;

    if (section.type !== _contentKitEditorModelsTypes.MARKUP_SECTION_TYPE) {
      return;
    }

    // FIXME this is potentially expensive to calculate and might be better
    // perf to first find expansions matching the trigger and only if matches
    // are found then calculating the _text
    var _text = section.textUntil(offset);
    return (0, _contentKitEditorUtilsArrayUtils.detect)(expansions, function (_ref) {
      var trigger = _ref.trigger;
      var text = _ref.text;
      return key.keyCode === trigger && _text === text;
    });
  }
});
define('content-kit-editor', ['exports', 'content-kit-editor/editor/editor', 'content-kit-editor/commands/bold', 'content-kit-editor/cards/image'], function (exports, _contentKitEditorEditorEditor, _contentKitEditorCommandsBold, _contentKitEditorCardsImage) {
  'use strict';

  exports.registerGlobal = registerGlobal;

  var ContentKit = {
    Editor: _contentKitEditorEditorEditor['default'],
    ImageCard: _contentKitEditorCardsImage['default'],
    BoldCommand: _contentKitEditorCommandsBold['default']
  };

  function registerGlobal(global) {
    global.ContentKit = ContentKit;
  }

  exports.Editor = _contentKitEditorEditorEditor['default'];
  exports['default'] = ContentKit;
});
define('content-kit-editor/models/_markerable', ['exports', 'content-kit-editor/utils/array-utils', 'content-kit-editor/utils/set', 'content-kit-editor/utils/linked-list', 'content-kit-editor/models/_section'], function (exports, _contentKitEditorUtilsArrayUtils, _contentKitEditorUtilsSet, _contentKitEditorUtilsLinkedList, _contentKitEditorModels_section) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x4, _x5, _x6) { var _again = true; _function: while (_again) { var object = _x4, property = _x5, receiver = _x6; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x4 = parent; _x5 = property; _x6 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

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
      this.tagName = tagName;
      this.markers = new _contentKitEditorUtilsLinkedList['default']({
        adoptItem: function adoptItem(m) {
          return m.section = m.parent = _this;
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
      key: 'offsetOfMarker',

      /**
       * @param {Marker}
       * @param {Number} markerOffset The offset relative to the start of the marker
       *
       * @return {Number} The offset relative to the start of this section
       */
      value: function offsetOfMarker(marker, markerOffset) {
        if (marker.section !== this) {
          throw new Error('Cannot get offsetOfMarker for marker that is not child of this');
        }
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

      // puts clones of this.markers into beforeSection and afterSection,
      // all markers before the marker/offset split go in beforeSection, and all
      // after the marker/offset split go in afterSection
      // @return {Array} [beforeSection, afterSection], two new sections
    }, {
      key: '_redistributeMarkers',
      value: function _redistributeMarkers(beforeSection, afterSection, marker) {
        var offset = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];

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

        return [beforeSection, afterSection];
      }
    }, {
      key: 'splitAtMarker',
      value: function splitAtMarker() /*marker, offset=0*/{
        throw new Error('splitAtMarker must be implemented by sub-class');
      }

      /**
       * Split this section's marker (if any) at the given offset, so that
       * there is now a marker boundary at that offset (useful for later applying
       * a markup to a range)
       * @param {Number} sectionOffset The offset relative to start of this section
       * @return {EditObject} An edit object with 'removed' and 'added' keys with arrays of Markers
       */
    }, {
      key: 'splitMarkerAtOffset',
      value: function splitMarkerAtOffset(sectionOffset) {
        var edit = { removed: [], added: [] };

        var _markerPositionAtOffset = this.markerPositionAtOffset(sectionOffset);

        var marker = _markerPositionAtOffset.marker;
        var offset = _markerPositionAtOffset.offset;

        if (!marker) {
          return edit;
        }

        var newMarkers = (0, _contentKitEditorUtilsArrayUtils.filter)(marker.split(offset), function (m) {
          return !m.isEmpty;
        });
        this.markers.splice(marker, 1, newMarkers);

        edit.removed = [marker];
        edit.added = newMarkers;

        return edit;
      }
    }, {
      key: 'splitAtPosition',
      value: function splitAtPosition(position) {
        var marker = position.marker;
        var offsetInMarker = position.offsetInMarker;

        return this.splitAtMarker(marker, offsetInMarker);
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
      key: 'textUntil',
      value: function textUntil(offset) {
        return this.text.slice(0, offset);
      }
    }, {
      key: 'markersFor',

      /**
       * @return {Array} New markers that match the boundaries of the
       * range.
       */
      value: function markersFor(headOffset, tailOffset) {
        var range = { head: { section: this, offset: headOffset },
          tail: { section: this, offset: tailOffset } };

        var markers = [];
        this._markersInRange(range, function (marker, _ref) {
          var markerHead = _ref.markerHead;
          var markerTail = _ref.markerTail;

          var cloned = marker.clone();
          cloned.value = marker.value.slice(markerHead, markerTail);
          markers.push(cloned);
        });
        return markers;
      }
    }, {
      key: 'markupsInRange',
      value: function markupsInRange(range) {
        var markups = new _contentKitEditorUtilsSet['default']();
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

        if (head.section !== this || tail.section !== this) {
          throw new Error('Cannot call #_markersInRange if range expands beyond this');
        }
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
          if (!m.isEmpty) {
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
        var markerWithLength = this.markers.detect(function (marker) {
          return !!marker.length;
        });
        return !markerWithLength;
      }
    }, {
      key: 'text',
      get: function get() {
        return (0, _contentKitEditorUtilsArrayUtils.reduce)(this.markers, function (prev, m) {
          return prev + m.value;
        }, '');
      }
    }, {
      key: 'length',
      get: function get() {
        return this.text.length;
      }
    }]);

    return Markerable;
  })(_contentKitEditorModels_section['default']);

  exports['default'] = Markerable;
});
define('content-kit-editor/models/_section', ['exports', 'content-kit-editor/models/types', 'content-kit-editor/utils/dom-utils', 'content-kit-editor/utils/linked-item'], function (exports, _contentKitEditorModelsTypes, _contentKitEditorUtilsDomUtils, _contentKitEditorUtilsLinkedItem) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  function isMarkerable(section) {
    return !!section.markers;
  }

  function getParentSection(section) {
    return section.parent;
  }

  function hasSubsections(section) {
    return !!section.sections;
  }

  function isSubsection(section) {
    return section.type === _contentKitEditorModelsTypes.LIST_ITEM_TYPE;
  }

  function firstMarkerableChild(section) {
    return section.items.head;
  }

  function lastMarkerableChild(section) {
    return section.items.tail;
  }

  var Section = (function (_LinkedItem) {
    _inherits(Section, _LinkedItem);

    function Section(type) {
      _classCallCheck(this, Section);

      _get(Object.getPrototypeOf(Section.prototype), 'constructor', this).call(this);
      if (!type) {
        throw new Error('Cannot create section without type');
      }
      this.type = type;
    }

    _createClass(Section, [{
      key: 'immediatelyNextMarkerableSection',
      value: function immediatelyNextMarkerableSection() {
        var next = this.next;
        if (next) {
          if (isMarkerable(next)) {
            return next;
          } else if (hasSubsections(next)) {
            var firstChild = firstMarkerableChild(next);
            return firstChild;
          }
        } else if (isSubsection(this)) {
          var parentSection = getParentSection(this);
          return parentSection.immediatelyNextMarkerableSection();
        }
      }
    }, {
      key: 'immediatelyPreviousMarkerableSection',
      value: function immediatelyPreviousMarkerableSection() {
        var prev = this.prev;
        if (!prev) {
          return null;
        }
        if (isMarkerable(prev)) {
          return prev;
        } else if (hasSubsections(prev)) {
          var lastChild = lastMarkerableChild(prev);
          return lastChild;
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
    }]);

    return Section;
  })(_contentKitEditorUtilsLinkedItem['default']);

  exports['default'] = Section;
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
      key: 'remove',
      value: function remove() {
        var _this = this;

        this.editor.run(function (postEditor) {
          return postEditor.removeSection(_this.section);
        });
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
        var _this2 = this;

        return {
          name: this.card.name,
          edit: function edit() {
            return _this2.edit();
          },
          save: function save(payload) {
            _this2.section.payload = payload;

            _this2.editor.didUpdate();
            _this2.display();
          },
          cancel: function cancel() {
            return _this2.display();
          },
          remove: function remove() {
            return _this2.remove();
          }
        };
      }
    }]);

    return CardNode;
  })();

  exports['default'] = CardNode;
});
define('content-kit-editor/models/card', ['exports', 'content-kit-editor/models/_section', 'content-kit-editor/models/types'], function (exports, _contentKitEditorModels_section, _contentKitEditorModelsTypes) {
  'use strict';

  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var Card = (function (_Section) {
    _inherits(Card, _Section);

    function Card(name, payload) {
      _classCallCheck(this, Card);

      _get(Object.getPrototypeOf(Card.prototype), 'constructor', this).call(this, _contentKitEditorModelsTypes.CARD_TYPE);
      this.name = name;
      this.payload = payload;
    }

    return Card;
  })(_contentKitEditorModels_section['default']);

  exports['default'] = Card;
});
define('content-kit-editor/models/image', ['exports', 'content-kit-editor/models/types', 'content-kit-editor/models/_section'], function (exports, _contentKitEditorModelsTypes, _contentKitEditorModels_section) {
  'use strict';

  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var Image = (function (_Section) {
    _inherits(Image, _Section);

    function Image() {
      _classCallCheck(this, Image);

      _get(Object.getPrototypeOf(Image.prototype), 'constructor', this).call(this, _contentKitEditorModelsTypes.IMAGE_SECTION_TYPE);
      this.src = null;
    }

    return Image;
  })(_contentKitEditorModels_section['default']);

  exports['default'] = Image;
});
define('content-kit-editor/models/list-item', ['exports', 'content-kit-editor/models/_markerable', 'content-kit-editor/models/types'], function (exports, _contentKitEditorModels_markerable, _contentKitEditorModelsTypes) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var ListItem = (function (_Markerable) {
    _inherits(ListItem, _Markerable);

    function ListItem(tagName) {
      var markers = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

      _classCallCheck(this, ListItem);

      _get(Object.getPrototypeOf(ListItem.prototype), 'constructor', this).call(this, _contentKitEditorModelsTypes.LIST_ITEM_TYPE, tagName, markers);
    }

    _createClass(ListItem, [{
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
      key: 'splitIntoSections',
      value: function splitIntoSections() {
        return this.parent.splitAtListItem(this);
      }
    }, {
      key: 'clone',
      value: function clone() {
        var item = this.builder.createListItem();
        this.markers.forEach(function (m) {
          return item.markers.append(m.clone());
        });
        return item;
      }
    }]);

    return ListItem;
  })(_contentKitEditorModels_markerable['default']);

  exports['default'] = ListItem;
});
define('content-kit-editor/models/list-section', ['exports', 'content-kit-editor/utils/linked-list', 'content-kit-editor/models/types', 'content-kit-editor/models/_section'], function (exports, _contentKitEditorUtilsLinkedList, _contentKitEditorModelsTypes, _contentKitEditorModels_section) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var DEFAULT_TAG_NAME = 'ul';

  exports.DEFAULT_TAG_NAME = DEFAULT_TAG_NAME;

  var ListSection = (function (_Section) {
    _inherits(ListSection, _Section);

    function ListSection() {
      var _this = this;

      var tagName = arguments.length <= 0 || arguments[0] === undefined ? DEFAULT_TAG_NAME : arguments[0];
      var items = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

      _classCallCheck(this, ListSection);

      _get(Object.getPrototypeOf(ListSection.prototype), 'constructor', this).call(this, _contentKitEditorModelsTypes.LIST_SECTION_TYPE);

      this.tagName = tagName;

      this.items = new _contentKitEditorUtilsLinkedList['default']({
        adoptItem: function adoptItem(i) {
          return i.section = i.parent = _this;
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
      key: 'splitAtListItem',

      // returns [prevListSection, newMarkupSection, nextListSection]
      // prevListSection and nextListSection may be undefined
      value: function splitAtListItem(listItem) {
        if (listItem.parent !== this) {
          throw new Error('Cannot split list section at item that is not a child');
        }
        var prevItem = listItem.prev,
            nextItem = listItem.next;
        var listSection = this;

        var prevListSection = undefined,
            nextListSection = undefined,
            newSection = undefined;

        newSection = this.builder.createMarkupSection('p');
        listItem.markers.forEach(function (m) {
          return newSection.markers.append(m.clone());
        });

        // If there were previous list items, add them to a new list section `prevListSection`
        if (prevItem) {
          prevListSection = this.builder.createListSection(this.tagName);
          var currentItem = listSection.items.head;
          while (currentItem !== listItem) {
            prevListSection.items.append(currentItem.clone());
            currentItem = currentItem.next;
          }
        }

        // if there is a next item, add it and all after it to the `nextListSection`
        if (nextItem) {
          nextListSection = this.builder.createListSection(this.tagName);
          var currentItem = nextItem;
          while (currentItem) {
            nextListSection.items.append(currentItem.clone());
            currentItem = currentItem.next;
          }
        }

        return [prevListSection, newSection, nextListSection];
      }
    }, {
      key: 'isBlank',
      get: function get() {
        return this.items.isEmpty;
      }
    }]);

    return ListSection;
  })(_contentKitEditorModels_section['default']);

  exports['default'] = ListSection;
});
define('content-kit-editor/models/marker', ['exports', 'content-kit-editor/models/types', 'content-kit-editor/utils/dom-utils', 'content-kit-editor/utils/array-utils', 'content-kit-editor/utils/linked-item'], function (exports, _contentKitEditorModelsTypes, _contentKitEditorUtilsDomUtils, _contentKitEditorUtilsArrayUtils, _contentKitEditorUtilsLinkedItem) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x5, _x6, _x7) { var _again = true; _function: while (_again) { var object = _x5, property = _x6, receiver = _x7; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x5 = parent; _x6 = property; _x7 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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
      this.type = _contentKitEditorModelsTypes.MARKER_TYPE;
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
      value: function removeMarkup(markupOrMarkupCallback) {
        var _this2 = this;

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

        (0, _contentKitEditorUtilsArrayUtils.forEach)((0, _contentKitEditorUtilsArrayUtils.filter)(this.markups, callback), function (m) {
          return _this2._removeMarkup(m);
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

      // delete the character at this offset,
      // update the value with the new value
    }, {
      key: 'deleteValueAtOffset',
      value: function deleteValueAtOffset(offset) {
        if (offset < 0 || offset > this.length) {
          throw new Error('Invalid offset "' + offset + '"');
        }
        var left = this.value.slice(0, offset);
        var right = this.value.slice(offset + 1);

        this.value = left + right;
      }
    }, {
      key: 'hasMarkup',
      value: function hasMarkup(tagNameOrMarkup) {
        return !!this.getMarkup(tagNameOrMarkup);
      }
    }, {
      key: 'getMarkup',
      value: function getMarkup(tagNameOrMarkup) {
        var _this3 = this;

        if (typeof tagNameOrMarkup === 'string') {
          var _ret2 = (function () {
            var tagName = (0, _contentKitEditorUtilsDomUtils.normalizeTagName)(tagNameOrMarkup);
            return {
              v: (0, _contentKitEditorUtilsArrayUtils.detect)(_this3.markups, function (markup) {
                return markup.tagName === tagName;
              })
            };
          })();

          if (typeof _ret2 === 'object') return _ret2.v;
        } else {
          var _ret3 = (function () {
            var targetMarkup = tagNameOrMarkup;
            return {
              v: (0, _contentKitEditorUtilsArrayUtils.detect)(_this3.markups, function (markup) {
                return markup === targetMarkup;
              })
            };
          })();

          if (typeof _ret3 === 'object') return _ret3.v;
        }
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
define('content-kit-editor/models/markup-section', ['exports', 'content-kit-editor/models/_markerable', 'content-kit-editor/utils/dom-utils', 'content-kit-editor/models/types'], function (exports, _contentKitEditorModels_markerable, _contentKitEditorUtilsDomUtils, _contentKitEditorModelsTypes) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x4, _x5, _x6) { var _again = true; _function: while (_again) { var object = _x4, property = _x5, receiver = _x6; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x4 = parent; _x5 = property; _x6 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var VALID_MARKUP_SECTION_TAGNAMES = ['p', 'h3', 'h2', 'h1', 'blockquote', 'ul', 'ol'].map(_contentKitEditorUtilsDomUtils.normalizeTagName);
  exports.VALID_MARKUP_SECTION_TAGNAMES = VALID_MARKUP_SECTION_TAGNAMES;
  var DEFAULT_TAG_NAME = VALID_MARKUP_SECTION_TAGNAMES[0];

  exports.DEFAULT_TAG_NAME = DEFAULT_TAG_NAME;
  var MarkupSection = (function (_Markerable) {
    _inherits(MarkupSection, _Markerable);

    function MarkupSection() {
      var tagName = arguments.length <= 0 || arguments[0] === undefined ? DEFAULT_TAG_NAME : arguments[0];
      var markers = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

      _classCallCheck(this, MarkupSection);

      _get(Object.getPrototypeOf(MarkupSection.prototype), 'constructor', this).call(this, _contentKitEditorModelsTypes.MARKUP_SECTION_TYPE, tagName, markers);
    }

    _createClass(MarkupSection, [{
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
    }, {
      key: 'splitAtMarker',
      value: function splitAtMarker(marker) {
        var offset = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
        var beforeSection = this.builder.createMarkupSection(this.tagName, []);
        var afterSection = this.builder.createMarkupSection();

        return this._redistributeMarkers(beforeSection, afterSection, marker, offset);
      }
    }]);

    return MarkupSection;
  })(_contentKitEditorModels_markerable['default']);

  exports['default'] = MarkupSection;
});
define('content-kit-editor/models/markup', ['exports', 'content-kit-editor/utils/dom-utils', 'content-kit-editor/models/types'], function (exports, _contentKitEditorUtilsDomUtils, _contentKitEditorModelsTypes) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var VALID_MARKUP_TAGNAMES = ['b', 'i', 'strong', 'em', 'a', 'li'].map(_contentKitEditorUtilsDomUtils.normalizeTagName);

  exports.VALID_MARKUP_TAGNAMES = VALID_MARKUP_TAGNAMES;

  var Markup = (function () {
    /*
     * @param {Object} attributes key-values
     */

    function Markup(tagName) {
      var attributes = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      _classCallCheck(this, Markup);

      this.tagName = (0, _contentKitEditorUtilsDomUtils.normalizeTagName)(tagName);
      if (Array.isArray(attributes)) {
        throw new Error('Must use attributes object param (not array) to Markup');
      }
      this.attributes = attributes;
      this.type = _contentKitEditorModelsTypes.MARKUP_TYPE;

      if (VALID_MARKUP_TAGNAMES.indexOf(this.tagName) === -1) {
        throw new Error('Cannot create markup of tagName ' + tagName);
      }
    }

    _createClass(Markup, [{
      key: 'hasTag',
      value: function hasTag(tagName) {
        return this.tagName === (0, _contentKitEditorUtilsDomUtils.normalizeTagName)(tagName);
      }
    }], [{
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
define('content-kit-editor/models/post-node-builder', ['exports', 'content-kit-editor/models/post', 'content-kit-editor/models/markup-section', 'content-kit-editor/models/list-section', 'content-kit-editor/models/list-item', 'content-kit-editor/models/image', 'content-kit-editor/models/marker', 'content-kit-editor/models/markup', 'content-kit-editor/models/card', 'content-kit-editor/utils/dom-utils', 'content-kit-editor/utils/array-utils'], function (exports, _contentKitEditorModelsPost, _contentKitEditorModelsMarkupSection, _contentKitEditorModelsListSection, _contentKitEditorModelsListItem, _contentKitEditorModelsImage, _contentKitEditorModelsMarker, _contentKitEditorModelsMarkup, _contentKitEditorModelsCard, _contentKitEditorUtilsDomUtils, _contentKitEditorUtilsArrayUtils) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function cacheKey(tagName, attributes) {
    return (0, _contentKitEditorUtilsDomUtils.normalizeTagName)(tagName) + '-' + (0, _contentKitEditorUtilsArrayUtils.objectToSortedKVArray)(attributes).join('-');
  }

  function addMarkupToCache(cache, markup) {
    cache[cacheKey(markup.tagName, markup.attributes)] = markup;
  }

  function findMarkupInCache(cache, tagName, attributes) {
    var key = cacheKey(tagName, attributes);
    return cache[key];
  }

  var PostNodeBuilder = (function () {
    function PostNodeBuilder() {
      _classCallCheck(this, PostNodeBuilder);

      this.markupCache = {};
    }

    _createClass(PostNodeBuilder, [{
      key: 'createPost',
      value: function createPost() {
        var sections = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

        var post = new _contentKitEditorModelsPost['default']();
        post.builder = this;

        sections.forEach(function (s) {
          return post.sections.append(s);
        });

        return post;
      }
    }, {
      key: 'createBlankPost',
      value: function createBlankPost() {
        return this.createPost([this.createMarkupSection()]);
      }
    }, {
      key: 'createMarkupSection',
      value: function createMarkupSection() {
        var tagName = arguments.length <= 0 || arguments[0] === undefined ? _contentKitEditorModelsMarkupSection.DEFAULT_TAG_NAME : arguments[0];
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
      key: 'createListSection',
      value: function createListSection() {
        var tagName = arguments.length <= 0 || arguments[0] === undefined ? _contentKitEditorModelsListSection.DEFAULT_TAG_NAME : arguments[0];
        var items = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

        tagName = (0, _contentKitEditorUtilsDomUtils.normalizeTagName)(tagName);
        var section = new _contentKitEditorModelsListSection['default'](tagName, items);
        section.builder = this;
        return section;
      }
    }, {
      key: 'createListItem',
      value: function createListItem() {
        var markers = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

        var tagName = (0, _contentKitEditorUtilsDomUtils.normalizeTagName)('li');
        var item = new _contentKitEditorModelsListItem['default'](tagName, markers);
        item.builder = this;
        return item;
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

      /**
       * @param {Object} attributes {key:value}
       */
    }, {
      key: 'createMarkup',
      value: function createMarkup(tagName) {
        var attributes = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        tagName = (0, _contentKitEditorUtilsDomUtils.normalizeTagName)(tagName);

        var markup = findMarkupInCache(this.markupCache, tagName, attributes);
        if (!markup) {
          markup = new _contentKitEditorModelsMarkup['default'](tagName, attributes);
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
define('content-kit-editor/models/post', ['exports', 'content-kit-editor/models/types', 'content-kit-editor/utils/linked-list', 'content-kit-editor/utils/array-utils', 'content-kit-editor/utils/set'], function (exports, _contentKitEditorModelsTypes, _contentKitEditorUtilsLinkedList, _contentKitEditorUtilsArrayUtils, _contentKitEditorUtilsSet) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var Post = (function () {
    function Post() {
      var _this = this;

      _classCallCheck(this, Post);

      this.type = _contentKitEditorModelsTypes.POST_TYPE;
      this.sections = new _contentKitEditorUtilsLinkedList['default']({
        adoptItem: function adoptItem(s) {
          return s.post = s.parent = _this;
        },
        freeItem: function freeItem(s) {
          return s.post = s.parent = null;
        }
      });
    }

    _createClass(Post, [{
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
      key: 'cutMarkers',
      value: function cutMarkers(markers) {
        var firstSection = markers.length && markers[0].section,
            lastSection = markers.length && markers[markers.length - 1].section;

        var currentSection = firstSection;
        var removedSections = [],
            changedSections = (0, _contentKitEditorUtilsArrayUtils.compact)([firstSection, lastSection]);

        if (markers.length !== 0) {
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

          if (firstSection !== lastSection) {
            firstSection.join(lastSection);
            removedSections.push(lastSection);
          }
        }

        return { changedSections: changedSections, removedSections: removedSections };
      }

      /**
       * Invoke `callbackFn` for all markers between the headMarker and tailMarker (inclusive),
       * across sections
       */
    }, {
      key: 'markersFrom',
      value: function markersFrom(headMarker, tailMarker, callbackFn) {
        var currentMarker = headMarker;
        while (currentMarker) {
          callbackFn(currentMarker);

          if (currentMarker === tailMarker) {
            currentMarker = null;
          } else if (currentMarker.next) {
            currentMarker = currentMarker.next;
          } else {
            var nextSection = this._nextMarkerableSection(currentMarker.section);
            // FIXME: This will fail across cards
            currentMarker = nextSection && nextSection.markers.head;
          }
        }
      }
    }, {
      key: 'markupsInRange',
      value: function markupsInRange(range) {
        var markups = new _contentKitEditorUtilsSet['default']();

        this.walkMarkerableSections(range, function (section) {
          (0, _contentKitEditorUtilsArrayUtils.forEach)(section.markupsInRange(range.trimTo(section)), function (m) {
            return markups.add(m);
          });
        });

        return markups.toArray();
      }
    }, {
      key: 'walkMarkerableSections',
      value: function walkMarkerableSections(range, callback) {
        var head = range.head;
        var tail = range.tail;

        var currentSection = head.section;
        while (currentSection) {
          callback(currentSection);

          if (currentSection === tail.section) {
            break;
          } else {
            currentSection = this._nextMarkerableSection(currentSection);
          }
        }
      }

      // return an array of all top-level sections (direct children of `post`)
      // that are wholly contained by the range.
    }, {
      key: 'sectionsContainedBy',
      value: function sectionsContainedBy(range) {
        var head = range.head;
        var tail = range.tail;

        var containedSections = [];

        var findParent = function findParent(child, conditionFn) {
          while (child) {
            if (conditionFn(child)) {
              return child;
            }
            child = child.parent;
          }
        };

        var headTopLevelSection = findParent(head.section, function (s) {
          return !!s.post;
        });
        var tailTopLevelSection = findParent(tail.section, function (s) {
          return !!s.post;
        });

        if (headTopLevelSection === tailTopLevelSection) {
          return containedSections;
        }

        var currentSection = headTopLevelSection.next;
        while (currentSection && currentSection !== tailTopLevelSection) {
          containedSections.push(currentSection);
          currentSection = currentSection.next;
        }

        return containedSections;
      }

      // return the next section that has markers after this one
    }, {
      key: '_nextMarkerableSection',
      value: function _nextMarkerableSection(section) {
        if (!section) {
          return null;
        }
        var isMarkerable = function isMarkerable(s) {
          return !!s.markers;
        };
        var hasChildren = function hasChildren(s) {
          return !!s.items;
        };
        var firstChild = function firstChild(s) {
          return s.items.head;
        };
        var isChild = function isChild(s) {
          return s.parent && !s.post;
        };
        var parent = function parent(s) {
          return s.parent;
        };

        var next = section.next;
        if (next) {
          if (isMarkerable(next)) {
            return next;
          } else if (hasChildren(next)) {
            // e.g. a ListSection
            return firstChild(next);
          } else {
            // e.g. a cardSection that has no children or parent but
            // may have a markerable after it in the AT
            return this._nextMarkerableSection(next);
          }
        } else {
          if (isChild(section)) {
            // if there is no section after this, but this section is a child
            // (e.g. a ListItem inside a ListSection), check for a markerable
            // section after its parent
            return this._nextMarkerableSection(parent(section));
          }
        }
      }
    }, {
      key: 'isBlank',
      get: function get() {
        return this.sections.isEmpty;
      }
    }]);

    return Post;
  })();

  exports['default'] = Post;
});
define('content-kit-editor/models/render-node', ['exports', 'content-kit-editor/utils/linked-item', 'content-kit-editor/utils/linked-list', 'content-kit-editor/utils/dom-utils'], function (exports, _contentKitEditorUtilsLinkedItem, _contentKitEditorUtilsLinkedList, _contentKitEditorUtilsDomUtils) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

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
      this.renderTree = renderTree;
    }

    _createClass(RenderNode, [{
      key: 'isAttached',
      value: function isAttached() {
        if (!this.element) {
          throw new Error('Cannot check if a renderNode is attached without an element.');
        }
        return (0, _contentKitEditorUtilsDomUtils.containsNode)(this.renderTree.rootElement, this.element);
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
      key: 'childNodes',
      get: function get() {
        var _this = this;

        if (!this._childNodes) {
          this._childNodes = new _contentKitEditorUtilsLinkedList['default']({
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
    }]);

    return RenderNode;
  })(_contentKitEditorUtilsLinkedItem['default']);

  exports['default'] = RenderNode;
});
define("content-kit-editor/models/render-tree", ["exports", "content-kit-editor/models/render-node", "content-kit-editor/utils/element-map"], function (exports, _contentKitEditorModelsRenderNode, _contentKitEditorUtilsElementMap) {
  "use strict";

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var RenderTree = (function () {
    function RenderTree(rootPostNode) {
      _classCallCheck(this, RenderTree);

      this._rootNode = this.buildRenderNode(rootPostNode);
      this._elements = new _contentKitEditorUtilsElementMap["default"]();
    }

    /*
     * @return {RenderNode} The root render node in this tree
     */

    _createClass(RenderTree, [{
      key: "getElementRenderNode",

      /*
       * @param {DOMNode} element
       * @return {RenderNode} The renderNode for this element, if any
       */
      value: function getElementRenderNode(element) {
        return this._elements.get(element);
      }
    }, {
      key: "setElementRenderNode",
      value: function setElementRenderNode(element, renderNode) {
        this._elements.set(element, renderNode);
      }
    }, {
      key: "removeElementRenderNode",
      value: function removeElementRenderNode(element) {
        this._elements.remove(element);
      }
    }, {
      key: "buildRenderNode",
      value: function buildRenderNode(postNode) {
        var renderNode = new _contentKitEditorModelsRenderNode["default"](postNode, this);
        postNode.renderNode = renderNode;
        return renderNode;
      }
    }, {
      key: "rootNode",
      get: function get() {
        return this._rootNode;
      }

      /*
       * @return {DOMNode} The root DOM element in this tree
       */
    }, {
      key: "rootElement",
      get: function get() {
        return this.rootNode.element;
      }
    }]);

    return RenderTree;
  })();

  exports["default"] = RenderTree;
});
define('content-kit-editor/models/types', ['exports'], function (exports) {
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
});
define('content-kit-editor/parsers/dom', ['exports', 'content-kit-utils', 'content-kit-editor/models/markup-section', 'content-kit-editor/models/markup', 'content-kit-editor/utils/dom-utils'], function (exports, _contentKitUtils, _contentKitEditorModelsMarkupSection, _contentKitEditorModelsMarkup, _contentKitEditorUtilsDomUtils) {
  'use strict';

  var ELEMENT_NODE = 1;
  var TEXT_NODE = 3;

  var ALLOWED_ATTRIBUTES = ['href', 'rel', 'src'];

  function isEmptyTextNode(node) {
    return node.nodeType === TEXT_NODE && (0, _contentKitUtils.trim)(node.textContent) === '';
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
            var attributes = (0, _contentKitEditorUtilsDomUtils.getAttributes)(currentNode, ALLOWED_ATTRIBUTES);
            markups.push(builder.createMarkup(currentNode.tagName, attributes));
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

      if (post.sections.isEmpty) {
        section = this.builder.createMarkupSection('p');
        post.sections.append(section);
      }

      return post;
    }
  };

  exports['default'] = NewHTMLParser;
});
define("content-kit-editor/parsers/mobiledoc", ["exports", "content-kit-editor/renderers/mobiledoc", "content-kit-editor/utils/array-utils"], function (exports, _contentKitEditorRenderersMobiledoc, _contentKitEditorUtilsArrayUtils) {
  "use strict";

  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
        var attributesArray = _ref22[1];

        var attributesObject = (0, _contentKitEditorUtilsArrayUtils.kvArrayToObject)(attributesArray || []);
        return this.builder.createMarkup(tagName, attributesObject);
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
          case _contentKitEditorRenderersMobiledoc.MOBILEDOC_MARKUP_SECTION_TYPE:
            this.parseMarkupSection(section, post);
            break;
          case _contentKitEditorRenderersMobiledoc.MOBILEDOC_IMAGE_SECTION_TYPE:
            this.parseImageSection(section, post);
            break;
          case _contentKitEditorRenderersMobiledoc.MOBILEDOC_CARD_SECTION_TYPE:
            this.parseCardSection(section, post);
            break;
          case _contentKitEditorRenderersMobiledoc.MOBILEDOC_LIST_SECTION_TYPE:
            this.parseListSection(section, post);
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
        // Strip blank markers after the have been created. This ensures any
        // markup they include has been correctly populated.
        (0, _contentKitEditorUtilsArrayUtils.filter)(section.markers, function (m) {
          return m.isEmpty;
        }).forEach(function (m) {
          section.markers.remove(m);
        });
      }
    }, {
      key: "parseListSection",
      value: function parseListSection(_ref6, post) {
        var _ref62 = _slicedToArray(_ref6, 3);

        var type = _ref62[0];
        var tagName = _ref62[1];
        var items = _ref62[2];

        var section = this.builder.createListSection(tagName);
        post.sections.append(section);
        this.parseListItems(items, section);
      }
    }, {
      key: "parseListItems",
      value: function parseListItems(items, section) {
        var _this3 = this;

        items.forEach(function (i) {
          return _this3.parseListItem(i, section);
        });
      }
    }, {
      key: "parseListItem",
      value: function parseListItem(markers, section) {
        var item = this.builder.createListItem();
        this.parseMarkers(markers, item);
        section.items.append(item);
      }
    }, {
      key: "parseMarkers",
      value: function parseMarkers(markers, parent) {
        var _this4 = this;

        markers.forEach(function (m) {
          return _this4.parseMarker(m, parent);
        });
      }
    }, {
      key: "parseMarker",
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

  exports["default"] = MobiledocParser;
});
define('content-kit-editor/parsers/post', ['exports', 'content-kit-editor/models/types', 'content-kit-editor/parsers/section', 'content-kit-editor/utils/array-utils', 'content-kit-editor/utils/dom-utils', 'content-kit-editor/models/markup'], function (exports, _contentKitEditorModelsTypes, _contentKitEditorParsersSection, _contentKitEditorUtilsArrayUtils, _contentKitEditorUtilsDomUtils, _contentKitEditorModelsMarkup) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

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
        if (_contentKitEditorModelsMarkup['default'].isValidElement(node)) {
          var tagName = node.tagName;
          var attributes = (0, _contentKitEditorUtilsDomUtils.getAttributes)(node);
          return this.builder.createMarkup(tagName, attributes);
        }
      }

      // FIXME should move to the section parser?
      // FIXME the `collectMarkups` logic could simplify the section parser?
    }, {
      key: 'reparseSection',
      value: function reparseSection(section, renderTree) {
        switch (section.type) {
          case _contentKitEditorModelsTypes.LIST_SECTION_TYPE:
            return this.reparseListSection(section, renderTree);
          case _contentKitEditorModelsTypes.LIST_ITEM_TYPE:
            return this.reparseListItem(section, renderTree);
          case _contentKitEditorModelsTypes.MARKUP_SECTION_TYPE:
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
        var _this2 = this;

        listSection.items.forEach(function (li) {
          return _this2.reparseListItem(li, renderTree);
        });
      }
    }, {
      key: '_reparseSectionContainingMarkers',
      value: function _reparseSectionContainingMarkers(section, renderTree) {
        var _this3 = this;

        var element = section.renderNode.element;
        var seenRenderNodes = [];
        var previousMarker = undefined;

        (0, _contentKitEditorUtilsDomUtils.walkTextNodes)(element, function (textNode) {
          var text = textNode.textContent;
          var markups = _this3.collectMarkups(textNode, element);

          var marker = undefined;

          var renderNode = renderTree.getElementRenderNode(textNode);
          if (renderNode) {
            if (text.length) {
              marker = renderNode.postNode;
              marker.value = text;
              marker.markups = markups;
            } else {
              renderNode.scheduleForRemoval();
            }
          } else {
            marker = _this3.builder.createMarker(text, markups);

            renderNode = renderTree.buildRenderNode(marker);
            renderNode.element = textNode;
            renderNode.markClean();

            var previousRenderNode = previousMarker && previousMarker.renderNode;
            section.markers.insertAfter(marker, previousMarker);
            section.renderNode.childNodes.insertAfter(renderNode, previousRenderNode);

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

        var renderNode = section.renderNode.childNodes.head;
        while (renderNode) {
          if (seenRenderNodes.indexOf(renderNode) === -1) {
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
define('content-kit-editor/renderers/editor-dom', ['exports', 'content-kit-editor/models/card-node', 'content-kit-editor/utils/array-utils', 'content-kit-editor/models/types', 'content-kit-editor/utils/string-utils', 'content-kit-editor/utils/dom-utils'], function (exports, _contentKitEditorModelsCardNode, _contentKitEditorUtilsArrayUtils, _contentKitEditorModelsTypes, _contentKitEditorUtilsStringUtils, _contentKitEditorUtilsDomUtils) {
  'use strict';

  var _destroyHooks;

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var NO_BREAK_SPACE = ' ';
  exports.NO_BREAK_SPACE = NO_BREAK_SPACE;
  var SPACE = ' ';

  exports.SPACE = SPACE;
  function createElementFromMarkup(doc, markup) {
    var element = doc.createElement(markup.tagName);
    Object.keys(markup.attributes).forEach(function (k) {
      element.setAttribute(k, markup.attributes[k]);
    });
    return element;
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

  function renderMarkupSection(section) {
    return document.createElement(section.tagName);
  }

  function renderListSection(section) {
    return document.createElement(section.tagName);
  }

  function renderListItem() {
    return document.createElement('li');
  }

  function renderCursorPlaceholder() {
    return document.createElement('br');
  }

  function renderCard() {
    var element = document.createElement('div');
    element.contentEditable = false;
    (0, _contentKitEditorUtilsDomUtils.addClassName)(element, 'ck-card');
    return element;
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

  function renderMarker(marker, element, previousRenderNode) {
    var text = marker.value;

    // If the first marker has a leading space or the last marker has a
    // trailing space, the browser will collapse the space when we position
    // the cursor.
    // See https://github.com/bustlelabs/content-kit-editor/issues/68
    //   and https://github.com/bustlelabs/content-kit-editor/issues/75
    if (!marker.next && (0, _contentKitEditorUtilsStringUtils.endsWith)(text, SPACE)) {
      text = text.substr(0, text.length - 1) + NO_BREAK_SPACE;
    } else if (!marker.prev && (0, _contentKitEditorUtilsStringUtils.startsWith)(text, SPACE)) {
      text = NO_BREAK_SPACE + text.substr(1);
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

  function attachRenderNodeElementToDOM(renderNode, originalElement) {
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
    if (renderNode.element.parentNode) {
      renderNode.element.parentNode.removeChild(renderNode.element);
    }
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
      key: _contentKitEditorModelsTypes.POST_TYPE,
      value: function value(renderNode, post, visit) {
        if (!renderNode.element) {
          renderNode.element = document.createElement('div');
        }
        visit(renderNode, post.sections);
      }
    }, {
      key: _contentKitEditorModelsTypes.MARKUP_SECTION_TYPE,
      value: function value(renderNode, section, visit) {
        var originalElement = renderNode.element;

        // Always rerender the section -- its tag name or attributes may have changed.
        // TODO make this smarter, only rerendering and replacing the element when necessary
        renderNode.element = renderMarkupSection(section);
        attachRenderNodeElementToDOM(renderNode, originalElement);

        if (section.isBlank) {
          renderNode.element.appendChild(renderCursorPlaceholder());
        } else {
          var visitAll = true;
          visit(renderNode, section.markers, visitAll);
        }
      }
    }, {
      key: _contentKitEditorModelsTypes.LIST_SECTION_TYPE,
      value: function value(renderNode, section, visit) {
        var originalElement = renderNode.element;

        renderNode.element = renderListSection(section);
        attachRenderNodeElementToDOM(renderNode, originalElement);

        var visitAll = true;
        visit(renderNode, section.items, visitAll);
      }
    }, {
      key: _contentKitEditorModelsTypes.LIST_ITEM_TYPE,
      value: function value(renderNode, item, visit) {
        // FIXME do we need to do anything special for rerenders?
        renderNode.element = renderListItem();
        attachRenderNodeElementToDOM(renderNode, null);

        if (item.isBlank) {
          renderNode.element.appendChild(renderCursorPlaceholder());
        } else {
          var visitAll = true;
          visit(renderNode, item.markers, visitAll);
        }
      }
    }, {
      key: _contentKitEditorModelsTypes.MARKER_TYPE,
      value: function value(renderNode, marker) {
        var parentElement = undefined;

        if (renderNode.prev) {
          parentElement = getNextMarkerElement(renderNode.prev);
        } else {
          parentElement = renderNode.parent.element;
        }

        renderNode.element = renderMarker(marker, parentElement, renderNode.prev);
      }
    }, {
      key: _contentKitEditorModelsTypes.IMAGE_SECTION_TYPE,
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
      key: _contentKitEditorModelsTypes.CARD_TYPE,
      value: function value(renderNode, section) {
        var originalElement = renderNode.element;
        var editor = this.editor;
        var options = this.options;

        var card = (0, _contentKitEditorUtilsArrayUtils.detect)(this.cards, function (card) {
          return card.name === section.name;
        });

        renderNode.element = renderCard();
        attachRenderNodeElementToDOM(renderNode, originalElement);

        if (card) {
          var cardNode = new _contentKitEditorModelsCardNode['default'](editor, card, section, renderNode.element, options);
          renderNode.cardNode = cardNode;
          cardNode.display();
        } else {
          var env = { name: section.name };
          this.unknownCardHandler(renderNode.element, options, env, section.payload);
        }
      }
    }]);

    return Visitor;
  })();

  var destroyHooks = (_destroyHooks = {}, _defineProperty(_destroyHooks, _contentKitEditorModelsTypes.POST_TYPE, function () /*renderNode, post*/{
    throw new Error('post destruction is not supported by the renderer');
  }), _defineProperty(_destroyHooks, _contentKitEditorModelsTypes.MARKUP_SECTION_TYPE, function (renderNode, section) {
    removeRenderNodeSectionFromParent(renderNode, section);
    removeRenderNodeElementFromParent(renderNode);
  }), _defineProperty(_destroyHooks, _contentKitEditorModelsTypes.LIST_SECTION_TYPE, function (renderNode, section) {
    removeRenderNodeSectionFromParent(renderNode, section);
    removeRenderNodeElementFromParent(renderNode);
  }), _defineProperty(_destroyHooks, _contentKitEditorModelsTypes.LIST_ITEM_TYPE, function (renderNode, li) {
    removeRenderNodeSectionFromParent(renderNode, li);
    removeRenderNodeElementFromParent(renderNode);
  }), _defineProperty(_destroyHooks, _contentKitEditorModelsTypes.MARKER_TYPE, function (renderNode, marker) {
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
  }), _defineProperty(_destroyHooks, _contentKitEditorModelsTypes.IMAGE_SECTION_TYPE, function (renderNode, section) {
    removeRenderNodeSectionFromParent(renderNode, section);
    removeRenderNodeElementFromParent(renderNode);
  }), _defineProperty(_destroyHooks, _contentKitEditorModelsTypes.CARD_TYPE, function (renderNode, section) {
    if (renderNode.cardNode) {
      renderNode.cardNode.teardown();
    }
    removeRenderNodeSectionFromParent(renderNode, section);
    removeRenderNodeElementFromParent(renderNode);
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
        if (!destroyHooks[method]) {
          throw new Error('editor-dom cannot destroy "' + method + '"');
        }
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
    function Renderer(editor, cards, unknownCardHandler, options) {
      _classCallCheck(this, Renderer);

      this.editor = editor;
      this.visitor = new Visitor(editor, cards, unknownCardHandler, options);
      this.nodes = [];
    }

    _createClass(Renderer, [{
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

        var renderNode = renderTree.rootNode;
        var method = undefined,
            postNode = undefined;

        while (renderNode) {
          removeDestroyedChildren(renderNode);
          postNode = renderNode.postNode;

          method = postNode.type;
          if (!this.visitor[method]) {
            throw new Error('EditorDom visitor cannot handle type ' + method);
          }
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
define('content-kit-editor/renderers/mobiledoc', ['exports', 'content-kit-editor/utils/compiler', 'content-kit-editor/utils/array-utils', 'content-kit-editor/models/types'], function (exports, _contentKitEditorUtilsCompiler, _contentKitEditorUtilsArrayUtils, _contentKitEditorModelsTypes) {
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
  var visitor = (_visitor = {}, _defineProperty(_visitor, _contentKitEditorModelsTypes.POST_TYPE, function (node, opcodes) {
    opcodes.push(['openPost']);
    (0, _contentKitEditorUtilsCompiler.visitArray)(visitor, node.sections, opcodes);
  }), _defineProperty(_visitor, _contentKitEditorModelsTypes.MARKUP_SECTION_TYPE, function (node, opcodes) {
    opcodes.push(['openMarkupSection', node.tagName]);
    (0, _contentKitEditorUtilsCompiler.visitArray)(visitor, node.markers, opcodes);
  }), _defineProperty(_visitor, _contentKitEditorModelsTypes.LIST_SECTION_TYPE, function (node, opcodes) {
    opcodes.push(['openListSection', node.tagName]);
    (0, _contentKitEditorUtilsCompiler.visitArray)(visitor, node.items, opcodes);
  }), _defineProperty(_visitor, _contentKitEditorModelsTypes.LIST_ITEM_TYPE, function (node, opcodes) {
    opcodes.push(['openListItem']);
    (0, _contentKitEditorUtilsCompiler.visitArray)(visitor, node.markers, opcodes);
  }), _defineProperty(_visitor, _contentKitEditorModelsTypes.IMAGE_SECTION_TYPE, function (node, opcodes) {
    opcodes.push(['openImageSection', node.src]);
  }), _defineProperty(_visitor, _contentKitEditorModelsTypes.CARD_TYPE, function (node, opcodes) {
    opcodes.push(['openCardSection', node.name, node.payload]);
  }), _defineProperty(_visitor, _contentKitEditorModelsTypes.MARKER_TYPE, function (node, opcodes) {
    opcodes.push(['openMarker', node.closedMarkups.length, node.value]);
    (0, _contentKitEditorUtilsCompiler.visitArray)(visitor, node.openedMarkups, opcodes);
  }), _defineProperty(_visitor, _contentKitEditorModelsTypes.MARKUP_TYPE, function (node, opcodes) {
    opcodes.push(['openMarkup', node.tagName, (0, _contentKitEditorUtilsArrayUtils.objectToSortedKVArray)(node.attributes)]);
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

  exports.detect = detect;
  exports.forEach = forEach;
  exports.any = any;
  exports.filter = filter;
  exports.commonItemLength = commonItemLength;
  exports.compact = compact;
  exports.reduce = reduce;
  exports.objectToSortedKVArray = objectToSortedKVArray;
  exports.kvArrayToObject = kvArrayToObject;
  exports.isArrayEqual = isArrayEqual;
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
    var method = node.type;
    if (!visitor[method]) {
      throw new Error("Cannot visit unknown type " + method);
    }
    visitor[method](node, opcodes);
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
define('content-kit-editor/utils/cursor', ['exports', 'content-kit-editor/utils/selection-utils', 'content-kit-editor/utils/cursor/position', 'content-kit-editor/utils/cursor/range'], function (exports, _contentKitEditorUtilsSelectionUtils, _contentKitEditorUtilsCursorPosition, _contentKitEditorUtilsCursorRange) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  exports.Position = _contentKitEditorUtilsCursorPosition['default'];
  exports.Range = _contentKitEditorUtilsCursorRange['default'];

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
        (0, _contentKitEditorUtilsSelectionUtils.clearSelection)();
      }

      /**
       * @return {Boolean} true when there is either a collapsed cursor in the
       * editor's element or a selection that is contained in the editor's element
       */
    }, {
      key: 'hasCursor',
      value: function hasCursor() {
        return this._hasCollapsedSelection() || this._hasSelection();
      }
    }, {
      key: 'isInCard',
      value: function isInCard() {
        if (!this.hasCursor()) {
          return false;
        }

        var _offsets = this.offsets;
        var head = _offsets.head;
        var tail = _offsets.tail;

        return head && tail && (head._inCard || tail._inCard);
      }
    }, {
      key: 'hasSelection',
      value: function hasSelection() {
        return this._hasSelection();
      }

      /*
       * @return {Range} Cursor#Range object
       */
    }, {
      key: 'moveToSection',

      // moves cursor to the start of the section
      value: function moveToSection(section) {
        var offsetInSection = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

        this.moveToPosition(new _contentKitEditorUtilsCursorPosition['default'](section, offsetInSection));
      }
    }, {
      key: 'selectSections',
      value: function selectSections(sections) {
        var headSection = sections[0],
            tailSection = sections[sections.length - 1];
        var range = _contentKitEditorUtilsCursorRange['default'].create(headSection, 0, tailSection, tailSection.length);
        this.selectRange(range);
      }
    }, {
      key: '_findNodeForPosition',
      value: function _findNodeForPosition(position) {
        var section = position.section;

        var node = undefined,
            offset = undefined;
        if (section.isBlank) {
          node = section.renderNode.element;
          offset = 0;
        } else {
          var marker = position.marker;
          var offsetInMarker = position.offsetInMarker;

          node = marker.renderNode.element;
          offset = offsetInMarker;
        }

        return { node: node, offset: offset };
      }
    }, {
      key: 'selectRange',
      value: function selectRange(range) {
        var head = range.head;
        var tail = range.tail;

        var _findNodeForPosition2 = this._findNodeForPosition(head);

        var headNode = _findNodeForPosition2.node;
        var headOffset = _findNodeForPosition2.offset;

        var _findNodeForPosition3 = this._findNodeForPosition(tail);

        var tailNode = _findNodeForPosition3.node;
        var tailOffset = _findNodeForPosition3.offset;

        this._moveToNode(headNode, headOffset, tailNode, tailOffset);
      }
    }, {
      key: 'selectedText',
      value: function selectedText() {
        return this.selection.toString();
      }
    }, {
      key: 'moveToPosition',
      value: function moveToPosition(position) {
        this.selectRange(new _contentKitEditorUtilsCursorRange['default'](position, position));
      }

      /**
       * @private
       * @param {textNode} node
       * @param {integer} offset
       * @param {textNode} endNode (default: node)
       * @param {integer} endOffset (default: offset)
       */
    }, {
      key: '_moveToNode',
      value: function _moveToNode(node) {
        var offset = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
        var endNode = arguments.length <= 2 || arguments[2] === undefined ? node : arguments[2];
        var endOffset = arguments.length <= 3 || arguments[3] === undefined ? offset : arguments[3];
        return (function () {
          this.clearSelection();

          var range = document.createRange();
          range.setStart(node, offset);
          range.setEnd(endNode, endOffset);

          this.selection.addRange(range);
        }).apply(this, arguments);
      }
    }, {
      key: '_hasSelection',
      value: function _hasSelection() {
        var element = this.editor.element;
        var _selectionRange = this._selectionRange;

        if (!_selectionRange || _selectionRange.collapsed) {
          return false;
        }

        return (0, _contentKitEditorUtilsSelectionUtils.containsNode)(element, this.selection.anchorNode) && (0, _contentKitEditorUtilsSelectionUtils.containsNode)(element, this.selection.focusNode);
      }
    }, {
      key: '_hasCollapsedSelection',
      value: function _hasCollapsedSelection() {
        var _selectionRange = this._selectionRange;

        if (!_selectionRange) {
          return false;
        }

        var element = this.editor.element;
        return (0, _contentKitEditorUtilsSelectionUtils.containsNode)(element, this.selection.anchorNode);
      }
    }, {
      key: 'offsets',
      get: function get() {
        if (!this.hasCursor()) {
          return _contentKitEditorUtilsCursorRange['default'].emptyRange();
        }

        var selection = this.selection;
        var renderTree = this.renderTree;

        var _comparePosition = (0, _contentKitEditorUtilsSelectionUtils.comparePosition)(selection);

        var headNode = _comparePosition.headNode;
        var headOffset = _comparePosition.headOffset;
        var tailNode = _comparePosition.tailNode;
        var tailOffset = _comparePosition.tailOffset;

        var headPosition = _contentKitEditorUtilsCursorPosition['default'].fromNode(renderTree, headNode, headOffset);
        var tailPosition = _contentKitEditorUtilsCursorPosition['default'].fromNode(renderTree, tailNode, tailOffset);

        return new _contentKitEditorUtilsCursorRange['default'](headPosition, tailPosition);
      }
    }, {
      key: 'activeSections',
      get: function get() {
        if (!this.hasCursor()) {
          return [];
        }

        var _offsets2 = this.offsets;
        var head = _offsets2.head;
        var tail = _offsets2.tail;

        return this.post.sections.readRange(head.section, tail.section);
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
define('content-kit-editor/utils/cursor/position', ['exports', 'content-kit-editor/utils/dom-utils', 'content-kit-editor/models/types'], function (exports, _contentKitEditorUtilsDomUtils, _contentKitEditorModelsTypes) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function isSection(postNode) {
    if (!(postNode && postNode.type)) {
      return false;
    }
    return postNode.type === _contentKitEditorModelsTypes.MARKUP_SECTION_TYPE || postNode.type === _contentKitEditorModelsTypes.LIST_ITEM_TYPE || postNode.type === _contentKitEditorModelsTypes.CARD_TYPE;
  }

  function isCardSection(section) {
    return section.type === _contentKitEditorModelsTypes.CARD_TYPE;
  }

  function findParentSectionFromNode(renderTree, node) {
    var renderNode = undefined;
    while (node && node !== renderTree.rootElement) {
      renderNode = renderTree.getElementRenderNode(node);
      if (renderNode && isSection(renderNode.postNode)) {
        return renderNode.postNode;
      }
      node = node.parentNode;
    }
  }

  var Position = (function () {
    function Position(section) {
      var offset = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

      _classCallCheck(this, Position);

      this.section = section;
      this.offset = offset;
      this._inCard = isCardSection(section);
    }

    _createClass(Position, [{
      key: 'clone',
      value: function clone() {
        return new Position(this.section, this.offset);
      }
    }, {
      key: 'isEqual',
      value: function isEqual(position) {
        return this.section === position.section && this.offset === position.offset;
      }
    }, {
      key: 'marker',
      get: function get() {
        return this.markerPosition.marker;
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
        if (!this.section) {
          throw new Error('cannot get markerPosition without a section');
        }
        return this.section.markerPositionAtOffset(this.offset);
      }
    }], [{
      key: 'emptyPosition',
      value: function emptyPosition() {
        return {
          section: null,
          offset: 0,
          _inCard: false,
          marker: null,
          offsetInTextNode: 0,
          _isEmpty: true,
          isEqual: function isEqual(other) {
            return other._isEmpty;
          },
          markerPosition: {}
        };
      }
    }, {
      key: 'fromNode',
      value: function fromNode(renderTree, node, offset) {
        if ((0, _contentKitEditorUtilsDomUtils.isTextNode)(node)) {
          return Position.fromTextNode(renderTree, node, offset);
        } else {
          return Position.fromElementNode(renderTree, node);
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

          if (!section) {
            throw new Error('Could not find parent section for mapped text node "' + textNode.textContent + '"');
          }
          offsetInSection = section.offsetOfMarker(marker, offsetInNode);
        } else {
          // all text nodes should be rendered by markers except:
          //   * text nodes inside cards
          //   * text nodes created by the browser during text input
          // both of these should have rendered parent sections, though
          section = findParentSectionFromNode(renderTree, textNode);
          if (!section) {
            throw new Error('Could not find parent section for un-mapped text node "' + textNode.textContent + '"');
          }

          if (isCardSection(section)) {
            offsetInSection = 0; // we don't care about offsets in card sections
          } else {
              offsetInSection = (0, _contentKitEditorUtilsDomUtils.findOffsetInElement)(section.renderNode.element, textNode, offsetInNode);
            }
        }

        return new Position(section, offsetInSection);
      }
    }, {
      key: 'fromElementNode',
      value: function fromElementNode(renderTree, elementNode) {
        // The browser may change the reported selection to equal the editor's root
        // element if the user clicks an element that is immediately removed,
        // which can happen when clicking to remove a card.
        if (elementNode === renderTree.rootElement) {
          return Position.emptyPosition();
        }

        var section = undefined,
            offsetInSection = 0;

        section = findParentSectionFromNode(renderTree, elementNode);
        if (!section) {
          throw new Error('Could not find parent section from element node');
        }

        // FIXME We assume that offsetInSection will always be 0 because we assume
        // that only empty br tags (offsetInSection=0) will be those that cause
        // us to call `fromElementNode`. This may not be a reliable assumption.
        return new Position(section, offsetInSection);
      }
    }]);

    return Position;
  })();

  exports['default'] = Position;
});
define('content-kit-editor/utils/cursor/range', ['exports', 'content-kit-editor/utils/cursor/position'], function (exports, _contentKitEditorUtilsCursorPosition) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var Range = (function () {
    function Range(head, tail) {
      _classCallCheck(this, Range);

      this.head = head;
      this.tail = tail;
    }

    _createClass(Range, [{
      key: 'trimTo',

      /**
       * @param {Markerable} section
       * @return {Range} A range that is constrained to only the part that
       * includes the section.
       * FIXME -- if the section isn't the head or tail, it's assumed to be
       * wholly contained. It's possible to call `trimTo` with a selection that is
       * outside of the range, though, which would invalidate that assumption.
       */
      value: function trimTo(section) {
        var length = section.length;

        var headOffset = section === this.head.section ? Math.min(this.head.offset, length) : 0;
        var tailOffset = section === this.tail.section ? Math.min(this.tail.offset, length) : length;

        return Range.create(section, headOffset, section, tailOffset);
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
      value: function create(headSection, headOffset, tailSection, tailOffset) {
        return new Range(new _contentKitEditorUtilsCursorPosition['default'](headSection, headOffset), new _contentKitEditorUtilsCursorPosition['default'](tailSection, tailOffset));
      }
    }, {
      key: 'emptyRange',
      value: function emptyRange() {
        return new Range(_contentKitEditorUtilsCursorPosition['default'].emptyPosition(), _contentKitEditorUtilsCursorPosition['default'].emptyPosition());
      }
    }]);

    return Range;
  })();

  exports['default'] = Range;
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

  /**
   * @return {Boolean} true when the child node is contained by (and not
   * the same as) the parent node
   *  see https://github.com/webmodules/node-contains/blob/master/index.js
   */
  function containsNode(parentNode, childNode) {
    var position = parentNode.compareDocumentPosition(childNode);
    return !!(position & Node.DOCUMENT_POSITION_CONTAINED_BY);
  }

  /**
   * converts the element's NamedNodeMap of attrs into
   * an object with key-value pairs
   * @param {DOMNode} element
   * @param {Array} whitelist optional, an array of attributes to constrain to.
   * If not passed (or empty), all attributes are allowed.
   * @return {Object} key-value pairs
   */
  function getAttributes(element) {
    var whitelist = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

    var allowed = function allowed(attrName) {
      return whitelist.length === 0 ? true : whitelist.indexOf(attrName) !== -1;
    };
    var result = {};
    if (element.hasAttributes()) {
      var attributes = element.attributes;
      (0, _contentKitEditorUtilsArrayUtils.forEach)(attributes, function (_ref) {
        var name = _ref.name;
        var value = _ref.value;

        if (allowed(name)) {
          result[name] = value;
        }
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

  function removeClassName(element, className) {
    // FIXME-IE IE10+
    element.classList.remove(className);
  }

  function normalizeTagName(tagName) {
    return tagName.toLowerCase();
  }

  /*
   * @param {Node} elementNode not a text node
   * @param {Node} textNode a text node
   * @param {Number} offsetInTextNode optional, the offset relative to the text node
   * @return {Number} The offset relative to all the text nodes in the element node
   */
  function findOffsetInElement(elementNode, textNode) {
    var offsetInTextNode = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];

    var offset = 0,
        found = false;
    walkTextNodes(elementNode, function (_textNode) {
      if (found) {
        return;
      }
      if (_textNode === textNode) {
        found = true;
        offset += offsetInTextNode;
      } else {
        offset += _textNode.textContent.length;
      }
    });
    if (!found) {
      throw new Error('Unable to find offset of text node in element, it is not a child.');
    }
    return offset;
  }

  function parseHTML(html) {
    var div = document.createElement('div');
    div.innerHTML = html;
    return div;
  }

  exports.detectParentNode = detectParentNode;
  exports.containsNode = containsNode;
  exports.clearChildNodes = clearChildNodes;
  exports.getAttributes = getAttributes;
  exports.getAttributesArray = getAttributesArray;
  exports.walkDOMUntil = walkDOMUntil;
  exports.walkDOM = walkDOM;
  exports.walkTextNodes = walkTextNodes;
  exports.addClassName = addClassName;
  exports.removeClassName = removeClassName;
  exports.normalizeTagName = normalizeTagName;
  exports.isTextNode = isTextNode;
  exports.parseHTML = parseHTML;
  exports.findOffsetInElement = findOffsetInElement;
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
define('content-kit-editor/utils/element-utils', ['exports', 'content-kit-editor/utils/string-utils', 'content-kit-editor/utils/dom-utils'], function (exports, _contentKitEditorUtilsStringUtils, _contentKitEditorUtilsDomUtils) {
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

  function setData(element, name, value) {
    if (element.dataset) {
      element.dataset[name] = value;
    } else {
      var dataName = (0, _contentKitEditorUtilsStringUtils.dasherize)(name);
      return element.setAttribute(dataName, value);
    }
  }

  exports.setData = setData;
  exports.createDiv = createDiv;
  exports.hideElement = hideElement;
  exports.showElement = showElement;
  exports.swapElements = swapElements;
  exports.getEventTargetMatchingTag = getEventTargetMatchingTag;
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
define('content-kit-editor/utils/event-listener', ['exports', 'content-kit-editor/utils/array-utils'], function (exports, _contentKitEditorUtilsArrayUtils) {
  'use strict';

  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

  function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var EventListenerMixin = (function () {
    function EventListenerMixin() {
      _classCallCheck(this, EventListenerMixin);
    }

    _createClass(EventListenerMixin, [{
      key: 'addEventListener',
      value: function addEventListener(context, eventName, listener) {
        if (!this._eventListeners) {
          this._eventListeners = [];
        }
        context.addEventListener(eventName, listener);
        this._eventListeners.push([context, eventName, listener]);
      }
    }, {
      key: 'removeAllEventListeners',
      value: function removeAllEventListeners() {
        var listeners = this._eventListeners || [];
        listeners.forEach(function (_ref) {
          var _ref2 = _toArray(_ref);

          var context = _ref2[0];

          var args = _ref2.slice(1);

          context.removeEventListener.apply(context, _toConsumableArray(args));
        });
      }

      // This is primarily useful for programmatically simulating events on the
      // editor from the tests.
    }, {
      key: 'triggerEvent',
      value: function triggerEvent(context, eventName, event) {
        var matches = (0, _contentKitEditorUtilsArrayUtils.filter)(this._eventListeners, function (_ref3) {
          var _ref32 = _slicedToArray(_ref3, 2);

          var _context = _ref32[0];
          var _eventName = _ref32[1];

          return context === _context && eventName === _eventName;
        });
        matches.forEach(function (_ref4) {
          var _ref42 = _slicedToArray(_ref4, 3);

          var context = _ref42[0];
          var eventName = _ref42[1];
          var listener = _ref42[2];

          listener.call(context, event);
        });
      }
    }]);

    return EventListenerMixin;
  })();

  exports['default'] = EventListenerMixin;
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
define('content-kit-editor/utils/key', ['exports', 'content-kit-editor/utils/keycodes'], function (exports, _contentKitEditorUtilsKeycodes) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var DIRECTION = {
    FORWARD: 1,
    BACKWARD: -1
  };

  exports.DIRECTION = DIRECTION;
  var MODIFIERS = {
    META: 1, // also called "command" on OS X
    CTRL: 2,
    SHIFT: 3
  };

  exports.MODIFIERS = MODIFIERS;
  /**
   * An abstraction around a KeyEvent
   * that key listeners in the editor can use
   * to determine what sort of key was pressed
   */
  var Key = (function () {
    function Key(event) {
      _classCallCheck(this, Key);

      this.keyCode = event.keyCode;
      this.event = event;
    }

    _createClass(Key, [{
      key: 'isEscape',
      value: function isEscape() {
        return this.keyCode === _contentKitEditorUtilsKeycodes['default'].ESC;
      }
    }, {
      key: 'isDelete',
      value: function isDelete() {
        return this.keyCode === _contentKitEditorUtilsKeycodes['default'].BACKSPACE || this.keyCode === _contentKitEditorUtilsKeycodes['default'].DELETE;
      }
    }, {
      key: 'isForwardDelete',
      value: function isForwardDelete() {
        return this.keyCode === _contentKitEditorUtilsKeycodes['default'].DELETE;
      }
    }, {
      key: 'isSpace',
      value: function isSpace() {
        return this.keyCode === _contentKitEditorUtilsKeycodes['default'].SPACE;
      }
    }, {
      key: 'isEnter',
      value: function isEnter() {
        return this.keyCode === _contentKitEditorUtilsKeycodes['default'].ENTER;
      }
    }, {
      key: 'isShift',
      value: function isShift() {
        return this.hasModifier(MODIFIERS.SHIFT);
      }
    }, {
      key: 'hasModifier',
      value: function hasModifier(modifier) {
        switch (modifier) {
          case MODIFIERS.META:
            return this.metaKey;
          case MODIFIERS.CTRL:
            return this.ctrlKey;
          case MODIFIERS.SHIFT:
            return this.shiftKey;
          default:
            throw new Error('Cannot check for unknown modifier ' + modifier);
        }
      }
    }, {
      key: 'isChar',
      value: function isChar(string) {
        return this.keyCode === string.toUpperCase().charCodeAt(0);
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

        var code = this.keyCode;

        return code >= _contentKitEditorUtilsKeycodes['default']['0'] && code <= _contentKitEditorUtilsKeycodes['default']['9'] || // number keys
        this.isSpace() || this.isEnter() || code >= _contentKitEditorUtilsKeycodes['default'].A && code <= _contentKitEditorUtilsKeycodes['default'].Z || // letter keys
        code >= _contentKitEditorUtilsKeycodes['default'].NUMPAD_0 && code <= _contentKitEditorUtilsKeycodes['default'].NUMPAD_9 || // numpad keys
        code >= _contentKitEditorUtilsKeycodes['default'][';'] && code <= _contentKitEditorUtilsKeycodes['default']['`'] || // punctuation
        code >= _contentKitEditorUtilsKeycodes['default']['['] && code <= _contentKitEditorUtilsKeycodes['default']['"'] ||
        // FIXME the IME action seems to get lost when we issue an `editor.deleteSelection`
        // before it (in Chrome)
        code === _contentKitEditorUtilsKeycodes['default'].IME;
      }
    }, {
      key: 'direction',
      get: function get() {
        return this.isForwardDelete() ? DIRECTION.FORWARD : DIRECTION.BACKWARD;
      }
    }, {
      key: 'ctrlKey',
      get: function get() {
        return this.event.ctrlKey;
      }
    }, {
      key: 'metaKey',
      get: function get() {
        return this.event.metaKey;
      }
    }], [{
      key: 'fromEvent',
      value: function fromEvent(event) {
        return new Key(event);
      }
    }]);

    return Key;
  })();

  exports['default'] = Key;
});
define('content-kit-editor/utils/keycodes', ['exports'], function (exports) {
  'use strict';

  exports['default'] = {
    BACKSPACE: 8,
    SPACE: 32,
    ENTER: 13,
    ESC: 27,
    DELETE: 46,
    '0': 48,
    '9': 57,
    A: 65,
    Z: 90,
    'NUMPAD_0': 186,
    'NUMPAD_9': 111,
    ';': 186,
    '`': 192,
    '[': 219,
    '"': 222,

    // Input Method Editor uses multiple keystrokes to display characters.
    // Example on mac: press option-i then i. This fires 2 key events in Chrome
    // with keyCode 229 and displays ˆ and then î.
    // See http://lists.w3.org/Archives/Public/www-dom/2010JulSep/att-0182/keyCode-spec.html#fixed-virtual-key-codes
    IME: 229
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
define('content-kit-editor/utils/linked-list', ['exports'], function (exports) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

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
        if (this._adoptItem) {
          this._adoptItem(item);
        }
      }
    }, {
      key: 'freeItem',
      value: function freeItem(item) {
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
        var nextItem = null;
        if (prevItem) {
          nextItem = prevItem.next;
        } else {
          nextItem = this.head;
        }
        this.insertBefore(item, nextItem);
      }
    }, {
      key: 'insertBefore',
      value: function insertBefore(item, nextItem) {
        if (item.next || item.prev || this.head === item) {
          throw new Error('Cannot insert an item into a list if it is already in a list');
        }
        this.adoptItem(item);

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
      key: 'remove',
      value: function remove(item) {
        this.freeItem(item);

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
      key: 'forEach',
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

        while (item) {
          if (callback(item)) {
            return item;
          }
          item = item.next;
        }
      }
    }, {
      key: 'any',
      value: function any(callback) {
        return !!this.detect(callback);
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
      key: 'isEmpty',
      get: function get() {
        return this.length === 0;
      }
    }]);

    return LinkedList;
  })();

  exports['default'] = LinkedList;
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

  function clearSelection() {
    // FIXME-IE ensure this works on IE 9. It works on IE10.
    window.getSelection().removeAllRanges();
  }

  function comparePosition(selection) {
    var anchorNode = selection.anchorNode;
    var focusNode = selection.focusNode;
    var anchorOffset = selection.anchorOffset;
    var focusOffset = selection.focusOffset;

    var headNode = undefined,
        tailNode = undefined,
        headOffset = undefined,
        tailOffset = undefined;

    var position = anchorNode.compareDocumentPosition(focusNode);

    if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
      headNode = anchorNode;tailNode = focusNode;
      headOffset = anchorOffset;tailOffset = focusOffset;
    } else if (position & Node.DOCUMENT_POSITION_PRECEDING) {
      headNode = focusNode;tailNode = anchorNode;
      headOffset = focusOffset;tailOffset = anchorOffset;
    } else {
      // same node
      headNode = anchorNode;
      tailNode = focusNode;
      headOffset = Math.min(anchorOffset, focusOffset);
      tailOffset = Math.max(anchorOffset, focusOffset);
    }

    return { headNode: headNode, headOffset: headOffset, tailNode: tailNode, tailOffset: tailOffset };
  }

  function restoreRange(range) {
    clearSelection();
    var selection = window.getSelection();
    selection.addRange(range);
  }

  exports.restoreRange = restoreRange;
  exports.containsNode = _contentKitEditorUtilsDomUtils.containsNode;
  exports.clearSelection = clearSelection;
  exports.comparePosition = comparePosition;
});
define("content-kit-editor/utils/set", ["exports"], function (exports) {
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
    }]);

    return Set;
  })();

  exports["default"] = Set;
});
define('content-kit-editor/utils/string-utils', ['exports'], function (exports) {
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

  function endsWith(string, character) {
    return string.charAt(string.length - 1) === character;
  }
});
define('content-kit-editor/views/embed-intent', ['exports', 'content-kit-editor/views/view', 'content-kit-editor/views/toolbar', 'content-kit-editor/utils/element-utils', 'content-kit-editor/commands/unordered-list', 'content-kit-editor/commands/ordered-list', 'content-kit-editor/commands/image', 'content-kit-editor/commands/card'], function (exports, _contentKitEditorViewsView, _contentKitEditorViewsToolbar, _contentKitEditorUtilsElementUtils, _contentKitEditorCommandsUnorderedList, _contentKitEditorCommandsOrderedList, _contentKitEditorCommandsImage, _contentKitEditorCommandsCard) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

  var EmbedIntent = (function (_View) {
    _inherits(EmbedIntent, _View);

    function EmbedIntent() {
      var _this = this;

      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      _classCallCheck(this, EmbedIntent);

      options.classNames = ['ck-embed-intent'];
      _get(Object.getPrototypeOf(EmbedIntent.prototype), 'constructor', this).call(this, options);
      this.rootElement = options.rootElement;

      this.isActive = false;
      this.editor = options.editor;
      this.button = document.createElement('button');
      this.button.className = 'ck-embed-intent-btn';
      this.button.title = 'Insert image or embed...';
      this.element.appendChild(this.button);

      var commands = [new _contentKitEditorCommandsImage['default'](), new _contentKitEditorCommandsCard['default'](), new _contentKitEditorCommandsUnorderedList['default'](this.editor), new _contentKitEditorCommandsOrderedList['default'](this.editor)];

      this.addEventListener(this.button, 'click', function (e) {
        if (_this.isActive) {
          _this.deactivate();
        } else {
          _this.activate();
        }
        e.stopPropagation();
      });

      this.toolbar = new _contentKitEditorViewsToolbar['default']({
        container: this.element,
        embedIntent: this,
        editor: this.editor,
        commands: commands,
        direction: _contentKitEditorViewsToolbar['default'].Direction.RIGHT
      });

      var embedIntentHandler = function embedIntentHandler() {
        var editor = _this.editor;

        if (_this._isDestroyed || editor._isDestroyed) {
          return;
        }
        if (!editor.isEditable) {
          return;
        }

        var showElement = undefined;

        var headSection = _this.editor.cursor.offsets.headSection;

        var headElement = headSection && headSection.renderNode && headSection.renderNode.element;
        if (headElement && headSection.isBlank) {
          showElement = headElement;
        } else if (editor.post.isBlank) {
          showElement = editor.post.renderNode.element;
        }

        if (showElement) {
          _this.showAt(showElement);
        } else {
          _this.hide();
        }
      };

      this.addEventListener(this.rootElement, 'keyup', embedIntentHandler);
      this.addEventListener(document, 'click', function () {
        setTimeout(embedIntentHandler);
      });
      this.addEventListener(window, 'resize', function () {
        _this.reposition();
      });
    }

    _createClass(EmbedIntent, [{
      key: 'hide',
      value: function hide() {
        if (_get(Object.getPrototypeOf(EmbedIntent.prototype), 'hide', this).call(this)) {
          this.deactivate();
        }
      }
    }, {
      key: 'showAt',
      value: function showAt(node) {
        this.atNode = node;
        this.show();
        this.deactivate();
        this.reposition();
      }
    }, {
      key: 'reposition',
      value: function reposition() {
        if (!this.isShowing) {
          return;
        }
        if (computeLayoutStyle(this.rootElement) === LayoutStyle.GUTTER) {
          (0, _contentKitEditorUtilsElementUtils.positionElementToLeftOf)(this.element, this.atNode);
        } else {
          (0, _contentKitEditorUtilsElementUtils.positionElementCenteredIn)(this.element, this.atNode);
        }
      }
    }, {
      key: 'activate',
      value: function activate() {
        if (this.isActive) {
          return;
        }

        this.addClass('activated');
        this.toolbar.show();
        this.isActive = true;
      }
    }, {
      key: 'deactivate',
      value: function deactivate() {
        if (!this.isActive) {
          return;
        }

        this.removeClass('activated');
        this.toolbar.hide();
        this.isActive = false;
      }
    }, {
      key: 'destroy',
      value: function destroy() {
        this.toolbar.destroy();
        _get(Object.getPrototypeOf(EmbedIntent.prototype), 'destroy', this).call(this);
      }
    }]);

    return EmbedIntent;
  })(_contentKitEditorViewsView['default']);

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
define('content-kit-editor/views/prompt', ['exports', 'content-kit-editor/views/view', 'content-kit-editor/utils/selection-utils', 'content-kit-editor/utils/element-utils', 'content-kit-editor/utils/key'], function (exports, _contentKitEditorViewsView, _contentKitEditorUtilsSelectionUtils, _contentKitEditorUtilsElementUtils, _contentKitEditorUtilsKey) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

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
      this.toolbar = options.toolbar;

      this.element.placeholder = options.placeholder || '';
      this.addEventListener(this.element, 'click', function (e) {
        // prevents closing prompt when clicking input
        e.stopPropagation();
      });
      this.addEventListener(this.element, 'keyup', function (e) {
        var key = _contentKitEditorUtilsKey['default'].fromEvent(e);
        var entry = _this.element.value;

        if (entry && _this.range && !key.isShift() && key.isEnter()) {
          (0, _contentKitEditorUtilsSelectionUtils.restoreRange)(_this.range);
          _this.doComplete(entry);
        }
      });

      this.addEventListener(window, 'resize', function () {
        var activeHilite = hiliter.parentNode;
        var range = _this.range;
        if (activeHilite && range) {
          positionHiliteRange(range);
        }
      });
    }

    _createClass(Prompt, [{
      key: 'doComplete',
      value: function doComplete(value) {
        this.hide();
        this.onComplete(value);
        this.toolbar.hide();
      }
    }, {
      key: 'show',
      value: function show() {
        var callback = arguments.length <= 0 || arguments[0] === undefined ? function () {} : arguments[0];
        var toolbar = this.toolbar;

        toolbar.displayPrompt(this);

        this.onComplete = callback;
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
        }
      }
    }, {
      key: 'hide',
      value: function hide() {
        if (hiliter.parentNode) {
          container.removeChild(hiliter);
        }
        this.toolbar.dismissPrompt();
      }
    }]);

    return Prompt;
  })(_contentKitEditorViewsView['default']);

  exports['default'] = Prompt;
});
define('content-kit-editor/views/reversible-prompt-button', ['exports', 'content-kit-editor/views/reversible-toolbar-button'], function (exports, _contentKitEditorViewsReversibleToolbarButton) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var PromptButton = (function (_ReversibleToolbarButton) {
    _inherits(PromptButton, _ReversibleToolbarButton);

    function PromptButton(command, editor) {
      _classCallCheck(this, PromptButton);

      _get(Object.getPrototypeOf(PromptButton.prototype), 'constructor', this).call(this, command, editor);
    }

    _createClass(PromptButton, [{
      key: 'handleClick',
      value: function handleClick(e) {
        var _this = this;

        e.stopPropagation();

        var prompt = this.prompt;

        if (!this.active) {
          prompt.show(function () {
            return _this.exec.apply(_this, arguments);
          });
        } else {
          this.unexec();
        }
      }
    }, {
      key: 'prompt',
      get: function get() {
        return this.toolbar.prompt;
      }
    }]);

    return PromptButton;
  })(_contentKitEditorViewsReversibleToolbarButton['default']);

  exports['default'] = PromptButton;
});
define('content-kit-editor/views/reversible-toolbar-button', ['exports', 'content-kit-editor/utils/mixin', 'content-kit-editor/utils/event-listener', 'content-kit-editor/utils/dom-utils'], function (exports, _contentKitEditorUtilsMixin, _contentKitEditorUtilsEventListener, _contentKitEditorUtilsDomUtils) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var ELEMENT_TYPE = 'button';
  var BUTTON_CLASS_NAME = 'ck-toolbar-btn';
  var ACTIVE_CLASS_NAME = 'active';

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
          this.unexec();
        } else {
          this.exec();
        }
      }
    }, {
      key: 'exec',
      value: function exec() {
        var _command;

        (_command = this.command).exec.apply(_command, arguments);
      }
    }, {
      key: 'unexec',
      value: function unexec() {
        var _command2;

        (_command2 = this.command).unexec.apply(_command2, arguments);
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
      key: 'destroy',
      value: function destroy() {
        this.removeAllEventListeners();
      }
    }, {
      key: 'active',
      set: function set(val) {
        this._active = val;
        var method = this._active ? _contentKitEditorUtilsDomUtils.addClassName : _contentKitEditorUtilsDomUtils.removeClassName;
        method(this.element, ACTIVE_CLASS_NAME);
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
define('content-kit-editor/views/text-format-toolbar', ['exports', 'content-kit-editor/views/toolbar', 'content-kit-editor/views/reversible-toolbar-button', 'content-kit-editor/views/reversible-prompt-button', 'content-kit-editor/commands/bold', 'content-kit-editor/commands/italic', 'content-kit-editor/commands/link', 'content-kit-editor/commands/quote', 'content-kit-editor/commands/heading', 'content-kit-editor/commands/subheading'], function (exports, _contentKitEditorViewsToolbar, _contentKitEditorViewsReversibleToolbarButton, _contentKitEditorViewsReversiblePromptButton, _contentKitEditorCommandsBold, _contentKitEditorCommandsItalic, _contentKitEditorCommandsLink, _contentKitEditorCommandsQuote, _contentKitEditorCommandsHeading, _contentKitEditorCommandsSubheading) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

    var linkCommand = new _contentKitEditorCommandsLink['default'](editor);
    var linkButton = new _contentKitEditorViewsReversiblePromptButton['default'](linkCommand, editor);

    return [headingButton, subheadingButton, quoteButton, boldButton, italicButton, linkButton];
  }

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

      var buttons = makeButtons(this.editor);
      buttons.forEach(function (b) {
        return _this.addButton(b);
      });
    }

    _createClass(TextFormatToolbar, [{
      key: 'handleResize',
      value: function handleResize() {
        if (this.isShowing) {
          this.positionToContent();
        }
      }
    }, {
      key: 'handleSelection',
      value: function handleSelection() {
        this.show();
        this.updateForSelection();
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

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var ELEMENT_TYPE = 'button';
  var BUTTON_CLASS_NAME = 'ck-toolbar-btn';

  var ToolbarButton = (function () {
    function ToolbarButton() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      _classCallCheck(this, ToolbarButton);

      var toolbar = options.toolbar;
      var command = options.command;

      this.command = command;
      this.element = this.createElement();
      this.isActive = false;

      this.addEventListener(this.element, 'click', function (e) {
        command.exec();
        if (toolbar.embedIntent) {
          toolbar.embedIntent.hide();
        }
        e.stopPropagation();
      });
    }

    _createClass(ToolbarButton, [{
      key: 'createElement',
      value: function createElement() {
        var element = document.createElement(ELEMENT_TYPE);
        element.className = BUTTON_CLASS_NAME;
        element.innerHTML = this.command.button;
        element.title = this.command.name;
        return element;
      }
    }, {
      key: 'destroy',
      value: function destroy() {
        this.removeAllEventListeners();
      }
    }]);

    return ToolbarButton;
  })();

  (0, _contentKitEditorUtilsMixin['default'])(ToolbarButton, _contentKitEditorUtilsEventListener['default']);

  exports['default'] = ToolbarButton;
});
define('content-kit-editor/views/toolbar', ['exports', 'content-kit-editor/views/view', 'content-kit-editor/views/prompt', 'content-kit-editor/views/toolbar-button', 'content-kit-editor/utils/element-utils'], function (exports, _contentKitEditorViewsView, _contentKitEditorViewsPrompt, _contentKitEditorViewsToolbarButton, _contentKitEditorUtilsElementUtils) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var ToolbarDirection = {
    TOP: 1,
    RIGHT: 2
  };

  var Toolbar = (function (_View) {
    _inherits(Toolbar, _View);

    function Toolbar() {
      var _this = this;

      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      _classCallCheck(this, Toolbar);

      options.classNames = ['ck-toolbar'];
      _get(Object.getPrototypeOf(Toolbar.prototype), 'constructor', this).call(this, options);

      this.prompt = new _contentKitEditorViewsPrompt['default']({ toolbar: this });

      this.setDirection(options.direction || ToolbarDirection.TOP);
      this.editor = options.editor || null;
      this.embedIntent = options.embedIntent || null;
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
        this.addButton(new _contentKitEditorViewsToolbarButton['default']({ command: command, toolbar: this }));
      }
    }, {
      key: 'addButton',
      value: function addButton(button) {
        button.toolbar = this;
        this.buttons.push(button);
        this.buttonContainerElement.appendChild(button.element);
      }
    }, {
      key: 'displayPrompt',
      value: function displayPrompt(prompt) {
        (0, _contentKitEditorUtilsElementUtils.swapElements)(this.promptContainerElement, this.buttonContainerElement);
        this.promptContainerElement.appendChild(prompt.element);
      }
    }, {
      key: 'dismissPrompt',
      value: function dismissPrompt() {
        (0, _contentKitEditorUtilsElementUtils.swapElements)(this.buttonContainerElement, this.promptContainerElement);
        this.updateForSelection();
      }
    }, {
      key: 'updateForSelection',
      value: function updateForSelection() {
        if (!this.isShowing) {
          return;
        }
        var selection = window.getSelection(),
            range = selection && selection.getRangeAt(0);
        if (!range.collapsed) {
          this.positionToContent(range);
        }
      }
    }, {
      key: 'positionToContent',
      value: function positionToContent() {
        var content = arguments.length <= 0 || arguments[0] === undefined ? window.getSelection().getRangeAt(0) : arguments[0];

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
    }, {
      key: 'destroy',
      value: function destroy() {
        this.buttons.forEach(function (b) {
          return b.destroy();
        });
        this.prompt.destroy();
        _get(Object.getPrototypeOf(Toolbar.prototype), 'destroy', this).call(this);
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
        if (this.isShowing) {
          this.container.removeChild(this.element);
          this.isShowing = false;
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
        this._isDestroyed = true;
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