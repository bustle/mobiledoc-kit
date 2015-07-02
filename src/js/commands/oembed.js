import Command from './base';
import Prompt from '../views/prompt';
import Message from '../views/message';
import {
  EmbedModel,
  doc
} from 'content-kit-compiler';
import { inherit } from 'content-kit-utils';
import { OEmbedder } from '../utils/http-utils';
import { win } from 'content-kit-editor/utils/compat';

function loadTwitterWidgets(element) {
  if (win.twttr) {
    win.twttr.widgets.load(element);
  } else {
    var script = doc.createElement('script');
    script.async = true;
    script.src = 'http://platform.twitter.com/widgets.js';
    doc.head.appendChild(script);
  }
}

function OEmbedCommand(options) {
  Command.call(this, {
    name: 'embed',
    button: '<i class="ck-icon-embed"></i>',
    prompt: new Prompt({
      command: this,
      placeholder: 'Paste a YouTube or Twitter url...'
    })
  });

  this.embedService = new OEmbedder({ url: options.serviceUrl });
}
inherit(OEmbedCommand, Command);

OEmbedCommand.prototype.exec = function(url) {
  var command = this;
  var editorContext = command.editorContext;
  var embedIntent = command.embedIntent;
  var index = editorContext.getCurrentBlockIndex();

  embedIntent.showLoading();
  this.embedService.fetch({
    url: url,
    complete: function(response, error) {
      embedIntent.hideLoading();
      if (error) {
        var errorMsg = error;
        if (error.target && error.target.status === 0) {
          errorMsg = 'Error: could not connect to embed service.';
        } else if (typeof error !== 'string') {
          errorMsg = 'Error: unexpected embed error.';
        }
        new Message().showError(errorMsg);
        embedIntent.show();
      } else if (response.error_message) {
        new Message().showError(response.error_message);
        embedIntent.show();
      } else {
        var embedModel = new EmbedModel(response);
        editorContext.insertBlock(embedModel, index);
        editorContext.renderBlockAt(index);
        if (embedModel.attributes.provider_name.toLowerCase() === 'twitter') {
          loadTwitterWidgets(editorContext.element);
        }
      }
    }
  });
};

export default OEmbedCommand;
