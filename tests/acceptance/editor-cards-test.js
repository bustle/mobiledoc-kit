import { Editor } from 'content-kit-editor';
import Helpers from '../test-helpers';

const { test, module } = Helpers;

let fixture, editor, editorElement;
const cardText = 'card text';

const mobiledoc = Helpers.mobiledoc.build(({post, cardSection}) => {
  return post([cardSection('simple-card')]);
});

const simpleCard = {
  name: 'simple-card',
  display: {
    setup(element, options, env) {
      let button = document.createElement('button');
      button.setAttribute('id', 'display-button');
      element.appendChild(button);
      element.appendChild(document.createTextNode(cardText));
      button.onclick = env.edit;
      return {button};
    },
    teardown({button}) {
      button.parentNode.removeChild(button);
    }
  },
  edit: {
    setup(element, options, env) {
      let button = document.createElement('button');
      button.setAttribute('id', 'edit-button');
      button.onclick = env.save;
      element.appendChild(button);
      return {button};
    },
    teardown({button}) {
      button.parentNode.removeChild(button);
    }
  }
};

module('Acceptance: editor: cards', {
  beforeEach() {
    fixture = document.getElementById('qunit-fixture');
    editorElement = document.createElement('div');
    editorElement.setAttribute('id', 'editor');
    fixture.appendChild(editorElement);
  },
  afterEach() {
    if (editor) { editor.destroy(); }
  }
});

test('changing to display state triggers update on editor', (assert) => {
  const cards = [simpleCard];
  editor = new Editor({mobiledoc, cards});
  editor.render(editorElement);

  let updateCount = 0,
      triggeredUpdate = () => updateCount++;
  editor.on('update', triggeredUpdate);

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

  const cards = [simpleCard];
  editor = new Editor({mobiledoc, cards});
  editor.render(editorElement);

  Helpers.dom.selectText(cardText, editorElement);
  Helpers.dom.triggerEvent(document, 'mouseup');

  setTimeout(() => {
    // FIXME should have a better assertion here
    assert.ok(true, 'made it here with no javascript errors');
    done();
  });
});

test('removing last card from mobiledoc allows additional editing', (assert) => {
  const done = assert.async();
  let button;
  const cards = [{
    name: 'simple-card',
    display: {
      setup(element, options, env) {
        button = $('<button>Click me</button>');
        button.on('click', env.remove);
        $(element).append(button);
      }
    }
  }];
  editor = new Editor({mobiledoc, cards});
  editor.render(editorElement);

  assert.hasElement('#editor button:contains(Click me)', 'precond - button');

  button.click();

  setTimeout(() => {
    assert.hasNoElement('#editor button:contains(Click me)', 'button is removed');
    assert.hasNoElement('#editor p');
    Helpers.dom.moveCursorTo($('#editor')[0]);
    Helpers.dom.insertText(editor, 'X');
    assert.hasElement('#editor p:contains(X)');

    done();
  });
});
