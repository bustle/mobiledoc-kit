const { module, test } = window.QUnit;
import Helpers from '../../test-helpers';
import { MOBILEDOC_VERSION } from 'content-kit-editor/renderers/mobiledoc';

import { Editor } from 'content-kit-editor';

let editor;
let editorElement;

const mobiledoc = {
  version: MOBILEDOC_VERSION,
  sections: [
    [],
    [[
      1, 'P', [[[], 0, 'HELLO']]
    ]]
  ]
};


module('Unit: Editor #destroy', {
  beforeEach() {
    let fixture = $('#qunit-fixture')[0];
    editorElement = document.createElement('div');
    fixture.appendChild(editorElement);
    editor = new Editor(editorElement, {mobiledoc});
  },
  afterEach() {
    if (editor && !editor._isDestroyed) {
      editor.destroy();
    }
  }
});

test('removes toolbar from DOM', (assert) => {
  let done = assert.async();

  Helpers.dom.selectText('HELLO', editorElement);
  Helpers.dom.triggerEvent(document, 'mouseup');

  setTimeout(() => {
    assert.hasElement('.ck-toolbar', 'toolbar is shown');
    editor.destroy();
    assert.hasNoElement('.ck-toolbar', 'toolbar is removed');
    done();
  });
});
