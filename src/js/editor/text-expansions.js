import Keycodes from '../utils/keycodes';
import Key from '../utils/key';
import { detect } from '../utils/array-utils';
import Range from '../utils/cursor/range';

const { SPACE } = Keycodes;

function replaceWithListSection(editor, listTagName) {
  const {head: {section}} = editor.cursor.offsets;

  editor.run(postEditor => {
    const {builder} = postEditor;
    const listItem = builder.createListItem();
    const listSection = builder.createListSection(listTagName, [listItem]);

    postEditor.replaceSection(section, listSection);
    postEditor.setRange(new Range(listSection.tailPosition()));
  });
}

function replaceWithHeaderSection(editor, headingTagName) {
  const {head: {section}} = editor.cursor.offsets;

  editor.run(postEditor => {
    const {builder} = postEditor;
    const newSection = builder.createMarkupSection(headingTagName);

    postEditor.replaceSection(section, newSection);
    postEditor.setRange(new Range(newSection.tailPosition()));
  });
}

export function validateExpansion(expansion) {
  return !!expansion.trigger && !!expansion.text && !!expansion.run;
}

export const DEFAULT_TEXT_EXPANSIONS = [
  {
    trigger: SPACE,
    text: '*',
    run: (editor) => {
      replaceWithListSection(editor, 'ul');
    }
  },
  {
    trigger: SPACE,
    text: '1',
    run: (editor) => {
      replaceWithListSection(editor, 'ol');
    }
  },
  {
    trigger: SPACE,
    text: '1.',
    run: (editor) => {
      replaceWithListSection(editor, 'ol');
    }
  },
  {
    trigger: SPACE,
    text: '##',
    run: (editor) => {
      replaceWithHeaderSection(editor, 'h2');
    }
  },
  {
    trigger: SPACE,
    text: '###',
    run: (editor) => {
      replaceWithHeaderSection(editor, 'h3');
    }
  }
];

export function findExpansion(expansions, keyEvent, editor) {
  let key = Key.fromEvent(keyEvent);
  if (!key.isPrintable()) { return; }

  let { range } = editor;
  if (!range.isCollapsed) { return; }

  let {head, head:{section}} = range;

  if (head.isBlank) { return; }
  if (!section.isMarkupSection) { return; }

  let marker = head.marker;

  // Only fire expansions at start of section
  if (marker && marker.prev) { return; }

  let _text = marker && marker.value;

  return detect(expansions, ({trigger, text}) => {
    return key.keyCode === trigger && _text === text;
  });
}
