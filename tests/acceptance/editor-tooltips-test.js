import Helpers from '../test-helpers';

const { module, test, skip } = Helpers;

let editor, editorElement;
module('Acceptance: Editor: Tooltips', {
  beforeEach() {
    editorElement = $('#editor')[0];
  },
  afterEach() {
    if (editor) {
      editor.destroy();
      editor = null;
    }
  }
});

test('tooltip is shown on link hover', assert => {
  const done = assert.async();

  let url = 'http://bustle.com/';
  const tooltipPlugin = {
    renderLink(tooltipEl, linkEl) {
      assert.ok(tooltipEl instanceof HTMLElement);
      assert.ok(linkEl instanceof HTMLAnchorElement);
      assert.equal(linkEl.href, url);
      done();
    }
  }
  editor = Helpers.mobiledoc.renderInto(editorElement, ({post, markupSection, marker, markup}) => post([
    markupSection('p', [marker('something', [markup('a', {href:url})])])
  ]), { tooltipPlugin });
  const linkEl = editorElement.querySelector('a');
  Helpers.dom.triggerEvent(linkEl, 'mouseover');
});
