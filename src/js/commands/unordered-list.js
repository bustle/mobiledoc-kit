import ListCommand from './list';

export default class UnorderedListCommand extends ListCommand {
  constructor(editor) {
    super(editor, {
      name: 'Unordered List',
      tag: 'ul',
      button: '<i>ul</i>'
    });
  }
}
