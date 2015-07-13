import { Editor } from 'content-kit-editor';
import Helpers from '../test-helpers';

const { test, module } = QUnit;

let fixture, editor, editorElement, selectedText;

module('Acceptance: Editor commands', {
  beforeEach() {
    fixture = document.getElementById('qunit-fixture');
    editorElement = document.createElement('div');
    editorElement.setAttribute('id', 'editor');
    editorElement.innerHTML = 'THIS IS A TEST';
    fixture.appendChild(editorElement);
    editor = new Editor(editorElement);

    selectedText = 'IS A';
    Helpers.dom.selectText(selectedText, editorElement);
    Helpers.dom.triggerEvent(document, 'mouseup');
  },

  afterEach() {
    editor.destroy();
  }
});

function clickToolbarButton(name, assert) {
  let btnSelector = `.ck-toolbar-btn[title="${name}"]`;
  let button = assert.hasElement(btnSelector);

  Helpers.dom.triggerEvent(button[0], 'mouseup');
}

test('when text is highlighted, shows toolbar', (assert) => {
  let done = assert.async();

  setTimeout(() => {
    assert.hasElement('.ck-toolbar', 'displays toolbar');
    assert.hasElement('.ck-toolbar-btn', 'displays toolbar buttons');
    let boldBtnSelector = '.ck-toolbar-btn[title="bold"]';
    assert.hasElement(boldBtnSelector, 'has bold button');
    done();
  }, 10);
});

test('highlight text, click "bold" button bolds text', (assert) => {
  let done = assert.async();

  setTimeout(() => {
    clickToolbarButton('bold', assert);
    assert.hasElement('#editor b:contains(IS A)');

    done();
  }, 10);
});

test('highlight text, click "italic" button italicizes text', (assert) => {
  let done = assert.async();

  setTimeout(() => {
    clickToolbarButton('italic', assert);
    assert.hasElement('#editor i:contains(IS A)');

    done();
  }, 10);
});

test('highlight text, click "heading" button turns text into h2 header', (assert) => {
  let done = assert.async();

  setTimeout(() => {
    clickToolbarButton('heading', assert);
    assert.hasElement('#editor h2:contains(THIS IS A TEST)');

    done();
  }, 10);
});

test('highlight text, click "subheading" button turns text into h3 header', (assert) => {
  let done = assert.async();

  setTimeout(() => {
    clickToolbarButton('subheading', assert);
    assert.hasElement('#editor h3:contains(THIS IS A TEST)');

    done();
  }, 10);
});

test('highlight text, click "quote" button turns text into blockquote', (assert) => {
  let done = assert.async();

  setTimeout(() => {
    clickToolbarButton('quote', assert);
    assert.hasElement('#editor blockquote:contains(THIS IS A TEST)');

    done();
  }, 10);
});

test('highlight text, click "link" button shows input for URL, makes link', (assert) => {
  let done = assert.async();

  setTimeout(() => {
    clickToolbarButton('link', assert);
    let input = assert.hasElement('.ck-toolbar-prompt input');
    let url = 'http://google.com';
    $(input).val(url);
    Helpers.dom.triggerKeyEvent(input[0], 'keyup');

    assert.hasElement(`#editor a[href="${url}"]:contains(${selectedText})`);

    done();
  }, 10);
});
