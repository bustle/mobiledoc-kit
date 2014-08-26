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
import { RootTags, Keycodes } from '../constants';
import { getSelectionBlockElement, getSelectionBlockTagName } from '../utils/selection-utils';
import { cleanPastedContent } from '../utils/paste-utils';
import Compiler from '../../content-kit-compiler/compiler';
import TextModel from '../../content-kit-compiler/models/text';
import Type from '../../content-kit-compiler/types/type';
import { toArray } from '../../content-kit-utils/array-utils';
import { mergeWithOptions } from '../../content-kit-utils/object-utils';

var defaults = {
  placeholder: 'Write here...',
  spellcheck: true,
  autofocus: true,
  textFormatCommands: [
    new BoldCommand(),
    new ItalicCommand(),
    new LinkCommand(),
    new QuoteCommand(),
    new HeadingCommand(),
    new SubheadingCommand()
  ],
  embedCommands: [
    new ImageCommand(),
    new OEmbedCommand()
  ],
  autoTypingCommands: [
    new UnorderedListCommand(),
    new OrderedListCommand()
  ],
  compiler: new Compiler({
    includeTypeNames: true, // outputs models with type names, i.e. 'BOLD', for easier debugging
    renderer: new EditorHTMLRenderer() // subclassed HTML renderer that adds structure for editor interactivity
  })
};

var editorClassName = 'ck-editor';
var editorClassNameRegExp = new RegExp(editorClassName);

function bindTypingEvents(editor) {
  var editorEl = editor.element;

  // Breaks out of blockquotes when pressing enter.
  // TODO: remove when direction model manip. complete
  editorEl.addEventListener('keyup', function(e) {
    if(!e.shiftKey && e.which === Keycodes.ENTER) {
      if(Type.QUOTE.tag === getSelectionBlockTagName()) {
        document.execCommand('formatBlock', false, Type.TEXT.tag);
        e.stopPropagation();
      }
    }
  });

  // Assure there is always a supported root tag, and not empty text nodes or divs.
  // TODO: remove when direction model manip. complete
  editorEl.addEventListener('keyup', function() {
    if (this.innerHTML.length && RootTags.indexOf(getSelectionBlockTagName()) === -1) {
      document.execCommand('formatBlock', false, Type.TEXT.tag);
    }
  });

  // Watch typing patterns for auto format commands (e.g. lists '- ', '1. ')
  editorEl.addEventListener('keyup', function(e) {
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

  // Experimental: Live update
  editorEl.addEventListener('keyup', function() {
    var index = editor.getCurrentBlockIndex();
    editor.syncModelAt(index);
  });
  document.addEventListener('mouseup', function() {
    setTimeout(function() {
      var index = editor.getCurrentBlockIndex();
      editor.syncModelAt(index);
    });
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
  mergeWithOptions(editor, defaults, options);

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

    editor.syncModel();

    bindTypingEvents(editor);
    editor.element.addEventListener('paste', function(e) {
      var cleanedContent = cleanPastedContent(e, Type.TEXT.tag);
      if (cleanedContent) {
        document.execCommand('insertHTML', false, cleanedContent);
        editor.syncModel();  // TODO: can optimize to just sync to index range
      }
    });

    editor.textFormatToolbar = new TextFormatToolbar({ rootElement: element, commands: editor.textFormatCommands });
    var linkTooltips = new Tooltip({ rootElement: element, showForTag: Type.LINK.tag });

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
  if (index > -1) {
    var blockElements = toArray(this.element.children);
    var parsedBlockModel = this.compiler.parser.parseBlock(blockElements[index]);
    this.model[index] = parsedBlockModel;

     // TODO: event subscription
    ContentKitDemo.syncCodePane(this);
  }
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
