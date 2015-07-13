const { module, test } = window.QUnit;
import Helpers from '../../test-helpers';

import { Editor } from 'content-kit-editor';

let editor;
let fixture;

module('Unit: Editor #destroy', {
  beforeEach() {
    fixture = $('#qunit-fixture');
    fixture.html('the editor');
    editor = new Editor(fixture[0]);
  },
  afterEach() {
  }
});

test('removes toolbar from DOM', (assert) => {
  let done = assert.async();

  Helpers.dom.selectText('the editor', fixture[0]);
  Helpers.dom.triggerEvent(document, 'mouseup');

  setTimeout(() => {
    assert.hasElement('.ck-toolbar', 'toolbar is shown');
    editor.destroy();
    assert.hasNoElement('.ck-toolbar', 'toolbar is removed');
    done();
  });
});
