/**
 * Convert section at the editor's cursor position into a list.
 * Does nothing if the cursor position is not at the start of the section,
 * or if the section is already a list item.
 *
 * @param {Editor} editor
 * @param {String} listTagName ("ul" or "ol")
 * @public
 */
export function replaceWithListSection(editor, listTagName) {
  let { range: { head, head: { section } } } = editor;
  // Skip if cursor is not at end of section
  if (!head.isTail()) {
    return;
  }

  if (section.isListItem) {
    return;
  }

  editor.run(postEditor => {
    let { builder } = postEditor;
    let item = builder.createListItem();
    let listSection = builder.createListSection(listTagName, [item]);

    postEditor.replaceSection(section, listSection);
    postEditor.setRange(listSection.headPosition());
  });
}

/**
 * Convert section at the editor's cursor position into a header section.
 * Does nothing if the cursor position is not at the start of the section.
 *
 * @param {Editor} editor
 * @param {String} headingTagName ('h1', 'h2', 'h3', 'h4', 'h5', 'h6')
 * @public
 */
export function replaceWithHeaderSection(editor, headingTagName) {
  let { range: { head, head: { section } } } = editor;
  // Skip if cursor is not at end of section
  if (!head.isTail()) {
    return;
  }

  editor.run(postEditor => {
    let { builder } = postEditor;
    let newSection = builder.createMarkupSection(headingTagName);
    postEditor.replaceSection(section, newSection);
    postEditor.setRange(newSection.headPosition());
  });
}

export const DEFAULT_TEXT_INPUT_HANDLERS = [
  {
    name: 'ul',
    // "* " -> ul
    match: /^\* $/,
    run(editor) {
      replaceWithListSection(editor, 'ul');
    }
  },
  {
    name: 'ol',
    // "1" -> ol, "1." -> ol
    match: /^1\.? $/,
    run(editor) {
      replaceWithListSection(editor, 'ol');
    }
  },
  {
    name: 'heading',
    /*
     * "# " -> h1
     * "## " -> h2
     * "### " -> h3
     * "#### " -> h4
     * "##### " -> h5
     * "###### " -> h6
     */
    match: /^(#{1,6}) $/,
    run(editor, matches) {
      let capture = matches[1];
      let headingTag = 'h' + capture.length;
      replaceWithHeaderSection(editor, headingTag);
    }
  }
];
