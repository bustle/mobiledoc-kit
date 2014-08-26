import ListCommand from './list';
import { inherit } from '../../content-kit-utils/object-utils';
import Type from '../../content-kit-compiler/types/type';

function OrderedListCommand() {
  ListCommand.call(this, {
    name: 'ordered list',
    tag: Type.ORDERED_LIST.tag,
    action: 'insertOrderedList'
  });
}
inherit(OrderedListCommand, ListCommand);

export default OrderedListCommand;
