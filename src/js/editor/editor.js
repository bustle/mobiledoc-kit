import Tooltip from '../views/tooltip';
import PostEditor from './post';

import ImageCard from '../cards/image';

import Key from '../utils/key';
import EventEmitter from '../utils/event-emitter';

import mobiledocParsers from '../parsers/mobiledoc';
import HTMLParser from '../parsers/html';
import DOMParser from '../parsers/dom';
import Renderer  from 'mobiledoc-kit/renderers/editor-dom';
import RenderTree from 'mobiledoc-kit/models/render-tree';
import mobiledocRenderers from '../renderers/mobiledoc';

import { mergeWithOptions } from '../utils/merge';
import { clearChildNodes, addClassName } from '../utils/dom-utils';
import { forEach, filter, contains, isArrayEqual } from '../utils/array-utils';
import { setData } from '../utils/element-utils';
import mixin from '../utils/mixin';
import Cursor from '../utils/cursor';
import Range from '../utils/cursor/range';
import Position from '../utils/cursor/position';
import PostNodeBuilder from '../models/post-node-builder';
import {
  DEFAULT_TEXT_EXPANSIONS, findExpansion, validateExpansion
} from './text-expansions';
import {
  DEFAULT_KEY_COMMANDS, buildKeyCommand, findKeyCommands, validateKeyCommand
} from './key-commands';
import LifecycleCallbacksMixin from '../utils/lifecycle-callbacks';
import { CARD_MODES } from '../models/card';
import { detect } from '../utils/array-utils';
import assert from '../utils/assert';
import MutationHandler from 'mobiledoc-kit/editor/mutation-handler';
import { MOBILEDOC_VERSION } from 'mobiledoc-kit/renderers/mobiledoc';
import EditHistory from 'mobiledoc-kit/editor/edit-history';
import EventManager from 'mobiledoc-kit/editor/event-manager';
import EditState from 'mobiledoc-kit/editor/edit-state';
import HTMLRenderer from 'mobiledoc-html-renderer';
import TextRenderer from 'mobiledoc-text-renderer';
import Logger from 'mobiledoc-kit/utils/logger';
let log = Logger.for('editor'); /* jshint ignore:line */

Logger.enableTypes([
  'mutation-handler',
  'event-manager',
  'editor',
  'parse-utils'
]);
Logger.disable();

export const EDITOR_ELEMENT_CLASS_NAME = '__mobiledoc-editor';

const defaults = {
  placeholder: 'Write here...',
  spellcheck: true,
  autofocus: true,
  undoDepth: 5,
  cards: [],
  atoms: [],
  cardOptions: {},
  unknownCardHandler: ({env}) => {
    throw new Error(`Unknown card encountered: ${env.name}`);
  },
  unknownAtomHandler: ({env}) => {
    throw new Error(`Unknown atom encountered: ${env.name}`);
  },
  mobiledoc: null,
  html: null
};

const CALLBACK_QUEUES = {
  DID_UPDATE: 'didUpdate',
  WILL_RENDER: 'willRender',
  DID_RENDER: 'didRender',
  CURSOR_DID_CHANGE: 'cursorDidChange',
  DID_REPARSE: 'didReparse'
};

class Editor {
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
   *   * cursorDidChange
   *   * didUpdate
   *
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
   * @param {number} [options.undoDepth=5] How many undo levels will be available.
   *        Set to 0 to disable undo/redo functionality.
   * @return {Editor}
   * @public
   */
  constructor(options={}) {
    assert('editor create accepts an options object. For legacy usage passing an element for the first argument, consider the `html` option for loading DOM or HTML posts. For other cases call `editor.render(domNode)` after editor creation',
          (options && !options.nodeType));
    this._views = [];
    this.isEditable = null;
    this._parserPlugins = options.parserPlugins || [];

    // FIXME: This should merge onto this.options
    mergeWithOptions(this, defaults, options);
    this.cards.push(ImageCard);

    DEFAULT_TEXT_EXPANSIONS.forEach(e => this.registerExpansion(e));
    DEFAULT_KEY_COMMANDS.forEach(kc => this.registerKeyCommand(kc));

    this._parser   = new DOMParser(this.builder);
    let {cards, atoms, unknownCardHandler, unknownAtomHandler, cardOptions} = this;
    this._renderer = new Renderer(this, cards, atoms, unknownCardHandler, unknownAtomHandler, cardOptions);

    this.post = this.loadPost();
    this._renderTree = new RenderTree(this.post);

    this._editHistory = new EditHistory(this, this.undoDepth);
    this._eventManager = new EventManager(this);
    this._mutationHandler = new MutationHandler(this);
    this._editState = new EditState(this);
    this.hasRendered = false;
  }

  addView(view) {
    this._views.push(view);
  }

  get builder() {
    if (!this._builder) { this._builder = new PostNodeBuilder(); }
    return this._builder;
  }

  loadPost() {
    let {mobiledoc, html} = this;
    if (mobiledoc) {
      return mobiledocParsers.parse(this.builder, mobiledoc);
    } else if (html) {
      if (typeof html === 'string') {
        let options = {plugins: this._parserPlugins};
        return new HTMLParser(this.builder, options).parse(this.html);
      } else {
        let dom = html;
        return this._parser.parse(dom);
      }
    } else {
      return this.builder.createPost();
    }
  }

  rerender() {
    let postRenderNode = this.post.renderNode;

    // if we haven't rendered this post's renderNode before, mark it dirty
    if (!postRenderNode.element) {
      assert('Must call `render` before `rerender` can be called',
             this.hasRendered);
      postRenderNode.element = this.element;
      postRenderNode.markDirty();
    }

    this.runCallbacks(CALLBACK_QUEUES.WILL_RENDER);
    this._mutationHandler.suspendObservation(() => {
      this._renderer.render(this._renderTree);
    });
    this.runCallbacks(CALLBACK_QUEUES.DID_RENDER);
  }

  /**
   * @param {Element} element The DOM element to render into.
   *        Its contents will be replaced by the editor's rendered post.
   * @public
   */
  render(element) {
    assert('Cannot render an editor twice. Use `rerender` to update the ' +
           'rendering of an existing editor instance.',
           !this.hasRendered);

    addClassName(element, EDITOR_ELEMENT_CLASS_NAME);
    element.spellcheck = this.spellcheck;

    clearChildNodes(element);

    this.element = element;

    if (this.isEditable === null) {
      this.enableEditing();
    }

    this._addTooltip();

    // A call to `run` will trigger the didUpdatePostCallbacks hooks with a
    // postEditor.
    this.run(() => {});

    // Only set `hasRendered` to true after calling `run` to ensure that
    // no cursorDidChange or other callbacks get fired before the editor is
    // done rendering
    this.hasRendered = true;
    this.rerender();

    if (this.autofocus) {
      this.element.focus();
    }
    this._mutationHandler.init();
    this._eventManager.init();
  }

  _addTooltip() {
    this.addView(new Tooltip({
      rootElement: this.element,
      showForTag: 'a'
    }));
  }

  get expansions() {
    if (!this._expansions) { this._expansions = []; }
    return this._expansions;
  }

  get keyCommands() {
    if (!this._keyCommands) { this._keyCommands = []; }
    return this._keyCommands;
  }

  /**
   * @param {Object} expansion The text expansion to register. It must specify a
   * trigger character (e.g. the `<space>` character) and a text string that precedes
   * the trigger (e.g. "*"), and a `run` method that will be passed the
   * editor instance when the text expansion is invoked
   * @public
   */
  registerExpansion(expansion) {
    assert('Expansion is not valid', validateExpansion(expansion));
    this.expansions.push(expansion);
  }

  /**
   * @param {Object} keyCommand The key command to register. It must specify a
   * modifier key (meta, ctrl, etc), a string representing the ascii key, and
   * a `run` method that will be passed the editor instance when the key command
   * is invoked
   * @public
   */
  registerKeyCommand(rawKeyCommand) {
    const keyCommand = buildKeyCommand(rawKeyCommand);
    assert('Key Command is not valid', validateKeyCommand(keyCommand));
    this.keyCommands.unshift(keyCommand);
  }

  /**
   * @param {KeyEvent} [event]
   * @private
   */
  handleDeletion(event=null) {
    let { range } = this;

    if (!range.isCollapsed) {
      this.run(postEditor => {
        let nextPosition = postEditor.deleteRange(range);
        postEditor.setRange(new Range(nextPosition));
      });
    } else if (event) {
      let key = Key.fromEvent(event);
      this.run(postEditor => {
        let nextPosition = postEditor.deleteFrom(range.head, key.direction);
        let newRange = new Range(nextPosition);
        postEditor.setRange(newRange);
      });
    }
  }

  handleNewline(event) {
    if (!this.hasCursor()) { return; }

    event.preventDefault();

    let { range } = this;
    this.run(postEditor => {
      let cursorSection;
      if (!range.isCollapsed) {
        let nextPosition  = postEditor.deleteRange(range);
        cursorSection = nextPosition.section;
        if (cursorSection && cursorSection.isBlank) {
          postEditor.setRange(new Range(cursorSection.headPosition()));
          return;
        }
      }
      cursorSection = postEditor.splitSection(range.head)[1];
      postEditor.setRange(new Range(cursorSection.headPosition()));
    });
  }

  showPrompt(message, defaultValue, callback) {
    callback(window.prompt(message, defaultValue));
  }

  didUpdate() {
    this.trigger('update');
  }

  selectSections(sections=[]) {
    if (sections.length) {
      let headSection = sections[0],
          tailSection = sections[sections.length - 1];
      this.selectRange(new Range(headSection.headPosition(),
                                 tailSection.tailPosition()));
    } else {
      this.cursor.clearSelection();
    }
    this._reportSelectionState();
  }

  selectRange(range) {
    this.renderRange(range);
  }

  /**
   * If the range is different from the previous range, this method will
   * fire 'rangeDidChange'-related callbacks
   * @private
   */
  renderRange(range) {
    let prevRange = this._range;
    if (range.isBlank) {
      this.cursor.clearSelection();
    } else {
      this.cursor.selectRange(range);
    }
    this.range = range;

    if (prevRange && !prevRange.isEqual(range)) {
      this._rangeDidChange();
    }
  }

  get cursor() {
    return new Cursor(this);
  }

  /**
   * Return the current range for the editor (may be cached).
   * The #_resetRange method forces a re-read of
   * the range from DOM.
   * @return {Range}
   */
  get range() {
    if (this._range) {
      return this._range;
    }
    let range = this.cursor.offsets;
    if (!range.isBlank) {
      this._range = range;
    }
    return range;
  }

  set range(newRange) {
    this._range = newRange;
  }

  /**
   * force re-reading range from dom
   * Fires `rangeDidChange`-related callbacks if the range is different
   * @private
   */
  _resetRange() {
    let prevRange = this._range;
    delete this._range;
    let range = this.range;
    if (!range.isEqual(prevRange)) {
      this._rangeDidChange();
    }
  }

  setPlaceholder(placeholder) {
    setData(this.element, 'placeholder', placeholder);
  }

  _reparsePost() {
    let post = this._parser.parse(this.element);
    this.run(postEditor => {
      postEditor.removeAllSections();
      postEditor.migrateSectionsFromPost(post);
      postEditor.setRange(Range.blankRange());
    });

    this.runCallbacks(CALLBACK_QUEUES.DID_REPARSE);
    this.didUpdate();
  }

  _reparseSections(sections=[]) {
    let currentRange;
    sections.forEach(section => {
      this._parser.reparseSection(section, this._renderTree);
    });
    this._removeDetachedSections();

    if (this._renderTree.isDirty) {
      currentRange = this.range;
    }

    // force the current snapshot's range to remain the same rather than
    // rereading it from DOM after the new character is applied and the browser
    // updates the cursor position
    let range = this._editHistory._pendingSnapshot.range;
    this.run(() => {
      this._editHistory._pendingSnapshot.range = range;
    });
    this.rerender();
    if (currentRange) {
      this.selectRange(currentRange);
    }

    this.runCallbacks(CALLBACK_QUEUES.DID_REPARSE);
    this.didUpdate();
  }

  // FIXME this should be able to be removed now -- if any sections are detached,
  // it's due to a bug in the code.
  _removeDetachedSections() {
    forEach(
      filter(this.post.sections, s => !s.renderNode.isAttached()),
      s => s.renderNode.scheduleForRemoval()
    );
  }

  /**
   * @return {array} The sections from the cursor's selection start to the selection end
   */
  get activeSections() {
    return this._editState.activeSections;
  }

  get activeSection() {
    const { activeSections } = this;
    return activeSections[activeSections.length - 1];
  }

  detectMarkupInRange(range, markupTagName) {
    let markups = this.post.markupsInRange(range);
    return detect(markups, markup => {
      return markup.hasTag(markupTagName);
    });
  }

  get activeMarkups() {
    return this._editState.activeMarkups;
  }

  hasActiveMarkup(markup) {
    markup = this.builder._coerceMarkup(markup);
    return contains(this.activeMarkups, markup);
  }

  get markupsInSelection() {
    // FIXME deprecate this
    return this.activeMarkups;
  }

  /**
   * @public
   *
   * @param {string} version The mobiledoc version to serialize to.
   * @return {Mobiledoc} Serialized mobiledoc
   */
  serialize(version=MOBILEDOC_VERSION) {
    return this.serializePost(this.post, 'mobiledoc', {version});
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
  serializeTo(format) {
    let post = this.post;
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
  serializePost(post, format, options={}) {
    const validFormats = ['mobiledoc', 'html', 'text'];
    assert(`Unrecognized serialiation format ${format}`,
           contains(validFormats, format));

    if (format === 'mobiledoc') {
      let version = options.version || MOBILEDOC_VERSION;
      return mobiledocRenderers.render(post, version);
    } else {
      let rendered;
      let mobiledoc = this.serializePost(post, 'mobiledoc');
      let unknownCardHandler = () => {};
      let unknownAtomHandler = () => {};
      let rendererOptions = { unknownCardHandler, unknownAtomHandler };

      switch (format) {
        case 'html':
          rendered = new HTMLRenderer(rendererOptions).render(mobiledoc);
          return rendered.result;
        case 'text':
          rendered = new TextRenderer(rendererOptions).render(mobiledoc);
          return rendered.result;
      }
    }
  }

  removeAllViews() {
    this._views.forEach((v) => v.destroy());
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
  hasCursor() {
    return this.cursor.hasCursor();
  }

  /**
   * Tears down the editor's attached event listeners and views.
   * @public
   */
  destroy() {
    this._isDestroyed = true;
    if (this.hasCursor()) {
      this.cursor.clearSelection();
      this.element.blur(); // FIXME This doesn't blur the element on IE11
    }
    this._mutationHandler.destroy();
    this._eventManager.destroy();
    this.removeAllViews();
    this._renderer.destroy();
  }

  /**
   * Keep the user from directly editing the post using the keyboard and mouse.
   * Modification via the programmatic API is still permitted.
   * @see Editor#enableEditing
   * @public
   */
  disableEditing() {
    this.isEditable = false;
    if (this.element) {
      this.element.setAttribute('contentEditable', false);
      this.setPlaceholder('');
    }
  }

  /**
   * Allow the user to directly interact with editing a post via keyboard and mouse input.
   * Editor instances are editable by default. Use this method to re-enable
   * editing after disabling it.
   * @see Editor#disableEditing
   * @public
   */
  enableEditing() {
    this.isEditable = true;
    if (this.element) {
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
  editCard(cardSection) {
    this._setCardMode(cardSection, CARD_MODES.EDIT);
  }

  /**
   * Change a cardSection into display mode
   * If called before the card has been rendered, it will be marked so that
   * it is rendered in display mode when it gets rendered.
   * @param {CardSection} cardSection
   * @return undefined
   * @public
   */
  displayCard(cardSection) {
    this._setCardMode(cardSection, CARD_MODES.DISPLAY);
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
  run(callback) {
    // FIXME we must keep track of the activeSectionTagNames before and after
    // changing the post so that we can fire the cursorDidChange callback if the
    // active sections changed.
    // This is necessary for the ember-mobiledoc-editor's toolbar to update
    // when toggling a section on/off (it only listens to the cursorDidChange
    // action)
    let activeSectionTagNames = this.activeSections.map(s => s.tagName);

    const postEditor = new PostEditor(this);
    postEditor.begin();
    this._editHistory.snapshot();
    const result = callback(postEditor);
    this.runCallbacks(CALLBACK_QUEUES.DID_UPDATE, [postEditor]);
    postEditor.complete();
    if (postEditor._shouldCancelSnapshot) {
      this._editHistory._pendingSnapshot = null;
    }
    this._editHistory.storeSnapshot();

    // FIXME This should be handled within the EditState object
    let newActiveSectionTagNames = this.activeSections.map(s => s.tagName);
    if (!isArrayEqual(activeSectionTagNames, newActiveSectionTagNames)) {
      this._activeSectionsDidChange();
    }

    return result;
  }

  /**
   * @public
   *
   * @param {Function} callback Called with `postEditor` as its argument.
   */
  didUpdatePost(callback) {
    this.addCallback(CALLBACK_QUEUES.DID_UPDATE, callback);
  }

  /**
   * @param {Function} callback This callback will be called before the editor
   *        is rendered.
   * @public
   */
  willRender(callback) {
    this.addCallback(CALLBACK_QUEUES.WILL_RENDER, callback);
  }

  /**
   * @param {Function} callback This callback will be called after the editor
   *        is rendered.
   * @public
   */
  didRender(callback) {
    this.addCallback(CALLBACK_QUEUES.DID_RENDER, callback);
  }

  /**
   * @param {Function} callback This callback will be called after the cursor
   *        position (or selection) changes.
   * @public
   */
  cursorDidChange(callback) {
    this.addCallback(CALLBACK_QUEUES.CURSOR_DID_CHANGE, callback);
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
  _reportSelectionState() {
    this._cursorDidChange();
  }

  _rangeDidChange() {
    this._cursorDidChange();
    this._resetActiveMarkups();
  }

  _cursorDidChange() {
    if (this.hasRendered) {
      this.runCallbacks(CALLBACK_QUEUES.CURSOR_DID_CHANGE);
    }
  }

  /**
   * Clear the cached active markups and force a re-read of the markups
   * from the current range.
   * If markups have changed, fires an event
   * @private
   */
  _resetActiveMarkups() {
    let activeMarkupsDidChange = this._editState.resetActiveMarkups();

    if (activeMarkupsDidChange) {
      this._activeMarkupsDidChange();
    }
  }

  _activeMarkupsDidChange() {
    // FIXME use a different callback queue for _activeMarkupsDidChange
    // Using the cursorDidChange callback is necessary for the ember-mobiledoc-editor to notice
    // when markups change but the cursor doesn't (i.e., type cmd-B)
    this._cursorDidChange();
  }

  _activeSectionsDidChange() {
    // FIXME use a different callback queue for _activeSectionsDidChange
    // Using the cursorDidChange callback is necessary for the ember-mobiledoc-editor to notice
    // when markups change but the cursor doesn't (i.e., type cmd-B)
    this._cursorDidChange();
  }

  _insertEmptyMarkupSectionAtCursor() {
    this.run(postEditor => {
      const section = postEditor.builder.createMarkupSection('p');
      postEditor.insertSectionBefore(this.post.sections, section);
      postEditor.setRange(Range.fromSection(section));
    });
  }

  toggleMarkup(markup) {
    markup = this.post.builder.createMarkup(markup);
    if (this.range.isCollapsed) {
      this._editState.toggleMarkupState(markup);
      this._activeMarkupsDidChange();
    } else {
      this.run(postEditor => postEditor.toggleMarkup(markup));
    }
  }

  /**
   * Finds and runs first matching text expansion for this event
   * @param {Event} event keyboard event
   * @return {Boolean} True when an expansion was found and run
   * @private
   */
  handleExpansion(keyEvent) {
    let expansion = findExpansion(this.expansions, keyEvent, this);
    if (expansion) {
      expansion.run(this);
      return true;
    }
    return false;
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
  handleKeyCommand(event) {
    const keyCommands = findKeyCommands(this.keyCommands, event);
    for (let i=0; i<keyCommands.length; i++) {
      let keyCommand = keyCommands[i];
      if (keyCommand.run(this) !== false) {
        event.preventDefault();
        return true;
      }
    }
    return false;
  }

  insertText(text) {
    let { activeMarkups, range, range: { head: position } } = this;

    this.run(postEditor => {
      if (!range.isCollapsed) {
        position = postEditor.deleteRange(range);
      }

      postEditor.insertTextWithMarkup(position, text, activeMarkups);
    });
  }

  /**
   * @param {integer} x x-position in viewport
   * @param {integer} y y-position in viewport
   * @return {Position|null}
   */
  positionAtPoint(x, y) {
    return Position.atPoint(x, y, this);
  }

  /**
   * @private
   */
  _setCardMode(cardSection, mode) {
    const renderNode = cardSection.renderNode;
    if (renderNode && renderNode.isRendered) {
      const cardNode = renderNode.cardNode;
      cardNode[mode]();
    } else {
      cardSection.setInitialMode(mode);
    }
  }

  triggerEvent(context, eventName, event) {
    this._eventManager._trigger(context, eventName, event);
  }
}

mixin(Editor, EventEmitter);
mixin(Editor, LifecycleCallbacksMixin);

export default Editor;
