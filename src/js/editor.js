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
      options = extend(defaults, options);
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
    extend(editor, options);

    if (element) {
      var className = element.className;
      var dataset = element.dataset;
      var textFormatToolbar = new Toolbar({ commands: editor.textFormatCommands });

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
      editor.textFormatToolbar = textFormatToolbar;

      var linkTooltips = new Tooltip({ rootElement: element, showForTag: Tags.LINK });

      if(editor.embedCommands) {
        var embedIntent = new EmbedIntent({
          commands: editor.embedCommands,
          rootElement: element
        });
      }

      bindTextSelectionEvents(editor);
      bindTypingEvents(editor);
      bindPasteEvents(editor);
      
      if(editor.autofocus) { element.focus(); }
    }
  }

  Editor.prototype = {
    parse: function() {
      var editor = this;
      if (!editor.parser) {
        if (!ContentKit.HTMLParser) {
          throw new Error('Include the ContentKit compiler for parsing');
        }
        editor.parser = new ContentKit.HTMLParser();
      }
      return editor.parser.parse(editor.element.innerHTML);
    }
  };

  function bindTextSelectionEvents(editor) {
    // Mouse text selection
    document.addEventListener('mouseup', function(e) {
      setTimeout(function(){ handleTextSelection(e, editor); });
    });

    // Keyboard text selection
    editor.element.addEventListener('keyup', function(e) {
      handleTextSelection(e, editor);
    });
  }

  function bindTypingEvents(editor) {
    var editorEl = editor.element;

    // Breaks out of blockquotes when pressing enter.
    editorEl.addEventListener('keyup', function(e) {
      if(!e.shiftKey && e.which === Keycodes.ENTER) {
        if(Tags.QUOTE === getCurrentSelectionRootTag()) {
          document.execCommand('formatBlock', false, editor.defaultFormatter);
          e.stopPropagation();
        }
      }
    });

    // Creates unordered list when block starts with '- ', or ordered if starts with '1. '
    editorEl.addEventListener('keyup', function(e) {
      var selectedText = window.getSelection().anchorNode.textContent,
          selection, selectionNode, command, replaceRegex;

      if (Tags.LIST_ITEM !== getCurrentSelectionTag()) {
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
      if (this.innerHTML.length && RootTags.indexOf(getCurrentSelectionRootTag()) === -1) {
        document.execCommand('formatBlock', false, editor.defaultFormatter);
      }
    });
  }

  function handleTextSelection(e, editor) {
    var selection = window.getSelection();
    if (selection.isCollapsed || selection.toString().trim() === '' || !selectionIsInElement(selection, editor.element)) {
      editor.textFormatToolbar.hide();
    } else {
      editor.textFormatToolbar.updateForSelection(selection);
    }
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
