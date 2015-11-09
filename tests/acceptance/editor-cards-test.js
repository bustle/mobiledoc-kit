import { Editor } from 'mobiledoc-kit';
import { DIRECTION } from 'mobiledoc-kit/utils/key';
import Position from 'mobiledoc-kit/utils/cursor/position';
import Helpers from '../test-helpers';

const { test, module } = Helpers;

let editor, editorElement;
const cardText = 'card text';

const mobiledoc = Helpers.mobiledoc.build(({post, cardSection}) => {
  return post([cardSection('simple-card')]);
});

const simpleCard = {
  name: 'simple-card',
  display: {
    setup(element, options, env) {
      let button = document.createElement('button');
      button.setAttribute('id', 'display-button');
      element.appendChild(button);
      element.appendChild(document.createTextNode(cardText));
      button.onclick = env.edit;
      return {button};
    },
    teardown({button}) {
      button.parentNode.removeChild(button);
    }
  },
  edit: {
    setup(element, options, env) {
      let button = document.createElement('button');
      button.setAttribute('id', 'edit-button');
      button.onclick = env.save;
      element.appendChild(button);
      return {button};
    },
    teardown({button}) {
      button.parentNode.removeChild(button);
    }
  }
};

module('Acceptance: editor: cards', {
  beforeEach() {
    editorElement = $('#editor')[0];
  },
  afterEach() {
    if (editor) { editor.destroy(); }
  }
});

test('changing to display state triggers update on editor', (assert) => {
  const cards = [simpleCard];
  editor = new Editor({mobiledoc, cards});
  editor.render(editorElement);

  let updateCount = 0,
      triggeredUpdate = () => updateCount++;
  editor.on('update', triggeredUpdate);

  let displayButton = document.getElementById('display-button');
  assert.ok(!!displayButton, 'precond - display button is there');

  Helpers.dom.triggerEvent(displayButton, 'click');

  let editButton = document.getElementById('edit-button');
  assert.ok(!!editButton, 'precond - edit button is there after clicking the display button');

  let currentUpdateCount = updateCount;

  Helpers.dom.triggerEvent(editButton, 'click');

  assert.equal(updateCount, currentUpdateCount+1,
               'update is triggered after switching to display mode');
});

test('editor listeners are quieted for card actions', (assert) => {
  const done = assert.async();

  const cards = [simpleCard];
  editor = new Editor({mobiledoc, cards});
  editor.render(editorElement);

  Helpers.dom.selectText(cardText, editorElement);
  Helpers.dom.triggerEvent(document, 'mouseup');

  setTimeout(() => {
    // FIXME should have a better assertion here
    assert.ok(true, 'made it here with no javascript errors');
    done();
  });
});

test('removing last card from mobiledoc allows additional editing', (assert) => {
  const done = assert.async();
  let button;
  const cards = [{
    name: 'simple-card',
    display: {
      setup(element, options, env) {
        button = $('<button>Click me</button>');
        button.on('click', env.remove);
        $(element).append(button);
      }
    }
  }];
  editor = new Editor({mobiledoc, cards});
  editor.render(editorElement);

  assert.hasElement('#editor button:contains(Click me)', 'precond - button');

  button.click();

  setTimeout(() => {
    assert.hasNoElement('#editor button:contains(Click me)', 'button is removed');
    assert.hasNoElement('#editor p');
    Helpers.dom.moveCursorTo($('#editor')[0]);
    Helpers.dom.insertText(editor, 'X');
    assert.hasElement('#editor p:contains(X)');

    done();
  });
});

test('delete when cursor is positioned at end of a card deletes card, replace with empty markup section', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(({post, cardSection}) => {
    return post([cardSection('simple-card')]);
  });
  const cards = [{
    name: 'simple-card',
    display: {
      setup(element) {
        element.id = 'my-simple-card';
      }
    }
  }];

  editor = new Editor({mobiledoc, cards});
  editor.render(editorElement);

  assert.hasElement('#my-simple-card', 'precond - renders card');
  assert.hasNoElement('#editor p', 'precond - has no markup section');

  editor.cursor.moveToPosition(new Position(editor.post.sections.head, 1));
  Helpers.dom.triggerDelete(editor);

  assert.hasNoElement('#my-simple-card', 'removes card after delete');
  assert.hasElement('#editor p', 'has markup section after delete');
});

test('delete when cursor is at start of a card and prev section is blank deletes prev section', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(({post, cardSection, markupSection}) => {
    return post([
      markupSection('p'),
      cardSection('simple-card')
    ]);
  });
  const cards = [{
    name: 'simple-card',
    display: {
      setup(element) {
        element.id = 'my-simple-card';
      }
    }
  }];

  editor = new Editor({mobiledoc, cards});
  editor.render(editorElement);

  assert.hasElement('#my-simple-card', 'precond - renders card');
  assert.hasElement('#editor p', 'precond - has blank markup section');

  editor.cursor.moveToPosition(new Position(editor.post.sections.tail, 0));
  Helpers.dom.triggerDelete(editor);

  assert.hasElement('#my-simple-card', 'card still exists after delete');
  assert.hasNoElement('#editor p', 'blank markup section deleted');
});

test('forward-delete when cursor is positioned at start of a card deletes card, replace with empty markup section', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(({post, cardSection}) => {
    return post([cardSection('simple-card')]);
  });
  const cards = [{
    name: 'simple-card',
    display: {
      setup(element) {
        element.id = 'my-simple-card';
      }
    }
  }];

  editor = new Editor({mobiledoc, cards});
  editor.render(editorElement);

  assert.hasElement('#my-simple-card', 'precond - renders card');
  assert.hasNoElement('#editor p', 'precond - has no markup section');

  editor.cursor.moveToPosition(new Position(editor.post.sections.head, 0));
  Helpers.dom.triggerDelete(editor, DIRECTION.FORWARD);

  assert.hasNoElement('#my-simple-card', 'removes card after delete');
  assert.hasElement('#editor p', 'has markup section after delete');
});

test('forward-delete when cursor is positioned at end of a card and next section is blank deletes next section', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(({post, cardSection, markupSection}) => {
    return post([
      cardSection('simple-card'),
      markupSection()
    ]);
  });
  const cards = [{
    name: 'simple-card',
    display: {
      setup(element) {
        element.id = 'my-simple-card';
      }
    }
  }];

  editor = new Editor({mobiledoc, cards});
  editor.render(editorElement);

  assert.hasElement('#my-simple-card', 'precond - renders card');
  assert.hasElement('#editor p', 'precond - has blank markup section');

  editor.cursor.moveToPosition(new Position(editor.post.sections.head, 1));
  Helpers.dom.triggerDelete(editor, DIRECTION.FORWARD);

  assert.hasElement('#my-simple-card', 'still has card after delete');
  assert.hasNoElement('#editor p', 'deletes blank markup section');
});

test('selecting a card and deleting deletes the card', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(({post, cardSection}) => {
    return post([
      cardSection('simple-card')
    ]);
  });

  const cards = [{
    name: 'simple-card',
    display: {
      setup(element) {
        element.id = 'my-simple-card';
      }
    }
  }];

  editor = new Editor({mobiledoc, cards});
  editor.render(editorElement);

  assert.hasElement('#my-simple-card', 'precond - renders card');
  assert.hasNoElement('#editor p', 'precond - has no markup section');

  editor.selectSections([editor.post.sections.head]);
  Helpers.dom.triggerDelete(editor);

  assert.hasNoElement('#my-simple-card', 'has no card after delete');
  assert.hasElement('#editor p', 'has blank markup section');
});

test('selecting a card and some text after and deleting deletes card and text', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(({post, cardSection, markupSection, marker}) => {
    return post([
      cardSection('simple-card'),
      markupSection('p', [marker('abc')])
    ]);
  });

  const cards = [{
    name: 'simple-card',
    display: {
      setup(element) {
        element.id = 'my-simple-card';
      }
    }
  }];

  editor = new Editor({mobiledoc, cards});
  editor.render(editorElement);

  assert.hasElement('#my-simple-card', 'precond - renders card');
  assert.hasElement('#editor p:contains(abc)', 'precond - has markup section');

  Helpers.dom.moveCursorTo(editorElement.firstChild.firstChild, 0,
                           editorElement.lastChild.firstChild, 1);
  Helpers.dom.triggerDelete(editor);

  assert.hasNoElement('#my-simple-card', 'has no card after delete');
  let p = $('#editor p');
  assert.equal(p.length, 1, 'only 1 paragraph');
  assert.equal(p.text(), 'bc', '"a" is deleted from markup section');
});

test('deleting at start of empty markup section with prev card deletes the markup section', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(({post, cardSection, markupSection}) => {
    return post([
      cardSection('simple-card'),
      markupSection('p')
    ]);
  });

  const cards = [{
    name: 'simple-card',
    display: {
      setup(element) {
        element.id = 'my-simple-card';
      }
    }
  }];

  editor = new Editor({mobiledoc, cards});
  editor.render(editorElement);

  assert.hasElement('#my-simple-card', 'precond - renders card');
  assert.hasElement('#editor p', 'precond - has blank markup section');

  editor.cursor.moveToPosition(new Position(editor.post.sections.tail, 0));
  Helpers.dom.triggerDelete(editor);

  assert.hasElement('#my-simple-card', 'has card after delete');
  assert.hasNoElement('#editor p', 'paragraph is gone');

  let { offsets } = editor.cursor;
  assert.ok(offsets.head.section === editor.post.sections.head,
            'correct cursor position');
  assert.equal(offsets.head.offset, 1,
            'correct cursor offset');
});

test('press enter at end of card inserts section after card', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(({post, cardSection}) => {
    return post([
      cardSection('simple-card')
    ]);
  });

  const cards = [{
    name: 'simple-card',
    display: {
      setup(element) {
        element.id = 'my-simple-card';
      }
    }
  }];

  editor = new Editor({mobiledoc, cards});
  editor.render(editorElement);

  assert.hasElement('#my-simple-card', 'precond - renders card');
  assert.hasNoElement('#editor p', 'precond - has no markup section');

  editor.cursor.moveToPosition(new Position(editor.post.sections.tail, 1));
  Helpers.dom.triggerEnter(editor);

  assert.hasElement('#my-simple-card', 'has card after enter');
  assert.hasElement('#editor p', 'markup section is added');

  let { offsets } = editor.cursor;
  assert.ok(!editor.post.sections.tail.isCardSection,
            'markup section (not card secton) is at end of post abstract');
  assert.ok(offsets.head.section === editor.post.sections.tail,
            'correct cursor position');
  assert.equal(offsets.head.offset, 0,
            'correct cursor offset');
});

test('press enter at start of card inserts section before card', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(({post, cardSection}) => {
    return post([
      cardSection('simple-card')
    ]);
  });

  const cards = [{
    name: 'simple-card',
    display: {
      setup(element) {
        element.id = 'my-simple-card';
      }
    }
  }];

  editor = new Editor({mobiledoc, cards});
  editor.render(editorElement);

  assert.hasElement('#my-simple-card', 'precond - renders card');
  assert.hasNoElement('#editor p', 'precond - has no markup section');

  editor.cursor.moveToPosition(new Position(editor.post.sections.tail, 0));
  Helpers.dom.triggerEnter(editor);

  assert.hasElement('#my-simple-card', 'has card after enter');
  assert.hasElement('#editor p', 'markup section is added');

  let { offsets } = editor.cursor;
  assert.ok(editor.post.sections.head.isMarkerable,
            'markup section at head of post');
  assert.ok(editor.post.sections.tail.isCardSection,
            'card section at end of post');
  assert.ok(offsets.head.section === editor.post.sections.tail,
            'correct cursor position');
  assert.equal(offsets.head.offset, 0,
            'correct cursor offset');
});

test('editor ignores events when focus is inside a card', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(({post, markupSection, cardSection}) => {
    return post([
      markupSection(),
      cardSection('simple-card')
    ]);
  });

  const cards = [{
    name: 'simple-card',
    display: {
      setup(element) {
        $(element).append('<input id="simple-card-input">');
      }
    }
  }];

  editor = new Editor({mobiledoc, cards});
  editor.render(editorElement);

  assert.hasElement('#simple-card-input', 'precond - renders card');

  let inputEvents = 0;
  editor.handleInput = () => inputEvents++;

  let input = $('#simple-card-input')[0];
  Helpers.dom.triggerEvent(input, 'input');

  assert.equal(inputEvents, 0, 'editor does not handle input event when in card');

  let p = $('#editor p')[0];
  Helpers.dom.triggerEvent(p, 'input');

  assert.equal(inputEvents, 1, 'editor handles input event outside of card');
});
