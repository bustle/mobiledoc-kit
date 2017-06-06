/**
 * Convert section at the editor's cursor position into a list.
 * Does nothing if the cursor position is not at the start of the section,
 * or if the section is already a list item.
 *
 * @param {Editor} editor
 * @param {String} listTagName ("ul" or "ol")
 * @public
 */
'use strict';

exports.replaceWithListSection = replaceWithListSection;
exports.replaceWithHeaderSection = replaceWithHeaderSection;

function replaceWithListSection(editor, listTagName) {
  var _editor$range = editor.range;
  var head = _editor$range.head;
  var section = _editor$range.head.section;

  // Skip if cursor is not at end of section
  if (!head.isTail()) {
    return;
  }

  if (section.isListItem) {
    return;
  }

  editor.run(function (postEditor) {
    var builder = postEditor.builder;

    var item = builder.createListItem();
    var listSection = builder.createListSection(listTagName, [item]);

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

function replaceWithHeaderSection(editor, headingTagName) {
  var _editor$range2 = editor.range;
  var head = _editor$range2.head;
  var section = _editor$range2.head.section;

  // Skip if cursor is not at end of section
  if (!head.isTail()) {
    return;
  }

  editor.run(function (postEditor) {
    var builder = postEditor.builder;

    var newSection = builder.createMarkupSection(headingTagName);
    postEditor.replaceSection(section, newSection);
    postEditor.setRange(newSection.headPosition());
  });
}

var DEFAULT_TEXT_INPUT_HANDLERS = [{
  name: 'ul',
  // "* " -> ul
  match: /^\* $/,
  run: function run(editor) {
    replaceWithListSection(editor, 'ul');
  }
}, {
  name: 'ol',
  // "1" -> ol, "1." -> ol
  match: /^1\.? $/,
  run: function run(editor) {
    replaceWithListSection(editor, 'ol');
  }
}, {
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
  run: function run(editor, matches) {
    var capture = matches[1];
    var headingTag = 'h' + capture.length;
    replaceWithHeaderSection(editor, headingTag);
  }
}];
exports.DEFAULT_TEXT_INPUT_HANDLERS = DEFAULT_TEXT_INPUT_HANDLERS;