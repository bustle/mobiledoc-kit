import Keycodes from '../utils/keycodes';
import Key from '../utils/key';
import { detect } from '../utils/array-utils';
import { MARKUP_SECTION_TYPE } from '../models/types';

const { SPACE } = Keycodes;

function replaceWithListSection(editor, listTagName) {
  const {head: {section}} = editor.cursor.offsets;

  const newSection = editor.run(postEditor => {
    const {builder} = postEditor;
    const listItem = builder.createListItem();
    const listSection = builder.createListSection(listTagName, [listItem]);

    postEditor.replaceSection(section, listSection);
    return listItem;
  });

  editor.cursor.moveToSection(newSection);
}

function replaceWithHeaderSection(editor, headingTagName) {
  const {head: {section}} = editor.cursor.offsets;

  const newSection = editor.run(postEditor => {
    const {builder} = postEditor;
    const newSection = builder.createMarkupSection(headingTagName);
    postEditor.replaceSection(section, newSection);
    return newSection;
  });

  editor.cursor.moveToSection(newSection);
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
  const key = Key.fromEvent(keyEvent);
  if (!key.isPrintable()) { return; }

  const {head:{section, offset}} = editor.cursor.offsets;
  if (section.type !== MARKUP_SECTION_TYPE) { return; }

  // FIXME this is potentially expensive to calculate and might be better
  // perf to first find expansions matching the trigger and only if matches
  // are found then calculating the _text
  const _text = section.textUntil(offset);
  return detect(
    expansions,
    ({trigger, text}) => {
      return key.keyCode === trigger &&
             _text === (text + String.fromCharCode(trigger));
    }
  );
}
