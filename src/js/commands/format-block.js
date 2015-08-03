import TextFormatCommand from './text-format';

class FormatBlockCommand extends TextFormatCommand {
  constructor(options={}) {
    super(options);
  }

  exec() {
    const editor = this.editor;
    const activeSections = editor.activeSections;

    activeSections.forEach(s => {
      editor.resetSectionMarkers(s);
      editor.setSectionTagName(s, this.tag);
    });

    editor.rerender();
    editor.trigger('update'); // FIXME -- should be handled by editor

    editor.selectSections(activeSections);
  }

  unexec() {
    const editor = this.editor;
    const activeSections = editor.activeSections;

    activeSections.forEach(s => {
      editor.resetSectionTagName(s);
    });

    editor.rerender();
    editor.trigger('update'); // FIXME -- should be handled by editor

    editor.selectSections(activeSections);
  }
}

export default FormatBlockCommand;
