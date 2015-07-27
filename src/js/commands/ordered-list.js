import ListCommand from './list';
import { inherit } from 'content-kit-utils';

function OrderedListCommand() {
  ListCommand.call(this, {
    name: 'ordered list',
    tag: 'ol',
    action: 'insertOrderedList'
  });
}
inherit(OrderedListCommand, ListCommand);

OrderedListCommand.prototype.autoFormatRegex = /^1\.\s/;

export default OrderedListCommand;
