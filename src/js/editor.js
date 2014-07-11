ContentKit.Editor = (function() {

  // Default `Editor` options
  var defaults = {
    defaultFormatter: Tags.PARAGRAPH,
    placeholder: 'Write here...',
    spellcheck: true,
    autofocus: true,
    commands: Command.all
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

      editor.element = element;
      editor.toolbar = new Toolbar({ commands: editor.commands });

      bindTextSelectionEvents(editor);
      bindTypingEvents(editor);
      bindPasteEvents(editor);
      bindLinkTooltips(editor);
      
      editor.enable();
      if(editor.autofocus) { element.focus(); }
    }
  }

  Editor.prototype = {
    enable: function() {
      var editor = this;
      var element = editor.element;
      if(element && !editor.enabled) {
        element.setAttribute('contentEditable', true);
        editor.enabled = true;
      }
    },
    disable: function() {
      var editor = this;
      var element = editor.element;
      if(element && editor.enabled) {
        element.removeAttribute('contentEditable');
        editor.enabled = false;
      }
    },
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
    if (!selection.isCollapsed && selectionIsInElement(editor.element, selection)) {
      editor.toolbar.updateForSelection(selection);
    } else {
      editor.toolbar.hide();
    }
  }

  function selectionIsInElement(element, selection) {
    var node = selection.focusNode,
        parentNode = node.parentNode;
    while(parentNode) {
      if (parentNode === element) {
        return true;
      }
      parentNode = parentNode.parentNode;
    }
    return false;
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

  function bindLinkTooltips(editor) {
    var linkTooltip = new Tooltip();
    var editorElement = editor.element;
    var tooltipTimeout = null;
    editorElement.addEventListener('mouseover', function(e) {
      if (!editor.toolbar.isShowing) {
        tooltipTimeout = setTimeout(function() {
          var linkTarget = getTargetNodeDescendentWithTag(Tags.LINK, e.target, this);
          if (linkTarget) {
            linkTooltip.showLink(linkTarget.href, linkTarget);
          }
        }, 200);
      }
    });
    editorElement.addEventListener('mouseout', function(e) {
      clearTimeout(tooltipTimeout);
      if (e.toElement && e.toElement.className !== 'ck-tooltip') {
        linkTooltip.hide();
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
