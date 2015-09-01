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
    const editor = this.editor;
    const activeSections = editor.activeSections;

    activeSections.forEach(s => {
      editor.resetSectionMarkers(s);
      editor.setSectionTagName(s, this.tag);
    });

    editor.rerender();
    editor.selectSections(activeSections);
    this.editor.didUpdate();
  }

  unexec() {
    const editor = this.editor;
    const activeSections = editor.activeSections;

    activeSections.forEach(s => {
      editor.resetSectionTagName(s);
    });

    editor.rerender();
    editor.selectSections(activeSections);
    this.editor.didUpdate();
  }
}

export default FormatBlockCommand;
