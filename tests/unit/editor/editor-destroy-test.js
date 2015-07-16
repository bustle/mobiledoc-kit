const { module, test } = window.QUnit;
import Helpers from '../../test-helpers';

import { Editor } from 'content-kit-editor';

let editor;
let editorElement;

module('Unit: Editor #destroy', {
  beforeEach() {
    let fixture = $('#qunit-fixture')[0];
    editorElement = document.createElement('div');
    editorElement.innerHTML = 'HELLO';
    fixture.appendChild(editorElement);
    editor = new Editor(editorElement);
  },
  afterEach() {
    if (editor) {
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
