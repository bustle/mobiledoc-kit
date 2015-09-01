import TextFormatCommand from './text-format';

export default class ListCommand extends TextFormatCommand {
  constructor(editor, options) {
    super(editor, options);
  }

  isActive() {
    return false;
  }

  exec() {
    const { editor } = this,
          { cursor } = editor;

    const { head: {section:currentSection} } = cursor.offsets;

    const listItem = editor.run(postEditor => {
      const { builder } = postEditor;
      const tagName = this.tag;
      const listSection = builder.createListSection(tagName);
      const listItem = builder.createListItem();
      listSection.items.append(listItem);

      postEditor.replaceSection(currentSection, listSection);
      return listItem;
    });

    editor.cursor.moveToSection(listItem);
  }

  unexec() {
    throw new Error('Cannot unexec a ListCommand');
  }
}
