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
import TextFormatCommand from '../commands/text-format';
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

function bindContentEditableTypingCorrections(editor) {
  editor.element.addEventListener('keyup', function(e) {
    if(!e.shiftKey && e.which === Keycodes.ENTER) {
      var selectionTag = getSelectionBlockTagName();
      if (!selectionTag || selectionTag === Type.QUOTE.tag) {
        document.execCommand('formatBlock', false, Type.TEXT.tag);
      }
    } else if (e.which === Keycodes.BKSP) {
      if(!editor.element.innerHTML) {
        document.execCommand('formatBlock', false, Type.TEXT.tag);
      }
    }
  });
}

function bindPasteListener(editor) {
  editor.element.addEventListener('paste', function(e) {
    var cleanedContent = cleanPastedContent(e, Type.TEXT.tag);
    if (cleanedContent) {
      document.execCommand('insertHTML', false, cleanedContent);
    }
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

function bindLiveUpdate(editor) {
  editor.element.addEventListener('input', function() {
    editor.syncModel();
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

    bindContentEditableTypingCorrections(editor);
    bindPasteListener(editor);
    bindAutoTypingListeners(editor);
    bindDragAndDrop(editor);
    bindLiveUpdate(editor);
    initEmbedCommands(editor);

    editor.textFormatToolbar = new TextFormatToolbar({ rootElement: element, commands: editor.textFormatCommands, sticky: editor.stickyToolbar });
    editor.linkTooltips = new Tooltip({ rootElement: element, showForTag: Type.LINK.tag });

    // TESTING
    /*
    editor.element.addEventListener('mouseup', function() {
      console.log(editor.getCurrentEditingIndex());
    });
    editor.element.addEventListener('keyup', function() {
      console.log(editor.getCurrentEditingIndex());
    });
    */
    
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

Editor.prototype.sync = function() {
  this.syncModel();
  this.syncVisual();
};

Editor.prototype.syncModel = function() {
  this.model = this.compiler.parse(this.element.innerHTML);
  this.trigger('update');
};

Editor.prototype.syncModelAt = function(index) {
  if (index > -1) {
    var blockElements = toArray(this.element.children);
    var parsedBlockModel = this.compiler.parser.parseBlock(blockElements[index]);
    if (parsedBlockModel) {
      this.model[index] = parsedBlockModel;
    } else {
      this.model.splice(index, 1);
    }
    this.trigger('update', { index: index });
  }
};

Editor.prototype.syncModelAtSelection = function() {
  var index = this.getCurrentBlockIndex();
  this.syncModelAt(index);
};

Editor.prototype.syncVisual = function() {
  this.element.innerHTML = this.compiler.render(this.model);
};

Editor.prototype.syncVisualAt = function(index) {
  if (index > -1) {
    var blockModel = this.model[index];
    var html = this.compiler.render([blockModel]);
    var blockElements = toArray(this.element.children);
    var element = blockElements[index];
    element.innerHTML = html;
  }
};

Editor.prototype.getCurrentBlockIndex = function() {
  var selectionEl = getSelectionBlockElement();
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

Editor.prototype.getCurrentEditingIndex = function() {
  return [this.getCurrentBlockIndex(), this.getCurrentCursorIndex()];
};

Editor.prototype.insertBlock = function(model) {
  this.insertBlockAt(model, this.getCurrentBlockIndex());
  this.trigger('update');
};

Editor.prototype.insertBlockAt = function(model, index) {
  this.model.splice(index, 0, model);
  this.trigger('update');
};

Editor.prototype.replaceBlockAt = function(model, index) {
  this.model[index] = model;
  this.trigger('update');
};

Editor.prototype.removeBlockAt = function(index) {
  this.model.splice(index, 1);
  this.trigger('update');
};

Editor.prototype.addTextFormat = function(opts) {
  var command = new TextFormatCommand(opts);
  this.compiler.registerMarkupType(new Type({
    name : opts.name,
    tag  : opts.tag || opts.name
  }));
  this.textFormatCommands.push(command);
  this.textFormatToolbar.addCommand(command);
};

export default Editor;
