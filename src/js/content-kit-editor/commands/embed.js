import Command from './base';
import Prompt from '../views/prompt';
import Message from '../views/message';
import EmbedModel from '../../content-kit-compiler/models/embed';
import { inherit } from '../../content-kit-utils/object-utils';
import { xhrGet } from '../utils/http-utils';
import { RegEx } from '../constants';

function EmbedCommand(options) {
  Command.call(this, {
    name: 'embed',
    button: '<i class="ck-icon-embed"></i>',
    prompt: new Prompt({
      command: this,
      placeholder: 'Paste a YouTube or Twitter url...'
    })
  });
}
inherit(EmbedCommand, Command);

EmbedCommand.prototype.exec = function(url) {
  var command = this;
  var editorContext = command.editorContext;
  var index = editorContext.getCurrentBlockIndex();
  var oEmbedEndpoint = 'http://noembed.com/embed?url=';
  
  command.embedIntent.showLoading();
  if (!RegEx.HTTP_PROTOCOL.test(url)) {
    url = 'http://' + url;
  }

  xhrGet(oEmbedEndpoint + url, function(responseText, error) {
    command.embedIntent.hideLoading();
    if (error) {
      new Message().show('Embed error: status code ' + error.currentTarget.status);
    } else {
      var json = JSON.parse(responseText);
      if (json.error) {
        new Message().show('Embed error: ' + json.error);
      } else {
        var embedModel = new EmbedModel(json);
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

export default EmbedCommand;
