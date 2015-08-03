import { Editor } from 'content-kit-editor';
import Helpers from '../test-helpers';
import { MOBILEDOC_VERSION } from 'content-kit-editor/renderers/mobiledoc';

const { module } = QUnit;

let fixture, editor, editorElement;
const mobileDocWith1Section = {
  version: MOBILEDOC_VERSION,
  sections: [
    [],
    [
      [1, "P", [
        [[], 0, "only section"]
      ]]
    ]
  ]
};

module('Acceptance: Embed intent', {
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

Helpers.skipInPhantom('typing inserts section', (assert) => {
  editor = new Editor(editorElement, {mobiledoc: mobileDocWith1Section});
  assert.equal($('#editor p').length, 1, 'has 1 paragraph to start');

  Helpers.dom.moveCursorTo(editorElement.childNodes[0].childNodes[0], 12);
  Helpers.dom.triggerKeyEvent(editorElement, 'keydown', Helpers.dom.KEY_CODES.ENTER);
  Helpers.dom.triggerKeyEvent(editorElement, 'keyup', Helpers.dom.KEY_CODES.ENTER);

  assert.ok($('.ck-embed-intent').is(':visible'), 'embed intent appears');
});

