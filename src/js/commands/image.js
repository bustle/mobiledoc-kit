import Command from './base';

export default class ImageCommand extends Command {
  constructor() {
    super({
      name: 'image',
      button: '<i class="ck-icon-image"></i>'
    });
  }

  exec() {
    let {post, builder} = this.editor;
    let sections = this.editor.activeSections;
    let lastSection = sections[sections.length - 1];
    let section = builder.createCardSection('image');
    post.sections.insertAfter(section, lastSection);
    sections.forEach(section => section.renderNode.scheduleForRemoval());

    this.editor.rerender();
    this.editor.didUpdate();
  }
}
