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
  if (window.XHRFileUploader) {
    this.uploader = new XHRFileUploader({ url: '/upload', maxFileSize: 5000000 });
  }
}
inherits(ImageEmbedCommand, EmbedCommand);

ImageEmbedCommand.prototype = {
  exec: function() {
    ImageEmbedCommand._super.prototype.exec.call(this);
    var clickEvent = new MouseEvent('click', { bubbles: false });
    if (!this.fileInput) {
      var command = this;
      var fileInput = this.fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.className = 'ck-file-input';
      fileInput.addEventListener('change', function(e) {
        command.handleFile(e);
      });
      document.body.appendChild(fileInput);
    }
    this.fileInput.dispatchEvent(clickEvent);
  },
  handleFile: function(e) {
    var fileInput = e.target;
    var editor = this.editorContext;
    var embedIntent = this.embedIntent;

    embedIntent.showLoading();
    this.uploader.upload({
      fileInput: fileInput,
      complete: function(response, error) {
        embedIntent.hideLoading();
        if (error || !response || !response.url) {
          return new Message().show(error.message || 'Error uploading image');
        }
        var imageModel = new ContentKit.ImageModel({ src: response.url });
        var index = editor.getCurrentBlockIndex();
        editor.insertBlockAt(imageModel, index);
        editor.syncVisualAt(index);
      }
    });
    fileInput.value = null; // reset file input
    // TODO: client-side render while uploading
  }
};

function OEmbedCommand(options) {
  EmbedCommand.call(this, {
    name: 'oEmbed',
    button: '<i class="ck-icon-embed"></i>',
    prompt: new Prompt({
      command: this,
      placeholder: 'Paste a YouTube or Twitter url...'
    })
  });
}
inherits(OEmbedCommand, EmbedCommand);

OEmbedCommand.prototype.exec = function(url) {
  var command = this;
  var editorContext = command.editorContext;
  var index = editorContext.getCurrentBlockIndex();
  var oEmbedEndpoint = 'http://noembed.com/embed?url=';
  
  command.embedIntent.showLoading();
  if (!Regex.HTTP_PROTOCOL.test(url)) {
    url = 'http://' + url;
  }

  HTTP.get(oEmbedEndpoint + url, function(responseText, error) {
    command.embedIntent.hideLoading();
    if (error) {
      new Message().show('Embed error: status code ' + error.currentTarget.status);
    } else {
      var json = JSON.parse(responseText);
      if (json.error) {
        new Message().show('Embed error: ' + json.error);
      } else {
        var embedModel = new ContentKit.EmbedModel(json);
        //if (!embedModel.attributes.provider_id) {
        //  new Message().show('Embed error: "' + embedModel.attributes.provider_name + '" embeds are not supported at this time');
        //} else {
          editorContext.insertBlockAt(embedModel, index);
          editorContext.syncVisualAt(index);
        //}
      }
    }
  });
};

EmbedCommand.all = [
  new ImageEmbedCommand(),
  new OEmbedCommand()
];

EmbedCommand.index = createCommandIndex(EmbedCommand.all);
