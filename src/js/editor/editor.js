import TextFormatToolbar  from '../views/text-format-toolbar';
import Tooltip from '../views/tooltip';
import EmbedIntent from '../views/embed-intent';
import PostEditor from './post';

import ReversibleToolbarButton from '../views/reversible-toolbar-button';
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
import {
  UNPRINTABLE_CHARACTER
} from 'content-kit-editor/renderers/editor-dom';
import RenderTree from 'content-kit-editor/models/render-tree';
import MobiledocRenderer from '../renderers/mobiledoc';

import { mergeWithOptions } from 'content-kit-utils';
import {
  clearChildNodes,
  addClassName
} from '../utils/dom-utils';
import {
  forEach
} from '../utils/array-utils';
import { getData, setData } from '../utils/element-utils';
import mixin from '../utils/mixin';
import EventListenerMixin from '../utils/event-listener';
import Cursor from '../models/cursor';
import PostNodeBuilder from '../models/post-node-builder';

export const EDITOR_ELEMENT_CLASS_NAME = 'ck-editor';

const defaults = {
  placeholder: 'Write here...',
  spellcheck: true,
  autofocus: true,
  post: null,
  // FIXME PhantomJS has 'ontouchstart' in window,
  // causing the stickyToolbar to accidentally be auto-activated
  // in tests
  stickyToolbar: false, // !!('ontouchstart' in window),
  textFormatCommands: [
    new LinkCommand()
  ],
  embedCommands: [
    new ImageCommand(),
    new CardCommand()
  ],
  autoTypingCommands: [
    new UnorderedListCommand(),
    new OrderedListCommand()
  ],
  cards: [],
  cardOptions: {},
  unknownCardHandler: () => {
    throw new Error('Unknown card encountered');
  },
  mobiledoc: null
};

function bindContentEditableTypingListeners(editor) {
  // On 'PASTE' sanitize and insert
  editor.addEventListener(editor.element, 'paste', function(e) {
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
  editor.addEventListener(editor.element, 'keyup', function(e) {
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

  const toggleSelection = () => {
    return editor.cursor.hasSelection() ? editor.hasSelection() :
                                          editor.hasNoSelection();
  };

  // mouseup will not properly report a selection until the next tick, so add a timeout:
  const mouseupHandler = () => setTimeout(toggleSelection);
  editor.addEventListener(document, 'mouseup', mouseupHandler);

  const keyupHandler = toggleSelection;
  editor.addEventListener(editor.element, 'keyup', keyupHandler);
}

function bindKeyListeners(editor) {
  if (!editor.isEditable) {
    return;
  }
  editor.addEventListener(document, 'keyup', (event) => {
    const key = Key.fromEvent(event);
    if (key.isEscape()) {
      editor.trigger('escapeKey');
    }
  });

  editor.addEventListener(document, 'keydown', (event) => {
    if (!editor.isEditable) {
      return;
    }
    const key = Key.fromEvent(event);

    if (key.isDelete()) {
      editor.handleDeletion(event);
      event.preventDefault();
    } else if (key.isEnter()) {
      editor.handleNewline(event);
    } else if (key.isPrintable()) {
      if (editor.cursor.hasSelection()) {
        let result = editor.run((postEditor) => {
          return postEditor.deleteRange(editor.cursor.offsets);
        });
        editor.cursor.moveToMarker(result.currentMarker, result.currentOffset);
      }
    }
  });
}

function bindDragAndDrop(editor) {
  // TODO. For now, just prevent redirect when dropping something on the page
  editor.addEventListener(window, 'dragover', function(e) {
    e.preventDefault(); // prevents showing cursor where to drop
  });
  editor.addEventListener(window, 'drop', function(e) {
    e.preventDefault(); // prevent page from redirecting
  });
}

function initEmbedCommands(editor) {
  var commands = editor.embedCommands;
  if(commands) {
    editor.addView(new EmbedIntent({
      editorContext: editor,
      commands: commands,
      rootElement: editor.element
    }));
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

  return [
    headingButton,
    subheadingButton,
    quoteButton,
    boldButton,
    italicButton
  ];
}

/**
 * @class Editor
 * An individual Editor
 * @param element `Element` node
 * @param options hash of options
 */
class Editor {
  constructor(element, options) {
    if (!element) {
      throw new Error('Editor requires an element as the first argument');
    }

    this._elementListeners = [];
    this._views = [];
    this.element = element;

    this.builder = new PostNodeBuilder();

    // FIXME: This should merge onto this.options
    mergeWithOptions(this, defaults, options);

    this.cards.push(ImageCard);

    this._parser   = new PostParser(this.builder);
    this._renderer = new Renderer(this, this.cards, this.unknownCardHandler, this.cardOptions);

    this.applyClassName(EDITOR_ELEMENT_CLASS_NAME);
    this.applyPlaceholder();

    element.spellcheck = this.spellcheck;
    this.enableEditing();

    if (this.mobiledoc) {
      this.post = new MobiledocParser(this.builder).parse(this.mobiledoc);
    } else {
      this.post = new DOMParser(this.builder).parse(this.element);
    }

    this._renderTree = this.prepareRenderTree(this.post);

    clearChildNodes(element);
    this.rerender();

    bindContentEditableTypingListeners(this);
    bindAutoTypingListeners(this);
    bindDragAndDrop(this);
    bindSelectionEvent(this);
    bindKeyListeners(this);
    this.addEventListener(element, 'input', () => this.handleInput());
    initEmbedCommands(this);

    this.addView(new TextFormatToolbar({
      editor: this,
      rootElement: element,
      // FIXME -- eventually all the commands should migrate to being buttons
      // that can be added
      commands: this.textFormatCommands,
      buttons: makeButtons(this),
      sticky: this.stickyToolbar
    }));

    this.addView(new Tooltip({
      rootElement: element,
      showForTag: 'a'
    }));

    if (this.autofocus) { element.focus(); }
  }

  addView(view) {
    this._views.push(view);
  }

  prepareRenderTree(post) {
    let renderTree = new RenderTree();
    let node = renderTree.buildRenderNode(post);
    renderTree.node = node;
    return renderTree;
  }

  rerender() {
    let postRenderNode = this.post.renderNode;

    // if we haven't rendered this post's renderNode before, mark it dirty
    if (!postRenderNode.element) {
      postRenderNode.element = this.element;
      postRenderNode.markDirty();
    }

    this._renderer.render(this._renderTree);
  }

  handleDeletion(event) {
    event.preventDefault();


    const results = this.run(postEditor => {
      const offsets = this.cursor.offsets;

      if (this.cursor.hasSelection()) {
        return postEditor.deleteRange(offsets);
      } else {
        const {headMarker, headOffset} = offsets;
        const key = Key.fromEvent(event);

        const deletePosition = {marker: headMarker, offset: headOffset},
              direction = key.direction;
        return postEditor.deleteFrom(deletePosition, direction);
      }
    });

    this.cursor.moveToMarker(results.currentMarker, results.currentOffset);
  }

  handleNewline(event) {
    let offsets = this.cursor.offsets;

    // if there's no left/right nodes, we are probably not in the editor,
    // or we have selected some non-marker thing like a card
    if (!offsets.leftRenderNode || !offsets.rightRenderNode) {
      return;
    }

    event.preventDefault();

    let cursorSection;
    this.run((postEditor) => {
      let offsetAfterDeletion;
      if (this.cursor.hasSelection()) {
        let result = postEditor.deleteRange(offsets);
        offsetAfterDeletion = {
          headMarker: result.currentMarker,
          headOffset: result.currentOffset
        };
      }
      cursorSection = postEditor.splitSection(offsetAfterDeletion || offsets)[1];
    });
    this.cursor.moveToSection(cursorSection);
  }

  hasSelection() {
    if (!this._hasSelection) {
      this.trigger('selection');
    } else {
      this.trigger('selectionUpdated');
    }
    this._hasSelection = true;
  }

  hasNoSelection() {
    if (this._hasSelection) {
      this.trigger('selectionEnded');
    }
    this._hasSelection = false;
  }

  cancelSelection() {
    if (this._hasSelection) {
      // FIXME perhaps restore cursor position to end of the selection?
      this.cursor.clearSelection();
      this.hasNoSelection();
    }
  }

  didUpdate() {
    this.trigger('update');
  }

  selectSections(sections) {
    this.cursor.selectSections(sections);
    this.hasSelection();
  }

  markersInRange({headMarker, headOffset, tailMarker, tailOffset}) {
    let offset = 0;
    let foundMarkers = [];
    let toEnd = tailOffset === undefined;
    if (toEnd) { tailOffset = 0; }

    this.post.markersFrom(headMarker, tailMarker, marker => {
      if (toEnd) {
        tailOffset += marker.length;
      }

      if (offset >= headOffset && offset < tailOffset) {
        foundMarkers.push(marker);
      }

      offset += marker.length;
    });

    return foundMarkers;
  }

  selectMarkers(markers) {
    this.cursor.selectMarkers(markers);
    this.hasSelection();
  }

  get cursor() {
    return new Cursor(this);
  }

  applyClassName(className) {
    addClassName(this.element, className);
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
    // find added sections
    let sectionsInDOM = [];
    let newSections = [];
    let previousSection;

    forEach(this.element.childNodes, (node) => {
      let sectionRenderNode = this._renderTree.getElementRenderNode(node);
      if (!sectionRenderNode) {
        let section = this._parser.parseSection(node);
        newSections.push(section);

        // create a clean "already-rendered" node to represent the fact that
        // this (new) section is already in DOM
        sectionRenderNode = this._renderTree.buildRenderNode(section);
        sectionRenderNode.element = node;
        sectionRenderNode.markClean();

        let previousSectionRenderNode = previousSection && previousSection.renderNode;
        this.post.sections.insertAfter(section, previousSection);
        this._renderTree.node.childNodes.insertAfter(sectionRenderNode, previousSectionRenderNode);
      }

      // may cause duplicates to be included
      let section = sectionRenderNode.postNode;
      sectionsInDOM.push(section);
      previousSection = section;
    });

    // remove deleted nodes
    const deletedSections = [];
    forEach(this.post.sections, (section) => {
      if (!section.renderNode) {
        throw new Error('All sections are expected to have a renderNode');
      }

      if (sectionsInDOM.indexOf(section) === -1) {
        deletedSections.push(section);
      }
    });
    forEach(deletedSections, (s) => s.renderNode.scheduleForRemoval());

    // reparse the new section(s) with the cursor
    // to ensure that we catch any changed html that the browser might have
    // added
    const sectionsWithCursor = this.cursor.activeSections;
    forEach(sectionsWithCursor, (section) => {
      if (newSections.indexOf(section) === -1) {
        this.reparseSection(section);
      }
    });

    let {
      leftRenderNode,
      leftOffset,
      rightRenderNode,
      rightOffset
    } = this.cursor.offsets;

    // The cursor will lose its textNode if we have reparsed (and thus will rerender, below)
    // its section. Ensure the cursor is placed where it should be after render.
    //
    // New sections are presumed clean, and thus do not get rerendered and lose
    // their cursor position.
    let resetCursor = (leftRenderNode &&
        sectionsWithCursor.indexOf(leftRenderNode.postNode.section) !== -1);

    if (resetCursor) {
      let unprintableOffset = leftRenderNode.element.textContent.indexOf(UNPRINTABLE_CHARACTER);
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
      this.cursor.moveToNode(
        leftRenderNode.element,
        leftOffset,
        rightRenderNode.element,
        rightOffset
      );
    }
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
      startMarker,
      endMarker,
    } = this.cursor.offsets;

    if (!(startMarker && endMarker)) {
      return [];
    }

    let activeMarkers = [];
    this.post.markersFrom(startMarker, endMarker, m => activeMarkers.push(m));
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

  reparseSection(section) {
    this._parser.reparseSection(section, this._renderTree);
  }

  serialize() {
    return MobiledocRenderer.render(this.post);
  }

  removeAllViews() {
    this._views.forEach((v) => v.destroy());
    this._views = [];
  }

  destroy() {
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
    this.element.setAttribute('contentEditable', false);
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
    this.element.setAttribute('contentEditable', true);
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
    let postEditor = new PostEditor(this);
    let result = callback(postEditor);
    postEditor.complete();
    return result;
  }
}

mixin(Editor, EventEmitter);
mixin(Editor, EventListenerMixin);

export default Editor;
