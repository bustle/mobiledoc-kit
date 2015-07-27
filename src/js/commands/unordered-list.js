import ListCommand from './list';
import { inherit } from 'content-kit-utils';

function UnorderedListCommand() {
  ListCommand.call(this, {
    name: 'list',
    tag: 'ul',
    action: 'insertUnorderedList'
  });
}
inherit(UnorderedListCommand, ListCommand);

UnorderedListCommand.prototype.autoFormatRegex =  /^[-*]\s/;

export default UnorderedListCommand;
