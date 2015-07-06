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
} from 'content-kit-compiler';
import { toArray, merge, mergeWithOptions } from 'content-kit-utils';
import { win, doc } from 'content-kit-editor/utils/compat';
import ElementMap from "../utils/element-map";

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
  cards: {}
};

function replaceInArray(array, original, replacement) {
  var i, l, possibleOriginal;
  for (i=0,l=array.length;i<l;i++) {
    possibleOriginal = array[i];
    if (possibleOriginal === original) {
      array[i] = replacement;
      return;
    }
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

function bindLiveUpdate(editor) {
  editor.element.addEventListener('input', () => {
    var selection = document.getSelection();
    if (selection.rangeCount) {
      var range = selection.getRangeAt(0);
      if (range.collapsed) {
        var element = range.startContainer;
        var sectionElement, section;
        while (element) {
          section = editor.sectionElementMap.get(element);
          if (section) {
            sectionElement = element;
            break;
          }
          element = element.parentNode;
        }

        if (!sectionElement) {
          throw new Error('There is not section element for the previous edit');
        }

        var previousSectionElement, previousSection;
        if (sectionElement && sectionElement.previousSibling) {
          previousSectionElement = sectionElement.previousSibling;
          previousSection = previousSectionElement.dataset.section;
        }

        var newSection = editor.compiler.parseSection(
          previousSection,
          sectionElement.firstChild
        );

        // FIXME: This would benefit from post being a linked-list of sections
        replaceInArray(editor.model.sections, section, newSection);
        editor.sectionElementMap.set(sectionElement, newSection);
        editor.trigger('update');
        return;
      }
    }
    editor.syncContentEditableBlocks();
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

function applyClassName(editorElement) {
  var editorClassName = 'ck-editor';
  var editorClassNameRegExp = new RegExp(editorClassName);
  var existingClassName = editorElement.className;

  if (!editorClassNameRegExp.test(existingClassName)) {
    existingClassName += (existingClassName ? ' ' : '') + editorClassName;
  }
  editorElement.className = existingClassName;
}

function applyPlaceholder(editorElement, placeholder) {
  var dataset = editorElement.dataset;
  if (placeholder && !dataset.placeholder) {
    dataset.placeholder = placeholder;
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

/**
 * @class Editor
 * An individual Editor
 * @param element `Element` node
 * @param options hash of options
 */
function Editor(element, options) {
  var editor = this;
  mergeWithOptions(editor, defaults, options);
  if (!editor.compiler) {
    editor.compiler = new Compiler({
      includeTypeNames: true, // outputs models with type names, i.e. 'BOLD', for easier debugging
      renderer: new NewDOMRenderer(window.document, editor.cards)
    });
  }

  this.sectionElementMap = new ElementMap();

  if (element) {
    applyClassName(element);
    applyPlaceholder(element, editor.placeholder);
    element.spellcheck = editor.spellcheck;
    element.setAttribute('contentEditable', true);
    editor.element = element;

    if (editor.model) {
      editor.loadModel(editor.model);
    } else {
      this.syncModel();
      while (element.childNodes.length) {
        element.childNodes[0].remove();
      }
      this.syncVisual();
    }

    bindContentEditableTypingListeners(editor);
    bindAutoTypingListeners(editor);
    bindDragAndDrop(editor);
    bindLiveUpdate(editor);
    initEmbedCommands(editor);

    editor.textFormatToolbar = new TextFormatToolbar({ rootElement: element, commands: editor.textFormatCommands, sticky: editor.stickyToolbar });
    editor.linkTooltips = new Tooltip({ rootElement: element, showForTag: Type.LINK.tag });

    if(editor.autofocus) { element.focus(); }
  }
}

// Add event emitter pub/sub functionality
merge(Editor.prototype, EventEmitter);

Editor.prototype.loadModel = function(model) {
  this.model = model;
  this.syncVisual();
  this.trigger('update');
};

Editor.prototype.syncModel = function() {
  this.model = this.compiler.parse(this.element);
  this.trigger('update');
};

Editor.prototype.syncVisual = function() {
  this.compiler.render(this.model, this.sectionElementMap, this.element);
};

Editor.prototype.getCurrentBlockIndex = function(element) {
  var selectionEl = element || getSelectionBlockElement();
  var blockElements = toArray(this.element.children);
  return blockElements.indexOf(selectionEl);
};

Editor.prototype.getCursorIndexInCurrentBlock = function() {
  var currentBlock = getSelectionBlockElement();
  if (currentBlock) {
    return getCursorOffsetInElement(currentBlock);
  }
  return -1;
};

Editor.prototype.insertBlock = function(block, index) {
  this.model.splice(index, 0, block);
  this.trigger('update');
};

Editor.prototype.removeBlockAt = function(index) {
  this.model.splice(index, 1);
  this.trigger('update');
};

Editor.prototype.replaceBlock = function(block, index) {
  this.model[index] = block;
  this.trigger('update');
};

Editor.prototype.renderBlockAt = function(index, replace) {
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
};

Editor.prototype.syncContentEditableBlocks = function() {
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
};


export default Editor;
