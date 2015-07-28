import Command from './base';
import { inherit } from 'content-kit-utils';

function injectCardBlock(/* cardName, cardPayload, editor, index */) {
  throw new Error('Unimplemented: BlockModel and Type.CARD are no longer things');
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
  }
};

export default CardCommand;
