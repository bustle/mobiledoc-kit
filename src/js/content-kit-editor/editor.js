import TextFormatToolbar  from './views/text-format-toolbar';
import Tooltip from './views/tooltip';
import EmbedIntent from './views/embed-intent';
import UnorderedListCommand from './commands/unordered-list';
import OrderedListCommand from './commands/ordered-list';
import TextFormatCommand from './commands/text-format';
import { Tags, RootTags, Keycodes, RegEx } from './constants';
import { moveCursorToBeginningOfSelection, getSelectionTagName, getSelectionBlockElement, getSelectionBlockTagName } from './utils/selection-utils';
import Compiler from '../content-kit-compiler/compiler';
import TextModel from '../content-kit-compiler/models/text';
import Type from '../content-kit-compiler/types/type';
import { toArray } from '../content-kit-utils/array-utils';
import { merge } from '../content-kit-utils/object-utils';
import EditorHTMLRenderer from './editor-html-renderer';

var editorClassName = 'ck-editor';
var editorClassNameRegExp = new RegExp(editorClassName);

function plainTextToBlocks(plainText, blockTag) {
  var blocks = plainText.split(RegEx.NEWLINE),
      len = blocks.length,
      block, openTag, closeTag, content, i;
  if(len < 2) {
    return plainText;
  } else {
    content = '';
    openTag = '<' + blockTag + '>';
    closeTag = '</' + blockTag + '>';
    for(i=0; i<len; ++i) {
      block = blocks[i];
      if(block !== '') {
        content += openTag + block + closeTag;
      }
    }
    return content;
  }
}

function bindTypingEvents(editor) {
  var editorEl = editor.element;

  // Breaks out of blockquotes when pressing enter.
  editorEl.addEventListener('keyup', function(e) {
    if(!e.shiftKey && e.which === Keycodes.ENTER) {
      if(Tags.QUOTE === getSelectionBlockTagName()) {
        document.execCommand('formatBlock', false, editor.defaultFormatter);
        e.stopPropagation();
      }
    }
  });

  // Creates unordered list when block starts with '- ', or ordered if starts with '1. '
  editorEl.addEventListener('keyup', function(e) {
    var selectedText = window.getSelection().anchorNode.textContent,
        selection, selectionNode, command, replaceRegex;

    if (Tags.LIST_ITEM !== getSelectionTagName()) {
      if (RegEx.UL_START.test(selectedText)) {
        command = new UnorderedListCommand();
        replaceRegex = RegEx.UL_START;
      } else if (RegEx.OL_START.test(selectedText)) {
        command = new OrderedListCommand();
        replaceRegex = RegEx.OL_START;
      }

      if (command) {
        command.exec();
        selection = window.getSelection();
        selectionNode = selection.anchorNode;
        selectionNode.textContent = selectedText.replace(replaceRegex, '');
        moveCursorToBeginningOfSelection(selection);
        e.stopPropagation();
      }
    }
  });

  // Assure there is always a supported root tag, and not empty text nodes or divs.
  editorEl.addEventListener('keyup', function() {
    if (this.innerHTML.length && RootTags.indexOf(getSelectionBlockTagName()) === -1) {
      document.execCommand('formatBlock', false, editor.defaultFormatter);
    }
  });

  // Experimental: Live update - sync model with textual content as you type
  editorEl.addEventListener('keyup', function(e) {
    if (editor.model && editor.model.length) {
      var index = editor.getCurrentBlockIndex();
      if (editor.model[index].type === 1) {
        editor.syncModelAt(index);
      }
    }
  });
}

function bindPasteEvents(editor) {
  editor.element.addEventListener('paste', function(e) {
    var data = e.clipboardData, plainText;
    e.preventDefault();
    if(data && data.getData) {
      plainText = data.getData('text/plain');
      var formattedContent = plainTextToBlocks(plainText, editor.defaultFormatter);
      document.execCommand('insertHTML', false, formattedContent);
    }
  });
}

/**
 * @class Editor
 * An individual Editor
 * @param element `Element` node
 * @param options hash of options
 */
function Editor(element, options) {
  var editor = this;
  merge(editor, options);

  if (element) {
    var className = element.className;
    var dataset = element.dataset;

    if (!editorClassNameRegExp.test(className)) {
      className += (className ? ' ' : '') + editorClassName;
    }
    element.className = className;

    if (!dataset.placeholder) {
      dataset.placeholder = editor.placeholder;
    }
    if(!editor.spellcheck) {
      element.spellcheck = false;
    }

    element.setAttribute('contentEditable', true);
    editor.element = element;

    var compiler = editor.compiler = options.compiler || new Compiler({
      includeTypeNames: true, // output type names for easier debugging
      renderer: new EditorHTMLRenderer()
    });
    editor.syncModel();

    bindTypingEvents(editor);
    bindPasteEvents(editor);

    editor.textFormatToolbar = new TextFormatToolbar({ rootElement: element, commands: editor.textFormatCommands });
    var linkTooltips = new Tooltip({ rootElement: element, showForTag: Tags.LINK });

    if(editor.embedCommands) {
      // NOTE: must come after bindTypingEvents so those keyup handlers are executed first.
      // TODO: manage event listener order
      var embedIntent = new EmbedIntent({
        editorContext: editor,
        commands: editor.embedCommands,
        rootElement: element
      });

      if (editor.imageServiceUrl) {
        // TODO: lookup by name
        editor.embedCommands[0].uploader.url = editor.imageServiceUrl;
      }
      if (editor.embedServiceUrl) {
        // TODO: lookup by name
        editor.embedCommands[1].embedService.url = editor.embedServiceUrl;
      }
    }
    
    if(editor.autofocus) { element.focus(); }
  }
}

Editor.prototype.syncModel = function() {
  this.model = this.compiler.parse(this.element.innerHTML);
};

Editor.prototype.syncModelAt = function(index) {
  var blockElements = toArray(this.element.children);
  var parsedBlockModel = this.compiler.parser.parseBlock(blockElements[index]);
  this.model[index] = parsedBlockModel;
};

Editor.prototype.syncVisualAt = function(index) {
  var blockModel = this.model[index];
  var html = this.compiler.render([blockModel]);
  var blockElements = toArray(this.element.children);
  var element = blockElements[index];
  element.innerHTML = html;
};

Editor.prototype.getCurrentBlockIndex = function() {
  var selectionEl = getSelectionBlockElement();
  var blockElements = toArray(this.element.children);
  return blockElements.indexOf(selectionEl);
};

Editor.prototype.insertBlock = function(model) {
  this.insertBlockAt(model, this.getCurrentBlockIndex());
};

Editor.prototype.insertBlockAt = function(model, index) {
  model = model || new TextModel();
  this.model.splice(index, 0, model);
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
