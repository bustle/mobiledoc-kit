function Command(options) {
  if(options) {
    var command = this;
    var name = options.name;
    var prompt = options.prompt;
    command.name = name;
    command.tag = options.tag;
    command.action = options.action || name;
    command.removeAction = options.removeAction || options.action;
    command.button = options.button || name;
    if (prompt) { command.prompt = prompt; }
  }
}
Command.prototype.exec = function(value) {
  document.execCommand(this.action, false, value || null);
};
Command.prototype.unexec = function(value) {
  document.execCommand(this.removeAction, false, value || null);
};

function BoldCommand() {
  Command.call(this, {
    name: 'bold',
    tag: Tags.BOLD,
    button: '<i class="ck-icon-bold"></i>'
  });
}
inherits(BoldCommand, Command);
BoldCommand.prototype.exec = function() {
  // Don't allow executing bold command on heading tags
  if (!Regex.HEADING_TAG.test(getCurrentSelectionRootTag())) {
    BoldCommand._super.prototype.exec.call(this);
  }
};

function ItalicCommand() {
  Command.call(this, {
    name: 'italic',
    tag: Tags.ITALIC,
    button: '<i class="ck-icon-italic"></i>'
  });
}
inherits(ItalicCommand, Command);

function LinkCommand() {
  Command.call(this, {
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
inherits(LinkCommand, Command);
LinkCommand.prototype.exec = function(url) {
  if(this.tag === getCurrentSelectionTag()) {
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
  Command.call(this, options);
}
inherits(FormatBlockCommand, Command);
FormatBlockCommand.prototype.exec = function() {
  var tag = this.tag;
  // Brackets neccessary for certain browsers
  var value =  '<' + tag + '>';
  // Allow block commands to be toggled back to a paragraph
  if(tag === getCurrentSelectionRootTag()) {
    value = Tags.PARAGRAPH;
  } else {
    // Flattens the selection before applying the block format.
    // Otherwise, undesirable nested blocks can occur.
    var root = getCurrentSelectionRootNode();
    var flatNode = document.createTextNode(root.textContent);
    root.parentNode.insertBefore(flatNode, root);
    root.parentNode.removeChild(root);
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
  Command.call(this, options);
}
inherits(ListCommand, Command);
ListCommand.prototype.exec = function() {
  ListCommand._super.prototype.exec.call(this);
  
  // After creation, lists need to be unwrapped from the default formatter P tag
  var listNode = getCurrentSelectionRootNode();
  var wrapperNode = listNode.parentNode;
  if (wrapperNode.firstChild === listNode) {
    var editorNode = wrapperNode.parentNode;
    editorNode.insertBefore(listNode, wrapperNode);
    editorNode.removeChild(wrapperNode);
    selectNode(listNode);
  }
};

function UnorderedListCommand() {
  ListCommand.call(this, {
    name: 'list',
    tag: Tags.LIST,
    action: 'insertUnorderedList',
    button: '<i class="ck-icon-list"></i>'
  });
}
inherits(UnorderedListCommand, ListCommand);

function OrderedListCommand() {
  ListCommand.call(this, {
    name: 'ordered list',
    tag: Tags.ORDERED_LIST,
    action: 'insertOrderedList',
    button: '<i class="ck-icon-list-ordered"></i>'
  });
}
inherits(OrderedListCommand, ListCommand);

Command.all = [
  new BoldCommand(),
  new ItalicCommand(),
  new LinkCommand(),
  new QuoteCommand(),
  new HeadingCommand(),
  new SubheadingCommand()
];

Command.index = (function() {
  var index = {},
      commands = Command.all,
      len = commands.length, i, command;
  for(i = 0; i < len; i++) {
    command = commands[i];
    index[command.name] = command;
  }
  return index;
})();
