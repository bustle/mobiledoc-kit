import ListCommand from './list';
import { inherit } from 'node_modules/content-kit-utils/src/object-utils';
import Type from 'node_modules/content-kit-compiler/src/types/type';

function OrderedListCommand() {
  ListCommand.call(this, {
    name: 'ordered list',
    tag: Type.ORDERED_LIST.tag,
    action: 'insertOrderedList'
  });
}
inherit(OrderedListCommand, ListCommand);

OrderedListCommand.prototype.autoFormatRegex = /^1\.\s/;

export default OrderedListCommand;
