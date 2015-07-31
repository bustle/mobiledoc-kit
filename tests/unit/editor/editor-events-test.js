const { module, test } = QUnit;
import Helpers from '../../test-helpers';
import { MOBILEDOC_VERSION } from 'content-kit-editor/renderers/mobiledoc';

import { Editor } from 'content-kit-editor';

let editor, editorElement;
let triggered = [];

const mobiledoc = {
  version: MOBILEDOC_VERSION,
  sections: [
    [],
    [[
      1, 'P', [[[], 0, 'this is the editor']]
    ]]
  ]
};

module('Unit: Editor: events', {
  beforeEach() {
    editorElement = document.createElement('div');
    document.getElementById('qunit-fixture').appendChild(editorElement);

    editor = new Editor(editorElement, {mobiledoc});
    editor.trigger = (name) => triggered.push(name);
  },

  afterEach() {
    if (editor) {
      editor.destroy();
      editor = null;
    }
    triggered = [];
  }
});

function assertTriggered(name, assert, message=`triggers ${name}`) {
  assert.ok(triggered.indexOf(name) > -1, message);
}

function assertNotTriggered(name, assert, message=`does not trigger ${name}`) {
  assert.ok(triggered.indexOf(name) === -1, message);
}

test('mouseup when text is selected triggers "selection" event', (assert) => {
  const done = assert.async();

  Helpers.dom.selectText('the editor', editorElement);
  Helpers.dom.triggerEvent(document, 'mouseup');

  assertNotTriggered('selection', assert, 'no selection before timeout');

  setTimeout(() => {
    assertTriggered('selection', assert, 'no selection before timeout');

    done();
  });
});

test('multiple mouseups when text is selected trigger "selectionUpdated" event', (assert) => {
  const done = assert.async();

  Helpers.dom.selectText('the editor', editorElement);
  Helpers.dom.triggerEvent(document, 'mouseup');

  setTimeout(() => {
    // mouseup again
    Helpers.dom.triggerEvent(document, 'mouseup');

    setTimeout(() => {
      assertTriggered('selectionUpdated', assert);

      done();
    });
  });
});

test('mouseup when no text is selected triggers no events', (assert) => {
  const done = assert.async();

  Helpers.dom.triggerEvent(document, 'mouseup');

  setTimeout(() => {
    assertNotTriggered('selection', assert);
    assertNotTriggered('selectionUpdated', assert);
    assertNotTriggered('selectionEnded', assert);

    done();
  });
});

test('mouseup after text was selected triggers "selectionEnded" event', (assert) => {
  const done = assert.async();

  Helpers.dom.selectText('the editor', editorElement);
  Helpers.dom.triggerEvent(document, 'mouseup');

  setTimeout(() => {
    Helpers.dom.clearSelection();
    Helpers.dom.triggerEvent(document, 'mouseup');

    setTimeout(() => {
      assertTriggered('selectionEnded', assert);

      done();
    });
  });
});
