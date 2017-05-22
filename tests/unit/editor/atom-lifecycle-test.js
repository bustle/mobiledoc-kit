import Helpers from '../../test-helpers';
import { Editor } from 'mobiledoc-kit';
let editorElement, editor;

import { MOBILEDOC_VERSION as MOBILEDOC_VERSION_0_3_1 } from 'mobiledoc-kit/renderers/mobiledoc/0-3-1';

const { module, test } = Helpers;
const { postAbstract: { DEFAULT_ATOM_NAME } } = Helpers;

module('Unit: Editor: Atom Lifecycle', {
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

function makeEl(id, text='@atom') {
  let el = document.createElement('span');
  el.id = id;
  text = document.createTextNode(text);
  el.appendChild(text);
  return el;
}

// Default version is 0.2 for the moment
function build(fn) {
  return Helpers.mobiledoc.build(fn, MOBILEDOC_VERSION_0_3_1);
}

function assertRenderArguments(assert, args, expected) {
  let {env, options, payload} = args;

  assert.deepEqual(payload, expected.payload, 'correct payload');
  assert.deepEqual(options, expected.options, 'correct options');

  // basic env
  let {name, onTeardown} = env;
  assert.equal(name, expected.name, 'correct name');
  assert.ok(!!onTeardown, 'has onTeardown');
}

test('rendering a mobiledoc with atom calls atom#render', (assert) => {
  const atomPayload = { foo: 'bar' };
  const atomValue = "@bob";
  const cardOptions = { boo: 'baz' };
  const atomName = 'test-atom';

  let renderArg;

  const atom = {
    name: atomName,
    type: 'dom',
    render(_renderArg) {
      renderArg = _renderArg;
    }
  };

  const mobiledoc = build(({markupSection, post, atom}) =>
    post([markupSection('p', [atom(atomName, atomValue, atomPayload)])])
  );

  editor = new Editor({mobiledoc, atoms: [atom], cardOptions});
  editor.render(editorElement);

  let expected = {
    name: atomName,
    payload: atomPayload,
    options: cardOptions
  };
  assertRenderArguments(assert, renderArg, expected);
});

test('rendering a mobiledoc with atom appends result of atom#render', (assert) => {
  const atomName = 'test-atom';

  const atom = {
    name: atomName,
    type: 'dom',
    render() {
      return makeEl('the-atom');
    }
  };

  const mobiledoc = build(({markupSection, post, atom}) =>
    post([markupSection('p', [atom(atomName, '@bob', {})])])
  );
  editor = new Editor({mobiledoc, atoms: [atom]});
  assert.hasNoElement('#editor #the-atom', 'precond - atom not rendered');
  editor.render(editorElement);
  assert.hasElement('#editor #the-atom');
});

test('returning wrong type from render throws', (assert) => {
  const atomName = 'test-atom';

  const atom = {
    name: atomName,
    type: 'dom',
    render() {
      return 'string';
    }
  };

  const mobiledoc = build(({markupSection, post, atom}) =>
    post([markupSection('p', [atom(atomName, '@bob', {})])])
  );
  editor = new Editor({mobiledoc, atoms: [atom]});

  assert.throws(() => {
    editor.render(editorElement);
  }, new RegExp(`Atom "${atomName}" must return a DOM node`));
});

test('returning undefined from render is ok', (assert) => {
  const atomName = 'test-atom';

  const atom = {
    name: atomName,
    type: 'dom',
    render() {}
  };

  const mobiledoc = build(({markupSection, post, atom}) =>
    post([markupSection('p', [atom(atomName, '@bob', {})])])
  );
  editor = new Editor({mobiledoc, atoms: [atom]});
  editor.render(editorElement);
  assert.ok(true, 'no errors are thrown');
});

test('rendering atom with wrong type throws', (assert) => {
  const atomName = 'test-atom';
  const atom = {
    name: atomName,
    type: 'other',
    render() {}
  };
  const mobiledoc = build(({markupSection, post, atom}) =>
    post([markupSection('p', [atom(atomName, '@bob', {})])])
  );

  assert.throws(() => {
    editor = new Editor({mobiledoc, atoms: [atom]});
    editor.render(editorElement);
  }, new RegExp(`Atom "${atomName}.* must define type`));
});

test('rendering atom without render method throws', (assert) => {
  const atomName = 'test-atom';
  const atom = {
    name: atomName,
    type: 'dom'
  };
  const mobiledoc = build(({markupSection, post, atom}) =>
    post([markupSection('p', [atom(atomName, '@bob', {})])])
  );

  assert.throws(() => {
    editor = new Editor({mobiledoc, atoms: [atom]});
    editor.render(editorElement);
  }, new RegExp(`Atom "${atomName}.* must define.*render`));
});

test('rendering unknown atom calls #unknownAtomHandler', (assert) => {
  const payload = { foo: 'bar' };
  const cardOptions = { boo: 'baz' };
  const atomName = 'test-atom';
  const atomValue = '@bob';

  let unknownArg;
  const unknownAtomHandler = (_unknownArg) => {
    unknownArg = _unknownArg;
  };

  const mobiledoc = build(({markupSection, post, atom}) =>
    post([markupSection('p', [atom(atomName, atomValue, payload)])])
  );

  editor = new Editor({mobiledoc, unknownAtomHandler, cardOptions});
  editor.render(editorElement);

  let expected = {
    name: atomName,
    value: atomValue,
    options: cardOptions,
    payload
  };
  assertRenderArguments(assert, unknownArg, expected);
});

test('rendering unknown atom without unknownAtomHandler throws', (assert) => {
  const atomName = 'test-atom';

  const mobiledoc = build(({markupSection, post, atom}) =>
    post([markupSection('p', [atom(atomName, '@bob', {})])])
  );

  editor = new Editor({mobiledoc, unknownAtomHandler: undefined});

  assert.throws(() => {
    editor.render(editorElement);
  }, new RegExp(`Unknown atom "${atomName}".*no unknownAtomHandler`));
});

test('onTeardown hook is called when editor is destroyed', (assert) => {
  const atomName = 'test-atom';

  let teardown;

  const atom = {
    name: atomName,
    type: 'dom',
    render({env}) {
      env.onTeardown(() => teardown = true);
    }
  };

  const mobiledoc = build(({markupSection, post, atom}) =>
    post([markupSection('p', [atom(atomName, '@bob', {})])])
  );
  editor = new Editor({mobiledoc, atoms: [atom]});
  editor.render(editorElement);

  assert.ok(!teardown, 'nothing torn down yet');

  editor.destroy();

  assert.ok(teardown, 'onTeardown hook called');
});

test('onTeardown hook is called when atom is destroyed', (assert) => {
  let teardown;

  let atom = {
    name: DEFAULT_ATOM_NAME,
    type: 'dom',
    render({env}) {
      env.onTeardown(() => teardown = true);
      return makeEl('atom-id','atom-text');
    }
  };
  editor = Helpers.editor.buildFromText('abc@d|ef', {autofocus: true, atoms:[atom], element: editorElement});
  assert.hasElement('#editor #atom-id:contains(atom-text)', 'precond - shows atom');
  assert.ok(!teardown, 'precond - no teardown yet');
  Helpers.dom.triggerDelete(editor);

  assert.hasElement('#editor #atom-id:contains(atom-text)', 'precond - still shows atom');
  assert.ok(!teardown, 'precond - no teardown yet');
  Helpers.dom.triggerDelete(editor);

  assert.hasNoElement('*:contains(atom-text)', 'atom destroyed');
  assert.ok(teardown, 'calls teardown');
});

// See https://github.com/bustle/mobiledoc-kit/issues/421
test('render is not called again when modifying other parts of the section', (assert) => {
  let renderCount = 0;
  let atom = {
    name: DEFAULT_ATOM_NAME,
    type: 'dom',
    render() {
      renderCount++;
      return makeEl('the-atom');
    }
  };
  editor = Helpers.editor.buildFromText('abc|@def', {autofocus: true, atoms:[atom], element: editorElement});
  assert.equal(renderCount, 1, 'renders the atom initially');
  editor.insertText('123');
  assert.hasElement('#editor *:contains(abc123)', 'precond - inserts text');
  assert.equal(renderCount, 1, 'does not rerender the atom');
});

test('mutating the content of an atom does not trigger an update', (assert) => {
  assert.expect(5);
  const done = assert.async();

  const atomName = 'test-atom';

  let renderCount = 0;
  let teardown;

  const atom = {
    name: atomName,
    type: 'dom',
    render({env}) {
      renderCount++;
      env.onTeardown(() => teardown = true);
      return makeEl('the-atom');
    }
  };

  const mobiledoc = build(({markupSection, post, atom}) =>
    post([markupSection('p', [atom(atomName, '@bob', {})])])
  );
  editor = new Editor({mobiledoc, atoms: [atom]});

  let updateTriggered = false;
  editor.postDidChange(() => updateTriggered = true);

  assert.hasNoElement('#editor #the-atom', 'precond - atom not rendered');
  editor.render(editorElement);
  assert.equal(renderCount, 1, 'renders atom');

  $("#the-atom").html("updated");

  // ensure the mutations have had time to trigger
  Helpers.wait(function(){
    assert.ok(!updateTriggered);
    assert.equal(renderCount, 1, 'does not rerender atom');
    assert.ok(!teardown, 'does not teardown atom');
    done();
  });
});

test('atom env has "save" method, rerenders atom', (assert) => {
  let atomArgs = {};
  let render = 0;
  let teardown = 0;
  let postDidChange = 0;
  let save;

  const atom = {
    name: DEFAULT_ATOM_NAME,
    type: 'dom',
    render({env, value, payload}) {
      render++;
      atomArgs.value = value;
      atomArgs.payload = payload;
      save = env.save;

      env.onTeardown(() => teardown++);

      return makeEl('the-atom', value);
    }
  };

  editor = Helpers.editor.buildFromText('abc|@("value": "initial-value", "payload": {"foo": "bar"})def', {autofocus: true, atoms:[atom], element: editorElement});
  editor.postDidChange(() => postDidChange++);

  assert.equal(render, 1, 'precond - renders atom');
  assert.equal(teardown, 0, 'precond - did not teardown');
  assert.ok(!!save, 'precond - save hook');
  assert.deepEqual(atomArgs, {value:'initial-value', payload:{foo: "bar"}}, 'args initially empty');
  assert.hasElement(`#the-atom`, 'precond - displays atom');

  let value = 'new-value';
  let payload = {foo: 'baz'};
  postDidChange = 0;

  save(value, payload);

  assert.equal(render, 2, 'rerenders atom');
  assert.equal(teardown, 1, 'tears down atom');
  assert.deepEqual(atomArgs, {value, payload}, 'updates atom values');
  assert.ok(postDidChange, 'post changed when saving atom');
  assert.hasElement(`#the-atom:contains(${value})`);
});
