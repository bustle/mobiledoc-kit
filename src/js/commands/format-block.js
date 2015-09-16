import TextFormatCommand from './text-format';
import { any } from '../utils/array-utils';

class FormatBlockCommand extends TextFormatCommand {
  constructor(editor, options={}) {
    super(editor, options);
  }

  isActive() {
    return any(this.editor.activeSections, s => s.tagName === this.tag);
  }

  exec() {
    const { editor } = this;
    editor.run(postEditor => {
      const activeSections = editor.activeSections;
      activeSections.forEach(s => postEditor.changeSectionTagName(s, this.tag));
      postEditor.scheduleAfterRender(() => {
        editor.selectSections(activeSections);
      });
    });
  }

  unexec() {
    const { editor } = this;
    editor.run(postEditor => {
      const activeSections = editor.activeSections;
      activeSections.forEach(s => postEditor.resetSectionTagName(s));
      postEditor.scheduleAfterRender(() => {
        editor.selectSections(activeSections);
      });
    });
  }
}

export default FormatBlockCommand;
