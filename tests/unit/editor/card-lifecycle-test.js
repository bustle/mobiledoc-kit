const { module, test } = QUnit;

import Helpers from '../../test-helpers';
import { Editor } from 'content-kit-editor';
import { containsNode } from 'content-kit-editor/utils/dom-utils';
import { MOBILEDOC_VERSION } from 'content-kit-editor/renderers/mobiledoc';
let editorElement, editor;

module('Unit: Editor: Card Lifecycle', {
  beforeEach() {
    editorElement = document.createElement('div');
  },
  afterEach() {
    if (editor) {
      editor.destroy();
    }
    editor = null;
  }
});

test('rendering a mobiledoc for editing calls card#setup', (assert) => {
  assert.expect(4);

  const payload = {
    foo: 'bar'
  };
  const cardOptions = { boo: 'baz' };

  const card = {
    name: 'test-card',
    display: {
      setup(element, options, env, setupPayload) {
        assert.ok(containsNode(editorElement, element),
                  'card element is part of the editor element');
        assert.deepEqual(payload, setupPayload,
                         'the payload is passed to the card');
        assert.equal(env.name, 'test-card',
                     'env.name is correct');
        assert.deepEqual(options, cardOptions, 'correct cardOptions');
      },
      teardown() {
      }
    }
  };

  const mobiledoc = {
    version: MOBILEDOC_VERSION,
    sections: [
      [],
      [
        [10, 'test-card', payload]
      ]
    ]
  };
  editor = new Editor(editorElement, {
    mobiledoc,
    cards: [card],
    cardOptions
  });
});

test('rendering a mobiledoc for editing calls #unknownCardHandler when it encounters an unknown card', (assert) => {
  assert.expect(1);

  const cardName = 'my-card';

  const unknownCardHandler = (element, options, env /*,setupPayload*/) => {
    assert.equal(env.name, cardName, 'includes card name in env');
  };

  const mobiledoc = {
    version: MOBILEDOC_VERSION,
    sections: [
      [],
      [
        [10, cardName, {}]
      ]
    ]
  };

  editor = new Editor(editorElement, {mobiledoc, unknownCardHandler});
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

  const mobiledoc = {
    version: MOBILEDOC_VERSION,
    sections: [
      [],
      [
        [10, 'test-card', payload]
      ]
    ]
  };
  editor = new Editor(editorElement, {
    mobiledoc,
    cards: [card],
    cardOptions
  });

  Helpers.dom.triggerEvent(span, 'click');
});

test('rendered card can fire edit hook to enter editing mode, then save', (assert) => {
  assert.expect(3);

  let setupPayloads = [];
  let newPayload = {some: 'new values'};
  let doEdit, doSave;
  const card = {
    name: 'test-card',
    display: {
      setup(element, options, env, setupPayload) {
        setupPayloads.push(setupPayload);
        doEdit = () => {
          env.edit();
        };
      }
    },
    edit: {
      setup(element, options, env) {
        assert.ok(env.save,
                  'env exposes save hook');
        doSave = () => {
          env.save(newPayload);
        };
      }
    }
  };

  const payload = { foo: 'bar' };
  const mobiledoc = {
    version: MOBILEDOC_VERSION,
    sections: [
      [],
      [
        [10, 'test-card', payload]
      ]
    ]
  };
  editor = new Editor(editorElement, {
    mobiledoc,
    cards: [card]
  });

  doEdit();
  doSave();
  let [firstPayload, secondPayload] = setupPayloads;
  assert.equal(firstPayload, payload, 'first display with mobiledoc payload');
  assert.equal(secondPayload, newPayload, 'second display with new payload');
});

test('rendered card can fire edit hook to enter editing mode, then cancel', (assert) => {
  assert.expect(3);

  let setupPayloads = [];
  let doEdit, doCancel;
  const card = {
    name: 'test-card',
    display: {
      setup(element, options, env, setupPayload) {
        setupPayloads.push(setupPayload);
        doEdit = () => {
          env.edit();
        };
      }
    },
    edit: {
      setup(element, options, env) {
        assert.ok(env.cancel, 'env exposes cancel hook');
        doCancel = () => {
          env.cancel();
        };
      }
    }
  };

  const payload = { foo: 'bar' };
  const mobiledoc = {
    version: MOBILEDOC_VERSION,
    sections: [
      [],
      [
        [10, 'test-card', payload]
      ]
    ]
  };
  editor = new Editor(editorElement, {
    mobiledoc,
    cards: [card]
  });

  doEdit();
  doCancel();
  let [firstPayload, secondPayload] = setupPayloads;
  assert.equal(firstPayload, payload, 'first display with mobiledoc payload');
  assert.equal(secondPayload, payload, 'second display with mobiledoc payload');
});
