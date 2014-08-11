// TODO: eliminate this file
import BoldCommand from './bold';
import ItalicCommand from './italic';
import LinkCommand from './link';
import QuoteCommand from './quote';
import HeadingCommand from './heading';
import SubheadingCommand from './subheading';
import ImageCommand from './image';
import EmbedCommand from './embed';

function createCommandIndex(commands) {
  var index = {};
  var len = commands.length, i, command;
  for(i = 0; i < len; i++) {
    command = commands[i];
    index[command.name] = command;
  }
  return index;
}

var TextFormatCommands = {};
TextFormatCommands.all = [
  new BoldCommand(),
  new ItalicCommand(),
  new LinkCommand(),
  new QuoteCommand(),
  new HeadingCommand(),
  new SubheadingCommand()
];

TextFormatCommands.index = createCommandIndex(TextFormatCommands.all);

var EmbedCommands = {};
EmbedCommands.all = [
  new ImageCommand(),
  new EmbedCommand()
];
EmbedCommands.index = createCommandIndex(EmbedCommands.all);

export { TextFormatCommands, EmbedCommands };
