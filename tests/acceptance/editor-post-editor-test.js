import { Editor } from 'mobiledoc-kit';
import Helpers from '../test-helpers';
import Range from 'mobiledoc-kit/utils/cursor/range';

const { module, test } = Helpers;

let editor, editorElement;

module('Acceptance: Editor - PostEditor', {
  beforeEach() {
    editorElement = $('#editor')[0];
  },
  afterEach() {
    if (editor) { editor.destroy(); }
  }
});

test('#insertSectionAtEnd inserts the section at the end', (assert) => {
  let newSection;
  const mobiledoc = Helpers.mobiledoc.build(({post, markupSection, marker}) => {
    newSection = markupSection('p', [marker('123')]);
    return post([markupSection('p', [marker('abc')])]);
  });
  editor = new Editor({mobiledoc});
  editor.render(editorElement);

  //precond
  assert.hasElement('#editor p:contains(abc)');
  assert.hasNoElement('#editor p:contains(123)');

  editor.run(postEditor => postEditor.insertSectionAtEnd(newSection));
  assert.hasElement('#editor p:eq(1):contains(123)', 'new section added at end');
});

test('#insertSection inserts after the cursor active section', (assert) => {
  let newSection;
  const mobiledoc = Helpers.mobiledoc.build(({post, markupSection, marker}) => {
    newSection = markupSection('p', [marker('123')]);
    return post([
      markupSection('p', [marker('abc')]),
      markupSection('p', [marker('def')])
    ]);
  });
  editor = new Editor({mobiledoc});
  editor.render(editorElement);

  //precond
  assert.hasElement('#editor p:eq(0):contains(abc)');
  assert.hasElement('#editor p:eq(1):contains(def)');
  assert.hasNoElement('#editor p:contains(123)');

  Helpers.dom.selectText(editor ,'b', editorElement);

  editor.run(postEditor => postEditor.insertSection(newSection));
  assert.hasElement('#editor p:eq(0):contains(abc)', 'still has 1st section');
  assert.hasElement('#editor p:eq(1):contains(123)',
                    'new section added after active section');
  assert.hasElement('#editor p:eq(2):contains(def)', '2nd section -> 3rd spot');
});

test('#insertSection inserts at end when no active cursor section', (assert) => {
  let newSection;
  editor = Helpers.mobiledoc.renderInto(editorElement, ({post, markupSection, marker}) => {
    newSection = markupSection('p', [marker('123')]);
    return post([
      markupSection('p', [marker('abc')]),
      markupSection('p', [marker('def')])
    ]);
  }, {autofocus: false});

  //precond
  assert.ok(!editor.hasCursor(), 'editor has no cursor');
  assert.ok(editor.range.isBlank, 'editor has no cursor');
  assert.hasElement('#editor p:eq(0):contains(abc)');
  assert.hasElement('#editor p:eq(1):contains(def)');
  assert.hasNoElement('#editor p:contains(123)');

  Helpers.dom.clearSelection();
  editor.run(postEditor => postEditor.insertSection(newSection));
  assert.hasElement('#editor p:eq(0):contains(abc)', 'still has 1st section');
  assert.hasElement('#editor p:eq(2):contains(123)', 'new section added at end');
  assert.hasElement('#editor p:eq(1):contains(def)', '2nd section -> same spot');
});

test('#insertSection can insert card, render it in display mode', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abc')])]);
  });

  let displayedCard, editedCard;
  let cards = [{
    name: 'sample-card',
    type: 'dom',
    render() { displayedCard = true; },
    edit() { editedCard = true; }
  }];

  editor = new Editor({mobiledoc, cards});
  editor.render(editorElement);

  editor.run(postEditor => {
    let cardSection = postEditor.builder.createCardSection('sample-card');
    postEditor.insertSection(cardSection);
  });

  assert.ok(displayedCard, 'rendered card in display mode');
});

test('#insertSection inserts card, can render it in edit mode using #editCard', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abc')])]);
  });

  let displayedCard, editedCard;
  let cards = [{
    name: 'sample-card',
    type: 'dom',
    render() { displayedCard = true; },
    edit() { editedCard = true; }
  }];

  editor = new Editor({mobiledoc, cards});
  editor.render(editorElement);

  editor.run(postEditor => {
    let cardSection = postEditor.builder.createCardSection('sample-card');
    postEditor.insertSection(cardSection);
    editor.editCard(cardSection);
  });

  assert.ok(editedCard, 'rendered card in edit mode');
  assert.ok(!displayedCard, 'did not render in display mode');
});

test('after inserting a section, can use editor#editCard to switch it to edit mode', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(({post, cardSection}) => {
    return post([cardSection('sample-card')]);
  });

  let displayedCard, editedCard;
  let cards = [{
    name: 'sample-card',
    type: 'dom',
    render() { displayedCard = true; },
    edit() { editedCard = true; }
  }];

  editor = new Editor({mobiledoc, cards});
  editor.render(editorElement);
  assert.ok(displayedCard, 'called display#setup');
  assert.ok(!editedCard, 'did not call edit#setup yet');

  displayedCard = false;
  const card = editor.post.sections.head;
  editor.editCard(card);

  assert.ok(editedCard, 'called edit#setup');
  assert.ok(!displayedCard, 'did not call display#setup again');
});

test('can call editor#displayCard to switch card into display mode', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(({post, cardSection}) => {
    return post([cardSection('sample-card')]);
  });

  let displayedCard, editedCard;
  let cards = [{
    name: 'sample-card',
    type: 'dom',
    render() { displayedCard = true; },
    edit() { editedCard = true; }
  }];

  editor = new Editor({mobiledoc, cards});
  editor.render(editorElement);

  assert.ok(displayedCard, 'precond - called display#setup');
  assert.ok(!editedCard, 'precond - did not call edit#setup yet');

  displayedCard = false;
  const card = editor.post.sections.head;
  editor.editCard(card);

  assert.ok(!displayedCard, 'card not in display mode');
  assert.ok(editedCard, 'card in edit mode');

  editedCard = false;

  editor.displayCard(card);

  assert.ok(displayedCard, 'card back in display mode');
  assert.ok(!editedCard, 'card not in edit mode');
});

test('#toggleMarkup adds markup by tag name', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(({post, markupSection, marker}) => {
    return post([
      markupSection('p', [marker('abc'), marker('def')])
    ]);
  });
  editor = new Editor({mobiledoc});
  editor.render(editorElement);

  //precond
  assert.hasNoElement('#editor strong');

  Helpers.dom.selectText(editor ,'bc', editorElement, 'd', editorElement);
  editor.run(postEditor => postEditor.toggleMarkup('strong'));
  assert.hasElement('#editor strong:contains(bcd)');
});

test('#toggleMarkup removes markup by tag name', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(({post, markupSection, marker, markup}) => {
    const strong = markup('strong');
    return post([
      markupSection('p', [marker('a'), marker('bcde', [strong]), marker('f')])
    ]);
  });
  editor = new Editor({mobiledoc});
  editor.render(editorElement);

  //precond
  assert.hasElement('#editor strong:contains(bcde)');

  Helpers.dom.selectText(editor ,'bc', editorElement, 'd', editorElement);
  editor.run(postEditor => postEditor.toggleMarkup('strong'));
  assert.hasNoElement('#editor strong:contains(bcd)', 'markup removed from selection');
  assert.hasElement('#editor strong:contains(e)', 'unselected text still bold');
});

test('#toggleMarkup does nothing with an empty selection', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(({post, markupSection, marker}) => {
    return post([
      markupSection('p', [marker('a')])
    ]);
  });
  editor = new Editor({mobiledoc});
  editor.render(editorElement);

  editor.run(postEditor => postEditor.toggleMarkup('strong'));

  assert.hasNoElement('#editor strong', 'strong not added, nothing selected');
});

test('postEditor reads editor range, sets it with #setRange', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abc')])]);
  });
  editor = new Editor({mobiledoc});
  editor.render(editorElement);

  let { post } = editor;

  Helpers.dom.selectText(editor ,'bc', editorElement);
  let range = editor.range;
  let expectedRange = Range.create(post.sections.head, 'a'.length,
                                   post.sections.head, 'abc'.length);
  assert.ok(range.isEqual(expectedRange), 'precond - editor.range is correct');

  let newRange;
  editor.run(postEditor => {
    newRange = Range.create(post.sections.head, 0, post.sections.head, 1);
    postEditor.setRange(newRange);
  });

  assert.ok(editor.range.isEqual(newRange), 'newRange is rendered after run');
});

test('markup sections may contain attributes', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(({post, markupSection, marker}) => {
    return post([
      markupSection('p', [marker('123')], false, {'data-md-text-align': 'center'})
    ]);
  });

  editor = new Editor({mobiledoc});
  editor.render(editorElement);

  assert.hasElement('#editor p[data-md-text-align="center"]');
});
