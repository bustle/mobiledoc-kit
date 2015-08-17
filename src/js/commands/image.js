import Command from './base';

export default class ImageCommand extends Command {
  constructor() {
    super({
      name: 'image',
      button: '<i class="ck-icon-image"></i>'
    });
  }

  exec() {
    let {headMarker} = this.editor.cursor.offsets;
    let beforeSection = headMarker.section;
    let afterSection = beforeSection.next;
    let section = this.editor.builder.createCardSection('image');

    this.editor.run((postEditor) => {
      if (beforeSection.isBlank) {
        postEditor.removeSection(beforeSection);
      }
      postEditor.insertSectionBefore(section, afterSection);
    });
  }
}
