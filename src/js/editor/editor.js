import TextFormatToolbar  from '../views/text-format-toolbar';
import Tooltip from '../views/tooltip';
import EmbedIntent from '../views/embed-intent';

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

import Keycodes from '../utils/keycodes';
import {
  getSelectionBlockElement
} from '../utils/selection-utils';
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

import { toArray, mergeWithOptions } from 'content-kit-utils';
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
import { MARKUP_SECTION_TYPE } from '../models/markup-section';
import PostNodeBuilder from '../models/post-node-builder';

export const EDITOR_ELEMENT_CLASS_NAME = 'ck-editor';

const defaults = {
  placeholder: 'Write here...',
  spellcheck: true,
  autofocus: true,
  post: null,
  serverHost: '',
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
  unknownCardHandler: () => { throw new Error('Unknown card encountered'); },
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
  // escape key
  editor.addEventListener(document, 'keyup', (event) => {
    if (event.keyCode === Keycodes.ESC) {
      editor.trigger('escapeKey');
    }
  });

  editor.addEventListener(document, 'keydown', (event) => {
    switch (event.keyCode) {
      case Keycodes.BACKSPACE:
      case Keycodes.DELETE:
        editor.handleDeletion(event);
        break;
      case Keycodes.ENTER:
        editor.handleNewline(event);
        break;
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
    element.setAttribute('contentEditable', true);

    if (this.mobiledoc) {
      this.parseModelFromMobiledoc(this.mobiledoc);
    } else {
      this.parseModelFromDOM(this.element);
    }

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

  loadModel(post) {
    this.post = post;
    this.rerender();
    this.trigger('update');
  }

  parseModelFromDOM(element) {
    let parser = new DOMParser(this.builder);
    this.post = parser.parse(element);
    this._renderTree = new RenderTree();
    let node = this._renderTree.buildRenderNode(this.post);
    this._renderTree.node = node;
    this.trigger('update');
  }

  parseModelFromMobiledoc(mobiledoc) {
    this.post = new MobiledocParser(this.builder).parse(mobiledoc);
    this._renderTree = new RenderTree();
    let node = this._renderTree.buildRenderNode(this.post);
    this._renderTree.node = node;
    this.trigger('update');
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

  deleteSelection(event) {
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

    const markers = this.splitMarkersFromSelection();

    const {changedSections, removedSections, currentMarker, currentOffset} = this.post.cutMarkers(markers);

    changedSections.forEach(section => section.renderNode.markDirty());
    removedSections.forEach(section => section.renderNode.scheduleForRemoval());

    this.rerender();

    let currentTextNode = currentMarker.renderNode.element;
    this.cursor.moveToNode(currentTextNode, currentOffset);

    this.trigger('update');
  }

  // FIXME ensure we handle deletion when there is a selection
  handleDeletion(event) {
    let {
      leftRenderNode,
      leftOffset
    } = this.cursor.offsets;

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

    const currentMarker = leftRenderNode.postNode;
    let nextCursorMarker = currentMarker;
    let nextCursorOffset = leftOffset - 1;

    // A: in the middle of a marker
    if (leftOffset !== 0) {
      currentMarker.deleteValueAtOffset(leftOffset-1);
      if (currentMarker.length === 0 && currentMarker.section.markers.length > 1) {
        leftRenderNode.scheduleForRemoval();

        let isFirstRenderNode = leftRenderNode === leftRenderNode.parent.childNodes.head;
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
      let currentSection = currentMarker.section;
      let previousMarker = currentMarker.prev;
      if (previousMarker) { // (B)
        let markerLength = previousMarker.length;
        previousMarker.deleteValueAtOffset(markerLength - 1);
      } else { // (C)
        // possible previous sections:
        //   * none -- do nothing
        //   * markup section -- join to it
        //   * non-markup section (card) -- select it? delete it?
        let previousSection = currentSection.prev;
        if (previousSection) {
          let isMarkupSection = previousSection.type === MARKUP_SECTION_TYPE;

          if (isMarkupSection) {
            let lastPreviousMarker = previousSection.markers.tail;
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
        } else { // no previous section -- do nothing
          nextCursorMarker = currentMarker;
          nextCursorOffset = 0;
        }
      }
    }

    this.rerender();

    this.cursor.moveToNode(nextCursorMarker.renderNode.element,
                           nextCursorOffset);

    this.trigger('update');
    event.preventDefault();
  }

  handleNewline(event) {
    const {
      leftRenderNode,
      rightRenderNode,
      leftOffset
    } = this.cursor.offsets;

    // if there's no left/right nodes, we are probably not in the editor,
    // or we have selected some non-marker thing like a card
    if (!leftRenderNode || !rightRenderNode) { return; }

    // FIXME handle when the selection is not collapsed, this code assumes it is
    event.preventDefault();

    const markerRenderNode = leftRenderNode;
    const marker = markerRenderNode.postNode;
    const section = marker.section;

    let [beforeSection, afterSection] = section.splitAtMarker(marker, leftOffset);

    section.renderNode.scheduleForRemoval();

    this.post.sections.insertAfter(beforeSection, section);
    this.post.sections.insertAfter(afterSection, beforeSection);
    this.post.sections.remove(section);

    this.rerender();
    this.trigger('update');

    this.cursor.moveToSection(afterSection);
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

  /*
   * @return {Array} of markers that are "inside the split"
   */
  splitMarkersFromSelection() {
    const {
      startMarker,
      leftOffset:startMarkerOffset,
      endMarker,
      rightOffset:endMarkerOffset,
      startSection,
      endSection
    } = this.cursor.offsets;

    let selectedMarkers = [];

    startMarker.renderNode.scheduleForRemoval();
    endMarker.renderNode.scheduleForRemoval();

    if (startMarker === endMarker) {
      let newMarkers = startSection.splitMarker(
        startMarker, startMarkerOffset, endMarkerOffset
      );
      selectedMarkers = this.markersInOffset(newMarkers, startMarkerOffset, endMarkerOffset);
    } else {
      let newStartMarkers = startSection.splitMarker(startMarker, startMarkerOffset);
      let selectedStartMarkers = this.markersInOffset(newStartMarkers, startMarkerOffset);

      let newEndMarkers = endSection.splitMarker(endMarker, endMarkerOffset);
      let selectedEndMarkers = this.markersInOffset(newEndMarkers, 0, endMarkerOffset);

      let newStartMarker = selectedStartMarkers[0],
          newEndMarker = selectedEndMarkers[selectedEndMarkers.length - 1];

      this.post.markersFrom(newStartMarker, newEndMarker, m => selectedMarkers.push(m));
    }

    return selectedMarkers;
  }

  markersInOffset(markers, startOffset, endOffset) {
    let offset = 0;
    let foundMarkers = [];
    let toEnd = endOffset === undefined;
    if (toEnd) { endOffset = 0; }

    markers.forEach(marker => {
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

  applyMarkupToSelection(markup) {
    const markers = this.splitMarkersFromSelection();
    markers.forEach(marker => {
      marker.addMarkup(markup);
      marker.section.renderNode.markDirty();
    });

    this.rerender();
    this.selectMarkers(markers);
    this.didUpdate();
  }

  removeMarkupFromSelection(markup) {
    const markers = this.splitMarkersFromSelection();
    markers.forEach(marker => {
      marker.removeMarkup(markup);
      marker.section.renderNode.markDirty();
    });

    this.rerender();
    this.selectMarkers(markers);
    this.didUpdate();
  }

  selectMarkers(markers) {
    this.cursor.selectMarkers(markers);
    this.hasSelection();
  }

  get cursor() {
    return new Cursor(this);
  }

  getCurrentBlockIndex() {
    var selectionEl = this.element || getSelectionBlockElement();
    var blockElements = toArray(this.element.children);
    return blockElements.indexOf(selectionEl);
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

  get cursorSelection() {
    return this.cursor.cursorSelection;
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

  insertSectionAtCursor(newSection) {
    let newRenderNode = this._renderTree.buildRenderNode(newSection);
    let renderNodes = this.cursor.activeSections.map(s => s.renderNode);
    let lastRenderNode = renderNodes[renderNodes.length-1];
    lastRenderNode.parent.childNodes.insertAfter(newRenderNode, lastRenderNode);
    this.post.sections.insertAfter(newSection, lastRenderNode.postNode);
    renderNodes.forEach(renderNode => renderNode.scheduleForRemoval());
    this.trigger('update');
  }

  destroy() {
    this.removeAllEventListeners();
    this.removeAllViews();
  }
}

mixin(Editor, EventEmitter);
mixin(Editor, EventListenerMixin);

export default Editor;
