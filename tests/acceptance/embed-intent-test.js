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
const mobileDocWith3Sections = {
  version: MOBILEDOC_VERSION,
  sections: [
    [],
    [
      [1, "P", [
        [[], 0, "first section"]
      ]],
      [1, "P", [
        [[], 0, ""]
      ]],
      [1, "P", [
        [[], 0, "third section"]
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
  assert.hasNoElement('.ck-embed-intent', 'embed intent is hidden');

  Helpers.dom.moveCursorTo(editorElement.childNodes[0].childNodes[0], 12);
  Helpers.dom.triggerKeyEvent(editorElement, 'keydown', Helpers.dom.KEY_CODES.ENTER);
  Helpers.dom.triggerKeyEvent(editorElement, 'keyup', Helpers.dom.KEY_CODES.ENTER);

  assert.ok($('.ck-embed-intent').is(':visible'), 'embed intent appears');
});

Helpers.skipInPhantom('add card between sections', (assert) => {
  editor = new Editor(editorElement, {mobiledoc: mobileDocWith3Sections});
  assert.equal(editorElement.childNodes.length, 3, 'has 3 paragraphs to start');

  Helpers.dom.moveCursorTo(editorElement.childNodes[1].firstChild, 0);
  Helpers.dom.triggerEvent(editorElement.childNodes[1].firstChild, 'click');

  let done = assert.async();
  setTimeout(() => { // delay due to internal async
    assert.ok($('.ck-embed-intent').is(':visible'), 'embed intent appears');

    Helpers.dom.triggerEvent($('.ck-embed-intent-btn')[0], 'click');
    Helpers.dom.triggerEvent($('button[title=image]')[0], 'click');

    assert.hasNoElement('.ck-embed-intent', 'embed intent is hidden');
    assert.equal(editorElement.childNodes.length, 3, 'has 3 sections after card insertion');
    assert.equal(editor.element.childNodes[0].tagName, 'P');
    assert.equal(editor.element.childNodes[1].tagName, 'DIV');
    assert.equal(editor.element.childNodes[2].tagName, 'P');
    done();
  }, 3);
});
