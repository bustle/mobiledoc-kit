import TextFormatToolbar  from '../views/text-format-toolbar';
import Tooltip from '../views/tooltip';
import EmbedIntent from '../views/embed-intent';
import PostEditor from './post';

import ReversibleToolbarButton from '../views/reversible-toolbar-button';
import ReversiblePromptButton from '../views/reversible-prompt-button';
import BoldCommand from '../commands/bold';
import ItalicCommand from '../commands/italic';
import LinkCommand from '../commands/link';
import QuoteCommand from '../commands/quote';
import HeadingCommand from '../commands/heading';
import SubheadingCommand from '../commands/subheading';
import UnorderedListCommand from '../commands/unordered-list';
import OrderedListCommand from '../commands/ordered-list';
import ImageCommand from '../commands/image';
import CardCommand from '../commands/card';

import ImageCard from '../cards/image';

import Key from '../utils/key';
import EventEmitter from '../utils/event-emitter';

import MobiledocParser from "../parsers/mobiledoc";
import PostParser from '../parsers/post';
import DOMParser from '../parsers/dom';
import Renderer  from 'content-kit-editor/renderers/editor-dom';
import RenderTree from 'content-kit-editor/models/render-tree';
import MobiledocRenderer from '../renderers/mobiledoc';

import { mergeWithOptions } from 'content-kit-utils';
import { clearChildNodes, addClassName, parseHTML } from '../utils/dom-utils';
import { forEach, filter } from '../utils/array-utils';
import { getData, setData } from '../utils/element-utils';
import mixin from '../utils/mixin';
import EventListenerMixin from '../utils/event-listener';
import Cursor from '../utils/cursor';
import PostNodeBuilder from '../models/post-node-builder';
import {
  DEFAULT_TEXT_EXPANSIONS, findExpansion, validateExpansion
} from './text-expansions';
import { capitalize } from '../utils/string-utils';

export const EDITOR_ELEMENT_CLASS_NAME = 'ck-editor';

const defaults = {
  placeholder: 'Write here...',
  spellcheck: true,
  autofocus: true,
  // FIXME PhantomJS has 'ontouchstart' in window,
  // causing the stickyToolbar to accidentally be auto-activated
  // in tests
  stickyToolbar: false, // !!('ontouchstart' in window),
  cards: [],
  cardOptions: {},
  unknownCardHandler: () => {
    throw new Error('Unknown card encountered');
  },
  mobiledoc: null,
  html: null
};

function runCallbacks(callbacks, args) {
  let i;
  for (i=0;i<callbacks.length;i++) {
    callbacks[i].apply(null, args);
  }
}

function makeButtons(editor) {
  const headingCommand = new HeadingCommand(editor);
  const headingButton = new ReversibleToolbarButton(headingCommand, editor);

  const subheadingCommand = new SubheadingCommand(editor);
  const subheadingButton = new ReversibleToolbarButton(subheadingCommand, editor);

  const quoteCommand = new QuoteCommand(editor);
  const quoteButton = new ReversibleToolbarButton(quoteCommand, editor);

  const boldCommand = new BoldCommand(editor);
  const boldButton = new ReversibleToolbarButton(boldCommand, editor);

  const italicCommand = new ItalicCommand(editor);
  const italicButton = new ReversibleToolbarButton(italicCommand, editor);

  const linkCommand = new LinkCommand(editor);
  const linkButton = new ReversiblePromptButton(linkCommand, editor);

  return [
    headingButton,
    subheadingButton,
    quoteButton,
    boldButton,
    italicButton,
    linkButton
  ];
}

/**
 * @class Editor
 * An individual Editor
 * @param element `Element` node
 * @param options hash of options
 */
class Editor {
  constructor(options={}) {
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
    mergeWithOptions(this, defaults, options);

    this.cards.push(ImageCard);

    DEFAULT_TEXT_EXPANSIONS.forEach(e => this.registerExpansion(e));

    this._parser   = new PostParser(this.builder);
    this._renderer = new Renderer(this, this.cards, this.unknownCardHandler, this.cardOptions);

    this.post = this.loadPost();
    this._renderTree = this.prepareRenderTree(this.post);
  }

  addView(view) {
    this._views.push(view);
  }

  get builder() {
    if (!this._builder) { this._builder = new PostNodeBuilder(); }
    return this._builder;
  }

  prepareRenderTree(post) {
    let renderTree = new RenderTree();
    let node = renderTree.buildRenderNode(post);
    renderTree.node = node;
    return renderTree;
  }

  loadPost() {
    if (this.mobiledoc) {
      return new MobiledocParser(this.builder).parse(this.mobiledoc);
    } else if (this.html) {
      if (typeof this.html === 'string') {
        this.html = parseHTML(this.html);
      }
      return new DOMParser(this.builder).parse(this.html);
    } else {
      return this.builder.createBlankPost();
    }
  }

  rerender() {
    let postRenderNode = this.post.renderNode;

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

  render(element) {
    if (this.element) {
      throw new Error('Cannot render an editor twice. Use `rerender` to update the rendering of an existing editor instance');
    }

    this.element = element;

    addClassName(this.element, EDITOR_ELEMENT_CLASS_NAME);
    this.applyPlaceholder();

    element.spellcheck = this.spellcheck;

    if (this.isEditable === null) {
      this.enableEditing();
    }

    clearChildNodes(element);

    this._setupListeners();
    this._initEmbedCommands();

    this._addToolbar();
    this._addTooltip();

    // A call to `run` will trigger the didUpdatePostCallbacks hooks with a
    // postEditor.
    this.run(() => {});
    this.rerender();

    if (this.autofocus) {
      element.focus();
    }
  }

  _addToolbar() {
    this.addView(new TextFormatToolbar({
      editor: this,
      rootElement: this.element,
      commands: [],
      buttons: makeButtons(this),
      sticky: this.stickyToolbar
    }));
  }

  _addTooltip() {
    this.addView(new Tooltip({rootElement: this.element, showForTag: 'a'}));
  }

  get expansions() {
    if (!this._expansions) { this._expansions = []; }
    return this._expansions;
  }

  registerExpansion(expansion) {
    if (!validateExpansion(expansion)) {
      throw new Error('Expansion is not valid');
    }
    this.expansions.push(expansion);
  }

  handleExpansion(event) {
    const expansion = findExpansion(this.expansions, event, this);
    if (expansion) {
      event.preventDefault();
      expansion.run(this);
    }
  }

  handleDeletion(event) {
    event.preventDefault();

    const offsets = this.cursor.offsets;

    if (this.cursor.hasSelection()) {
      this.run(postEditor => {
        postEditor.deleteRange(offsets);
      });
      this.cursor.moveToSection(offsets.headSection, offsets.headSectionOffset);
    } else {
      let results = this.run(postEditor => {
        const {headSection, headSectionOffset} = offsets;
        const key = Key.fromEvent(event);

        const deletePosition = {section: headSection, offset: headSectionOffset},
              direction = key.direction;
        return postEditor.deleteFrom(deletePosition, direction);
      });
      this.cursor.moveToSection(results.currentSection, results.currentOffset);
    }
  }

  handleNewline(event) {
    if (!this.cursor.hasCursor()) { return ;}

    const range = this.cursor.offsets;
    event.preventDefault();

    const cursorSection = this.run((postEditor) => {
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

  reportSelection() {
    if (!this._hasSelection) {
      this.trigger('selection');
    } else {
      this.trigger('selectionUpdated');
    }
    this._hasSelection = true;
  }

  reportNoSelection() {
    if (this._hasSelection) {
      this.trigger('selectionEnded');
    }
    this._hasSelection = false;
  }

  cancelSelection() {
    if (this._hasSelection) {
      // FIXME perhaps restore cursor position to end of the selection?
      this.cursor.clearSelection();
      this.reportNoSelection();
    }
  }

  didUpdate() {
    this.trigger('update');
  }

  selectSections(sections) {
    this.cursor.selectSections(sections);
    this.reportSelection();
  }

  selectMarkers(markers) {
    this.cursor.selectMarkers(markers);
    this.reportSelection();
  }

  get cursor() {
    return new Cursor(this);
  }

  applyPlaceholder() {
    const placeholder = this.placeholder;
    const existingPlaceholder = getData(this.element, 'placeholder');

    if (placeholder && !existingPlaceholder) {
      setData(this.element, 'placeholder', placeholder);
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
  handleInput() {
    this.reparse();
    this.trigger('update');
  }

  reparse() {
    let { headSection, headSectionOffset } = this.cursor.offsets;
    if (headSectionOffset === 0) {
      // FIXME if the offset is 0, the user is typing the first character
      // in an empty section, so we need to move the cursor 1 letter forward
      headSectionOffset = 1;
    }

    this._reparseCurrentSection();
    this._removeDetachedSections();

    // A call to `run` will trigger the didUpdatePostCallbacks hooks with a
    // postEditor.
    this.run(() => {});
    this.rerender();
    this.trigger('update');

    this.cursor.moveToSection(headSection, headSectionOffset);
  }

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

  get activeMarkers() {
    const {
      headMarker,
      tailMarker
    } = this.cursor.offsets;

    let activeMarkers = [];

    if (headMarker && tailMarker) {
      this.post.markersFrom(headMarker, tailMarker, m => {
        activeMarkers.push(m);
      });
    }

    return activeMarkers;
  }

  /*
   * Clear the markups from each of the section's markers
   */
  resetSectionMarkers(section) {
    section.markers.forEach(m => {
      m.clearMarkups();
      m.renderNode.markDirty();
    });
  }

  /*
   * Change the tag name for the given section
   */
  setSectionTagName(section, tagName) {
    section.setTagName(tagName);
    section.renderNode.markDirty();
  }

  resetSectionTagName(section) {
    section.resetTagName();
    section.renderNode.markDirty();
  }

  _reparseCurrentSection() {
    const {headSection:currentSection } = this.cursor.offsets;
    this._parser.reparseSection(currentSection, this._renderTree);
  }

  serialize() {
    return MobiledocRenderer.render(this.post);
  }

  removeAllViews() {
    this._views.forEach((v) => v.destroy());
    this._views = [];
  }

  destroy() {
    this._isDestroyed = true;
    this.removeAllEventListeners();
    this.removeAllViews();
  }

  /**
   * Keep the user from directly editing the post. Modification via the
   * programmatic API is still permitted.
   *
   * @method disableEditing
   * @return undefined
   * @public
   */
  disableEditing() {
    this.isEditable = false;
    if (this.element) {
      this.element.setAttribute('contentEditable', false);
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
  run(callback) {
    const postEditor = new PostEditor(this);
    const result = callback(postEditor);
    runCallbacks(this._didUpdatePostCallbacks, [postEditor]);
    postEditor.complete();
    return result;
  }

  didUpdatePost(callback) {
    this._didUpdatePostCallbacks.push(callback);
  }

  willRender(callback) {
    this._willRenderCallbacks.push(callback);
  }

  didRender(callback) {
    this._didRenderCallbacks.push(callback);
  }

  _initEmbedCommands() {
    const commands = [
      new ImageCommand(),
      new CardCommand(),
      new UnorderedListCommand(this),
      new OrderedListCommand(this)
    ];

    this.addView(new EmbedIntent({
      editorContext: this,
      commands: commands,
      rootElement: this.element
    }));
  }

  _setupListeners() {
    const elementEvents = ['keydown', 'keyup', 'input', 'dragover', 'drop', 'paste'];
    const documentEvents = ['mouseup'];

    elementEvents.forEach(eventName => {
      this.addEventListener(this.element, eventName,
        (...args) => this.handleEvent(eventName, ...args)
      );
    });

    documentEvents.forEach(eventName => {
      this.addEventListener(document, eventName,
        (...args) => this.handleEvent(eventName, ...args)
      );
    });
  }

  handleEvent(eventName, ...args) {
    const methodName = `handle${capitalize(eventName)}`;
    if (!this[methodName]) { throw new Error(`No handler for ${eventName}`); }
    this[methodName](...args);
  }

  handleMouseup() {
    // mouseup does not correctly report a selection until the next tick
    setTimeout(() => this._reportSelectionState());
  }

  handleKeyup(event) {
    const key = Key.fromEvent(event);

    if (key.isEscape()) { this.trigger('escapeKey'); }
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
    if (this.cursor.hasSelection()) {
      this.reportSelection();
    } else {
      this.reportNoSelection();
    }
  }

  handleDragover(e) {
    e.preventDefault(); // FIXME for now, just prevent default
  }

  handleDrop(e) {
    e.preventDefault(); // FIXME for now, just prevent default
  }

  handleKeydown(event) {
    if (!this.isEditable) { return; }

    const key = Key.fromEvent(event);

    if (key.isDelete()) {
      this.handleDeletion(event);
      event.preventDefault();
    } else if (key.isEnter()) {
      this.handleNewline(event);
    } else if (key.isPrintable()) {
      if (this.cursor.hasSelection()) {
        let offsets = this.cursor.offsets;
        this.run((postEditor) => {
          postEditor.deleteRange(this.cursor.offsets);
        });
        this.cursor.moveToSection(offsets.headSection, offsets.headSectionOffset);
      }
    }

    this.handleExpansion(event);
  }

  handlePaste(event) {
    event.preventDefault(); // FIXME for now, just prevent pasting
  }
}

mixin(Editor, EventEmitter);
mixin(Editor, EventListenerMixin);

export default Editor;
