let defaultShowPrompt = (message, defaultValue, callback) => callback(window.prompt(message, defaultValue));

export function toggleLink(editor, showPrompt=defaultShowPrompt) {
  if (editor.range.isCollapsed) {
    return;
  }

  let selectedText = editor.cursor.selectedText();
  let defaultUrl = '';
  if (selectedText.indexOf('http') !== -1) { defaultUrl = selectedText; }

  let {range} = editor;
  let hasLink = editor.detectMarkupInRange(range, 'a');

  if (hasLink) {
    editor.run(postEditor => postEditor.toggleMarkup('a'));
  } else {
    showPrompt('Enter a URL', defaultUrl, url => {
      if (!url) { return; }

      editor.run(postEditor => {
        let markup = postEditor.builder.createMarkup('a', {href: url});
        postEditor.toggleMarkup(markup);
      });
    });
  }
}
