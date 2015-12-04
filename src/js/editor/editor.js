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
import { forEach, filter, contains } from '../utils/array-utils';
import { setData } from '../utils/element-utils';
import mixin from '../utils/mixin';
import EventListenerMixin from '../utils/event-listener';
import Cursor from '../utils/cursor';
import Range from '../utils/cursor/range';
import PostNodeBuilder from '../models/post-node-builder';
import {
  DEFAULT_TEXT_EXPANSIONS, findExpansion, validateExpansion
} from './text-expansions';
import {
  DEFAULT_KEY_COMMANDS, buildKeyCommand, findKeyCommands, validateKeyCommand
} from './key-commands';
import { capitalize } from '../utils/string-utils';
import LifecycleCallbacksMixin from '../utils/lifecycle-callbacks';
import { CARD_MODES } from '../models/card';
import { detect } from '../utils/array-utils';
import {
  parsePostFromPaste,
  setClipboardCopyData
} from '../utils/paste-utils';
import { DIRECTION } from 'mobiledoc-kit/utils/key';
import { TAB, SPACE } from 'mobiledoc-kit/utils/characters';
import assert from '../utils/assert';

export const EDITOR_ELEMENT_CLASS_NAME = '__mobiledoc-editor';

const ELEMENT_EVENTS = ['keydown', 'keyup', 'cut', 'copy', 'paste'];
const DOCUMENT_EVENTS= ['mouseup'];

const defaults = {
  placeholder: 'Write here...',
  spellcheck: true,
  autofocus: true,
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

/**
 * @class Editor
 * An individual Editor
 * @param element `Element` node
 * @param options hash of options
 */
class Editor {
  constructor(options={}) {
    assert('editor create accepts an options object. For legacy usage passing an element for the first argument, consider the `html` option for loading DOM or HTML posts. For other cases call `editor.render(domNode)` after editor creation',
          (options && !options.nodeType));
    this._elementListeners = [];
    this._views = [];
    this.isEditable = null;
    this._parserPlugins = options.parserPlugins || [];

    // FIXME: This should merge onto this.options
    mergeWithOptions(this, defaults, options);

    this.cards.push(ImageCard);

    DEFAULT_TEXT_EXPANSIONS.forEach(e => this.registerExpansion(e));
    DEFAULT_KEY_COMMANDS.forEach(kc => this.registerKeyCommand(kc));

    this._mutationObserver = new MutationObserver(() => {
      this.handleInput();
    });
    this._isMutationObserved = false;
    this._parser   = new DOMParser(this.builder);
    this._renderer = new Renderer(this, this.cards, this.atoms, this.unknownCardHandler, this.unknownAtomHandler, this.cardOptions);

    this.post = this.loadPost();
    this._renderTree = new RenderTree(this.post);
  }

  addView(view) {
    this._views.push(view);
  }

  get builder() {
    if (!this._builder) { this._builder = new PostNodeBuilder(); }
    return this._builder;
  }

  loadPost() {
    if (this.mobiledoc) {
      return mobiledocParsers.parse(this.builder, this.mobiledoc);
    } else if (this.html) {
      if (typeof this.html === 'string') {
        let options = {plugins: this._parserPlugins};
        return new HTMLParser(this.builder, options).parse(this.html);
      } else {
        let dom = this.html;
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
    this.removeMutationObserver();
    this._renderer.render(this._renderTree);
    this.ensureMutationObserver();
    this.runCallbacks(CALLBACK_QUEUES.DID_RENDER);
  }

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
    this.rerender();

    if (this.autofocus) {
      this.element.focus();
    }

    this._setupListeners();
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
   * @method registerExpansion
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
   * @method registerKeyCommand
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
   * @param {KeyEvent} event optional
   * @private
   */
  handleDeletion(event=null) {
    const range = this.cursor.offsets;

    if (this.cursor.hasSelection()) {
      this.run(postEditor => {
        let nextPosition = postEditor.deleteRange(range);
        postEditor.setRange(new Range(nextPosition));
      });
    } else if (event) {
      let key = Key.fromEvent(event);
      this.run(postEditor => {
        let nextPosition = postEditor.deleteFrom(range.head, key.direction);
        postEditor.setRange(new Range(nextPosition));
      });
    }
  }

  handleNewline(event) {
    if (!this.cursor.hasCursor()) { return; }

    event.preventDefault();

    let range = this.cursor.offsets;
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
    this.range = range;
    this.renderRange();
  }

  // @private
  renderRange() {
    if (this.range.isBlank) {
      this.cursor.clearSelection();
    } else {
      this.cursor.selectRange(this.range);
    }
    this._reportSelectionState();

    // ensure that the range is "cleaned"/un-cached after
    // rendering a cursor range
    this.range = null;
  }

  get cursor() {
    return new Cursor(this);
  }

  // "read" the range from dom unless it has been set explicitly
  // Any method that sets the range explicitly should ensure that
  // the range is rendered and cleaned later
  get range() {
    return this._range || this.cursor.offsets;
  }

  set range(newRange) {
    this._range = newRange;
  }

  setPlaceholder(placeholder) {
    setData(this.element, 'placeholder', placeholder);
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
  handleInput() {
    this.reparse();
  }

  reparse() {
    this._reparseCurrentSection();
    this._removeDetachedSections();

    // A call to `run` will trigger the didUpdatePostCallbacks hooks with a
    // postEditor.
    this.run(() => {});
    this.rerender();
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

  /*
   * Returns the active sections. If the cursor selection is collapsed this will be
   * an array of 1 item. Else will return an array containing each section that is either
   * wholly or partly contained by the cursor selection.
   *
   * @return {array} The sections from the cursor's selection start to the selection end
   */
  get activeSections() {
    return this.cursor.activeSections;
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

  get markupsInSelection() {
    if (this.cursor.hasSelection()) {
      const range = this.cursor.offsets;
      return this.post.markupsInRange(range);
    } else {
      return [];
    }
  }

  _reparseCurrentSection() {
    const {headSection:currentSection } = this.cursor.offsets;
    if (currentSection) {
      this._parser.reparseSection(currentSection, this._renderTree);
    }
  }

  serialize() {
    return mobiledocRenderers.render(this.post);
  }

  removeAllViews() {
    this._views.forEach((v) => v.destroy());
    this._views = [];
  }

  ensureMutationObserver() {
    if (!this._isMutationObserved) {
      this._mutationObserver.observe(this.element, {
        characterData: true,
        childList: true,
        subtree: true
      });
      this._isMutationObserved = true;
    }
  }

  removeMutationObserver() {
    if (this._isMutationObserved) {
      this._mutationObserver.disconnect();
      this._isMutationObserved = false;
    }
  }

  destroy() {
    this._isDestroyed = true;
    if (this.cursor.hasCursor()) {
      this.cursor.clearSelection();
      this.element.blur();
    }
    this.removeMutationObserver();
    this._mutationObserver = null;
    this.removeAllEventListeners();
    this.removeAllViews();
    this._renderer.destroy();
  }

  /**
   * Keep the user from directly editing the post. Modification via the
   * programmatic API is still permitted.
   *
   * @method disableEditing
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
   * Allow the user to directly interact with editing a post via a cursor.
   *
   * @method enableEditing
   * @return undefined
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
   * @return undefined
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
  run(callback) {
    const postEditor = new PostEditor(this);
    postEditor.begin();
    const result = callback(postEditor);
    this.runCallbacks(CALLBACK_QUEUES.DID_UPDATE, [postEditor]);
    postEditor.complete();
    return result;
  }

  /**
   * @method didUpdatePost
   * @param {Function} callback This callback will be called with `postEditor`
   *         argument when the post is updated
   * @public
   */
  didUpdatePost(callback) {
    this.addCallback(CALLBACK_QUEUES.DID_UPDATE, callback);
  }

  /**
   * @method willRender
   * @param {Function} callback This callback will be called before the editor
   *        is rendered.
   * @public
   */
  willRender(callback) {
    this.addCallback(CALLBACK_QUEUES.WILL_RENDER, callback);
  }

  /**
   * @method didRender
   * @param {Function} callback This callback will be called after the editor
   *        is rendered.
   * @public
   */
  didRender(callback) {
    this.addCallback(CALLBACK_QUEUES.DID_RENDER, callback);
  }

  /**
   * @method cursorDidChange
   * @param {Function} callback This callback will be called after the cursor
   *        position (or selection) changes.
   * @public
   */
  cursorDidChange(callback) {
    this.addCallback(CALLBACK_QUEUES.CURSOR_DID_CHANGE, callback);
  }

  _setupListeners() {
    ELEMENT_EVENTS.forEach(eventName => {
      this.addEventListener(this.element, eventName,
        (...args) => this.handleEvent(eventName, ...args)
      );
    });

    DOCUMENT_EVENTS.forEach(eventName => {
      this.addEventListener(document, eventName,
        (...args) => this.handleEvent(eventName, ...args)
      );
    });
  }

  handleEvent(eventName, ...args) {
    if (contains(ELEMENT_EVENTS, eventName)) {
      let [{target: element}] = args;
      if (!this.cursor.isAddressable(element)) {
        // abort handling this event
        return true;
      }
    }

    const methodName = `handle${capitalize(eventName)}`;
    assert(`No handler "${methodName}" for ${eventName}`, !!this[methodName]);

    this[methodName](...args);
  }

  handleMouseup() {
    // mouseup does not correctly report a selection until the next tick
    setTimeout(() => this._reportSelectionState(), 0);
  }

  handleKeyup() {
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
  _reportSelectionState() {
    this.runCallbacks(CALLBACK_QUEUES.CURSOR_DID_CHANGE);
  }

  _insertEmptyMarkupSectionAtCursor() {
    this.run(postEditor => {
      const section = postEditor.builder.createMarkupSection('p');
      postEditor.insertSectionBefore(this.post.sections, section);
      postEditor.setRange(Range.fromSection(section));
    });
  }

  handleKeydown(event) {
    if (!this.isEditable || this.handleKeyCommand(event)) {
      return;
    }

    if (this.post.isBlank) {
      this._insertEmptyMarkupSectionAtCursor();
    }

    let key = Key.fromEvent(event);
    let range, nextPosition;

    switch(true) {
      case key.isHorizontalArrow():
        range = this.cursor.offsets;
        let position = range.tail;
        if (range.direction === DIRECTION.BACKWARD) {
          position = range.head;
        }
        nextPosition = position.move(key.direction);
        if (
          position.section.isCardSection ||
          (position.marker && position.marker.isAtom) ||
          (nextPosition && nextPosition.marker && nextPosition.marker.isAtom)
        ) {
          if (nextPosition) {
            let newRange;
            if (key.isShift()) {
              newRange = range.moveFocusedPosition(key.direction);
            } else {
              newRange = new Range(nextPosition);
            }
            this.selectRange(newRange);
            event.preventDefault();
          }
        }
        break;
      case key.isDelete():
        this.handleDeletion(event);
        event.preventDefault();
        break;
      case key.isEnter():
        this.handleNewline(event);
        break;
      case key.isPrintable():
        let { offsets: range } = this.cursor;
        let { isCollapsed } = range;
        let nextPosition = range.head;

        if (this.handleExpansion(event)) {
          event.preventDefault();
          break;
        }

        let shouldPreventDefault = isCollapsed && range.head.section.isCardSection;
        this.run(postEditor => {
          if (!isCollapsed) {
            nextPosition = postEditor.deleteRange(range);
          }
          let isMarkerable = range.head.section.isMarkerable;
          if (isMarkerable &&
              (key.isTab() || key.isSpace())
             ) {
            let toInsert = key.isTab() ? TAB : SPACE;
            shouldPreventDefault = true;
            nextPosition = postEditor.insertText(nextPosition, toInsert);
          }
          if (nextPosition && nextPosition !== range.head) {
            postEditor.setRange(new Range(nextPosition));
          }
        });
        if (shouldPreventDefault) {
          event.preventDefault();
        }
        break;
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
   * @method handleKeyCommand
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

  handleCut(event) {
    event.preventDefault();

    this.handleCopy(event);
    this.handleDeletion();
  }

  handleCopy(event) {
    event.preventDefault();

    setClipboardCopyData(event, this);
  }

  handlePaste(event) {
    event.preventDefault();

    const { head: position } = this.cursor.offsets;

    if (position.section.isCardSection) {
      return;
    }

    if (this.cursor.hasSelection()) {
      this.handleDeletion();
    }

    let pastedPost = parsePostFromPaste(event, this.builder, this._parserPlugins);

    this.run(postEditor => {
      let nextPosition = postEditor.insertPost(position, pastedPost);
      postEditor.setRange(new Range(nextPosition));
    });
  }

  // @private
  _setCardMode(cardSection, mode) {
    const renderNode = this._renderTree.getRenderNode(cardSection);
    if (renderNode && renderNode.isRendered) {
      const cardNode = renderNode.cardNode;
      cardNode[mode]();
    } else {
      cardSection.setInitialMode(mode);
    }
  }

  get hasRendered() {
    return !!this.element;
  }
}

mixin(Editor, EventEmitter);
mixin(Editor, EventListenerMixin);
mixin(Editor, LifecycleCallbacksMixin);

export default Editor;
