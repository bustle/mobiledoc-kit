import { Editor } from 'mobiledoc-kit';
import Helpers from '../test-helpers';
import Range from 'mobiledoc-kit/utils/cursor/range';
import Position from 'mobiledoc-kit/utils/cursor/position';
import {
  TAB,
  ENTER
} from 'mobiledoc-kit/utils/characters';

const { test, module } = Helpers;

const cards = [{
  name: 'my-card',
  type: 'dom',
  render() {},
  edit() {}
}];

let editor, editorElement;

module('Acceptance: editor: basic', {
  beforeEach() {
    editorElement = $('#editor')[0];
  },
  afterEach() {
    if (editor) { editor.destroy(); }
  }
});

test('sets element as contenteditable', (assert) => {
  editor = new Editor();
  editor.render(editorElement);

  assert.equal(editorElement.getAttribute('contenteditable'),
               'true',
               'element is contenteditable');
});

test('#disableEditing before render is meaningful', (assert) => {
  editor = new Editor();
  editor.disableEditing();
  editor.render(editorElement);

  assert.ok(!editorElement.hasAttribute('contenteditable'),
            'element is not contenteditable');
  editor.enableEditing();
  assert.equal(editorElement.getAttribute('contenteditable'),
               'true',
               'element is contenteditable');
});

test('when editing is disabled, the placeholder is not shown', (assert) => {
  editor = new Editor({placeholder: 'the placeholder'});
  editor.disableEditing();
  editor.render(editorElement);

  assert.ok(!$('#editor').data('placeholder'), 'no placeholder when disabled');
  editor.enableEditing();
  assert.equal($('#editor').data('placeholder'), 'the placeholder',
               'placeholder is shown when editable');
});

test('#disableEditing and #enableEditing toggle contenteditable', (assert) => {
  editor = new Editor();
  editor.render(editorElement);

  assert.equal(editorElement.getAttribute('contenteditable'),
               'true',
               'element is contenteditable');
  editor.disableEditing();
  assert.equal(editorElement.getAttribute('contenteditable'),
               'false',
               'element is not contenteditable');
  editor.enableEditing();
  assert.equal(editorElement.getAttribute('contenteditable'),
               'true',
               'element is contenteditable');
});

test('clicking outside the editor does not raise an error', (assert) => {
  const done = assert.async();
  editor = new Editor({autofocus: false});
  editor.render(editorElement);

  let secondEditorElement = document.createElement('div');
  document.body.appendChild(secondEditorElement);

  let secondEditor = new Editor(); // This editor will be focused
  secondEditor.render(secondEditorElement);

  Helpers.dom.triggerEvent(editorElement, 'click');

  // Embed intent uses setTimeout, so this assertion must
  // setTimeout after it to catch the exception during failure
  // cases.
  setTimeout(() => {
    assert.ok(true, 'can click external item without error');
    secondEditor.destroy();
    document.body.removeChild(secondEditorElement);

    done();
  });
});

test('typing in empty post correctly adds a section to it', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(({post}) => post());
  editor = new Editor({mobiledoc});
  editor.render(editorElement);

  assert.hasElement('#editor');
  assert.hasNoElement('#editor p');

  Helpers.dom.moveCursorTo(editorElement);
  Helpers.dom.insertText(editor, 'X');
  assert.hasElement('#editor p:contains(X)');
  Helpers.dom.insertText(editor, 'Y');
  assert.hasElement('#editor p:contains(XY)', 'inserts text at correct spot');
});

test('typing when on the end of a card is blocked', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(({post, cardSection}) => {
    return post([
      cardSection('my-card')
    ]);
  });
  editor = new Editor({mobiledoc, cards});
  editor.render(editorElement);

  let endingZWNJ = $('#editor')[0].firstChild.lastChild;
  Helpers.dom.moveCursorTo(endingZWNJ, 0);
  Helpers.dom.insertText(editor, 'X');
  assert.hasNoElement('#editor div:contains(X)');
  Helpers.dom.moveCursorTo(endingZWNJ, 1);
  Helpers.dom.insertText(editor, 'Y');
  assert.hasNoElement('#editor div:contains(Y)');
});

test('typing when on the start of a card is blocked', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(({post, cardSection}) => {
    return post([
      cardSection('my-card')
    ]);
  });
  editor = new Editor({mobiledoc, cards});
  editor.render(editorElement);

  let startingZWNJ = $('#editor')[0].firstChild.firstChild;
  Helpers.dom.moveCursorTo(startingZWNJ, 0);
  Helpers.dom.insertText(editor, 'X');
  assert.hasNoElement('#editor div:contains(X)');
  Helpers.dom.moveCursorTo(startingZWNJ, 1);
  Helpers.dom.insertText(editor, 'Y');
  assert.hasNoElement('#editor div:contains(Y)');
});

test('typing tab enters a tab character', (assert) => {
  let done = assert.async();
  let mobiledoc = Helpers.mobiledoc.build(({post}) => post());
  editor = new Editor({mobiledoc});
  editor.render(editorElement);

  assert.hasElement('#editor');
  assert.hasNoElement('#editor p');

  Helpers.dom.moveCursorTo($('#editor')[0]);
  Helpers.dom.insertText(editor, TAB);
  Helpers.dom.insertText(editor, 'Y');
  window.setTimeout(() => {
    let editedMobiledoc = editor.serialize();
    assert.deepEqual(editedMobiledoc.sections, [
      [],
      [
        [1, 'p', [
          [[], 0, `${TAB}Y`]
        ]]
      ]
    ], 'correctly encoded');
    done();
  }, 0);
});

// see https://github.com/bustlelabs/mobiledoc-kit/issues/215
test('select-all and type text works ok', (assert) => {
  let done = assert.async();
  const mobiledoc = Helpers.mobiledoc.build(({post, markupSection, marker}) => {
    return post([
      markupSection('p', [marker('abc')])
    ]);
  });
  editor = new Editor({mobiledoc, cards});
  editor.render(editorElement);

  Helpers.dom.moveCursorTo(editorElement.firstChild, 0);
  document.execCommand('selectAll');

  assert.selectedText('abc', 'precond - abc is selected');
  assert.hasElement('#editor p:contains(abc)', 'precond - renders p');

  Helpers.dom.insertText(editor, 'X');
  setTimeout(function() {
    assert.hasNoElement('#editor p:contains(abc)', 'replaces existing text');
    assert.hasElement('#editor p:contains(X)', 'inserts text');
    done();
  }, 0);
});

test('typing enter splits lines, sets cursor', (assert) => {
  let done = assert.async();
  let mobiledoc = Helpers.mobiledoc.build(({post, markupSection, marker}) => {
    return post([
      markupSection('p', [ marker('hihey') ])
    ]);
  });
  editor = new Editor({mobiledoc});
  editor.render(editorElement);

  assert.hasElement('#editor p');

  Helpers.dom.moveCursorTo($('#editor p')[0].firstChild, 2);
  Helpers.dom.insertText(editor, ENTER);
  window.setTimeout(() => {
    let editedMobiledoc = editor.serialize();
    assert.deepEqual(editedMobiledoc.sections, [
      [],
      [
        [1, 'p', [
          [[], 0, `hi`]
        ]],
        [1, 'p', [
          [[], 0, `hey`]
        ]]
      ]
    ], 'correctly encoded');
    let expectedRange = new Range(new Position(editor.post.sections.tail, 0));
    assert.ok(expectedRange.isEqual(editor.range), 'range is at start of new section');
    done();
  }, 0);
});
