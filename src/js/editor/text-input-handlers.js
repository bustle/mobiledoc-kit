import Range from 'mobiledoc-kit/utils/cursor/range';

function replaceWithListSection(editor, listTagName) {
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
    postEditor.setRange(new Range(listSection.headPosition()));
  });
}

function replaceWithHeaderSection(editor, headingTagName) {
  let { range: { head, head: { section } } } = editor;
  // Skip if cursor is not at end of section
  if (!head.isTail()) {
    return;
  }

  editor.run(postEditor => {
    let { builder } = postEditor;
    let newSection = builder.createMarkupSection(headingTagName);
    postEditor.replaceSection(section, newSection);
    postEditor.setRange(new Range(newSection.headPosition()));
  });
}

export const DEFAULT_TEXT_INPUT_HANDLERS = [
  {
    // "* " -> ul
    match: /^\* $/,
    run(editor) {
      replaceWithListSection(editor, 'ul');
    }
  },
  {
    // "1" -> ol, "1." -> ol
    match: /^1\.? $/,
    run(editor) {
      replaceWithListSection(editor, 'ol');
    }
  },
  {
    // "# " -> h1, "## " -> h2, "### " -> h3
    match: /^(#{1,3}) $/,
    run(editor, matches) {
      let capture = matches[1];
      let headingTag = 'h' + capture.length;
      replaceWithHeaderSection(editor, headingTag);
    }
  }
];
