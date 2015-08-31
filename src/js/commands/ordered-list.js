import ListCommand from './list';

export default class UnorderedListCommand extends ListCommand {
  constructor(editor) {
    super(editor, {
      name: 'Ordered List',
      tag: 'ol',
      button: '<i>ol</i>'
    });
  }
}
