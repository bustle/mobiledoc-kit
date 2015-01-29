import EditorHTMLRenderer from './editor-html-renderer';
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
import Keycodes from '../utils/keycodes';
import { getSelectionBlockElement, getSelectionBlockTagName, getCursorOffsetInElement } from '../utils/selection-utils';
import EventEmitter from '../utils/event-emitter';
import { cleanPastedContent } from '../utils/paste-utils';
import Compiler from '../../content-kit-compiler/compiler';
import Type from '../../content-kit-compiler/types/type';
import { toArray } from '../../content-kit-utils/array-utils';
import { merge, mergeWithOptions } from '../../content-kit-utils/object-utils';

var defaults = {
  placeholder: 'Write here...',
  spellcheck: true,
  autofocus: true,
  model: null,
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
    new ImageCommand({  serviceUrl: '/upload' }),
    new OEmbedCommand({ serviceUrl: '/embed'  })
  ],
  autoTypingCommands: [
    new UnorderedListCommand(),
    new OrderedListCommand()
  ],
  compiler: new Compiler({
    includeTypeNames: true, // outputs models with type names, i.e. 'BOLD', for easier debugging
    renderer: new EditorHTMLRenderer() // subclassed HTML renderer that adds dom structure for additional editor interactivity
  })
};

function bindContentEditableTypingListeners(editor) {
  // Correct some contentEditable woes before reparsing
  editor.element.addEventListener('keyup', function(e) {
    if((!e.shiftKey && e.which === Keycodes.ENTER) || (e.ctrlKey && e.which === Keycodes.M)) {
      // On a carrage return, make sure it always generates a 'p' tag
      var selectionTag = getSelectionBlockTagName();
      if (!selectionTag || selectionTag === Type.QUOTE.tag) {
        document.execCommand('formatBlock', false, Type.PARAGRAPH.tag);
      }
    }// else if (e.which === Keycodes.BKSP) {
      // TODO: need to rerender when backspacing 2 blocks together
    //}

    // Assure there is always a supported block tag, and not empty text nodes or divs.
    if (!getSelectionBlockElement()) {
      document.execCommand('formatBlock', false, Type.PARAGRAPH.tag);
    }
  });

  // On 'PASTE' convert content to blocks and insert
  editor.element.addEventListener('paste', function(e) {
    var cleanedContent = cleanPastedContent(e, Type.PARAGRAPH.tag);
    if (cleanedContent) {
      document.execCommand('insertHTML', false, cleanedContent);
    }
  });
}

function bindLiveUpdate(editor) {
  editor.element.addEventListener('input', function() {
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

function bindDragAndDrop() {
  // TODO. For now, just prevent redirect when dropping something on the page
  window.addEventListener('dragover', function(e) {
    e.preventDefault(); // prevents showing cursor where to drop
  });
  window.addEventListener('drop', function(e) {
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

  if (element) {
    applyClassName(element);
    applyPlaceholder(element, editor.placeholder);
    element.spellcheck = editor.spellcheck;
    element.setAttribute('contentEditable', true);
    editor.element = element;

    if (editor.model) {
      editor.loadModel(editor.model);
    } else {
      editor.sync();
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
  this.model = this.compiler.parse(this.element.innerHTML);
  this.trigger('update');
};

Editor.prototype.syncVisual = function() {
  this.element.innerHTML = this.compiler.render(this.model);
};

Editor.prototype.sync = function() {
  this.syncModel();
  this.syncVisual();
};

Editor.prototype.getCurrentBlockIndex = function(element) {
  var selectionEl = element || getSelectionBlockElement();
  var blockElements = toArray(this.element.children);
  return blockElements.indexOf(selectionEl);
};

Editor.prototype.getCurrentCursorIndex = function() {
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
  var html = this.compiler.render([this.model[index]]);
  var dom = document.createElement('div');
  dom.innerHTML = html;
  var newEl = dom.firstChild;
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
  var i, blockEl;
  for (i = 0; i < len; i++) {
    blockEl = blockElements[i];
    if(blockEl.isContentEditable) {
      updatedModel.push(this.compiler.parser.serializeBlockNode(blockEl));
    } else {
      updatedModel.push(nonTextBlocks.shift());
    }
  }
  this.model = updatedModel;
  this.trigger('update');
};


export default Editor;
