import Helpers from '../test-helpers';
const { test, module } = Helpers;

let editor, editorElement;

module('Acceptance: editor: reparsing', {
  beforeEach() {
    editorElement = $('#editor')[0];
  },
  afterEach() {
    if (editor) { editor.destroy(); }
  }
});

test('changing text node content causes reparse of section', (assert) => {
  let done = assert.async();
  let expected;
  let editor = Helpers.mobiledoc.renderInto(editorElement, ({post, markupSection, marker}) => {
    expected = post([markupSection('p', [marker('def')])]);

    return post([markupSection('p', [marker('abc')])]);
  });

  let reparsed = false;
  editor.didReparse(() => reparsed = true);

  let section = editor.post.sections.head;
  let node = section.markers.head.renderNode.element;

  assert.equal(node.textContent, 'abc', 'precond - correct text node');
  assert.equal(section.text, 'abc', 'precond - correct section');

  node.textContent = 'def';

  setTimeout(() => {
    assert.equal(section.text, 'def', 'section reparsed correctly');
    assert.postIsSimilar(editor.post, expected);
    assert.ok(reparsed, 'did reparse');
    done();
  });
});

test('removing text node causes reparse of section', (assert) => {
  let done = assert.async();
  let expected;
  let editor = Helpers.mobiledoc.renderInto(editorElement, ({post, markupSection, marker}) => {
    expected = post([markupSection('p', [marker('def')])]);

    return post([markupSection('p', [marker('abc'), marker('def')])]);
  });

  let reparsed = false;
  editor.didReparse(() => reparsed = true);

  let section = editor.post.sections.head;
  let node = section.markers.head.renderNode.element;

  assert.equal(node.textContent, 'abc', 'precond - correct text node');
  assert.equal(section.text, 'abcdef', 'precond - correct section');

  node.parentNode.removeChild(node);

  setTimeout(() => {
    assert.equal(section.text, 'def', 'section reparsed correctly');
    assert.postIsSimilar(editor.post, expected);
    assert.ok(reparsed, 'did reparse');
    done();
  });
});

test('removing section node causes reparse of post', (assert) => {
  let done = assert.async();
  let expected;
  let editor = Helpers.mobiledoc.renderInto(editorElement, ({post, markupSection, marker}) => {
    expected = post([markupSection('p', [marker('123')])]);

    return post([
      markupSection('p', [marker('abc')]),
      markupSection('p', [marker('123')])
    ]);
  });

  let reparsed = false;
  editor.didReparse(() => reparsed = true);

  let node = editor.post.sections.head.renderNode.element;
  assert.equal(node.innerHTML, 'abc', 'precond - correct node');

  node.parentNode.removeChild(node);

  setTimeout(() => {
    assert.postIsSimilar(editor.post, expected);
    assert.ok(reparsed, 'did reparse');
    done();
  });
});

test('inserting styled span in section causes section reparse', (assert) => {
  let done = assert.async();
  let expected;
  let editor = Helpers.mobiledoc.renderInto(editorElement, ({post, markupSection, marker}) => {
    expected = post([markupSection('p', [marker('abc'), marker('def')])]);

    return post([
      markupSection('p', [marker('abc')])
    ]);
  });

  let reparsed = false;
  editor.didReparse(() => reparsed = true);

  let node = editor.post.sections.head.renderNode.element;
  assert.equal(node.innerHTML, 'abc', 'precond - correct node');

  let span = document.createElement('span');
  span.setAttribute('style','font-size: 24px; font-color: blue');
  span.appendChild(document.createTextNode('def'));
  node.appendChild(span);

  setTimeout(() => {
    assert.postIsSimilar(editor.post, expected);
    assert.ok(reparsed, 'did reparse');
    done();
  });
});

test('inserting new top-level node causes reparse of post', (assert) => {
  let done = assert.async();
  let expected;
  let editor = Helpers.mobiledoc.renderInto(editorElement, ({post, markupSection, marker}) => {
    expected = post([
      markupSection('p', [marker('abc')]),
      markupSection('p', [marker('123')])
    ]);

    return post([markupSection('p', [marker('abc')])]);
  });

  let reparsed = false;
  editor.didReparse(() => reparsed = true);

  let span = document.createElement('span');
  span.appendChild(document.createTextNode('123'));
  editorElement.appendChild(span);

  setTimeout(() => {
    assert.postIsSimilar(editor.post, expected);
    assert.ok(reparsed, 'did reparse');
    done();
  });
});

test('inserting node into blank post causes reparse', (assert) => {
  let done = assert.async();
  let expected;

  let editor = Helpers.mobiledoc.renderInto(editorElement, ({post, markupSection, marker}) => {
    expected = post([markupSection('p', [marker('123')])]);
    return post();
  });

  let reparsed = false;
  editor.didReparse(() => reparsed = true);

  let span = document.createElement('span');
  span.appendChild(document.createTextNode('123'));
  editorElement.appendChild(span);

  setTimeout(() => {
    assert.postIsSimilar(editor.post, expected);
    assert.ok(reparsed, 'did reparse');
    done();
  });
});

test('after reparsing post, mutations still handled properly', (assert) => {
  let done = assert.async();
  let expected1, expected2;
  let editor = Helpers.mobiledoc.renderInto(editorElement, ({post, markupSection, marker}) => {
    expected1 = post([
      markupSection('p', [marker('abc')]),
      markupSection('p', [marker('123')])
    ]);

    expected2 = post([
      markupSection('p', [marker('def')]),
      markupSection('p', [marker('123')])
    ]);

    return post([markupSection('p', [marker('abc')])]);
  });

  let reparsed = false;
  editor.didReparse(() => reparsed = true);

  let span = document.createElement('span');
  span.appendChild(document.createTextNode('123'));
  editorElement.appendChild(span);

  setTimeout(() => {
    assert.postIsSimilar(editor.post, expected1);
    assert.ok(reparsed, 'did reparse');
    reparsed = false;

    let node = editorElement.firstChild.firstChild;
    assert.equal(node.textContent, 'abc', 'precond - correct node');

    node.textContent = 'def';

    setTimeout(() => {
      assert.ok(reparsed, 'reparsed again');
      assert.postIsSimilar(editor.post, expected2);

      done();
    });
  });
});
