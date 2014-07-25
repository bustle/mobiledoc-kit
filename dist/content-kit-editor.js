/*!
 * @overview ContentKit-Editor: A modern, minimalist WYSIWYG editor.
 * @version  0.1.0
 * @author   Garth Poitras <garth22@gmail.com> (http://garthpoitras.com/)
 * @license  MIT
 * Last modified: Jul 25, 2014
 */

(function(exports, document) {

'use strict';

/**
 * @namespace ContentKit
 */
var ContentKit = exports.ContentKit || {};
exports.ContentKit = ContentKit;

var Keycodes = {
  ENTER : 13,
  ESC   : 27
};

var Regex = {
  NEWLINE       : /[\r\n]/g,
  HTTP_PROTOCOL : /^https?:\/\//i,
  HEADING_TAG   : /^(H1|H2|H3|H4|H5|H6)$/i,
  UL_START      : /^[-*]\s/,
  OL_START      : /^1\.\s/
};

var SelectionDirection = {
  LEFT_TO_RIGHT : 1,
  RIGHT_TO_LEFT : 2,
  SAME_NODE     : 3
};

var ToolbarDirection = {
  TOP   : 1,
  RIGHT : 2
};

var Tags = {
  PARAGRAPH    : 'P',
  HEADING      : 'H2',
  SUBHEADING   : 'H3',
  QUOTE        : 'BLOCKQUOTE',
  LIST         : 'UL',
  ORDERED_LIST : 'OL',
  LIST_ITEM    : 'LI',
  LINK         : 'A',
  BOLD         : 'B',
  ITALIC       : 'I'
};

var RootTags = [ Tags.PARAGRAPH, Tags.HEADING, Tags.SUBHEADING, Tags.QUOTE, Tags.LIST, Tags.ORDERED_LIST ];

function merge(object, updates) {
  updates = updates || {};
  for(var o in updates) {
    if (updates.hasOwnProperty(o)) {
      object[o] = updates[o];
    }
  }
  return object;
}

function inherits(Subclass, Superclass) {
  Subclass._super = Superclass;
  Subclass.prototype = Object.create(Superclass.prototype, {
    constructor: {
      value: Subclass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
}

function createDiv(className) {
  var div = document.createElement('div');
  if (className) {
    div.className = className;
  }
  return div;
}

function hideElement(element) {
  element.style.display = 'none';
}

function showElement(element) {
  element.style.display = 'block';
}

function swapElements(elementToShow, elementToHide) {
  hideElement(elementToHide);
  showElement(elementToShow);
}

function getEventTargetMatchingTag(tag, target, container) {
  // Traverses up DOM from an event target to find the node matching specifed tag
  while (target && target !== container) {
    if (target.tagName === tag) {
      return target;
    }
    target = target.parentNode;
  }
}

function nodeIsDescendantOfElement(node, element) {
  var parentNode = node.parentNode;
  while(parentNode) {
    if (parentNode === element) {
      return true;
    }
    parentNode = parentNode.parentNode;
  }
  return false;
}

function getElementRelativeOffset(element) {
  var offset = { left: 0, top: -window.pageYOffset };
  var offsetParent = element.offsetParent;
  var offsetParentPosition = window.getComputedStyle(offsetParent).position;
  var offsetParentRect;

  if (offsetParentPosition === 'relative') {
    offsetParentRect = offsetParent.getBoundingClientRect();
    offset.left = offsetParentRect.left;
    offset.top  = offsetParentRect.top;
  }
  return offset;
}

function getElementComputedStyleNumericProp(element, prop) {
  return parseFloat(window.getComputedStyle(element)[prop]);
}

function positionElementToRect(element, rect, topOffset, leftOffset) {
  var relativeOffset = getElementRelativeOffset(element);
  var style = element.style;
  var round = Math.round;

  topOffset = topOffset || 0;
  leftOffset = leftOffset || 0;
  style.left = round(rect.left - relativeOffset.left - leftOffset) + 'px';
  style.top  = round(rect.top  - relativeOffset.top  - topOffset) + 'px';
}

function positionElementHorizontallyCenteredToRect(element, rect, topOffset) {
  var horizontalCenter = (element.offsetWidth / 2) - (rect.width / 2);
  positionElementToRect(element, rect, topOffset, horizontalCenter);
}

function positionElementCenteredAbove(element, aboveElement) {
  var elementMargin = getElementComputedStyleNumericProp(element, 'marginBottom');
  positionElementHorizontallyCenteredToRect(element, aboveElement.getBoundingClientRect(), element.offsetHeight + elementMargin);
}

function positionElementCenteredBelow(element, belowElement) {
  var elementMargin = getElementComputedStyleNumericProp(element, 'marginTop');
  positionElementHorizontallyCenteredToRect(element, belowElement.getBoundingClientRect(), -element.offsetHeight - elementMargin);
}

function positionElementToLeftOf(element, leftOfElement) {
  var verticalCenter = (leftOfElement.offsetHeight / 2) - (element.offsetHeight / 2);
  var elementMargin = getElementComputedStyleNumericProp(element, 'marginRight');
  positionElementToRect(element, leftOfElement.getBoundingClientRect(), -verticalCenter, element.offsetWidth + elementMargin);
}

function positionElementToRightOf(element, rightOfElement) {
  var verticalCenter = (rightOfElement.offsetHeight / 2) - (element.offsetHeight / 2);
  var elementMargin = getElementComputedStyleNumericProp(element, 'marginLeft');
  var rightOfElementRect = rightOfElement.getBoundingClientRect();
  positionElementToRect(element, rightOfElementRect, -verticalCenter, -rightOfElement.offsetWidth - elementMargin);
}

function getDirectionOfSelection(selection) {
  var node = selection.anchorNode;
  var position = node && node.compareDocumentPosition(selection.focusNode);
  if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
    return SelectionDirection.LEFT_TO_RIGHT;
  } else if (position & Node.DOCUMENT_POSITION_PRECEDING) {
    return SelectionDirection.RIGHT_TO_LEFT;
  }
  return SelectionDirection.SAME_NODE;
}

function getSelectionElement(selection) {
  selection = selection || window.getSelection();
  var node = getDirectionOfSelection(selection) === SelectionDirection.LEFT_TO_RIGHT ? selection.anchorNode : selection.focusNode;
  return node && (node.nodeType === 3 ? node.parentNode : node);
}

function getSelectionBlockElement() {
  var element = getSelectionElement();
  var tag = element && element.tagName;
  while (tag && RootTags.indexOf(tag) === -1) {
    if (element.contentEditable === 'true') { break; } // Stop traversing up dom when hitting an editor element
    element = element.parentNode;
    tag = element.tagName;
  }
  return element;
}

function getSelectionTagName() {
  var element = getSelectionElement();
  return element ? element.tagName : null;
}

function getSelectionBlockTagName() {
  var element = getSelectionBlockElement();
  return element ? element.tagName : null;
}

function tagsInSelection(selection) {
  var element = getSelectionElement(selection);
  var tags = [];
  if (!selection.isCollapsed) {
    while(element) {
      if (element.contentEditable === 'true') { break; } // Stop traversing up dom when hitting an editor element
      if (element.tagName) {
        tags.push(element.tagName);
      }
      element = element.parentNode;
    }
  }
  return tags;
}

function selectionIsInElement(selection, element) {
  var node = selection.anchorNode;
  return node && nodeIsDescendantOfElement(node, element);
}

function moveCursorToBeginningOfSelection(selection) {
  var range = document.createRange();
  var node  = selection.anchorNode;
  range.setStart(node, 0);
  range.setEnd(node, 0);
  selection.removeAllRanges();
  selection.addRange(range);
}

function restoreRange(range) {
  var selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

function selectNode(node) {
  var range = document.createRange();
  var selection = window.getSelection();
  range.setStart(node, 0);
  range.setEnd(node, node.length);
  selection.removeAllRanges();
  selection.addRange(range);
}

function View(options) {
  this.tagName = options.tagName || 'div';
  this.classNames = options.classNames || [];
  this.element = document.createElement(this.tagName);
  this.element.className = this.classNames.join(' ');
  this.container = options.container || document.body;
  this.isShowing = false;
}

View.prototype = {
  show: function() {
    var view = this;
    if(!view.isShowing) {
      view.container.appendChild(view.element);
      view.isShowing = true;
      return true;
    }
  },
  hide: function() {
    var view = this;
    if(view.isShowing) {
      view.container.removeChild(view.element);
      view.isShowing = false;
      return true;
    }
  },
  addClass: function(className) {
    this.classNames.push(className);
    this.element.className = this.classNames.join(' ');
  },
  removeClass: function(className) {
    this.classNames.splice(this.classNames.indexOf(className), 1);
    this.element.className = this.classNames.join(' ');
  }
};

var Prompt = (function() {

  var container = document.body;
  var hiliter = createDiv('ck-editor-hilite');

  function Prompt(options) {
    var prompt = this;
    options.tagName = 'input';
    View.call(prompt, options);

    prompt.command = options.command;
    prompt.element.placeholder = options.placeholder || '';
    prompt.element.addEventListener('mouseup', function(e) { e.stopPropagation(); }); // prevents closing prompt when clicking input 
    prompt.element.addEventListener('keyup', function(e) {
      var entry = this.value;
      if(entry && !e.shiftKey && e.which === Keycodes.ENTER) {
        restoreRange(prompt.range);
        prompt.command.exec(entry);
        if (prompt.onComplete) { prompt.onComplete(); }
      }
    });

    window.addEventListener('resize', function() {
      var activeHilite = hiliter.parentNode;
      var range = prompt.range;
      if(activeHilite && range) {
        positionHiliteRange(range);
      }
    });
  }
  inherits(Prompt, View);

  Prompt.prototype = {
    show: function(callback) {
      var prompt = this;
      var element = prompt.element;
      element.value = null;
      prompt.range = window.getSelection().getRangeAt(0); // save the selection range
      container.appendChild(hiliter);
      positionHiliteRange(prompt.range);
      setTimeout(function(){ element.focus(); }); // defer focus (disrupts mouseup events)
      if (callback) { prompt.onComplete = callback; }
    },
    hide: function() {
      container.removeChild(hiliter);
    }
  };

  function positionHiliteRange(range) {
    var rect = range.getBoundingClientRect();
    var style = hiliter.style;
    style.width  = rect.width  + 'px';
    style.height = rect.height + 'px';
    positionElementToRect(hiliter, rect);
  }

  return Prompt;
}());

function createCommandIndex(commands) {
  var index = {};
  var len = commands.length, i, command;
  for(i = 0; i < len; i++) {
    command = commands[i];
    index[command.name] = command;
  }
  return index;
}

function Command(options) {
  var command = this;
  var name = options.name;
  var prompt = options.prompt;
  command.name = name;
  command.button = options.button || name;
  if (prompt) { command.prompt = prompt; }
}
Command.prototype.exec = function(){};

function TextFormatCommand(options) {
  Command.call(this, options);
  this.tag = options.tag;
  this.action = options.action || this.name;
  this.removeAction = options.removeAction || this.action;
}
inherits(TextFormatCommand, Command);

TextFormatCommand.prototype = {
  exec: function(value) {
    document.execCommand(this.action, false, value || null);
  },
  unexec: function(value) {
    document.execCommand(this.removeAction, false, value || null);
  }
};

function BoldCommand() {
  TextFormatCommand.call(this, {
    name: 'bold',
    tag: Tags.BOLD,
    button: '<i class="ck-icon-bold"></i>'
  });
}
inherits(BoldCommand, TextFormatCommand);
BoldCommand.prototype.exec = function() {
  // Don't allow executing bold command on heading tags
  if (!Regex.HEADING_TAG.test(getSelectionBlockTagName())) {
    BoldCommand._super.prototype.exec.call(this);
  }
};

function ItalicCommand() {
  TextFormatCommand.call(this, {
    name: 'italic',
    tag: Tags.ITALIC,
    button: '<i class="ck-icon-italic"></i>'
  });
}
inherits(ItalicCommand, TextFormatCommand);

function LinkCommand() {
  TextFormatCommand.call(this, {
    name: 'link',
    tag: Tags.LINK,
    action: 'createLink',
    removeAction: 'unlink',
    button: '<i class="ck-icon-link"></i>',
    prompt: new Prompt({
      command: this,
      placeholder: 'Enter a url, press return...'
    })
  });
}
inherits(LinkCommand, TextFormatCommand);
LinkCommand.prototype.exec = function(url) {
  if(this.tag === getSelectionTagName()) {
    this.unexec();
  } else {
    if (!Regex.HTTP_PROTOCOL.test(url)) {
      url = 'http://' + url;
    }
    LinkCommand._super.prototype.exec.call(this, url);
  }
};

function FormatBlockCommand(options) {
  options.action = 'formatBlock';
  TextFormatCommand.call(this, options);
}
inherits(FormatBlockCommand, TextFormatCommand);
FormatBlockCommand.prototype.exec = function() {
  var tag = this.tag;
  // Brackets neccessary for certain browsers
  var value =  '<' + tag + '>';
  var blockElement = getSelectionBlockElement();
  // Allow block commands to be toggled back to a paragraph
  if(tag === blockElement.tagName) {
    value = Tags.PARAGRAPH;
  } else {
    // Flattens the selection before applying the block format.
    // Otherwise, undesirable nested blocks can occur.
    var flatNode = document.createTextNode(blockElement.textContent);
    blockElement.parentNode.insertBefore(flatNode, blockElement);
    blockElement.parentNode.removeChild(blockElement);
    selectNode(flatNode);
  }
  
  FormatBlockCommand._super.prototype.exec.call(this, value);
};

function QuoteCommand() {
  FormatBlockCommand.call(this, {
    name: 'quote',
    tag: Tags.QUOTE,
    button: '<i class="ck-icon-quote"></i>'
  });
}
inherits(QuoteCommand, FormatBlockCommand);

function HeadingCommand() {
  FormatBlockCommand.call(this, {
    name: 'heading',
    tag: Tags.HEADING,
    button: '<i class="ck-icon-heading"></i>1'
  });
}
inherits(HeadingCommand, FormatBlockCommand);

function SubheadingCommand() {
  FormatBlockCommand.call(this, {
    name: 'subheading',
    tag: Tags.SUBHEADING,
    button: '<i class="ck-icon-heading"></i>2'
  });
}
inherits(SubheadingCommand, FormatBlockCommand);

function ListCommand(options) {
  TextFormatCommand.call(this, options);
}
inherits(ListCommand, TextFormatCommand);
ListCommand.prototype.exec = function() {
  ListCommand._super.prototype.exec.call(this);
  
  // After creation, lists need to be unwrapped from the default formatter P tag
  var listElement = getSelectionBlockElement();
  var wrapperNode = listElement.parentNode;
  if (wrapperNode.firstChild === listElement) {
    var editorNode = wrapperNode.parentNode;
    editorNode.insertBefore(listElement, wrapperNode);
    editorNode.removeChild(wrapperNode);
    selectNode(listElement);
  }
};

function UnorderedListCommand() {
  ListCommand.call(this, {
    name: 'list',
    tag: Tags.LIST,
    action: 'insertUnorderedList'
  });
}
inherits(UnorderedListCommand, ListCommand);

function OrderedListCommand() {
  ListCommand.call(this, {
    name: 'ordered list',
    tag: Tags.ORDERED_LIST,
    action: 'insertOrderedList'
  });
}
inherits(OrderedListCommand, ListCommand);

TextFormatCommand.all = [
  new BoldCommand(),
  new ItalicCommand(),
  new LinkCommand(),
  new QuoteCommand(),
  new HeadingCommand(),
  new SubheadingCommand()
];

TextFormatCommand.index = createCommandIndex(TextFormatCommand.all);


function EmbedCommand(options) {
  Command.call(this, options);
}
inherits(EmbedCommand, Command);
EmbedCommand.prototype.exec = function() {
  alert(this.name);
};

function ImageEmbedCommand(options) {
  EmbedCommand.call(this, {
    name: 'image',
    button: '<i class="ck-icon-image"></i>'
  });

  var fileBrowser = document.createElement('input');
  fileBrowser.type = 'file';
  fileBrowser.accept = 'image/*';
  fileBrowser.className = 'ck-file-input';
  fileBrowser.addEventListener('change', this.handleFile);
  document.body.appendChild(fileBrowser);
  this.fileBrowser = fileBrowser;
}
inherits(ImageEmbedCommand, EmbedCommand);
ImageEmbedCommand.prototype = {
  exec: function() {
    var clickEvent = new MouseEvent('click', { bubbles: false });
    this.fileBrowser.dispatchEvent(clickEvent);
  },
  handleFile: function(e) {
    var target = e.target;
    var file = target && target.files[0];
    var reader = new FileReader();
    reader.onload = function(event) {
      var base64File = event.target.result;
      var blockElement = getSelectionBlockElement();
      var image = document.createElement('img');
      image.src = base64File;

      // image needs to be placed outside of the current empty paragraph
      var editorNode = blockElement.parentNode;
      editorNode.insertBefore(image, blockElement);
      editorNode.removeChild(blockElement);
    };
    reader.readAsDataURL(file);
    target.value = null; // reset
  }
};

function MediaEmbedCommand(options) {
  EmbedCommand.call(this, {
    name: 'media',
    button: '<i class="ck-icon-embed"></i>',
    prompt: new Prompt({
      command: this,
      placeholder: 'Enter a twitter, or youtube url...'
    })
  });
}
inherits(MediaEmbedCommand, EmbedCommand);

EmbedCommand.all = [
  new ImageEmbedCommand(),
  new MediaEmbedCommand()
];

EmbedCommand.index = createCommandIndex(EmbedCommand.all);

ContentKit.Editor = (function() {

  // Default `Editor` options
  var defaults = {
    defaultFormatter: Tags.PARAGRAPH,
    placeholder: 'Write here...',
    spellcheck: true,
    autofocus: true,
    textFormatCommands: TextFormatCommand.all,
    embedCommands: EmbedCommand.all
  };

  var editorClassName = 'ck-editor';
  var editorClassNameRegExp = new RegExp(editorClassName);

  /**
   * Publically expose this class which sets up indiviual `Editor` classes
   * depending if user passes string selector, Node, or NodeList
   */
  function EditorFactory(element, options) {
    var editors = [];
    var elements, elementsLen, i;

    if (typeof element === 'string') {
      elements = document.querySelectorAll(element);
    } else if (element && element.length) {
      elements = element;
    } else if (element) {
      elements = [element];
    }

    if (elements) {
      options = merge(defaults, options);
      elementsLen = elements.length;
      for (i = 0; i < elementsLen; i++) {
        editors.push(new Editor(elements[i], options));
      }
    }

    return editors.length > 1 ? editors : editors[0];
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

      bindTypingEvents(editor);
      bindPasteEvents(editor);

      editor.parser = options.parser || new ContentKit.HTMLParser();

      var textFormatToolbar = new TextFormatToolbar({ rootElement: element, commands: editor.textFormatCommands });
      var linkTooltips = new Tooltip({ rootElement: element, showForTag: Tags.LINK });

      if(editor.embedCommands) {
        // NOTE: must come after bindTypingEvents so those keyup handlers are executed first.
        // TODO: manage event listener order
        var embedIntent = new EmbedIntent({
          commands: editor.embedCommands,
          rootElement: element
        });
      }
      
      if(editor.autofocus) { element.focus(); }
    }
  }

  Editor.prototype.parse = function() {
    return this.parser.parse(this.element.innerHTML);
  };

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
        if (Regex.UL_START.test(selectedText)) {
          command = new UnorderedListCommand();
          replaceRegex = Regex.UL_START;
        } else if (Regex.OL_START.test(selectedText)) {
          command = new OrderedListCommand();
          replaceRegex = Regex.OL_START;
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
    // Usually only happens when selecting all and deleting content.
    editorEl.addEventListener('keyup', function() {
      if (this.innerHTML.length && RootTags.indexOf(getSelectionBlockTagName()) === -1) {
        document.execCommand('formatBlock', false, editor.defaultFormatter);
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

  function plainTextToBlocks(plainText, blockTag) {
    var blocks = plainText.split(Regex.NEWLINE),
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

  return EditorFactory;
}());

var Toolbar = (function() {

  function Toolbar(options) {
    var toolbar = this;
    var commands = options.commands;
    var commandCount = commands && commands.length;
    var i, button;
    toolbar.direction = options.direction || ToolbarDirection.TOP;
    options.classNames = ['ck-toolbar'];
    if (toolbar.direction === ToolbarDirection.RIGHT) {
      options.classNames.push('right');
    }

    View.call(toolbar, options);

    toolbar.activePrompt = null;
    toolbar.buttons = [];

    toolbar.promptContainerElement = createDiv('ck-toolbar-prompt');
    toolbar.buttonContainerElement = createDiv('ck-toolbar-buttons');
    toolbar.element.appendChild(toolbar.promptContainerElement);
    toolbar.element.appendChild(toolbar.buttonContainerElement);

    for(i = 0; i < commandCount; i++) {
      button = new ToolbarButton({ command: commands[i], toolbar: toolbar });
      toolbar.buttons.push(button);
      toolbar.buttonContainerElement.appendChild(button.element);
    }
  }
  inherits(Toolbar, View);

  Toolbar.prototype.hide = function() {
    if (Toolbar._super.prototype.hide.call(this)) {
      var style = this.element.style;
      style.left = '';
      style.top = '';
      this.dismissPrompt();
    }
  };

  Toolbar.prototype.displayPrompt = function(prompt) {
    var toolbar = this;
    swapElements(toolbar.promptContainerElement, toolbar.buttonContainerElement);
    toolbar.promptContainerElement.appendChild(prompt.element);
    prompt.show(function() {
      toolbar.dismissPrompt();
      toolbar.updateForSelection(window.getSelection());
    });
    toolbar.activePrompt = prompt;
  };

  Toolbar.prototype.dismissPrompt = function(prompt) {
    var toolbar = this;
    var activePrompt = toolbar.activePrompt;
    if (activePrompt) {
      activePrompt.hide();
      swapElements(toolbar.buttonContainerElement, toolbar.promptContainerElement);
      toolbar.activePrompt = null;
    }
  };
  
  Toolbar.prototype.updateForSelection = function(selection) {
    var toolbar = this;
    if (selection.isCollapsed) {
      toolbar.hide();
    } else {
      toolbar.show();
      toolbar.positionToContent(selection.getRangeAt(0));
      updateButtonsForSelection(toolbar.buttons, selection);
    }
  };

  Toolbar.prototype.positionToContent = function(content) {
    var directions = ToolbarDirection;
    var positioningMethod;
    switch(this.direction) {
      case directions.RIGHT:
        positioningMethod = positionElementToRightOf;
        break;
      default:
        positioningMethod = positionElementCenteredAbove;
    }
    positioningMethod(this.element, content);
  };

  function updateButtonsForSelection(buttons, selection) {
    var selectedTags = tagsInSelection(selection),
        len = buttons.length,
        i, button;
        
    for (i = 0; i < len; i++) {
      button = buttons[i];
      if (selectedTags.indexOf(button.command.tag) > -1) {
        button.setActive();
      } else {
        button.setInactive();
      }
    }
  }

  return Toolbar;
}());


var TextFormatToolbar = (function() {

  function TextFormatToolbar(options) {
    var toolbar = this;
    Toolbar.call(this, options);
    toolbar.rootElement = options.rootElement;
    toolbar.rootElement.addEventListener('keyup', function() { toolbar.handleTextSelection(); });

    document.addEventListener('keyup', function(e) {
      if (e.keyCode === Keycodes.ESC) {
        toolbar.hide();
      }
    });

    document.addEventListener('mouseup', function() {
      setTimeout(function() { toolbar.handleTextSelection(); });
    });

    window.addEventListener('resize', function() {
      if(toolbar.isShowing) {
        var activePromptRange = toolbar.activePrompt && toolbar.activePrompt.range;
        toolbar.positionToContent(activePromptRange ? activePromptRange : window.getSelection().getRangeAt(0));
      }
    });
  }
  inherits(TextFormatToolbar, Toolbar);

  TextFormatToolbar.prototype.handleTextSelection = function() {
    var toolbar = this;
    var selection = window.getSelection();
    if (selection.isCollapsed || selection.toString().trim() === '' || !selectionIsInElement(selection, toolbar.rootElement)) {
      toolbar.hide();
    } else {
      toolbar.updateForSelection(selection);
    }
  };

  return TextFormatToolbar;
}());

var ToolbarButton = (function() {

  var buttonClassName = 'ck-toolbar-btn';

  function ToolbarButton(options) {
    var button = this;
    var toolbar = options.toolbar;
    var command = options.command;
    var prompt = command.prompt;
    var element = document.createElement('button');

    if(typeof command === 'string') {
      command = Command.index[command];
    }

    button.element = element;
    button.command = command;
    button.isActive = false;

    element.title = command.name;
    element.className = buttonClassName;
    element.innerHTML = command.button;
    element.addEventListener('click', function(e) {
      if (!button.isActive && prompt) {
        toolbar.displayPrompt(prompt);
      } else {
        command.exec();
      }
    });
  }

  ToolbarButton.prototype = {
    setActive: function() {
      var button = this;
      if (!button.isActive) {
        button.element.className = buttonClassName + ' active';
        button.isActive = true;
      }
    },
    setInactive: function() {
      var button = this;
      if (button.isActive) {
        button.element.className = buttonClassName;
        button.isActive = false;
      }
    }
  };

  return ToolbarButton;
}());

function Tooltip(options) {
  var tooltip = this;
  var rootElement = options.rootElement;
  var delay = options.delay || 200;
  var timeout;
  options.classNames = ['ck-tooltip'];
  View.call(tooltip, options);

  rootElement.addEventListener('mouseover', function(e) {
    var target = getEventTargetMatchingTag(options.showForTag, e.target, rootElement);
    if (target) {
      timeout = setTimeout(function() {
        tooltip.showLink(target.href, target);
      }, delay);
    }
  });
  
  rootElement.addEventListener('mouseout', function(e) {
    clearTimeout(timeout);
    var toElement = e.toElement || e.relatedTarget;
    if (toElement && toElement.className !== tooltip.element.className) {
      tooltip.hide();
    }
  });
}
inherits(Tooltip, View);

Tooltip.prototype.showMessage = function(message, element) {
  var tooltip = this;
  var tooltipElement = tooltip.element;
  tooltipElement.innerHTML = message;
  tooltip.show();
  positionElementCenteredBelow(tooltipElement, element);
};

Tooltip.prototype.showLink = function(link, element) {
  var message = '<a href="' + link + '" target="_blank">' + link + '</a>';
  this.showMessage(message, element);
};

var EmbedIntent = (function() {

  function EmbedIntent(options) {
    var embedIntent = this;
    var rootElement = options.rootElement;
    options.tagName = 'button';
    options.classNames = ['ck-embed-intent-btn'];
    View.call(embedIntent, options);

    embedIntent.element.title = 'Insert image or embed...';
    embedIntent.element.addEventListener('mouseup', function(e) {
      if (embedIntent.isActive) {
        embedIntent.deactivate();
      } else {
        embedIntent.activate();
      }
      e.stopPropagation();
    });
    embedIntent.toolbar = new Toolbar({ commands: options.commands, direction: ToolbarDirection.RIGHT });
    embedIntent.isActive = false;

    function embedIntentHandler() {
      var blockElement = getSelectionBlockElement();
      var blockElementContent = blockElement && blockElement.innerHTML;
      if (blockElementContent === '' || blockElementContent === '<br>') {
        embedIntent.showAt(blockElement);
      } else {
        embedIntent.hide();
      }
    }

    rootElement.addEventListener('keyup', embedIntentHandler);

    document.addEventListener('mouseup', function(e) {
      setTimeout(function() {
        if (!nodeIsDescendantOfElement(e.target, embedIntent.toolbar.element)) {
          embedIntentHandler();
        }
      });
    });

    document.addEventListener('keyup', function(e) {
      if (e.keyCode === Keycodes.ESC) {
        embedIntent.hide();
      }
    });

    window.addEventListener('resize', function() {
      if(embedIntent.isShowing) {
        positionElementToLeftOf(embedIntent.element, embedIntent.atNode);
        if (embedIntent.toolbar.isShowing) {
          embedIntent.toolbar.positionToContent(embedIntent.element);
        }
      }
    });
  }
  inherits(EmbedIntent, View);

  EmbedIntent.prototype.hide = function() {
    if (EmbedIntent._super.prototype.hide.call(this)) {
      this.deactivate();
    }
  };

  EmbedIntent.prototype.showAt = function(node) {
    this.show();
    this.deactivate();
    this.atNode = node;
    positionElementToLeftOf(this.element, node);
  };

  EmbedIntent.prototype.activate = function() {
    if (!this.isActive) {
      this.addClass('activated');
      this.toolbar.show();
      this.toolbar.positionToContent(this.element);
      this.isActive = true;
    }
  };

  EmbedIntent.prototype.deactivate = function() {
    if (this.isActive) {
      this.removeClass('activated');
      this.toolbar.hide();
      this.isActive = false;
    }
  };

  return EmbedIntent;
}());

}(this, document));

/*!
 * @overview ContentKit-Compiler: Parses HTML to ContentKit's JSON schema and renders back to HTML.
 * @version  0.1.0
 * @author   Garth Poitras <garth22@gmail.com> (http://garthpoitras.com/)
 * @license  MIT
 * Last modified: Jul 22, 2014
 */

(function(exports, document, undefined) {

'use strict';

/**
 * @namespace ContentKit
 */
var ContentKit = exports.ContentKit || {};
exports.ContentKit = ContentKit;

/**
 * @class Type
 * @private
 * @constructor
 * Base class that contains info about an allowed node type (type id, tag, etc).
 * Only to be subclassed (BlockType, MarkupType)
 */
function Type(options, meta) {
  if (options) {
    this.id = options.id === undefined ? meta.autoId++ : options.id;
    meta.idLookup[this.id] = this;
    this.name = options.name || options.tag;
    if (options.tag) {
      this.tag = options.tag;
      this.selfClosing = /^(br|img|hr|meta|link|embed)$/i.test(this.tag);
      meta.tagLookup[this.tag] = this;
    }
  }
}

/**
 * Type static meta properties
 */
function TypeMeta() {
  this.autoId    = 1;  // Auto-increment id counter
  this.idLookup  = {}; // Hash cache for finding by id
  this.tagLookup = {}; // Hash cache for finding by tag
}

/**
 * Returns type info for a given Node
 */
Type.findByNode = function(node) {
  return this.meta.tagLookup[node.tagName.toLowerCase()];
};

/**
 * Returns type info for a given id
 */
Type.findById = function(id) {
  return this.meta.idLookup[id];
};

/**
 * @class BlockType
 * @private
 * @constructor
 * @extends Type
 */
function BlockType(options) {
  Type.call(this, options, BlockType.meta);
}
BlockType.meta = new TypeMeta();
inherit(BlockType, Type);

/**
 * Default supported block node type dictionary
 */
var DefaultBlockTypes = {
  TEXT         : new BlockType({ tag: 'p', name: 'text' }),
  HEADING      : new BlockType({ tag: 'h2', name: 'heading' }),
  SUBHEADING   : new BlockType({ tag: 'h3', name: 'subheading' }),
  IMAGE        : new BlockType({ tag: 'img', name: 'image' }),
  QUOTE        : new BlockType({ tag: 'blockquote', name: 'quote' }),
  LIST         : new BlockType({ tag: 'ul', name: 'list' }),
  ORDERED_LIST : new BlockType({ tag: 'ol', name: 'ordered list' }),
  EMBED        : new BlockType({ name: 'embed' }),
  GROUP        : new BlockType({ name: 'group' })
};

/**
 * @class MarkupType
 * @private
 * @constructor
 * @extends Type
 */
function MarkupType(options) {
  Type.call(this, options, MarkupType.meta);
}
MarkupType.meta = new TypeMeta();
inherit(MarkupType, Type);

/**
 * Default supported markup type dictionary
 */
var DefaultMarkupTypes = {
  BOLD        : new MarkupType({ tag: 'b', name: 'bold' }),
  ITALIC      : new MarkupType({ tag: 'i', name: 'italic' }),
  UNDERLINE   : new MarkupType({ tag: 'u', name: 'underline' }),
  LINK        : new MarkupType({ tag: 'a', name: 'link' }),
  BREAK       : new MarkupType({ tag: 'br', name: 'break' }),
  LIST_ITEM   : new MarkupType({ tag: 'li', name: 'list item' }),
  SUBSCRIPT   : new MarkupType({ tag: 'sub', name: 'subscript' }),
  SUPERSCRIPT : new MarkupType({ tag: 'sup', name: 'superscript' })
};

/**
 * Converts an array-like object (i.e. NodeList) to Array
 */
function toArray(obj) {
  var array = [],
      i = obj.length >>> 0; // cast to Uint32
  while (i--) {
    array[i] = obj[i];
  }
  return array;
}

/**
 * Computes the sum of values in an array
 */
function sumArray(array) {
  var sum = 0, i, num;
  for (i in array) { // 'for in' best for sparse arrays
    sum += array[i];
  }
  return sum;
}

/**
 * A document instance separate from the page's document. (if browser supports it)
 * Prevents images, scripts, and styles from executing while parsing nodes.
 */
var doc = (function() {
  var implementation = document.implementation,
      createHTMLDocument = implementation.createHTMLDocument;
  if (createHTMLDocument) {
    return createHTMLDocument.call(implementation, '');
  }
  return document;
})();

/**
 * A reusable DOM Node for parsing html content.
 */
var parserNode = doc.createElement('div');

/**
 * Returns plain-text of a `Node`
 */
function textOfNode(node) {
  var text = node.textContent || node.innerText;
  return text ? sanitizeWhitespace(text) : '';
}

/**
 * Replaces a `Node` with it with its children
 */
function unwrapNode(node) {
  var children = toArray(node.childNodes),
      len = children.length,
      parent = node.parentNode, i;
  for (i = 0; i < len; i++) {
    parent.insertBefore(children[i], node);
  }
}

/**
 * Extracts attributes of a `Node` to a hash of key/value pairs
 */
function attributesForNode(node /*,blacklist*/) {
  var attrs = node.attributes,
      len = attrs && attrs.length,
      i, attr, name, hash;
  for (i = 0; i < len; i++) {
    attr = attrs[i];
    name = attr.name;
    if (attr.specified) {
      //if (blacklist && name in blacklist)) { continue; }
      hash = hash || {};
      hash[name] = attr.value;
    }
  }
  return hash;
}

/**
 * Merges set of properties on a object
 * Useful for constructor defaults/options
 */
function merge(object, defaults, updates) {
  updates = updates || {};
  for(var o in defaults) {
    if (defaults.hasOwnProperty(o)) {
      object[o] = updates[o] || defaults[o];
    }
  }
}

/**
 * Prototype inheritance helper
 */
function inherit(Sub, Super) {
  for (var key in Super) {
    if (Super.hasOwnProperty(key)) {
      Sub[key] = Super[key];
    }
  }
  Sub.prototype = new Super();
  Sub.constructor = Sub;
}

var RegExpTrim     = /^\s+|\s+$/g,
    RegExpTrimLeft = /^\s+/,
    RegExpWSChars  = /(\r\n|\n|\r|\t|\u00A0)/gm,
    RegExpMultiWS  = /\s+/g;

/**
 * String.prototype.trim polyfill
 * Removes whitespace at beginning and end of string
 */
function trim(string) {
  return string ? string.replace(RegExpTrim, '') : '';
}

/**
 * String.prototype.trimLeft polyfill
 * Removes whitespace at beginning of string
 */
function trimLeft(string) {
  return string ? string.replace(RegExpTrimLeft, '') : '';
}

/**
 * Cleans line breaks, tabs, non-breaking spaces, then multiple occuring whitespaces.
 */
function sanitizeWhitespace(string) {
  return string.replace(RegExpWSChars, '').replace(RegExpMultiWS, ' ');
}

/**
 * Injects a string into another string at the index specified
 */
function injectIntoString(string, injection, index) {
  return string.substr(0, index) + injection + string.substr(index);
}

/**
 * @class Compiler
 * @constructor
 * @param options
 */
function Compiler(options) {
  var defaults = {
    parser        : new HTMLParser(),
    renderer      : new HTMLRenderer(),
    blockTypes    : DefaultBlockTypes,
    markupTypes   : DefaultMarkupTypes
  };
  merge(this, defaults, options);
}

/**
 * @method parse
 * @param input
 * @return Object
 */
Compiler.prototype.parse = function(input) {
  return this.parser.parse(input);
};

/**
 * @method render
 * @param data
 * @return Object
 */
Compiler.prototype.render = function(data) {
  return this.renderer.render(data);
};

ContentKit.Compiler = Compiler;

/**
 * @class HTMLParser
 * @constructor
 */
function HTMLParser(options) {
  var defaults = {
    includeTypeNames : false
  };
  merge(this, defaults, options);
}

/**
 * @method parse
 * @param html String of HTML content
 * @return Array Parsed JSON content array
 */
HTMLParser.prototype.parse = function(html) {
  parserNode.innerHTML = sanitizeWhitespace(html);

  var children = toArray(parserNode.childNodes),
      len = children.length,
      blocks = [],
      i, currentNode, block, text;

  for (i = 0; i < len; i++) {
    currentNode = children[i];
    // All top level nodes *should be* `Element` nodes and supported block types.
    // We'll handle some cases if it isn't so we don't lose any content when parsing.
    // Parser assumes sane input (such as from the ContentKit Editor) and is not intended to be a full html sanitizer.
    if (currentNode.nodeType === 1) {
      block = parseBlock(currentNode, this.includeTypeNames);
      if (block) {
        blocks.push(block);
      } else {
        handleNonBlockElementAtRoot(currentNode, blocks);
      }
    } else if (currentNode.nodeType === 3) {
      text = currentNode.nodeValue;
      if (trim(text)) {
        block = getLastBlockOrCreate(blocks);
        block.value += text;
      }
    }
  }

  return blocks;
};

ContentKit.HTMLParser = HTMLParser;


/**
 * Parses a single block type node into json
 */
function parseBlock(node, includeTypeNames) {
  var meta = BlockType.findByNode(node), parsed, attributes;
  if (meta) {
    parsed = { type : meta.id };
    if (includeTypeNames && meta.name) {
      parsed.type_name = meta.name;
    }
    parsed.value = trim(textOfNode(node));
    attributes = attributesForNode(node);
    if (attributes) {
      parsed.attributes = attributes;
    }
    parsed.markup = parseBlockMarkup(node, includeTypeNames);
    return parsed;
  }
}

/**
 * Parses all of the markup in a block type node
 */
function parseBlockMarkup(node, includeTypeNames) {
  var processedText = '',
      markups = [],
      index = 0,
      currentNode, markup;

  while (node.hasChildNodes()) {
    currentNode = node.firstChild;
    if (currentNode.nodeType === 1) {
      markup = parseElementMarkup(currentNode, processedText.length, includeTypeNames);
      if (markup) {
        markups.push(markup);
      }
      // unwrap the element so we can process any children
      if (currentNode.hasChildNodes()) {
        unwrapNode(currentNode);
      }
    } else if (currentNode.nodeType === 3) {
      var text = sanitizeWhitespace(currentNode.nodeValue);
      if (index === 0) { text = trimLeft(text); }
      if (text) { processedText += text; }
    }

    // node has been processed, remove it
    currentNode.parentNode.removeChild(currentNode);
    index++;
  }

  return sortMarkups(markups);
}

/**
 * Parses markup of a single html element node
 */
function parseElementMarkup(node, startIndex, includeTypeNames) {
  var meta = MarkupType.findByNode(node),
      selfClosing, endIndex, markup, attributes;

  if (meta) {
    selfClosing = meta.selfClosing;
    if (!selfClosing && !node.hasChildNodes()) { return; } // check for empty nodes

    endIndex = startIndex + (selfClosing ? 0 : textOfNode(node).length);
    if (endIndex > startIndex || (selfClosing && endIndex === startIndex)) { // check for empty nodes
      markup = { type : meta.id };
      if (includeTypeNames && meta.name) {
        markup.type_name = meta.name;
      }
      markup.start = startIndex;
      markup.end = endIndex;
      attributes = attributesForNode(node);
      if (attributes) {
        markup.attributes = attributes;
      }
      return markup;
    }
  }
}

/**
 * Ensures markups at the same index are always in a specific order.
 * For example, so all bold links are consistently marked up 
 * as <a><b>text</b></a> instead of <b><a>text</a></b>
 */
function sortMarkups(markups) {
  var sorted = markups.sort(function(a, b) {
    if (a.start === b.start && a.end === b.end) {
      return b.type - a.type;
    }
    return 0;
  });
  return sorted;
}

/**
 * Helper to retain stray elements at the root of the html that aren't blocks
 */
function handleNonBlockElementAtRoot(elementNode, blocks) {
  var block = getLastBlockOrCreate(blocks),
      markup = parseElementMarkup(elementNode, block.value.length);
  if (markup) {
    block.markup = block.markup || [];
    block.markup.push(markup);
  }
  block.value += textOfNode(elementNode);
}

/**
 * Gets the last block in the set or creates and return a default block if none exist yet.
 */
function getLastBlockOrCreate(blocks) {
  var block;
  if (blocks.length) {
    block = blocks[blocks.length - 1];
  } else {
    block = parseBlock(doc.createElement('p'));
    blocks.push(block);
  }
  return block;
}

/**
 * @class HTMLRenderer
 * @constructor
 */
function HTMLRenderer(options) {
  var defaults = {
    typeRenderers : {}
  };
  merge(this, defaults, options);
}

/**
 * @method render
 * @param data
 * @return String html
 */
HTMLRenderer.prototype.render = function(data) {
  var html = '',
      len = data && data.length,
      i, block, typeRenderer, blockHtml;

  for (i = 0; i < len; i++) {
    block = data[i];
    typeRenderer = this.typeRenderers[block.type] || renderBlock;
    blockHtml = typeRenderer(block);
    if (blockHtml) { html += blockHtml; }
  }
  return html;
};

/**
 * @method willRenderType
 * @param type type id
 * @param renderer the rendering function that returns a string of html
 * Registers custom rendering for a type
 */
HTMLRenderer.prototype.willRenderType = function(type, renderer) {
  this.typeRenderers[type] = renderer;
};

ContentKit.HTMLRenderer = HTMLRenderer;


/**
 * Builds an opening html tag. i.e. '<a href="http://link.com/" rel="author">'
 */
function createOpeningTag(tagName, attributes, selfClosing /*,blacklist*/) {
  var tag = '<' + tagName;
  for (var attr in attributes) {
    if (attributes.hasOwnProperty(attr)) {
      //if (blacklist && attr in blacklist) { continue; }
      tag += ' ' + attr + '="' + attributes[attr] + '"';
    }
  }
  if (selfClosing) { tag += '/'; }
  tag += '>';
  return tag;
}

/**
 * Builds a closing html tag. i.e. '</p>'
 */
function createCloseTag(tagName) {
  return '</' + tagName + '>';
}

/**
 * Renders a block's json into a HTML string.
 */
function renderBlock(block) {
  var blockMeta = BlockType.findById(block.type),
      html = '', tagName, selfClosing;

  if (blockMeta) {
    tagName = blockMeta.tag;
    selfClosing = blockMeta.selfClosing;
    html += createOpeningTag(tagName, block.attributes, selfClosing);
    if (!selfClosing) {
      html += renderMarkup(block.value, block.markup);
      html += createCloseTag(tagName);
    }
  }
  return html;
}

/**
 * Renders markup json into a HTML string.
 */
function renderMarkup(text, markups) {
  var parsedTagsIndexes = [],
      len = markups && markups.length, i;

  for (i = 0; i < len; i++) {
    var markup = markups[i],
        markupMeta = MarkupType.findById(markup.type),
        tagName = markupMeta.tag,
        selfClosing = markupMeta.selfClosing,
        start = markup.start,
        end = markup.end,
        openTag = createOpeningTag(tagName, markup.attributes, selfClosing),
        parsedTagLengthAtIndex = parsedTagsIndexes[start] || 0,
        parsedTagLengthBeforeIndex = sumArray(parsedTagsIndexes.slice(0, start + 1));

    text = injectIntoString(text, openTag, start + parsedTagLengthBeforeIndex);
    parsedTagsIndexes[start] = parsedTagLengthAtIndex + openTag.length;

    if (!selfClosing) {
      var closeTag = createCloseTag(tagName);
      parsedTagLengthAtIndex = parsedTagsIndexes[end] || 0;
      parsedTagLengthBeforeIndex = sumArray(parsedTagsIndexes.slice(0, end));
      text = injectIntoString(text, closeTag, end + parsedTagLengthBeforeIndex);
      parsedTagsIndexes[end]  = parsedTagLengthAtIndex + closeTag.length;
    }
  }

  return text;
}

}(this, document));
