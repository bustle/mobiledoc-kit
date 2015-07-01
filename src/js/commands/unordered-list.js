import ListCommand from './list';
import { inherit } from 'content-kit-utils';
import { Type } from 'content-kit-compiler';

function UnorderedListCommand() {
  ListCommand.call(this, {
    name: 'list',
    tag: Type.LIST.tag,
    action: 'insertUnorderedList'
  });
}
inherit(UnorderedListCommand, ListCommand);

UnorderedListCommand.prototype.autoFormatRegex =  /^[-*]\s/;

export default UnorderedListCommand;
