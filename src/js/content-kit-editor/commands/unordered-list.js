import ListCommand from './list';
import { Tags } from '../constants';
import { inherit } from '../../content-kit-utils/object-utils';

function UnorderedListCommand() {
  ListCommand.call(this, {
    name: 'list',
    tag: Tags.LIST,
    action: 'insertUnorderedList'
  });
}
inherit(UnorderedListCommand, ListCommand);

export default UnorderedListCommand;
