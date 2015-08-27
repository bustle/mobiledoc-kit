import Command from './base';

export default class ImageCommand extends Command {
  constructor() {
    super({
      name: 'image',
      button: '<i class="ck-icon-image"></i>'
    });
  }

  exec() {
    let {headSection: beforeSection} = this.editor.cursor.offsets;
    let afterSection = beforeSection.next;
    let section = this.editor.builder.createCardSection('image');
    const collection = beforeSection.parent.sections;

    this.editor.run((postEditor) => {
      if (beforeSection.isBlank) {
        postEditor.removeSection(beforeSection);
      }
      postEditor.insertSectionBefore(collection, section, afterSection);
    });
  }
}
