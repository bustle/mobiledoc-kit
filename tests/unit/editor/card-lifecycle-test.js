import Helpers from '../../test-helpers';
import { Editor } from 'content-kit-editor';
import { containsNode } from 'content-kit-editor/utils/dom-utils';
let editorElement, editor;

const { module, test } = Helpers;

module('Unit: Editor: Card Lifecycle', {
  beforeEach() {
    editorElement = document.createElement('div');
    editorElement.setAttribute('id', 'editor');
    $('#qunit-fixture').append(editorElement);
  },
  afterEach() {
    if (editor) {
      editor.destroy();
      editor = null;
    }
  }
});

test('rendering a mobiledoc for editing calls card#setup', (assert) => {
  assert.expect(4);

  const payload = { foo: 'bar' };
  const cardOptions = { boo: 'baz' };

  const card = {
    name: 'test-card',
    display: {
      setup(element, options, env, setupPayload) {
        assert.ok(containsNode(editorElement, element),
                  'card element is part of the editor element');
        assert.deepEqual(setupPayload, payload,
                         'the payload is passed to the card');
        assert.equal(env.name, 'test-card',
                     'env.name is correct');
        assert.deepEqual(options, cardOptions, 'correct cardOptions');
      },
      teardown() {}
    }
  };

  const mobiledoc = Helpers.mobiledoc.build(({post, cardSection}) =>
    post([cardSection('test-card', payload)])
  );
  editor = new Editor({mobiledoc, cards: [card], cardOptions});
  editor.render(editorElement);
});

test('rendering a mobiledoc for editing calls #unknownCardHandler when it encounters an unknown card', (assert) => {
  assert.expect(1);

  const cardName = 'my-card';

  const unknownCardHandler = (element, options, env /*,setupPayload*/) => {
    assert.equal(env.name, cardName, 'includes card name in env');
  };

  const mobiledoc = Helpers.mobiledoc.build(({post, cardSection}) =>
    post([cardSection(cardName)])
  );

  editor = new Editor({mobiledoc, unknownCardHandler});
  editor.render(editorElement);
});

test('rendered card can fire edit hook to enter editing mode', (assert) => {
  assert.expect(7);

  const payload = { foo: 'bar' };
  const cardOptions = { boo: 'baz' };

  let returnedSetupValue = {some: 'object'};
  let span;
  const card = {
    name: 'test-card',
    display: {
      setup(element, options, env/*, setupPayload*/) {
        span = document.createElement('span');
        span.onclick = function() {
          assert.ok(true, 'precond - click occurred');
          env.edit();
        };
        element.appendChild(span);
        return returnedSetupValue;
      },
      teardown(passedValue) {
        assert.ok(true, 'teardown called');
        assert.equal(passedValue, returnedSetupValue,
                     'teardown called with return value of setup');
      }
    },
    edit: {
      setup(element, options, env, setupPayload) {
        assert.ok(containsNode(editorElement, element),
                  'card element is part of the editor element');
        assert.deepEqual(payload, setupPayload,
                         'the payload is passed to the card');
        assert.equal(env.name, 'test-card',
                     'env.name is correct');
        assert.deepEqual(options, cardOptions, 'correct cardOptions');
      }
    }
  };

  const mobiledoc = Helpers.mobiledoc.build(({post, cardSection}) =>
    post([cardSection('test-card', payload)])
  );

  editor = new Editor({ mobiledoc, cards: [card], cardOptions });
  editor.render(editorElement);

  Helpers.dom.triggerEvent(span, 'click');
});

test('rendered card can fire edit hook to enter editing mode, then save', (assert) => {
  const setupPayloads = [];
  const payload = { foo: 'bar' };
  const newPayload = {some: 'new values'};
  let cardEnv;

  const card = {
    name: 'test-card',
    display: {
      setup(element, options, env, setupPayload) {
        cardEnv = env;
        setupPayloads.push(setupPayload);
      }
    },
    edit: {
      setup() {}
    }
  };

  const mobiledoc = Helpers.mobiledoc.build(({post, cardSection}) =>
    post([cardSection('test-card', payload)])
  );
  editor = new Editor({ mobiledoc, cards: [card] });
  editor.render(editorElement);

  assert.ok(cardEnv.edit, 'precond - card env has edit hook');
  assert.ok(cardEnv.save, 'precond - card env has save hook');

  cardEnv.edit();
  cardEnv.save(newPayload);

  const [firstPayload, secondPayload] = setupPayloads;
  assert.equal(firstPayload, payload, 'first display with mobiledoc payload');
  assert.equal(secondPayload, newPayload, 'second display with new payload');
});

test('rendered card can fire edit hook to enter editing mode, then cancel', (assert) => {
  const setupPayloads = [];
  let cardEnv;

  const card = {
    name: 'test-card',
    display: {
      setup(element, options, env, setupPayload) {
        setupPayloads.push(setupPayload);
        cardEnv = env;
      }
    },
    edit: {
      setup() {}
    }
  };

  const payload = { foo: 'bar' };
  const mobiledoc = Helpers.mobiledoc.build(({post, cardSection}) =>
    post([cardSection('test-card',payload)])
  );
  editor = new Editor({ mobiledoc, cards: [card] });
  editor.render(editorElement);

  assert.ok(cardEnv.edit, 'precond - env has #edit');
  assert.ok(cardEnv.cancel, 'precond - env has #cancel');

  cardEnv.edit();
  cardEnv.cancel();

  let [firstPayload, secondPayload] = setupPayloads;
  assert.equal(firstPayload, payload, 'first display with mobiledoc payload');
  assert.equal(secondPayload, payload, 'second display with mobiledoc payload');
});

test('#remove hook destroys card, removes it from DOM and AT', (assert) => {
  let callbacks = [];
  const cardEl = document.createElement('div');
  cardEl.setAttribute('id', 'the-card-el');
  let cardEnv;

  const card = {
    name: 'removable-card',
    display: {
      setup(element, options, env) {
        cardEnv = env;
        callbacks.push('setup');
        element.appendChild(cardEl);
      },
      teardown() {
        callbacks.push('teardown');
      }
    }
  };

  const mobiledoc = Helpers.mobiledoc.build(
    ({post, markupSection, cardSection}) =>
      post([markupSection(), cardSection('removable-card')]) 
  );

  editor = new Editor({mobiledoc, cards:[card]});
  editor.render(editorElement);

  assert.deepEqual(callbacks, ['setup'], 'setup callback called');
  assert.hasElement('#editor #the-card-el', 'renders card');
  assert.ok(cardEnv.remove, 'card env has #remove hook');

  const post = editor.post;
  assert.equal(post.sections.length, 2, 'precond - post has 2 sections');

  cardEnv.remove();

  assert.deepEqual(callbacks, ['setup', 'teardown'],
                   'teardown called when removing');
  assert.hasNoElement('#editor #the-card-el', 'removes card element');
  assert.equal(post.sections.length, 1,
               'removes the card section from the post');
});
