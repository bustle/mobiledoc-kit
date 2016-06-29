import PostEditor from 'mobiledoc-kit/editor/post';
import { Editor } from 'mobiledoc-kit';
import Helpers from '../../../test-helpers';
import Position from 'mobiledoc-kit/utils/cursor/position';

const { module, test } = Helpers;

let editor, editorElement, postEditor, renderedRange;
// see https://github.com/bustlelabs/mobiledoc-kit/issues/259
module('Unit: PostEditor: #insertPost', {
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

function buildEditorWithMobiledoc(builderFn) {
  let mobiledoc = Helpers.mobiledoc.build(builderFn);
  let unknownCardHandler = () => {};
  editor = new Editor({mobiledoc, unknownCardHandler});
  editor.render(editorElement);
  editor.selectRange = function(range) {
    renderedRange = range;
  };
  return editor;
}

test('in blank section replaces it', (assert) => {
  let toInsert, expected;
  Helpers.postAbstract.build(({post, listSection, listItem, marker}) => {
    toInsert = post([listSection('ul', [listItem([marker('abc')])])]);
    expected = post([listSection('ul', [listItem([marker('abc')])])]);
  });

  editor = buildEditorWithMobiledoc(({post, markupSection}) => {
    return post([markupSection()]);
  });

  let position = editor.post.sections.head.headPosition();
  postEditor = new PostEditor(editor);
  postEditor.insertPost(position, toInsert);
  postEditor.complete();

  assert.renderTreeIsEqual(editor._renderTree, expected);
  assert.postIsSimilar(editor.post, expected);
  assert.positionIsEqual(renderedRange.head,
                         editor.post.sections.head.items.tail.tailPosition(),
                        'cursor at end of pasted content');
});

test('in non-markerable at start inserts before', (assert) => {
  let toInsert, expected;
  Helpers.postAbstract.build(({post, cardSection, markupSection, marker}) => {
    toInsert = post([markupSection('p', [marker('abc')])]);
    expected = post([
      markupSection('p', [marker('abc')]),
      cardSection('my-card', {foo:'bar'})
    ]);
  });

  editor = buildEditorWithMobiledoc(({post, cardSection}) => {
    return post([cardSection('my-card', {foo:'bar'})]);
  });

  let position = editor.post.sections.head.headPosition();
  postEditor = new PostEditor(editor);
  postEditor.insertPost(position, toInsert);
  postEditor.complete();

  assert.renderTreeIsEqual(editor._renderTree, expected);
  assert.postIsSimilar(editor.post, expected);
  let expectedSection = editor.post.sections.head;
  assert.positionIsEqual(renderedRange.head,
                         expectedSection.tailPosition(),
                        'cursor at end of pasted');
});

test('in non-markerable at end inserts after', (assert) => {
  let toInsert, expected;
  Helpers.postAbstract.build(({post, cardSection, markupSection, marker}) => {
    toInsert = post([markupSection('p', [marker('abc')])]);
    expected = post([
      cardSection('my-card', {foo:'bar'}),
      markupSection('p', [marker('abc')])
    ]);
  });

  editor = buildEditorWithMobiledoc(({post, cardSection}) => {
    return post([cardSection('my-card', {foo:'bar'})]);
  });

  let position = editor.post.sections.head.tailPosition();
  postEditor = new PostEditor(editor);
  postEditor.insertPost(position, toInsert);
  postEditor.complete();

  assert.renderTreeIsEqual(editor._renderTree, expected);
  assert.postIsSimilar(editor.post, expected);
  let expectedSection = editor.post.sections.tail;
  assert.positionIsEqual(renderedRange.head,
                         expectedSection.tailPosition(),
                        'cursor at end of pasted');
});

test('in non-nested markerable at start and paste is single non-markerable', (assert) => {
  let toInsert, expected;
  Helpers.postAbstract.build(({post, cardSection, markupSection, marker}) => {
    toInsert = post([cardSection('my-card', {foo:'bar'})]);
    expected = post([
      cardSection('my-card', {foo:'bar'}),
      markupSection('p', [marker('abc')])
    ]);
  });

  editor = buildEditorWithMobiledoc(({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abc')])]);
  });

  let position = editor.post.sections.head.headPosition();
  postEditor = new PostEditor(editor);
  postEditor.insertPost(position, toInsert);
  postEditor.complete();

  assert.renderTreeIsEqual(editor._renderTree, expected);
  assert.postIsSimilar(editor.post, expected);
  let expectedSection = editor.post.sections.head;
  assert.positionIsEqual(renderedRange.head,
                         expectedSection.tailPosition(),
                         'cursor at end of pasted');
});

test('in non-nested markerable at end and paste is single non-markerable', (assert) => {
  let toInsert, expected;
  Helpers.postAbstract.build(({post, cardSection, markupSection, marker}) => {
    toInsert = post([cardSection('my-card', {foo:'bar'})]);
    expected = post([
      markupSection('p', [marker('abc')]),
      cardSection('my-card', {foo:'bar'})
    ]);
  });

  editor = buildEditorWithMobiledoc(({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abc')])]);
  });

  let position = editor.post.sections.head.tailPosition();
  postEditor = new PostEditor(editor);
  postEditor.insertPost(position, toInsert);
  postEditor.complete();

  assert.renderTreeIsEqual(editor._renderTree, expected);
  assert.postIsSimilar(editor.post, expected);
  let expectedSection = editor.post.sections.tail; // card
  assert.positionIsEqual(renderedRange.head,
                         expectedSection.tailPosition(),
                         'cursor at end of pasted');
});

test('in non-nested markerable at middle and paste is single non-markerable', (assert) => {
  let toInsert, expected;
  Helpers.postAbstract.build(({post, cardSection, markupSection, marker}) => {
    toInsert = post([cardSection('my-card', {foo:'bar'})]);
    expected = post([
      markupSection('p', [marker('ab')]),
      cardSection('my-card', {foo:'bar'}),
      markupSection('p', [marker('c')])
    ]);
  });

  editor = buildEditorWithMobiledoc(({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abc')])]);
  });

  let position = new Position(editor.post.sections.head, 'ab'.length);
  postEditor = new PostEditor(editor);
  postEditor.insertPost(position, toInsert);
  postEditor.complete();

  assert.renderTreeIsEqual(editor._renderTree, expected);
  assert.postIsSimilar(editor.post, expected);
  let expectedSection = editor.post.sections.objectAt(1);
  assert.positionIsEqual(renderedRange.head,
                         expectedSection.tailPosition(),
                         'cursor at end of pasted');
});

test('in non-nested markerable at start and paste starts with non-markerable and ends with markerable', (assert) => {
  let toInsert, expected;
  Helpers.postAbstract.build(({post, cardSection, markupSection, marker}) => {
    toInsert = post([
      cardSection('my-card', {foo:'bar'}),
      markupSection('p', [marker('def')])
    ]);
    expected = post([
      cardSection('my-card', {foo:'bar'}),
      markupSection('p', [marker('def')]),
      markupSection('p', [marker('abc')])
    ]);
  });

  editor = buildEditorWithMobiledoc(({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abc')])]);
  });

  let position = editor.post.sections.head.headPosition();
  postEditor = new PostEditor(editor);
  postEditor.insertPost(position, toInsert);
  postEditor.complete();

  assert.renderTreeIsEqual(editor._renderTree, expected);
  assert.postIsSimilar(editor.post, expected);
  let expectedSection = editor.post.sections.objectAt(1);
  assert.positionIsEqual(renderedRange.head,
                         expectedSection.tailPosition(),
                         'cursor at end of pasted');
});

test('in non-nested markerable at middle and paste starts with non-markerable and ends with markerable', (assert) => {
  let toInsert, expected;
  Helpers.postAbstract.build(({post, cardSection, markupSection, marker}) => {
    toInsert = post([
      cardSection('my-card', {foo:'bar'}),
      markupSection('p', [marker('def')])
    ]);
    expected = post([
      markupSection('p', [marker('ab')]),
      cardSection('my-card', {foo:'bar'}),
      markupSection('p', [marker('def')]),
      markupSection('p', [marker('c')])
    ]);
  });

  editor = buildEditorWithMobiledoc(({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abc')])]);
  });

  let position = new Position(editor.post.sections.head, 'ab'.length);
  postEditor = new PostEditor(editor);
  postEditor.insertPost(position, toInsert);
  postEditor.complete();

  assert.renderTreeIsEqual(editor._renderTree, expected);
  assert.postIsSimilar(editor.post, expected);
  let expectedSection = editor.post.sections.objectAt(2);
  assert.positionIsEqual(renderedRange.head,
                         new Position(expectedSection, 'def'.length),
                         'cursor at end of pasted');
});

test('in non-nested markerable at end and paste starts with non-markerable and ends with markerable', (assert) => {
  let toInsert, expected;
  Helpers.postAbstract.build(({post, cardSection, markupSection, marker}) => {
    toInsert = post([
      cardSection('my-card', {foo:'bar'}),
      markupSection('p', [marker('def')])
    ]);
    expected = post([
      markupSection('p', [marker('abc')]),
      cardSection('my-card', {foo:'bar'}),
      markupSection('p', [marker('def')])
    ]);
  });

  editor = buildEditorWithMobiledoc(({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abc')])]);
  });

  let position = editor.post.sections.head.tailPosition();
  postEditor = new PostEditor(editor);
  postEditor.insertPost(position, toInsert);
  postEditor.complete();

  assert.renderTreeIsEqual(editor._renderTree, expected);
  assert.postIsSimilar(editor.post, expected);
  let expectedSection = editor.post.sections.tail;
  assert.positionIsEqual(renderedRange.head,
                         new Position(expectedSection, 'def'.length),
                         'cursor at end of pasted');
});

test('in non-nested markerable at start and paste is single non-nested markerable', (assert) => {
  let toInsert, expected;
  Helpers.postAbstract.build(({post, cardSection, markupSection, marker}) => {
    toInsert = post([markupSection('p', [marker('123')])]);
    expected = post([markupSection('p', [marker('123abc')])]);
  });

  editor = buildEditorWithMobiledoc(({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abc')])]);
  });

  let position = editor.post.sections.head.headPosition();
  postEditor = new PostEditor(editor);
  postEditor.insertPost(position, toInsert);
  postEditor.complete();

  assert.renderTreeIsEqual(editor._renderTree, expected);
  assert.postIsSimilar(editor.post, expected);
  let expectedSection = editor.post.sections.head;
  assert.positionIsEqual(renderedRange.head,
                         new Position(expectedSection, '123'.length),
                         'cursor at end of pasted');
});

test('in non-nested markerable at middle and paste is single non-nested markerable', (assert) => {
  let toInsert, expected;
  Helpers.postAbstract.build(({post, cardSection, markupSection, marker}) => {
    toInsert = post([markupSection('p', [marker('123')])]);
    expected = post([markupSection('p', [marker('ab123c')])]);
  });

  editor = buildEditorWithMobiledoc(({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abc')])]);
  });

  let position = new Position(editor.post.sections.head, 'ab'.length);
  postEditor = new PostEditor(editor);
  postEditor.insertPost(position, toInsert);
  postEditor.complete();

  assert.renderTreeIsEqual(editor._renderTree, expected);
  assert.postIsSimilar(editor.post, expected);
  let expectedSection = editor.post.sections.head;
  assert.positionIsEqual(renderedRange.head,
                         new Position(expectedSection, 'ab123'.length),
                         'cursor at end of pasted');
});

test('in non-nested markerable at end and paste is single non-nested markerable', (assert) => {
  let toInsert, expected;
  Helpers.postAbstract.build(({post, cardSection, markupSection, marker}) => {
    toInsert = post([markupSection('p', [marker('123')])]);
    expected = post([markupSection('p', [marker('abc123')])]);
  });

  editor = buildEditorWithMobiledoc(({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abc')])]);
  });

  let position = editor.post.sections.head.tailPosition();
  postEditor = new PostEditor(editor);
  postEditor.insertPost(position, toInsert);
  postEditor.complete();

  assert.renderTreeIsEqual(editor._renderTree, expected);
  assert.postIsSimilar(editor.post, expected);
  let expectedSection = editor.post.sections.head;
  assert.positionIsEqual(renderedRange.head,
                         expectedSection.tailPosition(),
                         'cursor at end of pasted');
});

test('in non-nested markerable at start and paste is list with 1 item and no more sections', (assert) => {
  let toInsert, expected;
  Helpers.postAbstract.build(
    ({post, cardSection, markupSection, listSection, listItem, marker}) => {
    toInsert = post([listSection('ul', [listItem([marker('123')])])]);
    expected = post([markupSection('p', [marker('123abc')])]);
  });

  editor = buildEditorWithMobiledoc(({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abc')])]);
  });

  let position = editor.post.sections.head.headPosition();
  postEditor = new PostEditor(editor);
  postEditor.insertPost(position, toInsert);
  postEditor.complete();

  assert.renderTreeIsEqual(editor._renderTree, expected);
  assert.postIsSimilar(editor.post, expected);
  let expectedSection = editor.post.sections.head;
  assert.positionIsEqual(renderedRange.head,
                         new Position(expectedSection, '123'.length),
                         'cursor at end of pasted');
});

test('in non-nested markerable at middle and paste is list with 1 item and no more sections', (assert) => {
  let toInsert, expected;
  Helpers.postAbstract.build(
    ({post, cardSection, markupSection, listSection, listItem, marker}) => {
    toInsert = post([listSection('ul', [listItem([marker('123')])])]);
    expected = post([markupSection('p', [marker('ab123c')])]);
  });

  editor = buildEditorWithMobiledoc(({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abc')])]);
  });

  let position = new Position(editor.post.sections.head, 'ab'.length);
  postEditor = new PostEditor(editor);
  postEditor.insertPost(position, toInsert);
  postEditor.complete();

  assert.renderTreeIsEqual(editor._renderTree, expected);
  assert.postIsSimilar(editor.post, expected);
  let expectedSection = editor.post.sections.head;
  assert.positionIsEqual(renderedRange.head,
                         new Position(expectedSection, 'ab123'.length),
                         'cursor at end of pasted');
});

test('in non-nested markerable at end and paste is list with 1 item and no more sections', (assert) => {
  let toInsert, expected;
  Helpers.postAbstract.build(
    ({post, cardSection, markupSection, listSection, listItem, marker}) => {
    toInsert = post([listSection('ul', [listItem([marker('123')])])]);
    expected = post([markupSection('p', [marker('abc123')])]);
  });

  editor = buildEditorWithMobiledoc(({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abc')])]);
  });

  let position = editor.post.sections.head.tailPosition();
  postEditor = new PostEditor(editor);
  postEditor.insertPost(position, toInsert);
  postEditor.complete();

  assert.renderTreeIsEqual(editor._renderTree, expected);
  assert.postIsSimilar(editor.post, expected);
  let expectedSection = editor.post.sections.head;
  assert.positionIsEqual(renderedRange.head,
                         expectedSection.tailPosition(),
                         'cursor at end of pasted');
});

test('in non-nested markerable at start and paste is list with 1 item and has more sections', (assert) => {
  let toInsert, expected;
  Helpers.postAbstract.build(
    ({post, cardSection, markupSection, listSection, listItem, marker}) => {
    toInsert = post([
      listSection('ul', [listItem([marker('123')])]),
      markupSection('p', [marker('def')]),
      markupSection('p', [marker('ghi')])
    ]);
    expected = post([
      markupSection('p', [marker('123')]),
      markupSection('p', [marker('def')]),
      markupSection('p', [marker('ghi')]),
      markupSection('p', [marker('abc')])
    ]);
  });

  editor = buildEditorWithMobiledoc(({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abc')])]);
  });

  let position = editor.post.sections.head.headPosition();
  postEditor = new PostEditor(editor);
  postEditor.insertPost(position, toInsert);
  postEditor.complete();

  assert.renderTreeIsEqual(editor._renderTree, expected);
  assert.postIsSimilar(editor.post, expected);
  let expectedSection = editor.post.sections.objectAt(2);
  assert.positionIsEqual(renderedRange.head,
                         expectedSection.tailPosition(),
                         'cursor at end of pasted');
});

test('in non-nested markerable at middle and paste is list with 1 item and has more sections', (assert) => {
  let toInsert, expected;
  Helpers.postAbstract.build(
    ({post, cardSection, markupSection, listSection, listItem, marker}) => {
    toInsert = post([
      listSection('ul', [listItem([marker('123')])]),
      markupSection('p', [marker('def')]),
      markupSection('p', [marker('ghi')])
    ]);
    expected = post([
      markupSection('p', [marker('ab123')]),
      markupSection('p', [marker('def')]),
      markupSection('p', [marker('ghi')]),
      markupSection('p', [marker('c')])
    ]);
  });

  editor = buildEditorWithMobiledoc(({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abc')])]);
  });

  let position = new Position(editor.post.sections.head, 'ab'.length);
  postEditor = new PostEditor(editor);
  postEditor.insertPost(position, toInsert);
  postEditor.complete();

  assert.renderTreeIsEqual(editor._renderTree, expected);
  assert.postIsSimilar(editor.post, expected);
  let expectedSection = editor.post.sections.objectAt(2);
  assert.positionIsEqual(renderedRange.head,
                         expectedSection.tailPosition(),
                         'cursor at end of pasted');
});

test('in non-nested markerable at end and paste is list with 1 item and has more sections', (assert) => {
  let toInsert, expected;
  Helpers.postAbstract.build(
    ({post, cardSection, markupSection, listSection, listItem, marker}) => {
    toInsert = post([
      listSection('ul', [listItem([marker('123')])]),
      markupSection('p', [marker('def')]),
      markupSection('p', [marker('ghi')])
    ]);
    expected = post([
      markupSection('p', [marker('abc123')]),
      markupSection('p', [marker('def')]),
      markupSection('p', [marker('ghi')])
    ]);
  });

  editor = buildEditorWithMobiledoc(({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abc')])]);
  });

  let position = editor.post.sections.head.tailPosition();
  postEditor = new PostEditor(editor);
  postEditor.insertPost(position, toInsert);
  postEditor.complete();

  assert.renderTreeIsEqual(editor._renderTree, expected);
  assert.postIsSimilar(editor.post, expected);
  let expectedSection = editor.post.sections.tail;
  assert.positionIsEqual(renderedRange.head,
                         expectedSection.tailPosition(),
                         'cursor at end of pasted');
});

test('in non-nested markerable at start and paste is only list with > 1 item', (assert) => {
  let toInsert, expected;
  Helpers.postAbstract.build(
    ({post, cardSection, markupSection, listSection, listItem, marker}) => {
    toInsert = post([
      listSection('ul', [
        listItem([marker('123')]),
        listItem([marker('456')])
      ])
    ]);
    expected = post([
      markupSection('p', [marker('123')]),
      listSection('ul', [listItem([marker('456')])]),
      markupSection('p', [marker('abc')])
    ]);
  });

  editor = buildEditorWithMobiledoc(({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abc')])]);
  });

  let position = editor.post.sections.head.headPosition();
  postEditor = new PostEditor(editor);
  postEditor.insertPost(position, toInsert);
  postEditor.complete();

  assert.renderTreeIsEqual(editor._renderTree, expected);
  assert.postIsSimilar(editor.post, expected);
  let expectedSection = editor.post.sections.objectAt(1);
  assert.positionIsEqual(renderedRange.head,
                         expectedSection.tailPosition(),
                         'cursor at end of pasted');
});

test('in non-nested markerable at end and paste is only list with > 1 item', (assert) => {
  let toInsert, expected;
  Helpers.postAbstract.build(
    ({post, cardSection, markupSection, listSection, listItem, marker}) => {
    toInsert = post([
      listSection('ul', [
        listItem([marker('123')]),
        listItem([marker('456')])
      ])
    ]);
    expected = post([
      markupSection('p', [marker('abc123')]),
      listSection('ul', [listItem([marker('456')])])
    ]);
  });

  editor = buildEditorWithMobiledoc(({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abc')])]);
  });

  let position = editor.post.sections.head.tailPosition();
  postEditor = new PostEditor(editor);
  postEditor.insertPost(position, toInsert);
  postEditor.complete();

  assert.renderTreeIsEqual(editor._renderTree, expected);
  assert.postIsSimilar(editor.post, expected);
  let expectedSection = editor.post.sections.tail;
  assert.positionIsEqual(renderedRange.head,
                         expectedSection.tailPosition(),
                         'cursor at end of pasted');
});

test('in non-nested markerable at middle and paste is only list with > 1 item', (assert) => {
  let toInsert, expected;
  Helpers.postAbstract.build(
    ({post, cardSection, markupSection, listSection, listItem, marker}) => {
    toInsert = post([
      listSection('ul', [
        listItem([marker('123')]),
        listItem([marker('456')])
      ])
    ]);
    expected = post([
      markupSection('p', [marker('ab123')]),
      listSection('ul', [listItem([marker('456')])]),
      markupSection('p', [marker('c')])
    ]);
  });

  editor = buildEditorWithMobiledoc(({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abc')])]);
  });

  let position = new Position(editor.post.sections.head, 'ab'.length);
  postEditor = new PostEditor(editor);
  postEditor.insertPost(position, toInsert);
  postEditor.complete();

  assert.renderTreeIsEqual(editor._renderTree, expected);
  assert.postIsSimilar(editor.post, expected);
  let expectedSection = editor.post.sections.objectAt(1);
  assert.positionIsEqual(renderedRange.head,
                         expectedSection.tailPosition(),
                         'cursor at end of pasted');
});

test('in nested markerable at start and paste is single non-nested markerable', (assert) => {
  let toInsert, expected;
  Helpers.postAbstract.build(
    ({post, cardSection, markupSection, listSection, listItem, marker}) => {
    toInsert = post([markupSection('p', [marker('123')])]);
    expected = post([
      listSection('ul', [listItem([marker('123abc')])])
    ]);
  });

  editor = buildEditorWithMobiledoc(({post, listSection, listItem, marker}) => {
    return post([listSection('ul', [listItem([marker('abc')])])]);
  });

  let position = editor.post.sections.head.headPosition();
  postEditor = new PostEditor(editor);
  postEditor.insertPost(position, toInsert);
  postEditor.complete();

  assert.renderTreeIsEqual(editor._renderTree, expected);
  assert.postIsSimilar(editor.post, expected);
  let expectedSection = editor.post.sections.head.items.head;
  assert.positionIsEqual(renderedRange.head,
                         new Position(expectedSection, '123'.length),
                         'cursor at end of pasted content');
});

test('in nested markerable at end and paste is single non-nested markerable', (assert) => {
  let toInsert, expected;
  Helpers.postAbstract.build(
    ({post, cardSection, markupSection, listSection, listItem, marker}) => {
    toInsert = post([markupSection('p', [marker('123')])]);
    expected = post([
      listSection('ul', [listItem([marker('abc123')])])
    ]);
  });

  editor = buildEditorWithMobiledoc(({post, listSection, listItem, marker}) => {
    return post([listSection('ul', [listItem([marker('abc')])])]);
  });

  let position = editor.post.sections.head.tailPosition();
  postEditor = new PostEditor(editor);
  postEditor.insertPost(position, toInsert);
  postEditor.complete();

  assert.renderTreeIsEqual(editor._renderTree, expected);
  assert.postIsSimilar(editor.post, expected);
  let expectedSection = editor.post.sections.head.items.head;
  assert.positionIsEqual(renderedRange.head,
                         expectedSection.tailPosition(),
                         'cursor at end of pasted content');
});

test('in nested markerable at middle and paste is single non-nested markerable', (assert) => {
  let toInsert, expected;
  Helpers.postAbstract.build(
    ({post, cardSection, markupSection, listSection, listItem, marker}) => {
    toInsert = post([markupSection('p', [marker('123')])]);
    expected = post([
      listSection('ul', [listItem([marker('ab123c')])])
    ]);
  });

  editor = buildEditorWithMobiledoc(({post, listSection, listItem, marker}) => {
    return post([listSection('ul', [listItem([marker('abc')])])]);
  });

  let position = new Position(editor.post.sections.head.items.head, 'ab'.length);
  postEditor = new PostEditor(editor);
  postEditor.insertPost(position, toInsert);
  postEditor.complete();

  assert.renderTreeIsEqual(editor._renderTree, expected);
  assert.postIsSimilar(editor.post, expected);
  let expectedSection = editor.post.sections.head.items.head;
  assert.positionIsEqual(renderedRange.head,
                         new Position(expectedSection, 'ab123'.length),
                         'cursor at end of pasted content');
});

test('in nested markerable at start and paste is list with 1 item', (assert) => {
  let toInsert, expected;
  Helpers.postAbstract.build(
    ({post, cardSection, markupSection, listSection, listItem, marker}) => {
    toInsert = post([listSection('ul', [listItem([marker('123')])])]);
    expected = post([listSection('ul', [listItem([marker('123abc')])])]);
  });

  editor = buildEditorWithMobiledoc(({post, listSection, listItem, marker}) => {
    return post([listSection('ul', [listItem([marker('abc')])])]);
  });

  let position = editor.post.sections.head.headPosition();
  postEditor = new PostEditor(editor);
  postEditor.insertPost(position, toInsert);
  postEditor.complete();

  assert.renderTreeIsEqual(editor._renderTree, expected);
  assert.postIsSimilar(editor.post, expected);
  let expectedSection = editor.post.sections.head.items.head;
  assert.positionIsEqual(renderedRange.head,
                         new Position(expectedSection, '123'.length),
                         'cursor at end of pasted content');
});

test('in nested markerable at end and paste is list with 1 item', (assert) => {
  let toInsert, expected;
  Helpers.postAbstract.build(
    ({post, cardSection, markupSection, listSection, listItem, marker}) => {
    toInsert = post([listSection('ul', [listItem([marker('123')])])]);
    expected = post([listSection('ul', [listItem([marker('abc123')])])]);
  });

  editor = buildEditorWithMobiledoc(({post, listSection, listItem, marker}) => {
    return post([listSection('ul', [listItem([marker('abc')])])]);
  });

  let position = editor.post.sections.head.tailPosition();
  postEditor = new PostEditor(editor);
  postEditor.insertPost(position, toInsert);
  postEditor.complete();

  assert.renderTreeIsEqual(editor._renderTree, expected);
  assert.postIsSimilar(editor.post, expected);
  let expectedSection = editor.post.sections.head.items.head;
  assert.positionIsEqual(renderedRange.head,
                         expectedSection.tailPosition(),
                         'cursor at end of pasted content');
});

test('in nested markerable at middle and paste is list with 1 item', (assert) => {
  let toInsert, expected;
  Helpers.postAbstract.build(
    ({post, cardSection, markupSection, listSection, listItem, marker}) => {
    toInsert = post([listSection('ul', [listItem([marker('123')])])]);
    expected = post([listSection('ul', [listItem([marker('ab123c')])])]);
  });

  editor = buildEditorWithMobiledoc(({post, listSection, listItem, marker}) => {
    return post([listSection('ul', [listItem([marker('abc')])])]);
  });

  let position = new Position(editor.post.sections.head.items.head, 'ab'.length);
  postEditor = new PostEditor(editor);
  postEditor.insertPost(position, toInsert);
  postEditor.complete();

  assert.renderTreeIsEqual(editor._renderTree, expected);
  assert.postIsSimilar(editor.post, expected);
  let expectedSection = editor.post.sections.head.items.head;
  assert.positionIsEqual(renderedRange.head,
                         new Position(expectedSection, 'ab123'.length),
                         'cursor at end of pasted content');
});

test('in nested markerable at start and paste is list with > 1 item', (assert) => {
  let toInsert, expected;
  Helpers.postAbstract.build(
    ({post, cardSection, markupSection, listSection, listItem, marker}) => {
    toInsert = post([listSection('ul', [listItem([marker('123')]), listItem([marker('456')])])]);
    expected = post([listSection('ul', [
      listItem([marker('123')]), listItem([marker('456')]), listItem([marker('abc')])])
    ]);
  });

  editor = buildEditorWithMobiledoc(({post, listSection, listItem, marker}) => {
    return post([listSection('ul', [listItem([marker('abc')])])]);
  });

  let position = editor.post.sections.head.headPosition();
  postEditor = new PostEditor(editor);
  postEditor.insertPost(position, toInsert);
  postEditor.complete();

  assert.renderTreeIsEqual(editor._renderTree, expected);
  assert.postIsSimilar(editor.post, expected);
  let expectedSection = editor.post.sections.head.items.objectAt(1);
  assert.positionIsEqual(renderedRange.head,
                         expectedSection.tailPosition(),
                         'cursor at end of pasted');
});

test('in nested markerable at end and paste is list with > 1 item', (assert) => {
  let toInsert, expected;
  Helpers.postAbstract.build(
    ({post, cardSection, markupSection, listSection, listItem, marker}) => {
    toInsert = post([listSection('ul', [listItem([marker('123')]), listItem([marker('456')])])]);
    expected = post([listSection('ul', [listItem([marker('abc123')]), listItem([marker('456')])])]);
  });

  editor = buildEditorWithMobiledoc(({post, listSection, listItem, marker}) => {
    return post([listSection('ul', [listItem([marker('abc')])])]);
  });

  let position = editor.post.sections.head.tailPosition();
  postEditor = new PostEditor(editor);
  postEditor.insertPost(position, toInsert);
  postEditor.complete();

  // FIXME is this the correct expected position?
  assert.renderTreeIsEqual(editor._renderTree, expected);
  assert.postIsSimilar(editor.post, expected);
  let expectedSection = editor.post.sections.head.items.tail;
  assert.positionIsEqual(renderedRange.head,
                         expectedSection.tailPosition(),
                         'cursor at end of pasted');
});

test('in nested markerable at middle and paste is list with > 1 item', (assert) => {
  let toInsert, expected;
  Helpers.postAbstract.build(
    ({post, cardSection, markupSection, listSection, listItem, marker}) => {
    toInsert = post([listSection('ul', [listItem([marker('123')]), listItem([marker('456')])])]);
    expected = post([listSection('ul', [
      listItem([marker('ab123')]), listItem([marker('456')]), listItem([marker('c')])])
    ]);
  });

  editor = buildEditorWithMobiledoc(({post, listSection, listItem, marker}) => {
    return post([listSection('ul', [listItem([marker('abc')])])]);
  });

  let position = new Position(editor.post.sections.head.items.head, 'ab'.length);
  postEditor = new PostEditor(editor);
  postEditor.insertPost(position, toInsert);
  postEditor.complete();

  assert.renderTreeIsEqual(editor._renderTree, expected);
  assert.postIsSimilar(editor.post, expected);
  let expectedSection = editor.post.sections.head.items.objectAt(1);
  assert.positionIsEqual(renderedRange.head,
                         expectedSection.tailPosition(),
                         'cursor at end of pasted');
});

test('in nested markerable at start and paste is list with 1 item and more sections', (assert) => {
  let toInsert, expected;
  Helpers.postAbstract.build(
    ({post, cardSection, markupSection, listSection, listItem, marker}) => {
    toInsert = post([
      listSection('ul', [listItem([marker('123')])]),
      markupSection('p', [marker('456')])
    ]);
    expected = post([
      listSection('ul', [listItem([marker('123')])]),
      markupSection('p', [marker('456')]),
      listSection('ul', [listItem([marker('abc')])])
    ]);
  });

  editor = buildEditorWithMobiledoc(({post, listSection, listItem, marker}) => {
    return post([listSection('ul', [listItem([marker('abc')])])]);
  });

  let position = editor.post.headPosition();
  postEditor = new PostEditor(editor);
  postEditor.insertPost(position, toInsert);
  postEditor.complete();

  assert.renderTreeIsEqual(editor._renderTree, expected);
  assert.postIsSimilar(editor.post, expected);
  let expectedSection = editor.post.sections.objectAt(1);
  assert.positionIsEqual(renderedRange.head,
                         expectedSection.tailPosition(),
                         'cursor at end of pasted');
});

test('in blank nested markerable (1 item in list) and paste is non-markerable', (assert) => {
  let toInsert, expected;
  Helpers.postAbstract.build(
    ({post, cardSection, listSection, listItem}) => {
    toInsert = post([
      cardSection('the-card', {foo: 'bar'})
    ]);
    expected = post([
      listSection('ul', [listItem()]),
      cardSection('the-card', {foo: 'bar'})
    ]);
  });

  editor = buildEditorWithMobiledoc(({post, listSection, listItem}) => {
    return post([listSection('ul', [listItem()])]);
  });

  let position = editor.post.sections.head.headPosition();
  postEditor = new PostEditor(editor);
  postEditor.insertPost(position, toInsert);
  postEditor.complete();

  assert.renderTreeIsEqual(editor._renderTree, expected);
  assert.postIsSimilar(editor.post, expected);
  let expectedSection = editor.post.sections.tail;
  assert.positionIsEqual(renderedRange.head,
                         expectedSection.tailPosition(),
                         'cursor at end of pasted');
});

test('in nested markerable at end with multiple items and paste is non-markerable', (assert) => {
  let toInsert, expected;
  Helpers.postAbstract.build(
    ({post, cardSection, listSection, listItem, marker}) => {
    toInsert = post([
      cardSection('the-card', {foo: 'bar'})
    ]);
    expected = post([
      listSection('ul', [listItem([marker('123')])]),
      cardSection('the-card', {foo: 'bar'}),
      listSection('ul', [listItem([marker('abc')])])
    ]);
  });

  editor = buildEditorWithMobiledoc(({post, listSection, listItem, marker}) => {
    return post([listSection('ul', [listItem([marker('123')]), listItem([marker('abc')])])]);
  });

  let position = editor.post.sections.head.items.head.tailPosition();
  postEditor = new PostEditor(editor);
  postEditor.insertPost(position, toInsert);
  postEditor.complete();

  assert.postIsSimilar(editor.post, expected);
  assert.renderTreeIsEqual(editor._renderTree, expected);
  let expectedSection = editor.post.sections.objectAt(1);
  assert.positionIsEqual(renderedRange.head,
                         expectedSection.tailPosition(),
                         'cursor at end of pasted');
});

test('in nested markerable at middle with multiple items and paste is non-markerable', (assert) => {
  let toInsert, expected;
  Helpers.postAbstract.build(
    ({post, cardSection, listSection, listItem, marker}) => {
    toInsert = post([
      cardSection('the-card', {foo: 'bar'})
    ]);
    expected = post([
      listSection('ul', [listItem([marker('ab')])]),
      cardSection('the-card', {foo: 'bar'}),
      listSection('ul', [listItem([marker('c')]), listItem([marker('def')])])
    ]);
  });

  editor = buildEditorWithMobiledoc(({post, listSection, listItem, marker}) => {
    return post([listSection('ul', [listItem([marker('abc')]), listItem([marker('def')])])]);
  });

  let position = new Position(editor.post.sections.head.items.head,
                              'ab'.length);
  postEditor = new PostEditor(editor);
  postEditor.insertPost(position, toInsert);
  postEditor.complete();

  assert.postIsSimilar(editor.post, expected);
  assert.renderTreeIsEqual(editor._renderTree, expected);
  let expectedSection = editor.post.sections.objectAt(1);
  assert.positionIsEqual(renderedRange.head,
                         expectedSection.tailPosition(),
                         'cursor at end of pasted');
});
