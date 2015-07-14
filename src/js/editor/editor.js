import TextFormatToolbar  from '../views/text-format-toolbar';
import Tooltip from '../views/tooltip';
import EmbedIntent from '../views/embed-intent';

import BoldCommand from '../commands/bold';
import ItalicCommand from '../commands/italic';
import LinkCommand from '../commands/link';
import QuoteCommand from '../commands/quote';
import HeadingCommand from '../commands/heading';
import SubheadingCommand from '../commands/subheading';
import UnorderedListCommand from '../commands/unordered-list';
import OrderedListCommand from '../commands/ordered-list';
import ImageCommand from '../commands/image';
import OEmbedCommand from '../commands/oembed';
import CardCommand from '../commands/card';

import Keycodes from '../utils/keycodes';
import { getSelectionBlockElement, getCursorOffsetInElement } from '../utils/selection-utils';
import EventEmitter from '../utils/event-emitter';

import MobiledocParser from "../parsers/mobiledoc";
import DOMParser from "../parsers/dom";
import EditorDOMRenderer from "../renderers/editor-dom";
import MobiledocRenderer from '../renderers/mobiledoc';

import { toArray, merge, mergeWithOptions } from 'content-kit-utils';
import { detectParentNode } from '../utils/dom-utils';
import { getData, setData } from '../utils/element-utils';
import mixin from '../utils/mixin';
import EventListenerMixin from '../utils/event-listener';

var defaults = {
  placeholder: 'Write here...',
  spellcheck: true,
  autofocus: true,
  post: null,
  serverHost: '',
  stickyToolbar: !!('ontouchstart' in window),
  textFormatCommands: [
    new BoldCommand(),
    new ItalicCommand(),
    new LinkCommand(),
    new QuoteCommand(),
    new HeadingCommand(),
    new SubheadingCommand()
  ],
  embedCommands: [
    new ImageCommand({ serviceUrl: '/upload' }),
    new OEmbedCommand({ serviceUrl: '/embed'  }),
    new CardCommand()
  ],
  autoTypingCommands: [
    new UnorderedListCommand(),
    new OrderedListCommand()
  ],
  cards: {},
  mobiledoc: null
};

function forEachChildNode(parentNode, callback) {
  let i, l;
  for (i=0, l=parentNode.childNodes.length;i<l;i++) {
    callback(parentNode.childNodes[i]);
  }
}

function bindContentEditableTypingListeners(editor) {
  editor.addEventListener(editor.element, 'keyup', function(e) {
    // Assure there is always a supported block tag, and not empty text nodes or divs.
    // On a carrage return, make sure to always generate a 'p' tag
    if (!getSelectionBlockElement() ||
        !editor.element.textContent ||
       (!e.shiftKey && e.which === Keycodes.ENTER) || (e.ctrlKey && e.which === Keycodes.M)) {
      document.execCommand('formatBlock', false, 'p');
    } //else if (e.which === Keycodes.BKSP) {
      // TODO: Need to rerender when backspacing 2 blocks together
      //var cursorIndex = editor.getCursorIndexInCurrentBlock();
      //var currentBlockElement = getSelectionBlockElement();
      //editor.renderBlockAt(editor.getCurrentBlockIndex(), true);
      //setCursorIndexInElement(currentBlockElement, cursorIndex);
    //}
  });

  // On 'PASTE' sanitize and insert
  editor.addEventListener(editor.element, 'paste', function(e) {
    var data = e.clipboardData;
    var pastedHTML = data && data.getData && data.getData('text/html');
    var sanitizedHTML = pastedHTML && editor._renderer.rerender(pastedHTML);
    if (sanitizedHTML) {
      document.execCommand('insertHTML', false, sanitizedHTML);
      editor.syncVisual();
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

/* unused
function getNonTextBlocks(blockTypeSet, post) {
  var blocks = [];
  var len = post.length;
  var i, block, type;
  for (i = 0; i < len; i++) {
    block = post[i];
    type = blockTypeSet.findById(block && block.type);
    if (type && !type.isTextType) {
      blocks.push(block);
    }
  }
  return blocks;
}
*/

function clearChildNodes(element) {
  while (element.childNodes.length) {
    element.removeChild(element.childNodes[0]);
  }
}

/**
 * @class Editor
 * An individual Editor
 * @param element `Element` node
 * @param options hash of options
 */
function Editor(element, options) {
  if (!element) {
    throw new Error('Editor requires an element as the first argument');
  }

  this._elementListeners = [];
  this._views = [];
  this.element = element;

  // FIXME: This should merge onto this.options
  mergeWithOptions(this, defaults, options);

  this._renderer = new EditorDOMRenderer(window.document, this.cards);
  this._parser   = new DOMParser();

  this.applyClassName();
  this.applyPlaceholder();

  element.spellcheck = this.spellcheck;
  element.setAttribute('contentEditable', true);

  // FIXME: We should be able to pass a serialized payload and disregard
  // whatever is in DOM
  if (this.mobiledoc) {
    this.parseModelFromMobiledoc(this.mobiledoc);
  } else {
    this.parseModelFromDOM(this.element);
  }

  clearChildNodes(element);
  this.syncVisual();

  bindContentEditableTypingListeners(this);
  bindAutoTypingListeners(this);
  bindDragAndDrop(this);
  this.addEventListener(element, 'input', () => this.handleInput(...arguments));
  initEmbedCommands(this);

  this.addView(new TextFormatToolbar({
    rootElement: element,
    commands: this.textFormatCommands,
    sticky: this.stickyToolbar
  }));

  this.addView(new Tooltip({
    rootElement: element,
    showForTag: 'a'
  }));

  if (this.autofocus) {
    element.focus();
  }
}

// Add event emitter pub/sub functionality
merge(Editor.prototype, EventEmitter);

merge(Editor.prototype, {
  addView(view) {
    this._views.push(view);
  },

  loadModel(post) {
    this.post = post;
    this.syncVisual();
    this.trigger('update');
  },

  parseModelFromDOM(element) {
    this.post = this._parser.parse(element);
    this.trigger('update');
  },

  parseModelFromMobiledoc(mobiledoc) {
    this.post = new MobiledocParser().parse(mobiledoc);
    this.trigger('update');
  },

  syncVisual() {
    this._renderer.render(this.post, this.element);
  },

  getCurrentBlockIndex() {
    var selectionEl = this.element || getSelectionBlockElement();
    var blockElements = toArray(this.element.children);
    return blockElements.indexOf(selectionEl);
  },

  getCursorIndexInCurrentBlock() {
    var currentBlock = getSelectionBlockElement();
    if (currentBlock) {
      return getCursorOffsetInElement(currentBlock);
    }
    return -1;
  },

  insertBlock(block, index) {
    this.post.splice(index, 0, block);
    this.trigger('update');
  },

  removeBlockAt(index) {
    this.post.splice(index, 1);
    this.trigger('update');
  },

  replaceBlock(block, index) {
    this.post[index] = block;
    this.trigger('update');
  },

  renderBlockAt(/* index, replace */) {
    throw new Error('Unimplemented');
    /*
    var modelAtIndex = this.post[index];
    var html = this.compiler.render([modelAtIndex]);
    var dom = document.createElement('div');
    dom.innerHTML = html;
    var newEl = dom.firstChild;
    newEl.dataset.modelIndex = index;
    var sibling = this.element.children[index];
    if (replace) {
      this.element.replaceChild(newEl, sibling);
    } else {
      this.element.insertBefore(newEl, sibling);
    }
    */
  },

  syncContentEditableBlocks() {
    throw new Error('Unimplemented');
    /*
    var nonTextBlocks = getNonTextBlocks(this.compiler.blockTypes, this.post);
    var blockElements = toArray(this.element.children);
    var len = blockElements.length;
    var updatedModel = [];
    var i, block, blockEl;
    for (i = 0; i < len; i++) {
      blockEl = blockElements[i];
      if(blockEl.isContentEditable) {
        updatedModel.push(this._parser.serializeBlockNode(blockEl));
      } else {
        if (blockEl.dataset.modelIndex) {
          block = this.model[blockEl.dataset.modelIndex];
          updatedModel.push(block);
        } else {
          updatedModel.push(nonTextBlocks.shift());
        }
      }
    }
    this.post = updatedModel;
    this.trigger('update');
    */
  },

  applyClassName() {
    var editorClassName = 'ck-editor';
    var editorClassNameRegExp = new RegExp(editorClassName);
    var existingClassName = this.element.className;

    if (!editorClassNameRegExp.test(existingClassName)) {
      existingClassName += (existingClassName ? ' ' : '') + editorClassName;
    }
    this.element.className = existingClassName;
  },

  applyPlaceholder() {
    const placeholder = this.placeholder;
    const existingPlaceholder = getData(this.element, 'placeholder');

    if (placeholder && !existingPlaceholder) {
      setData(this.element, 'placeholder', placeholder);
    }
  },

  handleInput() {
    // find added sections
    let sectionsInDOM = [];
    let newSections = [];
    let previousSection;
    forEachChildNode(this.element, (node) => {
      let section = this.post.getElementSection(node);
      if (!section) {
        section = this._parser.parseSection(
          previousSection,
          node
        );
        this.post.setSectionElement(section, node);
        newSections.push(section);
        if (previousSection) {
          this.post.insertSectionAfter(section, previousSection);
        } else {
          this.post.prependSection(section);
        }
      }
      // may cause duplicates to be included
      sectionsInDOM.push(section);
      previousSection = section;
    });

    // remove deleted nodes
    let i;
    for (i=this.post.sections.length-1;i>=0;i--) {
      let section = this.post.sections[i];
      if (sectionsInDOM.indexOf(section) === -1) {
        this.post.removeSection(section);
      }
    }

    // reparse the section(s) with the cursor
    const sectionsWithCursor = this.getSectionsWithCursor();
    // FIXME: This is a hack to ensure a previous section is parsed when the
    // user presses enter (or pastes a newline)
    let firstSection = sectionsWithCursor[0];
    if (firstSection) {
      let previousSection = this.post.getPreviousSection(firstSection);
      if (previousSection) {
        sectionsWithCursor.unshift(previousSection);
      }
    }
    sectionsWithCursor.forEach((section) => {
      if (newSections.indexOf(section) === -1) {
        this.reparseSection(section);
      }
    });
  },

  getSectionsWithCursor() {
    const selection = document.getSelection();
    if (selection.rangeCount === 0) {
      return null;
    }

    const range = selection.getRangeAt(0);

    let { startContainer:startElement, endContainer:endElement } = range;

    let getElementSection = (e) => this.post.getElementSection(e);
    let { result:startSection } = detectParentNode(startElement, getElementSection);
    let { result:endSection } = detectParentNode(endElement, getElementSection);

    let startIndex = this.post.sections.indexOf(startSection),
        endIndex = this.post.sections.indexOf(endSection);

    return this.post.sections.slice(startIndex, endIndex+1);
  },

  reparseSection(section) {
    let sectionElement = this.post.getSectionElement(section);
    let previousSection = this.post.getPreviousSection(section);

    var newSection = this._parser.parseSection(
      previousSection,
      sectionElement
    );
    this.post.replaceSection(section, newSection);
    this.post.setSectionElement(newSection, sectionElement);

    this.trigger('update');
  },

  serialize() {
    return MobiledocRenderer.render(this.post);
  },

  removeAllViews() {
    this._views.forEach((v) => v.destroy());
    this._views = [];
  },

  destroy() {
    this.removeAllEventListeners();
    this.removeAllViews();
  }
});

mixin(Editor, EventListenerMixin);

export default Editor;
