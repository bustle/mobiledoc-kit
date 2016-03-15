import Helpers from '../../test-helpers';
import { Editor } from 'mobiledoc-kit';
let editorElement, editor;

import { MOBILEDOC_VERSION as MOBILEDOC_VERSION_0_3 } from 'mobiledoc-kit/renderers/mobiledoc/0-3';

const { module, test } = Helpers;

module('Unit: Editor: Atom Lifecycle', {
  beforeEach() {
    editorElement = $('#editor')[0];
  },
  afterEach() {
    if (editor) {
      try {
        editor.destroy();
      } catch(e) {}
      editor = null;
    }
  }
});


function makeEl(id) {
  let el = document.createElement('span');
  el.id = id;
  return el;
}

// Default version is 0.2 for the moment
function build(fn) {
  return Helpers.mobiledoc.build(fn, MOBILEDOC_VERSION_0_3);
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

test('mutating the content of an atom does not trigger an update', (assert) => {
  const done = assert.async();

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

  let updateTriggered = false;
  editor.on("update", function() {
    updateTriggered = true;
  });

  assert.hasNoElement('#editor #the-atom', 'precond - atom not rendered');
  editor.render(editorElement);

  $("#the-atom").html("updated");

  // ensure the mutations have had time to trigger
  // TODO - nicer way of waiting?
  setTimeout(function(){
    assert.ok(!updateTriggered);
    done();
  }, 100);
});