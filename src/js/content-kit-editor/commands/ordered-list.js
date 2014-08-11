import ListCommand from './list';
import { Tags } from '../constants';
import { inherit } from '../../content-kit-utils/object-utils';

function OrderedListCommand() {
  ListCommand.call(this, {
    name: 'ordered list',
    tag: Tags.ORDERED_LIST,
    action: 'insertOrderedList'
  });
}
inherit(OrderedListCommand, ListCommand);

export default OrderedListCommand;
