import ListCommand from './list';
import { inherit } from 'node_modules/content-kit-utils/src/object-utils';
import Type from 'node_modules/content-kit-compiler/src/types/type';

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
