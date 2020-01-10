'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _viewsTooltip = require('../views/tooltip');

var _post = require('./post');

var _cardsImage = require('../cards/image');

var _utilsKey = require('../utils/key');

var _parsersMobiledoc = require('../parsers/mobiledoc');

var _parsersHtml = require('../parsers/html');

var _parsersDom = require('../parsers/dom');

var _renderersEditorDom = require('../renderers/editor-dom');

var _modelsRenderTree = require('../models/render-tree');

var _renderersMobiledoc = require('../renderers/mobiledoc');

var _utilsMerge = require('../utils/merge');

var _utilsDomUtils = require('../utils/dom-utils');

var _utilsArrayUtils = require('../utils/array-utils');

var _utilsElementUtils = require('../utils/element-utils');

var _utilsCursor = require('../utils/cursor');

var _utilsCursorRange = require('../utils/cursor/range');

var _utilsCursorPosition = require('../utils/cursor/position');

var _utilsEnvironment = require('../utils/environment');

var _modelsPostNodeBuilder = require('../models/post-node-builder');

var _textInputHandlers = require('./text-input-handlers');

var _keyCommands = require('./key-commands');

var _modelsCard = require('../models/card');

var _utilsAssert = require('../utils/assert');

var _editorMutationHandler = require('../editor/mutation-handler');

var _editorEditHistory = require('../editor/edit-history');

var _editorEventManager = require('../editor/event-manager');

var _editorEditState = require('../editor/edit-state');

var _mobiledocDomRenderer = require('mobiledoc-dom-renderer');

var _mobiledocTextRenderer = require('mobiledoc-text-renderer');

var _modelsLifecycleCallbacks = require('../models/lifecycle-callbacks');

var _utilsLogManager = require('../utils/log-manager');

var _utilsToRange = require('../utils/to-range');

var _utilsMobiledocError = require('../utils/mobiledoc-error');

// This export may later be deprecated, but re-export it from the renderer here
// for consumers that may depend on it.
Object.defineProperty(exports, 'EDITOR_ELEMENT_CLASS_NAME', {
  enumerable: true,
  get: function get() {
    return _renderersEditorDom.EDITOR_ELEMENT_CLASS_NAME;
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

    throw new _utilsMobiledocError['default']('Unknown card encountered: ' + env.name);
  },
  unknownAtomHandler: function unknownAtomHandler(_ref2) {
    var env = _ref2.env;

    throw new _utilsMobiledocError['default']('Unknown atom encountered: ' + env.name);
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

    (0, _utilsAssert['default'])('editor create accepts an options object. For legacy usage passing an element for the first argument, consider the `html` option for loading DOM or HTML posts. For other cases call `editor.render(domNode)` after editor creation', options && !options.nodeType);
    this._views = [];
    this.isEditable = true;
    this._parserPlugins = options.parserPlugins || [];

    // FIXME: This should merge onto this.options
    (0, _utilsMerge.mergeWithOptions)(this, defaults, options);
    this.cards.push(_cardsImage['default']);

    _keyCommands.DEFAULT_KEY_COMMANDS.forEach(function (kc) {
      return _this.registerKeyCommand(kc);
    });

    this._logManager = new _utilsLogManager['default']();
    this._parser = new _parsersDom['default'](this.builder);
    var cards = this.cards;
    var atoms = this.atoms;
    var unknownCardHandler = this.unknownCardHandler;
    var unknownAtomHandler = this.unknownAtomHandler;
    var cardOptions = this.cardOptions;

    this._renderer = new _renderersEditorDom['default'](this, cards, atoms, unknownCardHandler, unknownAtomHandler, cardOptions);

    this.post = this.loadPost();
    this._renderTree = new _modelsRenderTree['default'](this.post);

    this._editHistory = new _editorEditHistory['default'](this, this.undoDepth, this.undoBlockTimeout);
    this._eventManager = new _editorEventManager['default'](this);
    this._mutationHandler = new _editorMutationHandler['default'](this);
    this._editState = new _editorEditState['default'](this);
    this._callbacks = new _modelsLifecycleCallbacks['default']((0, _utilsArrayUtils.values)(CALLBACK_QUEUES));
    this._beforeHooks = { toggleMarkup: [] };

    _textInputHandlers.DEFAULT_TEXT_INPUT_HANDLERS.forEach(function (handler) {
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
        return _parsersMobiledoc['default'].parse(this.builder, mobiledoc);
      } else if (html) {
        if (typeof html === 'string') {
          var options = { plugins: this._parserPlugins };
          return new _parsersHtml['default'](this.builder, options).parse(this.html);
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
        (0, _utilsAssert['default'])('Must call `render` before `rerender` can be called', this.hasRendered);
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
      (0, _utilsAssert['default'])('Cannot render an editor twice. Use `rerender` to update the ' + 'rendering of an existing editor instance.', !this.hasRendered);

      element.spellcheck = this.spellcheck;

      (0, _utilsDomUtils.clearChildNodes)(element);

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
      this.addView(new _viewsTooltip['default']({
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
      var keyCommand = (0, _keyCommands.buildKeyCommand)(rawKeyCommand);
      (0, _utilsAssert['default'])('Key Command is not valid', (0, _keyCommands.validateKeyCommand)(keyCommand));
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
      var _ref4 = arguments.length <= 0 || arguments[0] === undefined ? { direction: _utilsKey.DIRECTION.BACKWARD, unit: 'char' } : arguments[0];

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
      range = (0, _utilsToRange['default'])(range);

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
      (0, _utilsElementUtils.setData)(this.element, 'placeholder', placeholder);
    }
  }, {
    key: '_reparsePost',
    value: function _reparsePost() {
      var post = this._parser.parse(this.element);
      this.run(function (postEditor) {
        postEditor.removeAllSections();
        postEditor.migrateSectionsFromPost(post);
        postEditor.setRange(_utilsCursorRange['default'].blankRange());
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
      (0, _utilsArrayUtils.forEach)((0, _utilsArrayUtils.filter)(this.post.sections, function (s) {
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
      return (0, _utilsArrayUtils.detect)(markups, function (markup) {
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
          var tagName = (0, _utilsDomUtils.normalizeTagName)(markup);
          matchesFn = function (m) {
            return m.tagName === tagName;
          };
        })();
      } else {
        matchesFn = function (m) {
          return m === markup;
        };
      }

      return !!(0, _utilsArrayUtils.detect)(this.activeMarkups, matchesFn);
    }

    /**
     * @param {String} version The mobiledoc version to serialize to.
     * @return {Mobiledoc} Serialized mobiledoc
     * @public
     */
  }, {
    key: 'serialize',
    value: function serialize() {
      var version = arguments.length <= 0 || arguments[0] === undefined ? _renderersMobiledoc.MOBILEDOC_VERSION : arguments[0];

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
      (0, _utilsAssert['default'])('Unrecognized serialization format ' + format, (0, _utilsArrayUtils.contains)(validFormats, format));

      if (format === 'mobiledoc') {
        var version = options.version || _renderersMobiledoc.MOBILEDOC_VERSION;
        return _renderersMobiledoc['default'].render(post, version);
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
              if (_utilsEnvironment['default'].hasDOM()) {
                rendered = new _mobiledocDomRenderer['default'](rendererOptions).render(mobiledoc);
                result = '<div>' + (0, _utilsDomUtils.serializeHTML)(rendered.result) + '</div>';
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
        this.selectRange(_utilsCursorRange['default'].blankRange());
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
      this._setCardMode(cardSection, _modelsCard.CARD_MODES.EDIT);
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
      this._setCardMode(cardSection, _modelsCard.CARD_MODES.DISPLAY);
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
      var postEditor = new _post['default'](this);
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
      var keyCommands = (0, _keyCommands.findKeyCommands)(this.keyCommands, event);
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
      return _utilsCursorPosition['default'].atPoint(x, y, this);
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
        this._builder = new _modelsPostNodeBuilder['default']();
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
      return new _utilsCursor['default'](this);
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