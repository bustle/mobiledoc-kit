import { DIRECTION } from 'mobiledoc-kit/utils/key';
import Helpers from '../test-helpers';
import { CARD_MODES } from 'mobiledoc-kit/models/card';

const { test, module } = Helpers;
const { editor: { buildFromText } } = Helpers;

let editor, editorElement;
let editorOpts;
const cardText = 'card text';

const cards = [{
  name: 'simple',
  type: 'dom',
  render({env}) {
    let element = document.createElement('div');

    let button = document.createElement('button');
    button.setAttribute('id', 'display-button');
    element.appendChild(button);
    element.appendChild(document.createTextNode(cardText));
    button.onclick = env.edit;

    return element;
  },
  edit({env}) {
    let button = document.createElement('button');
    button.setAttribute('id', 'edit-button');
    button.onclick = env.save;
    return button;
  }
}, {
  name: 'input',
  type: 'dom',
  render() {
    return $('<input id="simple-card-input">')[0];
  }
}, {
  name: 'position',
  type: 'dom',
  render() {
    return $('<div id="my-simple-card"></div>')[0];
  }
}];

module('Acceptance: editor: cards', {
  beforeEach() {
    editorElement = $('#editor')[0];
    editorOpts = {element: editorElement, cards};
  },
  afterEach() {
    if (editor) { editor.destroy(); }
  }
});

test('changing to display state triggers update on editor', (assert) => {
  editor = buildFromText(['[simple]'], editorOpts);

  let updateCount = 0,
      triggeredUpdate = () => updateCount++;
  editor.postDidChange(triggeredUpdate);

  let displayButton = document.getElementById('display-button');
  assert.ok(!!displayButton, 'precond - display button is there');

  Helpers.dom.triggerEvent(displayButton, 'click');

  let editButton = document.getElementById('edit-button');
  assert.ok(!!editButton, 'precond - edit button is there after clicking the display button');

  let currentUpdateCount = updateCount;

  Helpers.dom.triggerEvent(editButton, 'click');

  assert.equal(updateCount, currentUpdateCount+1,
               'update is triggered after switching to display mode');
});

test('editor listeners are quieted for card actions', (assert) => {
  const done = assert.async();

  editor = buildFromText(['[simple]'], editorOpts);

  Helpers.dom.selectText(editor, cardText, editorElement);
  Helpers.dom.triggerEvent(document, 'mouseup');

  Helpers.wait(() => {
    // FIXME should have a better assertion here
    assert.ok(true, 'made it here with no javascript errors');
    done();
  });
});

test('removing last card from mobiledoc allows additional editing', (assert) => {
  const done = assert.async();
  let button;
  const cards = [{
    name: 'removable',
    type: 'dom',
    render({env}) {
      button = $('<button id="removable-button">Click me</button>');
      button.on('click', env.remove);
      return button[0];
    }
  }];
  editor = buildFromText(['[removable]'], {element: editorElement, cards});

  assert.hasElement('#editor button:contains(Click me)', 'precond - button');

  button.click();

  Helpers.wait(() => {
    assert.hasNoElement('#editor button:contains(Click me)', 'button is removed');
    assert.hasNoElement('#editor p');
    Helpers.dom.moveCursorTo(editor, $('#editor')[0]);
    Helpers.dom.insertText(editor, 'X');
    assert.hasElement('#editor p:contains(X)');

    done();
  });
});

test('delete when cursor is positioned at end of a card deletes card, replace with empty markup section', (assert) => {
  editor = buildFromText(['[position]|'], editorOpts);

  assert.hasElement('#my-simple-card', 'precond - renders card');
  assert.hasNoElement('#editor p', 'precond - has no markup section');

  Helpers.dom.triggerDelete(editor);

  assert.hasNoElement('#my-simple-card', 'removes card after delete');
  assert.hasElement('#editor p', 'has markup section after delete');
});

test('delete when cursor is at start of a card and prev section is blank deletes prev section', (assert) => {
  editor = buildFromText(['','|[position]'], editorOpts);

  assert.hasElement('#my-simple-card', 'precond - renders card');
  assert.hasElement('#editor p', 'precond - has blank markup section');

  Helpers.dom.triggerDelete(editor);

  assert.hasElement('#my-simple-card', 'card still exists after delete');
  assert.hasNoElement('#editor p', 'blank markup section deleted');
});

test('forward-delete when cursor is positioned at start of a card deletes card, replace with empty markup section', (assert) => {
  editor = buildFromText(['|[position]'], editorOpts);

  assert.hasElement('#my-simple-card', 'precond - renders card');
  assert.hasNoElement('#editor p', 'precond - has no markup section');

  Helpers.dom.triggerDelete(editor, DIRECTION.FORWARD);

  assert.hasNoElement('#my-simple-card', 'removes card after delete');
  assert.hasElement('#editor p', 'has markup section after delete');
});

test('forward-delete when cursor is positioned at end of a card and next section is blank deletes next section', (assert) => {
  editor = buildFromText(['[position]|',''], editorOpts);

  assert.hasElement('#my-simple-card', 'precond - renders card');
  assert.hasElement('#editor p', 'precond - has blank markup section');

  Helpers.dom.triggerDelete(editor, DIRECTION.FORWARD);

  assert.hasElement('#my-simple-card', 'still has card after delete');
  assert.hasNoElement('#editor p', 'deletes blank markup section');
});

test('selecting a card and deleting deletes the card', (assert) => {
  editor = buildFromText(['<[position]>'], editorOpts);

  assert.hasElement('#my-simple-card', 'precond - renders card');
  assert.hasNoElement('#editor p', 'precond - has no markup section');

  Helpers.dom.triggerDelete(editor);

  assert.hasNoElement('#my-simple-card', 'has no card after delete');
  assert.hasElement('#editor p', 'has blank markup section');
});

test('selecting a card and some text after and deleting deletes card and text', (assert) => {
  editor = buildFromText(['<[position]','a>bc'], editorOpts);

  assert.hasElement('#my-simple-card', 'precond - renders card');
  assert.hasElement('#editor p:contains(abc)', 'precond - has markup section');

  Helpers.dom.triggerDelete(editor);

  assert.hasNoElement('#my-simple-card', 'has no card after delete');
  assert.hasElement('p:contains(bc)', 'p with bc');
  assert.hasNoElement('p:contains(abc)', '"a" is deleted');
});

test('deleting at start of empty markup section with prev card deletes the markup section', (assert) => {
  editor = buildFromText(['[position]','|'], editorOpts);

  assert.hasElement('#my-simple-card', 'precond - renders card');
  assert.hasElement('#editor p', 'precond - has blank markup section');

  Helpers.dom.triggerDelete(editor);

  assert.hasElement('#my-simple-card', 'has card after delete');
  assert.hasNoElement('#editor p', 'paragraph is gone');
});

test('press enter at end of card inserts section after card', (assert) => {
  editor = buildFromText(['[position]|'], editorOpts);

  assert.hasElement('#my-simple-card', 'precond - renders card');
  assert.hasNoElement('#editor p', 'precond - has no markup section');

  Helpers.dom.triggerEnter(editor);

  assert.hasElement('#my-simple-card', 'has card after enter');
  assert.hasElement('#editor p', 'markup section is added');
});

test('press enter at start of card inserts section before card', (assert) => {
  editor = buildFromText(['|[position]'], editorOpts);

  assert.hasElement('#my-simple-card', 'precond - renders card');
  assert.hasNoElement('#editor p', 'precond - has no markup section');

  Helpers.dom.triggerEnter(editor);

  assert.hasElement('#my-simple-card', 'has card after enter');
  assert.hasElement('#editor p', 'markup section is added');
});

test('editor ignores events when focus is inside a card', (assert) => {
  editor = buildFromText(['','[input]'], editorOpts);

  assert.hasElement('#simple-card-input', 'precond - renders card');

  let inputEvents = 0;
  editor._eventManager.keyup = () => inputEvents++;

  let input = $('#simple-card-input')[0];
  Helpers.dom.triggerEvent(input, 'keyup');

  assert.equal(inputEvents, 0, 'editor does not handle keyup event when in card');

  let p = $('#editor p')[0];
  Helpers.dom.triggerEvent(p, 'keyup');

  assert.equal(inputEvents, 1, 'editor handles keyup event outside of card');
});

test('a moved card retains its inital editing mode', (assert) => {
  editorOpts.beforeRender = (editor) => {
    editor.post.sections.tail.setInitialMode(CARD_MODES.EDIT);
  };
  editor = buildFromText(['','[simple]'], editorOpts);

  assert.hasElement('#edit-button', 'precond - card is in edit mode');

  editor.run(postEditor => {
    let card = editor.post.sections.tail;
    postEditor.moveSectionUp(card);
  });

  assert.hasElement('#edit-button', 'card is still in edit mode');
});

test('a moved card retains its current editing mode', (assert) => {
  editor = buildFromText(['','[simple]'], editorOpts);

  assert.hasNoElement('#edit-button', 'precond - card is not in edit mode');

  editor.editCard(editor.post.sections.tail);
  assert.hasElement('#edit-button', 'precond - card is in edit mode');

  editor.run(postEditor => postEditor.moveSectionUp(editor.post.sections.tail));

  assert.hasElement('#edit-button', 'card is still in edit mode');
});

// see https://github.com/bustle/mobiledoc-kit/issues/475
test('when editing is disabled, cards can be moved and deleted', (assert) => {
  let removeHook;
  editorOpts.unknownCardHandler = ({env: {name, remove}}) => {
    if (name === 'card-b') {
      removeHook = remove;
    }
    return $(`<h1>${name}</h1>`)[0];
  };
  editor = buildFromText(['[card-a]','[card-b]|'], editorOpts);
  editor.disableEditing();

  let card = editor.post.sections.tail;
  editor.run(postEditor => {
    // In order to recreate the problematic scenario, we must explicitly set the range
    // here to the moved section's tail position
    let movedSection = postEditor.moveSectionUp(card);
    postEditor.setRange(movedSection.tailPosition());
  });

  assert.hasElement('h1:contains(card-a)');
  assert.hasElement('h1:contains(card-b)');
  let text = $(editorElement).text();
  assert.ok(text.indexOf('card-b') < text.indexOf('card-a'), 'card b is moved up');

  removeHook();

  assert.hasNoElement('h1:contains(card-b)');
});
