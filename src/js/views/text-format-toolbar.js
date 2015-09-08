import Toolbar from './toolbar';
import ReversibleToolbarButton from './reversible-toolbar-button';
import ReversiblePromptButton from './reversible-prompt-button';
import BoldCommand from '../commands/bold';
import ItalicCommand from '../commands/italic';
import LinkCommand from '../commands/link';
import QuoteCommand from '../commands/quote';
import HeadingCommand from '../commands/heading';
import SubheadingCommand from '../commands/subheading';

function makeButtons(editor) {
  const headingCommand = new HeadingCommand(editor);
  const headingButton = new ReversibleToolbarButton(headingCommand, editor);

  const subheadingCommand = new SubheadingCommand(editor);
  const subheadingButton = new ReversibleToolbarButton(subheadingCommand, editor);

  const quoteCommand = new QuoteCommand(editor);
  const quoteButton = new ReversibleToolbarButton(quoteCommand, editor);

  const boldCommand = new BoldCommand(editor);
  const boldButton = new ReversibleToolbarButton(boldCommand, editor);

  const italicCommand = new ItalicCommand(editor);
  const italicButton = new ReversibleToolbarButton(italicCommand, editor);

  const linkCommand = new LinkCommand(editor);
  const linkButton = new ReversiblePromptButton(linkCommand, editor);

  return [
    headingButton,
    subheadingButton,
    quoteButton,
    boldButton,
    italicButton,
    linkButton
  ];
}


export default class TextFormatToolbar extends Toolbar {
  constructor(options={}) {
    super(options);

    this.editor.on('selection', () => this.handleSelection());
    this.editor.on('selectionUpdated', () => this.handleSelection());
    this.editor.on('selectionEnded', () => this.handleSelectionEnded());
    this.editor.on('escapeKey', () => this.editor.cancelSelection());
    this.addEventListener(window, 'resize', () => this.handleResize());

    let buttons = makeButtons(this.editor);
    buttons.forEach(b => this.addButton(b));
  }

  handleResize() {
    if (this.isShowing) {
      this.positionToContent();
    }
  }

  handleSelection() {
    this.show();
    this.updateForSelection();
  }

  handleSelectionEnded() {
    this.hide();
  }
}
