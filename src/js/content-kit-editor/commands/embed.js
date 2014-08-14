import Command from './base';
import Prompt from '../views/prompt';
import Message from '../views/message';
import EmbedModel from '../../content-kit-compiler/models/embed';
import { inherit } from '../../content-kit-utils/object-utils';
import { RegEx } from '../constants';
import { OEmbedder } from '../../ext/content-kit-services';

function EmbedCommand(options) {
  Command.call(this, {
    name: 'embed',
    button: '<i class="ck-icon-embed"></i>',
    prompt: new Prompt({
      command: this,
      placeholder: 'Paste a YouTube or Twitter url...'
    })
  });

  this.embedService = new OEmbedder({ url: '/embed' });
}
inherit(EmbedCommand, Command);

EmbedCommand.prototype.exec = function(url) {
  var command = this;
  var editorContext = command.editorContext;
  var index = editorContext.getCurrentBlockIndex();
  
  command.embedIntent.showLoading();

  this.embedService.fetch({
    url: url,
    complete: function(response, error) {
      command.embedIntent.hideLoading();

      if (error) {
        new Message().show('Embed error');
      } else {
        var embedModel = new EmbedModel(response);
        editorContext.insertBlockAt(embedModel, index);
        editorContext.syncVisualAt(index);
      }
    }
  });
};

export default EmbedCommand;
