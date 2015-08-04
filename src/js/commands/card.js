import Command from './base';

function injectCardBlock(/* cardName, cardPayload, editor, index */) {
  throw new Error('Unimplemented: BlockModel and Type.CARD are no longer things');
}

export default class CardCommand extends Command {
  constructor() {
    super({
      name: 'card',
      button: '<i>CA</i>'
    });
  }

  exec() {
    super.exec();
    const editor = this.editor;
    const currentEditingIndex = editor.getCurrentBlockIndex();

    const cardName = 'pick-color';
    const cardPayload = { options: ['red', 'blue'] };
    injectCardBlock(cardName, cardPayload, editor, currentEditingIndex);
  }
}
