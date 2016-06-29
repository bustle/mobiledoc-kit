import Helpers from '../test-helpers';
const { test, module } = Helpers;
import { ZWNJ } from 'mobiledoc-kit/renderers/editor-dom';

const simpleAtom = {
  name: 'simple-atom',
  type: 'dom',
  render({value}) {
    let element = document.createElement('span');
    element.setAttribute('id', 'simple-atom');
    element.appendChild(document.createTextNode(value));
    return element;
  }
};

let editor, editorElement;
let editorOptions = { atoms: [simpleAtom] };

module('Acceptance: Editor: Reparsing', {
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
  editor = Helpers.mobiledoc.renderInto(editorElement, ({post, markupSection, marker}) => {
    expected = post([markupSection('p', [marker('def')])]);

    return post([markupSection('p', [marker('abc')])]);
  });

  let section = editor.post.sections.head;
  let node = section.markers.head.renderNode.element;

  assert.equal(node.textContent, 'abc', 'precond - correct text node');
  assert.equal(section.text, 'abc', 'precond - correct section');

  node.textContent = 'def';

  Helpers.wait(() => {
    assert.equal(section.text, 'def', 'section reparsed correctly');
    assert.postIsSimilar(editor.post, expected);
    done();
  });
});

test('removing text node causes reparse of section', (assert) => {
  let done = assert.async();
  let expected;
  editor = Helpers.mobiledoc.renderInto(editorElement, ({post, markupSection, marker}) => {
    expected = post([markupSection('p', [marker('def')])]);

    return post([markupSection('p', [marker('abc'), marker('def')])]);
  });

  let section = editor.post.sections.head;
  let node = section.markers.head.renderNode.element;

  assert.equal(node.textContent, 'abc', 'precond - correct text node');
  assert.equal(section.text, 'abcdef', 'precond - correct section');

  node.parentNode.removeChild(node);

  Helpers.wait(() => {
    assert.equal(section.text, 'def', 'section reparsed correctly');
    assert.postIsSimilar(editor.post, expected);
    done();
  });
});

test('removing section node causes reparse of post', (assert) => {
  let done = assert.async();
  let expected;
  editor = Helpers.mobiledoc.renderInto(editorElement, ({post, markupSection, marker}) => {
    expected = post([markupSection('p', [marker('123')])]);

    return post([
      markupSection('p', [marker('abc')]),
      markupSection('p', [marker('123')])
    ]);
  });

  let node = editor.post.sections.head.renderNode.element;
  assert.equal(node.innerHTML, 'abc', 'precond - correct node');

  node.parentNode.removeChild(node);

  Helpers.wait(() => {
    assert.postIsSimilar(editor.post, expected);
    done();
  });
});

test('inserting styled span in section causes section reparse', (assert) => {
  let done = assert.async();
  let expected;
  editor = Helpers.mobiledoc.renderInto(editorElement, ({post, markupSection, marker}) => {
    expected = post([markupSection('p', [marker('abc'), marker('def')])]);

    return post([
      markupSection('p', [marker('abc')])
    ]);
  });

  let node = editor.post.sections.head.renderNode.element;
  assert.equal(node.innerHTML, 'abc', 'precond - correct node');

  let span = document.createElement('span');
  span.setAttribute('style','font-size: 24px; font-color: blue');
  span.appendChild(document.createTextNode('def'));
  node.appendChild(span);

  Helpers.wait(() => {
    assert.postIsSimilar(editor.post, expected);
    done();
  });
});

test('inserting new top-level node causes reparse of post', (assert) => {
  let done = assert.async();
  let expected;
  editor = Helpers.mobiledoc.renderInto(editorElement, ({post, markupSection, marker}) => {
    expected = post([
      markupSection('p', [marker('abc')]),
      markupSection('p', [marker('123')])
    ]);

    return post([markupSection('p', [marker('abc')])]);
  });

  let span = document.createElement('span');
  span.appendChild(document.createTextNode('123'));
  editorElement.appendChild(span);

  Helpers.wait(() => {
    assert.postIsSimilar(editor.post, expected);
    done();
  });
});

test('inserting node into blank post causes reparse', (assert) => {
  let done = assert.async();
  let expected;

  editor = Helpers.mobiledoc.renderInto(editorElement, ({post, markupSection, marker}) => {
    expected = post([markupSection('p', [marker('123')])]);
    return post();
  });

  let span = document.createElement('span');
  span.appendChild(document.createTextNode('123'));
  editorElement.appendChild(span);

  Helpers.wait(() => {
    assert.postIsSimilar(editor.post, expected);
    done();
  });
});

test('after reparsing post, mutations still handled properly', (assert) => {
  let done = assert.async();
  let expected1, expected2;
  editor = Helpers.mobiledoc.renderInto(editorElement, ({post, markupSection, marker}) => {
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

  let span = document.createElement('span');
  span.appendChild(document.createTextNode('123'));
  editorElement.appendChild(span);

  Helpers.wait(() => {
    assert.postIsSimilar(editor.post, expected1);

    let node = editorElement.firstChild.firstChild;
    assert.equal(node.textContent, 'abc', 'precond - correct node');

    node.textContent = 'def';

    Helpers.wait(() => {
      assert.postIsSimilar(editor.post, expected2);

      done();
    });
  });
});

test('inserting text into text node on left/right of atom is reparsed correctly', (assert) => {
  let done = assert.async();
  let expected1, expected2;
  editor = Helpers.mobiledoc.renderInto(editorElement, ({post, markupSection, marker, atom}) => {
    expected1 = post([
      markupSection('p', [atom('simple-atom', 'first'), marker('Z')]),
    ]);

    expected2 = post([
      markupSection('p', [marker('A'), atom('simple-atom', 'first'), marker('Z')]),
    ]);

    return post([markupSection('p', [atom('simple-atom','first')])]);
  }, editorOptions);

  let atom = editor.post.sections.head.markers.head;
  let rightCursorNode = atom.renderNode.tailTextNode;

  assert.ok(rightCursorNode && rightCursorNode.textContent === ZWNJ,
            'precond - correct right cursor node');

  rightCursorNode.textContent = 'Z';
  Helpers.wait(() => {
    assert.postIsSimilar(editor.post, expected1);
    assert.renderTreeIsEqual(editor._renderTree, expected1);

    let leftCursorNode = atom.renderNode.headTextNode;
    assert.ok(leftCursorNode && leftCursorNode.textContent === ZWNJ,
              'precond - correct left cursor node');
    leftCursorNode.textContent = 'A';

    Helpers.wait(() => {
      assert.postIsSimilar(editor.post, expected2);
      assert.renderTreeIsEqual(editor._renderTree, expected2);

      done();
    });
  });
});

test('mutation inside card element does not cause reparse', (assert) => {
  let done = assert.async();
  let parseCount = 0;
  let myCard = {
    name: 'my-card',
    type: 'dom',
    render() {
      return document.createTextNode('howdy');
    }
  };

  editor = Helpers.mobiledoc.renderInto(editorElement, ({post, cardSection}) => {
    return post([
      cardSection('my-card', {})
    ]);
  }, {
    cards: [myCard]
  });

  editor.didUpdatePost(() => {
    parseCount++;
  });

  let textNode = Helpers.dom.findTextNode(editorElement, 'howdy');
  textNode.textContent = 'adios';

  // Allow the mutation observer to fire then...
  Helpers.wait(function() {
    assert.equal(0, parseCount);
    done();
  });
});
