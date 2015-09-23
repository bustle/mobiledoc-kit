import Editor from 'content-kit-editor/editor/editor';
import { EDITOR_ELEMENT_CLASS_NAME } from 'content-kit-editor/editor/editor';
import { normalizeTagName } from 'content-kit-editor/utils/dom-utils';
import { MOBILEDOC_VERSION } from 'content-kit-editor/renderers/mobiledoc';
import Range from 'content-kit-editor/utils/cursor/range';

const { module, test } = window.QUnit;

let fixture, editorElement, editor;

module('Unit: Editor', {
  beforeEach() {
    fixture = document.getElementById('qunit-fixture');
    editorElement = document.createElement('div');
    editorElement.id = 'editor1';
    editorElement.className = 'editor';
    fixture.appendChild(editorElement);
  },

  afterEach() {
    if (editor) {
      editor.destroy();
    }
  }
});

test('can render an editor via dom node reference', (assert) => {
  editor = new Editor();
  editor.render(editorElement);
  assert.equal(editor.element, editorElement);
  assert.ok(editor.post);
  assert.equal(editor.post.sections.length, 1);
  assert.equal(editor.post.sections.head.tagName, 'p');
  assert.equal(editor.post.sections.head.markers.length, 0);
  assert.equal(editor.post.sections.head.text, '');
});

test('creating an editor with DOM node throws', (assert) => {
  assert.throws(function() {
    editor = new Editor(document.createElement('div'));
  }, /accepts an options object/);
});

test('rendering an editor without a class name adds appropriate class', (assert) => {
  editorElement.className = '';

  editor = new Editor();
  editor.render(editorElement);
  assert.equal(editor.element.className, EDITOR_ELEMENT_CLASS_NAME);
});

test('rendering an editor adds EDITOR_ELEMENT_CLASS_NAME if not there', (assert) => {
  editorElement.className = 'abc def';

  editor = new Editor();
  editor.render(editorElement);
  const hasClass = (className) => editor.element.classList.contains(className);
  assert.ok(hasClass(EDITOR_ELEMENT_CLASS_NAME), 'has editor el class name');
  assert.ok(hasClass('abc') && hasClass('def'), 'preserves existing class names');
});

test('editor fires lifecycle hooks', (assert) => {
  assert.expect(4);
  let didCallUpdatePost, didCallWillRender, didCallDidRender;
  editor = new Editor();
  editor.didUpdatePost(postEditor => {
    assert.ok(postEditor, 'Post editor provided');
    assert.ok(!didCallWillRender && !didCallDidRender,
              'didUpdatePost called before render hooks');
    didCallUpdatePost = true;
  });
  editor.willRender(() => {
    assert.ok(didCallUpdatePost && !didCallDidRender,
              'willRender called between didUpdatePost, didRender');
    didCallWillRender = true;
  });
  editor.didRender(() => {
    assert.ok(didCallUpdatePost && didCallWillRender,
              'didRender called last');
    didCallDidRender = true;
  });
  editor.render(editorElement);
});

test('editor fires lifecycle hooks for edit', (assert) => {
  assert.expect(4);
  editor = new Editor();
  editor.render(editorElement);

  let didCallUpdatePost, didCallWillRender, didCallDidRender;
  editor.didUpdatePost(postEditor => {
    assert.ok(postEditor, 'Post editor provided');
    assert.ok(!didCallWillRender && !didCallDidRender,
              'didUpdatePost called before render hooks');
    didCallUpdatePost = true;
  });
  editor.willRender(() => {
    assert.ok(didCallUpdatePost && !didCallDidRender,
              'willRender called between didUpdatePost, didRender');
    didCallWillRender = true;
  });
  editor.didRender(() => {
    assert.ok(didCallUpdatePost && didCallWillRender,
              'didRender called last');
    didCallDidRender = true;
  });

  editor.run(postEditor => {
    postEditor.removeSection(editor.post.sections.head);
  });
});

test('editor fires lifecycle hooks for noop edit', (assert) => {
  assert.expect(1);
  editor = new Editor();
  editor.render(editorElement);

  editor.didUpdatePost(postEditor => {
    assert.ok(postEditor, 'Post editor provided');
  });
  editor.willRender(() => {
    assert.ok(false, 'willRender should not be called');
  });
  editor.didRender(() => {
    assert.ok(false, 'didRender should not be called');
  });

  editor.run(() => {});
});

test('editor fires update event', (assert) => {
  assert.expect(2);
  let done = assert.async();

  editor = new Editor();
  editor.render(editorElement);
  editor.on('update', function(data) {
    assert.equal(this, editor);
    assert.equal(data.index, 99);
    done();
  });
  editor.trigger('update', { index: 99 });
});

test('editor parses and renders mobiledoc format', (assert) => {
  const mobiledoc = {
    version: MOBILEDOC_VERSION,
    sections: [
      [],
      [
        [1, normalizeTagName('p'), [
          [[], 0, 'hello world']
        ]]
      ]
    ]
  };
  editorElement.innerHTML = '<p>something here</p>';
  editor = new Editor({mobiledoc});
  editor.render(editorElement);

  assert.ok(editor.mobiledoc, 'editor has mobiledoc');
  assert.equal(editorElement.innerHTML,
               `<p>hello world</p>`);

  assert.deepEqual(editor.serialize(), mobiledoc,
                   'serialized editor === mobiledoc');
});

test('editor parses and renders html', (assert) => {
  editorElement.innerHTML = '<p>something here</p>';
  editor = new Editor({html: '<p>hello world</p>'});
  editor.render(editorElement);

  assert.equal(editorElement.innerHTML,
               `<p>hello world</p>`);
});

test('editor parses and renders DOM', (assert) => {
  editorElement.innerHTML = '<p>something here</p>';
  editor = new Editor({html: $('<p>hello world</p>')[0]});
  editor.render(editorElement);

  assert.equal(editorElement.innerHTML,
               `<p>hello world</p>`);
});

test('#detectMarkupInRange not found', (assert) => {
  const mobiledoc = {
    version: MOBILEDOC_VERSION,
    sections: [
      [],
      [
        [1, normalizeTagName('p'), [
          [[], 0, 'hello world']
        ]]
      ]
    ]
  };
  editor = new Editor({mobiledoc});
  editor.render(editorElement);

  let section = editor.post.sections.head;
  let range = Range.create(section, 0, section, section.text.length);
  let markup = editor.detectMarkupInRange(range, 'strong');
  assert.ok(!markup, 'selection is not strong');
});

test('#detectMarkupInRange matching bounds of marker', (assert) => {
  const mobiledoc = {
    version: MOBILEDOC_VERSION,
    sections: [
      [
        ['strong']
      ],
      [
        [1, normalizeTagName('p'), [
          [[0], 1, 'hello world']
        ]]
      ]
    ]
  };
  editor = new Editor({mobiledoc});
  editor.render(editorElement);

  let section = editor.post.sections.head;
  let range = Range.create(section, 0, section, section.text.length);
  let markup = editor.detectMarkupInRange(range, 'strong');
  assert.ok(markup, 'selection has markup');
  assert.equal(markup.tagName, 'strong', 'detected markup is strong');
});
