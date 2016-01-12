import { Editor } from 'mobiledoc-kit';
import Helpers from '../test-helpers';
import { MOBILEDOC_VERSION } from 'mobiledoc-kit/renderers/mobiledoc/0-3';
// import { NO_BREAK_SPACE } from 'mobiledoc-kit/renderers/editor-dom';

const { test, module } = Helpers;

const simpleAtom = {
  name: 'simple-atom',
  type: 'dom',
  render({value}) {
    let element = document.createElement('span');
    element.setAttribute('id', 'simple-atom');
    element.appendChild(document.createTextNode(value));
    return element;
  }
};

let editor, editorElement;
const mobiledocWithAtom = {
  version: MOBILEDOC_VERSION,
  atoms: [
    ['simple-atom', 'Bob']
  ],
  cards: [],
  markups: [],
  sections: [
    [1, "P", [
      [0, [], 0, "text before atom"],
      [1, [], 0, 0],
      [0, [], 0, "text after atom"]
    ]]
  ]
};

module('Acceptance: Atoms', {
  beforeEach() {
    editorElement = $('#editor')[0];
  },

  afterEach() {
    if (editor) {
      editor.destroy();
      editor = null;
    }
  }
});

test('keystroke of character in section with atom keeps atom', (assert) => {
  editor = new Editor({mobiledoc: mobiledocWithAtom, atoms: [ simpleAtom ]});
  editor.render(editorElement);

  assert.hasElement(`#editor #simple-atom`, 'has atom');

  let pNode = $('#editor p')[0];
  Helpers.dom.moveCursorTo(pNode, 0);

  const letter = 'M';
  Helpers.dom.insertText(editor, letter);

  assert.hasElement(`#editor p:contains(${letter})`, 'adds char');

  assert.hasElement(`#editor #simple-atom`, 'still has atom');
});

test('keystroke of delete removes character after atom', (assert) => {
  editor = new Editor({mobiledoc: mobiledocWithAtom, atoms: [simpleAtom]});
  editor.render(editorElement);

  let pNode = $('#editor p')[0];
  Helpers.dom.moveCursorTo(pNode.lastChild, 1);
  Helpers.dom.triggerDelete(editor);

  assert.postIsSimilar(editor.post, Helpers.postAbstract.build(
    ({post, markupSection, atom, marker}) => {
      return post([markupSection('p', [
        marker('text before atom'),
        atom('simple-atom', 'Bob'),
        marker('ext after atom')
      ])]);
    }));
});

test('keystroke of delete removes atom', (assert) => {
  editor = new Editor({mobiledoc: mobiledocWithAtom, atoms: [simpleAtom]});
  editor.render(editorElement);

  let pNode = $('#editor p')[0];
  Helpers.dom.moveCursorTo(pNode.lastChild, 0);
  Helpers.dom.triggerDelete(editor);

  assert.postIsSimilar(editor.post, Helpers.postAbstract.build(
    ({post, markupSection, atom, marker}) => {
      return post([markupSection('p', [
        marker('text before atomtext after atom')
      ])]);
    }));
});

test('keystroke of forward delete removes atom', (assert) => {
  editor = new Editor({mobiledoc: mobiledocWithAtom, atoms: [simpleAtom]});
  editor.render(editorElement);

  let pNode = $('#editor p')[0];
  Helpers.dom.moveCursorTo(pNode.firstChild, 16);
  Helpers.dom.triggerForwardDelete(editor);

  assert.postIsSimilar(editor.post, Helpers.postAbstract.build(
    ({post, markupSection, atom, marker}) => {
      return post([markupSection('p', [
        marker('text before atomtext after atom')
      ])]);
    }));
});

test('keystroke of enter in section with atom creates new section', (assert) => {
  editor = new Editor({mobiledoc: mobiledocWithAtom, atoms: [simpleAtom]});
  editor.render(editorElement);

  let pNode = $('#editor p')[0];
  Helpers.dom.moveCursorTo(pNode.lastChild, 1);
  Helpers.dom.triggerEnter(editor);

  assert.postIsSimilar(editor.post, Helpers.postAbstract.build(
    ({post, markupSection, atom, marker}) => {
      return post([
        markupSection('p', [
          marker('text before atom'),
          atom('simple-atom', 'Bob'),
          marker('t')
        ]),
        markupSection('p', [
          marker('ext after atom')
        ])
      ]);
    }));
});

test('keystroke of enter after atom and before marker creates new section', (assert) => {
  editor = new Editor({mobiledoc: mobiledocWithAtom, atoms: [simpleAtom]});
  editor.render(editorElement);

  let pNode = $('#editor p')[0];
  Helpers.dom.moveCursorTo(pNode.lastChild, 0);
  Helpers.dom.triggerEnter(editor);

  assert.postIsSimilar(editor.post, Helpers.postAbstract.build(
    ({post, markupSection, atom, marker}) => {
      return post([
        markupSection('p', [
          marker('text before atom'),
          atom('simple-atom', 'Bob')
        ]),
        markupSection('p', [
          marker('text after atom')
        ])
      ]);
    }));
});

test('keystroke of enter before atom and after marker creates new section', (assert) => {
  editor = new Editor({mobiledoc: mobiledocWithAtom, atoms: [simpleAtom]});
  editor.render(editorElement);

  let pNode = $('#editor p')[0];
  Helpers.dom.moveCursorTo(pNode.firstChild, 16);
  Helpers.dom.triggerEnter(editor);

  assert.postIsSimilar(editor.post, Helpers.postAbstract.build(
    ({post, markupSection, atom, marker}) => {
      return post([
        markupSection('p', [
          marker('text before atom')
        ]),
        markupSection('p', [
          atom('simple-atom', 'Bob'),
          marker('text after atom')
        ])
      ]);
    }));
});
