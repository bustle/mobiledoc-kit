/* global QUnit */

import { Editor } from 'content-kit-editor';
import Helpers from '../test-helpers';

const { test, module } = QUnit;

let fixture, editor, editorElement;

module('Acceptance: basic editor', {
  beforeEach() {
    fixture = document.getElementById('qunit-fixture');
    editorElement = document.createElement('div');
    editorElement.setAttribute('id', 'editor');
    fixture.appendChild(editorElement);
  },
  afterEach() {
  }
});

test('sets element as contenteditable', (assert) => {
  let innerHTML = `<p>Hello</p>`;
  editorElement.innerHTML = innerHTML;
  editor = new Editor(document.getElementById('editor'));

  assert.equal(editorElement.getAttribute('contenteditable'),
               'true',
               'element is contenteditable');
  assert.equal(editorElement.firstChild.tagName, 'P',
               `editor element has a P as its first child`);
});

test('editing element changes editor post model', (assert) => {
  let innerHTML = `<p>Hello</p>`;
  editorElement.innerHTML = innerHTML;
  editor = new Editor(document.getElementById('editor'));

  let p = editorElement.querySelector('p');
  let textElement = p.firstChild;

  Helpers.dom.moveCursorTo(textElement, 0);

  document.execCommand('insertText', false, 'A');
  assert.equal(p.textContent, 'AHello');
});
