import Command from './base';
import { inherit } from 'content-kit-utils';
import {
  BlockModel,
  Type
} from 'content-kit-compiler';

function injectCardBlock(cardName, cardPayload, editor, index) {
  // FIXME: Do we change the block model internal representation here?
  var cardBlock = BlockModel.createWithType(Type.CARD, {
    attributes: {
      name: cardName,
      payload: cardPayload
    }
  });
  editor.replaceBlock(cardBlock, index);
}

function CardCommand() {
  Command.call(this, {
    name: 'card',
    button: '<i>CA</i>'
  });
}
inherit(CardCommand, Command);

CardCommand.prototype = {
  exec: function() {
    CardCommand._super.prototype.exec.call(this);
    var editor = this.editorContext;
    var currentEditingIndex = editor.getCurrentBlockIndex();

    var cardName = 'pick-color';
    var cardPayload = { options: ['red', 'blue'] };
    injectCardBlock(cardName, cardPayload, editor, currentEditingIndex);
    editor.renderBlockAt(currentEditingIndex, true);
  }
};

export default CardCommand;
