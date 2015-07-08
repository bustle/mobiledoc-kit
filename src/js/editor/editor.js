import NewDOMRenderer from '../renderers/new-dom-renderer';
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
import {
  Type,
  Compiler,
  MobiledocParser
} from 'content-kit-compiler';
import { toArray, merge, mergeWithOptions } from 'content-kit-utils';
import { win, doc } from 'content-kit-editor/utils/compat';
import { detectParentNode } from '../utils/dom-utils';
import Serializer from '../renderers/new-serializer';

var defaults = {
  placeholder: 'Write here...',
  spellcheck: true,
  autofocus: true,
  model: null,
  serverHost: '',
  stickyToolbar: !!('ontouchstart' in win),
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
  compiler: null,
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
  editor.element.addEventListener('keyup', function(e) {
    // Assure there is always a supported block tag, and not empty text nodes or divs.
    // On a carrage return, make sure to always generate a 'p' tag
    if (!getSelectionBlockElement() ||
        !editor.element.textContent ||
       (!e.shiftKey && e.which === Keycodes.ENTER) || (e.ctrlKey && e.which === Keycodes.M)) {
      doc.execCommand('formatBlock', false, Type.PARAGRAPH.tag);
    } //else if (e.which === Keycodes.BKSP) {
      // TODO: Need to rerender when backspacing 2 blocks together
      //var cursorIndex = editor.getCursorIndexInCurrentBlock();
      //var currentBlockElement = getSelectionBlockElement();
      //editor.renderBlockAt(editor.getCurrentBlockIndex(), true);
      //setCursorIndexInElement(currentBlockElement, cursorIndex);
    //}
  });

  // On 'PASTE' sanitize and insert
  editor.element.addEventListener('paste', function(e) {
    var data = e.clipboardData;
    var pastedHTML = data && data.getData && data.getData('text/html');
    var sanitizedHTML = pastedHTML && editor.compiler.rerender(pastedHTML);
    if (sanitizedHTML) {
      doc.execCommand('insertHTML', false, sanitizedHTML);
      editor.syncVisual();
    }
    e.preventDefault();
    return false;
  });
}

function bindAutoTypingListeners(editor) {
  // Watch typing patterns for auto format commands (e.g. lists '- ', '1. ')
  editor.element.addEventListener('keyup', function(e) {
    var commands = editor.autoTypingCommands;
    var count = commands && commands.length;
    var selection, i;

    if (count) {
      selection = win.getSelection();
      for (i = 0; i < count; i++) {
        if (commands[i].checkAutoFormat(selection.anchorNode)) {
          e.stopPropagation();
          return;
        }
      }
    }
  });
}

function bindDragAndDrop() {
  // TODO. For now, just prevent redirect when dropping something on the page
  win.addEventListener('dragover', function(e) {
    e.preventDefault(); // prevents showing cursor where to drop
  });
  win.addEventListener('drop', function(e) {
    e.preventDefault(); // prevent page from redirecting
  });
}

function initEmbedCommands(editor) {
  var commands = editor.embedCommands;
  if(commands) {
    return new EmbedIntent({
      editorContext: editor,
      commands: commands,
      rootElement: editor.element
    });
  }
}

function getNonTextBlocks(blockTypeSet, model) {
  var blocks = [];
  var len = model.length;
  var i, block, type;
  for (i = 0; i < len; i++) {
    block = model[i];
    type = blockTypeSet.findById(block && block.type);
    if (type && !type.isTextType) {
      blocks.push(block);
    }
  }
  return blocks;
}

function clearChildNodes(element) {
  while (element.childNodes.length) {
    element.childNodes[0].remove();
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

  this.element = element;

  // FIXME: This should merge onto this.options
  mergeWithOptions(this, defaults, options);

  if (!this.compiler) {
    this.compiler = new Compiler({
      // outputs models with type names, i.e. 'BOLD', for easier debugging
      includeTypeNames: true,
      renderer: new NewDOMRenderer(window.document, this.cards)
    });
  }

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
  element.addEventListener('input', () => this.handleInput(...arguments));
  initEmbedCommands(this);

  this.textFormatToolbar = new TextFormatToolbar({
    rootElement: element,
    commands: this.textFormatCommands,
    sticky: this.stickyToolbar
  });

  this.linkTooltips = new Tooltip({
    rootElement: element,
    showForTag: Type.LINK.tag
  });

  if (this.autofocus) {
    element.focus();
  }
}

// Add event emitter pub/sub functionality
merge(Editor.prototype, EventEmitter);

merge(Editor.prototype, {

  loadModel(model) {
    this.model = model;
    this.syncVisual();
    this.trigger('update');
  },

  parseModelFromDOM(element) {
    this.model = this.compiler.parse(element);
    this.trigger('update');
  },

  parseModelFromMobiledoc(mobiledoc) {
    this.model = new MobiledocParser().parse(mobiledoc);
    this.trigger('update');
  },

  syncVisual() {
    this.compiler.render(this.model, this.element);
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
    this.model.splice(index, 0, block);
    this.trigger('update');
  },

  removeBlockAt(index) {
    this.model.splice(index, 1);
    this.trigger('update');
  },

  replaceBlock(block, index) {
    this.model[index] = block;
    this.trigger('update');
  },

  renderBlockAt(index, replace) {
    var modelAtIndex = this.model[index];
    var html = this.compiler.render([modelAtIndex]);
    var dom = doc.createElement('div');
    dom.innerHTML = html;
    var newEl = dom.firstChild;
    newEl.dataset.modelIndex = index;
    var sibling = this.element.children[index];
    if (replace) {
      this.element.replaceChild(newEl, sibling);
    } else {
      this.element.insertBefore(newEl, sibling);
    }
  },

  syncContentEditableBlocks() {
    var nonTextBlocks = getNonTextBlocks(this.compiler.blockTypes, this.model);
    var blockElements = toArray(this.element.children);
    var len = blockElements.length;
    var updatedModel = [];
    var i, block, blockEl;
    for (i = 0; i < len; i++) {
      blockEl = blockElements[i];
      if(blockEl.isContentEditable) {
        updatedModel.push(this.compiler.parser.serializeBlockNode(blockEl));
      } else {
        if (blockEl.dataset.modelIndex) {
          block = this.model[blockEl.dataset.modelIndex];
          updatedModel.push(block);
        } else {
          updatedModel.push(nonTextBlocks.shift());
        }
      }
    }
    this.model = updatedModel;
    this.trigger('update');
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
    var dataset = this.element.dataset;
    const placeholder = this.placeholder;
    if (placeholder && !dataset.placeholder) {
      dataset.placeholder = placeholder;
    }
  },

  handleInput() {
    // find added sections
    let sectionsInDOM = [];
    let newSections = [];
    let previousSection;
    forEachChildNode(this.element, (node) => {
      let section = this.model.getElementSection(node);
      if (!section) {
        section = this.compiler.parseSection(
          previousSection,
          node
        );
        this.model.setSectionElement(section, node);
        newSections.push(section);
        if (previousSection) {
          this.model.insertSectionAfter(section, previousSection);
        } else {
          this.model.prependSection(section);
        }
      }
      // may cause duplicates to be included
      sectionsInDOM.push(section);
      previousSection = section;
    });

    // remove deleted nodes
    let i;
    for (i=this.model.sections.length-1;i>=0;i--) {
      let section = this.model.sections[i];
      if (sectionsInDOM.indexOf(section) === -1) {
        this.model.removeSection(section);
      }
    }

    // reparse the section(s) with the cursor
    const sectionsWithCursor = this.getSectionsWithCursor();
    // FIXME: This is a hack to ensure a previous section is parsed when the
    // user presses enter (or pastes a newline)
    let firstSection = sectionsWithCursor[0];
    if (firstSection) {
      let previousSection = this.model.getPreviousSection(firstSection);
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

    let getElementSection = (e) => this.model.getElementSection(e);
    let { result:startSection } = detectParentNode(startElement, getElementSection);
    let { result:endSection } = detectParentNode(endElement, getElementSection);

    let startIndex = this.model.sections.indexOf(startSection),
        endIndex = this.model.sections.indexOf(endSection);

    return this.model.sections.slice(startIndex, endIndex+1);
  },

  reparseSection(section) {
    let sectionElement = this.model.getSectionElement(section);
    let previousSection = this.model.getPreviousSection(section);

    var newSection = this.compiler.parseSection(
      previousSection,
      sectionElement
    );
    this.model.replaceSection(section, newSection);
    this.model.setSectionElement(newSection, sectionElement);

    this.trigger('update');
  },

  serialize() {
    return Serializer.serialize(this.model);
  }

});

export default Editor;
