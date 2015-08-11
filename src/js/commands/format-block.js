import TextFormatCommand from './text-format';
import {
  any
} from '../utils/array-utils';

class FormatBlockCommand extends TextFormatCommand {
  constructor(editor, options={}) {
    super(options);
    this.editor = editor;
  }

  isActive() {
    const editor = this.editor;
    const activeSections = editor.activeSections;

    return any(activeSections, section => {
      return any(this.mappedTags, t => section.tagName === t);
    });
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
