import Command from './base';
import { generateBuilder } from '../utils/post-builder';

export default class ImageCommand extends Command {
  constructor() {
    super({
      name: 'image',
      button: '<i class="ck-icon-image"></i>'
    });
    this.builder = generateBuilder();
  }

  exec() {
    let {post} = this.editor;
    let sections = this.editor.activeSections;
    let lastSection = sections[sections.length - 1];
    let section = this.builder.generateCardSection('image');
    post.insertSectionAfter(section, lastSection);
    sections.forEach(section => section.renderNode.scheduleForRemoval());

    this.editor.rerender();
    this.editor.trigger('update');
  }
}
