import Helpers from '../../test-helpers';
import { Editor } from 'mobiledoc-kit';
let editorElement, editor;

const { module, test } = Helpers;

module('Unit: Editor: Card Lifecycle', {
  beforeEach() {
    editorElement = $('#editor')[0];
  },
  afterEach() {
    if (editor && !editor.isDestroyed) {
      editor.destroy();
      editor = null;
    }
  }
});


function makeEl(id) {
  let el = document.createElement('div');
  el.id = id;
  return el;
}

function assertRenderArguments(assert, args, expected) {
  let {env, options, payload} = args;

  assert.deepEqual(payload, expected.payload, 'correct payload');
  assert.deepEqual(options, expected.options, 'correct options');

  // basic env
  let {name, isInEditor, onTeardown, didRender} = env;
  assert.equal(name, expected.name, 'correct name');
  assert.equal(isInEditor, expected.isInEditor, 'correct isInEditor');
  assert.ok(!!onTeardown, 'has onTeardown');
  assert.ok(!!didRender, 'has didRender');

  // editor env hooks
  let {save, cancel, edit, remove} = env;
  assert.ok(!!save && !!cancel && !!edit && !!remove,
            'has save, cancel, edit, remove hooks');

  // postModel
  let {postModel} = env;
  assert.ok(postModel && postModel === expected.postModel,
            'correct postModel');
}

test('rendering a mobiledoc with card calls card#render', (assert) => {
  const payload = { foo: 'bar' };
  const cardOptions = { boo: 'baz' };
  const cardName = 'test-card';

  let renderArg;

  const card = {
    name: cardName,
    type: 'dom',
    render(_renderArg) {
      renderArg = _renderArg;
    }
  };

  const mobiledoc = Helpers.mobiledoc.build(({post, cardSection}) =>
    post([cardSection('test-card', payload)])
  );
  editor = new Editor({mobiledoc, cards: [card], cardOptions});
  editor.render(editorElement);

  let expected = {
    name: cardName,
    payload,
    options: cardOptions,
    isInEditor: true,
    postModel: editor.post.sections.head
  };
  assertRenderArguments(assert, renderArg, expected);
});

test('rendering a mobiledoc with card appends result of card#render', (assert) => {
  const cardName = 'test-card';

  const card = {
    name: cardName,
    type: 'dom',
    render() {
      return makeEl('the-card');
    }
  };

  const mobiledoc = Helpers.mobiledoc.build(({post, cardSection}) =>
    post([cardSection(cardName)])
  );
  editor = new Editor({mobiledoc, cards: [card]});
  assert.hasNoElement('#editor #the-card', 'precond - card not rendered');
  editor.render(editorElement);
  assert.hasElement('#editor #the-card');
});

test('returning wrong type from render throws', (assert) => {
  const cardName = 'test-card';

  const card = {
    name: cardName,
    type: 'dom',
    render() {
      return 'string';
    }
  };

  const mobiledoc = Helpers.mobiledoc.build(({post, cardSection}) =>
    post([cardSection(cardName)])
  );
  editor = new Editor({mobiledoc, cards: [card]});

  assert.throws(() => {
    editor.render(editorElement);
  }, new RegExp(`Card "${cardName}" must render dom`));
});

test('returning undefined from render is ok', (assert) => {
  const cardName = 'test-card';

  const card = {
    name: cardName,
    type: 'dom',
    render() {}
  };

  const mobiledoc = Helpers.mobiledoc.build(({post, cardSection}) =>
    post([cardSection('test-card')])
  );
  editor = new Editor({mobiledoc, cards: [card]});
  editor.render(editorElement);
  assert.ok(true, 'no errors are thrown');
});

test('returning undefined from render is ok', (assert) => {
  const cardName = 'test-card';
  let currentMode;
  let editHook;

  const card = {
    name: cardName,
    type: 'dom',
    render({env}) {
      currentMode = 'display';
      editHook = env.edit;
    },
    edit() {
      currentMode = 'edit';
    }
  };

  const mobiledoc = Helpers.mobiledoc.build(({post, cardSection}) =>
    post([cardSection(cardName)])
  );
  editor = new Editor({mobiledoc, cards: [card]});
  editor.render(editorElement);

  assert.equal(currentMode, 'display', 'precond - display');
  editHook();
  assert.equal(currentMode, 'edit', 'edit mode, no errors when returning undefined');
});

test('rendering card with wrong type throws', (assert) => {
  const cardName = 'test-card';
  const card = {
    name: cardName,
    type: 'other',
    render() {}
  };
  const mobiledoc = Helpers.mobiledoc.build(({post, cardSection}) =>
    post([cardSection(cardName)])
  );

  assert.throws(() => {
    editor = new Editor({mobiledoc, cards: [card]});
    editor.render(editorElement);
  }, new RegExp(`Card "${cardName}.* must define type`));
});

test('rendering card without render method throws', (assert) => {
  const cardName = 'test-card';
  const card = {
    name: cardName,
    type: 'dom'
  };
  const mobiledoc = Helpers.mobiledoc.build(({post, cardSection}) =>
    post([cardSection(cardName)])
  );

  assert.throws(() => {
    editor = new Editor({mobiledoc, cards: [card]});
    editor.render(editorElement);
  }, new RegExp(`Card "${cardName}.* must define.*render`));
});


test('card can call `env.edit` to render in edit mode', (assert) => {
  const payload = { foo: 'bar' };
  const cardOptions = { boo: 'baz' };
  const cardName = 'test-card';

  let editArg;
  let editHook;
  let currentMode;
  let displayId = 'the-display-card';
  let editId = 'the-edit-card';

  const card = {
    name: cardName,
    type: 'dom',
    render(_renderArg) {
      currentMode = 'display';
      editHook = _renderArg.env.edit;
      return makeEl(displayId);
    },
    edit(_editArg) {
      currentMode = 'edit';
      editArg = _editArg;
      return makeEl(editId);
    }
  };

  const mobiledoc = Helpers.mobiledoc.build(({post, cardSection}) =>
    post([cardSection(cardName, payload)])
  );
  editor = new Editor({mobiledoc, cards: [card], cardOptions});
  editor.render(editorElement);

  assert.hasElement(`#editor #${displayId}`, 'precond - display card');
  assert.hasNoElement(`#editor #${editId}`, 'precond - no edit card');
  assert.equal(currentMode, 'display');

  editHook();

  assert.equal(currentMode, 'edit');
  assert.hasNoElement(`#editor #${displayId}`, 'no display card');
  assert.hasElement(`#editor #${editId}`, 'renders edit card');

  let expected = {
    name: cardName,
    payload,
    options: cardOptions,
    isInEditor: true,
    postModel: editor.post.sections.head
  };
  assertRenderArguments(assert, editArg, expected);
});


test('save hook updates payload when in display mode', (assert) => {
  const cardName = 'test-card';
  let saveHook;
  let postModel;

  const card = {
    name: cardName,
    type: 'dom',
    render({env}) {
      saveHook = env.save;
      postModel = env.postModel;
    }
  };

  const mobiledoc = Helpers.mobiledoc.build(({post, cardSection}) =>
    post([cardSection(cardName)])
  );
  editor = new Editor({ mobiledoc, cards: [card] });
  editor.render(editorElement);

  let newPayload = {newPayload: true};
  saveHook(newPayload);
  assert.deepEqual(postModel.payload, newPayload,
                   'save updates payload when called without transition param');

  let otherNewPayload = {otherNewPayload: true};
  saveHook(otherNewPayload, false);
  assert.deepEqual(postModel.payload, otherNewPayload,
                   'save updates payload when called with transition=false');
});


test('save hook updates payload when in edit mode', (assert) => {
  const cardName = 'test-card';
  let saveHook;
  let editHook;
  let postModel;
  let currentMode;

  const card = {
    name: cardName,
    type: 'dom',
    render({env}) {
      currentMode = 'display';
      editHook = env.edit;
      postModel = env.postModel;
    },
    edit({env}) {
      currentMode = 'edit';
      saveHook = env.save;
      postModel = env.postModel;
    }
  };

  const mobiledoc = Helpers.mobiledoc.build(({post, cardSection}) =>
    post([cardSection(cardName)])
  );
  editor = new Editor({ mobiledoc, cards: [card] });
  editor.render(editorElement);

  assert.equal(currentMode, 'display', 'precond - display mode');

  editHook();

  assert.equal(currentMode, 'edit', 'precond - edit mode');
  let newPayload = {newPayload: true};
  saveHook(newPayload, false);

  assert.equal(currentMode, 'edit', 'save with false does not transition');
  assert.deepEqual(postModel.payload, newPayload, 'updates payload');

  let otherNewPayload = {otherNewPayload: true};
  saveHook(otherNewPayload);
  assert.equal(currentMode, 'display', 'save hook transitions');
  assert.deepEqual(postModel.payload, otherNewPayload, 'updates payload');
});


test('#cancel hook changes from edit->display, does not change payload', (assert) => {
  const cardName = 'test-card';
  let cancelHook;
  let editHook;
  let postModel;
  let currentMode;
  let currentPayload;
  let originalPayload = {foo: 'bar'};

  const card = {
    name: cardName,
    type: 'dom',
    render({env, payload}) {
      currentMode = 'display';
      editHook = env.edit;
      postModel = env.postModel;
      currentPayload = payload;
    },
    edit({env}) {
      currentMode = 'edit';
      cancelHook = env.cancel;
      postModel = env.postModel;
    }
  };

  const mobiledoc = Helpers.mobiledoc.build(({post, cardSection}) =>
    post([cardSection(cardName, originalPayload)])
  );
  editor = new Editor({ mobiledoc, cards: [card] });
  editor.render(editorElement);

  assert.equal(currentMode, 'display', 'precond - display mode');

  editHook();

  assert.equal(currentMode, 'edit', 'precond - edit mode');

  cancelHook();

  assert.equal(currentMode, 'display', 'cancel hook transitions');
  assert.deepEqual(currentPayload, originalPayload, 'payload is the same');
});


test('#remove hook destroys card when in display mode, removes it from DOM and AT', (assert) => {
  const cardName = 'test-card';
  let removeHook;
  let elId = 'the-card';

  const card = {
    name: cardName,
    type: 'dom',
    render({env}) {
      removeHook = env.remove;
      return makeEl(elId);
    }
  };

  const mobiledoc = Helpers.mobiledoc.build(({post, cardSection}) =>
    post([cardSection(cardName)])
  );
  editor = new Editor({ mobiledoc, cards: [card] });
  editor.render(editorElement);

  assert.hasElement(`#editor #${elId}`, 'precond - renders card');
  assert.ok(!!editor.post.sections.head, 'post has head section');

  removeHook();

  assert.hasNoElement(`#editor #${elId}`, 'removes rendered card');
  assert.ok(!editor.post.sections.head, 'post has no head section');
});


test('#remove hook destroys card when in edit mode, removes it from DOM and AT', (assert) => {
  const cardName = 'test-card';
  let removeHook;
  let editHook;
  let currentMode;
  let displayId = 'the-display-card';
  let editId = 'the-edit-card';

  const card = {
    name: cardName,
    type: 'dom',
    render({env}) {
      currentMode = 'display';
      editHook = env.edit;
      return makeEl(displayId);
    },
    edit({env}) {
      currentMode = 'edit';
      removeHook = env.remove;
      return makeEl(editId);
    }
  };

  const mobiledoc = Helpers.mobiledoc.build(({post, cardSection}) =>
    post([cardSection(cardName)])
  );
  editor = new Editor({ mobiledoc, cards: [card] });
  editor.render(editorElement);

  assert.equal(currentMode, 'display', 'precond - display mode');
  assert.hasElement(`#editor #${displayId}`, 'precond - renders card in display');

  editHook();

  assert.equal(currentMode, 'edit', 'precond - edit mode');

  assert.hasElement(`#editor #${editId}`, 'precond - renders card in edit');
  assert.hasNoElement(`#editor #${displayId}`, 'display card is removed');
  assert.ok(!!editor.post.sections.head, 'post has head section');

  removeHook();

  assert.hasNoElement(`#editor #${editId}`, 'removes rendered card');
  assert.hasNoElement(`#editor #${displayId}`, 'display card is not present');
  assert.ok(!editor.post.sections.head, 'post has no head section');
});

test('rendering unknown card calls #unknownCardHandler', (assert) => {
  const payload = { foo: 'bar' };
  const cardOptions = { boo: 'baz' };
  const cardName = 'test-card';

  let unknownArg;
  const unknownCardHandler = (_unknownArg) => {
    unknownArg = _unknownArg;
  };

  const mobiledoc = Helpers.mobiledoc.build(({post, cardSection}) =>
    post([cardSection(cardName, payload)])
  );

  editor = new Editor({mobiledoc, unknownCardHandler, cardOptions});
  editor.render(editorElement);

  let expected = {
    name: cardName,
    payload,
    options: cardOptions,
    isInEditor: true,
    postModel: editor.post.sections.head
  };
  assertRenderArguments(assert, unknownArg, expected);
});

test('rendering unknown card without unknownCardHandler throws', (assert) => {
  const cardName = 'test-card';

  const mobiledoc = Helpers.mobiledoc.build(({post, cardSection}) =>
    post([cardSection(cardName)])
  );

  editor = new Editor({mobiledoc, unknownCardHandler: undefined});

  assert.throws(() => {
    editor.render(editorElement);
  }, new RegExp(`Unknown card "${cardName}".*no unknownCardHandler`));
});

test('onTeardown hook is called when moving from display->edit and back', (assert) => {
  const cardName = 'test-card';

  let editHook;
  let saveHook;
  let currentMode;
  let teardown;

  const card = {
    name: cardName,
    type: 'dom',
    render({env}) {
      currentMode = 'display';
      editHook = env.edit;
      env.onTeardown(() => teardown = 'display');
    },
    edit({env}) {
      currentMode = 'edit';
      saveHook = env.save;
      env.onTeardown(() => teardown = 'edit');
    }
  };

  const mobiledoc = Helpers.mobiledoc.build(({post, cardSection}) =>
    post([cardSection(cardName)])
  );
  editor = new Editor({mobiledoc, cards: [card]});
  editor.render(editorElement);

  assert.equal(currentMode, 'display', 'precond - display mode');
  assert.ok(!teardown, 'no teardown called yet');

  editHook();

  assert.equal(currentMode, 'edit', 'edit mode');
  assert.equal(teardown, 'display', 'display onTeardown hook called');

  saveHook();

  assert.equal(currentMode, 'display', 'display mode');
  assert.equal(teardown, 'edit', 'edit onTeardown hook called');
});

test('onTeardown hook is called when card removes itself', (assert) => {
  const cardName = 'test-card';

  let removeHook;
  let teardown;

  const card = {
    name: cardName,
    type: 'dom',
    render({env}) {
      removeHook = env.remove;
      env.onTeardown(() => teardown = true);
    }
  };

  const mobiledoc = Helpers.mobiledoc.build(({post, cardSection}) =>
    post([cardSection(cardName)])
  );
  editor = new Editor({mobiledoc, cards: [card]});
  editor.render(editorElement);

  assert.ok(!teardown, 'nothing torn down yet');

  removeHook();

  assert.ok(teardown, 'onTeardown hook called');
});

test('onTeardown hook is called when editor is destroyed', (assert) => {
  const cardName = 'test-card';

  let teardown;

  const card = {
    name: cardName,
    type: 'dom',
    render({env}) {
      env.onTeardown(() => teardown = true);
    }
  };

  const mobiledoc = Helpers.mobiledoc.build(({post, cardSection}) =>
    post([cardSection(cardName)])
  );
  editor = new Editor({mobiledoc, cards: [card]});
  editor.render(editorElement);

  assert.ok(!teardown, 'nothing torn down yet');

  editor.destroy();

  assert.ok(teardown, 'onTeardown hook called');
});

test('didRender hook is called when moving from display->edit and back', (assert) => {
  const cardName = 'test-card';

  let editHook;
  let saveHook;
  let currentMode;
  let rendered;

  const card = {
    name: cardName,
    type: 'dom',
    render({env}) {
      currentMode = 'display';
      editHook = env.edit;
      env.didRender(() => rendered = 'display');
      return makeEl('display-card');
    },
    edit({env}) {
      currentMode = 'edit';
      saveHook = env.save;
      env.didRender(() => rendered = 'edit');
      return makeEl('edit-card');
    }
  };

  const mobiledoc = Helpers.mobiledoc.build(({post, cardSection}) =>
    post([cardSection(cardName)])
  );
  editor = new Editor({mobiledoc, cards: [card]});
  editor.render(editorElement);

  assert.equal(currentMode, 'display', 'precond - display mode');
  assert.ok(rendered, 'didRender called on instantiation');

  editHook();

  assert.equal(currentMode, 'edit', 'edit mode');
  assert.equal(rendered, 'edit', 'display didRender hook called');

  saveHook();

  assert.equal(currentMode, 'display', 'display mode');
  assert.equal(rendered, 'display', 'edit didRender hook called');
});
