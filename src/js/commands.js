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
  command.editorContext = null;
  if (prompt) { command.prompt = prompt; }
}
Command.prototype.exec = function(){};

function TextFormatCommand(options) {
  Command.call(this, options);
  this.tag = options.tag.toUpperCase();
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

function ImageEmbedCommand(options) {
  EmbedCommand.call(this, {
    name: 'image',
    button: '<i class="ck-icon-image"></i>'
  });
}
inherits(ImageEmbedCommand, EmbedCommand);

ImageEmbedCommand.prototype = {
  exec: function() {
    ImageEmbedCommand._super.prototype.exec.call(this);
    var clickEvent = new MouseEvent('click', { bubbles: false });
    if (!this.fileBrowser) {
      var command = this;
      var fileBrowser = this.fileBrowser = document.createElement('input');
      fileBrowser.type = 'file';
      fileBrowser.accept = 'image/*';
      fileBrowser.className = 'ck-file-input';
      fileBrowser.addEventListener('change', function(e) {
        command.handleFile(e);
      });
      document.body.appendChild(fileBrowser);
    }
    this.fileBrowser.dispatchEvent(clickEvent);
  },
  handleFile: function(e) {
    var command = this;
    var target = e.target;
    var file = target && target.files[0];
    var reader = new FileReader();
    reader.onload = function(event) {
      var base64File = event.target.result;
      var blockElement = getSelectionBlockElement();
      var editorNode = blockElement.parentNode;
      var image = document.createElement('img');
      image.src = base64File;

      // image needs to be placed outside of the current empty paragraph
      editorNode.insertBefore(image, blockElement);
      editorNode.removeChild(blockElement);

      command.embedIntent.hide();
    };
    reader.readAsDataURL(file);
    target.value = null; // reset
  }
};

function OEmbedCommand(options) {
  EmbedCommand.call(this, {
    name: 'oEmbed',
    button: '<i class="ck-icon-embed"></i>',
    prompt: new Prompt({
      command: this,
      placeholder: 'Paste a YouTube, Twitter, or any url...'
    })
  });
}
inherits(OEmbedCommand, EmbedCommand);

OEmbedCommand.prototype.exec = function(url) {
  var command = this;
  var editorContext = command.editorContext;
  var index = editorContext.getCurrentBlockIndex();
  command.embedIntent.hide();
  HTTP.get('http://noembed.com/embed?url=' + url, function(responseText) {
    var json = JSON.parse(responseText);
    if (json.error) {
      new Message().show('Error: unrecognized embed url');
    } else {
      var embedModel = new ContentKit.EmbedModel(json);
      if (!embedModel.attributes.provider_id) {
        new Message().show('Error: "' + embedModel.attributes.provider_name + '" embeds are not supported at this time');
      } else {
        editorContext.insertBlockAt(embedModel, index);
        editorContext.syncVisualAt(index);
      }
    }
  });
};

EmbedCommand.all = [
  new ImageEmbedCommand(),
  new OEmbedCommand()
];

EmbedCommand.index = createCommandIndex(EmbedCommand.all);
