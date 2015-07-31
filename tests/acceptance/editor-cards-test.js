import { Editor } from 'content-kit-editor';
import Helpers from '../test-helpers';
import { MOBILEDOC_VERSION } from 'content-kit-editor/renderers/mobiledoc';

const { test, module } = QUnit;

let fixture, editor, editorElement;

const mobiledoc = {
  version: MOBILEDOC_VERSION,
  sections: [
    [],
    [
      [10, 'simple-card']
    ]
  ]
};

const simpleCard = {
  name: 'simple-card',
  display: {
    setup(element, options, env) {
      let button = document.createElement('button');
      button.setAttribute('id', 'display-button');
      element.appendChild(button);
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
    if (editor) {
      editor.destroy();
    }
  }
});

test('changing to display state triggers update on editor', (assert) => {
  const cards = [simpleCard];
  editor = new Editor(editorElement, {mobiledoc, cards});

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

